"""Our Instagram reels inside the app (owner, 19 Nov 2026 17:08: "app ke andar
hi reel dekhna … bahut saare logon ke paas Instagram nahi hota"; a like, a
comment or the profile opens Instagram itself).

Reads OUR OWN page's reels (@khalihan_shetishala) through Meta's "Instagram API
with Instagram Login" (permission instagram_business_basic, our own account —
no App Review for an account that has a role on the app) and writes the
Firestore document config/reels, which every phone may read:

  {at, user, name, picture, followers,
   items: [{id, video, thumb, link, caption, at}, …]}   newest first, 30 at most

Phones play `video` — Instagram's own media URL, which expires after some
days, hence a run every hour — and open `link` (the reel) or the profile in
Instagram for a like, a comment or Follow.

The token: GitHub secret INSTAGRAM_TOKEN, a 60-day token the owner makes once
(Meta App Dashboard → Instagram → API setup with Instagram login → Generate
token). Runs refresh it once it is a week old; the fresh one is kept in
Firestore watcher/insta_token (no phone and no Admin page can read watcher/).

  python tools/insta_reels.py           read and write config/reels
  python tools/insta_reels.py --check   read only, print what it found

Until a token exists (it needs a Facebook developer login — the owner's), the
job reads the page's PUBLIC profile embed (instagram.com/khalihan_shetishala/
embed/, the newest 6 posts) with a headless browser and keeps every reel it
has seen: items {id, code, link} without "video" — the app then plays each
reel in Instagram's own embed player (instagram.com/reel/<code>/embed/),
which works without any Instagram account. First fill: INSTA_SEED.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

API = "https://graph.instagram.com"
REFRESH_AFTER = timedelta(days=7)
KEEP = 30


def get(path, **params):
    url = f"{API}/{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Khalihan/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:300]
        # The token must never reach the log.
        raise SystemExit(f"Instagram API {path}: HTTP {e.code} {body}") from None


def reels(token):
    """The newest videos of the token's own account (reels are VIDEO)."""
    out, after = [], None
    while len(out) < KEEP:
        params = {"fields": "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp",
                  "limit": 50, "access_token": token}
        if after:
            params["after"] = after
        page = get("me/media", **params)
        for m in page.get("data") or []:
            if m.get("media_type") != "VIDEO" or not m.get("media_url"):
                continue
            out.append({
                "id": m["id"],
                "video": m["media_url"],
                "thumb": m.get("thumbnail_url") or "",
                "link": m.get("permalink") or "",
                "caption": (m.get("caption") or "")[:600],
                "at": m.get("timestamp") or "",
            })
        after = ((page.get("paging") or {}).get("cursors") or {}).get("after")
        if not after or not (page.get("paging") or {}).get("next"):
            break
    return out[:KEEP]


def profile(token):
    try:
        return get("me", fields="user_id,username,name,profile_picture_url,followers_count", access_token=token)
    except SystemExit as e:  # extra fields are a nicety
        print(f"profile: {e}")
        return get("me", fields="user_id,username", access_token=token)


USER = "khalihan_shetishala"
CODE = re.compile(r"[A-Za-z0-9_-]{11}")


def _code_ok(c):
    # Instagram shortcodes: 11 letters, digits, "-" or "_", with capitals.
    return bool(CODE.fullmatch(c)) and any(ch.isupper() for ch in c) and not c.startswith("_")


def discover(user=USER):
    """The newest posts on the page's public profile embed
    (instagram.com/<user>/embed/ — 6 tiles), newest first. Needs Playwright."""
    from playwright.sync_api import sync_playwright
    seen = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 400, "height": 900})

        def on_response(r):
            try:
                if not re.search("json|javascript|html|text", r.headers.get("content-type", "")):
                    return
                body = r.text()
            except Exception:  # noqa: BLE001
                return
            seen.extend(m.group(1) for m in re.finditer(r'"(?:shortcode|code)"\s*:\s*"([A-Za-z0-9_-]{11})"', body))

        page.on("response", on_response)
        try:
            page.goto(f"https://www.instagram.com/{user}/embed/", wait_until="networkidle", timeout=60000)
        except Exception as e:  # noqa: BLE001
            print(f"embed page: {type(e).__name__}")
        page.wait_for_timeout(3000)
        html = page.content()
        seen.extend(m.group(1) for m in re.finditer(r'(?:shortcode|/p/|/reel/)[\\"\s:/]*([A-Za-z0-9_-]{11})', html))
        browser.close()
    out = []
    for c in seen:
        if _code_ok(c) and c not in out:
            out.append(c)
    return out


