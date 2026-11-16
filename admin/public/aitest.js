// 🧪 Khalihan AI — the 200-question test (Admin 1.22, branch admin-ai,
// 11 Nov 2026). AI rule 7: before farmers get Khalihan AI, 200 real
// questions from Jamner farmers (Marathi, Hindi, Ahirani) are asked on the
// test phone and an agri graduate marks every answer. The share that is
// right becomes the accuracy line under AI answers ("जाँच: 200 में से 190
// जवाब सही (95%) · कृषि स्नातक · नवंबर 2026") — only the measured number,
// never a made-up one; until a test is complete the line says "जाँच चल
// रही है".
//
// The loop, with no new Firestore rule:
//   1. Paste the farmers' questions here (one per line) → a test run.
//   2. "Copy for the phone" → paste into the test phone (test build:
//      Profile → Khalihan AI की जाँच). The phone asks each one exactly as a
//      farmer would (phone first, Gemini when the phone can't follow) and
//      gives back its results to copy.
//   3. Paste the phone's results here; the grader marks each answer
//      ✓ right · ½ partly · ✗ wrong, with a note.
// Stored owner-only under business/ (business/ai_tests = the list,
// business/ai_test_<id> = one run). A separate grader login needs a
// rules change — only with the owner's OK.

const T = {
  en: {
    title: '🧪 Khalihan AI test',
    only_you: 'Owners only',
    intro: 'AI rule 7: 200 real questions from farmers, each answer checked by an agri graduate. The share marked right is the only number Khalihan AI may show under its answers.',
    runs_h: 'Test runs',
    none: 'No test yet. Paste the farmers\' questions below to start one.',
    new_h: 'New test',
    f_name: 'Name',
    name_ph: 'e.g. Jamner, November',
    f_lang: 'Language of these questions',
    f_qs: 'Questions — one per line (as the farmer said it)',
    qs_ph: 'कापसाचा आज काय भाव आहे?\nउद्या फवारणी करू का?',
    create: 'Make the test',
    added: '{n} questions',
    open: 'Open',
    back: '‹ All tests',
    step1: '1 · Ask on the test phone',
    step1_d: 'Copy, send it to yourself on WhatsApp, copy it on the test phone and paste it in Profile → "Khalihan AI की जाँच". The phone asks every question as a farmer would and shows its results to copy.',
    copy_phone: 'Copy for the phone',
    copied: 'Copied',
    step2: '2 · Paste the phone\'s results',
    paste_ph: 'Paste what the phone copied…',
    load: 'Put in the answers',
    loaded: '{n} answers put in',
    bad_paste: 'That is not the phone\'s result for this test.',
    step3: '3 · Mark every answer',
    f_grader: 'Checked by',
    grader_ph: 'e.g. कृषि स्नातक, KVK Jalgaon',
    q: 'Question',
    understood: 'AI understood',
    answer: 'Answer shown',
    via_phone: 'Phone understood it',
    via_cloud: 'Gemini read it',
    via_fail: 'Not answered',
    no_answer: 'No answer from the phone yet',
    ok: '✓ Right',
    part: '½ Partly',
    wrong: '✗ Wrong',
    note_ph: 'Note (what was wrong)',
    filter_all: 'All',
    filter_todo: 'Not marked',
    filter_wrong: 'Wrong / partly',
    sum_h: 'Result',
    k_asked: 'Questions',
    k_answered: 'Answered by the phone',
    k_marked: 'Marked',
    k_right: 'Right',
    by_kind: 'By kind of question',
    by_lang: 'By language',
    line_h: 'The line under AI answers',
    line_wait: 'जाँच चल रही है',
    line_wait_why: 'Shown until at least 200 answers are marked.',
    line_done: 'जाँच: {n} में से {r} जवाब सही ({p}%) · {by} · {m}',
    csv: 'Download CSV',
    save: 'Save',
    saved: 'Saved',
    unsaved: 'Not saved yet',
    del: 'Delete this test',
    del_ask: 'Delete this test and all its marks?',
    demo: 'Demo: sample questions and answers, not real ones.',
    langs: { mr: 'Marathi', hi: 'Hindi', ahi: 'Ahirani', en: 'English', mix: 'Mixed' },
  },
  hi: {
    title: '🧪 Khalihan AI की जाँच',
    only_you: 'सिर्फ़ मालिक',
    intro: 'AI नियम 7: किसानों के 200 असली सवाल, हर जवाब कृषि स्नातक जाँचे। जितने जवाब सही निकलें, बस वही संख्या Khalihan AI अपने जवाब के नीचे दिखा सकता है।',
    runs_h: 'जाँचें',
    none: 'अभी कोई जाँच नहीं। नीचे किसानों के सवाल डालकर शुरू करें।',
    new_h: 'नई जाँच',
    f_name: 'नाम',
    name_ph: 'जैसे जामनेर, नवंबर',
    f_lang: 'इन सवालों की भाषा',
    f_qs: 'सवाल — हर लाइन में एक (जैसे किसान ने बोला)',
    qs_ph: 'कापसाचा आज काय भाव आहे?\nउद्या फवारणी करू का?',
    create: 'जाँच बनाएँ',
    added: '{n} सवाल',
    open: 'खोलें',
    back: '‹ सब जाँचें',
    step1: '1 · टेस्ट फ़ोन पर पूछें',
    step1_d: 'कॉपी करें, WhatsApp पर ख़ुद को भेजें, टेस्ट फ़ोन पर कॉपी करके प्रोफ़ाइल → "Khalihan AI की जाँच" में डालें। फ़ोन हर सवाल किसान की तरह पूछेगा और नतीजा कॉपी करने को देगा।',
    copy_phone: 'फ़ोन के लिए कॉपी करें',
    copied: 'कॉपी हो गया',
    step2: '2 · फ़ोन का नतीजा डालें',
    paste_ph: 'फ़ोन ने जो कॉपी किया, यहाँ डालें…',
    load: 'जवाब डालें',
    loaded: '{n} जवाब डाले',
    bad_paste: 'ये इस जाँच का फ़ोन वाला नतीजा नहीं है।',
    step3: '3 · हर जवाब जाँचें',
    f_grader: 'किसने जाँचा',
    grader_ph: 'जैसे कृषि स्नातक, KVK जलगांव',
    q: 'सवाल',
    understood: 'AI ने समझा',
    answer: 'दिखाया गया जवाब',
    via_phone: 'फ़ोन ने समझा',
    via_cloud: 'Gemini ने पढ़ा',
    via_fail: 'जवाब नहीं दिया',
    no_answer: 'फ़ोन से अभी जवाब नहीं आया',
    ok: '✓ सही',
    part: '½ अधूरा',
    wrong: '✗ गलत',
    note_ph: 'नोट (क्या गलत था)',
    filter_all: 'सब',
    filter_todo: 'बिना जाँचे',
    filter_wrong: 'गलत / अधूरे',
    sum_h: 'नतीजा',
    k_asked: 'सवाल',
    k_answered: 'फ़ोन ने जवाब दिया',
    k_marked: 'जाँचे गए',
    k_right: 'सही',
    by_kind: 'सवाल के हिसाब से',
    by_lang: 'भाषा के हिसाब से',
    line_h: 'AI के जवाब के नीचे की लाइन',
    line_wait: 'जाँच चल रही है',
    line_wait_why: 'कम से कम 200 जवाब जाँचे जाने तक यही दिखेगा।',
    line_done: 'जाँच: {n} में से {r} जवाब सही ({p}%) · {by} · {m}',
    csv: 'CSV डाउनलोड',
    save: 'Save',
    saved: 'सेव हो गया',
    unsaved: 'अभी सेव नहीं हुआ',
    del: 'ये जाँच हटाएँ',
    del_ask: 'ये जाँच और इसके सारे निशान हटा दें?',
    demo: 'डेमो: नमूने के सवाल-जवाब, असली नहीं।',
    langs: { mr: 'मराठी', hi: 'हिंदी', ahi: 'अहिराणी', en: 'English', mix: 'मिली-जुली' },
  },
};

