"""Owner stats (10 Nov 2026): the app's numbers for Khalihan Admin → 📊 आँकड़े.

Twice a day (and by hand: Actions → "Owner stats" → Run workflow) this reads

  • Google Play's own reports (installs, uninstalls, versions, rating,
    crashes) from Play's Cloud Storage bucket — Google posts them 3–7 days
    late, a month per CSV file;
  • Google Analytics for Firebase (what the app itself records: active
    users, new users, which screens and features, which crops, districts,
    languages, app versions) through the Analytics Data API;

and saves one document, owner_stats/latest, which only the owner can read
(firestore.rules). Counts only — never a name, phone or device id.

This repository is public, so nothing here prints a number: the log says
only whether each part worked and, if not, what the owner has to do.

Setup (owner, once): give the service account in FIREBASE_SERVICE_ACCOUNT
  1. Play Console → Users and permissions → invite its email with the app
     permission "View app information and download bulk reports";
  2. Google Analytics → the Khalihan property → Property access management →
     add the same email as Editor (Editor only so this job can add the
     "crop / district / state / language" fields once — it changes nothing
     else);
  3. Google Cloud (the Firebase project) → turn on "Google Analytics Data
     API" and "Google Analytics Admin API";
and set the repository variable PLAY_BUCKET to Play's "Cloud Storage URI"
(Play Console → Download reports → Statistics → Copy Cloud Storage URI).
"""
import csv
import datetime as dt
import io
import json
import os
import sys
from urllib.parse import quote

PACKAGE = "in.khalihan.app"
DAYS = 60  # how many days the daily charts keep

# What the app records (lib/services/insights.dart) that needs a named
# field in Analytics before it can be counted: parameter → scope.
CUSTOM_DIMENSIONS = {
    "crop": ("EVENT", "Crop", "Crop opened, pinned, alert or target (app)"),
    "what": ("EVENT", "Shared what", "What was shared (app)"),
    "from": ("EVENT", "Day voice from", "आज का भाव सुनें — from Home or the morning notification (app)"),
    "state": ("USER", "State", "The farmer's chosen state (app)"),
    "district": ("USER", "District", "The farmer's chosen district (app)"),
    "language": ("USER", "App language", "The language chosen in the app (app)"),
    "code": ("EVENT", "Why prices failed", "prices_failed reason from v1.0.7: no_feed, fs_unavailable… (app)"),
    # v1.0.7 "ऐप तैयार करें" — created ahead, since Analytics never counts backwards.
    "step": ("EVENT", "Guide step", "Setup guide step: prices, district, location, notifications (app)"),
    "result": ("EVENT", "Guide result", "Setup guide result: done, denied, skipped, settings, retry, gps, manual (app)"),
    "loc": ("USER", "Location allowed", "Phone location for Khalihan: on, off, denied, denied_forever (app)"),
    "notif": ("USER", "Notifications allowed", "Notifications for Khalihan: on, off (app)"),
}

BLANK = ("", "(not set)", "(other)")

SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/devstorage.read_only",
]


class Problem(Exception):
    """A step that failed in a way the owner can fix: code + a short hint."""

    def __init__(self, code, hint=""):
        super().__init__(code)
        self.code = code
        self.hint = hint


# ── small helpers (tested in tools/test_owner_stats.py) ─────────────────

def decode_csv(raw):
    """Play's CSV files are UTF-16 with a BOM; tolerate UTF-8 too."""
    if raw[:2] in (b"\xff\xfe", b"\xfe\xff"):
        text = raw.decode("utf-16")
    else:
        text = raw.decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(text)))


def col(row, *names):
    """The first column whose header contains one of [names] (case and
    spacing ignored) — Play renames columns now and then."""
    keys = {k.strip().lower(): k for k in row.keys() if k}
    for n in names:
        n = n.lower()
        if n in keys:
            return row[keys[n]]
    for n in names:
        n = n.lower()
        for k, orig in keys.items():
            if n in k:
                return row[orig]
    return None


def num(v):
    try:
        f = float(str(v).replace(",", "").strip())
    except (TypeError, ValueError):
        return None
    return int(f) if f.is_integer() else round(f, 2)


def bucket_name(value):
    """'gs://pubsite_prod_rev_123/stats/installs' → 'pubsite_prod_rev_123'."""
    v = (value or "").strip()
    if v.startswith("gs://"):
        v = v[5:]
    return v.split("/")[0]


