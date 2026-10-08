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
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict
from datetime import datetime, timedelta, timezone

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
        arrivals = row.get("arrivals")
        if isinstance(arrivals, (int, float)) and arrivals > 0:
            item["a"] = arrivals
        # The other government source said something quite different for
        # this mandi, crop and day: the app shows both numbers.
        cross = row.get("cross")
        if isinstance(cross, (int, float)) and cross > 0:
            item["x"] = cross
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


MANDI_DAYS_KEEP = 90  # about three months: enough weeks to see each mandi's usual closed day


def save_mandi_days(db, state, rows):
    """Which days each mandi reported, kept for about three months:
    mandi_days/{state} → {"m": [{"n": market, "d": "2026-10-01,2026-10-02,…"}]}.
    Weeks of this show each mandi's usual closed day, so the app can later
    say "आज मंडी बंद है" instead of letting an old price look like today's.
    A list, not a map: mandi names carry dots and brackets."""
    seen = defaultdict(set)
    for row in rows:
        market = (row.get("market") or "").strip()
        day = iso_date(row.get("arrival_date"))
        if market and day:
            seen[market].add(day)
    if not seen:
        return
    ref = db.collection("mandi_days").document(slug(state))
    snap = ref.get()
    old = {}
    if snap.exists:
        for item in (snap.to_dict() or {}).get("m") or []:
            if isinstance(item, dict) and item.get("n"):
                old[item["n"]] = set(filter(None, str(item.get("d") or "").split(",")))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=MANDI_DAYS_KEEP)).strftime("%Y-%m-%d")
    merged = []
    for market in sorted(set(old) | set(seen)):
        days = sorted(d for d in old.get(market, set()) | seen.get(market, set()) if d >= cutoff)
        if days:
            merged.append({"n": market, "d": ",".join(days)})
    ref.set({"m": merged, "at": firestore.SERVER_TIMESTAMP})
    print(f"  {state}: mandi days updated ({len(seen)} mandis in this run, {len(merged)} kept)")


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
        same_day = sane([(p, m) for d, p, m in entries if sort_key(d) == newest])
        if same_day:
            average = round(sum(p for p, _ in same_day) / len(same_day), 2)
            markets = {m for _, m in same_day if m}
            mandis = len(markets) or 1
            districts = sum(1 for m in markets if m.endswith("(district)"))
            prices[crop] = (average, mandis, districts)
    return prices


