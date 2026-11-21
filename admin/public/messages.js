// Khalihan Admin — Farmer messages: who sent it, and a reply in 4 hours
// (Admin 1.31, owner 18 Nov 2026 — Admin rework Part 1, approved 10:30).
//
// App 1.0.10 sends, with the message and its kind, whatever the farmer chose
// to share: name, a small photo, mobile number, phone details and what went
// wrong in the app this week; also the phone's random ID (`dev`) and an
// English translation (`en`). The reply is written here in Hindi or English;
// it goes to inbox/{dev}/replies, the alert job pushes it to his phone
// (reply_queue), and his phone shows it in his own language.
// Messages from older apps carry none of this: those can only be marked Done.

export const MSG_WORDS = {
  en: {
    mg_unknown: 'Unknown farmer',
    mg_farmer: 'Farmer {id}',
    mg_kind_problem: 'Problem', mg_kind_ai_wrong: 'AI answer wrong', mg_kind_suggestion: 'Suggestion', mg_kind_praise: 'Praise',
    mg_open: 'Open and reply',
    mg_waiting: 'waiting {t} of 4 h',
    mg_late: 'waiting {t} — past 4 h',
    mg_replied: 'Replied',
    mg_shared_name: 'Shared his name', mg_shared_photo: 'Shared his photo', mg_shared_phone: 'Shared his mobile',
    mg_call: 'Call', mg_wa: 'WhatsApp', mg_show: 'Show',
    mg_mobile: 'Mobile', mg_phone: 'Phone', mg_app: 'App', mg_when: 'When he sent it',
    mg_net_wifi: 'Wi-Fi', mg_net_mobile: 'Mobile data', mg_net_none: 'No internet', mg_net_other: 'Other connection', mg_net_unknown: '',
    mg_notif_on: 'notifications on', mg_notif_off: 'notifications off',
    mg_english: 'English:',
    mg_trail_h: 'What happened on his phone · last 7 days',
    mg_trail_none: 'Nothing went wrong in the app this week.',
    mg_trail_hidden: 'Phone details not shared.',
    mg_earlier: 'Earlier with him',
    mg_sent_replies: 'Replies sent',
    mg_helped_yes: 'he said it helped', mg_helped_no: 'he said it did not help',
    mg_quick: 'Quick replies:',
    mg_q1: 'We are fixing it', mg_q2: 'It is already in the app', mg_q3: 'Tell us more', mg_q4: 'Thank you',
    mg_q1_t: 'We have seen the problem and are fixing it. It will come in the next update.',
    mg_q2_t: 'This is already in the app. You will find it here: ',
    mg_q3_t: 'Please tell us a little more: which page, which crop, what happened?',
    mg_q4_t: 'Thank you! Your message has reached the Khalihan team.',
    mg_hello: 'Hello {n},',
    mg_box: 'Your reply (write in Hindi or English — he reads it in {l}; his phone translates it)',
    mg_send_app: 'Send in the app',
    mg_send_wa: 'Send on WhatsApp',
    mg_done_only: 'Done without a reply',
    mg_old_app: 'Sent from an old app (before 1.0.9) — no reply possible in the app. Only Done.',
    mg_sent_ok: 'Sent. His phone gets it within about 10 minutes.',
    mg_write_first: 'Write the reply first.',
    k_wait: 'Waiting for a reply', k_oldest: 'Oldest one waiting', k_today: 'Replied today', k_avg: 'Average reply time (7 days)',
    mg_f_replied: 'Replied',
  },
  hi: {
    mg_unknown: 'अनजान किसान',
    mg_farmer: 'किसान {id}',
    mg_kind_problem: 'दिक्कत', mg_kind_ai_wrong: 'AI का जवाब गलत', mg_kind_suggestion: 'सुझाव', mg_kind_praise: 'तारीफ़',
    mg_open: 'खोलें और जवाब दें',
    mg_waiting: '4 घंटे में से {t} से रुका',
    mg_late: '{t} से रुका — 4 घंटे पार',
    mg_replied: 'जवाब दिया',
    mg_shared_name: 'नाम दिया', mg_shared_photo: 'फ़ोटो दी', mg_shared_phone: 'मोबाइल दिया',
    mg_call: 'फ़ोन', mg_wa: 'WhatsApp', mg_show: 'दिखाएँ',
    mg_mobile: 'मोबाइल', mg_phone: 'फ़ोन', mg_app: 'ऐप', mg_when: 'भेजते समय',
    mg_net_wifi: 'Wi-Fi', mg_net_mobile: 'मोबाइल डेटा', mg_net_none: 'इंटरनेट नहीं', mg_net_other: 'दूसरा कनेक्शन', mg_net_unknown: '',
    mg_notif_on: 'सूचनाएँ चालू', mg_notif_off: 'सूचनाएँ बंद',
    mg_english: 'English:',
    mg_trail_h: 'उसके फ़ोन पर क्या हुआ · पिछले 7 दिन',
    mg_trail_none: 'इस हफ़्ते ऐप में कोई गड़बड़ नहीं।',
    mg_trail_hidden: 'फ़ोन की जानकारी नहीं दी।',
    mg_earlier: 'उसके साथ पहले',
    mg_sent_replies: 'भेजे गए जवाब',
    mg_helped_yes: 'उसने कहा मदद मिली', mg_helped_no: 'उसने कहा मदद नहीं मिली',
    mg_quick: 'झटपट जवाब:',
    mg_q1: 'ठीक कर रहे हैं', mg_q2: 'ऐप में पहले से है', mg_q3: 'और बताइए', mg_q4: 'धन्यवाद',
    mg_q1_t: 'हमें दिक्कत दिख गई है, हम इसे ठीक कर रहे हैं। अगले अपडेट में आ जाएगा।',
    mg_q2_t: 'यह ऐप में पहले से है। यहाँ मिलेगा: ',
    mg_q3_t: 'कृपया थोड़ा और बताइए: कौन-सा पेज, कौन-सी फ़सल, क्या हुआ?',
    mg_q4_t: 'धन्यवाद! आपका संदेश Khalihan टीम तक पहुँच गया।',
    mg_hello: 'नमस्ते {n} जी,',
    mg_box: 'आपका जवाब (हिंदी या English में लिखें — वह {l} में पढ़ेगा; उसका फ़ोन अनुवाद करता है)',
    mg_send_app: 'ऐप में भेजें',
    mg_send_wa: 'WhatsApp पर भेजें',
    mg_done_only: 'बिना जवाब के पूरा',
    mg_old_app: 'पुराने ऐप (1.0.9 से पहले) से आया — ऐप में जवाब नहीं जा सकता। सिर्फ़ पूरा करें।',
    mg_sent_ok: 'भेज दिया। उसके फ़ोन पर लगभग 10 मिनट में पहुँचेगा।',
    mg_write_first: 'पहले जवाब लिखें।',
    k_wait: 'जवाब का इंतज़ार', k_oldest: 'सबसे पुराना रुका', k_today: 'आज जवाब दिए', k_avg: 'जवाब का औसत समय (7 दिन)',
    mg_f_replied: 'जवाब दिए',
  },
};

