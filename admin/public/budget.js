// 💰 Budget & targets — owner only (Admin 1.20, 10 Nov 2026). Owner: "hame
// budget bhi banana hoga, lazmi … admin mein bhi target achievement hona
// chahiye" — a month's plan, a limit on the loss, and how far the targets are.
//
// One document, business/budget (Firestore rules: only the owner reads or
// writes it). NO amounts live in this file or anywhere else in this public
// repository — the owner types them on the page and they stay in Firestore:
//   limit         the most the owner accepts to lose in a month (₹)
//   lines[]       {id, name, plan, daily} — the month's plan; every amount is
//                 all-in (with GST); daily = ads, which spend day by day
//   months{}      'YYYY-MM' → {spent: {lineId: ₹ so far}, income: ₹}
//   activeTarget  farmers using the app in India in 28 days (counted by 📊)
//   plusTarget, plusNow   Khalihan Plus members (typed, until billing counts)
//
// "Farmers using the app" comes from owner_stats/latest (see stats.js).

const T = {
  en: {
    title: '💰 Budget & targets',
    only_you: 'Owners only',
    first: 'Nothing saved yet. Type each month\'s plan (with GST — what leaves your card), your monthly limit and the targets, then press Save. The amounts are kept only in your owner account.',
    k_plan: 'Plan for the month',
    k_plan_under: '{rs} under the limit',
    k_plan_over: '{rs} over the limit',
    k_plan_nolimit: 'Set the limit under Targets',
    k_spent: 'Spent so far',
    k_spent_sub: 'Day {d} of {n} · plan {rs}',
    k_spent_past: 'Whole month · plan {rs}',
    k_income: 'Income this month',
    k_income_sub: 'Plus, trade, Kendra — typed below',
    k_loss: 'Loss so far',
    k_gain: 'Ahead so far',
    k_loss_est: 'By month end about {rs}',
    k_loss_limit: 'Limit {rs}',
    plan_h: 'The month\'s plan',
    plan_sub: 'Every amount with GST, in ₹. "Spent so far" from each bill, typed once or twice a month.',
    th_name: 'What',
    th_plan: 'Plan / month',
    th_spent: 'Spent so far',
    th_left: 'Left',
    th_daily: 'Ads',
    daily_tip: 'Ads: spends day by day',
    per_day: 'In the ad account: about {rs} a day before 18% GST',
    name_ph: 'e.g. Google Ads',
    total: 'Total',
    income: 'Income this month (₹)',
    add: '+ Add a line',
    remove: 'Remove this line (its amounts in every month too)',
    save: 'Save',
    saved: 'Saved',
    unsaved: 'Not saved yet',
    over: 'over by {rs}',
    targets_h: '🎯 Targets',
    t_loss: 'Loss this month',
    t_loss_of: '{a} of {b}',
    t_ok: 'Within the limit',
    t_near: 'Close to the limit',
    t_over: 'Over the limit',
    t_done: 'Reached',
    t_active: 'Farmers using the app (India, 28 days)',
    t_active_src: 'Counted by 📊 App numbers, till {d}',
    t_active_wait: 'Waiting for 📊 App numbers',
    t_plus: 'Khalihan Plus members',
    t_plus_src: 'Typed below until Plus billing counts them',
    t_set: 'Set a target below',
    of: '{a} of {b} · {p}%',
    cost_now: 'Per farmer now',
    cost_now_sub: 'the month\'s plan ÷ farmers using the app',
    cost_goal: 'Per farmer at the target',
    cost_goal_sub: 'the limit ÷ the target',
    edit_targets: 'Change the limit and the targets',
    f_limit: 'Most I accept to lose in a month (₹)',
    f_active: 'Target: farmers using the app',
    f_plus: 'Target: Plus members',
    f_plus_now: 'Plus members now',
    prev: 'Earlier month',
    next: 'Later month',
    demo: 'Demo: sample numbers, not real ones.',
  },
  hi: {
    title: '💰 बजट और लक्ष्य',
    only_you: 'सिर्फ़ मालिक',
    first: 'अभी कुछ सेव नहीं है। हर महीने का प्लान (GST मिलाकर — जितना कार्ड से कटता है), महीने की सीमा और लक्ष्य भरें, फिर Save दबाएँ। ये रकम सिर्फ़ आपके मालिक वाले खाते में रहती है।',
    k_plan: 'महीने का प्लान',
    k_plan_under: 'सीमा से {rs} कम',
    k_plan_over: 'सीमा से {rs} ज़्यादा',
    k_plan_nolimit: 'नीचे "लक्ष्य" में सीमा भरें',
    k_spent: 'अब तक खर्च',
    k_spent_sub: '{n} में से दिन {d} · प्लान {rs}',
    k_spent_past: 'पूरा महीना · प्लान {rs}',
    k_income: 'इस महीने की कमाई',
    k_income_sub: 'Plus, व्यापार, केंद्र — नीचे भरें',
    k_loss: 'अब तक घाटा',
    k_gain: 'अब तक बचत',
    k_loss_est: 'महीने के आख़िर तक लगभग {rs}',
    k_loss_limit: 'सीमा {rs}',
    plan_h: 'महीने का प्लान',
    plan_sub: 'हर रकम GST मिलाकर, ₹ में। "अब तक खर्च" हर बिल से, महीने में एक-दो बार भरें।',
    th_name: 'क्या',
    th_plan: 'प्लान / महीना',
    th_spent: 'अब तक खर्च',
    th_left: 'बचा',
    th_daily: 'Ads',
    daily_tip: 'Ads: रोज़ थोड़ा-थोड़ा खर्च होता है',
    per_day: 'Ad खाते में: 18% GST से पहले लगभग {rs} रोज़',
    name_ph: 'जैसे Google Ads',
    total: 'कुल',
    income: 'इस महीने की कमाई (₹)',
    add: '+ नई लाइन',
    remove: 'ये लाइन हटाएँ (हर महीने की इसकी रकम भी)',
    save: 'Save',
    saved: 'सेव हो गया',
    unsaved: 'अभी सेव नहीं हुआ',
    over: '{rs} ज़्यादा',
    targets_h: '🎯 लक्ष्य',
    t_loss: 'इस महीने का घाटा',
    t_loss_of: '{b} में से {a}',
    t_ok: 'सीमा के अंदर',
    t_near: 'सीमा के पास',
    t_over: 'सीमा पार',
    t_done: 'पूरा हुआ',
    t_active: 'ऐप चलाने वाले किसान (भारत, 28 दिन)',
    t_active_src: '📊 आँकड़े से, {d} तक',
    t_active_wait: '📊 आँकड़े का इंतज़ार',
    t_plus: 'Khalihan Plus के मेंबर',
    t_plus_src: 'Plus की बिलिंग गिनने तक नीचे हाथ से भरें',
    t_set: 'नीचे लक्ष्य भरें',
    of: '{b} में से {a} · {p}%',
    cost_now: 'अभी हर किसान पर',
    cost_now_sub: 'महीने का प्लान ÷ ऐप चलाने वाले किसान',
    cost_goal: 'लक्ष्य पर हर किसान पर',
    cost_goal_sub: 'सीमा ÷ लक्ष्य',
    edit_targets: 'सीमा और लक्ष्य बदलें',
    f_limit: 'महीने में ज़्यादा से ज़्यादा घाटा (₹)',
    f_active: 'लक्ष्य: ऐप चलाने वाले किसान',
    f_plus: 'लक्ष्य: Plus मेंबर',
    f_plus_now: 'अभी Plus मेंबर',
    prev: 'पिछला महीना',
    next: 'अगला महीना',
    demo: 'डेमो: ये नमूने के आँकड़े हैं, असली नहीं।',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Names only — the owner types the amounts.
const STARTER = [['Google Ads', true], ['Meta ads (Instagram)', true], ['Claude', false], ['Google AI Pro', false], ['Firebase', false]];
const GST = 1.18; // India: ad platforms add 18% GST on top of the ad spend
const AD_DAYS = 30.4; // an ad account's month: daily budget × 30.4

const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const num = (v) => {
  if (v === '' || v == null) return null;
  const x = Number(String(v).replace(/,/g, ''));
  return isFinite(x) && x >= 0 ? Math.round(x) : null;
};

/** The month's sums — also used by the tests (tools/test_budget.mjs). */
export function sums(data, key, today = new Date()) {
  const lines = data.lines || [];
  const m = (data.months || {})[key] || {};
  const spentOf = (id) => ((m.spent || {})[id]) || 0;
  const [y, mo] = key.split('-').map(Number);
  const days = new Date(y, mo, 0).getDate();
  const nowKey = keyOf(today);
  // Days gone: all of a past month, none of a coming one.
  const day = key === nowKey ? today.getDate() : (key < nowKey ? days : 0);
  const plan = lines.reduce((a, l) => a + (l.plan || 0), 0);
  const spent = lines.reduce((a, l) => a + spentOf(l.id), 0);
  const income = m.income || 0;
  // Month end, if the ads follow the plan from today and every fixed bill
  // still to come is paid as planned.
  const est = lines.reduce((a, l) => {
    const s = spentOf(l.id);
    const p = l.plan || 0;
    return a + (l.daily ? s + (p * (days - day)) / days : Math.max(s, p));
  }, 0);
  return { plan, spent, income, net: spent - income, est: Math.round(est - income), days, day, current: key === nowKey, past: key < nowKey };
}

export async function budgetPage(deps) {
  const { esc, setMain, lang, db, fail, toast } = deps;
  const t = (k, v) => {
    let s = (T[lang()] || T.en)[k] || T.en[k] || k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const n = (v) => (typeof v === 'number' && isFinite(v) ? v.toLocaleString('en-IN') : '—');
  const rs = (v) => (typeof v === 'number' && isFinite(v) ? `₹${Math.round(v).toLocaleString('en-IN')}` : '—');
  const day = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
    return m ? `${+m[3]} ${MONTHS[+m[2] - 1]}` : '';
  };

  let saved = null;
  let stats = null;
  try { [saved, stats] = await Promise.all([db().budget(), db().ownerStats().catch(() => null)]); } catch (e) { fail(e); }
  let fresh = !saved;
  const data = saved ? JSON.parse(JSON.stringify({ ...saved, updated: undefined, by: undefined })) : {};
  data.lines = Array.isArray(data.lines) && data.lines.length ? data.lines
    : STARTER.map(([name, daily], i) => ({ id: 'l' + (i + 1), name, plan: null, daily }));
  data.months = data.months || {};
  let key = keyOf(new Date());
  let dirty = false;
  let openTargets = false; // the limit / targets boxes, once the owner opened them

  const ga = (stats && stats.ga) || {};
  const active = ga.in28 != null ? ga.in28 : (ga.a28 != null ? ga.a28 : null);

  // A bar towards a goal. lowerBetter: a limit (loss); else a target to reach.
  const meter = (label, now, goal, text, src, lowerBetter) => {
    const has = typeof now === 'number' && goal > 0;
    const pct = has ? Math.round((now / goal) * 100) : null;
    const width = has ? Math.min(100, Math.max(now > 0 ? 3 : 0, pct)) : 0;
    let color = '#20405E';
    let pill = '';
    if (!(goal > 0)) pill = `<span class="pill off">${esc(t('t_set'))}</span>`;
    else if (has && lowerBetter) {
      if (pct > 100) { color = '#b3302a'; pill = `<span class="pill" style="background:var(--red-tint);color:var(--red)">${esc(t('t_over'))}</span>`; }
      else if (pct >= 80) { color = '#c47a00'; pill = `<span class="pill warn">${esc(t('t_near'))}</span>`; }
      else pill = `<span class="pill on">${esc(t('t_ok'))}</span>`;
    } else if (has && pct >= 100) { color = '#2f7a00'; pill = `<span class="pill on">${esc(t('t_done'))}</span>`; }
    return `<div style="margin:14px 0 6px">
        <div class="row between"><strong>${esc(label)}</strong>${pill}</div>
        <div class="pipe-track" style="margin:7px 0 5px" role="img" aria-label="${esc(label)}: ${esc(text)}"><span class="pipe-bar" style="width:${width}%;background:${color}"></span></div>
        <div class="small" style="font-weight:700;font-variant-numeric:tabular-nums">${esc(text)}</div>
        ${src ? `<div class="small muted">${esc(src)}</div>` : ''}
      </div>`;
  };

  function render() {
    const s = sums(data, key);
    const m = data.months[key] || {};
    const [y, mo] = key.split('-').map(Number);
    const limit = data.limit;
    const gap = typeof limit === 'number' ? limit - s.plan : null;
    const kpi = (label, value, sub, cls = '') => `<div class="kpi" style="cursor:default">
        <span class="kl">${esc(label)}</span><span class="kv">${value}</span><span class="kd ${cls}" style="max-width:100%">${sub || '&nbsp;'}</span></div>`;
    const loss = s.net;
    const kpis = `<section class="kpis">
        ${kpi(t('k_plan'), rs(s.plan), gap == null ? esc(t('k_plan_nolimit')) : esc(t(gap >= 0 ? 'k_plan_under' : 'k_plan_over', { rs: rs(Math.abs(gap)) })), gap == null ? '' : (gap >= 0 ? 'up' : 'down'))}
        ${kpi(t('k_spent'), rs(s.spent), esc(s.current ? t('k_spent_sub', { d: s.day, n: s.days, rs: rs(s.plan) }) : t('k_spent_past', { rs: rs(s.plan) })))}
        ${kpi(t('k_income'), rs(s.income), esc(t('k_income_sub')), s.income ? 'up' : '')}
        ${kpi(t(loss >= 0 ? 'k_loss' : 'k_gain'), rs(Math.abs(loss)), esc([s.current ? t('k_loss_est', { rs: rs(Math.max(0, s.est)) }) : '', typeof limit === 'number' ? t('k_loss_limit', { rs: rs(limit) }) : ''].filter(Boolean).join(' · ')),
          typeof limit === 'number' && (s.current ? s.est : loss) > limit ? 'down' : '')}
      </section>`;

    const row = (l, i) => {
      const spent = (m.spent || {})[l.id];
      const left = (l.plan || 0) - (spent || 0);
      const perDay = l.daily && l.plan ? Math.floor(l.plan / GST / AD_DAYS) : null;
      return `<tr>
          <td style="min-width:170px"><input data-f="name" data-i="${i}" value="${esc(l.name || '')}" placeholder="${esc(t('name_ph'))}" aria-label="${esc(t('th_name'))}">
            ${perDay ? `<div class="small muted" style="margin-top:3px">${esc(t('per_day', { rs: rs(perDay) }))}</div>` : ''}</td>
          <td style="width:112px;min-width:104px"><input type="text" inputmode="numeric" autocomplete="off" data-f="plan" data-i="${i}" value="${l.plan == null ? '' : l.plan}" aria-label="${esc(t('th_plan'))}: ${esc(l.name || '')}" style="text-align:right"></td>
          <td style="width:112px;min-width:104px"><input type="text" inputmode="numeric" autocomplete="off" data-f="spent" data-i="${i}" value="${spent == null ? '' : spent}" aria-label="${esc(t('th_spent'))}: ${esc(l.name || '')}" style="text-align:right"></td>
          <td style="width:96px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;vertical-align:middle;${left < 0 ? 'color:var(--red)' : ''}">${left < 0 ? esc(t('over', { rs: rs(-left) })) : rs(left)}</td>
          <td style="width:44px;text-align:center;vertical-align:middle"><input type="checkbox" data-f="daily" data-i="${i}" ${l.daily ? 'checked' : ''} title="${esc(t('daily_tip'))}" aria-label="${esc(t('daily_tip'))}: ${esc(l.name || '')}" style="width:20px;height:20px"></td>
          <td style="width:40px;vertical-align:middle"><button class="ghost small" data-rm="${i}" title="${esc(t('remove'))}" aria-label="${esc(t('remove'))}: ${esc(l.name || '')}">✕</button></td>
        </tr>`;
    };
    const planCard = `
      <section class="card" style="min-width:0;margin-bottom:14px">
        <div class="ch"><h2>${esc(t('plan_h'))}</h2>
          <span class="row" style="margin-left:auto;gap:6px">
            <button class="ghost small" id="bg-prev" aria-label="${esc(t('prev'))}" title="${esc(t('prev'))}">‹</button>
            <strong style="min-width:84px;text-align:center">${MONTHS[mo - 1]} ${y}</strong>
            <button class="ghost small" id="bg-next" aria-label="${esc(t('next'))}" title="${esc(t('next'))}">›</button>
          </span></div>
        <p class="muted small" style="margin:0 0 6px">${esc(t('plan_sub'))}</p>
        <div style="overflow-x:auto"><table style="min-width:580px">
          <tr><th>${esc(t('th_name'))}</th><th style="text-align:right">${esc(t('th_plan'))}</th><th style="text-align:right">${esc(t('th_spent'))}</th><th style="text-align:right">${esc(t('th_left'))}</th><th title="${esc(t('daily_tip'))}">${esc(t('th_daily'))}</th><th></th></tr>
          ${data.lines.map(row).join('')}
          <tr><td><strong>${esc(t('total'))}</strong></td><td style="text-align:right"><strong>${rs(s.plan)}</strong></td><td style="text-align:right"><strong>${rs(s.spent)}</strong></td><td style="text-align:right"><strong>${rs(s.plan - s.spent)}</strong></td><td></td><td></td></tr>
        </table></div>
        <div class="row" style="margin-top:10px;align-items:flex-end">
          <div style="width:200px"><label for="bg-income">${esc(t('income'))}</label><input id="bg-income" type="text" inputmode="numeric" autocomplete="off" value="${m.income == null ? '' : m.income}" style="text-align:right"></div>
          <button class="btn sec" id="bg-add">${esc(t('add'))}</button>
          <span style="margin-left:auto" class="row">${dirty ? `<span class="pill warn">${esc(t('unsaved'))}</span>` : ''}<button class="btn pri" id="bg-save">${esc(t('save'))}</button></span>
        </div>
      </section>`;

    const lossNow = Math.max(0, loss);
    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
    const through = ga.through ? t('t_active_src', { d: day(ga.through) }) : t('t_active_wait');
    const costNow = active > 0 && s.plan > 0 ? s.plan / active : null;
    const costGoal = data.limit > 0 && data.activeTarget > 0 ? data.limit / data.activeTarget : null;
    const targetsCard = `
      <section class="card" style="min-width:0;margin-bottom:14px">
        <div class="ch"><h2>${esc(t('targets_h'))}</h2></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0 28px">
        ${meter(t('t_loss'), lossNow, data.limit, data.limit > 0 ? t('of', { a: rs(lossNow), b: rs(data.limit), p: pct(lossNow, data.limit) }) : rs(lossNow), '', true)}
        ${meter(t('t_active'), active, data.activeTarget, data.activeTarget > 0 && active != null ? t('of', { a: n(active), b: n(data.activeTarget), p: pct(active, data.activeTarget) }) : n(active), through, false)}
        ${meter(t('t_plus'), data.plusNow || 0, data.plusTarget, data.plusTarget > 0 ? t('of', { a: n(data.plusNow || 0), b: n(data.plusTarget), p: pct(data.plusNow || 0, data.plusTarget) }) : n(data.plusNow || 0), t('t_plus_src'), false)}
        </div>
        <div class="tiles" style="margin-top:14px">
          <div class="tile" style="background:var(--page)"><div class="tile-n" style="font-size:22px">${rs(costNow)}</div><div class="tile-l">${esc(t('cost_now'))}<br><span class="small">${esc(t('cost_now_sub'))}</span></div></div>
          <div class="tile" style="background:var(--page)"><div class="tile-n" style="font-size:22px">${rs(costGoal)}</div><div class="tile-l">${esc(t('cost_goal'))}<br><span class="small">${esc(t('cost_goal_sub'))}</span></div></div>
        </div>
        <details id="bg-edit" ${openTargets || !(data.limit > 0) ? 'open' : ''} style="margin-top:8px">
        <summary class="small" style="cursor:pointer;font-weight:700">${esc(t('edit_targets'))}</summary>
        <div class="form">
          <div><label for="bg-limit">${esc(t('f_limit'))}</label><input id="bg-limit" data-g="limit" type="text" inputmode="numeric" autocomplete="off" value="${data.limit == null ? '' : data.limit}"></div>
          <div><label for="bg-active">${esc(t('f_active'))}</label><input id="bg-active" data-g="activeTarget" type="text" inputmode="numeric" autocomplete="off" value="${data.activeTarget == null ? '' : data.activeTarget}"></div>
          <div><label for="bg-plus">${esc(t('f_plus'))}</label><input id="bg-plus" data-g="plusTarget" type="text" inputmode="numeric" autocomplete="off" value="${data.plusTarget == null ? '' : data.plusTarget}"></div>
          <div><label for="bg-plusnow">${esc(t('f_plus_now'))}</label><input id="bg-plusnow" data-g="plusNow" type="text" inputmode="numeric" autocomplete="off" value="${data.plusNow == null ? '' : data.plusNow}"></div>
        </div>
        </details>
      </section>`;

    setMain(`
      ${db().demo ? `<p class="note">${esc(t('demo'))}</p>` : ''}
      <div class="ph"><div class="ph-t"><h1>${esc(t('title'))}</h1><span class="pill on">${esc(t('only_you'))}</span></div></div>
      ${fresh && !dirty ? `<p class="note" style="margin:8px 0 12px">${esc(t('first'))}</p>` : ''}
      ${kpis}
      ${targetsCard}
      ${planCard}`);
    wire();
  }

  const monthOf = () => { data.months[key] = data.months[key] || {}; return data.months[key]; };
  const shift = (by) => {
    const [y, mo] = key.split('-').map(Number);
    key = keyOf(new Date(y, mo - 1 + by, 1));
    render();
  };

  function wire() {
    const main = document.querySelector('#main');
    main.querySelectorAll('[data-f]').forEach((el) => {
      el.onchange = () => {
        const l = data.lines[+el.dataset.i];
        if (!l) return;
        const f = el.dataset.f;
        if (f === 'name') l.name = el.value.trim().slice(0, 60);
        else if (f === 'plan') l.plan = num(el.value);
        else if (f === 'daily') l.daily = el.checked;
        else if (f === 'spent') {
          const m = monthOf();
          m.spent = m.spent || {};
          const v = num(el.value);
          if (v == null) delete m.spent[l.id]; else m.spent[l.id] = v;
        }
        dirty = true;
        render();
      };
    });
    main.querySelectorAll('[data-g]').forEach((el) => {
      el.onchange = () => { data[el.dataset.g] = num(el.value); dirty = true; render(); };
    });
    main.querySelectorAll('[data-rm]').forEach((b) => {
      b.onclick = () => {
        const [gone] = data.lines.splice(+b.dataset.rm, 1);
        if (gone) Object.values(data.months).forEach((m) => { if (m.spent) delete m.spent[gone.id]; });
        dirty = true;
        render();
      };
    });
    const edit = main.querySelector('#bg-edit');
    if (edit) edit.ontoggle = () => { openTargets = edit.open; };
    const income = main.querySelector('#bg-income');
    if (income) income.onchange = () => { const v = num(income.value); const m = monthOf(); if (v == null) delete m.income; else m.income = v; dirty = true; render(); };
    main.querySelector('#bg-add').onclick = () => {
      data.lines.push({ id: 'l' + Date.now().toString(36), name: '', plan: null, daily: false });
      dirty = true;
      render();
      const inputs = document.querySelectorAll('#main input[data-f="name"]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    };
    main.querySelector('#bg-prev').onclick = () => shift(-1);
    main.querySelector('#bg-next').onclick = () => shift(1);
    main.querySelector('#bg-save').onclick = async () => {
      // Only what the page owns; empty months are not kept.
      const months = {};
      Object.entries(data.months).forEach(([k, m]) => {
        const spent = m.spent && Object.keys(m.spent).length ? m.spent : null;
        if (spent || m.income != null) months[k] = { ...(spent ? { spent } : {}), ...(m.income != null ? { income: m.income } : {}) };
      });
      const out = {
        limit: data.limit ?? null,
        lines: data.lines.filter((l) => (l.name || '').trim() || l.plan != null).map((l) => ({ id: l.id, name: l.name || '', plan: l.plan ?? null, daily: !!l.daily })),
        months,
        activeTarget: data.activeTarget ?? null,
        plusTarget: data.plusTarget ?? null,
        plusNow: data.plusNow ?? null,
      };
      try {
        await db().saveBudget(out);
        data.lines = out.lines.length ? out.lines : data.lines;
        dirty = false;
        fresh = false;
        toast(t('saved'));
        render();
      } catch (e) { fail(e); }
    };
  }

  render();
}
