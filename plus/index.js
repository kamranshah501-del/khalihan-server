// Khalihan Plus — our server's check of a Google Play purchase (owner,
// 16 Nov 2026: "server par payment ki jaanch — haan").
//
// The app, after Play's payment sheet, sends {product, token} with the
// farmer's login (Firebase ID token) and App Check. Here:
//   1. the login is checked (App Check is only noted: a farmer who has paid
//      is never refused because his phone's App Check failed — owner's rule,
//      App Check is enforced on AI only; Google's answer is the real check);
//   2. Google Play is asked about the token (Android Publisher API, as the
//      service account plus-verify, which the owner adds in Play Console);
//   3. the purchase must be ours, live, and made from this login (the hash
//      the app gave Play);
//   4. one token serves one login only (plus_tokens/{sha256});
//   5. the farmer's account gets users/{uid}/plus/state (the app only reads
//      it), the purchase is acknowledged with Play, and the app is answered.
// Nothing about the farmer goes to Google but the token.

const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const { decide, accountId, tokenKey, TIERS } = require('./decide.js');

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'mandi-price-tracker-756ea';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const { FieldValue, Timestamp } = admin.firestore;

const PKG = 'in.khalihan.app';
const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PKG}/purchases`;
const google = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });

functions.http('plusVerify', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  let uid;
  try {
    const id = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    uid = (await admin.auth().verifyIdToken(id)).uid;
  } catch (_) {
    return res.status(401).json({ error: 'login' });
  }
  let appCheck = 'none';
  const check = req.get('X-Firebase-AppCheck');
  if (check) {
    try {
      await admin.appCheck().verifyToken(check);
      appCheck = 'ok';
    } catch (_) {
      appCheck = 'bad';
    }
  }
  const { product, token } = req.body || {};
  if (!TIERS[product] || typeof token !== 'string' || token.length < 10 || token.length > 2000) {
    return res.status(400).json({ error: 'bad' });
  }
  try {
    const client = await google.getClient();
    const r = await client.request({ url: `${API}/subscriptionsv2/tokens/${encodeURIComponent(token)}` });
    const d = decide(r.data, { product, account: accountId(uid), now: Date.now() });
    if (!d.ok) {
      console.log(JSON.stringify({ plusVerify: 'refused', why: d.why, product, appCheck }));
      return res.status(403).json({ error: d.why });
    }
    const s = d.state;
    const tok = db.doc(`plus_tokens/${tokenKey(token)}`);
    const mine = db.doc(`users/${uid}/plus/state`);
    await db.runTransaction(async (t) => {
      const snap = await t.get(tok);
      if (snap.exists && snap.data().uid !== uid) throw Object.assign(new Error('other'), { why: 'other' });
      t.set(tok, { uid, product, at: FieldValue.serverTimestamp() });
      t.set(mine, {
        tier: s.tier,
        product: s.product,
        basePlan: s.basePlan,
        offer: s.offer,
        until: Timestamp.fromMillis(s.untilMs),
        autoRenew: s.autoRenew,
        prepaid: s.prepaid,
        price: s.price,
        trial: s.trial,
        playState: s.playState,
        test: s.test,
        token,
        at: FieldValue.serverTimestamp(),
      });
    });
    if (d.acknowledge) {
      // The phone acknowledges too (completePurchase) — a miss here is not the farmer's problem.
      try {
        await client.request({
          url: `${API}/subscriptions/${product}/tokens/${encodeURIComponent(token)}:acknowledge`,
          method: 'POST',
          data: {},
        });
      } catch (e) {
        console.warn(JSON.stringify({ plusVerify: 'ack_failed', code: (e && e.response && e.response.status) || 0 }));
      }
    }
    console.log(JSON.stringify({ plusVerify: 'ok', tier: s.tier, basePlan: s.basePlan, trial: s.trial, test: s.test, appCheck }));
    return res.json({
      tier: s.tier,
      until: s.untilMs,
      autoRenew: s.autoRenew,
      trial: s.trial,
      basePlan: s.basePlan,
    });
  } catch (e) {
    if (e && e.why === 'other') return res.status(403).json({ error: 'other' });
    const code = e && e.response && e.response.status;
    console.error(JSON.stringify({ plusVerify: 'error', code: code || 0, message: String((e && e.message) || e).slice(0, 200) }));
    // Play does not know the token (or our account can't see it): refuse.
    if (code === 400 || code === 404 || code === 410) return res.status(403).json({ error: 'unknown' });
    return res.status(502).json({ error: 'play' });
  }
});