def months_back(today, n):
    """['202611', '202610', '202609'] for n=3."""
    out, y, m = [], today.year, today.month
    for _ in range(n):
        out.append(f"{y}{m:02d}")
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return out


def play_installs(rows, since):
    """Daily installs / uninstalls / upgrades + the latest totals from the
    'overview' installs CSV rows (several months together)."""
    days = {}
    for r in rows:
        d = (col(r, "date") or "").strip()
        if len(d) != 10:
            continue
        days[d] = r
    daily = []
    for d in sorted(days):
        r = days[d]
        daily.append({
            "d": d,
            "i": num(col(r, "daily device installs")) or 0,
            "u": num(col(r, "daily device uninstalls", "daily device uninstallations")) or 0,
            "up": num(col(r, "daily device upgrades")) or 0,
        })
    if not daily:
        return None
    last = days[daily[-1]["d"]]
    recent = [x for x in daily if x["d"] >= since]
    return {
        "through": daily[-1]["d"],
        "total": num(col(last, "total user installs")),
        "now": num(col(last, "current device installs", "installs on active devices", "active device installs")),
        "active": num(col(last, "installs on active devices", "active device installs")),
        "i28": sum(x["i"] for x in recent),
        "u28": sum(x["u"] for x in recent),
        "daily": daily[-DAYS:],
    }


def play_versions(rows):
    """Phones per app version (version code) on the newest day in the file."""
    if not rows:
        return []
    newest = max((col(r, "date") or "") for r in rows)
    out = []
    for r in rows:
        if (col(r, "date") or "") != newest:
            continue
        code = (col(r, "app version code", "version code") or "").strip()
        n = num(col(r, "installs on active devices", "active device installs", "current device installs"))
        if code and n:
            out.append({"k": code, "n": n})
    return sorted(out, key=lambda x: -x["n"])[:8]


def play_last(rows, *names):
    """The newest value of a column (rating) and the newest date."""
    best = None
    for r in rows:
        d = (col(r, "date") or "").strip()
        v = num(col(r, *names))
        if v is None or not d:
            continue
        if best is None or d > best[0]:
            best = (d, v)
    return best


def play_sum(rows, since, *names):
    return sum((num(col(r, *names)) or 0) for r in rows if (col(r, "date") or "") >= since)


def ga_rows(resp, dims, mets):
    """Analytics Data API rows → [{dim names…, metric names…}]."""
    out = []
    for row in resp.get("rows", []) or []:
        item = {}
        for name, v in zip(dims, row.get("dimensionValues", [])):
            item[name] = v.get("value", "")
        for name, v in zip(mets, row.get("metricValues", [])):
            item[name] = num(v.get("value")) or 0
        out.append(item)
    return out


def top(items, key, metric, n):
    """[{k: name, n: count}], biggest first — dropping Analytics' '(not set)'
    and blanks."""
    out = []
    for it in items:
        k = str(it.get(key, "")).strip()
        if not k or k in ("(not set)", "(other)"):
            continue
        out.append({"k": k[:60], "n": it.get(metric, 0)})
    out.sort(key=lambda x: -x["n"])
    return out[:n]


# ── Google APIs ─────────────────────────────────────────────────────────

def session():
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession

    info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return AuthorizedSession(creds), info.get("project_id", ""), info.get("client_email", "")


def explain(resp):
    """An API error → (code, hint) the owner can act on."""
    try:
        err = resp.json().get("error", {})
    except ValueError:
        err = {}
    text = json.dumps(err)
    if "SERVICE_DISABLED" in text or "has not been used in project" in text or "it is disabled" in text:
        return "api_off", "turn on the Google Analytics Data API / Admin API in Google Cloud"
    if resp.status_code in (401, 403):
        return "denied", "the service account has no access yet"
    if resp.status_code == 404:
        return "missing", ""
    return "error", f"HTTP {resp.status_code}"


