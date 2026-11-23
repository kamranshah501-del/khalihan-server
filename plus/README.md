# plus-verify — our server's check of a Khalihan Plus purchase

Owner, 16 Nov 2026: "server par payment ki jaanch — haan" (step 5 of the
Plus plan). A Cloud Run function in Mumbai (`asia-south1`), Node 22.

**What it does.** The app (v1.0.9) sends a Google Play purchase token with
the farmer's login. The function asks Google Play (Android Publisher API)
whether the purchase is real, live, ours and made from this login (the app
gives Play `sha256("khalihan:" + uid)`, never the phone number), lets one
token serve one login only (`plus_tokens/{sha256}`), writes the farmer's plan
to `users/{uid}/plus/state` (the app only reads it — `firestore.rules`),
acknowledges the purchase with Play and answers the app. Only then the app
opens Plus and completes the purchase. Anything refused opens nothing, and
Play refunds a purchase nobody acknowledged within three days.

App Check is only noted in the log, never a reason to refuse: a farmer who
paid must not be shut out because his phone's App Check failed (App Check is
enforced on Khalihan AI only — owner's rule).

**Files.** `index.js` (the HTTP function), `decide.js` (what Google's answer
means — no Google libraries, tested by `node test.js`), `deploy.sh`.

**Set up / update** — Cloud Shell, as the project owner:

    bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/plus/deploy.sh)

It turns on the APIs, makes the service account
`plus-verify@<project>.iam.gserviceaccount.com` (Firestore user, App Check
verifier), deploys, and calls the function without a login (answer: 401).

**Once, by the owner — Play Console → Users and permissions → Invite new
users:** that service account's e-mail; App permissions → Khalihan: *View
financial data, orders and cancellation survey responses* and *Manage orders
and subscriptions*. Google Play may take up to a day to start answering.

**Play Console products** (the ids can't change later): subscriptions
`khalihan_plus` (Kisan Plus) and `khalihan_pro` (Kisan Pro); base plans
`m1`, `m3`, `m6`, `m12` (auto-renewing; Admin reads the months from the id);
no trial offer (owner, 23 Nov 2026: the free week at login replaces it — plus_trials in firestore.rules).

**Later.** Google's real-time developer notifications (Pub/Sub) so renewals,
cancellations and refunds reach the account without the app asking; until
then the app asks the server again when a plan's date comes.
