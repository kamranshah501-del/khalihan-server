// node test.js — the parts of form-brain with no Google or network in them.
const assert = require('node:assert/strict');
const core = require('./core.js');

// settings: the function's own when Admin set nothing or nonsense
let s = core.settings(null);
assert.equal(s.model, 'claude-sonnet-5-5');
assert.equal(s.off, false);
assert.deepEqual([s.day, s.user, s.nologin], [1500, 150, 300]);
s = core.settings({ model: 'gpt-9', day: -5, user: 'many', off: 'yes' });
assert.equal(s.model, 'claude-sonnet-5-5');
assert.equal(s.day, 0);
assert.equal(s.user, 150);
assert.equal(s.off, false);
s = core.settings({ model: ' claude-haiku-5-5 ', day: 40, user: 3, nologin: 0, off: true });
assert.deepEqual([s.model, s.day, s.user, s.nologin, s.off], ['claude-haiku-5-5', 40, 3, 0, true]);

// which model reads: the app's wish when we allow it; Admin's pin wins
s = core.settings(null);
assert.equal(s.pinned, false);
assert.equal(core.modelFor('claude-haiku-5-5', s), 'claude-haiku-5-5');
assert.equal(core.modelFor(' claude-sonnet-5-5 ', s), 'claude-sonnet-5-5');
assert.equal(core.modelFor('claude-opus-5-5', s), 'claude-sonnet-5-5'); // not one we allow: ours
assert.equal(core.modelFor('gemini-3.8-flash', s), 'claude-sonnet-5-5');
assert.equal(core.modelFor(undefined, s), 'claude-sonnet-5-5');
s = core.settings({ model: 'claude-opus-5-5' });
assert.equal(s.pinned, true);
assert.equal(core.modelFor('claude-haiku-5-5', s), 'claude-opus-5-5');

// the request must make sense
const system = 'x'.repeat(400);
assert.equal(core.badBody({ system, page: '{"site":"pmkisan.gov.in"}' }), '');
assert.equal(core.badBody(null), 'bad');
assert.equal(core.badBody({ system: 'short', page: '{}' }), 'bad');
assert.equal(core.badBody({ system, page: '' }), 'bad');
assert.equal(core.badBody({ system, page: 'p'.repeat(40001) }), 'bad');
assert.equal(core.badBody({ system: 'x'.repeat(20001), page: '{}' }), 'bad');
assert.equal(core.badBody({ system, page: 42 }), 'bad');

// the day is India's
assert.equal(core.dayId(new Date('2026-11-24T18:29:00Z')), 'd20261124');
assert.equal(core.dayId(new Date('2026-11-24T18:31:00Z')), 'd20261125');
assert.equal(core.dayId(new Date('2026-12-31T19:00:00Z')), 'd20270101');

// the shares
s = core.settings({ day: 10, user: 3, nologin: 5 });
assert.equal(core.overCap({ day: 0, who: 0, login: true }, s), '');
assert.equal(core.overCap({ day: 10, who: 0, login: true }, s), 'day');
assert.equal(core.overCap({ day: 4, who: 3, login: true }, s), 'user');
assert.equal(core.overCap({ day: 4, who: 3, login: false }, s), '');
assert.equal(core.overCap({ day: 4, who: 5, login: false }, s), 'user');
assert.equal(core.overCap({ day: 0, who: 0, login: true }, core.settings({ day: 0 })), 'day');

// what Anthropic is sent: the fixed shape, no temperature, the page as the one message
const r = core.request({ system, page: '{"site":"x.gov.in"}', model: 'claude-sonnet-5-5' });
assert.equal(r.model, 'claude-sonnet-5-5');
assert.equal('temperature' in r, false);
assert.equal(r.system, system);
assert.deepEqual(r.messages, [{ role: 'user', content: '{"site":"x.gov.in"}' }]);
assert.equal(r.output_config.format.type, 'json_schema');
assert.equal(r.output_config.format.schema, core.PAGE_SCHEMA);

// the shape itself: the app's 14 keys, nothing else allowed, list items complete
const p = core.PAGE_SCHEMA;
assert.deepEqual(Object.keys(p.properties), ['kind', 'what', 'say', 'docs', 'map', 'ask', 'user', 'pass', 'login', 'problem', 'fix', 'signed', 'join', 'enter']);
assert.equal(p.additionalProperties, false);
assert.equal('required' in p, false); // 14 optional keys (Anthropic allows 24)
for (const k of ['docs', 'map', 'ask']) {
  assert.equal(p.properties[k].items.additionalProperties, false);
  assert.equal(p.properties[k].items.required.length, 2);
}
assert.deepEqual(p.properties.kind.enum, ['form', 'login', 'otp', 'captcha', 'error', 'success', 'info']);

// Anthropic's reply
const reply = (text, over = {}) => ({ content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 2300, output_tokens: 310 }, ...over });
let a = core.answer(reply('{"kind":"login","say":"यह लॉगिन पेज है।"}'));
assert.deepEqual([a.ok, a.in, a.out], [true, 2300, 310]);
assert.equal(JSON.parse(a.text).kind, 'login');
a = core.answer(reply('{"kind":"fo', { stop_reason: 'max_tokens' }));
assert.deepEqual([a.ok, a.why], [false, 'cut']);
a = core.answer(reply('', { stop_reason: 'refusal' }));
assert.deepEqual([a.ok, a.why], [false, 'refused']);
a = core.answer(reply('Sorry, here is the page: …'));
assert.deepEqual([a.ok, a.why], [false, 'shape']);
a = core.answer(reply('[1,2]'));
assert.deepEqual([a.ok, a.why], [false, 'shape']);
assert.equal(core.answer(null).ok, false);
assert.equal(core.answer({ error: { type: 'overloaded_error' } }).ok, false);
a = core.answer({ content: [{ type: 'thinking', thinking: '…' }, { type: 'text', text: '{"kind":"info"}' }], stop_reason: 'end_turn', usage: { input_tokens: 10, cache_read_input_tokens: 90, output_tokens: 5 } });
assert.deepEqual([a.ok, a.in, a.out], [true, 100, 5]);

console.log('form-brain: all checks passed');
