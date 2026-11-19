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
"""
import json
import os
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
        # Not an error: until the owner makes the token, the app opens the
        # Instagram page instead of playing reels.
        print("No INSTAGRAM_TOKEN yet: the owner makes it once in Meta's App Dashboard (see this file's top).")
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
