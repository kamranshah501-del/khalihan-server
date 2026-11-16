#!/usr/bin/env bash
# Khalihan budget stop — send a test message (only logged, never acted on) and
# show the function's last lines. Cloud Shell:
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/budget/check.sh)
set -euo pipefail
P=${1:-$(gcloud config get-value project 2>/dev/null)}
gcloud pubsub topics publish budget-alerts --project "$P" \
  --message='{"budgetDisplayName":"test","costAmount":2,"budgetAmount":1,"currencyCode":"INR","costIntervalStart":"2000-01-01T00:00:00Z","khalihanTest":true}' >/dev/null
echo "Test message sent; waiting 40 s…"
sleep 40
gcloud functions logs read budget-stop --gen2 --region=asia-south1 --project "$P" --limit=6 \
  --format='value(time_utc,level,log)'
