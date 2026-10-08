"""
Maharashtra prices from MSAMB (Maharashtra State Agricultural Marketing Board).

A second, independent source for Maharashtra. APMCs upload their daily
arrivals and prices straight to msamb.com, on servers that have nothing to
do with data.gov.in — so when the national API goes down, Maharashtra still
has fresh prices.

Output rows use the same keys as the data.gov.in API, so the rest of the
job treats them exactly like government API rows.

How it reads the site (found by reading the site's own ArrivalPriceInfo.js):
  /ApmcDetail/DataGridBind?commodityCode=null&apmcCode=<APMC>
      one mandi, every crop, last 7 days
  /ApmcDetail/GetArrivalPriceInfoByCommodityWise?commodityCode=null&apmcCode=<DISTRICT>
      one district, every crop, last 7 days
Both return HTML table rows: a date row (<td colspan>DD/MM/YYYY</td>) followed
by rows of: name | variety | unit | arrivals | min | max | modal.
Names come in Marathi; the tables below turn them into the names the app uses.
"""

import html
import re
import time
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://www.msamb.com"
PAGE = f"{BASE}/ApmcDetail/APMCPriceInformation"
TIMEOUT = 45
KEEP_DAYS = 5  # enough for a mandi's last few days in the app

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "X-Requested-With": "XMLHttpRequest",
    "Referer": PAGE,
}

# The pilot district: every mandi on its own, because farmers here choose
# between Pachora and Chopda, not between "Jalgaon" and somewhere else.
JALGAON_APMCS = {
    "061": "Amalner",
    "062": "Chalisgaon",
    "06201": "Chalisgaon (Nagad Road)",
    "025": "Chopda",
    "016": "Jalgaon",
    "01601": "Jalgaon (Masawat)",
    "151": "Dharangaon",
    "064": "Pachora",
    "152": "Parola",
    "149": "Bhusawal",
    "153": "Yawal",
    "104": "Raver",
}

# MSAMB district code -> English district name. The app matches district
# names loosely, so the common spelling is enough.
DISTRICTS = {
    "32": "Akola", "33": "Amravati", "16": "Ahmednagar", "20": "Kolhapur",
    "38": "Gadchiroli", "44": "Gondia", "37": "Chandrapur", "25": "Aurangabad",
    "18": "Jalgaon", "27": "Jalna", "14": "Thane", "30": "Osmanabad",
    "17": "Dhule", "41": "Nandurbar", "29": "Nanded", "39": "Nagpur",
    "19": "Nashik", "31": "Parbhani", "45": "Palghar", "21": "Pune",
    "26": "Beed", "34": "Buldhana", "36": "Bhandara", "11": "Mumbai",
    "35": "Yavatmal", "13": "Ratnagiri", "12": "Raigad", "28": "Latur",
    "40": "Wardha", "42": "Washim", "22": "Sangli", "23": "Satara",
    "24": "Solapur", "43": "Hingoli",
}

