# form-brain — Claude reads a government page for Khalihan AI

Owner, 24 Nov 2026: "Admin mein 2 option rakhna hai form bharne ke liye, ek
Gemini ka aur ek Sonnet … jo sahi raha usko switch mein rakhenge, doosre ko
optional." A Cloud Run function in Mumbai (`asia-south1`), Node 22.

**Why a function.** The app reaches Gemini through Firebase itself. Claude
has no such road, and its key must never be inside the app. So the app
(v1.0.9, `lib/ai/gov_brain.dart`) sends the page here; this function, which
alone holds the key, asks Anthropic and hands the reading back.

**What it does.**

1. Answers only the real Khalihan app (App Check — required here).
2. Notes the farmer's login when there is one.
3. Caps a day's pages: 1500 for everyone together, 150 for one login, 300
   for all phones without a login together (`brain_use/dYYYYMMDD`, the day in
   India; only this function can read or write it).
4. Asks Anthropic for a reading in one fixed shape (`core.js`, the same 14
   keys the app gives Gemini) — whatever is sent, nothing else can come
   back, so the function is no chat with our key.

**What is sent to Anthropic** is what the app already sends Gemini: the
page's words with long numbers hidden, its boxes' labels, the *names* (never
the values) of the details the phone holds. Nothing of it is kept or logged
here; the log has counts and times only. Anthropic's computers are in the
USA — the privacy page and Play's data-safety form must say so before Claude
is switched on for every farmer.

**Which brain reads** is chosen in Khalihan Admin → 🧠 AI Forms → "Model
that reads the page": First and "If it fails" (`models`, for example
`["claude-sonnet-5-5", "gemini-3.8-flash"]`). When the first does not answer
within 15 seconds, or refuses, the other reads the page. On test phones
first, like every AI Forms change. Apps before 1.0.9 skip a Claude name.

**Which Claude model.** The one the app names (Admin → AI Forms), when it is
one this function allows: `claude-sonnet-5-5` or `claude-haiku-5-5`;
otherwise Sonnet 5.5.

**Settings** (optional, `config/app` → `form_brain`): `model` (pins one
Claude model whatever the app names), `day`, `user`, `nologin` (the caps),
`off: true` (answers 503 at once; the app reads with Gemini).

**Files.** `index.js` (the HTTP function), `core.js` (the shape, the caps,
what is sent and how the reply is read — no libraries), `test.js`,
`test_handler.js` (the function with Google and Anthropic played by
stand-ins), `deploy.sh`, `key_door.sh`.

**Set up / update** — Cloud Shell, as the project owner:

    bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/brain/deploy.sh)

When Anthropic's key is not in Secret Manager yet it asks for it
(console.anthropic.com → API keys). Paste it and press Enter; nothing shows.
It goes to Secret Manager (`anthropic-api-key`) and nowhere else. A new key
later: `KH_NEW_KEY=1 bash <(curl -s …/brain/deploy.sh)`.

On 24 Nov 2026 the key came without anyone typing it: `key_door.sh open`
let the AI test kit's GitHub identity *add* a version (never read one), the
app repository's run "Anthropic's key → the server's safe" copied the
repository secret `ANTHROPIC_API_KEY` there, and `key_door.sh close` took
the right away again.

**To take it away again:** Admin → AI Forms → brain "Gemini", backup off;
then `gcloud functions delete form-brain --gen2 --region=asia-south1`,
`gcloud secrets delete anthropic-api-key`, and delete the key at Anthropic.

**Cost.** About 0.8 US cent a page with Sonnet 5.5 (tool/ai_compare in the
app repository, 24 Nov 2026); the function itself costs nothing while idle
(no instance is kept warm — the first page after a quiet spell takes a
second or two longer; the app wakes the function when a farmer opens a
government site).
