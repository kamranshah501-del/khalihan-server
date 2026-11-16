// node test.js — the decision only (no Firestore).
const assert = require('node:assert/strict');
const { decide, read } = require('./decide.js');

const may = '2026-11-01T07:00:00Z';
const n = (cost, budget, extra) => ({ costAmount: cost, budgetAmount: budget, costIntervalStart: may, ...extra });

assert.equal(decide(n(10, 100), null), 'under');
assert.equal(decide(n(100, 100), null), 'stop');
assert.equal(decide(n(140, 100), null), 'stop');
assert.equal(decide(n(140, 100), { period: may }), 'done', 'once a month: the owner may turn AI back on');
assert.equal(decide(n(140, 100), { period: '2026-10-01T07:00:00Z' }), 'stop', 'a new month stops again');
assert.equal(decide(n(140, 100, { khalihanTest: true }), null), 'test');
assert.equal(decide(n(10, 100, { khalihanTest: true }), null), 'under');
assert.equal(decide(n('x', 100), null), 'under');
assert.equal(decide(n(5, 0), null), 'under');
assert.equal(decide({}, null), 'under');

const ev = { data: { message: { data: Buffer.from(JSON.stringify(n(1, 2))).toString('base64') } } };
assert.deepEqual(read(ev), n(1, 2));
assert.equal(read({ data: { message: { data: Buffer.from('nope').toString('base64') } } }), null);
assert.equal(read({}), null);
console.log('budget stop: 13 checks ok');
