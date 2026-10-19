"""Prices brought in by the Khalihan collector.

data.gov.in turns cloud servers away (since Sept 2026) but answers a home or
mobile connection, so a phone/computer runs collector/collect.py and puts
every state's rows in the khalihan-feed repository. This reads them back.
Rows are in the government API's own format, so they go through exactly the
same steps as rows fetched directly.
"""
import gzip
import json
import os
from datetime import datetime, timedelta, timezone

import requests

FEED_REPO = os.environ.get("KHALIHAN_FEED_REPO", "kamranshah501-del/khalihan-feed")
FEED_URL = os.environ.get(
    "KHALIHAN_FEED_URL",
    f"https://raw.githubusercontent.com/{FEED_REPO}/main/latest.json.gz",
)
MAX_AGE = timedelta(hours=30)


def _when(text):
    try:
        at = datetime.fromisoformat(str(text).replace("Z", "+00:00"))
        return at if at.tzinfo else at.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return None


def parse(raw, now=None):
    """{state: rows} from the feed file's bytes — only states read in the
    last 30 hours, and only those with rows."""
    try:
        raw = gzip.decompress(raw)
    except OSError:
        pass  # already plain JSON
    data = json.loads(raw.decode("utf-8"))
    now = now or datetime.now(timezone.utc)
    out = {}
    for state, item in (data.get("states") or {}).items():
        if not isinstance(item, dict):
            continue
        at = _when(item.get("at") or data.get("at"))
        rows = item.get("rows") or []
        if at and now - at <= MAX_AGE and rows:
            out[state] = rows
    return out, data.get("at")


def load(log=print):
    """The collector's latest rows, or {} when there is no fresh feed."""
    token = os.environ.get("FEED_TOKEN", "").strip()
    try:
        if token:
            # A private feed repo: read the file through GitHub's API.
            response = requests.get(
                f"https://api.github.com/repos/{FEED_REPO}/contents/latest.json.gz",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.raw",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
                timeout=30,
            )
        else:
            response = requests.get(FEED_URL, timeout=30)
        if response.status_code == 404:
            log("Feed: none yet (no collector has uploaded).")
            return {}
        response.raise_for_status()
        states, made = parse(response.content)
    except Exception as error:
        message = str(error).replace(token, "***") if token else str(error)
        log(f"Feed: not read — {message}")
        return {}
    log(f"Feed: {len(states)} state(s) from the collector (made {made}).")
    return states
