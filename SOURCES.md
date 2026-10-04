# Price sources — what we use, what we checked

Kept so the research is never lost when old folders are cleaned up.
Last checked: **3 October 2026**.

## In use

| Source | Covers | How | Status |
|---|---|---|---|
| **data.gov.in** (Agmarknet API) | All states, per mandi | `GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` with `api-key`, `format=json`, `limit`, `offset`, `filters[state]` | **503 / timeouts since 25 Sep 2026 — for everyone, inside India too** (tested from Kuwait, from India on a phone, and from GitHub). Server retries 5× a day; all states return on their own. |
| **MSAMB** (Maharashtra board) | Maharashtra: 12 Jalgaon APMCs + 33 districts | `msamb.py` in this repo (session cookie + the board's own JSON calls) | ✅ Working — Maharashtra stays fresh. |

## Candidate: eNAM Live Price (for many states, once it works)

- Site moved: everything is now under **`https://enam.gov.in/`** — the old `/web/...` paths only return the home page.
- Page: `https://enam.gov.in/dashboard/live_price` (open it first to get the session cookie).
- Data: **`POST https://enam.gov.in/Liveprice_ctrl/trade_data_list`**
  - Form fields: `language=en`, `stateName` (the name as shown in the state list), `fromDate`, `toDate` — dates `YYYY-MM-DD`, last 7 days only.
  - Headers like a browser: `X-Requested-With: XMLHttpRequest`, `Referer: https://enam.gov.in/dashboard/live_price`.
  - Row fields: `state`, `apmc`, `commodity`, `min_price`, `modal_price`, `max_price`, `commodity_arrivals`, `commodity_traded`, `Commodity_Uom`, `created_at`. No district — map `apmc` to a district by name.
- Other calls on that page: `Liveprice_ctrl/states_name_live`, `Liveprice_ctrl/commodity_names`, `Liveprice_ctrl/current_date`, `Liveprice_ctrl/trade_data_list_1`.
- **Status 29 Sep 2026: HTTP 500 with an empty body for every call, and the website's own table was empty too** — their backend was down. Re-test when data.gov.in recovers; if it works, it is the quickest way to add many states.
- Not useful: the "Agmarknet Price Dashboard" (`Agm_ctrl/...`) and "Trading Details" (`Ajax_ctrl/trade_data_list`) dashboards on eNAM — their data stops at **29 Jan 2021**.
- Coverage: only eNAM-linked mandis (~1,400), not every Agmarknet mandi.

## Checked and ruled out

| Source | Why not |
|---|---|
| **Agmarknet 2.0 portal** (agmarknet.gov.in) | Blocked outside India (403), and the report page needs a **CAPTCHA** — not for machines. Proper route: ask DMI for official API access. |
| **CEDA** (Ashoka University) | Updated monthly, and the API is for non-commercial use only. |
| **MP Mandi Board** (mpmandiboard.gov.in) | Its robots.txt disallows automated access — respected. Could ask them for permission. |
| **Karnataka – Krishi Marata Vahini** | Public pages stuck at 15/07/2020. |
| Other state portals tried by hand (UP: upkrishivipran, upmandiparishad; Rajasthan: rajkisan; Punjab: agripb; Haryana: agriharyana; MP: mpkrishi) | Most did not open on 30 Sep 2026; re-check one by one when adding those states. |

## Rules we keep
- Never break a CAPTCHA or go against a site's robots.txt.
- Read gently: a few requests per run, five runs a day.
- Credit every source in the app and the privacy policy.
