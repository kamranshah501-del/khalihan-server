"""Which forecast comes closer to what IMD measured: Open-Meteo (today's
source, free = non-commercial) or Google's Weather API (India: 70,000 calls a
month free, then $0.06 per 1,000) — owner, 19 Nov 2026 17:08: "paid plan ke
liye OK"; budget ₹800–1,000 a month.

Inside the 10-minute tick, twice a day:
  morning (09:15–11:50 IST): IMD's 03 UTC SYNOP at ~38 Maharashtra
      observatories — the night's minimum and the 24-hour rain to 08:30 IST —
      and both forecasts for today and tomorrow at the same points
      (Open-Meteo: 1 call for all; Google: 1 call per station, ~1,150 a month);
  evening (18:30–20:50 IST): IMD's 12 UTC SYNOP — the day's maximum.
Kept in Firestore wx_compare/{YYYY-MM-DD}; the score after 7 days:
tools/wx_compare_report.py. Google signs in as the function's own service
account (OAuth, no API key); until the owner switches the Weather API on, its
part records the error and Open-Meteo's goes on.
"""
import json
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")
WFS = "https://reactjs.imd.gov.in/geoserver/imd/wfs"

# IMD SYNOP observatories in Maharashtra (station_id: name), read 19 Nov 2026.
STATIONS = {
    43009: "Ahmednagar", 42933: "Akola", 43058: "Alibag", 42937: "Amravati", 43014: "Aurangabad",
    43069: "Baramati", 43011: "Beed", 42946: "Brahmapuri", 42931: "Buldhana", 43029: "Chandrapur",
    43001: "Dahanu", 42947: "Gadchiroli", 42871: "Gondia", 43109: "Harnai", 42851: "Jalgaon",
    43071: "Jeur", 43157: "Kolhapur", 42925: "Malegaon", 43057: "Mumbai-Colaba", 43003: "Mumbai-Santacruz",
    42867: "Nagpur", 43021: "Nanded", 42846: "Nandurbar", 42921: "Nashik", 43075: "Osmanabad",
    43017: "Parbhani", 43063: "Pune-Shivajinagar", 43110: "Ratnagiri", 43158: "Sangli", 43113: "Satara",
    43117: "Solapur", 43005: "Thane-Belapur", 43076: "Udgir", 42939: "Wardha", 42935: "Washim",
    42943: "Yavatmal",
}