def embed_mode(db, now, check):
    """config/reels from the public embeds: what is new goes first, what was
    there stays (30 at most). Codes given in INSTA_SEED (comma-separated,
    newest first) are added too — the first fill."""
    found = discover()
    seed = [c.strip() for c in (os.environ.get("INSTA_SEED") or "").split(",") if _code_ok(c.strip())]
    print(f"@{USER}: profile embed shows {len(found)} posts: {', '.join(found)}" + (f"; seed {len(seed)}" if seed else ""))
    if check:
        return
    ref = db.collection("config").document("reels")
    snap = ref.get()
    old = (snap.to_dict() or {}).get("items") or [] if snap.exists else []
    order = []
    for c in found + seed + [str(it.get("code") or it.get("id") or "") for it in old]:
        if _code_ok(c) and c not in order:
            order.append(c)
    if not order:
        print("nothing found — config/reels left as it was")
        return
    keep = {str(it.get("code") or it.get("id")): it for it in old}
    items = []
    for c in order[:KEEP]:
        it = dict(keep.get(c) or {})
        it.update({"id": c, "code": c, "link": f"https://www.instagram.com/reel/{c}/"})
        it.setdefault("video", "")
        it.setdefault("caption", "")
        it.setdefault("thumb", "")
        it.setdefault("found", now)
        items.append(it)
    ref.set({"at": now, "user": USER, "mode": "embed", "items": items})
    new = [c for c in order[:KEEP] if c not in keep]
    print(f"config/reels written: {len(items)} reels ({len(new)} new: {', '.join(new) or '—'})")


def main():
    check = "--check" in sys.argv
    secret = (os.environ.get("INSTAGRAM_TOKEN") or "").strip()
    db = None
    if not check:
        import firebase_admin
        from firebase_admin import credentials, firestore
        firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
        db = firestore.client()

    now = datetime.now(timezone.utc)
    token, made = secret, None
    if db is not None:
        snap = db.collection("watcher").document("insta_token").get()
        kept = snap.to_dict() if snap.exists else {}
        if kept.get("token") and kept.get("made") and (not secret or kept.get("from") == secret[-6:]):
            token, made = kept["token"], kept["made"]
    if not token:
        # No API token: Instagram's own public embeds (no login, the way any
        # website shows a reel). The app plays each one in its embed player.
        embed_mode(db, now, check)
        return

    me = profile(token)
    items = reels(token)
    print(f"@{me.get('username')}: {len(items)} videos; newest {items[0]['at'] if items else '—'}")
    for it in items[:5]:
        print(f"  {it['at'][:10]}  {it['link']}  {it['caption'][:60]!r}")
    if check:
        return

    db.collection("config").document("reels").set({
        "at": now,
        "user": me.get("username") or "khalihan_shetishala",
        "name": me.get("name") or "",
        "picture": me.get("profile_picture_url") or "",
        "followers": me.get("followers_count") or 0,
        "items": items,
    })
    print("config/reels written")

    # Keep the token alive: a 60-day token refreshed once a week never dies.
    if made is None or now - made >= REFRESH_AFTER:
        fresh = get("refresh_access_token", grant_type="ig_refresh_token", access_token=token)
        if fresh.get("access_token"):
            db.collection("watcher").document("insta_token").set(
                {"token": fresh["access_token"], "made": now, "from": secret[-6:] if secret else "",
                 "expires_in": fresh.get("expires_in")})
            print(f"token refreshed (valid {int(fresh.get('expires_in') or 0) // 86400} days)")


if __name__ == "__main__":
    main()
