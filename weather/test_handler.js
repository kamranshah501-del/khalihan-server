// node test_handler.js — the function itself, with Google, App Check and
// Firestore played by stand-ins (no network, no libraries to install).
const assert = require('node:assert/strict');
const Module = require('node:module');
const fx = require('./fixture.js');

let handler;
const store = new Map(); // Firestore: path → data
const world = { appCheckOk: true, storeDown: false, googleCode: 200, calls: [] };
const inc = (n) => ({ __inc: n });
const docAt = (path) => ({
  path,
  get: async () => {
    if (world.storeDown) throw new Error('unavailable');
    return { exists: store.has(path), data: () => store.get(path) };
  },
  set: async (data, opts) => {
    const old = opts && opts.merge ? { ...(store.get(path) || {}) } : {};
    for (const [k, v] of Object.entries(data)) old[k] = v && v.__inc !== undefined ? (old[k] || 0) + v.__inc : v;
    store.set(path, old);
  },
  delete: async () => store.delete(path),
});
const collection = (name) => ({
  where: (field, op, value) => ({
    limit: (n) => ({
      get: async () => {
        const docs = [...store.entries()]
          .filter(([p, d]) => p.startsWith(`${name}/`) && p.split('/').length === 2 && op === '<' && d[field] < value)
          .slice(0, n)
          .map(([p]) => ({ ref: docAt(p) }));
        return { size: docs.length, docs };
      },
    }),
  }),
});
const firestore = () => ({ doc: docAt, collection });
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
  },
};
const load = Module._load;
Module._load = (name, ...rest) => (fakes[name] ? fakes[name] : load(name, ...rest));

