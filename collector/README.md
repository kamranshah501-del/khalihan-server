# Khalihan price collector

**Why:** since Sept 2026 the government price API (data.gov.in) does not answer
cloud servers (GitHub's runner gets a connection timeout), but it answers an
ordinary home or mobile connection. So a phone or small computer with such a
connection reads the prices and hands them to the daily job.

```
data.gov.in ──► phone / Jamner computer (collect.py) ──► GitHub repo khalihan-feed
            ──► daily_prices.py (GitHub, 6 runs a day) ──► Firestore ──► app
```

- `collect.py` — standard-library Python. Every round reads all states
  (pages of 1,000), keeps only the fields the job uses, and replaces
  `latest.json.gz` in **khalihan-feed** with one fresh commit (no history).
  Skips the upload when nothing changed (but refreshes every 6 h). A state
  that fails keeps its last good copy with its own time.
- `feed.py` (repo root) — the daily job reads the feed first; states read in
  the last 30 h are used exactly like rows fetched directly (source `phone`).
  Missing states still try data.gov.in, then the second sources (MSAMB, eNAM).
- Admin → Switches → States shows "📱 Khalihan collector: N states" and
  "via data.gov.in · 📱" per state.

## Secrets — only on the collector
`~/.khalihan/key` (data.gov.in key) and `~/.khalihan/token` (GitHub
fine-grained token: **khalihan-feed only, Contents: Read and write** — it
cannot touch this repo or Firebase). Lost phone → delete the token on GitHub.
The feed repo is public on purpose: it holds only public government prices,
and the job reads it without a key.

## Android (Termux)
1. GitHub → new repo `khalihan-feed`, Public, with a README.
2. GitHub → Settings → Developer settings → Fine-grained tokens → new token,
   only `khalihan-feed`, Contents: Read and write.
3. Install Termux (F-Droid), then:
   `curl -fsSL https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/collector/setup_termux.sh | bash`
4. `khalihan` (keeps running, every 3 h) · `khalihan log` · `khalihan once` · `khalihan update`.
   Termux battery: Unrestricted. Wi-Fi + charger.

## Later: a computer at Jamner
Same script on any always-on Linux box (e.g. a Raspberry Pi): put `key` and
`token` in `~/.khalihan/`, and a cron line like
`0 */3 * * * python3 ~/khalihan-server/collector/collect.py`.
