#!/usr/bin/env python3
"""Khalihan price collector.

The government price API (data.gov.in) stopped answering cloud servers in
Sept 2026, but it still answers an ordinary home or mobile connection. So
this small script runs on a phone or computer with such a connection: it
reads every state's mandi prices and puts them, as one gzip file, in the
khalihan-feed repository on GitHub. The daily job (daily_prices.py) reads
them from there — it needs no access to this phone, and this phone needs
no Firebase key.

Plain Python 3, standard library only (runs in Termux on Android).

Settings, one per file, in ~/.khalihan/ (never in git, never in chat):
  key    the data.gov.in API key
  token  a GitHub fine-grained token for khalihan-feed ONLY,
         permission "Contents: Read and write"
  repo   optional — default kamranshah501-del/khalihan-feed

  python3 collect.py           one round: read, upload if anything changed
  python3 collect.py --test    read one state, print a summary, upload nothing
"""
import base64
import gzip
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

HOME = os.path.expanduser("~/.khalihan")
RESOURCE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DEFAULT_REPO = "kamranshah501-del/khalihan-feed"
PAGE = 1000
MAX_PAGES = 30
TIMEOUT = 60
ATTEMPTS = 3
# Upload at least this often even when nothing changed, so the daily job
# can tell the collector is alive.
REFRESH_EVERY_S = 6 * 3600
FIELDS = ("state", "district", "market", "commodity", "variety", "grade",
          "arrival_date", "min_price", "max_price", "modal_price")
STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "NCT of Delhi", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
]


def setting(name, default=None):
    try:
        with open(os.path.join(HOME, name), encoding="utf-8") as fh:
            value = fh.read().strip()
            return value or default
    except OSError:
        return default


def log(message, secrets=()):
    """Print and keep the last 400 lines in ~/.khalihan/log.txt — with the
    key and token blanked out, always."""
    for secret in secrets:
        if secret:
            message = message.replace(secret, "***")
    line = f"{datetime.now().strftime('%d %b %H:%M')}  {message}"
    print(line, flush=True)
    path = os.path.join(HOME, "log.txt")
    try:
        lines = []
        if os.path.exists(path):
            with open(path, encoding="utf-8") as fh:
                lines = fh.read().splitlines()[-399:]
        lines.append(line)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
    except OSError:
        pass


def http_json(url, *, headers=None, body=None, method=None, timeout=TIMEOUT):
    data = None if body is None else json.dumps(body).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    if data is not None:
        request.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
        if response.headers.get("Content-Encoding", "").lower() == "gzip":
            raw = gzip.decompress(raw)
        return json.loads(raw.decode("utf-8"))


def get_page(key, state, offset):
    query = urllib.parse.urlencode({
        "api-key": key, "format": "json", "limit": PAGE, "offset": offset,
        "filters[state]": state,
    })
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
    }
    last = None
    for attempt in range(1, ATTEMPTS + 1):
        try:
            data = http_json(f"{RESOURCE}?{query}", headers=headers)
            if isinstance(data, dict) and data.get("error"):
                raise RuntimeError(str(data.get("error")))
            return data
        except Exception as error:  # slow or busy government server: wait, try again
            last = error
            if attempt < ATTEMPTS:
                time.sleep(5 * attempt)
    raise last


def fetch_state(key, state):
    """Every row for one state, only the fields the job uses."""
    rows = []
    total = 0
    for page in range(MAX_PAGES):
        data = get_page(key, state, page * PAGE)
        batch = data.get("records") or []
        for record in batch:
            rows.append({f: record.get(f) for f in FIELDS if record.get(f) is not None})
        total = int(data.get("total") or len(rows))
        if len(rows) >= total or not batch:
            break
        time.sleep(1)  # gentle on the government server
    return rows, total


