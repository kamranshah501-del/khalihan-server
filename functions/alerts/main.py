"""Khalihan Admin alerts in Google Cloud (owner, 18 Nov 2026 — moved from
GitHub's schedule, which never started, to Firebase's own project).

Two entry points (deploy.sh):
  on_create — Eventarc, when a document is created in Firestore: a farmer
              message, a team reply, a test request → sent at once.
  tick      — HTTP, called by Cloud Scheduler every 10 minutes (OIDC, no
              public access): reminders, Pro, the launch counter, the
              morning summary, and anything the instant path missed.
The logic is alerts_core.py (the same file tools/admin_alerts.py uses).
"""
from datetime import datetime, timezone

import firebase_admin
import functions_framework
from firebase_admin import firestore

import alerts_core as core

firebase_admin.initialize_app()


@functions_framework.cloud_event
def on_create(event):
    # Firestore events carry the document's path, e.g. "feedback/abc".
    path = event.get("document") or ""
    line = core.on_document(firestore.client(), path, datetime.now(timezone.utc))
    print(f"{str(path).split('/')[0]}: {line}")


@functions_framework.http
def tick(request):
    line = core.run_pass(firestore.client(), datetime.now(timezone.utc))
    print(line)
    return (line, 200)
