#!/usr/bin/env bash
# Anthropic's key reaches Google's Secret Manager from GitHub's secret store
# without anyone seeing or typing it (owner, 24 Nov 2026: the key he put in
# the app repository's secrets for the AI test is the one the server uses).
# From Cloud Shell (project owner):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/brain/key_door.sh) open  <project>
#   … then the app repository's run "Anthropic's key → the server's safe" (a commit with [serverkey]) …
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/brain/key_door.sh) close <project>
# open:  makes the secret "anthropic-api-key" (empty) and lets the AI test
#        kit's GitHub identity (the service account ai-test) ADD a version to
#        it — add only: it cannot read the key back.
# close: takes that right away again and says how many keys are in the safe.
set -euo pipefail
ACT=${1:-open}
P=${2:-$(gcloud config get-value project 2>/dev/null)}
SECRET=anthropic-api-key
WHO="serviceAccount:ai-test@$P.iam.gserviceaccount.com"
ROLE=roles/secretmanager.secretVersionAdder
echo "== Project: $P"
if [ "$ACT" = open ]; then
  gcloud services enable secretmanager.googleapis.com --project "$P"
  gcloud secrets describe "$SECRET" --project "$P" >/dev/null 2>&1 \
    || gcloud secrets create "$SECRET" --replication-policy=automatic --project "$P" >/dev/null
  gcloud secrets add-iam-policy-binding "$SECRET" --project "$P" --member="$WHO" --role="$ROLE" --quiet >/dev/null
  echo "== KEY DOOR OPEN: the GitHub run may add the key now (it cannot read it)."
else
  gcloud secrets remove-iam-policy-binding "$SECRET" --project "$P" --member="$WHO" --role="$ROLE" --quiet >/dev/null 2>&1 || true
  N=$(gcloud secrets versions list "$SECRET" --project "$P" --filter='state:ENABLED' --format='value(name)' 2>/dev/null | wc -l)
  echo "== KEY DOOR CLOSED. Keys in the safe: $N"
fi
