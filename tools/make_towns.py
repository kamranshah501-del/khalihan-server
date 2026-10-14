"""
Town → district tables for second sources that name only the mandi (eNAM).

Reads GeoNames (https://www.geonames.org, CC BY 4.0) through the
cities.json package (github.com/lutangar/cities.json):

    python3 tools/make_towns.py /path/to/cities.json /path/to/admin2.json "Madhya Pradesh"
      → data/towns_madhya_pradesh.json   {"burhanpur": "Burhanpur", …}

Keys are town names in lower-case letters only; values are district names
as people write them (no accents, no "district").
"""
import json
import os
import re
import sys
import unicodedata

ADMIN1 = {  # GeoNames admin1 codes for India
    "Madhya Pradesh": "35", "Maharashtra": "16", "Gujarat": "09", "Karnataka": "19",
    "Telangana": "40", "Rajasthan": "24", "Uttar Pradesh": "36", "Chhattisgarh": "37",
}

# GeoNames district names → the names Indian price data uses.
RENAME = {"Narsimhapur": "Narsinghpur"}

# Old names and mandi towns GeoNames lacks (added by hand).
EXTRA = {
    "Madhya Pradesh": {"hoshangabad": "Narmadapuram", "eastnimar": "Khandwa", "westnimar": "Khargone",
                       "narsimhapur": "Narsinghpur", "pipariya": "Narmadapuram", "banapura": "Narmadapuram",
                       "khetia": "Barwani", "badwaha": "Khargone", "barwaha": "Khargone", "timarni": "Harda",
                       "sirali": "Harda", "khaknar": "Burhanpur", "balwada": "Khargone", "badnagar": "Ujjain",
                       "mahidpur": "Ujjain"},
}


def plain(s):
    return "".join(ch for ch in unicodedata.normalize("NFKD", s) if not unicodedata.combining(ch)).strip()


def key(s):
    return re.sub(r"[^a-z0-9]", "", plain(s).lower())


def district_name(raw):
    name = re.sub(r"\s+district$", "", plain(raw), flags=re.I).strip()
    return RENAME.get(name, name)


def main():
    cities_path, admin2_path, state = sys.argv[1], sys.argv[2], sys.argv[3]
    code = ADMIN1[state]
    cities = json.load(open(cities_path, encoding="utf-8"))
    admin2 = {a["code"]: a["name"] for a in json.load(open(admin2_path, encoding="utf-8"))}
    out = {}
    for d in admin2:
        if d.startswith(f"IN.{code}."):
            name = district_name(admin2[d])
            out[key(name)] = name  # the district's own name
    out.update(EXTRA.get(state, {}))
    for c in cities:
        if c.get("country") != "IN" or c.get("admin1") != code or not c.get("admin2"):
            continue
        d = admin2.get(f"IN.{code}.{c['admin2']}")
        if d:
            out.setdefault(key(c["name"]), district_name(d))
    slug = re.sub(r"[^a-z0-9]+", "_", state.lower()).strip("_")
    path = os.path.join(os.path.dirname(__file__), "..", "data", f"towns_{slug}.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(dict(sorted(out.items())), fh, ensure_ascii=False, indent=0)
        fh.write("\n")
    print(f"{len(out)} towns → {os.path.normpath(path)}")


if __name__ == "__main__":
    main()
