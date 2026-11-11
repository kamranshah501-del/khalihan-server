# Play Data safety — changes for the Khalihan AI release (DRAFT)

Branch `ai-privacy`, 11 Nov 2026. Not sent to Play. Fill these in Play Console →
App content → Data safety **on the day Khalihan AI is switched on for farmers**
(H5 in "Khalihan AI — saare hisse (3-3)"), together with the privacy page in
this branch (`docs/privacy.html` — the one source, copied into the Admin site at deploy).

## What changes

| Play question | Answer for Khalihan AI | Why |
| --- | --- | --- |
| Data type: **App activity → Other user-generated content** | **Collected**: yes. **Shared**: no | The words of a question go to Google (Gemini on Vertex AI) only as our service provider, which Play counts as collected, not shared. "गलत लगा?" reports are stored in our Firestore. |
| Is it processed ephemerally? | **No** | Vertex AI may keep it in memory up to 24 h and may log it for abuse checks, so it is not "ephemeral" in Play's sense. |
| Is collection required or optional? | **Optional** | Only when the farmer uses Khalihan AI and the phone could not understand the question. |
| Purpose | **App functionality** | Understanding the question; fixing wrong answers. Not analytics, not ads. |
| **Audio → Voice or sound recordings** | **Not collected** | Voice typing is the phone's own service (Android `RecognizerIntent`); Khalihan gets only text and has no microphone permission. |
| Personal info (name, phone, etc.) for AI | **No change** | Rule 5: questions with Aadhaar, bank, OTP, passwords or 7+ digits are never sent; no name or number goes with a question. |
| Data encrypted in transit | Yes (unchanged) | HTTPS to Firebase AI Logic. |
| Users can request deletion | Yes (unchanged) | Email in the privacy page; account deletion in the app. |

## Also on that day

- **AI-generated content policy:** the in-app report button exists ("गलत लगा?" under every AI answer → Admin → Suggestions). Every answer shows "AI से बना" and its source.
- **Plus / login:** if Khalihan AI is only for logged-in Plus members, the login and purchase rows (already "Login (optional)" in the privacy page) stay as they are; add Play Billing's purchase history only if Play asks (Google handles the payment).
- **Voice:** the live page (10 Nov) already says voice search uses the phone's own voice typing and Khalihan never gets the voice; the draft only adds "or asking".

## Sources

- Google Cloud, [Gemini on Vertex AI: data governance](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/data-governance) — no training on customer data; in-memory cache up to 24 h; abuse-monitoring logs.
- Google Play, [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469) — "collected" vs "shared", service providers, ephemeral processing.
