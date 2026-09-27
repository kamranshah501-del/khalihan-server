"""
Khalihan — daily job.

Runs once a day on GitHub Actions and does two things for every state:

  1. Reads the day's mandi prices from the government API (data.gov.in)
     and saves them to Firestore, so every farmer's phone — including a
     brand new install — can show the price history from day one.

  2. Sends one small message to that state's topic. Android delivers it
     even when the app is closed. The phone then compares the prices with
     the targets kept on the phone and shows an alert if needed.

The farmer's targets never reach this server. It only ever shouts to a
whole state: "today's prices are in".
"""

import builtins
import json
import os
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict
from datetime import datetime, timezone

import requests
import firebase_admin

import msamb
from firebase_admin import credentials, firestore, messaging

_print_lock = threading.Lock()


def print(*args, **kwargs):  # five states talk at once: one whole line at a time
    with _print_lock:
        builtins.print(*args, **kwargs, flush=True)


RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
PAGE_SIZE = 1000  # smaller pages answer faster
MAX_PAGES = 24
TIMEOUT = 60  # one slow answer shouldn't hold up the whole run
# Four runs a day: a state missed now comes back in a few hours, so one run
# doesn't need to be endlessly patient.
ATTEMPTS = 3
PARALLEL_STATES = 5  # gentle on the API, five times faster than one by one
# Some government servers refuse plain script traffic but answer a browser.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/json",
}
MIN_PRICE = 20  # under ₹20 a quintal is always a data error

ALL_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "NCT of Delhi", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
]


def slug(text):
    out = []
    for ch in text.strip().lower():
        out.append(ch if ch.isalnum() else "_")
    return "_".join(part for part in "".join(out).split("_") if part)


def get_page(api_key, state, offset):
    """One page, with patience. The government API is often slow, so a
    single timeout must not throw away the whole day."""
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": PAGE_SIZE,
        "offset": offset,
        "filters[state]": state,
    }
    last_error = None
    for attempt in range(1, ATTEMPTS + 1):
        try:
            response = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            return response.json()
        except Exception as error:
            last_error = error
            # 502/503 means the government server is busy, not that we asked
            # wrongly — so wait longer each time instead of giving up.
            if attempt == ATTEMPTS:
                break  # no point waiting after the last try
            wait = 5 * attempt
            print(f"    {state}: attempt {attempt}/{ATTEMPTS} failed ({error}); waiting {wait}s")
            time.sleep(wait)
    raise last_error


def fetch_state(api_key, state):
    """Every price row for one state, across all pages."""
    rows = []
    for page in range(MAX_PAGES):
        data = get_page(api_key, state, page * PAGE_SIZE)
        batch = data.get("records") or []
        rows.extend(batch)
        total = int(data.get("total") or len(rows))
        if len(rows) >= total or not batch:
            break
        time.sleep(1)  # be gentle with the government API
    return rows


LIVE_PART_ROWS = 1500  # keeps each Firestore document well under its 1 MB limit


def iso_date(text):
    """'25/09/2026' -> '2026-09-25' (what the app's cache format expects)."""
    parts = (text or "").strip().split("/")
    if len(parts) != 3:
        return None
    day, month, year = parts
    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"


def compact_rows(rows, state):
    """Government rows in the app's short cache format."""
    out = []
    for row in rows:
        try:
            modal = float(row.get("modal_price") or 0)
            low = float(row.get("min_price") or 0)
            high = float(row.get("max_price") or 0)
        except (TypeError, ValueError):
            continue
        crop = (row.get("commodity") or "").strip()
        if not crop or modal < MIN_PRICE:
            continue
        item = {
            "c": crop,
            "m": (row.get("market") or "").strip(),
            "s": state,
            "d": (row.get("district") or "").strip(),
            "v": (row.get("variety") or "").strip(),
            "mn": low,
            "mx": high,
            "mo": modal,
        }
        date = iso_date(row.get("arrival_date"))
        if date:
            item["dt"] = date
        out.append(item)
    return out


