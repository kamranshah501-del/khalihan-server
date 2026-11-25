// 🔎 What farmers asked Khalihan AI (Admin 1.38, owner 25 Nov 2026: "hum
// monitor kar sakein ki AI se kya kya poocha ja raha hai aur kisan kya
// pooch raha hai, aur phir hum wo cheezein background mein sahi karte
// rahein … personal detail monitor nahin karenge").
//
// Owner only. The app (1.0.9, lib/ai/ai_record.dart) keeps one record per
// visit to a government site with Khalihan AI, and one per talk in "Ask" —
// only while the switch "ai_record" is on AND that farmer has said yes, and
// only the clean copy the AI itself is shown: an Aadhaar / bank / PAN
// number, an OTP, a password, any number of 9 digits or more are never in
// it; no photo, no paper, no sound. Each record deletes itself after 60
// days (Firestore, field `exp`).
//
// This page reads them worst first, so each morning the ten that went
// wrong are read and mended: the instruction or a site note in "AI forms"
// (no new app), or the code.

const T = {
  en: {
    title: '🔎 What farmers asked Khalihan AI',
    help: 'Owner only. The talks farmers agreed to share, worst first — to see where a form gets stuck and what Khalihan AI cannot answer, and mend it. Never in a record: Aadhaar, bank account, PAN, OTP, password, any long number, photos, sound. Each record deletes itself after 60 days.',
    off: 'Nothing is being kept: the switch "Khalihan AI: keep talks for the team" is off (Switches → Khalihan AI). Switch it on only after the privacy page says so.',
    none: 'No records in these days.',
    days: 'Days', all: 'All', forms: 'Forms and papers', asks: 'Questions', only_bad: 'Only the ones that went wrong', search: 'Search in the talk…',
    s_total: 'Talks', s_bad: 'Went wrong', s_no: '"Did it work?" — No', s_yes: '"Did it work?" — Yes', s_slow: 'Slow answers (8 s+)',
    c_when: 'When', c_who: 'Farmer', c_what: 'What', c_turns: 'Turns', c_end: 'Ended', c_score: 'Trouble',
    k_form: 'Form', k_doc: 'Paper', k_status: 'Status', k_ask: 'Question',
    e_done: 'done', e_left: 'left half way', e_stopped: 'he stopped it', e_stuck: 'stuck', e_none: 'no answer', e_out: 'limit reached', e_farmer: 'his turn', e_ask: 'waiting for him', e_ok: 'waiting for his yes', e_later: 'not possible now', e_no: 'not form work', e_next: 'at work', e_his: 'a button only he presses', e_notgov: 'not a government site', e_unknown: 'could not answer',
    worked_yes: 'worked', worked_no: 'did not work',
    top_sites: 'Where it goes wrong, by site', top_boxes: 'What the phone refused or could not do', top_q: 'Questions Khalihan AI could not answer',
    back: '← Back to the list', he: 'Farmer', ai: 'Khalihan AI', phone: 'Phone',
    secs: '{n} s', del: 'Delete this record', del_sure: 'Delete this record for good?', deleted: 'Deleted.',
    who_none: 'not logged in', dev: 'phone', exp: 'deletes itself on {d}', cut: 'A long visit: only the first 80 turns were kept.',
    logged: 'Logged in: {name} · {phone}',
  },
  hi: {
    title: '🔎 किसानों ने Khalihan AI से क्या पूछा',
    help: 'सिर्फ़ मालिक। जिन किसानों ने हाँ कही उनकी बातें, सबसे बिगड़ी सबसे ऊपर — ताकि दिखे फ़ॉर्म कहाँ अटकता है और Khalihan AI क्या नहीं बता पाता, और उसे ठीक किया जाए। रिकॉर्ड में कभी नहीं: आधार, बैंक खाता, PAN, OTP, पासवर्ड, कोई लंबा नंबर, फ़ोटो, आवाज़। हर रिकॉर्ड 60 दिन बाद अपने आप मिट जाता है।',
    off: 'अभी कुछ नहीं रखा जा रहा: स्विच "Khalihan AI: टीम के लिए बातें रखें" बंद है (स्विच → Khalihan AI)। प्राइवेसी पेज में लिखने के बाद ही चालू करें।',
    none: 'इन दिनों का कोई रिकॉर्ड नहीं।',
    days: 'दिन', all: 'सब', forms: 'फ़ॉर्म और कागज़', asks: 'सवाल', only_bad: 'सिर्फ़ जो बिगड़े', search: 'बात में खोजें…',
    s_total: 'बातें', s_bad: 'बिगड़ीं', s_no: '"काम हुआ?" — नहीं', s_yes: '"काम हुआ?" — हाँ', s_slow: 'धीमे जवाब (8 सेकंड+)',
    c_when: 'कब', c_who: 'किसान', c_what: 'क्या', c_turns: 'बारी', c_end: 'कैसे रुका', c_score: 'परेशानी',
    k_form: 'फ़ॉर्म', k_doc: 'कागज़', k_status: 'स्टेटस', k_ask: 'सवाल',
    e_done: 'पूरा', e_left: 'बीच में छोड़ा', e_stopped: 'किसान ने रोका', e_stuck: 'अटका', e_none: 'जवाब नहीं आया', e_out: 'सीमा पूरी', e_farmer: 'किसान की बारी', e_ask: 'जवाब का इंतज़ार', e_ok: 'हाँ का इंतज़ार', e_later: 'अभी नहीं हो सकता', e_no: 'फ़ॉर्म का काम नहीं', e_next: 'काम चल रहा था', e_his: 'बटन किसान का', e_notgov: 'सरकारी साइट नहीं', e_unknown: 'जवाब नहीं दे पाया',
    worked_yes: 'काम हुआ', worked_no: 'काम नहीं हुआ',
    top_sites: 'कहाँ बिगड़ता है, साइट के हिसाब से', top_boxes: 'फ़ोन ने क्या मना किया या नहीं कर पाया', top_q: 'सवाल जिनका जवाब Khalihan AI नहीं दे पाया',
    back: '← सूची पर वापस', he: 'किसान', ai: 'Khalihan AI', phone: 'फ़ोन',
    secs: '{n} से.', del: 'यह रिकॉर्ड मिटाएँ', del_sure: 'यह रिकॉर्ड हमेशा के लिए मिटाएँ?', deleted: 'मिट गया।',
    who_none: 'लॉगिन नहीं', dev: 'फ़ोन', exp: '{d} को अपने आप मिटेगा', cut: 'लंबी बात: सिर्फ़ पहली 80 बारी रखी गईं।',
    logged: 'लॉगिन: {name} · {phone}',
  },
};

