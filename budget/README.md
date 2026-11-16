# Budget stop

Google Cloud budgets only send emails. This function makes the budget **do**
something: the first time in a month that the Firebase project's cost reaches
its budget, it switches **Khalihan AI** off for every phone
(`config/app → features.ai = false`, the same switch as Admin → Switches →
Khalihan AI) and leaves a line in Admin's change log ("Google Cloud budget").
The rest of the app keeps working. If the owner turns AI back on, it stays on
until the next month's budget is used up (`status/budget_stop` keeps the month).

The amount and the alert emails are set in Google Cloud → Billing → Budgets &
alerts (not in this repo). Billing data arrives a few hours late, so a little
more than the budget can be spent before the stop.

## How it is wired

Budget (Billing) → Pub/Sub topic `budget-alerts` → this function
(`budget-stop`, Cloud Run functions, asia-south1) → Firestore.
It runs as the service account `budget-stop@<project>` with only
**Cloud Datastore User** (Firestore read/write).

## Deploy (Cloud Shell, project owner)

One line (`budget/deploy.sh`, safe to run again; ends with a test message):

```bash
bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/budget/deploy.sh)
```

The same, step by step:

```bash
P=<project id>
gcloud config set project $P
gcloud services enable pubsub.googleapis.com cloudfunctions.googleapis.com run.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com eventarc.googleapis.com
gcloud pubsub topics create budget-alerts
gcloud iam service-accounts create budget-stop --display-name="Khalihan budget stop"
gcloud projects add-iam-policy-binding $P --condition=None \
  --member=serviceAccount:budget-stop@$P.iam.gserviceaccount.com --role=roles/datastore.user
git clone --depth 1 https://github.com/kamranshah501-del/khalihan-server && cd khalihan-server/budget
gcloud functions deploy budget-stop --gen2 --region=asia-south1 --runtime=nodejs22 \
  --entry-point=budgetStop --source=. --trigger-topic=budget-alerts \
  --service-account=budget-stop@$P.iam.gserviceaccount.com \
  --trigger-service-account=budget-stop@$P.iam.gserviceaccount.com \
  --memory=256Mi --max-instances=1 --no-allow-unauthenticated
```

## Check it safely

A message with `"khalihanTest": true` is only logged ("test"), never acted on:

```bash
gcloud pubsub topics publish budget-alerts --message='{"budgetDisplayName":"test","costAmount":2,"budgetAmount":1,"currencyCode":"INR","costIntervalStart":"2000-01-01T00:00:00Z","khalihanTest":true}'
gcloud functions logs read budget-stop --gen2 --region=asia-south1 --limit=10
```

`node test.js` checks the decision (no Google libraries needed).