def newest_day(rows):
    """The latest arrival date in the rows. The archive is filed under the
    day the mandis reported, not the day the job ran — a 7 am run carries
    yesterday's prices and must not file them as today's."""
    days = [d for d in (iso_date(r.get("arrival_date")) for r in rows) if d]
    return max(days) if days else None


def save_live(db, state, rows):
    """Today's rows for every phone to read: live/{state} + parts."""
    scope = slug(state)
    compact = compact_rows(rows, state)
    if not compact:
        return
    ref = db.collection("live").document(scope)
    parts = [compact[i:i + LIVE_PART_ROWS] for i in range(0, len(compact), LIVE_PART_ROWS)]
    for index, chunk in enumerate(parts):
        ref.collection("parts").document(str(index)).set({"r": chunk})
    # The meta document goes last: phones never see a half-written day.
    ref.set({"at": firestore.SERVER_TIMESTAMP, "parts": len(parts), "rows": len(compact)})
    print(f"  {state}: live feed updated ({len(compact)} rows, {len(parts)} part(s))")


def summarise(rows):
    """Crop -> (average modal price, number of mandis) on that crop's
    newest reported date. The mandi count lets phones ignore a price that
    stands on a single mandi."""
    by_crop = defaultdict(list)
    for row in rows:
        crop = (row.get("commodity") or "").strip()
        date = (row.get("arrival_date") or "").strip()
        market = (row.get("market") or "").strip()
        try:
            price = float(row.get("modal_price") or 0)
        except (TypeError, ValueError):
            continue
        if not crop or price < MIN_PRICE:
            continue
        by_crop[crop].append((date, price, market))

    def sort_key(date_text):
        # dates arrive as DD/MM/YYYY
        parts = date_text.split("/")
        return (parts[2], parts[1], parts[0]) if len(parts) == 3 else ("", "", "")

    prices = {}
    for crop, entries in by_crop.items():
        newest = max(sort_key(d) for d, _, _ in entries)
        same_day = [(p, m) for d, p, m in entries if sort_key(d) == newest]
        if same_day:
            average = round(sum(p for p, _ in same_day) / len(same_day), 2)
            mandis = len({m for _, m in same_day if m}) or 1
            prices[crop] = (average, mandis)
    return prices


def save_prices(db, state, prices, day):
    """Write the day's prices, keeping whichever copy is richer."""
    scope = slug(state)
    doc = db.collection("prices").document(scope).collection("days").document(day)
    payload = {
        "d": day,
        "at": firestore.SERVER_TIMESTAMP,
        "c": [{"n": name, "p": price, "k": mandis}
              for name, (price, mandis) in sorted(prices.items())],
    }

    existing = doc.get()
    if existing.exists:
        old = existing.to_dict() or {}
        stored = len(old.get("c") or [])
        if stored >= len(payload["c"]):
            print(f"  {state}: phones already saved a fuller copy ({stored} crops)")
            return
    doc.set(payload)
    print(f"  {state}: saved {len(payload['c'])} crops for {day}")


# States with a second, independent source for the days data.gov.in is down.
SECOND_SOURCES = {
    "Maharashtra": msamb.fetch_rows,
}


def backfill(db, state, rows, newest):
    """The second source keeps a few days; file the earlier ones too, so the
    history a phone reads has no hole where the national API was down."""
    by_day = defaultdict(list)
    for row in rows:
        day = iso_date(row.get("arrival_date"))
        if day and day != newest:
            by_day[day].append(row)
    for day, day_rows in sorted(by_day.items()):
        try:
            save_prices(db, state, summarise(day_rows), day)
        except Exception as error:
            print(f"  {state}: could not backfill {day} — {error}")


def notify(state, day, kind):
    """Wake every phone in the state. The phone does the rest.
    kind "brief": the morning summary. kind "prices": evening alerts."""
    scope = slug(state)
    messaging.send(messaging.Message(
        topic=f"prices_{scope}",
        data={"type": kind, "state": scope, "date": day},
        android=messaging.AndroidConfig(priority="high"),
    ))
    print(f"  {state}: {kind} push sent to prices_{scope}")