// The turns of a record, as the app wrote them (a JSON list as text).
export function turnsOf(r) {
  try {
    const t = JSON.parse(r.turns || '[]');
    return Array.isArray(t) ? t : [];
  } catch (e) {
    return [];
  }
}

const BAD_ENDS = ['stuck', 'none', 'stopped', 'unknown', 'out'];

// How much went wrong in a record, read from its turns (the app's own
// count, `bad`, is a second opinion): what the phone refused or could not
// do ("!" notes), slow answers, a bad ending, "did it work?" — no.
export function trouble(r) {
  const turns = turnsOf(r);
  let refused = 0;
  let slow = 0;
  let failed = 0;
  for (const t of turns) {
    refused += (t.did || []).filter((d) => String(d).startsWith('!')).length;
    if ((t.ms || 0) >= 8000) slow++;
    if (BAD_ENDS.includes(t.end) || String(t.end || '').startsWith('fail_')) failed++;
  }
  const endBad = BAD_ENDS.includes(r.end) || r.end === 'left';
  const score = refused + slow + failed * 2 + (endBad ? 2 : 0) + (r.worked === 'no' ? 5 : 0);
  return { score, refused, slow, failed, endBad };
}

// "…" is his own to fill → the box's name, for the count by box.
export function refusedLabel(note) {
  const m = /^!"([^"]{1,80})"/.exec(String(note));
  return m ? m[1] : String(note).replace(/^!/, '').slice(0, 60);
}