const KINDS = {
  en: { price: 'Price', where: 'Where to sell', money: 'Money in hand', weather: 'Weather', spray: 'Spraying', dawai: 'Which medicine', unknown: 'Not understood' },
  hi: { price: 'भाव', where: 'कहाँ बेचें', money: 'कितने पैसे', weather: 'मौसम', spray: 'छिड़काव', dawai: 'कौन सी दवा', unknown: 'नहीं समझा' },
};
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const NEED = 200;

/** Questions pasted as lines → items (empty and repeated lines dropped). */
export function questionsFrom(text, lang, startAt = 1) {
  const seen = new Set();
  const out = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const q = raw.replace(/^\s*[\d०-९]+[.)]\s*/, '').trim();
    if (!q || seen.has(q)) continue;
    seen.add(q);
    out.push({ n: startAt + out.length, q: q.slice(0, 300), lang });
  }
  return out;
}

/** The phone's copied result → {n: answer} for this run, or null. */
export function resultsFrom(text, runId) {
  let json;
  try { json = JSON.parse(String(text || '').trim()); } catch (_) { return null; }
  if (!json || json.khalihan_ai_test_result !== 1 || json.run !== runId || !Array.isArray(json.items)) return null;
  const out = {};
  for (const it of json.items) {
    const n = Number(it && it.n);
    if (!Number.isInteger(n) || n < 1) continue;
    out[n] = {
      via: ['phone', 'cloud', 'fail'].includes(it.via) ? it.via : 'fail',
      understood: String(it.understood || '').slice(0, 300),
      kind: String(it.kind || 'unknown').slice(0, 60),
      answer: String(it.answer || '').slice(0, 1200),
      source: String(it.source || '').slice(0, 300),
      fail: it.fail ? String(it.fail).slice(0, 40) : '',
    };
  }
  return { app: String(json.app || ''), lang: String(json.lang || ''), at: String(json.at || ''), answers: out };
}

