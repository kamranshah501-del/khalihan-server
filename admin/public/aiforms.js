// 🧠 Khalihan AI — Forms (Admin 1.33, owner 22 Nov 2026: "AI me changes
// Admin se ho sake … pehle test phone par, phir sab kisanon ke liye … jo
// bhi kisan form bharega us par hamari nazar rahegi — data par nahi").
//
// What Khalihan AI does inside "Fill a government form" and "Get a
// document", changed without a new app: the Gemini models, the
// instruction it is given, how many pages and Google looks a visit, how
// fast it writes, the "open a new account?" question, notes about a site,
// and the lists of sites. A change goes to the owner's test phones first
// (a test gift code); "Send to every farmer" copies it to all. Every
// version is kept; any earlier one can go live again.
//
// Stored in config/app → ai_forms {live, test} (the app reads config/app
// already; no new Firestore rule) and business/ai_forms_history (owner
// only). The app checks everything it takes (lib/ai/ai_forms.dart) and
// keeps its own copy when something is missing or wrong.
//
// NEVER here, locked in the app: Aadhaar / bank / OTP / password /
// captcha boxes are never filled by the AI, "Submit" is never pressed,
// only gov.in / nic.in sites open, the farmer's details never go to the AI.

// The app's own instruction (lib/ai/gov_brain.dart → builtIn(), app 1.0.9,
// 22 Nov 2026) — "Put the app's own text here" starts from it.
export const APP_INSTRUCTION = "You are Khalihan AI. An Indian farmer has a government website open inside the Khalihan app, and you look at the page with him. You get the page's title, its visible words (long numbers are hidden as [number]), its buttons (numbered from 0) and its boxes (each with i, label, hint, kind, choices, whether already filled, whether private) — never what is typed in a box. You also get the names of the details the phone already has for him (not their values), and sometimes a site_note: what the Khalihan team knows about this site — use it when it helps. Reply in JSON only.\n\nkind: \"login\" (asks a user name / mobile / email and a password to sign in), \"otp\" (asks a one-time code sent by SMS), \"captcha\" (only a verification picture or code), \"form\" (boxes to fill: an application, a new-account registration, a search), \"error\" (the page says something went wrong: wrong details, not found, session expired, server error, try again), \"success\" (submitted, registered, application number given, paper ready to download), \"info\" (nothing to fill: a notice, a menu, a list).\nwhat: this page in at most 6 words, in the farmer's language.\nsay: one or two short sentences for the farmer, in his language: what this page is and what happens next. On a form say how many papers it needs if it names them. Never ask for Aadhaar, PAN, bank account, OTP or a password.\ndocs: the papers this page asks him to upload or keep ready — only papers the page itself names (upload, attach, documents required). Name each the way farmers say it (7/12, 8-A, Aadhaar card, bank passbook, photo, income certificate). i = the index of the file box that takes it, or -1.\nmap: boxes whose meaning you are sure of, with key one of: name, firstName, middleName, lastName, father, mobile, email, village, taluka, district, state, pincode, crop, area, gat, gender, dob, age, category, address. Leave out a box you are unsure of, and never map a box for Aadhaar, PAN, bank account, IFSC, OTP, password or captcha.\nask: for each box that is not private and not already filled, a short, plain question to ask the farmer aloud in his language — the way a helpful neighbour at the Seva Kendra would ask (for example \"आपकी जमीन कितने हेक्टेयर है?\"). Say what the box means, not its cryptic label.\nuser, pass, login: on a login page, the i of the user-name box, the i of the password box, and the number of the sign-in button in buttons. On a new-account registration page, user and pass are the boxes where he chooses his user name and his password, and login is -1. Otherwise -1.\nsigned: \"in\" if the page shows he is signed in (Logout / Sign out, \"Welcome\" with a person's name, My profile, My applications); \"out\" if the page asks him to sign in or offers a citizen / farmer / applicant Login or a new-account registration and shows no Logout; \"none\" if the page says nothing about a citizen's account, or its login is only for officers and departments.\njoin: the number in buttons of the button or link that opens a NEW citizen account (Register, New user, Sign up, New applicant registration, नवीन नोंदणी, नया पंजीकरण) — one that creates his login, not a scheme's form that needs none. -1 if none.\nenter: the number in buttons of the link or button that opens the citizen's sign-in page, when this page is not itself the sign-in page. -1 otherwise.\nproblem: on an error page, what the page says went wrong, in his language, in one sentence. Otherwise \"\".\nfix: on an error page, what he should do now, in one sentence, only from what the page says or what is plainly true (check the detail, wait and try again, ask the helpline on the page). Otherwise \"\".\n\nNever invent scheme rules, amounts, dates or papers that are not on the page. Write numbers in digits. Speak to him with respect (aap / tumhi), in short sentences.";

export const AIFORMS_DEFAULTS = { models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'], help_models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'], pages: 14, searches: 4, type_ms: 90, ask_account: true };

