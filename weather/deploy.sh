#!/usr/bin/env bash
# khalihan-weather — the farm's weather from Google for the Khalihan app.
# Set up or update it, from Cloud Shell (project owner):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/weather/deploy.sh)
# Before the branch is merged:
#   KH_BRANCH=weather-google bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/weather-google/weather/deploy.sh)
# Safe to run again. No key: Google signs the function in by its own service
# account. Ends with a call that is not from the app (must answer 401).
set -euo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
R=asia-south1
SA="khalihan-weather@$P.iam.gserviceaccount.com"
echo "== Project: $P"

echo "== 1/5 Turning on the Google services it needs (a minute)"
gcloud services enable cloudfunctions.googleapis.com run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com firebaseappcheck.googleapis.com firestore.googleapis.com \
  weather.googleapis.com --project "$P"

echo "== 2/5 Service account khalihan-weather (the cache and the day's count in Firestore, App Check, Google's Weather API)"
gcloud iam service-accounts describe "$SA" --project "$P" >/dev/null 2>&1 \
  || gcloud iam service-accounts create khalihan-weather --display-name="Khalihan — the farm's weather from Google" --project "$P"
for role in roles/datastore.user roles/firebaseappcheck.tokenVerifier roles/serviceusage.serviceUsageConsumer; do
  for i in 1 2 3 4 5 6; do
    if gcloud projects add-iam-policy-binding "$P" --condition=None --member="serviceAccount:$SA" \
         --role="$role" --quiet >/dev/null 2>&1; then break; fi
    echo "   (waiting for the new account to appear…)"; sleep 10
  done
done

echo "== 3/5 The code (github.com/kamranshah501-del/khalihan-server, weather/)"
D=$(mktemp -d)
git clone -q --depth 1 -b "${KH_BRANCH:-main}" https://github.com/kamranshah501-del/khalihan-server "$D/s"
cd "$D/s/weather"
node test.js
node test_handler.js

echo "== 4/5 Deploying khalihan-weather in $R (a few minutes)"
gcloud functions deploy khalihan-weather --gen2 --region="$R" --runtime=nodejs22 \
  --entry-point=weather --source=. --trigger-http --allow-unauthenticated \
  --service-account="$SA" --set-env-vars="GOOGLE_CLOUD_PROJECT=$P" \
  --memory=256Mi --max-instances=5 --timeout=30s --project "$P" --quiet \
  --format='value(state)'

echo "== 5/5 Test: a call that is not from the app"
URL="https://$R-$P.cloudfunctions.net/khalihan-weather"
sleep 5
curl -s "$URL?lat=21.0&lon=75.56" -w "  (HTTP %{http_code} — 401 is right)\n" || true
echo
echo "== KHALIHAN-WEATHER READY: $URL"
echo "   Khalihan Admin → Features → \"Weather from Google\" turns it on for farmers (test phones see it already)."