def _json(url, headers=None, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": "Khalihan/1.0", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def synop():
    """Latest SYNOP row per Maharashtra station: {id: properties}."""
    ids = ",".join(str(i) for i in STATIONS)
    q = urllib.parse.urlencode({
        "service": "WFS", "version": "1.0.0", "request": "GetFeature", "outputFormat": "application/json",
        "typeName": "imd:synop_data_layer", "CQL_FILTER": f"station_id IN ({ids})",
    })
    out = {}
    for f in _json(f"{WFS}?{q}").get("features") or []:
        p = f.get("properties") or {}
        if p.get("station_id") in STATIONS:
            out[p["station_id"]] = p
    return out


def _num(v):
    try:
        return None if v is None or v == "" else round(float(v), 1)
    except (TypeError, ValueError):
        return None


def observed(rows, day, utc):
    """{station: values} from rows of [day] at [utc] (3: min + 24 h rain; 12: max)."""
    out = {}
    for sid, p in rows.items():
        if str(p.get("dat") or "")[:10] != day or int(p.get("utc") or -1) != utc:
            continue
        if utc == 3:
            out[str(sid)] = {"tmin": _num(p.get("min")), "rain24": _num(p.get("24hrlyrain"))}
        else:
            out[str(sid)] = {"tmax": _num(p.get("max"))}
    return out


def points(rows):
    return {sid: (float(p["latitude1"]), float(p["longitude1"])) for sid, p in rows.items()
            if p.get("latitude1") and p.get("longitude1")}


def open_meteo(pts):
    """Today and tomorrow, IST days: {station: [[tmax, tmin, rain], [..]]}."""
    sids = list(pts)
    q = urllib.parse.urlencode({
        "latitude": ",".join(str(pts[s][0]) for s in sids),
        "longitude": ",".join(str(pts[s][1]) for s in sids),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "Asia/Kolkata", "forecast_days": 2,
    })
    data = _json(f"https://api.open-meteo.com/v1/forecast?{q}", timeout=60)
    if isinstance(data, dict):
        data = [data]
    out = {}
    for sid, d in zip(sids, data):
        dl = d.get("daily") or {}
        out[str(sid)] = [[_num(dl["temperature_2m_max"][i]), _num(dl["temperature_2m_min"][i]), _num(dl["precipitation_sum"][i])]
                         for i in range(min(2, len(dl.get("time") or [])))]
    return out


def _google_headers():
    import google.auth
    import google.auth.transport.requests
    creds, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    creds.refresh(google.auth.transport.requests.Request())
    return {"Authorization": f"Bearer {creds.token}", "X-Goog-User-Project": project}


def google(pts):
    """Google's days (07:00–07:00 local): {station: [[tmax, tmin, rain day+night,
    thunder % max], [..]]}, or {"error": "..."}."""
    try:
        h = _google_headers()
    except Exception as e:  # noqa: BLE001
        return {"error": f"sign-in: {type(e).__name__}: {e}"[:300]}
    out = {}
    for sid, (lat, lon) in pts.items():
        q = urllib.parse.urlencode({"location.latitude": lat, "location.longitude": lon, "days": 2})
        try:
            d = _json(f"https://weather.googleapis.com/v1/forecast/days:lookup?{q}", headers=h)
        except urllib.error.HTTPError as e:
            return {"error": f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}"}
        rows = []
        for day in (d.get("forecastDays") or [])[:2]:
            def part(name, key):
                f = day.get(name) or {}
                if key == "qpf":
                    return ((f.get("precipitation") or {}).get("qpf") or {}).get("quantity") or 0
                return f.get("thunderstormProbability") or 0
            rows.append([
                _num((day.get("maxTemperature") or {}).get("degrees")),
                _num((day.get("minTemperature") or {}).get("degrees")),
                _num(part("daytimeForecast", "qpf") + part("nighttimeForecast", "qpf")),
                max(part("daytimeForecast", "t"), part("nighttimeForecast", "t")),
            ])
        out[str(sid)] = rows
    return out


def run(db, now):
    """Twice a day; every other tick returns at once. One line."""
    ist = now.astimezone(IST)
    day = ist.date().isoformat()
    hm = ist.strftime("%H:%M")
    ref = db.collection("watcher").document("wx_compare")
    snap = ref.get()
    mem = snap.to_dict() if snap.exists else {}
    doc = db.collection("wx_compare").document(day)

    # IMD's layer keeps only each station's latest report: 03 UTC shows from
    # about 09:00 IST until 06 UTC replaces it near 12:00; 12 UTC from about
    # 18:00 until 15 UTC near 21:00.
    if "09:15" <= hm < "11:50" and mem.get("am") != day:
        rows = synop()
        obs = observed(rows, day, 3)
        if not obs and hm < "11:30":
            return "wx compare: waiting for IMD's 03 UTC observations"
        pts = points(rows)
        try:
            om = open_meteo(pts)
        except Exception as e:  # noqa: BLE001
            om = {"error": f"{type(e).__name__}: {e}"[:300]}
        g = google(pts)
        doc.set({"am_at": now, "obs_am": obs, "om": om, "g": g}, merge=True)
        ref.set({"am": day}, merge=True)
        return f"wx compare {day} morning: IMD {len(obs)} stations, Open-Meteo {len(om) if 'error' not in om else om['error']}, Google {len(g) if 'error' not in g else g['error'][:80]}"

    if "18:30" <= hm < "20:50" and mem.get("pm") != day:
        obs = observed(synop(), day, 12)
        if not obs and hm < "20:30":
            return "wx compare: waiting for IMD's 12 UTC observations"
        doc.set({"pm_at": now, "obs_pm": obs}, merge=True)
        ref.set({"pm": day}, merge=True)
        return f"wx compare {day} evening: IMD max at {len(obs)} stations"
    return ""
