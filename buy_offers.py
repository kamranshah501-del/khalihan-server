"""Khalihan buy offers — "Khalihan ko becho".

Writes the offers the app shows (Firestore config/buy_offers → {version, json})
from the "Khalihan buy offers" workflow (Actions → Run workflow), so an offer
can be started, changed or stopped from the phone without an app update.

Rule: start an offer only when a processor (ginning mill, feed mill, dal mill)
has already fixed its price and quality terms — we buy back-to-back, never as
a price bet. Before the first offer: privacy policy + Play Data safety must
say we collect the phone number in a sell request, and Firestore must allow
creating sell_requests (see ROADMAP.md, "Switch-on checklist").

Inputs come as environment variables (never pasted into a shell command):
  ACTION        list | add | end
  CROP          maize / makka, cotton / kapas, chana, tur, soybean, …
  PRICE         ₹ per quintal (add)
  DISTRICTS     comma separated, e.g. "jalgaon" or "jalgaon, dhule"
  CENTRE        collection centre name; empty = we pick up from the farm
  PAYMENT_DAYS  0 = paid the same day
  MOISTURE_MAX  % (optional)
  MIN_QTY       quintals (optional)
  DAYS          how many days the offer runs (default 7)
  NOTE          a short note for farmers (optional)
  WHATSAPP      Khalihan's WhatsApp number (repo variable KHALIHAN_WHATSAPP)
"""
import datetime
import json
import os
import re
import sys

import firebase_admin
from firebase_admin import credentials, firestore

# Farmer words → the start of the Agmarknet crop name the app matches on.
CROPS = {
    "maize": ["maize"], "makka": ["maize"], "makai": ["maize"],
    "cotton": ["cotton", "kapas"], "kapas": ["cotton", "kapas"], "kapus": ["cotton", "kapas"],
    "chana": ["bengal gram"], "gram": ["bengal gram"], "harbhara": ["bengal gram"],
    "tur": ["arhar"], "arhar": ["arhar"],
    "soybean": ["soyabean"], "soyabean": ["soyabean"],
    "jowar": ["jowar"], "bajra": ["bajra"], "wheat": ["wheat"], "gehu": ["wheat"],
    "moong": ["green gram"], "urad": ["black gram"],
    "onion": ["onion"], "kanda": ["onion"], "banana": ["banana"], "kela": ["banana"],
}

IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))


def env(name, default=""):
    return (os.environ.get(name) or default).strip()


def number(name, low, high, required=False):
    raw = env(name)
    if not raw:
        if required:
            sys.exit(f"❌ {name} is needed.")
        return None
    try:
        value = float(raw.replace(",", ""))
    except ValueError:
        sys.exit(f"❌ {name} must be a number, got {raw!r}.")
    if not low <= value <= high:
        sys.exit(f"❌ {name} must be between {low} and {high}, got {value}.")
    return int(value) if value == int(value) else value


def show(offers):
    if not offers:
        print("No live offers — every 'Khalihan ko becho' card is hidden.")
    for o in offers:
        where = "pickup from farm" if o.get("pickup") != "centre" else f"centre: {o.get('centre')}"
        print(f"• {o['id']}: {', '.join(o['crops'])} in {', '.join(o['districts']) or 'all districts'} — "
              f"₹{o['price']}/qtl, {where}, paid in {o.get('payment_days', 0)} day(s), until {o['until']}")


def main():
    service_account = env("FIREBASE_SERVICE_ACCOUNT")
    if not service_account:
        sys.exit("❌ FIREBASE_SERVICE_ACCOUNT is not set.")
    firebase_admin.initialize_app(credentials.Certificate(json.loads(service_account)))
    ref = firestore.client().collection("config").document("buy_offers")
    data = ref.get().to_dict() or {}
    version = int(data.get("version") or 0)
    try:
        offers = json.loads(data.get("json") or "[]")
    except ValueError:
        offers = []
    today = datetime.datetime.now(IST).date()
    # Ended offers drop out on every run.
    offers = [o for o in offers if isinstance(o, dict) and str(o.get("until", "")) >= today.isoformat()]

    action = env("ACTION", "list").lower()
    if action == "list":
        show(offers)
        return

    crop_word = env("CROP").lower()
    crops = CROPS.get(crop_word)
    if not crops:
        sys.exit(f"❌ Unknown crop {crop_word!r}. Use one of: {', '.join(sorted(CROPS))}.")
    districts = [re.sub(r"[^a-z0-9]", "", d.lower()) for d in env("DISTRICTS", "jalgaon").split(",")]
    districts = [d for d in districts if d]

    def same(o):
        return o.get("crops") == crops and sorted(o.get("districts", [])) == sorted(districts)

    if action == "end":
        before = len(offers)
        offers = [o for o in offers if not same(o)]
        print(f"Ended {before - len(offers)} offer(s).")
    elif action == "add":
        price = number("PRICE", 100, 50000, required=True)
        days = number("DAYS", 1, 60) or 7
        whatsapp = re.sub(r"[^0-9]", "", env("WHATSAPP"))
        if len(whatsapp) == 10:
            whatsapp = "91" + whatsapp
        if not re.fullmatch(r"91[6-9][0-9]{9}", whatsapp):
            if whatsapp:
                print(f"⚠️ WhatsApp number {env('WHATSAPP')!r} doesn't look like an Indian mobile — not used.")
            whatsapp = ""
        if not whatsapp:
            print("⚠️ No WhatsApp number (repo variable KHALIHAN_WHATSAPP) — requests only reach Firestore.")
        centre = env("CENTRE")
        offer = {
            "id": f"{crop_word}-{'-'.join(districts) or 'all'}-{today:%Y%m%d}",
            "crops": crops,
            "districts": districts,
            # District names repeat across states; Khalihan is live in
            # Maharashtra only — add a STATE input when more states open.
            "state": "Maharashtra",
            "price": price,
            "pickup": "centre" if centre else "doorstep",
            "centre": centre,
            "payment_days": int(number("PAYMENT_DAYS", 0, 60) or 0),
            "until": (today + datetime.timedelta(days=int(days) - 1)).isoformat(),
            "whatsapp": whatsapp,
        }
        moisture = number("MOISTURE_MAX", 1, 40)
        min_qty = number("MIN_QTY", 1, 10000)
        if moisture is not None:
            offer["moisture_max"] = moisture
        if min_qty is not None:
            offer["min_qty"] = min_qty
        note = env("NOTE")[:200]
        if note:
            offer["note"] = {"hi": note}
        offers = [o for o in offers if not same(o)] + [offer]
        print("Offer saved:")
    else:
        sys.exit(f"❌ ACTION must be list, add or end — got {action!r}.")

    # Any change gets a new version: phones replace their copy at next start.
    ref.set({"version": version + 1, "json": json.dumps(offers, ensure_ascii=False),
             "updated": firestore.SERVER_TIMESTAMP})
    show(offers)
    print(f"config/buy_offers is now version {version + 1}.")


if __name__ == "__main__":
    main()
