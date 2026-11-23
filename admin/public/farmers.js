// 👥 Farmers (Admin 1.34, owner 23 Nov 2026): the account's "front" only —
// name, mobile number, village / taluka / district, the plan or the free
// week, which forms and how many — never what is inside (no Aadhaar, PAN,
// bank, OTP, form answers or papers; those never leave the farmer's phone).
// Why: help on a call (check name and number), stop fraud, plan by area
// ("Jalgaon → Jamner → Fatehpur: 10 farmers"), Kendra and Sell later.
//
// Who: the owner, and staff he allowed in Team (full numbers) — the
// Firestore rules say the same (canSeePhones). Others see a note.
//
// The free week (plus_trials/{+91…}): seven days of Khalihan Pro at login,
// once per number and per phone; the owner can end one now or give days.
// The forms and papers each plan brings (config/app → plan_limits) are set
// here too (owner).

const T = {
  en: {
    title: '👥 Farmers',
    sub: 'Accounts made with a mobile number (newest first)',
    no_access: 'Farmers\' accounts and full mobile numbers are only for the owner and team members he allows (Team → "Full numbers").',
    demo: 'Demo data — nothing here is saved.',
    n_accounts: 'Accounts',
    n_week: 'On the free week now',
    n_week_over: 'Free week over',
    n_offers: 'Said yes to offers',
    v_list: 'List',
    v_week: 'Free week now',
    v_area: 'By area',
    find_ph: 'Mobile number (10 digits)',
    find: 'Find',
    none: 'No accounts yet.',
    none_found: 'No account with this number.',
    week_left: 'Free week · {d} left',
    week_over: 'Free week over',
    week_none: 'No free week',
    forms_docs: '{f} forms · {d} papers',
    no_place: 'Village not chosen',
    k_mobile: 'Mobile',
    k_place: 'Village',
    k_app: 'Language · app',
    k_crops: 'Crops',
    k_created: 'Account made',
    k_seen: 'Last seen',
    k_consent: 'Said "I agree"',
    k_offers: 'Offers',
    yes: 'Yes',
    no: 'No',
    week_h: 'Free week',
    week_start: 'Began',
    week_end: 'Ends',
    week_used: 'Used',
    week_note: 'Note',
    end_now: 'End it now',
    end_now_q: 'End {n}\'s free week now? Khalihan Pro closes on the phone at once.',
    give3: '+3 days',
    give7: '+7 days',
    given: 'Done — ends {d}',
    plan_use_h: 'Bought plan — forms and papers',
    never_h: 'Never here',
    never: 'Aadhaar, PAN, bank, OTP, passwords, what the farmer fills in forms, his papers — they stay on his phone.',
    area_h: 'Farmers by area',
    area_none: 'Village not chosen',
    limits_h: 'Khalihan Pro — forms and papers per plan',
    limits_d: 'A plan\'s whole share is there from its first day and fills again when it renews. A form counts only when the site says it was submitted; a paper when it is kept from a government site. Phones take a change within seconds.',
    l_plan: 'Plan',
    l_forms: 'Forms',
    l_docs: 'Papers',
    l_week: 'Free week (7 days)',
    l_m1: '1 month',
    l_m3: '3 months',
    l_m6: '6 months',
    l_m12: '1 year',
    l_day: 'Most forms in one day (0 = no limit)',
    l_save: 'Save',
    l_reset: 'Back to the app\'s numbers',
    l_saved: 'Saved — phones take it within seconds',
    l_bad: 'Whole numbers, 0 or more',
    l_own: 'The app\'s own numbers (nothing set here)',
  },
  hi: {
    title: '👥 किसान',
    sub: 'मोबाइल नंबर से बने खाते (नए पहले)',
    no_access: 'किसानों के खाते और पूरे मोबाइल नंबर सिर्फ़ मालिक और उनके चुने टीम सदस्यों के लिए हैं (टीम → "पूरे नंबर")।',
    demo: 'डेमो डेटा — यहाँ कुछ सेव नहीं होता।',
    n_accounts: 'खाते',
    n_week: 'अभी मुफ़्त हफ़्ते पर',
    n_week_over: 'मुफ़्त हफ़्ता पूरा',
    n_offers: 'ऑफ़र के लिए हाँ',
    v_list: 'सूची',
    v_week: 'अभी मुफ़्त हफ़्ता',
    v_area: 'इलाक़े से',
    find_ph: 'मोबाइल नंबर (10 अंक)',
    find: 'ढूँढें',
    none: 'अभी कोई खाता नहीं।',
    none_found: 'इस नंबर का कोई खाता नहीं।',
    week_left: 'मुफ़्त हफ़्ता · {d} बाक़ी',
    week_over: 'मुफ़्त हफ़्ता पूरा',
    week_none: 'मुफ़्त हफ़्ता नहीं लिया',
    forms_docs: '{f} फ़ॉर्म · {d} कागज़',
    no_place: 'गाँव नहीं चुना',
    k_mobile: 'मोबाइल',
    k_place: 'गाँव',
    k_app: 'भाषा · ऐप',
    k_crops: 'फ़सलें',
    k_created: 'खाता बना',
    k_seen: 'आख़िरी बार',
    k_consent: '"मैं सहमत हूँ" कहा',
    k_offers: 'ऑफ़र',
    yes: 'हाँ',
    no: 'नहीं',
    week_h: 'मुफ़्त हफ़्ता',
    week_start: 'शुरू',
    week_end: 'ख़त्म',
    week_used: 'इस्तेमाल',
    week_note: 'नोट',
    end_now: 'अभी बंद करें',
    end_now_q: '{n} का मुफ़्त हफ़्ता अभी बंद करें? फ़ोन पर Khalihan Pro तुरंत बंद होगा।',
    give3: '+3 दिन',
    give7: '+7 दिन',
    given: 'हो गया — {d} को ख़त्म',
    plan_use_h: 'ख़रीदा प्लान — फ़ॉर्म और कागज़',
    never_h: 'यहाँ कभी नहीं',
    never: 'आधार, PAN, बैंक, OTP, पासवर्ड, किसान का फ़ॉर्म में भरा, उसके कागज़ — ये उसके फ़ोन में ही रहते हैं।',
    area_h: 'इलाक़े के हिसाब से किसान',
    area_none: 'गाँव नहीं चुना',
    limits_h: 'Khalihan Pro — हर प्लान के फ़ॉर्म और कागज़',
    limits_d: 'प्लान का पूरा हिस्सा पहले दिन से मिलता है और रिन्यू होने पर फिर भरता है। फ़ॉर्म तभी गिना जाता है जब साइट "submitted" कहे; कागज़ तब जब सरकारी साइट से रखा जाए। बदलाव फ़ोन कुछ सेकंड में ले लेते हैं।',
    l_plan: 'प्लान',
    l_forms: 'फ़ॉर्म',
    l_docs: 'कागज़',
    l_week: 'मुफ़्त हफ़्ता (7 दिन)',
    l_m1: '1 महीना',
    l_m3: '3 महीने',
    l_m6: '6 महीने',
    l_m12: '1 साल',
    l_day: 'एक दिन में ज़्यादा से ज़्यादा फ़ॉर्म (0 = कोई सीमा नहीं)',
    l_save: 'सेव करें',
    l_reset: 'ऐप के अपने नंबर पर वापस',
    l_saved: 'सेव हुआ — फ़ोन कुछ सेकंड में ले लेंगे',
    l_bad: 'पूरे नंबर, 0 या ज़्यादा',
    l_own: 'ऐप के अपने नंबर (यहाँ कुछ सेट नहीं)',
  },
};