export function summary(list) {
  const out = { total: list.length, bad: 0, yes: 0, no: 0, slow: 0, sites: {}, boxes: {}, questions: [] };
  for (const r of list) {
    const t = trouble(r);
    if (t.score >= 3) out.bad++;
    if (r.worked === 'yes') out.yes++;
    if (r.worked === 'no') out.no++;
    out.slow += t.slow;
    if (r.kind !== 'ask') {
      const s = (out.sites[r.site || r.host || '?'] ||= { n: 0, bad: 0 });
      s.n++;
      if (t.score >= 3) s.bad++;
    }
    for (const turn of turnsOf(r)) {
      for (const d of turn.did || []) {
        if (!String(d).startsWith('!')) continue;
        const k = refusedLabel(d);
        out.boxes[k] = (out.boxes[k] || 0) + 1;
      }
      if (r.kind === 'ask' && (turn.end === 'unknown' || String(turn.end || '').startsWith('fail_')) && turn.he) out.questions.push(turn.he);
    }
  }
  return out;
}

export async function aiWatchPage(deps) {
  const { esc, setMain, lang, db, fail, toast, switchOn } = deps;
  const L = () => (T[lang()] ? lang() : 'en');
  const t = (k, v) => {
    let s = T[L()][k] ?? T.en[k] ?? k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const when = (d) => (d instanceof Date ? d.toLocaleString(L() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
  const endWord = (e) => (String(e || '').startsWith('fail_') ? t('e_none') : (T.en[`e_${e}`] ? t(`e_${e}`) : esc(e || '—')));

  const state = { days: 14, kind: 'all', onlyBad: false, q: '', open: null };
  let list = [];

  async function load() {
    try {
      list = await db().aiTalks(state.days);
    } catch (e) {
      list = [];
      fail(e);
    }
  }

  function shown() {
    const q = state.q.trim().toLowerCase();
    return list
      .map((r) => ({ r, t: trouble(r) }))
      .filter(({ r, t: tr }) => (state.kind === 'all' || (state.kind === 'ask' ? r.kind === 'ask' : r.kind !== 'ask'))
        && (!state.onlyBad || tr.score >= 3)
        && (!q || `${r.turns} ${r.site} ${r.host} ${r.district}`.toLowerCase().includes(q)))
      .sort((a, b) => b.t.score - a.t.score || (b.r.upd?.getTime?.() || 0) - (a.r.upd?.getTime?.() || 0));
  }

  function top(obj, n, pick = (v) => v) {
    return Object.entries(obj).sort((a, b) => pick(b[1]) - pick(a[1])).slice(0, n);
  }

  function drawList() {
    const rows = shown();
    const sum = summary(list);
    const stat = (k, v, warn) => `<div class="card" style="flex:1;min-width:130px;margin:0"><div class="small muted">${esc(t(k))}</div><div style="font-size:26px;font-weight:900;${warn && v ? 'color:var(--amber)' : ''}">${v}</div></div>`;
    const sites = top(sum.sites, 6, (v) => v.bad).filter(([, v]) => v.bad > 0);
    const boxes = top(sum.boxes, 8);
    const qs = [...new Set(sum.questions)].slice(0, 8);
    const filters = `
      <div class="row" style="gap:10px;flex-wrap:wrap;align-items:center;margin:12px 0">
        <label class="small" style="display:flex;align-items:center;gap:6px;white-space:nowrap">${esc(t('days'))} <select id="aw-days" style="width:auto">${[3, 7, 14, 30, 60].map((d) => `<option ${d === state.days ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
        <select id="aw-kind" style="width:auto">
          <option value="all" ${state.kind === 'all' ? 'selected' : ''}>${esc(t('all'))}</option>
          <option value="form" ${state.kind === 'form' ? 'selected' : ''}>${esc(t('forms'))}</option>
          <option value="ask" ${state.kind === 'ask' ? 'selected' : ''}>${esc(t('asks'))}</option>
        </select>
        <label class="small" style="display:flex;align-items:center;gap:6px;white-space:nowrap"><input type="checkbox" id="aw-bad" style="width:auto;margin:0" ${state.onlyBad ? 'checked' : ''}> ${esc(t('only_bad'))}</label>
        <input id="aw-q" type="search" placeholder="${esc(t('search'))}" value="${esc(state.q)}" style="flex:1;min-width:160px">
      </div>`;
    const table = rows.length ? `
      <div class="card" style="padding:0;overflow:auto"><table style="width:100%;border-collapse:collapse">
        <thead><tr>${['c_when', 'c_who', 'c_what', 'c_turns', 'c_end', 'c_score'].map((k) => `<th style="text-align:left;padding:10px 12px" class="small muted">${esc(t(k))}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(({ r, t: tr }) => {
    const first = turnsOf(r).find((x) => x.he)?.he || '';
    return `<tr class="aw-row" data-id="${esc(r.id)}" style="cursor:pointer;border-top:1px solid var(--line)">
            <td style="padding:10px 12px;white-space:nowrap" class="small">${esc(when(r.upd || r.at))}</td>
            <td style="padding:10px 12px" class="small">${esc(r.district || '—')}<div class="muted">${r.uid ? '👤' : esc(t('who_none'))} · ${esc(String(r.dev || '').slice(0, 6))}</div></td>
            <td style="padding:10px 12px"><span class="pill info">${esc(t(`k_${r.kind}`))}</span> ${esc(r.site || '')}<div class="small muted" style="max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(first)}</div></td>
            <td style="padding:10px 12px">${r.n || 0}</td>
            <td style="padding:10px 12px" class="small">${endWord(r.end)}${r.worked ? `<div><span class="pill ${r.worked === 'yes' ? 'on' : 'warn'}">${esc(t(`worked_${r.worked}`))}</span></div>` : ''}</td>
            <td style="padding:10px 12px"><span class="pill ${tr.score >= 3 ? 'warn' : 'off'}">${tr.score}</span></td>
          </tr>`;
  }).join('')}</tbody>
      </table></div>` : `<div class="card muted">${esc(t('none'))}</div>`;
    const listOf = (title, items) => (items.length ? `<div class="card" style="flex:1;min-width:240px;margin:0"><h3 style="margin:0 0 8px">${esc(title)}</h3><ul style="margin:0;padding-left:18px">${items.join('')}</ul></div>` : '');
    setMain(`
      <div class="row" style="align-items:center;gap:10px"><h1 style="margin:0">${esc(t('title'))}</h1></div>
      <p class="help">${esc(t('help'))}</p>
      ${switchOn && !switchOn() ? `<div class="card" style="border-color:var(--amber)">${esc(t('off'))}</div>` : ''}
      <div class="row" style="gap:10px;flex-wrap:wrap">
        ${stat('s_total', sum.total)}${stat('s_bad', sum.bad, true)}${stat('s_no', sum.no, true)}${stat('s_yes', sum.yes)}${stat('s_slow', sum.slow, true)}
      </div>
      <div class="row" style="gap:10px;flex-wrap:wrap;margin-top:10px;align-items:stretch">
        ${listOf(t('top_sites'), sites.map(([k, v]) => `<li>${esc(k)} — <strong>${v.bad}</strong> / ${v.n}</li>`))}
        ${listOf(t('top_boxes'), boxes.map(([k, v]) => `<li>${esc(k)} — <strong>${v}</strong></li>`))}
        ${listOf(t('top_q'), qs.map((q) => `<li>${esc(q)}</li>`))}
      </div>
      ${filters}
      ${table}`);
    const $ = (id) => document.getElementById(id);
    $('aw-days').onchange = async (e) => { state.days = Number(e.target.value) || 14; await load(); drawList(); };
    $('aw-kind').onchange = (e) => { state.kind = e.target.value; drawList(); };
    $('aw-bad').onchange = (e) => { state.onlyBad = e.target.checked; drawList(); };
    $('aw-q').onchange = (e) => { state.q = e.target.value; drawList(); };
    document.querySelectorAll('.aw-row').forEach((tr) => { tr.onclick = () => { state.open = tr.dataset.id; drawOne(); }; });
  }

  async function drawOne() {
    const r = list.find((x) => x.id === state.open);
    if (!r) { state.open = null; return drawList(); }
    const tr = trouble(r);
    const bubble = (who, text, side) => `<div style="display:flex;justify-content:${side === 'r' ? 'flex-end' : 'flex-start'};margin:6px 0"><div style="max-width:78%;padding:9px 12px;border-radius:14px;${side === 'r' ? 'background:var(--green-tint)' : 'background:var(--sky)'}"><div class="small muted">${esc(who)}</div><div style="white-space:pre-wrap">${esc(text)}</div></div></div>`;
    const turns = turnsOf(r).map((x) => `
      ${x.he ? bubble(t('he'), x.he, 'r') : ''}
      ${x.ai ? bubble(x.ph ? t('phone') : t('ai'), x.ai, 'l') : ''}
      ${(x.did || []).map((d) => {
    const no = String(d).startsWith('!');
    return `<div class="small" style="margin:2px 6px;${no ? 'color:#b3261e;font-weight:700' : 'color:var(--muted)'}">${no ? '✕' : '✓'} ${esc(String(d).replace(/^!/, ''))}</div>`;
  }).join('')}
      <div class="small muted" style="margin:2px 6px 10px">${x.end ? endWord(x.end) : ''}${x.ms ? ` · ${esc(t('secs', { n: (x.ms / 1000).toFixed(1) }))}` : ''}${x.pg ? ` · ${esc(x.pg)}` : ''} · +${x.s || 0}s</div>`).join('');
    setMain(`
      <button class="ghost small" id="aw-back">${esc(t('back'))}</button>
      <div class="card" style="margin-top:10px">
        <div><span class="pill info">${esc(t(`k_${r.kind}`))}</span> <strong>${esc(r.site || '')}</strong> <span class="muted">${esc(r.host || '')}</span> <span class="pill ${tr.score >= 3 ? 'warn' : 'off'}">${tr.score}</span></div>
        <div class="small muted" style="margin-top:6px">${esc(when(r.at))} → ${esc(when(r.upd))} · ${esc(r.district || '')}, ${esc(r.state || '')} · ${esc(r.lang || '')} · app ${esc(r.app || '')} · ${esc(r.model || '')}</div>
        <div class="small" id="aw-who" style="margin-top:6px">${r.uid ? '…' : `${esc(t('who_none'))} · ${esc(t('dev'))} ${esc(String(r.dev || '').slice(0, 6))}`}</div>
        <div class="small muted" style="margin-top:6px">${endWord(r.end)}${r.worked ? ` · ${esc(t(`worked_${r.worked}`))}` : ''} · ${esc(t('exp', { d: when(r.exp) }))}</div>
        ${r.cut ? `<div class="small" style="color:var(--amber);margin-top:6px">${esc(t('cut'))}</div>` : ''}
      </div>
      <div class="card">${turns || `<span class="muted">${esc(t('none'))}</span>`}</div>
      <button class="ghost small" id="aw-del">${esc(t('del'))}</button>`);
    document.getElementById('aw-back').onclick = () => { state.open = null; drawList(); };
    document.getElementById('aw-del').onclick = async () => {
      if (!window.confirm(t('del_sure'))) return;
      try {
        await db().aiTalkDelete(r.id);
        list = list.filter((x) => x.id !== r.id);
        toast(t('deleted'));
        state.open = null;
        drawList();
      } catch (e) { fail(e); }
    };
    // Who it was: his account, when he was logged in (the record itself
    // holds no name and no number).
    if (r.uid) {
      try {
        const u = await db().userOf(r.uid);
        const el = document.getElementById('aw-who');
        if (el && state.open === r.id) el.textContent = u ? t('logged', { name: u.name || '—', phone: u.phone || '—' }) : `${t('dev')} ${String(r.dev || '').slice(0, 6)}`;
      } catch (e) { /* the account could not be read: the record still shows */ }
    }
  }

  await load();
  drawList();
}
