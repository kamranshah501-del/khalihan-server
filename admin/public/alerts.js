// Khalihan Admin — alerts on the phone and the computer (Admin 1.30, owner
// 18 Nov 2026, "Part 2" approved 10:41: "Marathi suggestion aaya, notification
// on tha, phir bhi kuch nahi aaya … 3–4 ghante mein reply").
//
// How it works:
//   • "Turn on alerts on this device" asks the browser for notifications and
//     keeps its Firebase push address in staff_devices (firebase-db.js).
//   • The server's alert job (tools/admin_alerts.py, GitHub Actions every 10
//     minutes) sees new farmer messages, messages waiting 3 hours, many in
//     one hour, Khalihan Pro changes and the launch counter, writes them to
//     alerts_team / alerts_owner (the bell) and pushes them to each person's
//     devices, as each person chose here (staff_prefs/{email}).
//   • iPhone: only from the Home Screen icon (Safari → Share → Add to Home
//     Screen), iOS 16.4 or newer — Apple's rule for web apps.

export const ALERT_WORDS = {
  en: {
    al_h: 'Alerts',
    al_d: 'They reach your phone and computer even when Admin is closed. Each person chooses their own.',
    al_devices: 'Your devices',
    al_none: 'No device gets alerts yet.',
    al_this: 'This device',
    al_on: 'Alerts on',
    al_last: 'Last alert {t}',
    al_last_none: 'No alert sent yet',
    al_app: 'Khalihan Admin on the home screen',
    al_remove: 'Remove',
    al_turn_on: 'Turn on alerts on this device',
    al_turning: 'Turning on…',
    al_test: 'Send me a test alert',
    al_test_local: 'Alerts are on for this device.',
    al_test_sent: 'A test alert shows now. A second one comes from the server within about 10 minutes — that one proves alerts arrive while Admin is closed.',
    al_blocked: 'Notifications are blocked for this site. Allow them in the browser\'s site settings, then press the button again.',
    al_failed: 'Alerts could not be turned on here: {e}',
    al_unsupported: 'This browser cannot get alerts. Use Chrome or Edge on a computer or Android, or Safari on an iPhone (from the Home Screen icon).',
    al_ios_h: 'Alerts on this iPhone',
    al_ios_d: 'Do the steps once. After that they come even when Admin is closed.',
    al_ios_1: 'Open khalihan-admin.web.app in Safari.',
    al_ios_2: 'Tap Share, then Add to Home Screen.',
    al_ios_3: 'Open Khalihan Admin from the new icon on the home screen.',
    al_ios_4: 'Go to Settings and alerts, tap Turn on alerts on this device, then Allow.',
    al_what: 'What alerts you',
    al_th_alert: 'Alert', al_th_who: 'Who gets it', al_th_how: 'How', al_th_me: 'For me',
    al_who_both: 'Team and owner', al_who_owner: 'Owner only', al_who_morning: 'Owner (team can turn it on)',
    al_k_problem: 'New problem or "AI answer wrong"',
    al_k_msg: 'New suggestion or praise',
    al_k_3h: 'A message waiting 3 hours',
    al_k_3h_d: 'One hour left in the 4-hour promise',
    al_k_many: 'Many farmers at once',
    al_k_many_d: 'For example 5 messages in one hour. Grouped by problem once app 1.0.9 sends the kind of message.',
    al_k_pro: 'Khalihan Pro',
    al_k_pro_d: 'Bought, trial started, refund, cancelled',
    al_k_launch: 'Launch counter',
    al_k_launch_d: '500, 750 and 1,000 new farmers',
    al_k_morning: 'Morning summary',
    al_k_crash: 'App crashes jump',
    al_k_review: 'New Play Store review',
    al_h_sound: 'At once, with sound',
    al_h_silent: 'At once, silent',
    al_h_remind: 'Reminder, with sound',
    al_h_loud: 'At once, loud, even at night',
    al_h_once: 'Once each',
    al_h_now: 'At once',
    al_h_8: 'Every day, 8:00 am',
    al_always: 'Always on',
    al_later: 'From Dec, with Rakhwala',
    al_quiet: 'Quiet hours',
    al_quiet_d: 'At night only the loud ones come ("many farmers at once"). Everything else waits for the morning summary.',
    al_from: 'From', al_to: 'To',
    al_saved: 'Saved',
    al_tab_h: 'While Admin is open in this browser',
    bell: 'Alerts',
    bell_none: 'No alerts yet.',
    bell_read: 'Mark all read',
    bell_all: 'Settings and alerts',
  },
  hi: {
    al_h: 'अलर्ट',
    al_d: 'Admin बंद हो तब भी आपके फ़ोन और कंप्यूटर पर आते हैं। हर व्यक्ति अपने लिए चुनता है।',
    al_devices: 'आपके डिवाइस',
    al_none: 'अभी किसी डिवाइस पर अलर्ट नहीं आते।',
    al_this: 'यह डिवाइस',
    al_on: 'अलर्ट चालू',
    al_last: 'आख़िरी अलर्ट {t}',
    al_last_none: 'अभी कोई अलर्ट नहीं भेजा',
    al_app: 'होम स्क्रीन पर Khalihan Admin',
    al_remove: 'हटाएँ',
    al_turn_on: 'इस डिवाइस पर अलर्ट चालू करें',
    al_turning: 'चालू हो रहा है…',
    al_test: 'मुझे टेस्ट अलर्ट भेजें',
    al_test_local: 'इस डिवाइस पर अलर्ट चालू हैं।',
    al_test_sent: 'एक टेस्ट अलर्ट अभी दिखेगा। दूसरा लगभग 10 मिनट में सर्वर से आएगा — उससे पता चलता है कि Admin बंद होने पर भी अलर्ट आते हैं।',
    al_blocked: 'इस साइट की सूचनाएँ बंद हैं। ब्राउज़र की साइट सेटिंग में चालू करें, फिर बटन दोबारा दबाएँ।',
    al_failed: 'यहाँ अलर्ट चालू नहीं हो पाए: {e}',
    al_unsupported: 'इस ब्राउज़र में अलर्ट नहीं आ सकते। कंप्यूटर या Android पर Chrome या Edge, या iPhone पर Safari (होम स्क्रीन के आइकन से) इस्तेमाल करें।',
    al_ios_h: 'इस iPhone पर अलर्ट',
    al_ios_d: 'ये कदम एक बार करें। उसके बाद Admin बंद हो तब भी अलर्ट आएँगे।',
    al_ios_1: 'Safari में khalihan-admin.web.app खोलें।',
    al_ios_2: 'Share दबाएँ, फिर Add to Home Screen।',
    al_ios_3: 'होम स्क्रीन के नए आइकन से Khalihan Admin खोलें।',
    al_ios_4: '"सेटिंग्स और अलर्ट" में "इस डिवाइस पर अलर्ट चालू करें" दबाएँ, फिर Allow।',
    al_what: 'किस बात पर अलर्ट',
    al_th_alert: 'अलर्ट', al_th_who: 'किसे', al_th_how: 'कैसे', al_th_me: 'मेरे लिए',
    al_who_both: 'टीम और मालिक', al_who_owner: 'सिर्फ़ मालिक', al_who_morning: 'मालिक (टीम चालू कर सकती है)',
    al_k_problem: 'नई दिक्कत या "AI का जवाब गलत"',
    al_k_msg: 'नया सुझाव या तारीफ़',
    al_k_3h: 'संदेश 3 घंटे से रुका',
    al_k_3h_d: '4 घंटे के वादे में 1 घंटा बाकी',
    al_k_many: 'एक साथ कई किसान',
    al_k_many_d: 'जैसे एक घंटे में 5 संदेश। ऐप 1.0.9 संदेश की किस्म भेजेगा, तब दिक्कत के हिसाब से।',
    al_k_pro: 'Khalihan Pro',
    al_k_pro_d: 'ख़रीदा, ट्रायल शुरू, रिफ़ंड, बंद किया',
    al_k_launch: 'लॉन्च काउंटर',
    al_k_launch_d: '500, 750 और 1,000 नए किसान',
    al_k_morning: 'सुबह का सार',
    al_k_crash: 'ऐप क्रैश बढ़े',
    al_k_review: 'Play Store पर नया रिव्यू',
    al_h_sound: 'तुरंत, आवाज़ के साथ',
    al_h_silent: 'तुरंत, बिना आवाज़',
    al_h_remind: 'याद दिलाना, आवाज़ के साथ',
    al_h_loud: 'तुरंत, ज़ोर से, रात में भी',
    al_h_once: 'हर एक बार',
    al_h_now: 'तुरंत',
    al_h_8: 'रोज़ सुबह 8:00',
    al_always: 'हमेशा चालू',
    al_later: 'दिसंबर से, Rakhwala के साथ',
    al_quiet: 'शांत घंटे',
    al_quiet_d: 'रात में सिर्फ़ ज़ोर वाले आते हैं ("एक साथ कई किसान")। बाकी सब सुबह के सार में।',
    al_from: 'से', al_to: 'तक',
    al_saved: 'सेव हो गया',
    al_tab_h: 'जब Admin इस ब्राउज़र में खुला हो',
    bell: 'अलर्ट',
    bell_none: 'अभी कोई अलर्ट नहीं।',
    bell_read: 'सब पढ़ लिए',
    bell_all: 'सेटिंग्स और अलर्ट',
  },
};