// The app's own numbers (lib/ai/plan_use.dart → PlanLimits.defaults).
export const PLAN_DEFAULTS = {
  week: { forms: 1, docs: 3 },
  m1: { forms: 5, docs: 10 },
  m3: { forms: 15, docs: 30 },
  m6: { forms: 30, docs: 60 },
  m12: { forms: 50, docs: 100 },
};
const PLANS = ['week', 'm1', 'm3', 'm6', 'm12'];
const WEEK_DAYS = 7;

/** When a free week ends: the owner's own end, else seven days on. */
export function weekEnd(w) {
  if (!w) return null;
  if (w.end instanceof Date) return w.end;
  if (!(w.start instanceof Date)) return null;
  return new Date(w.start.getTime() + WEEK_DAYS * 86400000);
}

/** District → taluka → village, with the farmers in each. */
export function byArea(list) {
  const tree = new Map();
  for (const u of list) {
    const d = (u.district || '').trim() || '—';
    const t = (u.taluka || '').trim() || '—';
    const v = (u.village || '').trim() || '—';
    if (!tree.has(d)) tree.set(d, new Map());
    const talukas = tree.get(d);
    if (!talukas.has(t)) talukas.set(t, new Map());
    const villages = talukas.get(t);
    if (!villages.has(v)) villages.set(v, []);
    villages.get(v).push(u);
  }
  const count = (m) => [...m.values()].reduce((n, x) => n + (Array.isArray(x) ? x.length : count(x)), 0);
  const sorted = (m) => [...m.entries()].sort((a, b) => count2(b[1]) - count2(a[1]) || String(a[0]).localeCompare(String(b[0])));
  const count2 = (x) => (Array.isArray(x) ? x.length : count(x));
  return sorted(tree).map(([d, talukas]) => ({
    name: d,
    n: count(talukas),
    talukas: sorted(talukas).map(([t, villages]) => ({
      name: t,
      n: count(villages),
      villages: sorted(villages).map(([v, farmers]) => ({ name: v, n: farmers.length, farmers })),
    })),
  }));
}

