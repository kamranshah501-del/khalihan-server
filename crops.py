"""One name per crop, whichever source a row came from.

data.gov.in renamed its commodities in 2026 ("Lentil(Masur)(Whole)",
"Red gram/Arhar/Tur(whole)") while Maharashtra's board (msamb.py) and every
farmer's saved history use the classic Agmarknet names ("Lentil (Masur)(Whole)",
"Arhar (Tur/Red Gram)(Whole)"). Phones took them for two crops: the same crop
twice in the list, one of them stuck on an old date (owner's screenshot,
26 Oct 2026). Every row goes through canon() before it is saved, so phones
only ever see the classic name. The app has the same table
(lib/l10n/crop_canon.dart) for what phones saved before.
"""
import re

# Classic spelling of crops whose new spelling differs only in spaces or
# capitals (the comparison ignores both).
CLASSIC = [
    "Arhar (Tur/Red Gram)(Whole)", "Arhar Dal(Tur Dal)",
    "Bengal Gram(Gram)(Whole)", "Bengal Gram Dal (Chana Dal)",
    "Black Gram (Urd Beans)(Whole)", "Black Gram Dal (Urd Dal)",
    "Green Gram (Moong)(Whole)", "Green Gram Dal (Moong Dal)",
    "Lentil (Masur)(Whole)", "Masur Dal",
    "Cowpea (Lobia/Karamani)", "Cowpea(Veg)",
    "Custard Apple (Sharifa)", "Little gourd (Kundru)",
    "Mango (Raw-Ripe)", "Ragi (Finger Millet)",
    "Paddy(Dhan)(Common)", "Bajra(Pearl Millet/Cumbu)", "Jowar(Sorghum)",
    "Sesamum(Sesame,Gingelly,Til)", "Cucumbar(Kheera)", "Bhindi(Ladies Finger)",
    "Ridgeguard(Tori)", "Cluster beans", "Peas Wet", "Pumpkin", "Lemon",
    "Dry Chillies", "Groundnut", "Sweet Corn",
]

# New names for the same crop (compared without spaces, brackets or capitals).
ALIASES = {
    "Red gram/Arhar/Tur(whole)": "Arhar (Tur/Red Gram)(Whole)",
    "Red gram split/Arhar dal/Tur dal": "Arhar Dal(Tur Dal)",
    "Paddy(Common)": "Paddy(Dhan)(Common)",
    "Lime": "Lemon",
    "Green Peas": "Peas Wet",
    "Pea Pod/Pea Cod/हरी मटर": "Peas Wet",
    "Sweet Pumpkin": "Pumpkin",
    "Seetapal": "Custard Apple (Sharifa)",
    "Guar": "Cluster beans",
    "Ridge Gourd(Permal/Hybrid Gourd)": "Ridgeguard(Tori)",
    "Chili Red": "Dry Chillies",
    "Ground Nut Seed": "Groundnut",
    "Groundnut pods(raw)": "Groundnut",
    "Mango": "Mango (Raw-Ripe)",
}

# Not crops: animals and the like (priced per head, not per quintal).
NOT_CROPS = {"cow", "ox", "bull", "buffalo", "hebuffalo", "shebuffalo", "calf", "goat", "sheep",
             "wood", "prawn", "fish"}


def key(name):
    """Letters and digits only, lower case — how two spellings are compared."""
    return re.sub(r"[^0-9a-zऀ-ॿ]", "", (name or "").lower())


_TABLE = {key(n): n for n in CLASSIC}
_TABLE.update({key(a): c for a, c in ALIASES.items()})


def canon(name):
    """The classic name for any spelling of a crop; unknown names come back
    trimmed (inner spaces tidied). None for things that aren't crops."""
    text = re.sub(r"\s+", " ", (name or "").strip())
    if not text:
        return text
    k = key(text)
    if k in NOT_CROPS:
        return None
    return _TABLE.get(k, text)


def canon_rows(rows):
    """Rows with the classic crop name; animals dropped."""
    out = []
    for row in rows:
        name = canon(row.get("commodity"))
        if name is None:
            continue
        if name != row.get("commodity"):
            row = dict(row, commodity=name)
        out.append(row)
    return out


if __name__ == "__main__":
    for sample in ["Lentil(Masur)(Whole)", "Lentil (Masur)(Whole)", "Red gram/Arhar/Tur(whole)",
                   "Green Gram(Moong)(Whole)", "Sweet Corn ", "Cow", "Wheat", "Bengal Gram(Gram)(Whole)"]:
        print(repr(sample), "->", repr(canon(sample)))
