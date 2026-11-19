"""Khalihan Admin alerts in Google Cloud (owner, 18 Nov 2026 — moved from
GitHub's schedule, which never started, to Firebase's own project).

Two entry points (deploy.sh):
  on_create — Eventarc, when a document is created in Firestore: a farmer
              message, a team reply, a test request → sent at once.
  tick      — HTTP, called by Cloud Scheduler every 10 minutes (OIDC, no
              public access): reminders, Pro, the launch counter, the
              morning summary, and anything the instant path missed; and
              the farmers' IMD hail and storm warnings (imd_core.py).
The logic is alerts_core.py (the same file tools/admin_alerts.py uses).
"""
from datetime import datetime, timezone

import firebase_admin
import functions_framework
from firebase_admin import firestore, messaging

import alerts_core as core
import imd_core

firebase_admin.initialize_app()


@functions_framework.cloud_event
def on_create(event):
    # Firestore events carry the document's path, e.g. "feedback/abc".
    path = event.get("document") or ""
    line = core.on_document(firestore.client(), path, datetime.now(timezone.utc))
    print(f"{str(path).split('/')[0]}: {line}")


def _push(topic, data):
    messaging.send(messaging.Message(topic=topic, data=data, android=messaging.AndroidConfig(priority="high")))


@functions_framework.http
def tick(request):
    db = firestore.client()
    now = datetime.now(timezone.utc)
    line = core.run_pass(db, now)
    # IMD hail and storm warnings for farmers (imd_core.py). Its own try: an
    # IMD outage must never stop the team's alerts.
    try:
        line += " | " + imd_core.run(db, now, send=_push)
    except Exception as e:  # noqa: BLE001
        line += f" | IMD failed: {type(e).__name__}: {e}"
    print(line)
    return (line, 200)
