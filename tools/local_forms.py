"""Local government forms (19 Nov 2026): content/local_forms → Firestore config/local_forms.

Owner, 19 Nov 2026: blank Maharashtra local-office forms kept on the server;
the farmer asks for one in the app, the AI fills it, the app lists the papers to
attach, and makes one PDF for the print shop. Maharashtra only; the app's
switch `local_forms` stays OFF until the owner turns it on.

What lives where:
  content/local_forms/pdf/<form>.pdf    the department's own blank (sha256 in sources.json)
  content/local_forms/maps/<form>.json  where each answer goes on the page (made by maps/make_maps.py)
  content/local_forms/sources.json      official page + PDF link + checked date for every form
  admin/public/forms/<form>-<n>.png     the blank pages at 200 dpi (grey), served by Firebase Hosting
                                        with the Admin site — public documents, no rules change

Firestore config/local_forms = {version, json, at}: the list of forms with their
maps, papers, sources and page picture paths. Readable by everyone (config/*);
written only here. The app keeps nothing of the farmer's on the server: the
filled form and his papers stay on his phone (My Documents).

Usage:  python tools/local_forms.py [--check]
"""
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
LF = os.path.join(ROOT, "content", "local_forms")
IMG = os.path.join(ROOT, "admin", "public", "forms")
VERSION = 1  # bump to publish a change
WHO = {"profile", "ai", "farmer", "ink"}
KINDS = {"text", "choice", "tick", "photo_row", "boxes", "sign", "thumb"}
# answers that only the farmer types (never the AI, never the server)
FARMER_ONLY = ("aadhaar", "bank", "card_no", "juna_card", "mobile", "dukan", "gas_details")


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")
    return int.from_bytes(head[16:20], "big"), int.from_bytes(head[20:24], "big")


def load():
    """Reads and checks everything → the list for Firestore. Raises ValueError."""
    src = json.load(open(os.path.join(LF, "sources.json"), encoding="utf-8"))
    by_id = {f["id"]: f for f in src["forms"]}
    out = []
    for name in sorted(os.listdir(os.path.join(LF, "maps"))):
        if not name.endswith(".json"):
            continue
        m = json.load(open(os.path.join(LF, "maps", name), encoding="utf-8"))
        fid = m["form"]
        if fid not in by_id:
            raise ValueError(f"{fid}: not in sources.json")
        s = by_id[fid]
        pdf = os.path.join(LF, "pdf", fid + ".pdf")
        got = hashlib.sha256(open(pdf, "rb").read()).hexdigest()
        if got != s["sha256"]:
            raise ValueError(f"{fid}: pdf sha256 {got[:12]}… is not the one in sources.json")
        pages = []
        for n, (w, h) in enumerate(m["page_pt"], start=1):
            img = os.path.join(IMG, f"{fid}-{n}.png")
            if not os.path.exists(img):
                raise ValueError(f"{fid}: page {n} picture missing ({img})")
            pw, ph = png_size(img)
            if abs(pw / ph - w / h) > 0.01:
                raise ValueError(f"{fid}: page {n} picture is not the page's shape")
            pages.append({"n": n, "w": w, "h": h, "img": f"forms/{fid}-{n}.png", "px": [pw, ph]})
        seen = set()
        fields = []
        for f in m["fields"]:
            if f["id"] in seen:
                raise ValueError(f"{fid}: field {f['id']} twice")
            seen.add(f["id"])
            if f["kind"] not in KINDS:
                raise ValueError(f"{fid}.{f['id']}: unknown kind {f['kind']}")
            if f["who"] not in WHO:
                raise ValueError(f"{fid}.{f['id']}: who must be one of {sorted(WHO)}")
            if not 1 <= f["page"] <= len(pages):
                raise ValueError(f"{fid}.{f['id']}: no page {f['page']}")
            w, h = m["page_pt"][f["page"] - 1]
            pts = []
            if "x" in f:
                pts.append((f["x"], f["y"]))
                if "w" in f:
                    pts.append((f["x"] + f["w"], f["y"] + f["h"]))
            for v in (f.get("options") or {}).values():
                pts.append((v[0], v[1]))
            for x, y in pts:
                if not (0 <= x <= w and 0 <= y <= h):
                    raise ValueError(f"{fid}.{f['id']}: ({x}, {y}) is off the page")
            key = f.get("col") or f["id"]
            if any(k in key for k in FARMER_ONLY) and f["who"] != "farmer":
                raise ValueError(f"{fid}.{f['id']}: must be filled by the farmer only")
            if any(l not in f["label"] for l in ("mr", "hi", "en")):
                raise ValueError(f"{fid}.{f['id']}: label needs mr, hi, en")
            fields.append({k: v for k, v in f.items() if k != "sample"})
        for d in m.get("docs", []):
            if any(l not in d for l in ("mr", "hi", "en")):
                raise ValueError(f"{fid}: paper {d.get('id')} needs mr, hi, en")
        out.append({
            "id": fid, "namuna": m["namuna"], "title": m["title"], "state": "Maharashtra",
            "office": s["office"], "fee_on_form": s.get("fee_on_form"), "rts_time": s.get("rts_time"),
            "source": {"page": src["page"], "pdf": s["pdf"], "sha256": s["sha256"], "checked": src["checked"],
                       "dept": {"mr": "अन्न, नागरी पुरवठा व ग्राहक संरक्षण विभाग, महाराष्ट्र शासन",
                                "hi": "अन्न, नागरी आपूर्ति व उपभोक्ता संरक्षण विभाग, महाराष्ट्र सरकार",
                                "en": "Food, Civil Supplies & Consumer Protection Dept, Govt of Maharashtra"}},
            "online": src.get("online_route", {}).get("apply"),
            "pages": pages, "fields": fields, "docs": m.get("docs", []),
            "office_only": m.get("office_only", []), "thumb_note": m.get("thumb_note"),
        })
    if not out:
        raise ValueError("no forms")
    return out


def main(argv):
    forms = load()
    text = json.dumps(forms, ensure_ascii=False, separators=(",", ":"))
    if len(text.encode("utf-8")) > 900_000:
        raise ValueError("too big for one Firestore document")
    n = sum(len(f["fields"]) for f in forms)
    print(f"content/local_forms: version {VERSION}, {len(forms)} forms, {n} fields, {len(text) // 1024} KB — OK")
    if "--check" in argv:
        return 0
    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    ref = firestore.client().collection("config").document("local_forms")
    now = (ref.get().to_dict() or {}).get("version") or 0
    if isinstance(now, (int, float)) and VERSION <= now:
        print(f"config/local_forms already has version {int(now)} — nothing to do")
        return 0
    ref.set({"version": VERSION, "json": text, "at": firestore.SERVER_TIMESTAMP})
    print(f"config/local_forms: version {int(now) if now else 'none'} → {VERSION}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
