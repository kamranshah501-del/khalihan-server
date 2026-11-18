#!/usr/bin/env bash
# Khalihan Admin alerts in Google Cloud — set up or update, from Cloud Shell
# (project owner; owner 18 Nov 2026 14:41: "GitHub se Firebase pe le ja lo"):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/functions/alerts/deploy.sh)
# Safe to run again. What it makes:
#   • service account admin-alerts (Firestore, Cloud Messaging, events);
#   • admin-alerts-feedback / -reply / -test: run at once when a farmer message,
#     a team reply or a test request is created (Eventarc, Firestore);
#   • admin-alerts-tick: the 10-minute pass, called only by Cloud Scheduler
#     (no public access) — job "admin-alerts-tick", every 10 minutes.
# Ends by running the pass once and printing its line of counts.
set -euo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
R=asia-south1
SA="admin-alerts@$P.iam.gserviceaccount.com"
echo "== Project: $P"

echo "== 1/6 Turning on the Google services it needs (a minute)"
gcloud services enable cloudfunctions.googleapis.com run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com eventarc.googleapis.com pubsub.googleapis.com \
  cloudscheduler.googleapis.com fcm.googleapis.com firestore.googleapis.com --project "$P"

echo "== 2/6 Service account admin-alerts"
gcloud iam service-accounts describe "$SA" --project "$P" >/dev/null 2>&1 \
  || gcloud iam service-accounts create admin-alerts --display-name="Khalihan Admin alerts" --project "$P"
for role in roles/datastore.user roles/firebasecloudmessaging.admin roles/eventarc.eventReceiver roles/run.invoker; do
  for i in 1 2 3 4 5 6; do
    if gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
         --role="$role" --quiet >/dev/null 2>&1; then break; fi
    echo "   (waiting for the new account to appear…)"; sleep 10
  done
done

echo "== 3/6 The code (github.com/kamranshah501-del/khalihan-server, functions/alerts/)"
D=$(mktemp -d)
git clone -q --depth 1 https://github.com/kamranshah501-del/khalihan-server "$D/s"
cd "$D/s/functions/alerts"
python3 -m py_compile main.py alerts_core.py

echo "== 4/6 Where Firestore keeps the data"
LOC=$(gcloud firestore databases describe --database='(default)' --project "$P" --format='value(locationId)')
echo "   $LOC"

deploy_trigger() { # name, document pattern
  local name=$1 pattern=$2 try
  for try in 1 2 3; do
    if gcloud functions deploy "admin-alerts-$name" --gen2 --region="$R" --runtime=python312 \
         --entry-point=on_create --source=. --project "$P" \
         --trigger-location="$LOC" \
         --trigger-event-filters="type=google.cloud.firestore.document.v1.created" \
         --trigger-event-filters="database=(default)" \
         --trigger-event-filters-path-pattern="document=$pattern" \
         --service-account="$SA" --trigger-service-account="$SA" \
         --set-env-vars="GOOGLE_CLOUD_PROJECT=$P" \
         --memory=256Mi --timeout=60s --max-instances=3 --quiet; then return 0; fi
    # The first Firestore trigger in a project can fail while Google sets up
    # its own event permissions: wait and try again.
    echo "   (Google is still setting up events — trying again in 90 s)"; sleep 90
  done
  return 1
}

echo "== 5/6 Deploying in $R (a few minutes each)"
deploy_trigger feedback "feedback/{id}"
deploy_trigger reply "inbox/{dev}/replies/{rid}"
deploy_trigger test "alert_requests/{id}"
gcloud functions deploy admin-alerts-tick --gen2 --region="$R" --runtime=python312 \
  --entry-point=tick --source=. --project "$P" --trigger-http --no-allow-unauthenticated \
  --service-account="$SA" --set-env-vars="GOOGLE_CLOUD_PROJECT=$P" \
  --memory=256Mi --timeout=300s --max-instances=1 --quiet
URL=$(gcloud functions describe admin-alerts-tick --gen2 --region="$R" --project "$P" --format='value(serviceConfig.uri)')
gcloud run services add-iam-policy-binding admin-alerts-tick --region="$R" --project "$P" \
  --member="serviceAccount:$SA" --role=roles/run.invoker --quiet >/dev/null

echo "== 6/6 Every 10 minutes (Cloud Scheduler)"
if gcloud scheduler jobs describe admin-alerts-tick --location="$R" --project "$P" >/dev/null 2>&1; then
  ACTION=update
else
  ACTION=create
fi
gcloud scheduler jobs "$ACTION" http admin-alerts-tick --location="$R" --project "$P" \
  --schedule="*/10 * * * *" --time-zone="Asia/Kolkata" --uri="$URL" --http-method=POST \
  --oidc-service-account-email="$SA" --oidc-token-audience="$URL" --quiet
gcloud scheduler jobs run admin-alerts-tick --location="$R" --project "$P"
sleep 20
echo "== The pass's last line:"
gcloud functions logs read admin-alerts-tick --gen2 --region="$R" --project "$P" --limit=5 2>/dev/null | grep -E "pushes sent|nothing new" | head -2 || true
echo "✅ Done. New farmer messages now alert at once; the rest every 10 minutes."