def ga_property(s):
    forced = os.environ.get("GA_PROPERTY", "").strip()
    if forced:
        return forced if forced.startswith("properties/") else f"properties/{forced}"
    r = s.get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", params={"pageSize": 50})
    if r.status_code != 200:
        raise Problem(*explain(r))
    props = [
        (p.get("property"), (p.get("displayName") or "").lower())
        for a in r.json().get("accountSummaries", []) or []
        for p in a.get("propertySummaries", []) or []
    ]
    if not props:
        raise Problem("no_property", "add the service account to the Khalihan Analytics property")
    for pid, name in props:
        if "khalihan" in name:
            return pid
    return props[0][0]


def ga_dimensions(s, prop):
    """Adds the missing custom fields once. Returns (ready set, note)."""
    url = f"https://analyticsadmin.googleapis.com/v1beta/{prop}/customDimensions"
    r = s.get(url, params={"pageSize": 200})
    if r.status_code != 200:
        return set(), explain(r)[0]
    have = {(d.get("parameterName"), d.get("scope")) for d in r.json().get("customDimensions", []) or []}
    ready, note = set(), ""
    for param, (scope, name, desc) in CUSTOM_DIMENSIONS.items():
        if (param, scope) in have:
            ready.add(param)
            continue
        c = s.post(url, json={"parameterName": param, "displayName": name, "description": desc, "scope": scope})
        if c.status_code == 200:
            ready.add(param)
            note = "added"
        else:
            note = "need_editor" if c.status_code == 403 else explain(c)[0]
    return ready, note


def ga_report(s, prop, dims, mets, start="28daysAgo", end="yesterday", limit=50, filt=None, order=None):
    body = {
        "dateRanges": [{"startDate": start, "endDate": end}],
        "dimensions": [{"name": d} for d in dims],
        "metrics": [{"name": m} for m in mets],
        "limit": limit,
    }
    if filt:
        body["dimensionFilter"] = {"filter": {"fieldName": filt[0], "stringFilter": {"value": filt[1]}}}
    if order:
        body["orderBys"] = [{"metric": {"metricName": order}, "desc": True}]
    r = s.post(f"https://analyticsdata.googleapis.com/v1beta/{prop}:runReport", json=body)
    if r.status_code != 200:
        raise Problem(*explain(r))
    return ga_rows(r.json(), dims, mets)


