// form-brain — the parts with no Google or network in them (node test.js).
//
// What the app's page reader (lib/ai/gov_brain.dart) gets back is fixed
// here: whatever is sent, the answer can only be this shape — a reading of
// one government page — so the function cannot be used as a chat with our
// key.

// The same shape the app gives Gemini (GovBrain.schema): the page's own keys
// stay optional, a list item's keys are all wanted (i = -1 when none).
const item = (props) => ({
  type: 'array',
  items: { type: 'object', properties: props, required: Object.keys(props), additionalProperties: false },
});
const PAGE_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['form', 'login', 'otp', 'captcha', 'error', 'success', 'info'] },
    what: { type: 'string' },
    say: { type: 'string' },
    docs: item({ name: { type: 'string' }, i: { type: 'integer' } }),
    map: item({ i: { type: 'integer' }, key: { type: 'string' } }),
    ask: item({ i: { type: 'integer' }, q: { type: 'string' } }),
    user: { type: 'integer' },
    pass: { type: 'integer' },
    login: { type: 'integer' },
    problem: { type: 'string' },
    fix: { type: 'string' },
    signed: { type: 'string', enum: ['in', 'out', 'none'] },
    join: { type: 'integer' },
    enter: { type: 'integer' },
  },
  additionalProperties: false,
};

const OWN = {
  model: 'claude-sonnet-5-5', // tool/ai_compare/RESULT_2026-11-24_govpage.md (app repository)
  // The models the app may ask for by name (Admin → AI Forms names one).
  models: ['claude-sonnet-5-5', 'claude-haiku-5-5'],
  day: 1500, // pages a day, everyone together
  user: 150, // pages a day for one login
  nologin: 300, // pages a day for all phones without a login, together
  timeoutMs: 20000,
  off: false,
};

const whole = (v, own, min, max) => (Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : own);

// config/app → form_brain (all optional): {model, day, user, nologin, off}.
function settings(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const pinned = typeof r.model === 'string' && /^claude-[a-z0-9.\-]{3,40}$/.test(r.model.trim());
  return {
    model: pinned ? r.model.trim() : OWN.model,
    pinned, // form_brain.model set: that one reads, whatever the app asks for
    day: whole(r.day, OWN.day, 0, 100000),
    user: whole(r.user, OWN.user, 0, 10000),
    nologin: whole(r.nologin, OWN.nologin, 0, 100000),
    timeoutMs: OWN.timeoutMs,
    off: r.off === true,
  };
}

// Which Claude model reads: the one pinned in form_brain.model; else the
// one the app asks for when it is one we allow; else our own.
function modelFor(asked, s) {
  if (s.pinned) return s.model;
  const name = typeof asked === 'string' ? asked.trim() : '';
  return OWN.models.includes(name) ? name : s.model;
}

// '' when the request makes sense; else why not.
function badBody(body) {
  if (!body || typeof body !== 'object') return 'bad';
  const { system, page } = body;
  if (typeof system !== 'string' || system.length < 200 || system.length > 20000) return 'bad';
  if (typeof page !== 'string' || page.length < 2 || page.length > 40000) return 'bad';
  return '';
}

// The day in India (the app counts its pages by the same day): "d20261124".
function dayId(date) {
  const t = new Date(date.getTime() + 330 * 60000);
  const p = (n) => String(n).padStart(2, '0');
  return `d${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}`;
}

// '' while there is room; 'day' or 'user' when a share is used up.
function overCap({ day, who, login }, s) {
  if (day >= s.day) return 'day';
  if (who >= (login ? s.user : s.nologin)) return 'user';
  return '';
}

// What Anthropic is sent. No temperature (these models refuse it).
function request({ system, page, model }) {
  return {
    model,
    max_tokens: 4000,
    system,
    messages: [{ role: 'user', content: page }],
    output_config: { format: { type: 'json_schema', schema: PAGE_SCHEMA } },
  };
}

// Anthropic's reply → {ok, text, in, out} or {ok: false, why}.
function answer(j) {
  if (!j || typeof j !== 'object' || !Array.isArray(j.content)) return { ok: false, why: 'empty' };
  const u = j.usage || {};
  const tin = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
  const tout = u.output_tokens || 0;
  if (j.stop_reason === 'max_tokens') return { ok: false, why: 'cut', in: tin, out: tout };
  if (j.stop_reason === 'refusal') return { ok: false, why: 'refused', in: tin, out: tout };
  const text = j.content.filter((b) => b && b.type === 'text').map((b) => b.text || '').join('');
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (_) {
    return { ok: false, why: 'shape', in: tin, out: tout };
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, why: 'shape', in: tin, out: tout };
  return { ok: true, text, in: tin, out: tout };
}

module.exports = { PAGE_SCHEMA, OWN, settings, modelFor, badBody, dayId, overCap, request, answer };
