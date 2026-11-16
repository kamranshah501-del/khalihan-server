// Khalihan — budget stop (owner, 16 Nov 2026: "ager ye limit cross ho to us
// ke baad kaise isko over kharch na ho, rok kaise sakta hoon?" → "ok kar do").
//
// Google Cloud budgets only send emails; they never stop anything. This small
// function listens to the budget's Pub/Sub topic (Google sends the month's
// cost there several times a day) and, the first time in a month that the
// cost reaches the budget, switches **Khalihan AI** off for every phone —
// config/app → features.ai = false, the same switch as Admin → Switches →
// Khalihan AI. The rest of the app (prices, weather, selling) keeps working.
//
// Once per month only: if the owner turns AI back on in Admin, it stays on
// until next month's budget is used up (status/budget_stop keeps the month).
// The budget's amount lives in Google Cloud Billing, not here.
//
// Google's billing data comes a few hours late, so a little more than the
// budget can be spent before this runs (each phone's own AI limits keep that
// small). A message with "khalihanTest": true is only logged, never acted on.

const functions = require('@google-cloud/functions-framework');
const { Firestore, FieldValue } = require('@google-cloud/firestore');

const { decide, read } = require('./decide.js');

let db;
async function budgetStop(event) {
  const n = read(event);
  if (!n) return console.warn('budget stop: not a budget message');
  db = db || new Firestore();
  const mark = db.doc('status/budget_stop');
  const what = await db.runTransaction(async (t) => {
    const snap = await t.get(mark);
    const what = decide(n, snap.exists ? snap.data() : null);
    if (what !== 'stop') return what;
    const at = FieldValue.serverTimestamp();
    const said = { cost: Number(n.costAmount), budget: Number(n.budgetAmount), currency: n.currencyCode || '' };
    t.set(db.doc('config/app'), { features: { ai: false } }, { merge: true });
    t.set(mark, { period: String(n.costIntervalStart || ''), at, ...said, name: n.budgetDisplayName || '' });
    t.create(db.collection('audit').doc(), {
      by: 'Google Cloud budget',
      at,
      action: 'feature',
      details: { key: 'ai', on: false, why: 'budget used up', ...said },
    });
    return what;
  });
  console.log(JSON.stringify({
    budgetStop: what,
    name: n.budgetDisplayName,
    cost: n.costAmount,
    budget: n.budgetAmount,
    currency: n.currencyCode,
    period: n.costIntervalStart,
  }));
}

functions.cloudEvent('budgetStop', budgetStop);

module.exports = { budgetStop };
