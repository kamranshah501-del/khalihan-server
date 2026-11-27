// khalihan-weather — the farm's weather from Google, for the Khalihan app
// (owner, 27 Nov 2026: "Google ke through hi jaate hain … Google ka weather
// rahega to phir sahi rahega"). A Cloud Run function in Mumbai
// (`asia-south1`), Node 22, beside form-brain.
//
// The app (lib/services/weather_service.dart) asks GET ?lat=&lon= with its
// App Check proof, and gets Open-Meteo's shape back (core.answer) — what it
// has always read. Here:
//   1. only the real Khalihan app is answered (App Check);
//   2. the place is rounded to a cell of about 5 km — farmers in one cell
//      share one answer, kept 55 minutes and then deleted (Google allows one
//      hour for hourly values; nothing older is ever served);
//   3. Google is asked at most `day` times a day, everyone together, so a
//      mistake or a misuse cannot run the bill up — over it, the app hears
//      429 and says the weather could not be loaded;
//   4. Google signs this function in by its own service account: there is
//      no key anywhere.
// The log has counts and times only — never a place.

const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const core = require('./core.js');

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'mandi-price-tracker-756ea';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

// config/app → weather, read at most once a minute.
let kept = { at: 0, v: core.settings(null) };
async function settings() {
  if (Date.now() - kept.at < 60000) return kept.v;
  try {
    const snap = await db.doc('config/app').get();
    kept = { at: Date.now(), v: core.settings(snap.exists ? snap.data().weather : null) };
  } catch (_) {
    kept = { at: Date.now() - 45000, v: kept.v }; // try again in 15 s
  }
  return kept.v;
}

const note = (o) => console.log(JSON.stringify({ weather: o.is, ...o, is: undefined }));

// Google's sign-in for this function's own service account.
let token = { v: '', until: 0 };
async function googleToken() {
  if (token.v && Date.now() < token.until) return token.v;
  const r = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
    headers: { 'Metadata-Flavor': 'Google' },
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) throw Object.assign(new Error(`sign-in ${r.status}`), { code: 0 });
  const j = await r.json();
  token = { v: j.access_token, until: Date.now() + Math.max(60, (j.expires_in || 300) - 120) * 1000 };
  return token.v;
}

async function google(path, params) {
  const t = await googleToken();
  const r = await fetch(`https://weather.googleapis.com/v1/${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${t}`, 'X-Goog-User-Project': PROJECT },
    signal: AbortSignal.timeout(12000),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(`google ${r.status}`), { code: r.status });
  return j;
}

// One fresh answer: the days (one call) and the hours, 24 a call.
async function ask(cell, s) {
  const loc = { 'location.latitude': cell.lat, 'location.longitude': cell.lon };
  // Asked beside the hours; its failure is held, never left unhandled (in
  // Node 22 an unhandled one stops the whole instance).
  const days = google('forecast/days:lookup', { ...loc, days: s.days, pageSize: s.days }).then(
    (v) => ({ v }),
    (e) => ({ e }),
  );
  const pages = [];
  let pageToken = '';
  for (let i = 0; i < Math.ceil(s.hours / 24); i++) {
    const p = await google('forecast/hours:lookup', { ...loc, hours: s.hours, pageSize: 24, ...(pageToken ? { pageToken } : {}) });
    pages.push(p);
    pageToken = (p && p.nextPageToken) || '';
    if (!pageToken) break;
  }
  const d = await days;
  if (d.e) throw d.e;
  return { days: d.v, pages };
}

// Kept answers, in this instance too (saves a read per request).
const mem = new Map();
function fromMemory(id, now, keepMs) {
  const b = mem.get(id);
  if (!b) return null;
  if (now - b.at > keepMs) {
    mem.delete(id);
    return null;
  }
  return b;
}
function sweepMemory(now, keepMs) {
  for (const [id, b] of mem) if (now - b.at > keepMs) mem.delete(id);
}

// Answers older than the keeping time are deleted (Google's terms), a few
// at a time while the function works anyway.
async function sweepStore(cutoff) {
  const old = await db.collection('wx_cache').where('at', '<', cutoff).limit(25).get();
  await Promise.allSettled(old.docs.map((d) => d.ref.delete()));
  return old.size;
}

functions.http('weather', async (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const started = Date.now();
  try {
    await admin.appCheck().verifyToken(req.get('X-Firebase-AppCheck') || '');
  } catch (_) {
    return res.status(401).json({ error: 'app' });
  }
  const q = req.method === 'GET' ? req.query || {} : req.body || {};
  const cell = core.cellOf(q.lat, q.lon);
  if (!cell) return res.status(400).json({ error: 'place' });
  const s = await settings();
  if (s.off) return res.status(503).json({ error: 'off' });

  const now = Date.now();
  const keepMs = s.keepMin * 60000;
  const dayDoc = db.doc(`wx_use/${core.dayId(new Date(now))}`);
  const cacheDoc = db.doc(`wx_cache/${cell.id}`);
  sweepMemory(now, keepMs);

  // 1. An answer kept for this cell, under an hour old.
  let b = fromMemory(cell.id, now, keepMs);
  if (!b) {
    try {
      const snap = await cacheDoc.get();
      const d = snap.exists ? snap.data() : null;
      if (d && typeof d.b === 'string' && now - d.at <= keepMs) b = JSON.parse(d.b);
    } catch (_) {
      b = null;
    }
  }
  let out = b ? core.answer(b, cell, now) : null;
  if (out) {
    mem.set(cell.id, b);
    await dayDoc.set({ hit: FieldValue.increment(1) }, { merge: true }).catch(() => {});
    note({ is: 'kept', ms: Date.now() - started });
    return res.json(out);
  }

  // 2. Google, within the day's calls.
  const cost = core.callsFor(s);
  try {
    const d = await dayDoc.get();
    if (((d.data() || {}).n || 0) + cost > s.day) {
      note({ is: 'full' });
      return res.status(429).json({ error: 'day' });
    }
  } catch (e) {
    note({ is: 'error', where: 'count', message: String((e && e.message) || e).slice(0, 160) });
    return res.status(503).json({ error: 'count' });
  }
  const counted = dayDoc
    .set({ n: FieldValue.increment(cost), asked: FieldValue.increment(1), at: FieldValue.serverTimestamp() }, { merge: true })
    .catch(() => {});
  const swept = sweepStore(now - keepMs).catch(() => 0);
  let got;
  const asked = Date.now();
  try {
    got = await ask(cell, s);
  } catch (e) {
    await Promise.allSettled([counted, swept]);
    const slow = e && (e.name === 'TimeoutError' || e.name === 'AbortError');
    note({ is: slow ? 'slow' : 'error', where: 'google', code: (e && e.code) || 0, ms: Date.now() - asked });
    return res.status(slow ? 504 : e && e.code === 429 ? 429 : 502).json({ error: 'google', code: (e && e.code) || 0 });
  }
  b = core.bundle(got.days, got.pages, cell.lat, now);
  out = core.answer(b, cell, now);
  if (!out) {
    await Promise.allSettled([counted, swept]);
    note({ is: 'empty', hours: b.hours.length, days: b.days.length });
    return res.status(502).json({ error: 'empty' });
  }
  mem.set(cell.id, b);
  const [, , gone] = await Promise.allSettled([cacheDoc.set({ at: now, b: JSON.stringify(b) }), counted, swept]);
  note({ is: 'asked', hours: b.hours.length, days: b.days.length, googleMs: Date.now() - asked, ms: Date.now() - started, swept: (gone && gone.value) || 0 });
  return res.json(out);
});