/** The plan_limits the owner typed, checked: null if any number is wrong. */
export function readLimits(raw) {
  const out = {};
  for (const p of PLANS) {
    const f = Number(raw[`${p}_forms`]);
    const d = Number(raw[`${p}_docs`]);
    if (!Number.isInteger(f) || f < 0 || !Number.isInteger(d) || d < 0) return null;
    out[p] = { forms: f, docs: d };
  }
  const day = Number(raw.forms_day);
  if (!Number.isInteger(day) || day < 0) return null;
  out.forms_day = day;
  return out;
}

export async function farmersPage(deps) {
  const { esc, setMain, lang, db, fail, toast, me, openPanel, when, phoneShow, phoneTen, reqCard } = deps;
  const L = () => (T[lang()] ? lang() : 'en');
  const t = (k, v) => {
    let s = T[L()][k] ?? T.en[k] ?? k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const owner = me.role === 'owner';
  if (!me.phones) {
    setMain(`<h1>${t('title')}</h1><div class="empty">${esc(t('no_access'))}</div>`);
    return;
  }
  const [list, weeks, cfg] = await Promise.all([
    db.users(),
    db.freeWeeks ? db.freeWeeks().catch(() => []) : Promise.resolve([]),
    owner ? db.appConfig().catch(() => null) : Promise.resolve(null),
  ]);
  const weekOf = new Map(weeks.map((w) => [w.phone, w]));
  const now = new Date();
  const live = (w) => { const e = weekEnd(w); return !!e && e > now; };
  const left = (w) => {
    const ms = weekEnd(w) - now;
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    return d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((ms % 3600000) / 60000)}m`;
  };
  const place = (u) => [u.village, u.taluka, u.district].filter((x) => x && String(x).trim()).join(', ');
  const weekBadge = (u) => {
    const w = weekOf.get(u.phone);
    if (!w) return '';
    return live(w)
      ? `<span class="chip ok">${esc(t('week_left', { d: left(w) }))}</span>`
      : `<span class="chip">${esc(t('week_over'))}</span>`;
  };
  const row = (u) => {
    const w = weekOf.get(u.phone);
    return `<div class="card click" data-user="${esc(u.id)}">
      <div class="row between"><div class="grow">
        <div class="title">${esc(u.name || '—')} · ${phoneShow(u.phone)}</div>
        <div class="sub">${place(u) ? esc(place(u)) : `<span class="muted">${esc(t('no_place'))}</span>`}</div>
        <div class="sub">${weekBadge(u)} ${w ? esc(t('forms_docs', { f: w.forms || 0, d: w.docs || 0 })) : ''}</div>
      </div><div class="sub">${when(u.seen)}</div></div>
    </div>`;
  };
  const rowsHtml = (items) => (items.length ? items.map(row).join('') : `<div class="empty">${esc(t('none'))}</div>`);

  const onWeek = list.filter((u) => live(weekOf.get(u.phone)));
  const over = weeks.filter((w) => !live(w)).length;
  const offers = list.filter((u) => u.offers === true).length;
  let view = 'list';

  const areaHtml = () => byArea(list).map((d) => `
    <details class="card" open>
      <summary class="title">${esc(d.name === '—' ? t('area_none') : d.name)} · ${d.n}</summary>
      ${d.talukas.map((tk) => `
        <details style="margin:6px 0 0 12px">
          <summary class="sub"><b>${esc(tk.name === '—' ? t('area_none') : tk.name)}</b> · ${tk.n}</summary>
          ${tk.villages.map((v) => `
            <div style="margin:4px 0 0 16px">
              <div class="sub"><b>${esc(v.name === '—' ? t('area_none') : v.name)}</b> · ${v.n}</div>
              ${v.farmers.map((u) => `<div class="small click" data-user="${esc(u.id)}" style="margin-left:12px;cursor:pointer">${esc(u.name || '—')} · ${phoneShow(u.phone)}</div>`).join('')}
            </div>`).join('')}
        </details>`).join('')}
    </details>`).join('') || `<div class="empty">${esc(t('none'))}</div>`;

  const limitsHtml = () => {
    if (!owner) return '';
    const set = cfg && cfg.plan_limits;
    const cur = (p, k) => (set && set[p] && Number.isInteger(set[p][k]) ? set[p][k] : PLAN_DEFAULTS[p][k]);
    return `<h2>${esc(t('limits_h'))}</h2>
      <div class="card">
        <p class="muted small" style="margin-top:0">${esc(t('limits_d'))}</p>
        <table><tr><th>${esc(t('l_plan'))}</th><th>${esc(t('l_forms'))}</th><th>${esc(t('l_docs'))}</th></tr>
        ${PLANS.map((p) => `<tr><td>${esc(t('l_' + p))}</td>
          <td><input data-lim="${p}_forms" inputmode="numeric" value="${cur(p, 'forms')}" style="width:80px"></td>
          <td><input data-lim="${p}_docs" inputmode="numeric" value="${cur(p, 'docs')}" style="width:80px"></td></tr>`).join('')}
        </table>
        <div class="form" style="margin-top:10px"><div><label>${esc(t('l_day'))}</label>
          <input data-lim="forms_day" inputmode="numeric" value="${set && Number.isInteger(set.forms_day) ? set.forms_day : 0}" style="width:80px"></div></div>
        <p class="muted small">${set ? '' : esc(t('l_own'))}</p>
        <div class="actions"><button class="main" id="lim-save">${esc(t('l_save'))}</button>
          ${set ? `<button class="plain" id="lim-reset">${esc(t('l_reset'))}</button>` : ''}</div>
      </div>`;
  };

  function draw() {
    setMain(`
      <h1>${esc(t('title'))} <span class="muted small">${esc(t('sub'))}</span></h1>
      ${db.demo ? `<p class="muted small">${esc(t('demo'))}</p>` : ''}
      <div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:12px">
        <div class="card" style="flex:1;min-width:120px"><div class="sub">${esc(t('n_accounts'))}</div><div class="title">${list.length}</div></div>
        <div class="card" style="flex:1;min-width:120px"><div class="sub">${esc(t('n_week'))}</div><div class="title">${onWeek.length}</div></div>
        <div class="card" style="flex:1;min-width:120px"><div class="sub">${esc(t('n_week_over'))}</div><div class="title">${over}</div></div>
        <div class="card" style="flex:1;min-width:120px"><div class="sub">${esc(t('n_offers'))}</div><div class="title">${offers}</div></div>
      </div>
      <div class="row" style="margin-bottom:12px;gap:6px">
        ${['list', 'week', 'area'].map((v) => `<button class="${view === v ? 'main' : 'plain'}" data-view="${v}">${esc(t('v_' + v))}</button>`).join('')}
      </div>
      <div class="row" style="margin-bottom:12px">
        <input id="u-phone" class="grow" inputmode="numeric" placeholder="${esc(t('find_ph'))}">
        <button class="plain" id="u-find">${esc(t('find'))}</button>
      </div>
      <div id="u-list">${view === 'area' ? `<h2>${esc(t('area_h'))}</h2>${areaHtml()}` : rowsHtml(view === 'week' ? onWeek : list)}</div>
      <div class="card" style="margin-top:16px"><div class="title">🔒 ${esc(t('never_h'))}</div><div class="sub">${esc(t('never'))}</div></div>
      ${limitsHtml()}`);
    document.querySelectorAll('[data-view]').forEach((b) => { b.onclick = () => { view = b.dataset.view; draw(); }; });
    bind(list);
    document.getElementById('u-find').onclick = async () => {
      const ten = phoneTen(document.getElementById('u-phone').value);
      if (ten.length !== 10) return toast(t('find_ph'));
      try {
        const found = await db.userByPhone('+91' + ten);
        document.getElementById('u-list').innerHTML = found.length ? found.map(row).join('') : `<div class="empty">${esc(t('none_found'))}</div>`;
        bind(found);
      } catch (e) { fail(e); }
    };
    const save = document.getElementById('lim-save');
    if (save) {
      save.onclick = async () => {
        const raw = {};
        document.querySelectorAll('[data-lim]').forEach((i) => { raw[i.dataset.lim] = i.value.trim(); });
        const limits = readLimits(raw);
        if (!limits) return toast(t('l_bad'));
        try { await db.setPlanLimits(limits); toast(t('l_saved')); farmersPage(deps); } catch (e) { fail(e); }
      };
    }
    const reset = document.getElementById('lim-reset');
    if (reset) reset.onclick = async () => { try { await db.setPlanLimits(null); toast(t('l_saved')); farmersPage(deps); } catch (e) { fail(e); } };
  }

  function bind(items) {
    document.querySelectorAll('[data-user]').forEach((n) => {
      n.onclick = () => show(items.find((u) => u.id === n.dataset.user) || list.find((u) => u.id === n.dataset.user));
    });
  }

  async function show(u) {
    if (!u) return;
    const w = weekOf.get(u.phone);
    const kv = (k, v) => `<div>${esc(t(k))}</div><div>${v}</div>`;
    const panel = openPanel(`
      <h1>${esc(u.name || '—')}</h1>
      <div class="kv">
        ${kv('k_mobile', phoneShow(u.phone))}
        ${kv('k_place', esc(place(u) || t('no_place')))}
        ${kv('k_app', `${esc(u.lang || '')} · v${esc(u.app || '')}`)}
        ${kv('k_crops', esc((u.crops || []).join(', ') || '—'))}
        ${kv('k_created', when(u.created))}
        ${kv('k_seen', when(u.seen))}
        ${kv('k_consent', u.consent ? when(u.consent) : '—')}
        ${kv('k_offers', u.consent ? esc(u.offers ? t('yes') : t('no')) : '—')}
      </div>
      <h2>${esc(t('week_h'))}</h2>
      ${w ? `<div class="kv">
        ${kv('week_start', when(w.start))}
        ${kv('week_end', `${when(weekEnd(w))} ${live(w) ? `<span class="chip ok">${esc(left(w))}</span>` : ''}`)}
        ${kv('week_used', esc(t('forms_docs', { f: w.forms || 0, d: w.docs || 0 })))}
        ${w.note ? kv('week_note', esc(w.note)) : ''}
      </div>
      ${owner && live(w) ? `<div class="actions">
        <button class="danger" id="w-end">${esc(t('end_now'))}</button>
        <button class="plain" id="w-3">${esc(t('give3'))}</button>
        <button class="plain" id="w-7">${esc(t('give7'))}</button>
      </div>` : ''}` : `<div class="muted">${esc(t('week_none'))}</div>`}
      <h2>${esc(t('plan_use_h'))}</h2><div id="u-use" class="muted">…</div>
      <h2>Sell</h2><div id="u-req" class="muted">…</div>`);
    const give = async (days) => {
      const end = new Date(Math.max(weekEnd(w).getTime(), Date.now()) + days * 86400000);
      try { await db.setWeekEnd(w.phone, end, `+${days}`); w.end = end; toast(t('given', { d: when(end) })); show(u); } catch (e) { fail(e); }
    };
    const end = panel.querySelector('#w-end');
    if (end) {
      end.onclick = async () => {
        if (!confirm(t('end_now_q', { n: u.name || phoneShow(u.phone) }))) return;
        try { await db.setWeekEnd(w.phone, null, 'ended'); w.end = new Date(); show(u); } catch (e) { fail(e); }
      };
      panel.querySelector('#w-3').onclick = () => give(3);
      panel.querySelector('#w-7').onclick = () => give(7);
    }
    try {
      const use = db.planUse ? await db.planUse(u.id) : [];
      panel.querySelector('#u-use').innerHTML = use.length
        ? use.map((x) => `<div class="sub">${esc(x.id)} · ${esc(t('forms_docs', { f: x.forms || 0, d: x.docs || 0 }))}</div>`).join('')
        : '—';
    } catch (e) { panel.querySelector('#u-use').textContent = '—'; }
    try {
      const reqs = db.requestsOf ? await db.requestsOf(u.id) : [];
      panel.querySelector('#u-req').innerHTML = reqs.length ? reqs.map(reqCard).join('') : '—';
    } catch (e) { panel.querySelector('#u-req').textContent = '—'; }
  }

  draw();
}