def main():
    api_key = os.environ.get("DATA_GOV_IN_API_KEY", "").strip()
    service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "").strip()
    if not api_key or not service_account:
        sys.exit("DATA_GOV_IN_API_KEY and FIREBASE_SERVICE_ACCOUNT must both be set.")

    states = [s.strip() for s in os.environ.get("STATES", "").split(",") if s.strip()]
    if not states:
        states = ALL_STATES

    # morning: refresh + the daily brief push
    # evening: refresh + the price-alert push
    # refresh: data only, no push (the midday runs)
    mode = (os.environ.get("MODE") or "evening").strip().lower()
    if mode not in ("morning", "evening", "refresh"):
        mode = "evening"

    firebase_admin.initialize_app(credentials.Certificate(json.loads(service_account)))
    db = firestore.client()
    day = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")
    print(f"Khalihan {mode} job for {day} — {len(states)} states")

    # If the first handful of states all fail, the API is down for this run:
    # stop knocking on a closed door and fall straight back to the archive.
    api = {"ok": 0, "failed": 0, "down": False}
    api_lock = threading.Lock()

    def process(state):
        """One state, start to finish. Runs five at a time."""
        result = {"fetch": 0, "push": 0}

        # The government API sometimes turns away cloud servers. That must
        # not stop the alerts: phones also save each day's prices, so the
        # data is usually there already.
        prices = {}
        state_day = day
        try:
            if api["down"]:
                raise RuntimeError("skipped — the government API is down this run")
            rows = fetch_state(api_key, state)
            with api_lock:
                api["ok"] += 1
            state_day = newest_day(rows) or day
            prices = summarise(rows)
            print(f"{state}: {len(rows)} rows, {len(prices)} crops")
            try:
                save_live(db, state, rows)
            except Exception as error:
                print(f"  {state}: could not save the live feed — {error}")
        except Exception as error:
            rows = []
            with api_lock:
                api["failed"] += 1
                if not api["down"] and api["ok"] == 0 and api["failed"] >= PARALLEL_STATES:
                    api["down"] = True
                    print(f"*** Government API looks down ({api['failed']} states failed, none worked)."
                          " Skipping it for the rest of this run.")
            print(f"{state}: could not read the government API — {error}")
            # A second, independent source where we have one.
            if state in SECOND_SOURCES:
                try:
                    rows = SECOND_SOURCES[state](log=print)
                except Exception as second_error:
                    print(f"  {state}: second source failed too — {second_error}")
            if rows:
                state_day = newest_day(rows) or day
                prices = summarise(rows)
                print(f"  {state}: {len(rows)} rows, {len(prices)} crops from the second source")
                try:
                    save_live(db, state, rows)
                except Exception as live_error:
                    print(f"  {state}: could not save the live feed — {live_error}")
                backfill(db, state, rows, state_day)
            else:
                result["fetch"] = 1
                print(f"  {state}: carrying on with whatever the phones saved")

        if prices:
            try:
                save_prices(db, state, prices, state_day)
            except Exception as error:
                print(f"  {state}: could not save to Firestore — {error}")

        if mode == "refresh":
            return result
        try:
            notify(state, state_day, "brief" if mode == "morning" else "prices")
        except Exception as error:
            result["push"] = 1
            print(f"{state}: PUSH FAILED — {error}")
        return result

    started = time.time()
    with ThreadPoolExecutor(max_workers=PARALLEL_STATES) as pool:
        results = list(pool.map(process, states))
    fetch_failures = sum(r["fetch"] for r in results)
    push_failures = sum(r["push"] for r in results)
    print(f"Took {int(time.time() - started)}s for {len(states)} states.")

    print(f"Done. {fetch_failures} state(s) without fresh data, "
          f"{push_failures} push failure(s).")
    if mode != "refresh" and push_failures == len(states):
        sys.exit("No push could be sent — check the Firebase service account.")


if __name__ == "__main__":
    main()