# MSAMB's Marathi crop name -> the Agmarknet name the app already uses, so
# a farmer's pinned crops and alerts carry straight over.
CROPS = {
    "मका": "Maize", "कांदा": "Onion", "गहू": "Wheat", "ज्वारी": "Jowar(Sorghum)",
    "बाजरी": "Bajra(Pearl Millet/Cumbu)", "कापूस": "Cotton", "सोयाबिन": "Soyabean",
    "हरभरा": "Bengal Gram(Gram)(Whole)", "तूर": "Arhar (Tur/Red Gram)(Whole)",
    "मूग": "Green Gram (Moong)(Whole)", "उडीद": "Black Gram (Urd Beans)(Whole)",
    "मसूर": "Lentil (Masur)(Whole)", "भुईमुग शेंग (सुकी)": "Groundnut",
    "सुर्यफुल": "Sunflower", "करडई": "Safflower", "तील": "Sesamum(Sesame,Gingelly,Til)",
    "मोहरी": "Mustard", "एरंडी": "Castor Seed", "भात - धान": "Paddy(Dhan)(Common)",
    "तांदूळ": "Rice", "नाचणी/ नागली": "Ragi (Finger Millet)", "गुळ": "Gur(Jaggery)",
    "हळद/ हळकुंड": "Turmeric", "जिरे": "Cummin Seed(Jeera)", "मिरची (लाल)": "Dry Chillies",
    "मिरची (हिरवी)": "Green Chilli", "टोमॅटो": "Tomato", "बटाटा": "Potato",
    "लसूण": "Garlic", "आले": "Ginger(Green)", "वांगी": "Brinjal", "कोबी": "Cabbage",
    "फ्लॉवर": "Cauliflower", "भेडी": "Bhindi(Ladies Finger)", "गवार": "Cluster beans",
    "कारली": "Bitter gourd", "दुधी भोपळा": "Bottle gourd", "दोडका (शिराळी)": "Ridgeguard(Tori)",
    "काकडी": "Cucumbar(Kheera)", "गाजर": "Carrot", "मुळा": "Raddish", "बीट": "Beetroot",
    "कोथिंबिर": "Coriander(Leaves)", "मेथी भाजी": "Methi(Leaves)", "पालक": "Spinach",
    "शेवगा": "Drumstick", "ढोवळी मिरची": "Capsicum", "घेवडा": "Beans", "मटार": "Peas Wet",
    "वाटाणा": "Peas(Dry)", "भोपळा": "Pumpkin", "पडवळ": "Snakeguard",
    "तोंडली": "Little gourd (Kundru)", "सुरण": "Elephant Yam (Suran)", "रताळी": "Sweet Potato",
    "केळी": "Banana", "डाळींब": "Pomegranate", "द्राक्ष": "Grapes", "संत्री": "Orange",
    "मोसंबी": "Mousambi(Sweet Lime)", "पपई": "Papaya", "पेरु": "Guava",
    "चिकु": "Chikoos(Sapota)", "सिताफळ": "Custard Apple (Sharifa)", "लिंबू": "Lemon",
    "कलिंगड": "Water Melon", "टरबूज": "Water Melon", "खरबुज": "Karbuja(Musk Melon)",
    "सफरचंद": "Apple", "अननस": "Pineapple", "बोर": "Ber(Zizyphus/Borehannu)",
    "आवळा": "Amla(Nelli Kai)", "चिंच": "Tamarind Fruit", "नारळ": "Coconut",
    "शहाळे": "Tender Coconut", "सुपारी": "Arecanut(Betelnut/Supari)", "वेलची": "Cardamoms",
    "कोहळा": "Ashgourd", "ढेमसे": "Tinda", "पुदिना": "Mint(Pudina)",
    "उडीद डाळ": "Black Gram Dal (Urd Dal)", "तूर डाळ": "Arhar Dal(Tur Dal)",
    "मूग डाळ": "Green Gram Dal (Moong Dal)", "हरभरा डाळ": "Bengal Gram Dal (Chana Dal)",
    "मसूर डाळ": "Masur Dal", "साखर": "Sugar", "चवळी (शेंगा)": "Cowpea(Veg)",
    "चवळी बी": "Cowpea (Lobia/Karamani)", "कैरी": "Mango (Raw-Ripe)",
}

QUINTAL = "क्विंटल"
_DATE_ROW = re.compile(r"<td[^>]*colspan[^>]*>\s*(\d{1,2}/\d{1,2}/\d{4})\s*</td>", re.I)
_ROW = re.compile(r"<tr[^>]*>(.*?)</tr>", re.S | re.I)
_CELL = re.compile(r"<td[^>]*>(.*?)</td>", re.S | re.I)


def _clean(text):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", text))).strip()


def _number(text):
    try:
        return float(text.replace(",", ""))
    except ValueError:
        return 0.0


