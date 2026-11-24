#!/usr/bin/env bash
# form-brain — Claude reads a government page for Khalihan AI. Set up or
# update it, from Cloud Shell (project owner):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/brain/deploy.sh)
# Safe to run again. The first time it asks for Anthropic's key — pasted
# once, not shown on the screen, kept only in Google's Secret Manager
# (secret "anthropic-api-key"); the function alone may read it. To put a new
# key in later:   KH_NEW_KEY=1 bash <(curl -s …/brain/deploy.sh)
# Ends with a call that is not from the app (must answer 401).
set -euo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
R=asia-south1
SA="form-brain@$P.iam.gserviceaccount.com"
SECRET=anthropic-api-key
echo "== Project: $P"

echo "== 1/6 Turning on the Google services it needs (a minute)"
gcloud services enable cloudfunctions.googleapis.com run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com firebaseappcheck.googleapis.com secretmanager.googleapis.com \
  firestore.googleapis.com --project "$P"

echo "== 2/6 Service account form-brain (the day's counts in Firestore + App Check check only)"
gcloud iam service-accounts describe "$SA" --project "$P" >/dev/null 2>&1 \
  || gcloud iam service-accounts create form-brain --display-name="Khalihan AI — Claude reads a page" --project "$P"
for role in roles/datastore.user roles/firebaseappcheck.tokenVerifier; do
  for i in 1 2 3 4 5 6; do
    if gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
         --role="$role" --quiet >/dev/null 2>&1; then break; fi
    echo "   (waiting for the new account to appear…)"; sleep 10
  done
done

echo "== 3/6 Anthropic's key, in Secret Manager"
if gcloud secrets describe "$SECRET" --project "$P" >/dev/null 2>&1 && [ -z "${KH_NEW_KEY:-}" ]; then
  echo "   already there (kept as it is)"
else
  echo "   Paste the key from console.anthropic.com (it starts with sk-ant-) and press Enter."
  echo "   Nothing shows while you paste — that is right."
  KEY=""
  read -rs KEY </dev/tty
  KEY=$(printf '%s' "$KEY" | tr -d '[:space:]')
  case "$KEY" in
    sk-ant-*) ;;
    *) echo "   That does not look like Anthropic's key (it must start with sk-ant-). Nothing was saved."; exit 1 ;;
  esac
  if [ "${#KEY}" -lt 40 ]; then echo "   Too short for a key. Nothing was saved."; exit 1; fi
  if gcloud secrets describe "$SECRET" --project "$P" >/dev/null 2>&1; then
    printf '%s' "$KEY" | gcloud secrets versions add "$SECRET" --data-file=- --project "$P" >/dev/null
  else
    printf '%s' "$KEY" | gcloud secrets create "$SECRET" --replication-policy=automatic --data-file=- --project "$P" >/dev/null
  fi
  echo "   saved (${#KEY} characters)"
  KEY=""
fi
gcloud secrets add-iam-policy-binding "$SECRET" --project "$P" --member="serviceAccount:$SA" \
  --role=roles/secretmanager.secretAccessor --quiet >/dev/null

echo "== 4/6 The code (github.com/kamranshah501-del/khalihan-server, brain/)"
D=$(mktemp -d)
git clone -q --depth 1 -b "${KH_BRANCH:-main}" https://github.com/kamranshah501-del/khalihan-server "$D/s"
cd "$D/s/brain"
node test.js
node test_handler.js

echo "== 5/6 Deploying form-brain in $R (a few minutes)"
gcloud functions deploy form-brain --gen2 --region="$R" --runtime=nodejs22 \
  --entry-point=formBrain --source=. --trigger-http --allow-unauthenticated \
  --service-account="$SA" --set-env-vars="GOOGLE_CLOUD_PROJECT=$P" \
  --set-secrets="ANTHROPIC_API_KEY=$SECRET:latest" \
  --memory=256Mi --max-instances=5 --timeout=40s --project "$P" --quiet \
  --format='value(state)'

echo "== 6/6 Test: a call that is not from the app, and the wake-up call"
URL="https://$R-$P.cloudfunctions.net/form-brain"
sleep 5
curl -s -X POST "$URL" -H 'Content-Type: application/json' -d '{}' -w "  (HTTP %{http_code} — 401 is right)\n" || true
curl -s -o /dev/null -w "  wake-up: HTTP %{http_code} — 204 is right\n" "$URL" || true
echo
echo "== FORM-BRAIN READY: $URL"
echo "   Khalihan Admin → 🧠 AI Forms chooses which brain reads the forms (Gemini or Claude) and whether the other steps in."
