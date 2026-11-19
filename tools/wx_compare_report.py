"""The score: Open-Meteo vs Google's Weather API against IMD's own
observations at Maharashtra's SYNOP observatories (functions/alerts/
wx_compare.py collects twice a day into Firestore wx_compare/{day}).

  python tools/wx_compare_report.py          needs FIREBASE_SERVICE_ACCOUNT

Per provider, for "today" (forecast made the same morning) and "tomorrow":
  max temperature: mean absolute error, °C (vs IMD's 12 UTC max);
  min temperature: mean absolute error, °C (vs the next morning's 03 UTC min);
  rain: of the station-days IMD measured ≥ 2.5 mm (a "rainy day"), how many
        the forecast called (≥ 2.5 mm), and how many dry days it wrongly
        called rainy.
Days do not line up exactly: IMD's 24-hour rain runs 08:30→08:30 IST,
Open-Meteo's day is midnight→midnight, Google's 07:00→07:00. Google's minimum
is tried both ways (its own day and the day before) and the closer is shown.
"""
import json
import os
from datetime import date, timedelta

RAINY = 2.5


def mae(pairs):
    pairs = [(a, b) for a, b in pairs if a is not None and b is not None]
    return (round(sum(abs(a - b) for a, b in pairs) / len(pairs), 2), len(pairs)) if pairs else (None, 0)


def score(days):
    """days: {iso: doc}. Returns {provider: {lead: {...}}}."""
    out = {}
    for prov in ("om", "g"):
        out[prov] = {}
        for lead in (0, 1):
            tmax, tmin, tmin_alt, hit, miss, false, dry = [], [], [], 0, 0, 0, 0
            for iso, doc in days.items():
                fc = doc.get(prov) or {}
                if "error" in fc:
                    continue
                d = date.fromisoformat(iso)
                target = (d + timedelta(days=lead)).isoformat()
                after = (d + timedelta(days=lead + 1)).isoformat()
                tdoc, ndoc = days.get(target) or {}, days.get(after) or {}
                for sid, rows in fc.items():
                    if len(rows) <= lead:
                        continue
                    f = rows[lead]
                    tmax.append((f[0], ((tdoc.get("obs_pm") or {}).get(sid) or {}).get("tmax")))
                    night = ((ndoc.get("obs_am") or {}).get(sid) or {})
                    tmin.append((f[1], night.get("tmin")))
                    if prov == "g":  # Google's day starts 07:00: its min may be the night before
                        tmin_alt.append((f[1], ((tdoc.get("obs_am") or {}).get(sid) or {}).get("tmin")))
                    rain = night.get("rain24")
                    if rain is None or f[2] is None:
                        continue
                    wet, said = rain >= RAINY, f[2] >= RAINY
                    if wet and said:
                        hit += 1
                    elif wet:
                        miss += 1
                    elif said:
                        false += 1
                    else:
                        dry += 1
            mn = mae(tmin)
            if tmin_alt:
                alt = mae(tmin_alt)
                if alt[0] is not None and (mn[0] is None or alt[0] < mn[0]):
                    mn = alt
            out[prov][lead] = {"tmax": mae(tmax), "tmin": mn, "rain": {"hit": hit, "miss": miss, "false": false, "dry": dry}}
    return out


def main():
    import firebase_admin
    from firebase_admin import credentials, firestore
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    db = firestore.client()
    days = {d.id: d.to_dict() for d in db.collection("wx_compare").stream()}
    print(f"{len(days)} days: {', '.join(sorted(days))}")
    names = {"om": "Open-Meteo", "g": "Google Weather"}
    for prov, leads in score(days).items():
        for lead, s in leads.items():
            r = s["rain"]
            print(f"{names[prov]:<15} {'today' if lead == 0 else 'tomorrow':<8} "
                  f"max ±{s['tmax'][0]} °C (n={s['tmax'][1]})  min ±{s['tmin'][0]} °C (n={s['tmin'][1]})  "
                  f"rainy days caught {r['hit']}/{r['hit'] + r['miss']}, false rain {r['false']}/{r['false'] + r['dry']}")
    errors = {d: {p: doc[p]["error"] for p in ("om", "g") if "error" in (doc.get(p) or {})} for d, doc in days.items()}
    for d, e in sorted(errors.items()):
        if e:
            print(f"  {d}: {e}")


if __name__ == "__main__":
    main()