/** The alert kinds, as the server job names them (tools/admin_alerts.py). */
export const ALERT_KINDS = [
  { id: 'msg_problem', label: 'al_k_problem', who: 'both', how: 'al_h_sound' },
  { id: 'msg_new', label: 'al_k_msg', who: 'both', how: 'al_h_silent' },
  { id: 'msg_3h', label: 'al_k_3h', sub: 'al_k_3h_d', who: 'both', how: 'al_h_remind' },
  { id: 'many', label: 'al_k_many', sub: 'al_k_many_d', who: 'both', how: 'al_h_loud', always: true },
  { id: 'pro', label: 'al_k_pro', sub: 'al_k_pro_d', who: 'owner', how: 'al_h_now' },
  { id: 'launch', label: 'al_k_launch', sub: 'al_k_launch_d', who: 'owner', how: 'al_h_once' },
  { id: 'morning', label: 'al_k_morning', who: 'morning', how: 'al_h_8', teamOff: true },
  { id: 'crash', label: 'al_k_crash', who: 'owner', how: 'al_h_now', later: true },
  { id: 'review', label: 'al_k_review', who: 'both', how: 'al_h_now', later: true },
];

/** Is this kind on for this person? (The server job asks the same.) */
export function wants(prefs, kind, owner) {
  const k = ALERT_KINDS.find((x) => x.id === kind);
  if (!k || k.later) return false;
  if (k.always) return true;
  if (k.who === 'owner' && !owner) return false;
  const mine = (prefs && prefs.kinds) || {};
  if (typeof mine[kind] === 'boolean') return mine[kind];
  return !(k.teamOff && !owner);
}

