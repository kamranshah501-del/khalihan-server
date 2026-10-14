"""
Prices from eNAM (National Agriculture Market, enam.gov.in) — a second,
independent source for states other than Maharashtra while data.gov.in is
down. Madhya Pradesh first (owner, 13 Oct 2026).

How the site's own "Live Price" page reads its data (see SOURCES.md):
  GET  /dashboard/live_price                → the session cookie
  POST /Liveprice_ctrl/states_name_live     → the state names as eNAM writes them
  POST /Liveprice_ctrl/trade_data_list      → language, stateName, fromDate, toDate
                                              (YYYY-MM-DD, the last 7 days only)
Rows: state, apmc, commodity, min_price, modal_price, max_price,
commodity_arrivals, commodity_traded, Commodity_Uom, created_at.

eNAM names the mandi (APMC) but not its district, so the district comes from
the town table in data/towns_<state>.json (GeoNames; tools/make_towns.py).
A mandi we can't place keeps an empty district: the app still counts it for
the whole state.

Output rows use the same keys as the data.gov.in API, so the rest of the job
treats them exactly like government rows. Gentle: three requests a run.
"""

import json
import os
import re
from datetime import datetime, timedelta, timezone

import requests

BASE = "https://enam.gov.in"
PAGES = [f"{BASE}/dashboard/live_price", f"{BASE}/web/dashboard/live_price"]
TIMEOUT = 45
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
}
IST = timezone(timedelta(hours=5, minutes=30))
MIN_PRICE = 20  # under ₹20 a quintal is always a data error


def _key(text):
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def _towns(state):
    slug = re.sub(r"[^a-z0-9]+", "_", state.lower()).strip("_")
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", f"towns_{slug}.json")
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except OSError:
        return {}


def _district(apmc, towns):
    """'Burhanpur' / 'Burhanpur APMC' / 'KHANDWA(F&V)' → its district, or ''."""
    name = re.sub(r"\(.*?\)", " ", apmc or "")
    name = re.sub(r"\b(apmc|mandi|krishi upaj mandi|samiti|market yard|sub ?yard)\b", " ", name, flags=re.I)
    k = _key(name)
    if k in towns:
        return towns[k]
    # "Sanawad Khargone" → try each word on its own
    for word in re.split(r"[\s,/-]+", name):
        if _key(word) in towns:
            return towns[_key(word)]
    return ""