def analytics(s):
    prop = ga_property(s)
    ready, dim_note = ga_dimensions(s, prop)

    def active(start, end):
        rows = ga_report(s, prop, [], ["activeUsers", "newUsers"], start=start, end=end)
        return rows[0] if rows else {"activeUsers": 0, "newUsers": 0}

    a1, a7, a28 = active("yesterday", "yesterday"), active("7daysAgo", "yesterday"), active("28daysAgo", "yesterday")
    today = active("today", "today")

    # Farmers are in India: the owner, testers (Kuwait) and Google's own
    # test phones (pre-launch reports, USA / Europe) are counted apart.
    def india(start, end):
        rows = ga_report(s, prop, [], ["activeUsers", "newUsers"], start=start, end=end, filt=("country", "India"))
        return rows[0] if rows else {"activeUsers": 0, "newUsers": 0}

    i1, i7, i28 = india("yesterday", "yesterday"), india("7daysAgo", "yesterday"), india("28daysAgo", "yesterday")
    daily = ga_report(s, prop, ["date"], ["activeUsers", "newUsers"], start=f"{DAYS}daysAgo", end="today", limit=DAYS + 2)
    daily = sorted(
        ({"d": f"{x['date'][:4]}-{x['date'][4:6]}-{x['date'][6:]}", "a": x["activeUsers"], "n": x["newUsers"]} for x in daily),
        key=lambda x: x["d"],
    )
    events = ga_report(s, prop, ["eventName"], ["eventCount", "totalUsers"], limit=60, order="eventCount")
    screens = ga_report(s, prop, ["unifiedScreenName"], ["screenPageViews", "activeUsers"], limit=40, order="screenPageViews")
    versions = ga_report(s, prop, ["appVersion"], ["activeUsers"], limit=10, order="activeUsers")
    regions = ga_report(s, prop, ["country", "region"], ["activeUsers"], limit=40, order="activeUsers")
    countries = ga_report(s, prop, ["country"], ["activeUsers"], limit=20, order="activeUsers")

    # Where "prices didn't download" happened — built-in fields, so the past
    # 28 days count too (owner, 10 Nov: 17 failures, why?).
    def failed_by(dim, n=10, start="28daysAgo"):
        rows = ga_report(s, prop, [dim], ["eventCount", "totalUsers"], start=start, limit=n + 5,
                         filt=("eventName", "prices_failed"), order="eventCount")
        out = [{"k": r[dim][:40], "n": r["eventCount"], "u": r["totalUsers"]} for r in rows if r[dim] not in BLANK]
        return out[:n]

    def guide_steps():
        """Each guide button pressed: step × result (v1.0.7)."""
        if not {"step", "result"} <= ready:
            return []
        try:
            rows = ga_report(s, prop, ["customEvent:step", "customEvent:result"], ["eventCount"], limit=40,
                             filt=("eventName", "guide_step"), order="eventCount")
        except Problem:
            return []
        return [{"s": r["customEvent:step"][:20], "r": r["customEvent:result"][:20], "n": r["eventCount"]}
                for r in rows if r["customEvent:step"] not in BLANK and r["customEvent:result"] not in BLANK]

    def custom(dim, metric, filt=None, n=15):
        try:
            return top(ga_report(s, prop, [dim], [metric], limit=n + 5, filt=filt, order=metric), dim, metric, n)
        except Problem:
            return []  # a field added today has no data yet

    out = {
        "ok": True, "msg": "", "prop": prop.split("/")[-1],
        "through": (dt.date.today() - dt.timedelta(days=1)).isoformat(),
        "a1": a1["activeUsers"], "a7": a7["activeUsers"], "a28": a28["activeUsers"],
        "n1": a1["newUsers"], "n7": a7["newUsers"], "n28": a28["newUsers"],
        "today": today["activeUsers"],
        "in1": i1["activeUsers"], "in7": i7["activeUsers"], "in28": i28["activeUsers"], "inn28": i28["newUsers"],
        "daily": daily[-DAYS:],
        "events": [{"k": e["eventName"], "c": e["eventCount"], "u": e["totalUsers"]}
                   for e in events if e["eventName"] not in BLANK and e["eventCount"]],
        "screens": [{"k": x["unifiedScreenName"][:60], "v": x["screenPageViews"], "u": x["activeUsers"]}
                    for x in screens if x["unifiedScreenName"] not in ("", "(not set)")],
        "versions": top(versions, "appVersion", "activeUsers", 8),
        "regions": [{"k": r["region"][:60], "c": r["country"][:40], "n": r["activeUsers"]}
                    for r in regions if r["region"] not in BLANK and r["country"] == "India"][:15],
        "countries": top(countries, "country", "activeUsers", 10),
        "crops": custom("customEvent:crop", "eventCount", ("eventName", "crop_opened")) if "crop" in ready else [],
        "states": custom("customUser:state", "activeUsers") if "state" in ready else [],
        "districts": custom("customUser:district", "activeUsers") if "district" in ready else [],
        "langs": custom("customUser:language", "activeUsers", n=10) if "language" in ready else [],
        "fail_country": failed_by("country"),
        "fail_version": failed_by("appVersion"),
        "fail_days": sorted(failed_by("date", n=30), key=lambda x: x["k"]),
        "guide_steps": guide_steps(),
        "perm_loc": custom("customUser:loc", "activeUsers", n=6) if "loc" in ready else [],
        "perm_notif": custom("customUser:notif", "activeUsers", n=4) if "notif" in ready else [],
        "fail_why": custom("customEvent:code", "eventCount", ("eventName", "prices_failed"), n=8) if "code" in ready else [],
        "fail_state": custom("customUser:state", "eventCount", ("eventName", "prices_failed"), n=8) if "state" in ready else [],
        "dims": sorted(ready), "dims_note": dim_note,
    }
    return out


DENIED_HINT = "Play Console → Users and permissions → the service account → Account permissions → " \
              "'View app information and download bulk reports' (it can take up to a day to start working)"


def gcs_list(s, bucket, prefix):
    """The report files' names, or None when Google won't list them."""
    r = s.get(f"https://storage.googleapis.com/storage/v1/b/{bucket}/o",
              params={"prefix": prefix, "fields": "items(name),nextPageToken", "maxResults": 1000})
    if r.status_code != 200:
        return None
    return {it.get("name", "") for it in r.json().get("items", []) or []}


