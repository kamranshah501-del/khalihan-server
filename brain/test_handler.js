// node test_handler.js — the function itself, with Google and Anthropic
// played by stand-ins (no network, no libraries to install).
const assert = require('node:assert/strict');
const Module = require('node:module');

let handler;
const store = new Map(); // Firestore: path → data
const world = { appCheckOk: true, loginOk: true, storeDown: false };
const inc = (n) => ({ __inc: n });
const docAt = (path) => ({
  get: async () => {
    if (world.storeDown) throw new Error('unavailable');
    return { exists: store.has(path), data: () => store.get(path) };
  },
  set: async (data) => {
    const old = { ...(store.get(path) || {}) };
    for (const [k, v] of Object.entries(data)) old[k] = v && v.__inc !== undefined ? (old[k] || 0) + v.__inc : v;
    store.set(path, old);
  },
  collection: (name) => ({ doc: (id) => docAt(`${path}/${name}/${id}`) }),
});
const firestore = () => ({ doc: docAt });
firestore.FieldValue = { increment: inc, serverTimestamp: () => 'now' };
const fakes = {
  '@google-cloud/functions-framework': { http: (_, fn) => (handler = fn) },
  'firebase-admin': {
    initializeApp: () => {},
    firestore,
    appCheck: () => ({
      verifyToken: async (t) => {
        if (!world.appCheckOk || !t) throw new Error('bad token');
      },
    }),
    auth: () => ({
      verifyIdToken: async (t) => {
        if (!world.loginOk) throw new Error('bad login');
        return { uid: t };
      },
    }),
  },
};
const load = Module._load;
Module._load = (name, ...rest) => (fakes[name] ? fakes[name] : load(name, ...rest));

const logs = [];
console.log = (line) => logs.push(String(line));

process.env.ANTHROPIC_API_KEY = ' sk-ant-test-key \n';
require('./index.js');
const core = require('./core.js');

let sent = null;
let claude = async () => ({ ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: '{"kind":"login","say":"ok"}' }], stop_reason: 'end_turn', usage: { input_tokens: 2000, output_tokens: 300 } }) });
global.fetch = async (url, init) => {
  sent = { url, init };
  return claude(url, init);
};

const system = 'You are Khalihan AI. '.repeat(20);
const page = JSON.stringify({ site: 'pmkisan.gov.in', page: 'PRIVATE-WORDS-OF-THE-PAGE' });
async function call({ method = 'POST', appCheck = 'token', login = 'uid-1', body = { system, page } } = {}) {
  const out = { status: 200, body: undefined, headers: {} };
  const req = { method, body, get: (h) => ({ 'x-firebase-appcheck': appCheck, authorization: login ? `Bearer ${login}` : '' })[h.toLowerCase()] };
  const res = {
    set: (k, v) => (out.headers[k] = v),
    status: (c) => ((out.status = c), res),
    json: (j) => ((out.body = j), res),
    end: () => res,
  };
  await handler(req, res);
  return out;
}

