"""Launch check (1 Nov 2026): what every phone sees right now.

Reads config/app (the switches — the same public document the app reads),
kendra/info (is the Kendra set up), config/buy_offers (how many offers) and
plus_gifts (only how many codes — no names). Compares the switches with the
launch plan and prints a table. Reads only; prints no personal data.
By hand: Actions → "Launch check" → Run workflow.
"""
import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

# The app's built-in defaults (lib/state/app_config.dart, v1.0.7).
DEFAULTS = {
    "login": False, "sell": False, "calendar": True, "schemes": True, "price_map": True,
    "hold_sell": True, "day_voice": True, "share_picture": True, "kendra": False,
    "services": True, "weather": True, "alerts": True, "brief": True, "feedback": True,
    "home_sky": True, "advice": True, "dark": True, "widget_weather": True,
    "sell_menu": True, "where_sell": True, "sell_interest": True, "target": True,
    "update_prompt": True,
    "voice_search": False,  # v1.0.7 "बोलकर खोजें": starts OFF like every new feature
    "setup_guide": False,  # v1.0.7 "ऐप तैयार करें": starts OFF too
    "farm_weather": False,  # v1.0.7 "मेरे खेत का मौसम": starts OFF too
    "whats_new": False,  # v1.0.7 "Khalihan में नया": the tour after an update, OFF too
    "share_link": False,  # v1.0.8 the app's Play link in every share, OFF
    "share_short": False,  # v1.0.9 the short form of that link (needs the redirect site), OFF
    "rate_prompt": False,  # v1.0.8 Play's "rate Khalihan" card, OFF
    "ai": False,  # v1.0.9 Khalihan AI section, OFF (the test phone sees it)
    "ai_ask": False,  # v1.0.9 "Khalihan AI से पूछें" (V2), inside "ai"
    "ai_cloud": False,  # v1.0.9 Gemini reads hard questions (test phone only)
    "ai_vertex": True,  # v1.0.9+18 the cloud part through Vertex AI (paid tier); OFF = Gemini Developer API
    "ai_seva": False,  # v1.0.9 H4 "Khalihan AI सेवा" page
    "ai_yaad": False,  # v1.0.9 H4 "बोलकर याद" reminders (on the phone)
    "ai_voice": False,  # v1.0.9 the orb listens and speaks itself (microphone permission)
    "ai_hisaab": False,  # v1.0.9 H6.1 "बोलकर हिसाब" (on the phone only)
    "ai_bill": False,  # v1.0.9 H6.2 a bill photo read by Gemini → accounts
    "ai_soil": False,  # v1.0.9 H6.3 a Soil Health Card photo read by Gemini
    "ai_paper": False,  # v1.0.9 H7.1 a paper explained in plain words by Gemini
    "ai_kvk": False,  # v1.0.9 H7.2 the week's agromet advice (config/kvk)
    "ai_suno": False,  # v1.0.9 H7.3 answers read aloud
    "ai_voice_cloud": False,  # v1.0.9 H7.3 the natural voice (Gemini speech; costs per second; Plus members only)
    "ai_pest": False,  # v1.0.9 H8.2 pest / disease from a photo (Gemini names it; steps and medicine from the checked table)
    "ai_dawai": False,  # v1.0.9 H8.3 "kya daalu" from the checked table
    "ai_gov": False,  # v1.0.9 H9 a government site inside the app, filled together (on the phone)
    "ai_sound": False,  # v1.0.9 Khalihan AI's own two sounds; the phone's listening beep silenced
    "ai_interrupt": True,  # v1.0.9 talking over the AI stops it (loudness only, on the phone)
    "crop_photos": False,  # v1.0.9 real crop photos (all 106 since 15 Nov 2026)
    "price_border": False,  # v1.0.9 the crop picture's border follows the price (green up, red down)
    "pro_sale": False,  # v1.0.9 Khalihan Pro on sale in the app (owner, 17 Nov 2026: on at 1,000 installs)
    "ai_docs": False,  # v1.0.9 "Get documents": official pages of papers inside the app (needs ai_gov)
    "ai_open": False,  # v1.0.9 Step 2 "ask anything": Gemini answers questions outside the app (Plus; costs per question)
    "ai_chats": False,  # v1.0.9 Step 2 "My chats": questions and photo readings kept on the phone
    "ai_applied": False,  # v1.0.9 Step 3 "Applied forms": draft / submitted / status, on the phone (needs ai_gov)
    "ai_mydocs": False,  # v1.0.9 Step 3 "My documents": site PDFs and photographed papers kept on the phone
    "ai_account": False,  # v1.0.9 Step 3: AI records also in the logged-in farmer's account (Firestore + Storage)
    "ai_deep": False,  # v1.0.9 Step 3 deep search: Google Search grounding on the farmer's tap (Plus; paid per search)
}
PARENT = {
    "schemes": "services", "kendra": "services", "home_sky": "weather", "advice": "weather",
    "widget_weather": "weather", "farm_weather": "weather", "where_sell": "sell_menu", "price_map": "sell_menu",
    "hold_sell": "sell_menu", "sell_interest": "sell_menu", "ai_ask": "ai", "ai_cloud": "ai",
    "ai_seva": "ai", "ai_yaad": "ai", "ai_voice": "ai", "ai_hisaab": "ai", "ai_bill": "ai", "ai_soil": "ai", "ai_paper": "ai", "ai_kvk": "ai", "ai_suno": "ai", "ai_voice_cloud": "ai",
    "ai_pest": "ai", "ai_dawai": "ai", "ai_gov": "ai", "ai_sound": "ai", "ai_interrupt": "ai", "ai_docs": "ai",
    "ai_open": "ai", "ai_chats": "ai", "ai_applied": "ai", "ai_mydocs": "ai", "ai_account": "ai", "ai_deep": "ai",
}
# The launch plan (owner, 1 Nov 2026). Anything not listed: either is fine.
PLAN = {
    "login": False,  # OTP SMS cost; on when Khalihan starts buying
    "sell": False,  # Khalihan ko becho — not buying yet
    "kendra": False,  # the shop isn't open
    "sell_interest": False,  # "kitna bechna hai?" promises a call back
    "update_prompt": True,  # the in-app update reminder
    "target": True,  # stays hidden anyway until Plus (gift codes open it)
    "pro_sale": False,  # owner, 17 Nov 2026: Pro is sold from 1,000 installs
    "weather": True, "alerts": True, "calendar": True, "schemes": True, "services": True,
    "where_sell": True, "sell_menu": True, "feedback": True,
}