def gcs_get(s, bucket, name):
    """A report's rows; None when it isn't there. Google answers 403, not
    404, for a file that doesn't exist yet when it won't list the bucket —
    so a 403 here is only 'not readable', and play() decides."""
    r = s.get(f"https://storage.googleapis.com/storage/v1/b/{bucket}/o/{quote(name, safe='')}", params={"alt": "media"})
    if r.status_code == 404:
        return None
    if r.status_code in (401, 403):
        return False
    if r.status_code != 200:
        raise Problem(explain(r)[0], f"HTTP {r.status_code}")
    return decode_csv(r.content)


def play(s):
    bucket = bucket_name(os.environ.get("PLAY_BUCKET", ""))
    if not bucket:
        raise Problem("no_bucket", "set the repository variable PLAY_BUCKET")
    months = months_back(dt.date.today(), 3)
    since = (dt.date.today() - dt.timedelta(days=28)).isoformat()

    # Which files exist (None: Google won't list — then just try each).
    names = gcs_list(s, bucket, f"stats/installs/installs_{PACKAGE}_")
    refused = []

    def read(folder, kind, dim, all_months=True):
        rows = []
        for m in (months if all_months else months[:2]):
            name = f"stats/{folder}/{kind}_{PACKAGE}_{m}_{dim}.csv"
            if names is not None and folder == "installs" and name not in names:
                continue
            got = gcs_get(s, bucket, name)
            if got is False:
                refused.append(m)
                continue
            if got:
                rows.extend(got)
            if not all_months and got:
                break  # the newest month that has a file is enough
        return rows

    installs = play_installs(read("installs", "installs", "overview"), since)
    if not installs:
        if names is None and refused:
            raise Problem("denied", DENIED_HINT)
        listed = "none listed" if names is not None and not names else f"{len(names)} listed" if names is not None else "not listed"
        raise Problem("no_files", f"Play has not posted a report yet — they come 3–7 days late ({listed})")
    ratings = read("ratings", "ratings", "overview")
    crashes = read("crashes", "crashes", "overview")
    rating = play_last(ratings, "total average rating")
    out = dict(installs)
    out.update({
        "ok": True, "msg": "",
        "versions": play_versions(read("installs", "installs", "app_version", all_months=False)),
        "rating": rating[1] if rating else None,
        "crash28": play_sum(crashes, since, "daily crashes"),
        "anr28": play_sum(crashes, since, "daily anrs"),
    })
    return out


def main():
    import firebase_admin
    from firebase_admin import credentials, firestore

    s, project, email = session()
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    db = firestore.client()
    ref = db.collection("owner_stats").document("latest")
    old = ref.get().to_dict() or {}
    now = dt.datetime.now(dt.timezone.utc)
    # Shown on the owner-only setup card (never printed here): which email to
    # give access to, and the project for the "turn on the API" links.
    doc = {"at": now, "sa": email, "project": project}
    bad = 0
    for name, fn in (("ga", analytics), ("play", play)):
        try:
            doc[name] = fn(s)
            extra = ""
            if name == "ga":  # which named fields exist — no numbers
                ready = len(doc[name].get("dims") or [])
                note = doc[name].get("dims_note") or ""
                extra = f" (fields {ready}/{len(CUSTOM_DIMENSIONS)}{', ' + note if note else ''})"
            print(f"{name}: OK{extra}")
        except Problem as p:
            bad += 1
            kept = {k: v for k, v in (old.get(name) or {}).items() if k not in ("ok", "msg", "hint", "tried")}
            doc[name] = {**kept, "ok": False, "msg": p.code, "hint": p.hint[:200], "tried": now}
            print(f"{name}: NOT YET — {p.code}{' — ' + p.hint if p.hint else ''}")
        except Exception as e:  # noqa: BLE001 — one part failing must not stop the other
            bad += 1
            kept = {k: v for k, v in (old.get(name) or {}).items() if k not in ("ok", "msg", "hint", "tried")}
            doc[name] = {**kept, "ok": False, "msg": "error", "hint": type(e).__name__, "tried": now}
            print(f"{name}: ERROR — {type(e).__name__}")
    ref.set(doc)
    print(f"saved owner_stats/latest ({'all parts OK' if not bad else str(bad) + ' part(s) waiting — see Admin → 📊'})")
    # Waiting for the owner's setup is not a failure of the job.
    return 0


if __name__ == "__main__":
    sys.exit(main())
