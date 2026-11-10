"""Publish the scheme list (10 Nov 2026): content/schemes.json → Firestore config/schemes.

The app carries its own scheme list (khalihan-app lib/data/schemes_content.dart,
made by tool/schemes_content.py) and takes the server's copy, {version, json},
when its version is higher (lib/state/scheme_store.dart). So a dated line that
goes stale — "e-Pik Pahani by 10 November" — can be fixed for every farmer the
same day, without waiting for an app update.

How to change a scheme:
  1. khalihan-app: edit tool/schemes_content.py, bump VERSION, run it (it
     rewrites lib/data/schemes_content.dart);
  2. copy that list here into content/schemes.json with the same version;
  3. push to main → Actions "Publish schemes" runs this.

This never lowers the version on the server and never writes a list the app
could not read. Usage:  python tools/publish_schemes.py [--check]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(HERE, "..", "content", "schemes.json")
LANGS_NEEDED = ("en", "hi")  # the app falls back to these


def load(path=FILE):
    """Reads and checks content/schemes.json → (version, list). Raises ValueError."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    version = data.get("version")
    schemes = data.get("schemes")
    if not isinstance(version, int) or version < 1:
        raise ValueError("version must be a whole number above 0")
    if not isinstance(schemes, list) or not schemes:
        raise ValueError("schemes must be a non-empty list")
    seen = set()
    for i, s in enumerate(schemes):
        sid = s.get("id") if isinstance(s, dict) else None
        if not sid or not isinstance(sid, str):
            raise ValueError(f"scheme #{i + 1} has no id")
        if sid in seen:
            raise ValueError(f"scheme '{sid}' is listed twice")
        seen.add(sid)
        t = s.get("t")
        if not isinstance(t, dict) or any(k not in t for k in LANGS_NEEDED):
            raise ValueError(f"scheme '{sid}' needs its text in {', '.join(LANGS_NEEDED)}")
        for lang, tx in t.items():
            if not isinstance(tx, dict) or not tx.get("title"):
                raise ValueError(f"scheme '{sid}' ({lang}) has no title")
    return version, schemes


def main(argv):
    version, schemes = load()
    text = json.dumps(schemes, ensure_ascii=False, separators=(",", ":"))
    if len(text.encode("utf-8")) > 900_000:  # Firestore documents stop at 1 MiB
        raise ValueError("the list is too big for one Firestore document")
    print(f"content/schemes.json: version {version}, {len(schemes)} schemes — OK")
    if "--check" in argv:
        return 0

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    ref = firestore.client().collection("config").document("schemes")
    now = (ref.get().to_dict() or {}).get("version") or 0
    if isinstance(now, (int, float)) and version <= now:
        print(f"config/schemes already has version {int(now)} — nothing to do (bump the version to publish)")
        return 0
    ref.set({"version": version, "json": text, "at": firestore.SERVER_TIMESTAMP})
    print(f"config/schemes: version {int(now) if now else 'none'} → {version} (the app takes it on its next start)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