/** What kind of device and browser this is, for the list of devices. */
export function deviceInfo() {
  const ua = navigator.userAgent || '';
  const iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const kind = /iPhone/.test(ua) ? 'iPhone' : iPad ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Computer';
  const browser = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const app = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let tz = 'Asia/Kolkata';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch (_) { /* keep India */ }
  return { kind, browser, app, tz, ios: /iPhone|iPod/.test(ua) || iPad };
}

const HERE_KEY = 'khalihan_admin_device';
const hereId = () => { try { return localStorage.getItem(HERE_KEY) || ''; } catch (_) { return ''; } };
const setHere = (id) => { try { if (id) localStorage.setItem(HERE_KEY, id); else localStorage.removeItem(HERE_KEY); } catch (_) { /* this session only */ } };

/** The Alerts card on "Settings and alerts". deps: {tr, esc, db, me, toast, fail, when} */
export async function alertsCard(deps) {
  const { tr, esc, db, me, when } = deps;
  const owner = me.role === 'owner';
  const info = deviceInfo();
  const [devices, prefs, supported] = await Promise.all([
    db.myDevices().catch(() => []),
    db.alertPrefs().catch(() => ({})),
    db.pushSupported(),
  ]);
  const here = hereId();
  const hereOn = devices.some((d) => d.id === here) && (typeof Notification === 'undefined' || Notification.permission === 'granted');
  const devRow = (d) => `<div class="aldev">
      <div class="grow"><b>${esc(d.kind || '—')}</b> · ${esc(d.app ? tr('al_app') : (d.browser || ''))}${d.id === here ? ` <span class="pill info">${tr('al_this')}</span>` : ''}
        <div class="sub">${d.last_sent ? tr('al_last', { t: when(d.last_sent) }) : tr('al_last_none')}</div></div>
      <span class="pill on">${tr('al_on')}</span>
      <button class="plain small" data-aldel="${esc(d.id)}">${tr('al_remove')}</button>
    </div>`;
  let hereBlock;
  if (hereOn) {
    hereBlock = `<div class="actions"><button class="btn sec" id="al-test">${tr('al_test')}</button></div>`;
  } else if (supported) {
    hereBlock = `<div class="actions"><button class="main" id="al-on">${tr('al_turn_on')}</button></div>
      <p class="muted small" id="al-note" hidden></p>`;
  } else if (info.ios && !info.app) {
    hereBlock = `<div class="alsetup"><b>${tr('al_ios_h')}</b><p class="small muted">${tr('al_ios_d')}</p>
      <ol>${[1, 2, 3, 4].map((n) => `<li>${tr('al_ios_' + n)}</li>`).join('')}</ol></div>`;
  } else {
    hereBlock = `<p class="muted small">${tr('al_unsupported')}</p>`;
  }
  const mine = (prefs && prefs.kinds) || {};
  const rowsHtml = ALERT_KINDS.filter((k) => owner || k.who !== 'owner').map((k) => {
    const on = wants(prefs, k.id, owner);
    const cell = k.later ? `<span class="muted small">${tr('al_later')}</span>`
      : k.always ? `<span class="pill on">${tr('al_always')}</span>`
        : `<input type="checkbox" data-alk="${k.id}" ${on ? 'checked' : ''} aria-label="${esc(tr(k.label))}">`;
    return `<tr${k.later ? ' class="dim"' : ''}><td><b>${tr(k.label)}</b>${k.sub ? `<div class="small muted">${tr(k.sub)}</div>` : ''}</td>
      <td class="small">${tr(k.who === 'owner' ? 'al_who_owner' : k.who === 'morning' ? 'al_who_morning' : 'al_who_both')}</td>
      <td class="small">${tr(k.how)}</td><td style="text-align:center">${cell}</td></tr>`;
  }).join('');
  const q = prefs.quiet || { from: '22:00', to: '07:00' };
  const html = `<div class="card" id="al-card">
      <div class="title">${tr('al_h')}</div>
      <div class="sub">${tr('al_d')}</div>
      <h3 class="alh">${tr('al_devices')}</h3>
      ${devices.length ? devices.map(devRow).join('') : `<p class="muted small">${tr('al_none')}</p>`}
      ${hereBlock}
      <h3 class="alh">${tr('al_what')}</h3>
      <div class="tablewrap"><table class="altable">
        <tr><th>${tr('al_th_alert')}</th><th>${tr('al_th_who')}</th><th>${tr('al_th_how')}</th><th>${tr('al_th_me')}</th></tr>
        ${rowsHtml}
      </table></div>
      <h3 class="alh">${tr('al_quiet')}</h3>
      <p class="small muted" style="margin:0 0 6px">${tr('al_quiet_d')}</p>
      <div class="row" style="gap:12px;flex-wrap:wrap">
        <label class="small">${tr('al_from')} <input type="time" id="al-qf" value="${esc(q.from)}"></label>
        <label class="small">${tr('al_to')} <input type="time" id="al-qt" value="${esc(q.to)}"></label>
      </div>
    </div>`;
  return { html, wire: () => wireCard(deps, { devices, prefs, info }) };
}

