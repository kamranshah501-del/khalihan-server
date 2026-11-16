#!/usr/bin/env bash
# Khalihan Plus — our server's check of a Google Play purchase (plus-verify).
# Set up or update it, from Cloud Shell (project owner):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/plus/deploy.sh)
# Safe to run again. Ends with a call without a login (must answer 401).
# After the first run the owner invites the service account it prints in
# Play Console → Users and permissions (see README.md) — until then Google
# Play does not answer it, and no purchase can open Plus.
set -euo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
R=asia-south1
SA="plus-verify@$P.iam.gserviceaccount.com"
echo "== Project: $P"

echo "== 1/5 Turning on the Google services it needs (a minute)"
gcloud services enable androidpublisher.googleapis.com cloudfunctions.googleapis.com run.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com firebaseappcheck.googleapis.com --project "$P"

echo "== 2/5 Service account plus-verify (Firestore + App Check check only)"
gcloud iam service-accounts describe "$SA" --project "$P" >/dev/null 2>&1 \
  || gcloud iam service-accounts create plus-verify --display-name="Khalihan Plus purchase check" --project "$P"
for i in 1 2 3 4 5 6; do
  if gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
       --role=roles/datastore.user --quiet >/dev/null 2>&1; then break; fi
  echo "   (waiting for the new account to appear…)"; sleep 10
done
gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
  --role=roles/firebaseappcheck.tokenVerifier --quiet >/dev/null 2>&1 \
  || echo "   (App Check verifier role not given — the check only notes App Check anyway)"

echo "== 3/5 The code (github.com/kamranshah501-del/khalihan-server, plus/)"
D=$(mktemp -d)
git clone -q --depth 1 https://github.com/kamranshah501-del/khalihan-server "$D/s"
cd "$D/s/plus"
node test.js

echo "== 4/5 Deploying plus-verify in $R (a few minutes)"
gcloud functions deploy plus-verify --gen2 --region="$R" --runtime=nodejs22 \
  --entry-point=plusVerify --source=. --trigger-http --allow-unauthenticated \
  --service-account="$SA" --set-env-vars="GOOGLE_CLOUD_PROJECT=$P" \
  --memory=256Mi --max-instances=5 --timeout=30s --project "$P" --quiet \
  --format='value(state)'

echo "== 5/5 Test: a call without a login"
URL="https://$R-$P.cloudfunctions.net/plus-verify"
sleep 5
curl -s -X POST "$URL" -H 'Content-Type: application/json' -d '{}' -w "  (HTTP %{http_code})\n" || true
echo
echo "== PLUS-VERIFY READY: $URL"
echo "   Next (owner, once): Play Console → Users and permissions → Invite new users →"
echo "   $SA"
echo "   App permissions: Khalihan — 'View financial data' and 'Manage orders and subscriptions'."