const LANG_NAME = { en: 'English', hi: 'Hindi', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi', te: 'Telugu', kn: 'Kannada', ta: 'Tamil', bn: 'Bengali', ml: 'Malayalam' };
const PROMISE = 4 * 3600e3;

/** problem, ai_wrong, suggestion, praise — or '' (an old app's message). */
export function msgKind(f) {
  if (f.kind) return f.kind;
  return String(f.text || '').startsWith('🤖') ? 'ai_wrong' : '';
}

/** A short id a person can say on the phone: "KH-2Z8P" from the phone's random ID. */
export const farmerId = (dev) => (dev ? 'KH-' + String(dev).slice(0, 4).toUpperCase() : '');

export function senderName(f, tr) {
  if (f.name) return f.name;
  return f.dev ? tr('mg_farmer', { id: farmerId(f.dev) }) : tr('mg_unknown');
}

const initials = (t) => String(t).replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export function avatar(f, tr, esc, size = 40) {
  const style = `width:${size}px;height:${size}px;border-radius:50%;flex:none`;
  if (f.photo && /^[A-Za-z0-9+/=]+$/.test(f.photo)) {
    return `<img src="data:image/png;base64,${f.photo}" alt="" style="${style};object-fit:cover">`;
  }
  return `<span class="mgav" style="${style};font-size:${Math.round(size * 0.38)}px" aria-hidden="true">${esc(f.name ? initials(f.name) : (f.dev ? 'KH' : '?'))}</span>`;
}

/** The waiting time against the 4-hour promise. */
export function waitLine(f, tr, dur) {
  if (f.replied_at) return `<span class="pill on">${tr('mg_replied')}</span>`;
  if (f.done || !(f.at instanceof Date)) return '';
  const age = Date.now() - f.at.getTime();
  return `<span class="pill ${age >= PROMISE ? 'warn' : 'info'}">${age >= PROMISE ? tr('mg_late', { t: dur(age) }) : tr('mg_waiting', { t: dur(age) })}</span>`;
}

/** The line above a message in the list: who, kind, waiting. */
export function msgHead(f, deps) {
  const { tr, esc, dur } = deps;
  const kind = msgKind(f);
  return `<div class="mghead">${avatar(f, tr, esc, 36)}
    <div class="grow"><b>${esc(senderName(f, tr))}</b>${kind ? ` <span class="chip mgk ${esc(kind)}">${tr('mg_kind_' + kind)}</span>` : ''}</div>
    ${waitLine(f, tr, dur)}</div>`;
}

/** The KPIs at the top of the page. */
export function msgStats(rows, open, deps) {
  const { tr, dur } = deps;
  const now = Date.now();
  const waiting = rows.filter((f) => !f.done && f.at instanceof Date).sort((a, b) => a.at - b.at);
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const answeredAt = (f) => f.replied_at || f.done_at;
  const today = rows.filter((f) => answeredAt(f) instanceof Date && answeredAt(f) >= startToday).length;
  const week = rows.filter((f) => answeredAt(f) instanceof Date && f.at instanceof Date && now - f.at.getTime() < 7 * 864e5);
  const avg = week.length ? week.reduce((a, f) => a + (answeredAt(f) - f.at), 0) / week.length : null;
  const stat = (n, l, cls = '') => `<div class="stat ${cls}"><div class="n">${n}</div><div class="l">${l}</div></div>`;
  return stat(open, tr('k_wait'), open ? 'warn' : '')
    + stat(waiting.length ? dur(now - waiting[0].at) : '—', tr('k_oldest'), waiting.length && now - waiting[0].at > PROMISE ? 'warn' : '')
    + stat(today, tr('k_today'), 'good')
    + stat(avg == null ? '—' : dur(avg), tr('k_avg'));
}

/** The whole message in the side panel, with the reply. deps: {tr, esc, db, me, lang, openPanel, closePanel,
 *  toast, fail, when, dur, rows, onChange} */
export async function openMessage(f, deps) {
  const { tr, esc, db, openPanel, closePanel, toast, fail, when, dur, rows, onChange } = deps;
  const kind = msgKind(f);
  const info = f.info || {};
  const ten = String(f.phone || '').replace(/\D/g, '').slice(-10);
  const masked = ten ? `+91 ${ten.slice(0, 2)}••• ••${ten.slice(7)}` : '';
  const farmerLang = LANG_NAME[f.lang] || f.lang || '—';
  const earlier = (rows || []).filter((x) => x.id !== f.id && f.dev && x.dev === f.dev).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 5);
  const canApp = !!f.dev;
  const quick = [1, 2, 3, 4].map((n) => `<button class="plain small" data-q="${n}">${tr('mg_q' + n)}</button>`).join('');
  const trail = Array.isArray(f.trail) ? f.trail : null;
  const panel = openPanel(`
    <div class="mgsender">
      ${avatar(f, tr, esc, 56)}
      <div class="grow">
        <h1 style="margin:0">${esc(senderName(f, tr))}</h1>
        <div class="sub">${f.dev ? `${esc(farmerId(f.dev))} · ` : ''}${esc(f.district || f.state || '—')}${f.state && f.district ? ', ' + esc(f.state) : ''} · ${esc(farmerLang)}</div>
        <div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap">
          ${f.name ? `<span class="pill on">${tr('mg_shared_name')}</span>` : ''}
          ${f.photo ? `<span class="pill on">${tr('mg_shared_photo')}</span>` : ''}
          ${ten ? `<span class="pill on">${tr('mg_shared_phone')}</span>` : ''}
        </div>
      </div>
    </div>
    ${ten ? `<div class="row" style="gap:8px;margin:10px 0">
      <a class="btn pri" href="tel:+91${esc(ten)}">${tr('mg_call')}</a>
      <a class="btn sec" href="https://wa.me/91${esc(ten)}" target="_blank" rel="noopener">${tr('mg_wa')}</a></div>` : ''}
    <div class="kv">
      ${ten ? `<div>${tr('mg_mobile')}</div><div><span id="mg-num">${esc(masked)}</span> <button class="linkbtn inl" id="mg-show">${tr('mg_show')}</button></div>` : ''}
      ${info.model || info.android ? `<div>${tr('mg_phone')}</div><div>${esc([info.model, info.android ? 'Android ' + info.android : ''].filter(Boolean).join(' · '))}</div>` : ''}
      <div>${tr('mg_app')}</div><div>${esc(f.app || '—')}</div>
      ${info.net || info.notif ? `<div>${tr('mg_when')}</div><div>${esc([info.net ? tr('mg_net_' + info.net) : '', info.notif ? tr(info.notif === 'on' ? 'mg_notif_on' : 'mg_notif_off') : ''].filter(Boolean).join(' · '))}</div>` : ''}
    </div>
    <section class="mgmsg">
      <div class="small" style="font-weight:800">${kind ? esc(tr('mg_kind_' + kind).toUpperCase()) + ' · ' : ''}${when(f.at)} ${waitLine(f, tr, dur)}</div>
      <div style="white-space:pre-wrap;overflow-wrap:anywhere;margin-top:6px;font-size:16px">${esc(f.text)}</div>
      ${f.en ? `<div class="small" style="margin-top:6px"><b>${tr('mg_english')}</b> ${esc(f.en)}</div>` : ''}
    </section>
    <h3 class="alh">${tr('mg_trail_h')}</h3>
    ${trail ? (trail.length ? `<ul class="small mgtrail">${trail.slice().reverse().map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : `<p class="small muted">${tr('mg_trail_none')}</p>`)
      : `<p class="small muted">${f.info ? tr('mg_trail_none') : tr('mg_trail_hidden')}</p>`}
    ${earlier.length ? `<h3 class="alh">${tr('mg_earlier')}</h3>${earlier.map((x) => `<div class="small" style="margin-bottom:4px">${when(x.at)} · “${esc(String(x.text || '').slice(0, 80))}”${x.replied_at ? ` · <b>${tr('mg_replied')}</b>` : ''}</div>`).join('')}` : ''}
    <div id="mg-replies"></div>
    ${canApp ? `
      <div class="small muted" style="margin:14px 0 6px">${tr('mg_quick')} ${quick}</div>
      <label for="mg-text" class="small" style="font-weight:700">${tr('mg_box', { l: esc(farmerLang) })}</label>
      <textarea id="mg-text" rows="4" maxlength="1000" style="width:100%;box-sizing:border-box;margin-top:4px"></textarea>
      <div class="actions row" style="flex-wrap:wrap;gap:8px">
        <button class="main" id="mg-send">${tr('mg_send_app')}</button>
        ${ten ? `<button class="btn sec" id="mg-wa">${tr('mg_send_wa')}</button>` : ''}
        ${f.done ? '' : `<button class="plain" id="mg-done">${tr('mg_done_only')}</button>`}
      </div>`
    : `<p class="note small" style="margin-top:14px">${tr('mg_old_app')}</p>
      ${f.done ? '' : `<div class="actions"><button class="main" id="mg-done">${tr('mg_done_only')}</button></div>`}`}`);
  const $p = (id) => panel.querySelector('#' + id);
  if ($p('mg-show')) $p('mg-show').onclick = () => { $p('mg-num').textContent = `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`; $p('mg-show').hidden = true; };
  // The replies already sent to this phone for this message.
  if (f.dev && db.farmerReplies) {
    db.farmerReplies(f.dev).then((list) => {
      const mine = list.filter((r) => r.for === f.id);
      const box = $p('mg-replies');
      if (!box || !mine.length) return;
      box.innerHTML = `<h3 class="alh">${tr('mg_sent_replies')}</h3>` + mine.map((r) => `<div class="mgreply small">
        <div><b>${esc(r.by_name || r.by || '')}</b> · ${when(r.at)}${r.helped === true ? ` · ${tr('mg_helped_yes')}` : r.helped === false ? ` · ${tr('mg_helped_no')}` : ''}</div>
        <div style="white-space:pre-wrap">${esc(r.text)}</div></div>`).join('');
    }).catch((e) => console.warn(e));
  }
  const text = $p('mg-text');
  panel.querySelectorAll('[data-q]').forEach((b) => {
    b.onclick = () => {
      const hello = f.name ? tr('mg_hello', { n: f.name.split(/\s+/)[0] }) + ' ' : '';
      const body = tr('mg_q' + b.dataset.q + '_t');
      text.value = (text.value.trim() ? text.value.trim() + ' ' : hello) + body;
      text.focus();
    };
  });
  const finish = async () => { closePanel(); if (onChange) await onChange(); };
  if ($p('mg-send')) $p('mg-send').onclick = async () => {
    const t = text.value.trim();
    if (!t) return toast(tr('mg_write_first'));
    $p('mg-send').disabled = true;
    try {
      await db.replyToFarmer(f, t, /[ऀ-ॿ]/.test(t) ? 'hi' : 'en');
      toast(tr('mg_sent_ok'));
      await finish();
    } catch (e) { $p('mg-send').disabled = false; fail(e); }
  };
  if ($p('mg-wa')) $p('mg-wa').onclick = async () => {
    const t = text.value.trim();
    if (!t) return toast(tr('mg_write_first'));
    window.open(`https://wa.me/91${ten}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
    try { await db.feedbackDone(f.id, true); await finish(); } catch (e) { fail(e); }
  };
  if ($p('mg-done')) $p('mg-done').onclick = async () => {
    try { await db.feedbackDone(f.id, true); await finish(); } catch (e) { fail(e); }
  };
}
