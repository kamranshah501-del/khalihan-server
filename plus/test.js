// node test.js — what a Play answer means (no Google libraries).
const assert = require('node:assert/strict');
const { decide, accountId, tokenKey } = require('./decide.js');

const now = Date.parse('2026-11-20T10:00:00Z');
const me = accountId('uid-1');
const play = (over = {}, item = {}) => ({
  subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  acknowledgementState: 'ACKNOWLEDGEMENT_STATE_PENDING',
  externalAccountIdentifiers: { obfuscatedExternalAccountId: me },
  lineItems: [{
    productId: 'khalihan_plus',
    expiryTime: '2026-12-20T10:00:00Z',
    autoRenewingPlan: { autoRenewEnabled: true, recurringPrice: { currencyCode: 'INR', units: '149', nanos: 0 } },
    offerDetails: { basePlanId: 'm1' },
    ...item,
  }],
  ...over,
});

let d = decide(play(), { product: 'khalihan_plus', account: me, now });
assert.equal(d.ok, true);
assert.equal(d.state.tier, 'plus');
assert.equal(d.state.basePlan, 'm1');
assert.equal(d.state.autoRenew, true);
assert.equal(d.state.trial, false);
assert.equal(d.acknowledge, true);
assert.equal(d.state.price, 149);

d = decide(play({}, { productId: 'khalihan_pro', offerDetails: { basePlanId: 'm1', offerId: 'trial7' }, offerPhase: { freeTrial: {} } }), { product: 'khalihan_pro', account: me, now });
assert.equal(d.state.tier, 'pro');
assert.equal(d.state.trial, true);

d = decide(play({ subscriptionState: 'SUBSCRIPTION_STATE_CANCELED' }), { product: 'khalihan_plus', account: me, now });
assert.equal(d.ok, true, 'cancelled: usable till it runs out');
d = decide(play({}, { prepaidPlan: {}, autoRenewingPlan: undefined }), { product: 'khalihan_plus', account: me, now });
assert.equal(d.state.prepaid, true);
assert.equal(d.state.autoRenew, false);
assert.equal(d.state.price, 0, 'Play gives no price for a prepaid plan');

assert.equal(decide(play({ subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED' }), { product: 'khalihan_plus', account: me, now }).why, 'not_active');
assert.equal(decide(play({ subscriptionState: 'SUBSCRIPTION_STATE_PENDING' }), { product: 'khalihan_plus', account: me, now }).why, 'not_active');
assert.equal(decide(play({ subscriptionState: 'SUBSCRIPTION_STATE_ON_HOLD' }), { product: 'khalihan_plus', account: me, now }).why, 'not_active');
assert.equal(decide(play({}, { expiryTime: '2026-11-01T00:00:00Z' }), { product: 'khalihan_plus', account: me, now }).why, 'not_active');
assert.equal(decide(play(), { product: 'khalihan_plus', account: accountId('uid-2'), now }).why, 'account', 'bought for another login');
assert.equal(decide(play({ externalAccountIdentifiers: undefined }), { product: 'khalihan_plus', account: me, now }).why, 'account');
assert.equal(decide(play(), { product: 'khalihan_pro', account: me, now }).why, 'product', 'the token is for Plus, not Pro');
assert.equal(decide(play(), { product: 'other', account: me, now }).why, 'product');
assert.equal(decide(null, { product: 'khalihan_plus', account: me, now }).why, 'product');
assert.equal(decide(play({ acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED' }), { product: 'khalihan_plus', account: me, now }).acknowledge, false);

// The same hash as the app (PlusBilling.accountId: sha256("khalihan:" + uid)).
assert.equal(accountId('uid123'), require('node:crypto').createHash('sha256').update('khalihan:uid123').digest('hex'));
assert.equal(tokenKey('abc').length, 64);
console.log('plus verify: 19 checks ok');
