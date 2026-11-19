"""IMD weather warnings for farmers (owner, 19 Nov 2026: hail "ekdam perfect
chahiye", a main feature — "nahi to log bolenge useless hai, delete karo").

Why IMD and not the forecast models: on 30 Mar 2026, when hail hit Sakri,
Dhule and Satana, none of eight forecast models (Open-Meteo, ICON, ECMWF, GFS,
UKMO, JMA, GEM) put hail over Maharashtra, and across 35 districts × 60 days
of February–March they never did (app repo, tool/wx_replay). IMD's own press
release of 29 Mar 2026 said: "Isolated hailstorm activity likely over Madhya
Maharashtra and Marathawada on 30th & 31st March." Hail warnings come from
the people who issue them.

Two public IMD layers (GeoServer at reactjs.imd.gov.in — the maps behind
mausam.imd.gov.in), read every 10 minutes, without map shapes (~16 KB and
~380 KB):

  district_warnings_india   5-day district warnings from the Mumbai and Nagpur
                            centres, about twice a day. Day_1 is the issue
                            date. Codes per day, e.g. "4,5": 2 heavy rain,
                            4 thunderstorm & lightning, 5 hailstorm, 8 strong
                            surface winds, 9 heat wave, 12 cold wave, 14 ground
                            frost, 16 very heavy rain, 17 extremely heavy rain.
                            DayN_Color: 1 red, 2 orange, 3 yellow, 4 green.
  NowcastWarningDistrict    the next ~3 hours (toi → vupto, IST). Categories:
                            cat17 thunderstorms with hail, cat14 / cat15
                            severe / very severe thunderstorm (gusts 62–87 /
                            > 87 km/h), cat12 heavy rain > 15 mm/hr, cat4 /
                            cat9 light / moderate thunderstorm, cat11 / cat19
                            moderate / high lightning. Color: 1 green, 2
                            yellow, 3 orange, 4 red (the other way round).

The code names are IMD's own (mausam.imd.gov.in/responsive/
districtWiseWarningGIS.php and districtWiseNowcastGIS.php).

What reaches phones: one data push to topic wx_<state> with the warnings that
are new since the last pass, per district. The phone shows only its own
district's, with "स्रोत: IMD". Each (district, kind, day, source) goes once.
No farmer data is read or kept here.
"""
import json
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")
WFS = "https://reactjs.imd.gov.in/geoserver/imd/wfs"
STATE = "maharashtra"
TOPIC = f"wx_{STATE}"
TEST_TOPIC = "wx_test"

# IMD's spelling → the app's district key (assets/places/villages_mh.txt).
MH = {
    "AHMEDNAGAR": "ahmednagar", "AKOLA": "akola", "AMRAVATI": "amravati",
    "AURANGABAAD": "aurangabad", "AURANGABAD": "aurangabad", "BEED": "beed",
    "BHANDARA": "bhandara", "BULDHANA": "buldhana", "CHANDRAPUR": "chandrapur",
    "DHULE": "dhule", "GADCHIROLI": "gadchiroli", "GONDIA": "gondia",
    "HINGOLI": "hingoli", "JALGAON": "jalgaon", "JALNA": "jalna",
    "KOLHAPUR": "kolhapur", "LATUR": "latur", "MUMBAI CITY": "mumbai",
    "MUMBAI SUBURBAN": "mumbai", "NAGPUR": "nagpur", "NANDED": "nanded",
    "NANDURBAR": "nandurbar", "NASHIK": "nashik", "OSMANABAD": "osmanabad",
    "PALGHAR": "palghar", "PARBHANI": "parbhani", "PUNE": "pune",
    "RAIGAD": "raigad", "RATNAGIRI": "ratnagiri", "SANGLI": "sangli",
    "SATARA": "satara", "SINDHUDURG": "sindhudurg", "SOLAPUR": "solapur",
    "THANE": "thane", "WARDHA": "wardha", "WASHIM": "washim",
    "YAVATMAL": "yavatmal",
}
# Maharashtra's box: keeps Bihar's Aurangabad (24.7° N) out of the 5-day
# layer, which carries no state name.
BOX = (15.5, 22.2, 72.5, 81.0)  # lat min, lat max, lon min, lon max