def parse_rows(page):
    """(DD/MM/YYYY, name, variety, unit, arrivals, min, max, modal) for each row."""
    out = []
    date = None
    for row in _ROW.findall(page or ""):
        found = _DATE_ROW.search(row)
        if found:
            date = found.group(1)
            continue
        cells = [_clean(c) for c in _CELL.findall(row)]
        if date and len(cells) >= 7:
            name, variety, unit = cells[0], cells[1], cells[2]
            arrivals, low, high, modal = (_number(c) for c in cells[3:7])
            out.append((date, name, variety, unit, arrivals, low, high, modal))
    return out


def _recent(rows):
    """Only the newest few report dates — enough for today and the change."""
    def key(d):
        dd, mm, yy = d.split("/")
        return (yy, mm.zfill(2), dd.zfill(2))
    dates = sorted({r[0] for r in rows}, key=key, reverse=True)[:KEEP_DAYS]
    return [r for r in rows if r[0] in dates]


def _as_api_row(date, crop, market, district, variety, low, high, modal, arrivals=None):
    return {
        "arrivals": arrivals,
        "commodity": crop,
        "market": market,
        "state": "Maharashtra",
        "district": district,
        "variety": "" if variety in ("----", "-") else variety,
        "min_price": low,
        "max_price": high,
        "modal_price": modal,
        "arrival_date": date,
    }


def _get(session, path, code):
    params = {"commodityCode": "null", "apmcCode": code}
    for attempt in range(1, 3):
        try:
            response = session.get(f"{BASE}{path}", params=params, timeout=TIMEOUT)
            response.raise_for_status()
            text = response.text
            return "" if "No record found" in text else text
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3)
    return ""


def _to_rows(parsed, market, district):
    rows = []
    for date, name, variety, unit, arrivals, low, high, modal in _recent(parsed):
        crop = CROPS.get(name.strip())
        if not crop or unit != QUINTAL or modal <= 0:
            continue
        rows.append(_as_api_row(date, crop, market, district, variety, low, high, modal,
                                arrivals if arrivals > 0 else None))
    return rows


def fetch_rows(log=print, districts=True):
    """Every usable Maharashtra row MSAMB has right now. [districts] False:
    only the Jalgaon mandis, one by one (12 small requests) — enough to
    cross-check data.gov.in's prices for the same mandis."""
    session = requests.Session()
    session.headers.update(HEADERS)
    try:
        session.get(PAGE, timeout=TIMEOUT)  # the site expects a visitor first
    except Exception as error:
        log(f"  MSAMB: site unreachable — {error}")
        return []

    def apmc(item):
        code, name = item
        try:
            return _to_rows(parse_rows(_get(session, "/ApmcDetail/DataGridBind", code)), name, "Jalgaon")
        except Exception as error:
            log(f"  MSAMB: {name} failed — {error}")
            return []

    def district(item):
        code, name = item
        if name == "Jalgaon":
            return []  # covered mandi by mandi above
        try:
            page = _get(session, "/ApmcDetail/GetArrivalPriceInfoByCommodityWise", code)
            return _to_rows(parse_rows(page), f"{name} (district)", name)
        except Exception as error:
            log(f"  MSAMB: {name} district failed — {error}")
            return []

    with ThreadPoolExecutor(max_workers=4) as pool:
        mandi_rows = [r for chunk in pool.map(apmc, JALGAON_APMCS.items()) for r in chunk]
        district_rows = (
            [r for chunk in pool.map(district, DISTRICTS.items()) for r in chunk] if districts else []
        )

    if districts:
        log(f"  MSAMB: {len(mandi_rows)} rows from {len(JALGAON_APMCS)} Jalgaon mandis, "
            f"{len(district_rows)} rows from {len(DISTRICTS) - 1} other districts")
    else:
        log(f"  MSAMB: {len(mandi_rows)} rows from {len(JALGAON_APMCS)} Jalgaon mandis (cross-check)")
    return mandi_rows + district_rows


def fetch_mandi_rows(log=print):
    """Only the Jalgaon mandis — for checking the national feed against."""
    return fetch_rows(log=log, districts=False)
