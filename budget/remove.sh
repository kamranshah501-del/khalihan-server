#!/usr/bin/env bash
# Khalihan budget stop — take it all away (owner, 16 Nov 2026, 09:30: "hamara
# tala nikal do, Google ka tala lagao"). Cloud Shell, project owner.
set -uo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
R=asia-south1
SA="budget-stop@$P.iam.gserviceaccount.com"
echo "== Project: $P"
echo "== 1/5 Function budget-stop (and its trigger)"
gcloud functions delete budget-stop --gen2 --region="$R" --project "$P" --quiet
echo "== 2/5 Topic budget-alerts"
gcloud pubsub topics delete budget-alerts --project "$P" --quiet
echo "== 3/5 The account's two roles on the project"
for role in roles/datastore.user roles/eventarc.eventReceiver; do
  gcloud projects remove-iam-policy-binding "$P" --condition=None --quiet \
    --member="serviceAccount:$SA" --role="$role" >/dev/null 2>&1 && echo "   removed $role"
done
echo "== 4/5 Service account budget-stop"
gcloud iam service-accounts delete "$SA" --project "$P" --quiet
echo "== 5/5 Its built image (only if nothing else is in that store)"
PK=$(gcloud artifacts packages list --repository=gcf-artifacts --location="$R" --project "$P" --format='value(name)' 2>/dev/null || true)
if [ -n "$PK" ] && ! printf '%s\n' "$PK" | grep -qv 'budget'; then
  gcloud artifacts repositories delete gcf-artifacts --location="$R" --project "$P" --quiet
else
  echo "   (left as it is: $(printf '%s' "$PK" | wc -l) other package(s) or none)"
fi
echo "== LEFT: functions=$(gcloud functions list --regions="$R" --project "$P" --format='value(name)' 2>/dev/null | grep -c budget) topics=$(gcloud pubsub topics list --project "$P" --format='value(name)' | grep -c budget-alerts)"
echo "== BUDGET STOP REMOVED"