# Most serious first — the same kinds and order as the app (WeatherWarning).
KINDS = ["hail", "storm", "rain", "wind", "heat", "frost"]


def _get(params):
    url = WFS + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Khalihan/1.0 (farm weather warnings)"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def fetch():
    """(nowcast features, 5-day features) — properties and bbox only."""
    base = {"service": "WFS", "version": "1.0.0", "request": "GetFeature", "outputFormat": "application/json"}
    nowcast = _get({**base, "typeName": "imd:NowcastWarningDistrict",
                    "CQL_FILTER": "State='MAHARASHTRA'",
                    "propertyName": "District,State,Date,toi,vupto,Color,update_time,"
                                    + ",".join(f"cat{i}" for i in range(1, 20))})
    names = ",".join("'" + n + "'" for n in sorted(MH))
    fiveday = _get({**base, "typeName": "imd:district_warnings_india",
                    "CQL_FILTER": f"District IN ({names})",
                    "propertyName": "ID,District,Date,UTC,Day_1,Day_2,Day_3,Day1_Color,Day2_Color,Day3_Color,updated_at"})
    return nowcast.get("features") or [], fiveday.get("features") or []


def _in_mh(feature):
    b = feature.get("bbox")
    if not b or len(b) < 4:
        return True  # no box: the name list decides
    lat = (b[1] + b[3]) / 2
    lon = (b[0] + b[2]) / 2
    return BOX[0] <= lat <= BOX[1] and BOX[2] <= lon <= BOX[3]


def _num(v):
    try:
        return int(v or 0)
    except (TypeError, ValueError):
        return 0


def _day(s):
    try:
        return date.fromisoformat(str(s)[:10])
    except ValueError:
        return None


def _hhmm(s):
    s = str(s or "").strip()
    return f"{s[:2]}:{s[2:4]}" if len(s) == 4 and s.isdigit() else ""


def fiveday_kinds(codes, color):
    """Kinds worth waking a farmer for, from one day's IMD codes and colour
    (1 red, 2 orange, 3 yellow, 4 green). Hail at any colour; thunderstorm,
    heavy rain and wind only orange or red — yellow thunderstorms are near
    daily in May, and a warning that comes every day is soon turned off."""
    c = {x.strip() for x in str(codes or "").split(",") if x.strip()}
    strong = color in (1, 2)
    out = []
    if "5" in c and color in (1, 2, 3):
        out.append("hail")
    if "4" in c and strong:
        out.append("storm")
    if "16" in c or "17" in c or ("2" in c and strong):
        out.append("rain")
    if "8" in c and strong:
        out.append("wind")
    if "9" in c:
        out.append("heat")
    if "14" in c:
        out.append("frost")
    return out


def nowcast_kinds(p):
    """Kinds from one district's nowcast row (Color 1 green … 4 red)."""
    color = _num(p.get("Color"))
    cat = {i: _num(p.get(f"cat{i}")) for i in range(1, 20) if i != 16}
    out = []
    if cat[17]:
        out.append("hail")
    thunder = cat[4] or cat[9] or cat[11] or cat[19]
    if cat[14] or cat[15] or (thunder and color >= 3):
        out.append("storm")
    if cat[12] and color >= 3:
        out.append("rain")
    return out


def level5(color):
    return {1: "r", 2: "o", 3: "y"}.get(color, "")


def levelnc(color):
    return {4: "r", 3: "o", 2: "y"}.get(color, "")


