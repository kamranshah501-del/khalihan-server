"""Which crops each district of a state really trades — read from the
server's own archive (prices/{state}__{district}/days), last N days.

For the owner's question (26 Oct 2026): "Maharashtra me kaun kaun si fasal
aati hai, aur kaun si zyada?" — and the base for sorting the app's crop list
by what the farmer's own district trades. Public government prices only;
nothing personal. Run by .github/workflows/crop-report.yml.

Output: report/{state}.json and report/{state}.md
"""
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import firebase_admin
from firebase_admin import credentials, firestore


def slug(text):
    """Same as daily_prices.slug: "Madhya Pradesh" -> "madhya_pradesh"."""
    out = "".join(ch if ch.isalnum() else "_" for ch in (text or "").strip().lower())
    return "_".join(part for part in out.split("_") if part)


def read_days(db, scope, since):
    """{day: [{n, p, k}]} for the archive scope, days >= since."""
    out = {}
    days = db.collection("prices").document(scope).collection("days")
    for doc in days.where("d", ">=", since).stream():
        data = doc.to_dict() or {}
        out[data.get("d") or doc.id] = data.get("c") or []
    return out


def rank(days):
    """Crops by how often they were traded: days seen, then mandis per day."""
    seen = defaultdict(int)
    mandis = defaultdict(int)
    last_price = {}
    last_day = {}
    for day in sorted(days):
        for item in days[day]:
            name = item.get("n")
            if not name:
                continue
            seen[name] += 1
            mandis[name] += int(item.get("k") or 1)
            last_price[name] = item.get("p")
            last_day[name] = day
    rows = []
    for name in seen:
        rows.append({
            "crop": name,
            "days": seen[name],
            "mandis_per_day": round(mandis[name] / seen[name], 1),
            "score": round(seen[name] * (mandis[name] / seen[name]) ** 0.5, 1),
            "last_day": last_day[name],
            "last_price": last_price[name],
        })
    rows.sort(key=lambda r: (-r["score"], r["crop"]))
    return rows


def main():
    state = os.environ.get("REPORT_STATE", "Maharashtra")
    span = int(os.environ.get("REPORT_DAYS", "30"))
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    db = firestore.client()
    since = (datetime.now(timezone.utc) - timedelta(days=span)).strftime("%Y-%m-%d")
    base = slug(state)

    report = {"state": state, "since": since, "made": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    state_days = read_days(db, base, since)
    report["days_in_archive"] = len(state_days)
    report["state"] = {"days": len(state_days), "crops": rank(state_days)}

    districts = {}
    for ref in db.collection("prices").list_documents():
        if not ref.id.startswith(base + "__"):
            continue
        days = read_days(db, ref.id, since)
        if days:
            districts[ref.id[len(base) + 2:]] = {"days": len(days), "crops": rank(days)}
    report["districts"] = districts

    # What phones read right now (live/{state}): crop names and districts —
    # to compare names across sources (stale "Last price" rows on phones).
    live = {}
    try:
        ref = db.collection("live").document(base)
        meta = (ref.get().to_dict() or {})
        names = defaultdict(set)
        for i in range(int(meta.get("parts") or 0)):
            part = ref.collection("parts").document(str(i)).get().to_dict() or {}
            for row in part.get("r") or []:
                if isinstance(row, dict):
                    names[str(row.get("c") or row.get("commodity") or "?")].add(str(row.get("d") or row.get("district") or "?"))
                elif isinstance(row, list) and row:
                    names[str(row[0])].add(str(row[2]) if len(row) > 2 else "?")
        live = {"rows": meta.get("rows"), "crops": {k: sorted(v)[:60] for k, v in sorted(names.items())}}
        if not names:
            sample = (ref.collection("parts").document("0").get().to_dict() or {}).get("r") or []
            live["sample"] = sample[:3]
    except Exception as error:
        live = {"error": str(error)}
    report["live"] = live
    pop = db.collection("popular").document(base).get().to_dict() or {}
    report["popular"] = {"state_top": (pop.get("state") or [])[:15], "districts": len(pop.get("districts") or {}),
                         "jalgaon": (pop.get("districts") or {}).get("jalgaon", [])[:20]}
    old_day = os.environ.get("REPORT_OLD_DAY", "2026-10-19")
    try:
        snap = db.collection("prices").document(base).collection("days").document(old_day).get()
        report["old_day"] = {"day": old_day, "crops": [c.get("n") for c in (snap.to_dict() or {}).get("c") or []]}
        snap = db.collection("prices").document(base + "__jalgaon").collection("days").document(old_day).get()
        report["old_day_jalgaon"] = [c.get("n") for c in (snap.to_dict() or {}).get("c") or []]
    except Exception as error:
        report["old_day"] = {"error": str(error)}

    os.makedirs("report", exist_ok=True)
    with open(f"report/{base}.json", "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=1)

    lines = [f"# {state} — crops traded, last {span} days (since {since})", ""]
    st = report["state"]
    lines.append(f"## Whole state ({st['days']} days in the archive, {len(st['crops'])} crops)")
    lines.append("| # | Crop | Days seen | Mandis/day | Last day | Last ₹ |")
    lines.append("|---|---|---|---|---|---|")
    for i, r in enumerate(st["crops"], 1):
        lines.append(f"| {i} | {r['crop']} | {r['days']} | {r['mandis_per_day']} | {r['last_day']} | {r['last_price']} |")
    for name, d in sorted(districts.items()):
        lines += ["", f"## {name} ({d['days']} days, {len(d['crops'])} crops)",
                  "| # | Crop | Days | Mandis/day | Last day |", "|---|---|---|---|---|"]
        for i, r in enumerate(d["crops"], 1):
            lines.append(f"| {i} | {r['crop']} | {r['days']} | {r['mandis_per_day']} | {r['last_day']} |")
    with open(f"report/{base}.md", "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"{state}: {len(st['crops'])} crops state-wide, {len(districts)} districts")


if __name__ == "__main__":
    sys.exit(main())