const MODELS = [
  ['gemini-3.8-flash', 'm_flash'],
  ['gemini-3.5-flash-lite', 'm_lite'],
];
// Claude reads a page through our own server (brain/ → form-brain), which
// alone holds Anthropic's key — owner, 24 Nov 2026: "ek Gemini ka aur ek
// Sonnet; jo sahi raha usko switch mein, doosre ko optional". Only for
// reading the page: "Look it up on Google" is Gemini's own tool. Apps before
// 1.0.9 skip a Claude name and read with the Gemini one beside it.
const PAGE_MODELS = [...MODELS, ['claude-sonnet-5-5', 'm_sonnet']];
export const isClaude = (m) => /^claude-/.test(String(m || ''));

const T = {
  en: {
    title: '🧠 Khalihan AI — Forms',
    only_you: 'Owners only',
    demo: 'Demo data — nothing here is saved.',
    now_h: 'Now',
    every: 'Every farmer',
    tests: 'Your test phones',
    own: 'The app\'s own (nothing set here)',
    no_test: 'No change being tried',
    ver: 'v{v} · {when} · {by}',
    go_live: 'Send to every farmer',
    go_live_q: 'Send v{v} to every farmer\'s phone? They take it within seconds.',
    drop_test: 'Remove the test',
    clear: 'Back to the app\'s own everywhere',
    clear_q: 'Remove everything set here? Every phone goes back to the app\'s own (the history stays).',
    locked_h: 'Locked in the app — never from here',
    locked: [
      'Aadhaar, bank, IFSC, OTP, password and captcha boxes are never filled by the AI. The phone itself types only: Aadhaar / PAN after the farmer\'s yes; a site password from its locked store after his fingerprint / face / PIN (23 Nov 2026); a captcha he reads out. Bank and OTP: always his own hand.',
      '"Submit" is never pressed by Khalihan — the farmer presses it.',
      'Only gov.in / nic.in sites open inside the app; a list here with another address is dropped by the phone.',
      'The farmer\'s details never go to the AI — only the page\'s own words, with long numbers hidden.',
    ],
    edit_h: 'Change — goes to your test phones first',
    edit_from: 'Starting from: {what}',
    from_test: 'the test version',
    from_live: 'what every farmer has',
    from_own: 'the app\'s own',
    models_h: 'Model that reads the page',
    first: 'First', backup: 'If it fails',
    m_flash: 'Gemini 3.8 Flash (best)',
    m_lite: 'Gemini 3.5 Flash-Lite (cheap)',
    m_sonnet: 'Claude Sonnet 5.5 (fast — through our server)',
    m_why: 'Tests of 24 Nov, 12 government pages and 38 harder turns: Gemini Flash and Claude Sonnet read alike (115–116 of 116; 179 and 177 of 180). Sonnet answers in about 3 seconds; Flash in about 6, and now and then stalls for half a minute or more. A page costs about the same with either (70 paise to ₹1); Flash-Lite is cheap and misses more. Put one first and the other under "If it fails": when the first does not answer in 10 seconds, the other reads the page.',
    m_claude: 'Claude: the page\'s words (long numbers hidden — the same as Gemini gets) go through our server to Anthropic, whose computers are in the USA. Try it on your test phones freely. Before sending it to every farmer, the privacy page and Play\'s data-safety form must name Anthropic.',
    go_live_claude_q: 'This version reads pages with Claude: the page\'s words go to Anthropic (USA). Does the privacy page name Anthropic already? Press OK only if it does.',
    m_none: '— none —',
    help_h: 'Model for "Look it up on Google"',
    pages: 'Pages Khalihan AI reads on one visit',
    searches: 'Google looks on one visit',
    type_ms: 'Slowest writing speed (milliseconds a letter)',
    ask_account: 'When he is not signed in on a site: ask "Your login is not found — shall I open a new account?"',
    instr_h: 'What Khalihan AI is told (its instruction)',
    instr_d: 'Empty = the app\'s own. 200 to 20,000 letters, or the phone keeps its own. The phone still checks every reply (private boxes, long numbers).',
    instr_own: 'Put the app\'s own text here',
    instr_n: '{n} letters',
    notes_h: 'Notes about a site (told to Khalihan AI on that site)',
    notes_d: 'What the team learnt, e.g. "OTP comes to the mobile linked with Aadhaar". 500 letters at most.',
    note_site: 'Site address (e.g. mahadbt.maharashtra.gov.in)',
    note_text: 'Note',
    add_note: '+ Note',
    lists_h: 'The lists of sites',
    lists_d: 'Empty = the app\'s own list. Only https gov.in / nic.in addresses; "States" empty = every state.',
    forms_l: '"Fill a government form"',
    docs_l: '"Get a document"',
    s_id: 'Short id', s_url: 'Address (https://…)', s_hi: 'Name — हिंदी', s_mr: 'Name — मराठी', s_en: 'Name — English', s_states: 'States (comma)',
    add_site: '+ Site',
    own_list: 'Fill with the app\'s own list',
    remove: 'Remove',
    note_h: 'What changed (for the history)',
    note_ph: 'e.g. MahaDBT OTP note; Flash first',
    save: 'Save to test phones',
    saved: 'v{v} is on your test phones. Check it there, then "Send to every farmer".',
    bad_url: 'Dropped (not https gov.in / nic.in): {u}',
    bad_num: 'Check the numbers: pages 1–40, Google 0–10, speed 15–150.',
    bad_instr: 'The instruction must be empty or 200 to 20,000 letters.',
    hist_h: 'History',
    hist_none: 'Nothing saved yet.',
    th_v: 'Version', th_to: 'Went to', th_when: 'When', th_by: 'By', th_note: 'What changed',
    to_test: 'test phones', to_live: 'every farmer',
    back: 'Make live again',
    back_q: 'Make v{v} live for every farmer again (as a new version)?',
    done_back: 'v{v} is live for every farmer.',
    nums_h: 'Forms — last 28 days',
    nums_d: 'Counts only, from the app\'s own records (Analytics), updated twice a day — never a farmer\'s name, number or what he typed.',
    nums_none: 'No numbers yet (the stats job runs twice a day; forms are off for farmers until app 1.0.9).',
    n_open: 'Opened a government site', n_offer: 'Khalihan AI offered to fill', n_fill: 'Farmer said "Yes, fill it"',
    n_filled: 'A form was filled', n_ask: 'Questions asked', n_account: '"Login not found — new account?" asked',
    n_join: 'Opened a new account page', n_joined: 'New account made', n_login: 'Signed in with Khalihan',
    n_signed: 'Already signed in', n_trouble: 'Site showed an error', n_fail: 'Site did not open', n_resume: 'Site reloaded — the fill went on',
    by_site: 'Forms filled, by site', stuck_h: 'Where sites refused a box (kind:reason)', fail_h: 'Why sites did not open',
    nobody: 'none yet',
  },
  hi: {
    title: '🧠 Khalihan AI — फ़ॉर्म',
    only_you: 'सिर्फ़ मालिक',
    demo: 'डेमो डेटा — यहाँ कुछ सेव नहीं होता।',
    now_h: 'अभी',
    every: 'हर किसान',
    tests: 'आपके टेस्ट फ़ोन',
    own: 'ऐप का अपना (यहाँ कुछ नहीं रखा)',
    no_test: 'कोई बदलाव टेस्ट में नहीं',
    ver: 'v{v} · {when} · {by}',
    go_live: 'हर किसान को भेजें',
    go_live_q: 'v{v} हर किसान के फ़ोन पर भेजें? कुछ सेकंड में पहुँच जाएगा।',
    drop_test: 'टेस्ट हटाएँ',
    clear: 'हर जगह वापस ऐप का अपना',
    clear_q: 'यहाँ रखा सब हटाएँ? हर फ़ोन ऐप के अपने पर लौटेगा (इतिहास रहेगा)।',
    locked_h: 'ऐप के अंदर बंद — यहाँ से कभी नहीं बदलता',
    locked: [
      'Aadhaar, बैंक, IFSC, OTP, पासवर्ड और कैप्चा के खाने AI कभी नहीं भरता (Aadhaar / PAN सिर्फ़ फ़ोन, किसान की हाँ के बाद)।',
      '"जमा करें" Khalihan कभी नहीं दबाता — किसान दबाता है।',
      'ऐप में सिर्फ़ gov.in / nic.in साइट खुलती हैं; यहाँ की सूची में कोई और पता हो तो फ़ोन उसे छोड़ देता है।',
      'किसान की जानकारी AI को कभी नहीं जाती — सिर्फ़ पेज के अपने शब्द, लंबे नंबर छिपाकर।',
    ],
    edit_h: 'बदलाव — पहले आपके टेस्ट फ़ोन पर',
    edit_from: 'शुरुआत: {what}',
    from_test: 'टेस्ट वाला वर्शन',
    from_live: 'जो हर किसान के पास है',
    from_own: 'ऐप का अपना',
    models_h: 'पेज पढ़ने वाला मॉडल',
    first: 'पहले', backup: 'वो न चले तो',
    m_flash: 'Gemini 3.8 Flash (सबसे अच्छा)',
    m_lite: 'Gemini 3.5 Flash-Lite (सस्ता)',
    m_sonnet: 'Claude Sonnet 5.5 (तेज़ — हमारे सर्वर से)',
    m_why: '24 Nov की जाँच, 12 सरकारी पेज और 38 मुश्किल मोड़: Gemini Flash और Claude Sonnet बराबर पढ़ते हैं (116 में 115–116; 180 में 179 और 177)। Sonnet लगभग 3 सेकंड में जवाब देता है; Flash लगभग 6 में, और कभी-कभी आधा मिनट या ज़्यादा अटकता है। एक पेज का ख़र्च दोनों में लगभग बराबर (70 पैसे से ₹1); Flash-Lite सस्ता है और ज़्यादा चूकता है। एक को "पहले" रखें, दूसरे को "वो न चले तो" में: पहला 10 सेकंड में जवाब न दे तो दूसरा पेज पढ़ता है।',
    m_claude: 'Claude: पेज के शब्द (लंबे नंबर छिपाकर — वही जो Gemini को जाते हैं) हमारे सर्वर से Anthropic को जाते हैं, जिसके कंप्यूटर अमेरिका में हैं। अपने टेस्ट फ़ोन पर बेझिझक आज़माएँ। हर किसान को भेजने से पहले privacy पेज और Play के data-safety फ़ॉर्म में Anthropic का नाम होना चाहिए।',
    go_live_claude_q: 'यह वर्शन पेज Claude से पढ़ता है: पेज के शब्द Anthropic (अमेरिका) को जाते हैं। क्या privacy पेज में Anthropic का नाम आ चुका है? तभी OK दबाएँ।',
    m_none: '— कोई नहीं —',
    help_h: '"Google पर देखो" वाला मॉडल',
    pages: 'एक बार में Khalihan AI कितने पेज पढ़े',
    searches: 'एक बार में Google पर कितनी बार देखे',
    type_ms: 'लिखने की सबसे धीमी रफ़्तार (एक अक्षर, मिलीसेकंड)',
    ask_account: 'साइट पर लॉगिन न हो तो पूछे: "आपका लॉगिन नहीं मिला — नया खाता खोल दूँ?"',
    instr_h: 'Khalihan AI को क्या समझाया जाता है',
    instr_d: 'खाली = ऐप का अपना। 200 से 20,000 अक्षर, वरना फ़ोन अपना रखता है। हर जवाब फ़ोन फिर भी जाँचता है (निजी खाने, लंबे नंबर)।',
    instr_own: 'ऐप का अपना टेक्स्ट यहाँ डालें',
    instr_n: '{n} अक्षर',
    notes_h: 'किसी साइट के बारे में नोट (उस साइट पर Khalihan AI को बताया जाता है)',
    notes_d: 'टीम ने जो सीखा, जैसे "OTP Aadhaar से जुड़े मोबाइल पर आता है"। ज़्यादा से ज़्यादा 500 अक्षर।',
    note_site: 'साइट का पता (जैसे mahadbt.maharashtra.gov.in)',
    note_text: 'नोट',
    add_note: '+ नोट',
    lists_h: 'साइटों की सूची',
    lists_d: 'खाली = ऐप की अपनी सूची। सिर्फ़ https gov.in / nic.in पते; "राज्य" खाली = हर राज्य।',
    forms_l: '"सरकारी फ़ॉर्म भरें"',
    docs_l: '"दस्तावेज़ निकालें"',
    s_id: 'छोटा id', s_url: 'पता (https://…)', s_hi: 'नाम — हिंदी', s_mr: 'नाम — मराठी', s_en: 'नाम — English', s_states: 'राज्य (कॉमा से)',
    add_site: '+ साइट',
    own_list: 'ऐप की अपनी सूची भरें',
    remove: 'हटाएँ',
    note_h: 'क्या बदला (इतिहास के लिए)',
    note_ph: 'जैसे MahaDBT OTP नोट; Flash पहले',
    save: 'टेस्ट फ़ोन पर सेव करें',
    saved: 'v{v} आपके टेस्ट फ़ोन पर है। वहाँ जाँचें, फिर "हर किसान को भेजें"।',
    bad_url: 'छोड़ा (https gov.in / nic.in नहीं): {u}',
    bad_num: 'नंबर जाँचें: पेज 1–40, Google 0–10, रफ़्तार 15–150।',
    bad_instr: 'समझाने वाला टेक्स्ट खाली हो या 200 से 20,000 अक्षर।',
    hist_h: 'इतिहास',
    hist_none: 'अभी कुछ सेव नहीं।',
    th_v: 'वर्शन', th_to: 'कहाँ गया', th_when: 'कब', th_by: 'किसने', th_note: 'क्या बदला',
    to_test: 'टेस्ट फ़ोन', to_live: 'हर किसान',
    back: 'फिर से चालू करें',
    back_q: 'v{v} फिर से हर किसान के लिए चालू करें (नए वर्शन की तरह)?',
    done_back: 'v{v} हर किसान के लिए चालू है।',
    nums_h: 'फ़ॉर्म — पिछले 28 दिन',
    nums_d: 'सिर्फ़ गिनती, ऐप के अपने रिकॉर्ड से (Analytics), दिन में दो बार — किसान का नाम, नंबर या उसने क्या लिखा, कभी नहीं।',
    nums_none: 'अभी गिनती नहीं (आँकड़े दिन में दो बार आते हैं; किसानों के लिए फ़ॉर्म ऐप 1.0.9 तक बंद हैं)।',
    n_open: 'सरकारी साइट खोली', n_offer: 'Khalihan AI ने भरने को पूछा', n_fill: 'किसान ने "हाँ, भर दो" कहा',
    n_filled: 'फ़ॉर्म भरा गया', n_ask: 'सवाल पूछे गए', n_account: '"लॉगिन नहीं मिला — नया खाता?" पूछा',
    n_join: 'नया खाता खोलने का पेज खोला', n_joined: 'नया खाता बना', n_login: 'Khalihan से लॉगिन',
    n_signed: 'पहले से लॉगिन', n_trouble: 'साइट ने गलती दिखाई', n_fail: 'साइट नहीं खुली', n_resume: 'साइट दोबारा लोड हुई — भरना जारी रहा',
    by_site: 'साइट के हिसाब से भरे फ़ॉर्म', stuck_h: 'साइट ने कहाँ खाना नहीं लिया (किस्म:वजह)', fail_h: 'साइट क्यों नहीं खुली',
    nobody: 'अभी कोई नहीं',
  },
};