def plan(nowcast, fiveday, now):
    """Every warning in force for Maharashtra now, most serious first per
    district: dicts {d: district key, k: kind, l: r/o/y, day: ISO date,
    s: "nc" (next hours) or "5d", u: valid until "HH:MM" (nowcast)}."""
    now = now.astimezone(IST)
    today = now.date()
    items = []

    for f in nowcast:
        p = f.get("properties") or {}
        key = MH.get(str(p.get("District") or "").strip().upper())
        if not key or str(p.get("State") or "").upper() != "MAHARASHTRA":
            continue
        if _day(p.get("Date")) != today:
            continue  # yesterday's nowcast is no warning
        until = _hhmm(p.get("vupto"))
        if until and until <= now.strftime("%H:%M") and _hhmm(p.get("toi")) < until:
            continue  # already over
        for k in nowcast_kinds(p):
            items.append({"d": key, "k": k, "l": levelnc(_num(p.get("Color"))), "day": today.isoformat(), "s": "nc", "u": until})

    for f in fiveday:
        p = f.get("properties") or {}
        key = MH.get(str(p.get("District") or "").strip().upper())
        if not key or not _in_mh(f):
            continue
        issued = _day(p.get("Date"))
        if not issued or (today - issued).days > 2:
            continue  # an old bulletin left on the map
        for n in (1, 2, 3):
            day = issued + timedelta(days=n - 1)
            if day < today or day > today + timedelta(days=1):
                continue  # only today and tomorrow
            color = _num(p.get(f"Day{n}_Color"))
            for k in fiveday_kinds(p.get(f"Day_{n}"), color):
                items.append({"d": key, "k": k, "l": level5(color), "day": day.isoformat(), "s": "5d", "u": ""})

    # One row per (district, kind, day, source); Mumbai City and Suburban
    # are one district in the app.
    seen = {}
    for it in items:
        sig = (it["d"], it["k"], it["day"], it["s"])
        old = seen.get(sig)
        if old is None or _rank(it["l"]) < _rank(old["l"]):
            seen[sig] = it
    return sorted(seen.values(), key=lambda it: (it["d"], KINDS.index(it["k"]), it["day"], it["s"]))


def _rank(level):
    return {"r": 0, "o": 1, "y": 2}.get(level, 3)


def sig(it):
    return f"{it['d']}|{it['k']}|{it['day']}|{it['s']}"


def payload(items, test=False):
    """FCM data (strings only, well under 4 KB): w = [[district, kind, level,
    day, source, until], …]."""
    data = {
        "type": "imd",
        "v": "1",
        "state": STATE,
        "w": json.dumps([[it["d"], it["k"], it["l"], it["day"], it["s"], it["u"]] for it in items], separators=(",", ":")),
    }
    if test:
        data["test"] = "1"
    return data


def fake(now):
    """For the test push: hail now, in every Maharashtra district."""
    today = now.astimezone(IST).date().isoformat()
    until = (now.astimezone(IST) + timedelta(hours=3)).strftime("%H:%M")
    return [{"d": d, "k": "hail", "l": "o", "day": today, "s": "nc", "u": until} for d in sorted(set(MH.values()))]


def run(db, now, send=None, fetched=None):
    """The 10-minute pass. Sends what is new, remembers what it sent (memory:
    Firestore watcher/imd_warnings). Returns one line."""
    nowcast, fiveday = fetched if fetched is not None else fetch()
    items = plan(nowcast, fiveday, now)
    ref = db.collection("watcher").document("imd_warnings")
    snap = ref.get()
    mem = snap.to_dict() if snap.exists else {}
    sent = dict(mem.get("sent") or {})
    fresh = [it for it in items if sig(it) not in sent]
    line = f"IMD: {len(nowcast)} nowcast + {len(fiveday)} district rows · {len(items)} warnings in force · {len(fresh)} new"
    if fresh and send is not None:
        send(TOPIC, payload(fresh))
        line += f" → pushed to {TOPIC}"
    stamp = now.astimezone(IST).isoformat(timespec="minutes")
    for it in fresh:
        sent[sig(it)] = stamp
    keep = (now.astimezone(IST).date() - timedelta(days=3)).isoformat()
    sent = {k: v for k, v in sent.items() if k.split("|")[2] >= keep}
    ref.set({"at": now, "sent": sent, "now": [sig(it) for it in items], "line": line})
    return line
