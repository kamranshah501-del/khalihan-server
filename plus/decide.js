// Khalihan Plus — what a Google Play subscription answer means for the
// farmer (no Google libraries here, so test.js can check it).
//
// Play's answer: purchases.subscriptionsv2.get → SubscriptionPurchaseV2
// (subscriptionState, lineItems[{productId, expiryTime, autoRenewingPlan,
// prepaidPlan, offerDetails{basePlanId, offerId}, offerPhase}],
// externalAccountIdentifiers{obfuscatedExternalAccountId},
// acknowledgementState, testPurchase).

const crypto = require('node:crypto');

const TIERS = { khalihan_plus: 'plus', khalihan_pro: 'pro' };

// Paid for and usable: active, in grace, or cancelled but not run out yet.
const LIVE = new Set([
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  'SUBSCRIPTION_STATE_CANCELED',
]);

/** The id the app gives Play with a purchase: a hash of the login id. */
function accountId(uid) {
  return crypto.createHash('sha256').update(`khalihan:${uid}`).digest('hex');
}

/** sha256 of a purchase token (the key that stops one token serving two accounts). */
function tokenKey(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/**
 * {ok:true, state, acknowledge} or {ok:false, why}.
 * why: 'product' (not ours / not this one), 'account' (bought for another
 * login), 'not_active' (expired, on hold, pending, paused).
 */
function decide(p, { product, account, now }) {
  const tier = TIERS[product];
  if (!tier || !p || !Array.isArray(p.lineItems)) return { ok: false, why: 'product' };
  const item = p.lineItems.find((i) => i && i.productId === product);
  if (!item) return { ok: false, why: 'product' };
  const owner = p.externalAccountIdentifiers && p.externalAccountIdentifiers.obfuscatedExternalAccountId;
  if (!owner || owner !== account) return { ok: false, why: 'account' };
  const until = Date.parse(item.expiryTime || '');
  if (!LIVE.has(p.subscriptionState) || !Number.isFinite(until) || until <= now) return { ok: false, why: 'not_active' };
  const offer = (item.offerDetails && item.offerDetails.offerId) || '';
  // What the farmer pays each time (with GST), when Play says it: auto-renewing plans only.
  const rp = item.autoRenewingPlan && item.autoRenewingPlan.recurringPrice;
  const price = rp && rp.currencyCode === 'INR' ? Number(rp.units || 0) + Number(rp.nanos || 0) / 1e9 : 0;
  const trial = !!(item.offerPhase && item.offerPhase.freeTrial) || /trial/i.test(offer);
  return {
    ok: true,
    acknowledge: p.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING',
    state: {
      tier,
      product,
      basePlan: (item.offerDetails && item.offerDetails.basePlanId) || '',
      offer,
      untilMs: until,
      autoRenew: !!(item.autoRenewingPlan && item.autoRenewingPlan.autoRenewEnabled),
      prepaid: !!item.prepaidPlan,
      price: Number.isFinite(price) ? Math.round(price * 100) / 100 : 0,
      trial,
      playState: p.subscriptionState,
      test: !!p.testPurchase,
    },
  };
}

module.exports = { decide, accountId, tokenKey, TIERS };