def sane(pairs):
    """Leave out a price far from every other mandi's that day (under 40% or
    over 250% of the middle one). The app uses the same rule, so the phone
    and the archive agree."""
    if len(pairs) < 3:
        return pairs
    middle = sorted(p for p, _ in pairs)[len(pairs) // 2]
    if middle <= 0:
        return pairs
    kept = [(p, m) for p, m in pairs if middle * 0.4 <= p <= middle * 2.5]
    return kept or pairs


def save_prices(db, state, prices, day):
    """Write the day's prices, keeping whichever copy is richer."""
    scope = slug(state)
    doc = db.collection("prices").document(scope).collection("days").document(day)
    payload = {
        "d": day,
        "at": firestore.SERVER_TIMESTAMP,
        "c": [dict({"n": name, "p": price, "k": mandis}, **({"kd": districts} if districts else {}))
              for name, (price, mandis, districts) in sorted(prices.items())],
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


# An earlier day with fewer crops than this is mostly late reports from a
# few districts; filing it would draw a misleading point in the history.
MIN_BACKFILL_CROPS = 20

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
        prices = summarise(day_rows)
        if len(prices) < MIN_BACKFILL_CROPS:
            print(f"  {state}: skipped {day} — only {len(prices)} crops reported")
            continue
        try:
            save_prices(db, state, prices, day)
        except Exception as error:
            print(f"  {state}: could not backfill {day} — {error}")


# States where a second source can check the national feed, mandi by mandi.
CROSS_CHECKS = {
    "Maharashtra": msamb.fetch_mandi_rows,
}
CROSS_GAP = 0.20  # more than 20% apart on the same mandi, crop and day


def _cross_key(row):
    """(district, market, crop, day) with spacing and brackets ignored:
    "Jalgaon(Masawat)" and "Jalgaon (Masawat)" are the same mandi."""
    def plain(text):
        return re.sub(r"[^a-z0-9]", "", (text or "").lower())
    return (plain(row.get("district")), plain(row.get("market")),
            (row.get("commodity") or "").strip().lower(), iso_date(row.get("arrival_date")))


def _middle(values):
    values = sorted(values)
    return values[len(values) // 2] if values else 0


def cross_check(state, rows, fetch=None, log=print):
    """Marks national-feed rows whose price the state board reports very
    differently (row["cross"] = the board's price). Nothing is changed or
    dropped: a farmer seeing both numbers can ask at the mandi. Returns
    (mandi-crop-days compared, how many differ)."""
    fetch = fetch or CROSS_CHECKS.get(state)
    if fetch is None or not rows:
        return (0, 0)
    try:
        other = fetch(log=log)
    except Exception as error:
        log(f"  {state}: cross-check skipped — {error}")
        return (0, 0)

    def modal(row):
        try:
            return float(row.get("modal_price") or 0)
        except (TypeError, ValueError):
            return 0.0

    theirs = defaultdict(list)
    for row in other:
        key = _cross_key(row)
        if key[3] and modal(row) >= MIN_PRICE:
            theirs[key].append(modal(row))
    ours = defaultdict(list)
    for row in rows:
        key = _cross_key(row)
        if key in theirs and modal(row) >= MIN_PRICE:
            ours[key].append(row)

    differ = 0
    for key, mine in ours.items():
        a = _middle([modal(r) for r in mine])
        b = _middle(theirs[key])
        if a <= 0 or b <= 0:
            continue
        if abs(a - b) / min(a, b) > CROSS_GAP:
            differ += 1
            for row in mine:
                row["cross"] = round(b)
    log(f"  {state}: cross-checked {len(ours)} mandi prices with the state board — {differ} differ by over 20%")
    return (len(ours), differ)


def notify(state, day, kind, hour=None):
    """Wake every phone in the state. The phone does the rest.
    kind "prices": evening alerts, to prices_<state>.
    kind "brief": the morning summary, to brief_<state>_<hour> — each phone
    listens only at the hour its farmer chose."""
    scope = slug(state)
    topic = f"brief_{scope}_{hour}" if kind == "brief" else f"prices_{scope}"
    messaging.send(messaging.Message(
        topic=topic,
        data={"type": kind, "state": scope, "date": day},
        android=messaging.AndroidConfig(priority="high"),
    ))
    print(f"  {state}: {kind} push sent to {topic}")


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
    # brief7 / brief8: no fetching — the 6 am run already filed the data;
    # these only wake the phones whose farmers chose 7 or 8.
    mode = (os.environ.get("MODE") or "evening").strip().lower()
    if mode not in ("morning", "evening", "refresh", "brief7", "brief8"):
        mode = "evening"

    firebase_admin.initialize_app(credentials.Certificate(json.loads(service_account)))
    day = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")

    if mode in ("brief7", "brief8"):
        hour = int(mode[-1])
        failures = 0
        for state in states:
            try:
                notify(state, day, "brief", hour=hour)
            except Exception as error:
                failures += 1
                print(f"{state}: PUSH FAILED — {error}")
        print(f"Done. {hour} am briefs sent, {failures} failure(s).")
        if failures == len(states):
            sys.exit(1)
        return

    db = firestore.client()
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
            cross_check(state, rows, log=print)
            try:
                save_live(db, state, rows)
            except Exception as error:
                print(f"  {state}: could not save the live feed — {error}")
            try:
                save_mandi_days(db, state, rows)
            except Exception as error:
                print(f"  {state}: could not save mandi days — {error}")
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
                try:
                    save_mandi_days(db, state, rows)
                except Exception as days_error:
                    print(f"  {state}: could not save mandi days — {days_error}")
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
            notify(state, state_day, "brief" if mode == "morning" else "prices", hour=6)
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