def _number(value):
    try:
        n = float(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return None
    return n if n == n else None  # NaN check


def _title(text):
    """'BENGAL GRAM(GRAM)(WHOLE)' → 'Bengal Gram(Gram)(Whole)' (Agmarknet's style)."""
    text = re.sub(r"\s+", " ", (text or "").strip())
    return text.title() if text.isupper() else text


def _date(created):
    """'2026-10-13 10:22:11' or '13-10-2026' → '13/10/2026' (the API's style)."""
    s = str(created or "").strip()
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return f"{m.group(3)}/{m.group(2)}/{m.group(1)}"
    m = re.match(r"(\d{1,2})[-/](\d{1,2})[-/](\d{4})", s)
    if m:
        return f"{int(m.group(1)):02d}/{int(m.group(2)):02d}/{m.group(3)}"
    return None


def _rows_in(payload):
    """The list of rows, wherever the answer keeps it."""
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for k in ("data", "rows", "records", "result", "aaData"):
            if isinstance(payload.get(k), list):
                return payload[k]
        for v in payload.values():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                return v
    return []


def _open_session():
    session = requests.Session()
    session.headers.update(HEADERS)
    last = None
    for page in PAGES:
        try:
            r = session.get(page, timeout=TIMEOUT, headers={"Accept": "text/html"})
            if r.ok:
                session.headers["Referer"] = page
                return session
            last = f"HTTP {r.status_code} on {page}"
        except Exception as error:  # noqa: BLE001 — any failure means "try the next"
            last = f"{type(error).__name__} on {page}"
    raise RuntimeError(f"eNAM page did not open ({last})")


def _state_name(session, state, log):
    """eNAM's own spelling of the state ('MADHYA PRADESH'?)."""
    try:
        r = session.post(f"{BASE}/Liveprice_ctrl/states_name_live", data={"language": "en"}, timeout=TIMEOUT)
        if r.ok:
            for item in _rows_in(r.json()):
                name = item.get("state_name") or item.get("state") or item.get("name") if isinstance(item, dict) else item
                if name and _key(str(name)) == _key(state):
                    return str(name)
    except Exception as error:  # noqa: BLE001
        log(f"    eNAM: state list unavailable ({type(error).__name__}); using '{state}'")
    return state


def fetch_rows(state, log=print):
    """The last 7 days of eNAM prices for [state], as data.gov.in-style rows."""
    session = _open_session()
    name = _state_name(session, state, log)
    today = datetime.now(IST).date()
    start = today - timedelta(days=6)
    # The page's exact spelling isn't known from here: try the likely forms,
    # at most three requests, and keep what the server said for the status.
    tries = [
        (name, start.isoformat(), today.isoformat()),
        (name.upper(), start.isoformat(), today.isoformat()),
        (name, start.strftime("%d-%m-%Y"), today.strftime("%d-%m-%Y")),
    ]
    payload, said = None, []
    for state_name, start_s, end_s in dict.fromkeys(tries):
        form = {"language": "en", "stateName": state_name, "fromDate": start_s, "toDate": end_s}
        r = session.post(f"{BASE}/Liveprice_ctrl/trade_data_list", data=form, timeout=TIMEOUT)
        body = re.sub(r"\s+", " ", r.text or "")[:120]
        if not r.ok:
            said.append(f"HTTP {r.status_code} ({state_name}, {start_s}){': ' + body if body else ''}")
            continue
        try:
            payload = r.json()
        except ValueError:
            said.append(f"not JSON ({state_name}, {start_s}): {body}")
            continue
        if _rows_in(payload):
            break
        said.append(f"no rows ({state_name}, {start_s})")
    if payload is None:
        raise RuntimeError("eNAM trade data: " + " | ".join(said))
    raw = _rows_in(payload)
    towns = _towns(state)
    out, unplaced, skipped_unit = [], set(), 0
    for row in raw:
        if not isinstance(row, dict):
            continue
        unit = str(row.get("Commodity_Uom") or row.get("commodity_uom") or "").lower()
        if unit and "qui" not in unit:
            skipped_unit += 1  # per kg / per piece rows: not comparable with the rest
            continue
        modal = _number(row.get("modal_price"))
        low = _number(row.get("min_price"))
        high = _number(row.get("max_price"))
        crop = _title(row.get("commodity"))
        apmc = re.sub(r"\s+", " ", str(row.get("apmc") or "")).strip()
        date = _date(row.get("created_at") or row.get("date"))
        if not crop or not apmc or not date or modal is None or modal < MIN_PRICE:
            continue
        district = _district(apmc, towns)
        if not district:
            unplaced.add(apmc)
        arrivals = _number(row.get("commodity_arrivals"))
        out.append({
            "arrivals": arrivals if arrivals and arrivals > 0 else None,
            "commodity": crop,
            "market": _title(apmc),
            "state": state,
            "district": district,
            "variety": "",
            "min_price": low if low is not None else modal,
            "max_price": high if high is not None else modal,
            "modal_price": modal,
            "arrival_date": date,
        })
    log(f"  {state}: eNAM gave {len(raw)} rows, kept {len(out)}"
        + (f"; {skipped_unit} not per quintal" if skipped_unit else "")
        + (f"; no district for {len(unplaced)} mandi(s): {', '.join(sorted(unplaced)[:8])}" if unplaced else ""))
    return out


# States read from eNAM when data.gov.in is down (one at a time, gently).
ENAM_STATES = ["Madhya Pradesh"]
