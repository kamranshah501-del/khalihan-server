# khalihan-weather — the farm's weather from Google

Owner, 27 Nov 2026: "agar Google sahi raha to phir Google pe hi leke jaate
hain, Open-Meteo ko chhod dete … 3000 bahut zyada ho raha hai … Google ka
weather rahega to phir sahi rahega." A Cloud Run function in Mumbai
(`asia-south1`), Node 22, beside form-brain.

**Why.** Open-Meteo's free plan is for non-commercial use; its paid plan is
about ₹3,000 a month. Nine days against IMD's own thermometers at 36
Maharashtra stations (functions/alerts/wx_compare.py, 19–27 Nov 2026):

| | today's max | today's min | tomorrow's max | tomorrow's min |
|---|---|---|---|---|
| Open-Meteo | ±1.90 °C | ±2.31 °C | ±1.88 °C | ±2.17 °C |
| Google | ±1.66 °C | ±1.59 °C | ±1.87 °C | ±1.37 °C |

(Rain: one rainy station-day in nine dry November days — not judged yet;
the comparison goes on.)

**What it does.** The app (`lib/services/weather_service.dart`, switch
"Weather from Google") asks `GET ?lat=&lon=` with its App Check proof and
gets back Open-Meteo's own shape — what it has always read — so nothing else
in the app changes. Here:

1. Only the real Khalihan app is answered (App Check).
2. The place is rounded to a cell of 0.05° (about 5 km). Google is asked
   about the cell's centre, never the farmer's own spot; farmers in one cell
   share one answer.
3. A cell's answer is kept 55 minutes (`wx_cache/{cell}`, and in the
   instance's memory), then deleted. Google's terms (Maps Service Specific
   Terms 19.2): current and hourly values one hour, daily values 24 hours.
   Nothing older is ever served; old answers are deleted as the function
   works.
4. Google is asked at most `day` times a day, everyone together
   (`wx_use/dYYYYMMDD`: `n` calls, `asked` fresh answers, `hit` kept
   answers). Over it the app hears 429 and says the weather could not be
   loaded — a mistake or a misuse cannot run the bill up.
5. No key anywhere: Google signs the function in by its own service account.
6. The log has counts and times only — never a place.

**One fresh answer = 3 Google calls**: the 7 days (one call) and 48 hours
(Google gives 24 a call). The app shows the hours of today and tomorrow; for
the days after, the day's own forecast (its pages leave out the hours they
don't have).

**What Google does not give.** Soil moisture (the "field water" card leaves
that line out). ET0 is worked out here by Hargreaves (FAO-56) from Google's
highest and lowest temperature, the latitude and the date — Khalihan's
calculation, never shown as Google's.

**Attribution.** Google requires "Includes Google weather data" (or the
Google Maps logo) next to its weather; the app's weather page carries it.

**Settings** (optional, `config/app` → `weather`): `day` (Google calls a
day, 4000), `hours` (24–240, 48), `keepMin` (5–59, 55), `off: true`
(answers 503 at once).

**Cost.** Weather Usage is one SKU. India billing account: 70,000 calls a
month free, then $0.06 per 1,000. Any other billing account: 10,000 free,
then $0.15 per 1,000 (to 100,000). At most `day` × 30 calls a month (4,000 →
1,20,000: about $3 on India pricing, about $16 elsewhere). The function costs
nothing while idle.

**Files.** `index.js` (the HTTP function), `core.js` (Google → Open-Meteo's
shape, the cell, ET0, the settings — no libraries), `fixture.js` (Google's
answers as the tests use them), `test.js`, `test_handler.js` (the function
with Google, App Check and Firestore played by stand-ins), `deploy.sh`.

**Set up / update** — Cloud Shell, as the project owner:

    bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/weather/deploy.sh)

Then Khalihan Admin → 🌦️ Weather → "Weather from Google". The owner's test
phone sees it at once.

**To take it away again:** Admin → "Weather from Google" off (the app goes
back to Open-Meteo); then
`gcloud functions delete khalihan-weather --gen2 --region=asia-south1`.
