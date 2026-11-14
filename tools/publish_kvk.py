"""Publish the week's advice (14 Nov 2026): content/kvk.json → Firestore config/kvk.

Khalihan AI's "इस हफ़्ते की सरकारी सलाह" (app v1.0.9, switch ai_kvk) shows a
district's agromet advisory bulletin in plain Hindi, Marathi and English,
card by card, and reads it aloud. The app takes {version, json} from
config/kvk when its version is higher than the copy it holds
(khalihan-app lib/ai/kvk.dart).

How a bulletin gets here (owner, 14 Nov 2026 — "Claude draft, aap OK"):
  1. Actions "KVK bulletin: fetch" brings the district's newest bulletin
     (tools/kvk_fetch.py); its English text is saved under
     content/kvk_source/<area>_<issued>_en.txt, unchanged;
  2. the plain version is written into content/kvk.json — one card for the
     weather and one per crop, three languages;
  3. the owner reads it and says "ठीक";
  4. content/kvk.json goes to main → Actions "KVK advice: publish" runs this.

Owner's rule for medicines ("jaisa chhapa waisa dikhao"): a medicine's name
and amount stand exactly as the bulletin prints them. So this refuses to
publish when
  • a number in a card is not in the bulletin's own text,
  • the three languages of a card do not carry the same numbers, or
  • a name listed for a card ("names") is not in the bulletin, in the
    English text, or (in Latin letters, as printed) in Hindi and Marathi.
It also refuses a bulletin older than 8 days (the app would not show it),
and never lowers the version on the server.

Usage:  python tools/publish_kvk.py [--check]
"""
import datetime
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, "..", "content")
FILE = os.path.join(CONTENT, "kvk.json")
LANGS = ("en", "hi", "mr")
MAX_CARDS = 8
MAX_TEXT = 380  # characters a card's advice may run to
MAX_AGE = 8  # days; the app's own limit (KvkAdvice.fresh)

_DEVA = str.maketrans("०१२३४५६७८९", "0123456789")
_NUM = re.compile(r"\d+(?:\.\d+)?")


def numbers(text):
    """Every number in a text, as written ("2", "0.5", "80"), sorted — Devanagari digits read as ours."""
    return sorted(_NUM.findall(text.translate(_DEVA).replace(",", "")))


def check_card(area, i, card, source_numbers, source_lower):
    where = f"{area}, card {i + 1}"
    if not isinstance(card, dict) or not isinstance(card.get("k"), str) or not card["k"]:
        raise ValueError(f"{where}: needs a kind 'k' (weather, animal, general or a crop)")
    for field in ("name", "t"):
        words = card.get(field)
        if not isinstance(words, dict) or any(not isinstance(words.get(l), str) or not words[l].strip() for l in LANGS):
            raise ValueError(f"{where}: '{field}' needs words in {', '.join(LANGS)}")
    for lang in LANGS:
        if len(card["t"][lang]) > MAX_TEXT:
            raise ValueError(f"{where} ({lang}): {len(card['t'][lang])} characters — at most {MAX_TEXT}")
    en = numbers(card["t"]["en"])
    for lang in ("hi", "mr"):
        if numbers(card["t"][lang]) != en:
            raise ValueError(
                f"{where}: the numbers differ between languages — en {en}, {lang} {numbers(card['t'][lang])}")
    for n in en:
        if n not in source_numbers:
            raise ValueError(f"{where}: the number {n} is not in the bulletin's text")
    names = card.get("names", [])
    if not isinstance(names, list) or any(not isinstance(n, str) or not n.strip() for n in names):
        raise ValueError(f"{where}: 'names' is a list of the medicines and fertilisers the card names")
    for name in names:
        low = name.strip().lower()
        if low not in source_lower:
            raise ValueError(f"{where}: '{name}' is not in the bulletin's text")
        for lang in LANGS:
            if low not in card["t"][lang].lower():
                raise ValueError(f"{where} ({lang}): '{name}' must stand in the text as the bulletin prints it")


def load(path=FILE, today=None):
    """Reads and checks content/kvk.json → (version, {"areas": …} as the app reads it). Raises ValueError."""
    today = today or datetime.date.today()
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    version = data.get("version")
    areas = data.get("areas")
    if not isinstance(version, int) or version < 1:
        raise ValueError("version must be a whole number above 0")
    if not isinstance(areas, dict) or not areas:
        raise ValueError("areas must hold at least one district")
    out = {}
    for area, a in areas.items():
        if not re.fullmatch(r"[a-z]+", area):
            raise ValueError(f"'{area}': a district's key is its name in small English letters")
        if not isinstance(a, dict):
            raise ValueError(f"{area}: not an entry")
        try:
            issued = datetime.date.fromisoformat(a.get("issued", ""))
        except (TypeError, ValueError):
            raise ValueError(f"{area}: 'issued' is the bulletin's date, YYYY-MM-DD")
        age = (today - issued).days
        if age < -1:
            raise ValueError(f"{area}: issued {issued} is in the future")
        if age > MAX_AGE:
            raise ValueError(f"{area}: issued {issued} is {age} days old — the app shows nothing older than {MAX_AGE}")
        source = a.get("source")
        if not isinstance(source, str) or not source:
            raise ValueError(f"{area}: 'source' names the bulletin's text file under content/")
        source_path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(path)), source))
        if not source_path.startswith(os.path.normpath(os.path.dirname(os.path.abspath(path)))) or not os.path.isfile(source_path):
            raise ValueError(f"{area}: the bulletin's text {source} is not there")
        with open(source_path, encoding="utf-8") as f:
            source_text = f.read()
        if len(source_text) < 500:
            raise ValueError(f"{area}: {source} is too short to be a bulletin")
        source_numbers = set(numbers(source_text))
        frm = a.get("from")
        if not isinstance(frm, dict) or any(not isinstance(frm.get(l), str) or not frm[l].strip() for l in LANGS):
            raise ValueError(f"{area}: 'from' (who issued it) needs words in {', '.join(LANGS)}")
        cards = a.get("cards")
        if not isinstance(cards, list) or not 1 <= len(cards) <= MAX_CARDS:
            raise ValueError(f"{area}: 1 to {MAX_CARDS} cards")
        for i, card in enumerate(cards):
            check_card(area, i, card, source_numbers, source_text.lower())
        out[area] = {
            "issued": issued.isoformat(),
            "from": {l: frm[l].strip() for l in LANGS},
            "cards": [
                {"k": c["k"], "name": {l: c["name"][l].strip() for l in LANGS}, "t": {l: c["t"][l].strip() for l in LANGS}}
                for c in cards
            ],
        }
    return version, {"areas": out}


def main(argv):
    version, doc = load()
    text = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    if len(text.encode("utf-8")) > 900_000:  # Firestore documents stop at 1 MiB
        raise ValueError("too big for one Firestore document")
    for area, a in doc["areas"].items():
        print(f"content/kvk.json: version {version} · {area}, issued {a['issued']}, {len(a['cards'])} cards — OK")
    if "--check" in argv:
        return 0

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    ref = firestore.client().collection("config").document("kvk")
    now = (ref.get().to_dict() or {}).get("version") or 0
    if isinstance(now, (int, float)) and version <= now:
        print(f"config/kvk already has version {int(now)} — nothing to do (bump the version to publish)")
        return 0
    ref.set({"version": version, "json": text, "at": firestore.SERVER_TIMESTAMP})
    print(f"config/kvk: version {int(now) if now else 'none'} → {version} (the app takes it when the page is next opened)")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except ValueError as e:
        print(f"NOT published: {e}")
        sys.exit(1)
