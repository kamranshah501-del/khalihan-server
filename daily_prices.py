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

import json
import os
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone

import requests
import firebase_admin
from firebase_admin import credentials, firestore, messaging

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
PAGE_SIZE = 1000  # smaller pages answer faster
MAX_PAGES = 24
TIMEOUT = 120  # data.gov.in can take a while to answer
ATTEMPTS = 5
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
            wait = min(10 * attempt, 60)
            print(f"    attempt {attempt}/{ATTEMPTS} failed ({error}); waiting {wait}s")
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
    print(f"  {state}: saved {len(payload['c'])} crops")


def notify(state, day):
    """Wake every phone in the state. The phone does the rest."""
    scope = slug(state)
    messaging.send(messaging.Message(
        topic=f"prices_{scope}",
        data={"type": "prices", "state": scope, "date": day},
        android=messaging.AndroidConfig(priority="high"),
    ))
    print(f"  {state}: push sent to prices_{scope}")


def main():
    api_key = os.environ.get("DATA_GOV_IN_API_KEY", "").strip()
    service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "").strip()
    if not api_key or not service_account:
        sys.exit("DATA_GOV_IN_API_KEY and FIREBASE_SERVICE_ACCOUNT must both be set.")

    states = [s.strip() for s in os.environ.get("STATES", "").split(",") if s.strip()]
    if not states:
        states = ALL_STATES

    firebase_admin.initialize_app(credentials.Certificate(json.loads(service_account)))
    db = firestore.client()
    day = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")
    print(f"Khalihan daily job for {day} — {len(states)} states")

    fetch_failures = 0
    push_failures = 0
    for state in states:
        # The government API answers phones happily but often refuses cloud
        # servers with a 502. That must not stop the alerts: the app itself
        # saves each day's prices to Firestore, so the data is already there.
        prices = {}
        try:
            rows = fetch_state(api_key, state)
            prices = summarise(rows)
            print(f"{state}: {len(rows)} rows, {len(prices)} crops")
        except Exception as error:
            fetch_failures += 1
            print(f"{state}: could not read the government API — {error}")
            print(f"  {state}: carrying on with whatever the phones saved")

        if prices:
            try:
                save_prices(db, state, prices, day)
            except Exception as error:
                print(f"  {state}: could not save to Firestore — {error}")

        try:
            notify(state, day)
        except Exception as error:
            push_failures += 1
            print(f"{state}: PUSH FAILED — {error}")

    print(f"Done. {fetch_failures} state(s) without fresh data, "
          f"{push_failures} push failure(s).")
    if push_failures == len(states):
        sys.exit("No push could be sent — check the Firebase service account.")


if __name__ == "__main__":
    main()
