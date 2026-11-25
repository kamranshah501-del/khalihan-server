// form-brain — Claude reads a government page for Khalihan AI (owner,
// 24 Nov 2026: "Admin mein 2 option rakhna hai form bharne ke liye, ek
// Gemini ka aur ek Sonnet … jo sahi raha usko switch mein rakhenge, doosre
// ko optional").
//
// The app reaches Gemini through Firebase itself. Claude has no such road,
// and its key must never be in the app — so the app sends the page here,
// and this function, which alone holds the key (Secret Manager), asks
// Anthropic. Here:
//   1. only the real Khalihan app is answered (App Check — required here,
//      as it is for Khalihan AI everywhere);
//   2. the farmer's login is noted when there is one (his own share a day);
//   3. a day's pages are capped — for everyone together and for one login —
//      so a mistake or a misuse cannot run the bill up;
//   4. Anthropic is asked for an answer in one of two fixed shapes (core.js)
//      — a reading of a page, or one turn of the whole work ("full unlock",
//      25 Nov 2026: what the phone should do, where the work stands, what
//      to tell the farmer) — and the app gets that answer.
// What is sent is what the app sends Gemini: the page's words with long
// numbers hidden, its boxes' labels, the names (never the values) of the
// details the phone holds — and, in a turn, what the farmer said (a number
// of 9 digits or more only as a mark) and what the boxes hold that are not
// private. Nothing of it is kept or logged here — the log has only counts
// and times.

const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin'); // used the same way as plus/index.js
const core = require('./core.js');

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'mandi-price-tracker-756ea';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

// config/app → form_brain, read at most once a minute.
let kept = { at: 0, v: core.settings(null) };
async function settings() {
  if (Date.now() - kept.at < 60000) return kept.v;
  try {
    const snap = await db.doc('config/app').get();
    kept = { at: Date.now(), v: core.settings(snap.exists ? snap.data().form_brain : null) };
  } catch (_) {
    kept = { at: Date.now() - 45000, v: kept.v }; // try again in 15 s
  }
  return kept.v;
}

const note = (o) => console.log(JSON.stringify({ formBrain: o.is, ...o, is: undefined }));

functions.http('formBrain', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  // The app's "wake up" when a farmer opens a government site: nothing is
  // read, nothing is asked.
  if (req.method === 'GET') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const started = Date.now();
  try {
    await admin.appCheck().verifyToken(req.get('X-Firebase-AppCheck') || '');
  } catch (_) {
    return res.status(401).json({ error: 'app' });
  }
  let uid = null;
  const id = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (id) {
    try {
      uid = (await admin.auth().verifyIdToken(id)).uid;
    } catch (_) {
      uid = null;
    }
  }
  if (core.badBody(req.body)) return res.status(400).json({ error: 'bad' });
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  const s = await settings();
  if (!key || s.off) return res.status(503).json({ error: 'off' });
  const model = core.modelFor(req.body.model, s);
  const kind = req.body.kind === 'turn' ? 'turn' : 'page';

  // The day's shares. When they cannot be read nothing is asked (the app
  // then reads the page with its other brain).
  const dayDoc = db.doc(`brain_use/${core.dayId(new Date())}`);
  const whoDoc = dayDoc.collection('who').doc(uid || 'nologin');
  try {
    const [d, w] = await Promise.all([dayDoc.get(), whoDoc.get()]);
    const why = core.overCap({ day: (d.data() || {}).n || 0, who: (w.data() || {}).n || 0, login: !!uid }, s);
    if (why) {
      note({ is: 'full', why, login: !!uid });
      return res.status(429).json({ error: why });
    }
  } catch (e) {
    note({ is: 'error', where: 'count', message: String((e && e.message) || e).slice(0, 160) });
    return res.status(503).json({ error: 'count' });
  }
  const counted = Promise.allSettled([
    dayDoc.set({ n: FieldValue.increment(1), at: FieldValue.serverTimestamp() }, { merge: true }),
    whoDoc.set({ n: FieldValue.increment(1) }, { merge: true }),
  ]);

  const asked = Date.now();
  let out;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(core.request({ system: req.body.system, page: req.body.page, now: req.body.now, model, kind })),
      signal: AbortSignal.timeout(s.timeoutMs),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      await counted;
      // Anthropic's own word for what went wrong (its kind only, never the request).
      note({ is: 'claude', code: r.status, kind: (j && j.error && j.error.type) || '', ms: Date.now() - asked });
      return res.status(r.status === 429 || r.status === 529 ? 429 : 502).json({ error: 'claude', code: r.status });
    }
    out = core.answer(j);
  } catch (e) {
    await counted;
    const slow = e && (e.name === 'TimeoutError' || e.name === 'AbortError');
    note({ is: slow ? 'slow' : 'error', where: 'claude', ms: Date.now() - asked, message: slow ? '' : String((e && e.message) || e).slice(0, 160) });
    return res.status(slow ? 504 : 502).json({ error: slow ? 'slow' : 'claude' });
  }
  await counted;
  if (out.in || out.out) {
    await dayDoc.set({ in: FieldValue.increment(out.in || 0), out: FieldValue.increment(out.out || 0) }, { merge: true }).catch(() => {});
  }
  if (!out.ok) {
    note({ is: 'unread', why: out.why, model, ms: Date.now() - asked });
    return res.status(502).json({ error: out.why });
  }
  note({ is: 'ok', kind, model, in: out.in, kept: out.kept, out: out.out, claudeMs: Date.now() - asked, ms: Date.now() - started, login: !!uid });
  return res.json({ text: out.text, model, in: out.in, out: out.out, ms: Date.now() - asked, all: Date.now() - started });
});