// Google and the sign-in, played here.
globalThis.fetch = async (url, opts) => {
  const u = new URL(url);
  if (u.hostname === 'metadata.google.internal') {
    assert.equal(opts.headers['Metadata-Flavor'], 'Google');
    return { ok: true, json: async () => ({ access_token: 'tok', expires_in: 3599 }) };
  }
  assert.equal(u.hostname, 'weather.googleapis.com');
  assert.equal(opts.headers.Authorization, 'Bearer tok');
  world.calls.push(`${u.pathname}${u.searchParams.get('pageToken') ? `#${u.searchParams.get('pageToken')}` : ''}`);
  if (world.googleCode !== 200) return { ok: false, status: world.googleCode, json: async () => ({ error: {} }) };
  // the cell's centre is what Google is asked about — never the farmer's own spot
  assert.equal(u.searchParams.get('location.latitude'), '21');
  assert.equal(u.searchParams.get('location.longitude'), '75.55');
  if (u.pathname.endsWith('/forecast/days:lookup')) {
    assert.equal(u.searchParams.get('days'), '7');
    return { ok: true, status: 200, json: async () => fx.days() };
  }
  const pages = fx.hoursPages(Number(u.searchParams.get('hours')));
  const i = u.searchParams.get('pageToken') ? Number(u.searchParams.get('pageToken').slice(4)) - 1 : 0;
  return { ok: true, status: 200, json: async () => pages[i] };
};

const logs = [];
console.log = (line) => logs.push(String(line));
const realNow = Date.now;
let clock = fx.NOW;
Date.now = () => clock;

require('./index.js');

function call({ token = 'ok', lat = '21.0077', lon = '75.5626', method = 'GET' } = {}) {
  const res = { code: 200, body: null, headers: {} };
  res.set = (k, v) => (res.headers[k] = v);
  res.status = (c) => ((res.code = c), res);
  res.json = (b) => ((res.body = b), res);
  res.end = () => res;
  const req = { method, query: { lat, lon }, body: { lat, lon }, get: (h) => (h === 'X-Firebase-AppCheck' ? token : '') };
  return handler(req, res).then(() => res);
}

(async () => {
  // not the app
  let r = await call({ token: '' });
  assert.equal(r.code, 401);
  world.appCheckOk = false;
  r = await call();
  assert.equal(r.code, 401);
  world.appCheckOk = true;

  // not a place in India
  r = await call({ lat: '51.5', lon: '-0.1' });
  assert.equal(r.code, 400);
  assert.equal(world.calls.length, 0);

  // first farmer in the cell: Google is asked (days + 2 pages of hours = 3 calls)
  r = await call();
  assert.equal(r.code, 200);
  assert.equal(r.headers['Cache-Control'], 'private, no-store');
  assert.deepEqual(world.calls.sort(), ['/v1/forecast/days:lookup', '/v1/forecast/hours:lookup', '/v1/forecast/hours:lookup#page2'].sort());
  assert.equal(r.body.source, 'google');
  assert.equal(r.body.current.time, '2026-11-27T09:00');
  assert.equal(r.body.hourly.time.length, 48);
  assert.equal(r.body.daily.time.length, 7);
  const day = store.get('wx_use/d20261127');
  assert.equal(day.n, 3);
  assert.equal(day.asked, 1);
  assert.ok(store.has('wx_cache/21.00_75.55'));
  // nothing in the log says where the farmer is
  assert.ok(!logs.join('\n').includes('21.0') && !logs.join('\n').includes('75.5'));

  // a neighbour 1 km away, 20 minutes later: the kept answer, no call
  world.calls = [];
  clock += 20 * 60000;
  r = await call({ lat: '21.012', lon: '75.571' });
  assert.equal(r.code, 200);
  assert.equal(world.calls.length, 0);
  assert.equal(store.get('wx_use/d20261127').hit, 1);
  assert.equal(r.body.current.time, '2026-11-27T09:00');

  // a POST works the same
  r = await call({ method: 'POST' });
  assert.equal(r.code, 200);
  assert.equal(world.calls.length, 0);

  // an hour later the kept answer is too old (Google allows one hour): asked again, and the old one is replaced
  clock += 50 * 60000; // 10:30
  r = await call();
  assert.equal(r.code, 200);
  assert.equal(world.calls.length, 3);
  assert.equal(r.body.current.time, '2026-11-27T10:00'); // from this hour on
  assert.equal(store.get('wx_cache/21.00_75.55').at, clock);

  // another cell's old answer is deleted while the function works
  store.set('wx_cache/19.90_75.35', { at: clock - 2 * 3600000, b: '{}' });
  world.calls = [];
  clock += 56 * 60000;
  r = await call();
  assert.equal(r.code, 200);
  assert.ok(!store.has('wx_cache/19.90_75.35'));

  // the day's calls used up: 429, and Google is not asked
  store.set('wx_use/d20261127', { n: 3999 });
  world.calls = [];
  clock += 56 * 60000;
  r = await call();
  assert.equal(r.code, 429);
  assert.equal(r.body.error, 'day');
  assert.equal(world.calls.length, 0);

  // Admin can raise it
  store.set('config/app', { weather: { day: 9000 } });
  clock += 61000; // settings are read once a minute
  r = await call();
  assert.equal(r.code, 200);

  // Google refuses (e.g. the API is off): the app hears 502, nothing is kept
  store.delete('wx_cache/21.00_75.55');
  world.googleCode = 403;
  clock += 56 * 60000;
  r = await call();
  assert.equal(r.code, 502);
  assert.equal(r.body.code, 403);
  assert.ok(!store.has('wx_cache/21.00_75.55'));
  world.googleCode = 200;

  // Admin's off switch
  store.set('config/app', { weather: { off: true } });
  clock += 61000;
  r = await call();
  assert.equal(r.code, 503);
  assert.equal(r.body.error, 'off');
  store.set('config/app', { weather: {} });
  clock += 61000;

  // Firestore down: no count, no call
  world.storeDown = true;
  world.calls = [];
  clock += 56 * 60000;
  r = await call({ lat: '19.88', lon: '75.34' });
  assert.equal(r.code, 503);
  assert.equal(world.calls.length, 0);
  world.storeDown = false;

  Date.now = realNow;
  process.stdout.write('khalihan-weather handler: all good\n');
})().catch((e) => {
  process.stderr.write(`${e.stack}\n`);
  process.exit(1);
});
