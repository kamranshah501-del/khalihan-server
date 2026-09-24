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
    for attempt in range(1, 4):
        try:
            response = requests.get(BASE_URL, params=params, timeout=TIMEOUT)
            response.raise_for_status()
            return response.json()
        except Exception as error:
            last_error = error
            print(f"    attempt {attempt} failed ({error}); retrying")
            time.sleep(5 * attempt)
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
    """Crop -> average modal price on that crop's newest reported date."""
    by_crop = defaultdict(list)
    for row in rows:
        crop = (row.get("commodity") or "").strip()
        date = (row.get("arrival_date") or "").strip()
        try:
            price = float(row.get("modal_price") or 0)
        except (TypeError, ValueError):
            continue
        if not crop or price < MIN_PRICE:
            continue
        by_crop[crop].append((date, price))

    def sort_key(date_text):
        # dates arrive as DD/MM/YYYY
        parts = date_text.split("/")
        return (parts[2], parts[1], parts[0]) if len(parts) == 3 else ("", "", "")

    prices = {}
    for crop, entries in by_crop.items():
        newest = max(sort_key(d) for d, _ in entries)
        same_day = [p for d, p in entries if sort_key(d) == newest]
        if same_day:
            prices[crop] = round(sum(same_day) / len(same_day), 2)
    return prices


def save_and_notify(db, state, prices, day):
    """Write the day's prices, then wake the phones in that state."""
    scope = slug(state)
    doc = db.collection("prices").document(scope).collection("days").document(day)
    payload = {
        "d": day,
        "at": firestore.SERVER_TIMESTAMP,
        "c": [{"n": name, "p": price} for name, price in sorted(prices.items())],
    }

    existing = doc.get()
    if existing.exists:
        # Phones save an early snapshot in the morning; only replace it when
        # the government data has grown richer since.
        old = existing.to_dict() or {}
        if len(old.get("c") or []) >= len(payload["c"]):
            print(f"  {state}: keeping the phone-saved copy ({len(old.get('c') or [])} crops)")
        else:
            doc.set(payload)
            print(f"  {state}: updated to {len(payload['c'])} crops")
    else:
        doc.set(payload)
        print(f"  {state}: saved {len(payload['c'])} crops")

    message = messaging.Message(
        topic=f"prices_{scope}",
        data={"type": "prices", "state": scope, "date": day},
        android=messaging.AndroidConfig(priority="high"),
    )
    messaging.send(message)
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

    failures = 0
    for state in states:
        try:
            rows = fetch_state(api_key, state)
            prices = summarise(rows)
            print(f"{state}: {len(rows)} rows, {len(prices)} crops")
            if not prices:
                print(f"  {state}: nothing reported today, skipping")
                continue
            save_and_notify(db, state, prices, day)
        except Exception as error:  # one bad state must not stop the rest
            failures += 1
            print(f"{state}: FAILED — {error}")

    print(f"Done. {failures} of {len(states)} state(s) failed.")
    if failures == len(states):
        sys.exit("Every state failed — see the errors above.")


if __name__ == "__main__":
    main()