(async () => {
  const day = `brain_use/${core.dayId(new Date())}`;

  // the wake-up call asks nothing
  let r = await call({ method: 'GET' });
  assert.equal(r.status, 204);
  assert.equal(sent, null);
  assert.equal((await call({ method: 'PUT' })).status, 405);

  // only the real app
  r = await call({ appCheck: '' });
  assert.deepEqual([r.status, r.body], [401, { error: 'app' }]);
  world.appCheckOk = false;
  assert.equal((await call()).status, 401);
  world.appCheckOk = true;
  assert.equal(sent, null);

  // a request that makes no sense
  assert.equal((await call({ body: { system: 'hi', page } })).status, 400);
  assert.equal(sent, null);

  // a page read: the key goes to Anthropic only, trimmed; the reading comes back; counted
  r = await call();
  assert.equal(r.status, 200);
  assert.equal(JSON.parse(r.body.text).kind, 'login');
  assert.deepEqual([r.body.model, r.body.in, r.body.out], ['claude-sonnet-5-5', 2000, 300]);
  assert.equal(r.headers['Cache-Control'], 'no-store');
  assert.equal(sent.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(sent.init.headers['x-api-key'], 'sk-ant-test-key');
  const asked = JSON.parse(sent.init.body);
  assert.equal(asked.system, system);
  assert.equal(asked.messages[0].content, page);
  assert.equal(asked.output_config.format.type, 'json_schema');
  assert.equal('temperature' in asked, false);
  assert.equal(store.get(day).n, 1);
  assert.deepEqual([store.get(day).in, store.get(day).out], [2000, 300]);
  assert.equal(store.get(`${day}/who/uid-1`).n, 1);

  // the app may ask for the light model by name; a name we do not allow gets ours
  r = await call({ body: { system, page, model: 'claude-haiku-5-5' } });
  assert.equal(r.body.model, 'claude-haiku-5-5');
  assert.equal(JSON.parse(sent.init.body).model, 'claude-haiku-5-5');
  r = await call({ body: { system, page, model: 'claude-opus-5-5' } });
  assert.equal(JSON.parse(sent.init.body).model, 'claude-sonnet-5-5');
  store.set(day, { ...store.get(day), n: 1 });
  store.set(`${day}/who/uid-1`, { n: 1 });

  // no login, or a login that does not check out: read, counted with the phones without a login
  await call({ login: '' });
  world.loginOk = false;
  await call();
  world.loginOk = true;
  assert.equal(store.get(`${day}/who/nologin`).n, 2);
  assert.equal(store.get(day).n, 3);

  // nothing of the page, the instruction or the key in the log
  const all = logs.join('\n');
  assert.equal(all.includes('PRIVATE-WORDS'), false);
  assert.equal(all.includes('Khalihan AI.'), false);
  assert.equal(all.includes('sk-ant'), false);
  assert.equal(all.includes('uid-1'), false);
  assert.ok(all.includes('"formBrain":"ok"'));

  // one login's share for the day
  store.set(`${day}/who/uid-2`, { n: 150 });
  sent = null;
  r = await call({ login: 'uid-2' });
  assert.deepEqual([r.status, r.body], [429, { error: 'user' }]);
  assert.equal(sent, null);
  // everyone's share for the day
  const before = store.get(day).n;
  store.set(day, { ...store.get(day), n: 1500 });
  r = await call();
  assert.deepEqual([r.status, r.body], [429, { error: 'day' }]);
  assert.equal(sent, null);
  store.set(day, { ...store.get(day), n: before });

  // the counts cannot be read: nothing is asked
  world.storeDown = true;
  r = await call();
  assert.deepEqual([r.status, r.body], [503, { error: 'count' }]);
  assert.equal(sent, null);
  world.storeDown = false;

  // Anthropic busy, broken, slow, or an answer that is not a reading
  claude = async () => ({ ok: false, status: 529, json: async () => ({ error: { type: 'overloaded_error', message: 'Overloaded' } }) });
  r = await call();
  assert.deepEqual([r.status, r.body], [429, { error: 'claude', code: 529 }]);
  claude = async () => ({ ok: false, status: 400, json: async () => ({ error: { type: 'invalid_request_error' } }) });
  assert.equal((await call()).status, 502);
  claude = async () => {
    throw Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' });
  };
  r = await call();
  assert.deepEqual([r.status, r.body], [504, { error: 'slow' }]);
  claude = async () => ({ ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: '{"kind":"fo' }], stop_reason: 'max_tokens', usage: { input_tokens: 9, output_tokens: 4000 } }) });
  r = await call();
  assert.deepEqual([r.status, r.body], [502, { error: 'cut' }]);

  // no key on the server: off (the app reads with its other brain)
  process.env.ANTHROPIC_API_KEY = '';
  sent = null;
  r = await call();
  assert.deepEqual([r.status, r.body], [503, { error: 'off' }]);
  assert.equal(sent, null);

  process.stdout.write('form-brain handler: all checks passed\n');
})().catch((e) => {
  process.stderr.write(`${e.stack || e}\n`);
  process.exit(1);
});
