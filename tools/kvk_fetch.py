"""Fetch a district's current agromet advisory bulletin (14 Nov 2026).

For Khalihan AI's "इस हफ़्ते की सरकारी सलाह" (app v1.0.9, switch ai_kvk). The
bulletin is the public one Gramin Krishi Mausam Sewa issues for each district
every Tuesday and Friday (for Jalgaon: AMFU Pune, MPKV, with IMD's forecast).
IMD keeps the newest one of every district at a fixed address:

  https://mausam.imd.gov.in/imd_latest/contents/agromet/agromet-data/district/current/english-pdf/<District>.pdf

This only brings the PDF and its text into a folder (the workflow keeps it as
the run's artifact). Nothing is published from here: the plain-language
version is written from this text, read by the owner, and only then put in
content/kvk.json (tools/publish_kvk.py).

It asks the site's robots.txt first and takes nothing the site asks robots
not to take. One request per file, twice a week.

Usage:  python tools/kvk_fetch.py Jalgaon [--out DIR]
"""
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
import urllib.robotparser

HOST = "https://mausam.imd.gov.in"
BASE = HOST + "/imd_latest/contents/agromet/agromet-data/district/current"
# English first: its numbers are what the publishing check reads. The local
# language copy (Marathi for Maharashtra) gives the farmer's own words.
KINDS = (("en", "english-pdf"), ("local", "regional-pdf"), ("local", "local-pdf"), ("local", "hindi-pdf"))
AGENT = "KhalihanBot/1.0 (Khalihan, a farmers' app: play.google.com/store/apps/details?id=in.khalihan.app; 2 requests a week)"


def allowed(url):
    """What robots.txt says for us; a site without one allows everything."""
    rp = urllib.robotparser.RobotFileParser()
    try:
        req = urllib.request.Request(HOST + "/robots.txt", headers={"User-Agent": AGENT})
        with urllib.request.urlopen(req, timeout=30) as r:
            rp.parse(r.read().decode("utf-8", "replace").splitlines())
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            return False
        return True  # 404: no robots.txt
    except Exception as e:  # the site did not answer: do not guess
        print(f"robots.txt: {type(e).__name__}: {e}")
        return False
    return rp.can_fetch(AGENT, url)


def fetch(url):
    """→ (bytes, headers) or (None, why)."""
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}"
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


def text_of(pdf_path):
    """The PDF's text with its layout (tables stay in rows); '' without poppler."""
    try:
        out = subprocess.run(["pdftotext", "-layout", pdf_path, "-"], capture_output=True, timeout=60)
        return out.stdout.decode("utf-8", "replace")
    except Exception as e:
        print(f"pdftotext: {type(e).__name__}: {e}")
        return ""


def main(argv):
    if not argv or argv[0].startswith("-"):
        print(__doc__)
        return 2
    district = argv[0].strip()
    if not district.replace(" ", "").isalpha():
        print("the district is a name in English letters, e.g. Jalgaon")
        return 2
    out = argv[argv.index("--out") + 1] if "--out" in argv else "kvk_bulletin"
    os.makedirs(out, exist_ok=True)
    name = district.title().replace(" ", "%20")
    report = {"district": district, "files": []}
    got = set()
    for lang, kind in KINDS:
        if lang in got:
            continue
        url = f"{BASE}/{kind}/{name}.pdf"
        if not allowed(url):
            print(f"{kind}: robots.txt does not allow it — not taken")
            report["files"].append({"url": url, "status": "robots"})
            continue
        data, info = fetch(url)
        if data is None:
            print(f"{kind}: {info}")
            report["files"].append({"url": url, "status": info})
            continue
        if not data.startswith(b"%PDF"):
            print(f"{kind}: not a PDF ({len(data)} bytes)")
            report["files"].append({"url": url, "status": "not a pdf"})
            continue
        got.add(lang)
        base = f"{district.lower().replace(' ', '_')}_{lang}"
        pdf = os.path.join(out, base + ".pdf")
        with open(pdf, "wb") as f:
            f.write(data)
        text = text_of(pdf)
        with open(os.path.join(out, base + ".txt"), "w", encoding="utf-8") as f:
            f.write(text)
        entry = {
            "url": url,
            "status": "ok",
            "lang": lang,
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "last_modified": info.get("Last-Modified", ""),
            "text_chars": len(text),
        }
        report["files"].append(entry)
        print(f"{kind}: {len(data)} bytes, {len(text)} characters of text, last changed {entry['last_modified'] or '?'}")
    with open(os.path.join(out, "report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    if "en" not in got:
        print("The English bulletin did not come — nothing to work from.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
