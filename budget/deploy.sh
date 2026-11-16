#!/usr/bin/env bash
# Khalihan budget stop — set up or update it, from Cloud Shell (project owner):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/budget/deploy.sh)
# Safe to run again. Ends with a test message (only logged, never acted on).
set -euo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
R=asia-south1
SA="budget-stop@$P.iam.gserviceaccount.com"
echo "== Project: $P"

echo "== 1/6 Turning on the Google services it needs (a minute)"
gcloud services enable pubsub.googleapis.com cloudfunctions.googleapis.com run.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com eventarc.googleapis.com --project "$P"

echo "== 2/6 Topic budget-alerts"
gcloud pubsub topics describe budget-alerts --project "$P" >/dev/null 2>&1 \
  || gcloud pubsub topics create budget-alerts --project "$P"

echo "== 3/6 Service account budget-stop (Firestore only)"
gcloud iam service-accounts describe "$SA" --project "$P" >/dev/null 2>&1 \
  || gcloud iam service-accounts create budget-stop --display-name="Khalihan budget stop" --project "$P"
for i in 1 2 3 4 5 6; do
  if gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
       --role=roles/datastore.user --quiet >/dev/null 2>&1; then break; fi
  echo "   (waiting for the new account to appear…)"; sleep 10
done

# Pub/Sub signs its calls to the function as budget-stop: its own service
# agent needs Token Creator on that one account (not on the project).
N=$(gcloud projects describe "$P" --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding "$SA" --project "$P" --quiet \
  --member="serviceAccount:service-$N@gcp-sa-pubsub.iam.gserviceaccount.com" \
  --role=roles/iam.serviceAccountTokenCreator >/dev/null

# The trigger runs as budget-stop too (Eventarc: receive events only).
gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
  --role=roles/eventarc.eventReceiver --quiet >/dev/null

echo "== 4/6 The code (github.com/kamranshah501-del/khalihan-server, budget/)"
D=$(mktemp -d)
git clone -q --depth 1 https://github.com/kamranshah501-del/khalihan-server "$D/s"
cd "$D/s/budget"
node test.js

echo "== 5/6 Deploying budget-stop in $R (a few minutes)"
deploy() {
  gcloud functions deploy budget-stop --gen2 --region="$R" --runtime=nodejs22 \
    --entry-point=budgetStop --source=. --trigger-topic=budget-alerts \
    --service-account="$SA" --trigger-service-account="$SA" \
    --memory=256Mi --max-instances=1 --no-allow-unauthenticated --project "$P" --quiet \
    --format='value(state)'
}
# The first trigger in a project can be refused while Eventarc's own
# permissions spread (a few minutes): try again, up to three times.
for i in 1 2 3; do
  if deploy; then break; fi
  [ "$i" = 3 ] && exit 1
  echo "   (Google is still setting up — trying again in 90 s)"; sleep 90
done
gcloud run services add-iam-policy-binding budget-stop --region="$R" \
  --member="serviceAccount:$SA" --role=roles/run.invoker --project "$P" --quiet >/dev/null

echo "== 6/6 Test message (only logged)"
gcloud pubsub topics publish budget-alerts --project "$P" \
  --message='{"budgetDisplayName":"test","costAmount":2,"budgetAmount":1,"currencyCode":"INR","costIntervalStart":"2000-01-01T00:00:00Z","khalihanTest":true}' >/dev/null
sleep 45
gcloud functions logs read budget-stop --gen2 --region="$R" --project "$P" --limit=8 --format='value(log)' | grep -m3 budgetStop || echo "(no log line yet — read again in a minute)"
echo "== BUDGET STOP READY"
