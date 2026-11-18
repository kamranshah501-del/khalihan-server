"""Khalihan Admin alerts — the 10-minute pass, run from GitHub by hand.

Since 18 Nov 2026 the alerts run in Google Cloud (functions/alerts, deployed
with functions/alerts/deploy.sh): at once for each new message, reply and
test request, and every 10 minutes by Cloud Scheduler. GitHub's schedule for
this never started, so admin-alerts.yml is now "Run workflow" only — a
fallback that runs the very same pass (functions/alerts/alerts_core.py).
Prints counts only (public repository).
"""
import json
import os
import sys
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "functions", "alerts"))
import alerts_core  # noqa: E402


def main():
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    print(alerts_core.run_pass(firestore.client(), datetime.now(timezone.utc)))


if __name__ == "__main__":
    main()