function wireCard(deps, st) {
  const { tr, db, toast, fail, rerender } = deps;
  const $ = (id) => document.getElementById(id);
  const savePrefs = async (part) => {
    try {
      await db.saveAlertPrefs({ ...part, tz: st.info.tz });
      toast(tr('al_saved'));
    } catch (e) { fail(e); }
  };
  document.querySelectorAll('[data-alk]').forEach((box) => {
    box.onchange = () => {
      const kinds = { ...((st.prefs && st.prefs.kinds) || {}), [box.dataset.alk]: box.checked };
      st.prefs = { ...st.prefs, kinds };
      savePrefs({ kinds });
    };
  });
  const quiet = () => savePrefs({ quiet: { from: $('al-qf').value || '22:00', to: $('al-qt').value || '07:00' } });
  if ($('al-qf')) { $('al-qf').onchange = quiet; $('al-qt').onchange = quiet; }
  document.querySelectorAll('[data-aldel]').forEach((b) => {
    b.onclick = async () => {
      const id = b.dataset.aldel;
      try { await db.turnOffPush(id, id === hereId()); if (id === hereId()) setHere(''); rerender(); } catch (e) { fail(e); }
    };
  });
  const on = $('al-on');
  if (on) on.onclick = async () => {
    const note = $('al-note');
    on.disabled = true;
    on.textContent = tr('al_turning');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { note.textContent = tr('al_blocked'); note.hidden = false; on.disabled = false; on.textContent = tr('al_turn_on'); return; }
      const id = await db.turnOnPush(st.info);
      setHere(id);
      // Morning summary and quiet hours follow this device's clock.
      await db.saveAlertPrefs({ tz: st.info.tz }).catch(() => {});
      rerender();
    } catch (e) {
      console.error(e);
      note.textContent = tr('al_failed', { e: String((e && (e.code || e.message)) || e) });
      note.hidden = false;
      on.disabled = false;
      on.textContent = tr('al_turn_on');
    }
  };
  const test = $('al-test');
  if (test) test.onclick = async () => {
    test.disabled = true;
    try {
      const reg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js') || await navigator.serviceWorker.ready;
      await reg.showNotification('Khalihan Admin', { body: tr('al_test_local'), icon: '/icons/icon-192.png', tag: 'kh-test' });
      await db.testAlert(hereId());
      toast(tr('al_test_sent'));
    } catch (e) { fail(e); }
    test.disabled = false;
  };
}

/** The bell's list. deps: {tr, esc, ago} */
export function bellList(list, seenAt, deps) {
  const { tr, esc, ago } = deps;
  if (!list.length) return `<div class="bellnone">${tr('bell_none')}</div>`;
  return list.map((a) => `<a class="bellitem${a.at && a.at.getTime() > seenAt ? ' new' : ''}" href="${esc(a.link || '/#home')}">
      <span class="belldot ${esc(a.kind || '')}" aria-hidden="true"></span>
      <span class="grow"><b>${esc(a.title || '')}</b><span>${esc(a.body || '')}</span></span>
      <span class="muted small">${a.at ? esc(ago(a.at)) : ''}</span></a>`).join('');
}