const NUM_EVENTS = [
  ['ai_gov_open', 'n_open'], ['ai_gov_offer', 'n_offer'], ['ai_gov_fill', 'n_fill'], ['ai_gov_filled', 'n_filled'],
  ['ai_gov_interview', 'n_ask'], ['ai_gov_account', 'n_account'], ['ai_gov_join', 'n_join'], ['ai_gov_joined', 'n_joined'],
  ['ai_gov_login_go', 'n_login'], ['ai_gov_signed', 'n_signed'], ['ai_gov_trouble', 'n_trouble'], ['ai_gov_fail', 'n_fail'],
  ['ai_gov_resume', 'n_resume'],
];

const GOV = /(^|\.)((gov|nic)\.in)$/i;

/** A site list as typed → what the app will take (and what it drops). */
export function cleanSites(rows) {
  const out = [];
  const dropped = [];
  for (const r of rows) {
    const id = String(r.id || '').trim().replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const url = String(r.url || '').trim();
    if (!id && !url) continue;
    let host = '';
    try { host = new URL(url).hostname; } catch (_) { host = ''; }
    if (!id || !url.startsWith('https://') || !GOV.test(host)) { dropped.push(url || id); continue; }
    const s = { id, url };
    for (const l of ['hi', 'mr', 'en']) if (String(r[l] || '').trim()) s[l] = String(r[l]).trim();
    const states = String(r.states || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (states.length) s.states = states;
    out.push(s);
  }
  return { list: out.slice(0, 20), dropped };
}

/** The form as typed → the set the app reads (lib/ai/ai_forms.dart), or an error key. */
export function setFrom(f) {
  const n = (v) => (v === '' || v == null ? NaN : Number(v));
  const pages = n(f.pages);
  const searches = n(f.searches);
  const typeMs = n(f.type_ms);
  if (!(pages >= 1 && pages <= 40) || !(searches >= 0 && searches <= 10) || !(typeMs >= 15 && typeMs <= 150)) return { error: 'bad_num' };
  const instr = String(f.instruction || '').trim();
  if (instr && (instr.length < 200 || instr.length > 20000)) return { error: 'bad_instr' };
  const pick = (a, claude) => a.map((x) => String(x || '').trim())
    .filter((x) => (claude ? /^(gemini|claude-)[a-z0-9.\-]{1,60}$/ : /^gemini[a-z0-9.\-]{1,60}$/).test(x))
    .filter((x, i, all) => all.indexOf(x) === i);
  const set = {
    models: pick(f.models || [], true),
    help_models: pick(f.help_models || [], false),
    pages: Math.round(pages),
    searches: Math.round(searches),
    type_ms: Math.round(typeMs),
    ask_account: !!f.ask_account,
  };
  if (!set.models.length) delete set.models;
  if (!set.help_models.length) delete set.help_models;
  if (instr) set.instruction = instr;
  const notes = {};
  for (const r of f.notes || []) {
    const host = String(r.site || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    const text = String(r.text || '').trim().slice(0, 500);
    if (host && text && GOV.test(host)) notes[host] = text;
  }
  if (Object.keys(notes).length) set.notes = notes;
  const dropped = [];
  for (const k of ['forms', 'docs']) {
    const c = cleanSites(f[k] || []);
    dropped.push(...c.dropped);
    if (c.list.length) set[k] = c.list;
  }
  return { set, dropped };
}

// The app's own lists (lib/ai/gov_form.dart, app 1.0.9) — "Fill with the app's own list".
const OWN_FORMS = [
  { id: 'farmer_id', url: 'https://mhfr.agristack.gov.in/farmer-registry-mh/', hi: 'किसान आईडी (AgriStack)', mr: 'शेतकरी ओळख क्रमांक (AgriStack)', en: 'Farmer ID (AgriStack)' },
  { id: 'pmkisan', url: 'https://pmkisan.gov.in/', hi: 'PM-KISAN', mr: 'PM-KISAN', en: 'PM-KISAN' },
  { id: 'pmfby', url: 'https://pmfby.gov.in/', hi: 'फ़सल बीमा (PMFBY)', mr: 'पीक विमा (PMFBY)', en: 'Crop insurance (PMFBY)' },
  { id: 'mahadbt', url: 'https://mahadbt.maharashtra.gov.in/', hi: 'MahaDBT किसान योजनाएँ', mr: 'MahaDBT शेतकरी योजना', en: 'MahaDBT farmer schemes' },
];
const OWN_DOCS = [
  { id: 'doc_712', url: 'https://bhulekh.mahabhumi.gov.in/', hi: '7/12 और 8A — मुफ़्त देखें', mr: '7/12 आणि 8A — मोफत पहा', en: '7/12 and 8A — free to see', states: 'Maharashtra' },
  { id: 'doc_712s', url: 'https://digitalsatbara.mahabhumi.gov.in/', hi: 'डिजिटल साइन वाला 7/12 और 8A (साइट शुल्क लेती है)', mr: 'डिजिटल स्वाक्षरीत 7/12 आणि 8A (साइट शुल्क घेते)', en: 'Digitally signed 7/12 and 8A (the site charges a fee)', states: 'Maharashtra' },
  { id: 'doc_pmkisan', url: 'https://pmkisan.gov.in/', hi: 'PM-KISAN — मेरा स्टेटस', mr: 'PM-KISAN — माझी स्थिती', en: 'PM-KISAN — my status' },
  { id: 'doc_pmfby', url: 'https://pmfby.gov.in/', hi: 'फसल बीमा — मेरी पॉलिसी', mr: 'पीक विमा — माझी पॉलिसी', en: 'Crop insurance — my policy' },
  { id: 'doc_soil', url: 'https://soilhealth.dac.gov.in/', hi: 'मृदा स्वास्थ्य कार्ड', mr: 'मृदा आरोग्य पत्रिका', en: 'Soil Health Card' },
];

export async function aiFormsPage(deps) {
  const { esc, setMain, lang, db, fail, toast } = deps;
  const L = () => (T[lang()] ? lang() : 'en');
  const t = (k, v) => {
    let s = T[L()][k] ?? T.en[k] ?? k;
    if (v && typeof s === 'string') Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const day = (d) => (d instanceof Date ? d.toLocaleString(L() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

  let data = { live: null, test: null, history: [] };
  let stats = null;
  try {
    [data, stats] = await Promise.all([db().aiForms(), db().ownerStats().catch(() => null)]);
  } catch (e) { fail(e); }

  // The form starts from the test version, else what every farmer has, else the app's own.
  const base = (data.test && data.test.set) || (data.live && data.live.set) || {};
  const from = data.test ? 'from_test' : (data.live ? 'from_live' : 'from_own');
  const form = {
    models: (base.models || AIFORMS_DEFAULTS.models).slice(0, 2),
    help_models: (base.help_models || AIFORMS_DEFAULTS.help_models).slice(0, 2),
    pages: base.pages ?? AIFORMS_DEFAULTS.pages,
    searches: base.searches ?? AIFORMS_DEFAULTS.searches,
    type_ms: base.type_ms ?? AIFORMS_DEFAULTS.type_ms,
    ask_account: base.ask_account !== false,
    instruction: base.instruction || '',
    notes: Object.entries(base.notes || {}).map(([site, text]) => ({ site, text })),
    forms: (base.forms || []).map((s) => ({ ...s, states: (s.states || []).join(', ') })),
    docs: (base.docs || []).map((s) => ({ ...s, states: (s.states || []).join(', ') })),
    note: '',
  };

  function verLine(p) {
    return p ? `<strong>${esc(t('ver', { v: p.v, when: day(p.at), by: p.by || '' }))}</strong>${p.note ? `<div class="small muted">${esc(p.note)}</div>` : ''}` : `<span class="muted">${esc(t('own'))}</span>`;
  }

  function modelSelect(id, value, none, list = MODELS) {
    const opts = list.map(([m, k]) => `<option value="${m}" ${m === value ? 'selected' : ''}>${esc(t(k))}</option>`);
    const other = value && !list.some(([m]) => m === value) ? `<option value="${esc(value)}" selected>${esc(value)}</option>` : '';
    return `<select id="${id}" style="max-width:100%">${none ? `<option value="" ${!value ? 'selected' : ''}>${esc(t('m_none'))}</option>` : ''}${opts.join('')}${other}</select>`;
  }

  function siteRows(kind) {
    return form[kind].map((s, i) => `<div class="row" style="gap:6px;flex-wrap:wrap;margin:4px 0">
      ${['id', 'url', 'hi', 'mr', 'en', 'states'].map((k) => `<input data-site="${kind}" data-i="${i}" data-k="${k}" value="${esc(s[k] || '')}" placeholder="${esc(t('s_' + k))}" style="flex:${k === 'url' ? 3 : 1};min-width:${k === 'url' ? 220 : 90}px">`).join('')}
      <button class="btn sec small" data-site-del="${kind}" data-i="${i}">${esc(t('remove'))}</button></div>`).join('');
  }

  function numbers() {
    const ga = stats && stats.ga;
    const ev = new Map(((ga && ga.events) || []).map((e) => [e.k, e]));
    const any = NUM_EVENTS.some(([k]) => ev.has(k));
    if (!ga || !any) return `<p class="muted">${esc(t('nums_none'))}</p>`;
    const rows = NUM_EVENTS.map(([k, label]) => `<tr><td>${esc(t(label))}</td><td style="text-align:right">${ev.get(k)?.c ?? 0}</td><td style="text-align:right" class="muted small">${ev.get(k)?.u ?? 0}</td></tr>`).join('');
    const top = (list) => (list && list.length ? list.map((x) => `<li>${esc(String(x.k))} — ${x.v ?? x.c ?? x.n ?? ''}</li>`).join('') : `<li class="muted">${esc(t('nobody'))}</li>`);
    return `<table style="min-width:320px"><tr><th></th><th style="text-align:right">#</th><th style="text-align:right" class="small">👤</th></tr>${rows}</table>
      <div class="grid" style="margin-top:10px">
        <div><h3 class="small">${esc(t('by_site'))}</h3><ul class="small">${top(ga.gov_fill_site)}</ul></div>
        <div><h3 class="small">${esc(t('stuck_h'))}</h3><ul class="small">${top(ga.gov_stuck)}</ul></div>
        <div><h3 class="small">${esc(t('fail_h'))}</h3><ul class="small">${top(ga.gov_fail_why)}</ul></div>
      </div>`;
  }

  function draw() {
    const hist = data.history.length
      ? `<div style="overflow-x:auto"><table style="min-width:560px"><tr><th>${esc(t('th_v'))}</th><th>${esc(t('th_to'))}</th><th>${esc(t('th_when'))}</th><th>${esc(t('th_by'))}</th><th>${esc(t('th_note'))}</th><th></th></tr>
        ${data.history.map((e) => `<tr><td>v${e.v}</td><td>${esc(t(e.to === 'live' ? 'to_live' : 'to_test'))}</td><td>${esc(day(e.at))}</td><td class="small">${esc(e.by || '')}</td><td class="small">${esc(e.note || '')}</td>
          <td style="text-align:right">${data.live && data.live.v === e.v ? '' : `<button class="btn sec small" data-back="${e.v}">${esc(t('back'))}</button>`}</td></tr>`).join('')}</table></div>`
      : `<p class="muted">${esc(t('hist_none'))}</p>`;
    setMain(`
      ${db().demo ? `<p class="note">${esc(t('demo'))}</p>` : ''}
      <div class="ph"><div class="ph-t"><h1>${esc(t('title'))}</h1><span class="pill on">${esc(t('only_you'))}</span></div></div>

      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('now_h'))}</h2></div>
        <div class="grid">
          <div><div class="small muted">${esc(t('every'))}</div>${verLine(data.live)}</div>
          <div><div class="small muted">${esc(t('tests'))}</div>${data.test ? verLine(data.test) : `<span class="muted">${esc(t('no_test'))}</span>`}
            ${data.test ? `<div class="row" style="gap:8px;margin-top:8px"><button class="btn pri" id="af-live">${esc(t('go_live'))}</button><button class="btn sec" id="af-drop">${esc(t('drop_test'))}</button></div>` : ''}</div>
        </div>
        ${data.live || data.test ? `<div style="margin-top:10px"><button class="btn sec small" id="af-clear">${esc(t('clear'))}</button></div>` : ''}
        <h3 class="small" style="margin-top:14px">🔒 ${esc(t('locked_h'))}</h3>
        <ul class="small">${t('locked').map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </section>

      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('edit_h'))}</h2><span class="small muted">${esc(t('edit_from', { what: t(from) }))}</span></div>
        <h3 class="small">${esc(t('models_h'))}</h3>
        <div class="form">
          <div><label for="af-m1">${esc(t('first'))}</label>${modelSelect('af-m1', form.models[0], false, PAGE_MODELS)}</div>
          <div><label for="af-m2">${esc(t('backup'))}</label>${modelSelect('af-m2', form.models[1], true, PAGE_MODELS)}</div>
        </div>
        <p class="small muted">${esc(t('m_why'))}</p>
        <p class="small muted">${esc(t('m_claude'))}</p>
        <h3 class="small">${esc(t('help_h'))}</h3>
        <div class="form">
          <div><label for="af-h1">${esc(t('first'))}</label>${modelSelect('af-h1', form.help_models[0], false)}</div>
          <div><label for="af-h2">${esc(t('backup'))}</label>${modelSelect('af-h2', form.help_models[1], true)}</div>
        </div>
        <div class="form">
          <div><label for="af-pages">${esc(t('pages'))}</label><input id="af-pages" type="number" min="1" max="40" value="${esc(String(form.pages))}"></div>
          <div><label for="af-searches">${esc(t('searches'))}</label><input id="af-searches" type="number" min="0" max="10" value="${esc(String(form.searches))}"></div>
          <div><label for="af-type">${esc(t('type_ms'))}</label><input id="af-type" type="number" min="15" max="150" value="${esc(String(form.type_ms))}"></div>
        </div>
        <label class="check" style="margin:10px 0"><input type="checkbox" id="af-ask" ${form.ask_account ? 'checked' : ''}> ${esc(t('ask_account'))}</label>

        <h3 class="small" style="margin-top:12px">${esc(t('instr_h'))}</h3>
        <p class="small muted">${esc(t('instr_d'))}</p>
        <textarea id="af-instr" rows="10" style="width:100%;box-sizing:border-box;font-family:ui-monospace,monospace;font-size:12.5px">${esc(form.instruction)}</textarea>
        <div class="row" style="gap:8px"><button class="btn sec small" id="af-own">${esc(t('instr_own'))}</button><span class="small muted" id="af-n"></span></div>

        <h3 class="small" style="margin-top:14px">${esc(t('notes_h'))}</h3>
        <p class="small muted">${esc(t('notes_d'))}</p>
        ${form.notes.map((r, i) => `<div class="row" style="gap:6px;flex-wrap:wrap;margin:4px 0">
          <input data-note="site" data-i="${i}" value="${esc(r.site)}" placeholder="${esc(t('note_site'))}" style="flex:1;min-width:200px">
          <input data-note="text" data-i="${i}" value="${esc(r.text)}" placeholder="${esc(t('note_text'))}" maxlength="500" style="flex:3;min-width:240px">
          <button class="btn sec small" data-note-del="${i}">${esc(t('remove'))}</button></div>`).join('')}
        <button class="btn sec small" id="af-add-note">${esc(t('add_note'))}</button>

        <h3 class="small" style="margin-top:14px">${esc(t('lists_h'))}</h3>
        <p class="small muted">${esc(t('lists_d'))}</p>
        <div class="small"><strong>${esc(t('forms_l'))}</strong></div>
        ${siteRows('forms')}
        <div class="row" style="gap:8px"><button class="btn sec small" data-site-add="forms">${esc(t('add_site'))}</button><button class="btn sec small" data-site-own="forms">${esc(t('own_list'))}</button></div>
        <div class="small" style="margin-top:8px"><strong>${esc(t('docs_l'))}</strong></div>
        ${siteRows('docs')}
        <div class="row" style="gap:8px"><button class="btn sec small" data-site-add="docs">${esc(t('add_site'))}</button><button class="btn sec small" data-site-own="docs">${esc(t('own_list'))}</button></div>

        <div class="form" style="margin-top:14px"><div style="grid-column:1/-1"><label for="af-note">${esc(t('note_h'))}</label><input id="af-note" value="${esc(form.note)}" placeholder="${esc(t('note_ph'))}"></div></div>
        <div class="row" style="margin-top:10px"><button class="btn pri" id="af-save" style="margin-left:auto">${esc(t('save'))}</button></div>
      </section>

      <section class="card" style="margin-bottom:14px">
        <div class="ch"><h2>${esc(t('nums_h'))}</h2></div>
        <p class="small muted">${esc(t('nums_d'))}</p>
        ${numbers()}
      </section>

      <section class="card">
        <div class="ch"><h2>${esc(t('hist_h'))}</h2></div>
        ${hist}
      </section>`);
    wire();
  }

  const $ = (id) => document.getElementById(id);

  // What is typed is kept in `form` before any redraw (adding a row redraws).
  function read() {
    form.models = [$('af-m1').value, $('af-m2').value].filter(Boolean);
    form.help_models = [$('af-h1').value, $('af-h2').value].filter(Boolean);
    form.pages = $('af-pages').value;
    form.searches = $('af-searches').value;
    form.type_ms = $('af-type').value;
    form.ask_account = $('af-ask').checked;
    form.instruction = $('af-instr').value;
    form.note = $('af-note').value;
    document.querySelectorAll('[data-note]').forEach((i) => { form.notes[+i.dataset.i][i.dataset.note] = i.value; });
    document.querySelectorAll('[data-site]').forEach((i) => { form[i.dataset.site][+i.dataset.i][i.dataset.k] = i.value; });
  }

  async function reload() {
    try { data = await db().aiForms(); } catch (e) { fail(e); }
  }

  function wire() {
    const count = () => { $('af-n').textContent = t('instr_n', { n: $('af-instr').value.trim().length.toLocaleString('en-IN') }); };
    $('af-instr').addEventListener('input', count);
    count();
    $('af-own').addEventListener('click', () => { $('af-instr').value = APP_INSTRUCTION; count(); });
    $('af-add-note').addEventListener('click', () => { read(); form.notes.push({ site: '', text: '' }); draw(); });
    document.querySelectorAll('[data-note-del]').forEach((b) => b.addEventListener('click', () => { read(); form.notes.splice(+b.dataset.noteDel, 1); draw(); }));
    document.querySelectorAll('[data-site-add]').forEach((b) => b.addEventListener('click', () => { read(); form[b.dataset.siteAdd].push({}); draw(); }));
    document.querySelectorAll('[data-site-del]').forEach((b) => b.addEventListener('click', () => { read(); form[b.dataset.siteDel].splice(+b.dataset.i, 1); draw(); }));
    document.querySelectorAll('[data-site-own]').forEach((b) => b.addEventListener('click', () => {
      read();
      form[b.dataset.siteOwn] = (b.dataset.siteOwn === 'forms' ? OWN_FORMS : OWN_DOCS).map((s) => ({ ...s }));
      draw();
    }));
    $('af-save').addEventListener('click', async () => {
      read();
      const r = setFrom(form);
      if (r.error) { toast(t(r.error)); return; }
      if (r.dropped.length) toast(t('bad_url', { u: r.dropped.join(', ') }));
      try {
        const v = await db().saveAiFormsTest(r.set, form.note);
        toast(t('saved', { v }));
        form.note = '';
        await reload();
        draw();
      } catch (e) { fail(e); }
    });
    if ($('af-live')) $('af-live').addEventListener('click', async () => {
      if (!window.confirm(t('go_live_q', { v: data.test.v }))) return;
      if (((data.test.set && data.test.set.models) || []).some(isClaude) && !window.confirm(t('go_live_claude_q'))) return;
      try { await db().aiFormsGoLive(); await aiFormsPage(deps); } catch (e) { fail(e); }
    });
    if ($('af-drop')) $('af-drop').addEventListener('click', async () => {
      try { await db().aiFormsDropTest(); await aiFormsPage(deps); } catch (e) { fail(e); }
    });
    if ($('af-clear')) $('af-clear').addEventListener('click', async () => {
      if (!window.confirm(t('clear_q'))) return;
      try { await db().aiFormsClear(); await aiFormsPage(deps); } catch (e) { fail(e); }
    });
    document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', async () => {
      const v = +b.dataset.back;
      if (!window.confirm(t('back_q', { v }))) return;
      try { const nv = await db().aiFormsRollback(v); toast(t('done_back', { v: nv })); await aiFormsPage(deps); } catch (e) { fail(e); }
    }));
  }

  draw();
}