def main():
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    db = firestore.client()
    cfg = db.collection("config").document("app").get().to_dict() or {}
    raw = cfg.get("features") or {}

    def on(k):
        p = PARENT.get(k)
        if p and not on(p):
            return False
        v = raw.get(k)
        return v if isinstance(v, bool) else DEFAULTS.get(k, True)

    print("SWITCHES (what phones do now)")
    bad = 0
    for k in sorted(set(DEFAULTS) | set(raw)):
        now = on(k)
        want = PLAN.get(k)
        mark = "" if want is None else ("OK" if now == want else "CHANGE")
        bad += mark == "CHANGE"
        src = "admin" if k in raw else "default"
        print(f"  {k:16} {'ON ' if now else 'OFF'}  ({src}){'  plan: ' + ('ON' if want else 'OFF') + '  ' + mark if want is not None else ''}")
    unknown = sorted(set(raw) - set(DEFAULTS))
    if unknown:
        print("  (in Admin but unknown to app 1.0.6: " + ", ".join(unknown) + ")")
    print(f"\nlaunch_states: {cfg.get('launch_states')}")
    sd = cfg.get("sell_districts") or {}
    print(f"sell_districts: { {s: len(v or []) for s, v in sd.items()} } (number of districts)")
    n = cfg.get("notice")
    print(f"notice strip on Home: {'YES — kind=' + str(n.get('kind')) if isinstance(n, dict) and n else 'none'}")
    f = cfg.get("festival")
    print(f"festival look: {'YES — ' + str(f.get('kind')) + ' ' + str(f.get('from')) + '..' + str(f.get('until')) if isinstance(f, dict) and f else 'none'}")
    k = db.collection("kendra").document("info").get()
    print(f"kendra/info exists: {k.exists}")
    offers = (db.collection("config").document("buy_offers").get().to_dict() or {})
    try:
        lst = json.loads(offers.get("json") or "[]") if isinstance(offers.get("json"), str) else (offers.get("list") or [])
    except Exception:
        lst = []
    print(f"buy offers live: {len(lst)}")
    gifts = list(db.collection("plus_gifts").stream())
    print(f"plus gift codes: {len(gifts)} (test phones: {sum(1 for g in gifts if (g.to_dict() or {}).get('test'))}, on a phone: {sum(1 for g in gifts if (g.to_dict() or {}).get('device'))})")
    print(f"\nRESULT: {'all switches match the launch plan' if not bad else str(bad) + ' switch(es) to change in Admin'}")


if __name__ == "__main__":
    main()