/** Counts for a run: asked, answered, marked, right (½ is not right). */
export function tally(items) {
  const s = { asked: items.length, answered: 0, marked: 0, right: 0, part: 0, wrong: 0, byKind: {}, byLang: {} };
  const bump = (map, key, grade) => {
    const m = map[key] || (map[key] = { n: 0, right: 0 });
    m.n++;
    if (grade === 'ok') m.right++;
  };
  for (const it of items) {
    if (it.ai) s.answered++;
    if (!it.grade) continue;
    s.marked++;
    if (it.grade === 'ok') s.right++;
    else if (it.grade === 'part') s.part++;
    else s.wrong++;
    for (const k of String((it.ai && it.ai.kind) || 'unknown').split('+')) bump(s.byKind, k || 'unknown', it.grade);
    bump(s.byLang, it.lang || 'mix', it.grade);
  }
  return s;
}

/** The accuracy line, or null while the test isn't complete (rule 1, 7). */
export function accuracyLine(s, by, when) {
  if (s.marked < NEED || !by) return null;
  const p = Math.floor((s.right / s.marked) * 100);
  const d = when instanceof Date ? when : new Date();
  return T.hi.line_done
    .replace('{n}', String(s.marked)).replace('{r}', String(s.right)).replace('{p}', String(p))
    .replace('{by}', by).replace('{m}', `${MONTHS_HI[d.getMonth()]} ${d.getFullYear()}`);
}

