"""IMD warnings, by hand (the real pass runs every 10 minutes in Google Cloud,
functions/alerts/main.py → imd_core.run).

  python tools/imd_warnings.py            what IMD says for Maharashtra now —
                                          reads IMD only, sends nothing
  python tools/imd_warnings.py --test-push
                                          a fake "hail now" for every district
                                          to topic wx_test: only test-build
                                          phones that turned on "IMD टेस्ट push"
                                          (Profile → चेतावनी की जाँच) listen.
                                          Needs FIREBASE_SERVICE_ACCOUNT.
"""
import json
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "functions", "alerts"))
import imd_core  # noqa: E402


def main():
    now = datetime.now(timezone.utc)
    nowcast, fiveday = imd_core.fetch()
    issued = sorted({str(f["properties"].get("Date")) for f in fiveday})
    updated = max((str(f["properties"].get("update_time") or "") for f in nowcast), default="")
    print(f"IMD read at {now.astimezone(imd_core.IST):%d %b %Y %H:%M} IST: "
          f"{len(nowcast)} nowcast districts (last update {updated[:16]}), "
          f"{len(fiveday)} 5-day rows (issued {', '.join(issued)})")
    items = imd_core.plan(nowcast, fiveday, now)
    if not items:
        print("Maharashtra: no hail, storm, heavy-rain, wind, heat or frost warning today or tomorrow.")
    for it in items:
        print(f"  {it['d']:<12} {it['k']:<6} {it['l'] or '-'}  {it['day']}  {it['s']}  {('until ' + it['u']) if it['u'] else ''}")

    if "--test-push" in sys.argv:
        import firebase_admin
        from firebase_admin import credentials, messaging
        firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
        data = imd_core.payload(imd_core.fake(now), test=True)
        mid = messaging.send(messaging.Message(topic=imd_core.TEST_TOPIC, data=data,
                                               android=messaging.AndroidConfig(priority="high")))
        print(f"Test push (fake hail, every district) sent to {imd_core.TEST_TOPIC}: {mid}")


if __name__ == "__main__":
    main()