def upload(token, repo, payload, message):
    """Replace latest.json.gz in the feed repo with one fresh commit (no
    history kept — the repo stays small). Uses GitHub's API directly, so
    the phone needs no git."""
    api = f"https://api.github.com/repos/{repo}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "khalihan-collector",
    }
    blob = http_json(f"{api}/git/blobs", headers=headers, method="POST",
                     body={"content": base64.b64encode(payload).decode("ascii"), "encoding": "base64"})
    tree = http_json(f"{api}/git/trees", headers=headers, method="POST",
                     body={"tree": [{"path": "latest.json.gz", "mode": "100644", "type": "blob", "sha": blob["sha"]}]})
    commit = http_json(f"{api}/git/commits", headers=headers, method="POST",
                       body={"message": message, "tree": tree["sha"], "parents": []})
    http_json(f"{api}/git/refs/heads/main", headers=headers, method="PATCH",
              body={"sha": commit["sha"], "force": True})
    return commit["sha"]


def load_previous():
    try:
        with gzip.open(os.path.join(HOME, "latest.json.gz"), "rt", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return {}


def main():
    os.makedirs(HOME, exist_ok=True)
    key = setting("key")
    token = setting("token")
    repo = setting("repo", DEFAULT_REPO)
    secrets = (key, token)
    if not key:
        sys.exit("No data.gov.in key — put it in ~/.khalihan/key (run the setup again).")

    if "--test" in sys.argv:
        state = "Maharashtra"
        rows, total = fetch_state(key, state)
        days = sorted({r.get("arrival_date", "") for r in rows})
        print(f"✅ data.gov.in answered: {state} — {len(rows)} rows (total {total}), days {days[-3:] if days else '-'}")
        return

    if not token:
        sys.exit("No GitHub token — put it in ~/.khalihan/token (run the setup again).")

    previous = load_previous().get("states", {})
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    states = {}
    got = failed = 0
    for state in STATES:
        try:
            rows, total = fetch_state(key, state)
            states[state] = {"at": now, "total": total, "rows": rows}
            got += 1
        except Exception as error:
            failed += 1
            log(f"{state}: not read — {error}", secrets)
            # Keep the last good copy (with its own time) rather than nothing.
            if state in previous:
                states[state] = previous[state]
        time.sleep(1)

    if got == 0:
        log(f"No state could be read ({failed} failed) — nothing uploaded. Internet off, or the key wrong?", secrets)
        return

    rows_total = sum(len(s.get("rows") or []) for s in states.values())
    fingerprint = hashlib.sha256(
        json.dumps({k: v.get("rows") for k, v in sorted(states.items())}, sort_keys=True).encode("utf-8")
    ).hexdigest()
    last_print = setting("last_fingerprint", "")
    try:
        last_upload = float(setting("last_upload", "0"))
    except ValueError:
        last_upload = 0.0

    feed = {"v": 1, "at": now, "by": "collector", "states": states}
    payload = gzip.compress(json.dumps(feed, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))
    with open(os.path.join(HOME, "latest.json.gz"), "wb") as fh:
        fh.write(payload)

    if fingerprint == last_print and time.time() - last_upload < REFRESH_EVERY_S:
        log(f"Read {got} states, {rows_total} rows — same as last time, not uploaded.")
        return
    try:
        upload(token, repo, payload, f"Prices {now} — {got} states, {rows_total} rows")
    except urllib.error.HTTPError as error:
        hint = " (token wrong, expired, or not allowed on the feed repo?)" if error.code in (401, 403, 404) else ""
        log(f"Upload failed: HTTP {error.code}{hint}", secrets)
        return
    except Exception as error:
        log(f"Upload failed: {error}", secrets)
        return
    with open(os.path.join(HOME, "last_fingerprint"), "w") as fh:
        fh.write(fingerprint)
    with open(os.path.join(HOME, "last_upload"), "w") as fh:
        fh.write(str(time.time()))
    log(f"✅ Uploaded: {got} states, {rows_total} rows ({len(payload) // 1024} KB)"
        + (f", {failed} states failed" if failed else ""))


if __name__ == "__main__":
    main()