export async function aiTestPage(deps) {
  const { esc, setMain, lang, db, fail, toast } = deps;
  const L = () => (T[lang()] ? lang() : 'en');
  const t = (k, v) => {
    let s = T[L()][k] ?? T.en[k] ?? k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const kindName = (k) => String(k || 'unknown').split('+').map((x) => KINDS[L()][x] || x).join(' + ');
  const langName = (k) => T[L()].langs[k] || k;

  let list = [];
  let run = null; // the open test
  let dirty = false;
  let filter = 'all';

  async function loadList() {
    try { list = ((await db().aiTests()) || {}).runs || []; } catch (e) { fail(e); list = []; }
  }

  async function save() {
    try {
      await db().saveAiTest(run);
      dirty = false;
      toast(t('saved'));
      await loadList();
    } catch (e) { fail(e); }
  }

  // ───────────────────────────────────────────── the list + a new test
  function drawList() {
    const rows = list.map((r) => `<tr>
        <td><strong>${esc(r.name || r.id)}</strong><div class="small muted">${esc(r.created || '')}</div></td>
        <td style="text-align:right">${r.asked || 0}</td>
        <td style="text-align:right">${r.marked || 0}</td>
        <td style="text-align:right">${r.marked ? `${Math.floor(((r.right || 0) / r.marked) * 100)}%` : '—'}</td>
        <td style="text-align:right"><button class="btn sec" data-open="${esc(r.id)}">${esc(t('open'))}</button></td></tr>`).join('');
    setMain(`
      ${db().demo ? `<p class="note">${esc(t('demo'))}</p>` : ''}
      <div class="ph"><div class="ph-t"><h1>${esc(t('title'))}</h1><span class="pill on">${esc(t('only_you'))}</span></div></div>
      <p class="muted" style="margin:6px 0 14px;max-width:760px">${esc(t('intro'))}</p>
      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('runs_h'))}</h2></div>
        ${list.length ? `<div style="overflow-x:auto"><table style="min-width:520px">
          <tr><th>${esc(t('f_name'))}</th><th style="text-align:right">${esc(t('k_asked'))}</th><th style="text-align:right">${esc(t('k_marked'))}</th><th style="text-align:right">${esc(t('k_right'))}</th><th></th></tr>
          ${rows}</table></div>` : `<p class="muted">${esc(t('none'))}</p>`}
      </section>
      <section class="card">
        <div class="ch"><h2>${esc(t('new_h'))}</h2></div>
        <div class="form">
          <div><label for="at-name">${esc(t('f_name'))}</label><input id="at-name" placeholder="${esc(t('name_ph'))}"></div>
          <div><label for="at-lang">${esc(t('f_lang'))}</label><select id="at-lang">
            ${['mr', 'hi', 'ahi', 'mix', 'en'].map((k) => `<option value="${k}">${esc(langName(k))}</option>`).join('')}</select></div>
        </div>
        <label for="at-qs">${esc(t('f_qs'))}</label>
        <textarea id="at-qs" rows="8" style="width:100%;box-sizing:border-box" placeholder="${esc(t('qs_ph'))}"></textarea>
        <div class="row" style="margin-top:10px"><span class="small muted" id="at-count"></span><button class="btn pri" id="at-create" style="margin-left:auto">${esc(t('create'))}</button></div>
      </section>`);
    document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => openRun(b.dataset.open)));
    const qs = document.getElementById('at-qs');
    const count = () => { document.getElementById('at-count').textContent = t('added', { n: questionsFrom(qs.value, 'mr').length }); };
    qs.addEventListener('input', count);
    document.getElementById('at-create').addEventListener('click', async () => {
      const items = questionsFrom(qs.value, document.getElementById('at-lang').value);
      if (!items.length) return;
      const now = new Date();
      run = {
        id: `r${now.getTime().toString(36)}`,
        name: document.getElementById('at-name').value.trim() || now.toISOString().slice(0, 10),
        created: now.toISOString().slice(0, 10),
        grader: '',
        items,
      };
      await save();
      drawRun();
    });
  }

  async function openRun(id) {
    try { run = await db().aiTest(id); } catch (e) { fail(e); return; }
    if (!run) return;
    run = JSON.parse(JSON.stringify({ ...run, updated: undefined, by: undefined }));
    dirty = false;
    filter = 'all';
    drawRun();
  }

  // ───────────────────────────────────────────── one test
  function drawRun() {
    const s = tally(run.items);
    const line = accuracyLine(s, run.grader, run.markedAt ? new Date(run.markedAt) : new Date());
    const kpi = (label, value) => `<div class="kpi" style="cursor:default"><span class="kl">${esc(label)}</span><span class="kv">${value}</span><span class="kd">&nbsp;</span></div>`;
    const breakdown = (map, name) => Object.entries(map).sort((a, b) => b[1].n - a[1].n).map(([k, v]) =>
      `<tr><td>${esc(name(k))}</td><td style="text-align:right">${v.n}</td><td style="text-align:right">${v.right}</td><td style="text-align:right">${Math.floor((v.right / v.n) * 100)}%</td></tr>`).join('');
    const shown = run.items.filter((it) => filter === 'all' || (filter === 'todo' ? !it.grade : (it.grade === 'wrong' || it.grade === 'part')));
    const gradeBtn = (it, g, label) => `<button class="btn ${it.grade === g ? 'pri' : 'sec'}" data-g="${g}" data-n="${it.n}" aria-pressed="${it.grade === g}">${esc(label)}</button>`;
    const via = (a) => (a.via === 'cloud' ? t('via_cloud') : a.via === 'phone' ? t('via_phone') : `${t('via_fail')}${a.fail ? ` (${a.fail})` : ''}`);
    const card = (it) => `<div class="card" style="margin:0 0 10px;padding:12px 14px">
        <div class="row between" style="align-items:flex-start;gap:10px">
          <div style="min-width:0"><span class="small muted">#${it.n} · ${esc(langName(it.lang))}</span><div style="font-weight:800;font-size:16px">${esc(it.q)}</div></div>
          ${it.ai ? `<span class="pill ${it.ai.via === 'fail' ? 'warn' : ''}">${esc(kindName(it.ai.kind))}</span>` : ''}
        </div>
        ${it.ai ? `
          <div class="small" style="margin-top:6px"><strong>${esc(t('understood'))}:</strong> ${esc(it.ai.understood || '—')} <span class="muted">· ${esc(via(it.ai))}</span></div>
          <div style="margin-top:6px;background:var(--page);border-radius:10px;padding:8px 10px;white-space:pre-wrap">${esc(it.ai.answer || '—')}</div>
          ${it.ai.source ? `<div class="small muted" style="margin-top:4px">${esc(it.ai.source)}</div>` : ''}
          <div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">
            ${gradeBtn(it, 'ok', t('ok'))}${gradeBtn(it, 'part', t('part'))}${gradeBtn(it, 'wrong', t('wrong'))}
            <input data-note="${it.n}" value="${esc(it.note || '')}" placeholder="${esc(t('note_ph'))}" aria-label="${esc(t('note_ph'))} #${it.n}" style="flex:1;min-width:180px">
          </div>` : `<p class="small muted" style="margin:6px 0 0">${esc(t('no_answer'))}</p>`}
      </div>`;
    setMain(`
      ${db().demo ? `<p class="note">${esc(t('demo'))}</p>` : ''}
      <div class="ph"><div class="ph-t"><button class="ghost small" id="at-back">${esc(t('back'))}</button><h1>${esc(run.name)}</h1></div>
        <div class="ph-acts row">${dirty ? `<span class="pill warn">${esc(t('unsaved'))}</span>` : ''}<button class="btn pri" id="at-save">${esc(t('save'))}</button></div></div>
      <section class="kpis">${kpi(t('k_asked'), s.asked)}${kpi(t('k_answered'), s.answered)}${kpi(t('k_marked'), s.marked)}${kpi(t('k_right'), s.marked ? `${Math.floor((s.right / s.marked) * 100)}%` : '—')}</section>
      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('line_h'))}</h2></div>
        <p style="font-weight:800;margin:4px 0">${esc(line || t('line_wait'))}</p>
        ${line ? '' : `<p class="small muted" style="margin:0">${esc(t('line_wait_why'))}</p>`}
        ${s.marked ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:10px">
          <div><strong class="small">${esc(t('by_kind'))}</strong><table><tr><th></th><th style="text-align:right">${esc(t('k_marked'))}</th><th style="text-align:right">${esc(t('k_right'))}</th><th></th></tr>${breakdown(s.byKind, kindName)}</table></div>
          <div><strong class="small">${esc(t('by_lang'))}</strong><table><tr><th></th><th style="text-align:right">${esc(t('k_marked'))}</th><th style="text-align:right">${esc(t('k_right'))}</th><th></th></tr>${breakdown(s.byLang, langName)}</table></div>
        </div>` : ''}
      </section>
      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('step1'))}</h2></div>
        <p class="small muted" style="margin:0 0 8px">${esc(t('step1_d'))}</p>
        <button class="btn sec" id="at-copy">${esc(t('copy_phone'))}</button>
      </section>
      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('step2'))}</h2></div>
        <textarea id="at-paste" rows="3" style="width:100%;box-sizing:border-box" placeholder="${esc(t('paste_ph'))}"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn sec" id="at-load">${esc(t('load'))}</button></div>
      </section>
      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('step3'))}</h2></div>
        <div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px">
          <div style="min-width:240px;flex:1"><label for="at-grader">${esc(t('f_grader'))}</label><input id="at-grader" value="${esc(run.grader || '')}" placeholder="${esc(t('grader_ph'))}"></div>
          <div class="segs" role="group">${['all', 'todo', 'wrong'].map((f) => `<button class="btn ${filter === f ? 'pri' : 'sec'}" data-filter="${f}">${esc(t(`filter_${f}`))}</button>`).join('')}</div>
          <button class="btn sec" id="at-csv">${esc(t('csv'))}</button>
        </div>
        ${shown.map(card).join('')}
      </section>
      <div class="row"><button class="ghost small" id="at-del" style="color:var(--red)">${esc(t('del'))}</button></div>`);
    wireRun();
  }

  function wireRun() {
    const touch = () => { dirty = true; };
    document.getElementById('at-back').addEventListener('click', async () => { run = null; await loadList(); drawList(); });
    document.getElementById('at-save').addEventListener('click', async () => { await save(); drawRun(); });
    document.getElementById('at-copy').addEventListener('click', async () => {
      const payload = JSON.stringify({ khalihan_ai_test: 1, run: run.id, qs: run.items.map((it) => ({ n: it.n, q: it.q })) });
      try { await navigator.clipboard.writeText(payload); toast(t('copied')); } catch (e) { fail(e); }
    });
    document.getElementById('at-load').addEventListener('click', () => {
      const got = resultsFrom(document.getElementById('at-paste').value, run.id);
      if (!got) { toast(t('bad_paste')); return; }
      let n = 0;
      for (const it of run.items) {
        const a = got.answers[it.n];
        if (!a) continue;
        it.ai = a;
        n++;
      }
      run.phone = { app: got.app, lang: got.lang, at: got.at };
      touch();
      toast(t('loaded', { n }));
      drawRun();
    });
    document.getElementById('at-grader').addEventListener('input', (e) => { run.grader = e.target.value.trim(); touch(); });
    document.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; drawRun(); }));
    document.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => {
      const it = run.items.find((x) => x.n === Number(b.dataset.n));
      if (!it) return;
      it.grade = it.grade === b.dataset.g ? null : b.dataset.g;
      run.markedAt = new Date().toISOString();
      touch();
      drawRun();
    }));
    document.querySelectorAll('[data-note]').forEach((i) => i.addEventListener('input', () => {
      const it = run.items.find((x) => x.n === Number(i.dataset.note));
      if (it) { it.note = i.value; touch(); }
    }));
    document.getElementById('at-csv').addEventListener('click', () => {
      const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = [['n', 'language', 'question', 'understood', 'via', 'kind', 'answer', 'source', 'grade', 'note']]
        .concat(run.items.map((it) => [it.n, it.lang, it.q, it.ai?.understood, it.ai?.via, it.ai?.kind, it.ai?.answer, it.ai?.source, it.grade || '', it.note || '']));
      const blob = new Blob(['﻿' + rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `khalihan-ai-test-${run.id}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    document.getElementById('at-del').addEventListener('click', async () => {
      if (!window.confirm(t('del_ask'))) return;
      try { await db().deleteAiTest(run.id); run = null; await loadList(); drawList(); } catch (e) { fail(e); }
    });
  }

  await loadList();
  drawList();
}

/** One line per test for the list (business/ai_tests). */
export function runSummary(run) {
  const s = tally(run.items || []);
  return { id: run.id, name: run.name, created: run.created, asked: s.asked, marked: s.marked, right: s.right };
}
