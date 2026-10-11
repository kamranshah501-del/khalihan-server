// Khalihan Admin — one small page for the team: sell requests and where each
// one stands, offers, feature switches, suggestions, farmers, account
// deletions, the team itself, a record of every change, and settings.
// No build step: plain modules, served by Firebase Hosting. `?demo` shows
// the screens with made-up data and saves nothing.
//
// Languages: English (default) and Hindi — chosen in Settings, kept in this
// browser. Every word on screen comes from I18N below.

const ADMIN_VERSION = '1.1 · 11 Oct 2026';
const DEMO = new URLSearchParams(location.search).has('demo');
const $ = (sel) => document.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rs = (n) => (typeof n === 'number' && isFinite(n) ? '₹' + Math.round(n).toLocaleString('en-IN') : '—');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const phoneTen = (p) => String(p || '').replace(/\D/g, '').slice(-10);
const phoneShow = (p) => { const t = phoneTen(p); return t.length === 10 ? `+91 ${t.slice(0, 5)} ${t.slice(5)}` : esc(p || '—'); };

// ── settings kept in this browser (they may be unavailable: private mode) ─
const store = {
  get(key, fallback) {
    try { return localStorage.getItem('khalihan_admin_' + key) || fallback; } catch (_) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('khalihan_admin_' + key, value); } catch (_) { /* this session only */ }
  },
};

// ── words ──────────────────────────────────────────────────────────────
const I18N = {
  en: {
    loading: 'Loading…',
    logout: 'Log out',
    close: 'Close ✕',
    err_permission: 'Not allowed — check the Firestore rules or your role',
    err_generic: 'Something went wrong: ',
    page_failed: 'This page did not load. Check the internet and your role, then open it again.',
    tab_home: 'Dashboard',
    tab_requests: 'Sell requests',
    tab_offers: 'Offers',
    tab_feedback: 'Suggestions',
    tab_farmers: 'Farmers',
    tab_deletions: 'Account deletions',
    tab_features: 'Feature switches',
    tab_team: 'Team',
    tab_audit: 'Change log',
    tab_settings: 'Settings',
    st_new: 'New',
    st_called: 'Called',
    st_agreed: 'Deal agreed',
    st_picked: 'Picked up',
    st_paid: 'Paid',
    st_cancelled: 'Cancelled',
    hello: 'Hello{n} 👋',
    demo_note: 'Demo — this is made-up data; nothing is saved.',
    s_new: 'New requests (to call)',
    s_today: 'Came in today',
    s_running: 'Deals in progress',
    s_paid: 'Done (paid)',
    s_offers: 'Live offers',
    s_users: 'Farmers with accounts',
    s_feedback: 'New suggestions',
    s_deletions: 'Account deletion requests',
    home_foot: 'Counted from the last 300 requests. App usage numbers are in Firebase Analytics (Settings → Useful links).',
    f_open: 'Open',
    f_all: 'All',
    req_none: 'No requests here.',
    qtl: 'quintal',
    per_qtl: '/quintal',
    otp_verified: 'number verified by OTP ✓',
    k_farmer: 'Farmer',
    k_mobile: 'Mobile',
    k_village: 'Village',
    k_offer: 'Offer',
    k_when: 'When',
    k_lang_app: 'Language · app',
    k_weight: 'Weighed',
    k_final_price: 'Agreed price',
    call: '📞 Call',
    next_h: 'What happened next',
    note_label: 'Note (who, what was said)',
    final_price_label: 'Agreed price ₹ (at the deal)',
    final_qty_label: 'Weighed quintals (at pickup)',
    deal_done: 'This deal is complete.',
    history: 'History',
    nothing_yet: 'Nothing yet.',
    confirm_cancel: 'Cancel this request?',
    offers_intro: 'Add an offer only after the processor has confirmed the price formula and the quality terms in writing. Changes show the next time the app opens.',
    offers_none: 'No live offers — "Sell to Khalihan" is hidden in the app.',
    offer_new_h: 'New offer / change the price',
    o_crop: 'Crop',
    o_price: 'Price (₹/quintal, to the farmer)',
    o_districts: 'Districts (comma-separated)',
    o_centre: 'Centre name',
    o_centre_hint: '(empty = we pick up from the farm)',
    o_pay: 'Paid within how many days (0 = same day)',
    o_moist: 'Maximum moisture %',
    o_min: 'Minimum quantity (quintal)',
    o_days: 'Runs for how many days',
    o_wa: 'WhatsApp number (farmers\' requests come here)',
    o_note: 'Short note for farmers (Hindi/Marathi)',
    o_save: 'Save offer',
    o_end: 'Close',
    o_end_q: 'Close "{id}"?',
    o_ended: 'Offer closed',
    o_centre_at: 'Centre: {c}',
    o_doorstep: 'Pickup from the farm',
    o_all_districts: 'All districts',
    o_pay_in: 'paid in {n} days',
    o_pay_same: 'paid the same day',
    o_moist_max: ' · moisture ≤{n}%',
    o_min_q: ' · at least {n} quintal',
    o_until: 'until {d}',
    o_no_wa: '⚠️ no WhatsApp number',
    v_crop: 'Choose a crop',
    v_price: 'Price between ₹100 and ₹50,000',
    v_days: 'Days: 1 to 60',
    v_pay: 'Payment days: 0 to 60',
    v_moist: 'Moisture: 1 to 40%',
    v_min: 'Quantity: 1 to 10,000 quintal',
    v_wa: 'The WhatsApp number is not valid',
    q_no_wa: 'No WhatsApp number — requests will come only here (Admin). OK?',
    q_save_offer: '{crop}: {price}/quintal, until {until} — save?',
    o_saved: 'Offer saved',
    feat_intro: 'A switch changed here applies the next time the app opens — no app update needed. These switches are read from v1.0.3 on; older apps (v1.0.2 and before) don\'t read them.',
    open_states: 'Open states',
    on: 'On',
    off: 'Off',
    fb_only_new: 'Only new',
    fb_all: 'Show all',
    fb_reopen: 'Reopen',
    fb_done: 'Done ✓',
    fb_none: 'No new suggestions.',
    farmers_sub: '(with accounts, last 200)',
    find_ph: 'Find by mobile number (10 digits)',
    find: 'Find',
    v_ten: 'Enter a 10-digit number',
    no_account_num: 'No account with this number.',
    no_accounts: 'No accounts yet.',
    farmer: 'Farmer',
    k_place: 'Place',
    k_crops: 'Crops',
    k_created: 'Account made',
    k_seen: 'Last seen',
    sales_h: 'Sell requests',
    none: 'None.',
    del_intro: 'The farmer deleted their account in the app. The app has already removed their account data; their sell requests and our WhatsApp chat must also be removed within 30 days.',
    del_owner_only: 'Only owners can delete requests.',
    done_mark: ' · done ✓',
    del_btn: 'Delete requests and data',
    del_q: 'Delete all of this farmer\'s sell requests and account data for ever? (Delete the WhatsApp chat on the phone yourself.)',
    del_done: '{n} requests deleted',
    del_none: 'No requests.',
    team_intro: 'A Google email added here can open Khalihan Admin. "staff" can see everything and change requests and offers; "owner" can also change switches, the team and see the change log.',
    remove: 'Remove',
    you: 'you',
    new_member: 'New member',
    g_email: 'Google email',
    name: 'Name',
    role: 'Role',
    add: 'Add',
    rm_q: 'Remove {e} from the team?',
    v_email: 'Enter a valid email',
    added: 'Added',
    audit_sub: '(every change, last 300)',
    a_when: 'When',
    a_who: 'Who',
    a_what: 'What',
    a_details: 'Details',
    login_msg: 'For the Khalihan team only. Log in with your Google account.',
    login_btn: 'Log in with Google',
    not_started: 'Could not start',
    not_team: '{e} is not in the team.{x} Ask the owner to add you under "Team", then come back.',
    demo: 'demo',
    set_lang: 'Language',
    set_lang_d: 'For this panel, in this browser.',
    set_time: 'Times shown in',
    set_time_ist: 'India time (IST)',
    set_time_local: 'This computer\'s time',
    set_time_d: 'Farmers and calls are in India, so India time is the default.',
    set_me: 'Your account',
    k_email: 'Email',
    role_owner: 'owner (everything)',
    role_staff: 'staff',
    set_about: 'About',
    k_version: 'Panel version',
    k_project: 'Firebase project',
    set_links: 'Useful links',
    set_links_d: 'They open in a new tab.',
    l_console: 'Firebase console',
    l_firestore: 'Firestore data',
    l_auth: 'Logged-in users',
    l_analytics: 'Analytics (app usage)',
    l_crash: 'Crashlytics (app crashes)',
    l_play: 'Google Play Console',
    set_saved: 'Saved',
    set_note: 'These settings stay in this browser only.',
  },
  hi: {
    loading: 'लोड हो रहा है…',
    logout: 'लॉग आउट',
    close: 'बंद करें ✕',
    err_permission: 'इजाज़त नहीं — Firestore rules या आपकी भूमिका देखें',
    err_generic: 'गड़बड़: ',
    page_failed: 'ये पेज लोड नहीं हुआ। इंटरनेट और अपनी भूमिका देखें, फिर दोबारा खोलें।',
    tab_home: 'डैशबोर्ड',
    tab_requests: 'बिक्री रिक्वेस्ट',
    tab_offers: 'ऑफ़र',
    tab_feedback: 'सुझाव',
    tab_farmers: 'किसान',
    tab_deletions: 'खाता हटाना',
    tab_features: 'फ़ीचर स्विच',
    tab_team: 'टीम',
    tab_audit: 'रिकॉर्ड',
    tab_settings: 'सेटिंग्स',
    st_new: 'नई',
    st_called: 'फ़ोन किया',
    st_agreed: 'सौदा पक्का',
    st_picked: 'माल उठाया',
    st_paid: 'पैसा दिया',
    st_cancelled: 'रद्द',
    hello: 'नमस्ते{n} 👋',
    demo_note: 'डेमो — ये बनावटी डेटा है, कुछ सेव नहीं होता।',
    s_new: 'नई रिक्वेस्ट (फ़ोन करना बाक़ी)',
    s_today: 'आज आईं',
    s_running: 'चल रहे सौदे',
    s_paid: 'पूरे हुए (पैसा दिया)',
    s_offers: 'चालू ऑफ़र',
    s_users: 'खाते वाले किसान',
    s_feedback: 'नए सुझाव',
    s_deletions: 'खाता हटाने की माँग',
    home_foot: 'आख़िरी 300 रिक्वेस्ट से गिना गया। ऐप के इस्तेमाल के आँकड़े Firebase Analytics में देखें (सेटिंग्स → काम के लिंक)।',
    f_open: 'खुली',
    f_all: 'सब',
    req_none: 'इसमें कोई रिक्वेस्ट नहीं।',
    qtl: 'क्विंटल',
    per_qtl: '/क्विंटल',
    otp_verified: 'OTP से पक्का नंबर ✓',
    k_farmer: 'किसान',
    k_mobile: 'मोबाइल',
    k_village: 'गाँव',
    k_offer: 'ऑफ़र',
    k_when: 'कब',
    k_lang_app: 'भाषा · ऐप',
    k_weight: 'तौल',
    k_final_price: 'पक्का भाव',
    call: '📞 फ़ोन करें',
    next_h: 'आगे क्या हुआ',
    note_label: 'नोट (किसने, क्या बात हुई)',
    final_price_label: 'पक्का भाव ₹ (सौदे पर)',
    final_qty_label: 'तौल क्विंटल (माल उठाने पर)',
    deal_done: 'ये सौदा पूरा हो चुका है।',
    history: 'इतिहास',
    nothing_yet: 'अभी कुछ नहीं।',
    confirm_cancel: 'ये रिक्वेस्ट रद्द करें?',
    offers_intro: 'ऑफ़र तभी डालें जब प्रोसेसर ने भाव का फ़ॉर्मूला और क्वालिटी की शर्त लिखकर पक्की कर दी हो। बदलाव अगली बार ऐप खुलते ही दिखता है।',
    offers_none: 'कोई चालू ऑफ़र नहीं — ऐप में "Khalihan को बेचें" छिपा है।',
    offer_new_h: 'नया ऑफ़र / भाव बदलें',
    o_crop: 'फ़सल',
    o_price: 'भाव (₹/क्विंटल, किसान को)',
    o_districts: 'ज़िले (कॉमा से)',
    o_centre: 'सेंटर का नाम',
    o_centre_hint: '(ख़ाली = खेत से उठाएँगे)',
    o_pay: 'पैसा कितने दिन में (0 = उसी दिन)',
    o_moist: 'ज़्यादा से ज़्यादा नमी %',
    o_min: 'कम से कम माल (क्विंटल)',
    o_days: 'कितने दिन चलेगा',
    o_wa: 'WhatsApp नंबर (किसान की रिक्वेस्ट यहाँ आएगी)',
    o_note: 'किसानों के लिए छोटा नोट (हिंदी/मराठी)',
    o_save: 'ऑफ़र सेव करें',
    o_end: 'बंद करें',
    o_end_q: '"{id}" बंद करें?',
    o_ended: 'ऑफ़र बंद हो गया',
    o_centre_at: 'सेंटर: {c}',
    o_doorstep: 'खेत से उठाएँगे',
    o_all_districts: 'सब ज़िले',
    o_pay_in: 'पैसा {n} दिन में',
    o_pay_same: 'पैसा उसी दिन',
    o_moist_max: ' · नमी ≤{n}%',
    o_min_q: ' · कम से कम {n} क्विंटल',
    o_until: '{d} तक',
    o_no_wa: '⚠️ WhatsApp नंबर नहीं',
    v_crop: 'फ़सल चुनें',
    v_price: 'भाव ₹100 से ₹50,000 के बीच',
    v_days: 'दिन 1 से 60',
    v_pay: 'पैसे के दिन 0 से 60',
    v_moist: 'नमी 1 से 40%',
    v_min: 'माल 1 से 10,000 क्विंटल',
    v_wa: 'WhatsApp नंबर सही नहीं',
    q_no_wa: 'WhatsApp नंबर नहीं है — रिक्वेस्ट सिर्फ़ यहाँ (Admin) आएँगी। ठीक है?',
    q_save_offer: '{crop}: {price}/क्विंटल, {until} तक — सेव करें?',
    o_saved: 'ऑफ़र सेव हो गया',
    feat_intro: 'यहाँ बदला हुआ स्विच ऐप में अगली बार खुलने पर लागू होता है — ऐप अपडेट की ज़रूरत नहीं। ये स्विच v1.0.3 से पढ़े जाते हैं; पुराने ऐप (v1.0.2 और पहले) इन्हें नहीं पढ़ते।',
    open_states: 'खुले राज्य',
    on: 'चालू',
    off: 'बंद',
    fb_only_new: 'सिर्फ़ नए',
    fb_all: 'सब दिखाएँ',
    fb_reopen: 'वापस खोलें',
    fb_done: 'हो गया ✓',
    fb_none: 'कोई नया सुझाव नहीं।',
    farmers_sub: '(खाते वाले, आख़िरी 200)',
    find_ph: 'मोबाइल नंबर से ढूँढें (10 अंक)',
    find: 'ढूँढें',
    v_ten: '10 अंक का नंबर डालें',
    no_account_num: 'इस नंबर का कोई खाता नहीं।',
    no_accounts: 'अभी कोई खाता नहीं।',
    farmer: 'किसान',
    k_place: 'जगह',
    k_crops: 'फ़सलें',
    k_created: 'खाता बना',
    k_seen: 'आख़िरी बार',
    sales_h: 'बिक्री रिक्वेस्ट',
    none: 'कोई नहीं।',
    del_intro: 'किसान ने ऐप से खाता हटाया है। ऐप उसका खाता-डेटा पहले ही हटा चुका है; यहाँ उसकी बिक्री रिक्वेस्ट और हमारे WhatsApp की बातचीत भी 30 दिन के अंदर हटानी है।',
    del_owner_only: 'रिक्वेस्ट हटाना सिर्फ़ मालिक कर सकते हैं।',
    done_mark: ' · हो गया ✓',
    del_btn: 'रिक्वेस्ट और डेटा हटाएँ',
    del_q: 'इस किसान की सारी बिक्री रिक्वेस्ट और खाता-डेटा हमेशा के लिए हटाएँ? (WhatsApp की बातचीत फ़ोन में ख़ुद हटाएँ)',
    del_done: '{n} रिक्वेस्ट हटाई गईं',
    del_none: 'कोई माँग नहीं।',
    team_intro: 'यहाँ जोड़ा गया Google ईमेल Khalihan Admin खोल सकता है। "staff" सब देख और रिक्वेस्ट/ऑफ़र बदल सकता है; "owner" स्विच, टीम और रिकॉर्ड भी।',
    remove: 'हटाएँ',
    you: 'आप',
    new_member: 'नया सदस्य',
    g_email: 'Google ईमेल',
    name: 'नाम',
    role: 'भूमिका',
    add: 'जोड़ें',
    rm_q: '{e} को टीम से हटाएँ?',
    v_email: 'सही ईमेल डालें',
    added: 'जोड़ दिया',
    audit_sub: '(हर बदलाव, आख़िरी 300)',
    a_when: 'कब',
    a_who: 'किसने',
    a_what: 'क्या',
    a_details: 'ब्योरा',
    login_msg: 'सिर्फ़ Khalihan टीम के लिए। अपने Google खाते से लॉग इन करें।',
    login_btn: 'Google से लॉग इन करें',
    not_started: 'शुरू नहीं हुआ',
    not_team: '{e} टीम में नहीं है।{x} मालिक से "टीम" में जुड़वाएँ, फिर दोबारा आएँ।',
    demo: 'डेमो',
    set_lang: 'भाषा',
    set_lang_d: 'इस पैनल के लिए, इस ब्राउज़र में।',
    set_time: 'समय किस हिसाब से',
    set_time_ist: 'भारत का समय (IST)',
    set_time_local: 'इस कंप्यूटर का समय',
    set_time_d: 'किसान और फ़ोन भारत में हैं, इसलिए भारत का समय पहले से चुना है।',
    set_me: 'आपका खाता',
    k_email: 'ईमेल',
    role_owner: 'owner (सब कुछ)',
    role_staff: 'staff',
    set_about: 'जानकारी',
    k_version: 'पैनल वर्शन',
    k_project: 'Firebase प्रोजेक्ट',
    set_links: 'काम के लिंक',
    set_links_d: 'नए टैब में खुलते हैं।',
    l_console: 'Firebase console',
    l_firestore: 'Firestore डेटा',
    l_auth: 'लॉग इन यूज़र',
    l_analytics: 'Analytics (ऐप का इस्तेमाल)',
    l_crash: 'Crashlytics (ऐप क्रैश)',
    l_play: 'Google Play Console',
    set_saved: 'सेव हो गया',
    set_note: 'ये सेटिंग्स सिर्फ़ इस ब्राउज़र में रहती हैं।',
  },
};

let lang = store.get('lang', 'en');
if (!I18N[lang]) lang = 'en';
let tz = store.get('tz', 'ist') === 'local' ? 'local' : 'ist';

/** The word for [key] in the chosen language; {name} filled from [vars]. */
function tr(key, vars) {
  let s = I18N[lang][key] ?? I18N.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

// Dates in India time unless Settings say this computer's time.
function parts(d) {
  if (tz === 'local') {
    return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate(), h: d.getHours(), min: d.getMinutes() };
  }
  const x = new Date(d.getTime() + 5.5 * 3600 * 1000);
  return { y: x.getUTCFullYear(), m: x.getUTCMonth(), day: x.getUTCDate(), h: x.getUTCHours(), min: x.getUTCMinutes() };
}
const when = (d) => {
  if (!(d instanceof Date)) return '—';
  const p = parts(d);
  return `${p.day} ${MONTHS[p.m]} ${String(p.h).padStart(2, '0')}:${String(p.min).padStart(2, '0')}`;
};
const sameDay = (a, b) => { const x = parts(a), y = parts(b); return x.y === y.y && x.m === y.m && x.day === y.day; };

// The steps of one purchase. Farmers see the same steps in "मेरी बिक्री".
const STATUS = {
  new: { key: 'st_new', cls: 's-new' },
  called: { key: 'st_called', cls: 's-called' },
  agreed: { key: 'st_agreed', cls: 's-agreed' },
  picked: { key: 'st_picked', cls: 's-picked' },
  paid: { key: 'st_paid', cls: 's-paid' },
  cancelled: { key: 'st_cancelled', cls: 's-cancelled' },
};
const NEXT = {
  new: ['called', 'cancelled'],
  called: ['agreed', 'cancelled'],
  agreed: ['picked', 'cancelled'],
  picked: ['paid', 'cancelled'],
  paid: [],
  cancelled: ['new'],
};
const statusLabel = (s) => tr((STATUS[s] || STATUS.new).key);
const chip = (s) => `<span class="chip ${(STATUS[s] || STATUS.new).cls}">${statusLabel(s)}</span>`;

// Farmer words → the start of the Agmarknet crop names (as buy_offers.py).
const CROPS = [
  { word: 'makka', hi: 'मक्का', en: 'Maize', crops: ['maize'] },
  { word: 'kapas', hi: 'कपास', en: 'Cotton', crops: ['cotton', 'kapas'] },
  { word: 'chana', hi: 'चना', en: 'Chana', crops: ['bengal gram'] },
  { word: 'tur', hi: 'तूर', en: 'Tur', crops: ['arhar'] },
  { word: 'soybean', hi: 'सोयाबीन', en: 'Soybean', crops: ['soyabean'] },
  { word: 'jowar', hi: 'ज्वार', en: 'Jowar', crops: ['jowar'] },
  { word: 'bajra', hi: 'बाजरा', en: 'Bajra', crops: ['bajra'] },
  { word: 'wheat', hi: 'गेहूँ', en: 'Wheat', crops: ['wheat'] },
  { word: 'moong', hi: 'मूँग', en: 'Moong', crops: ['green gram'] },
  { word: 'urad', hi: 'उड़द', en: 'Urad', crops: ['black gram'] },
  { word: 'onion', hi: 'प्याज़', en: 'Onion', crops: ['onion'] },
  { word: 'banana', hi: 'केला', en: 'Banana', crops: ['banana'] },
];
const cropLabel = (c) => (lang === 'hi' ? `${c.hi} (${c.en})` : `${c.en} (${c.hi})`);

// Switches the app reads from config/app → features (see app_config.dart).
// `def` = what the app does while the server has said nothing — it must
// match AppConfig.featureDefaults. Login and selling start OFF (owner,
// 11 Oct 2026): they go on together when Khalihan starts buying in a district.
const FEATURES = [
  {
    key: 'sell', def: false,
    label: { en: 'Sell to Khalihan', hi: 'Khalihan को बेचें' },
    d: {
      en: 'The offer card and sell requests. Turn on only when a processor\'s price is confirmed in the district. Off = no offer is shown.',
      hi: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट। तभी चालू करें जब ज़िले में प्रोसेसर का भाव पक्का हो। बंद = कोई ऑफ़र नहीं दिखेगा।',
    },
  },
  {
    key: 'login', def: false,
    label: { en: 'Mobile OTP login', hi: 'मोबाइल OTP लॉग इन' },
    d: {
      en: '"My account" and an OTP before selling. Every SMS costs money (about ₹6) — before turning it on, finish part D of the admin README (Blaze, Phone sign-in, SHA).',
      hi: '"मेरा खाता" और बेचने से पहले OTP। हर SMS का पैसा लगता है (लगभग ₹6) — चालू करने से पहले admin README का भाग D पूरा करें (Blaze, Phone sign-in, SHA)।',
    },
  },
  {
    key: 'calendar', def: true,
    label: { en: 'Crop calendar', hi: 'फ़सल कैलेंडर' },
    d: { en: 'The Home button, the crop page tile, "This week on the farm".', hi: 'Home का बटन, फ़सल पेज की टाइल, "इस हफ़्ते खेत में"।' },
  },
  {
    key: 'schemes', def: true,
    label: { en: 'Government schemes', hi: 'सरकारी योजनाएँ' },
    d: { en: 'The schemes card in Services.', hi: 'Services में योजनाओं का कार्ड।' },
  },
  {
    key: 'price_map', def: true,
    label: { en: 'Price map', hi: 'भाव का नक्शा' },
    d: { en: 'List | Map in "Where to sell?".', hi: '"कहाँ बेचें?" में सूची | नक्शा।' },
  },
  {
    key: 'hold_sell', def: true,
    label: { en: 'Sell now or wait?', hi: 'अभी बेचें या रुकें?' },
    d: { en: 'What waiting costs, and the break-even price.', hi: 'रुकने का ख़र्च और ब्रेक-ईवन भाव।' },
  },
  {
    key: 'day_voice', def: true,
    label: { en: 'Hear today\'s prices', hi: 'आज का भाव सुनें' },
    d: { en: 'The Home button and the "Listen" button on the morning message.', hi: 'Home का बटन और सुबह के मैसेज का "सुनें" बटन।' },
  },
  {
    key: 'share_picture', def: true,
    label: { en: 'Send prices as a picture', hi: 'भाव की फ़ोटो भेजें' },
    d: { en: 'Off = Share sends a plain WhatsApp message.', hi: 'बंद = Share सीधे WhatsApp मैसेज भेजेगा।' },
  },
];
const featLabel = (f) => f.label[lang] || f.label.en;
const featText = (f) => f.d[lang] || f.d.en;

let db = null;
let me = null;
let page = 'home';
let cache = {};

function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 3200);
}

function fail(e) {
  console.error(e);
  const msg = String((e && (e.code || e.message)) || e);
  toast(msg.includes('permission') ? tr('err_permission') : tr('err_generic') + msg);
}

function setMain(html) { $('#main').innerHTML = html; }

function closePanel() {
  document.querySelectorAll('.panel, .shade').forEach((n) => n.remove());
}
function openPanel(html) {
  closePanel();
  const shade = document.createElement('div');
  shade.className = 'shade';
  shade.onclick = closePanel;
  const panel = document.createElement('aside');
  panel.className = 'panel';
  panel.innerHTML = `<div class="row between"><div></div><button class="plain" data-close>${tr('close')}</button></div>${html}`;
  panel.querySelector('[data-close]').onclick = closePanel;
  document.body.append(shade, panel);
  return panel;
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

/** The words that live in index.html, in the chosen language. */
function applyLanguage() {
  document.documentElement.lang = lang;
  $('#logout').textContent = tr('logout');
}

// ── tabs ───────────────────────────────────────────────────────────────
function tabs() {
  const owner = me && me.role === 'owner';
  const list = [
    ['home', tr('tab_home')],
    ['requests', tr('tab_requests')],
    ['offers', tr('tab_offers')],
    ['feedback', tr('tab_feedback')],
    ['farmers', tr('tab_farmers')],
    ['deletions', tr('tab_deletions')],
    ...(owner ? [['features', tr('tab_features')], ['team', tr('tab_team')], ['audit', tr('tab_audit')]] : []),
    ['settings', `⚙️ ${tr('tab_settings')}`],
  ];
  const nav = $('#tabs');
  nav.hidden = false;
  const fresh = (cache.requests || []).filter((r) => r.status === 'new').length;
  nav.innerHTML = list.map(([k, l]) =>
    `<button data-tab="${k}" class="${k === page ? 'on' : ''}">${l}${k === 'requests' && fresh ? `<span class="badge">${fresh}</span>` : ''}</button>`).join('');
  nav.querySelectorAll('button').forEach((b) => { b.onclick = () => go(b.dataset.tab); });
  // Keep the open tab in view on a narrow screen.
  const on = nav.querySelector('button.on');
  if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

async function go(next) {
  page = next;
  closePanel();
  tabs();
  setMain(`<p class="muted">${tr('loading')}</p>`);
  try {
    await (PAGES[next] || PAGES.home)();
  } catch (e) {
    fail(e);
    setMain(`<div class="empty">${tr('page_failed')}</div>`);
  }
}

// ── pages ──────────────────────────────────────────────────────────────
const PAGES = {
  async home() {
    const [requests, feedback, deletions, offers, users] = await Promise.all([
      db.sellRequests(), db.feedback(), db.deletions(), db.offers(), db.usersCount().catch(() => null),
    ]);
    cache.requests = requests;
    tabs();
    const now = new Date();
    const count = (s) => requests.filter((r) => r.status === s).length;
    const todayN = requests.filter((r) => r.at && sameDay(r.at, now)).length;
    const live = offers.list.filter((o) => String(o.until || '') >= istToday()).length;
    const openFeedback = feedback.filter((f) => !f.done).length;
    const openDel = deletions.filter((d) => !d.done).length;
    const stat = (n, l, cls, to) => `<div class="stat ${cls || ''} ${to ? 'link' : ''}" ${to ? `data-go="${to}"` : ''}><div class="n">${n}</div><div class="l">${l}</div></div>`;
    setMain(`
      <h1>${tr('hello', { n: me.name ? ' ' + esc(me.name) : '' })}</h1>
      ${db.demo ? `<p class="note">${tr('demo_note')}</p>` : ''}
      <div class="grid">
        ${stat(count('new'), tr('s_new'), count('new') ? 'warn' : '', 'requests')}
        ${stat(todayN, tr('s_today'), '', 'requests')}
        ${stat(count('called') + count('agreed') + count('picked'), tr('s_running'), '', 'requests')}
        ${stat(count('paid'), tr('s_paid'), 'good', 'requests')}
        ${stat(live, tr('s_offers'), '', 'offers')}
        ${stat(users == null ? '—' : users, tr('s_users'), '', 'farmers')}
        ${stat(openFeedback, tr('s_feedback'), openFeedback ? 'warn' : '', 'feedback')}
        ${stat(openDel, tr('s_deletions'), openDel ? 'warn' : '', 'deletions')}
      </div>
      <p class="muted small" style="margin-top:14px">${tr('home_foot')}</p>`);
    document.querySelectorAll('[data-go]').forEach((n) => { n.onclick = () => go(n.dataset.go); });
  },

  async requests() {
    const list = await db.sellRequests();
    cache.requests = list;
    tabs();
    const filter = cache.reqFilter || 'open';
    const shown = list.filter((r) =>
      filter === 'all' ? true : filter === 'open' ? !['paid', 'cancelled'].includes(r.status) : r.status === filter);
    const btn = (k, l) => `<button data-f="${k}" class="${filter === k ? 'on' : ''}">${l}</button>`;
    setMain(`
      <h1>${tr('tab_requests')}</h1>
      <div class="filters">
        ${btn('open', tr('f_open'))}${Object.keys(STATUS).map((k) => btn(k, statusLabel(k))).join('')}${btn('all', tr('f_all'))}
      </div>
      ${shown.length ? shown.map(reqCard).join('') : `<div class="empty">${tr('req_none')}</div>`}`);
    document.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { cache.reqFilter = b.dataset.f; PAGES.requests(); }; });
    document.querySelectorAll('[data-req]').forEach((n) => {
      n.onclick = () => showRequest(list.find((r) => r.id === n.dataset.req));
    });
  },

  async offers() {
    const { version, list } = await db.offers();
    const today = istToday();
    const live = list.filter((o) => String(o.until || '') >= today);
    setMain(`
      <h1>${tr('tab_offers')} <span class="muted small">version ${version}</span></h1>
      <p class="muted">${tr('offers_intro')}</p>
      ${live.length ? live.map(offerCard).join('') : `<div class="empty">${tr('offers_none')}</div>`}
      <h2>${tr('offer_new_h')}</h2>
      <div class="card">
        <div class="form">
          <div><label>${tr('o_crop')}</label><select id="o-crop">${CROPS.map((c) => `<option value="${c.word}">${cropLabel(c)}</option>`).join('')}</select></div>
          <div><label>${tr('o_price')}</label><input id="o-price" type="number" min="100" max="50000" inputmode="numeric"></div>
          <div><label>${tr('o_districts')}</label><input id="o-districts" value="jalgaon"></div>
          <div><label>${tr('o_centre')} <span class="muted small">${tr('o_centre_hint')}</span></label><input id="o-centre"></div>
          <div><label>${tr('o_pay')}</label><input id="o-pay" type="number" min="0" max="60" value="0"></div>
          <div><label>${tr('o_moist')}</label><input id="o-moist" type="number" min="1" max="40"></div>
          <div><label>${tr('o_min')}</label><input id="o-min" type="number" min="1" max="10000"></div>
          <div><label>${tr('o_days')}</label><input id="o-days" type="number" min="1" max="60" value="7"></div>
          <div><label>${tr('o_wa')}</label><input id="o-wa" inputmode="numeric" value="${esc(phoneTen((live[0] || list[0] || {}).whatsapp || ''))}"></div>
          <div class="wide"><label>${tr('o_note')}</label><input id="o-note" maxlength="200"></div>
        </div>
        <div class="actions"><button class="main" id="o-save">${tr('o_save')}</button></div>
      </div>`);
    document.querySelectorAll('[data-end]').forEach((b) => {
      b.onclick = async () => {
        const o = live.find((x) => x.id === b.dataset.end);
        if (!o || !confirm(tr('o_end_q', { id: o.id }))) return;
        try {
          await db.saveOffers((all) => all.filter((x) => x.id !== o.id && String(x.until || '') >= istToday()));
          toast(tr('o_ended'));
          PAGES.offers();
        } catch (e) { fail(e); }
      };
    });
    $('#o-save').onclick = saveOffer;
  },

  async features() {
    const { features, launch_states } = await db.appConfig();
    setMain(`
      <h1>${tr('tab_features')}</h1>
      <p class="muted">${tr('feat_intro')}</p>
      ${FEATURES.map((f) => {
        const on = typeof features[f.key] === 'boolean' ? features[f.key] : f.def;
        return `<div class="card switch"><input type="checkbox" data-feature="${f.key}" ${on ? 'checked' : ''} aria-label="${esc(featLabel(f))}">
          <div><div class="title">${esc(featLabel(f))}</div><div class="sub">${esc(featText(f))}</div></div></div>`;
      }).join('')}
      <h2>${tr('open_states')}</h2>
      <p>${launch_states.length ? launch_states.map(esc).join(', ') : 'Maharashtra'}</p>`);
    document.querySelectorAll('[data-feature]').forEach((box) => {
      box.onchange = async () => {
        const key = box.dataset.feature;
        try {
          await db.setFeature(key, box.checked);
          toast(`${featLabel(FEATURES.find((f) => f.key === key))}: ${box.checked ? tr('on') : tr('off')}`);
        } catch (e) { box.checked = !box.checked; fail(e); }
      };
    });
  },

  async feedback() {
    const list = await db.feedback();
    const show = cache.fbAll ? list : list.filter((f) => !f.done);
    setMain(`
      <div class="row between"><h1>${tr('tab_feedback')}</h1>
        <button class="plain" id="fb-toggle">${cache.fbAll ? tr('fb_only_new') : tr('fb_all')}</button></div>
      ${show.length ? show.map((f) => `
        <div class="card">
          <div class="row between"><div class="sub">${when(f.at)} · ${esc(f.district || f.state || '')} · ${esc(f.lang || '')} · v${esc(f.app || '')}</div>
            <button class="plain" data-done="${f.id}" data-v="${f.done ? '0' : '1'}">${f.done ? tr('fb_reopen') : tr('fb_done')}</button></div>
          <div style="margin-top:6px;white-space:pre-wrap">${esc(f.text)}</div>
        </div>`).join('') : `<div class="empty">${tr('fb_none')}</div>`}`);
    $('#fb-toggle').onclick = () => { cache.fbAll = !cache.fbAll; PAGES.feedback(); };
    document.querySelectorAll('[data-done]').forEach((b) => {
      b.onclick = async () => {
        try { await db.feedbackDone(b.dataset.done, b.dataset.v === '1'); PAGES.feedback(); } catch (e) { fail(e); }
      };
    });
  },

  async farmers() {
    const list = await db.users();
    setMain(`
      <h1>${tr('tab_farmers')} <span class="muted small">${tr('farmers_sub')}</span></h1>
      <div class="row" style="margin-bottom:12px">
        <input id="u-phone" class="grow" inputmode="numeric" placeholder="${esc(tr('find_ph'))}">
        <button class="plain" id="u-find">${tr('find')}</button>
      </div>
      <div id="u-list">${userRows(list)}</div>`);
    const bind = (rowsList) => document.querySelectorAll('[data-user]').forEach((n) => {
      n.onclick = () => showUser(rowsList.find((u) => u.id === n.dataset.user));
    });
    bind(list);
    $('#u-find').onclick = async () => {
      const ten = phoneTen($('#u-phone').value);
      if (ten.length !== 10) return toast(tr('v_ten'));
      try {
        const found = await db.userByPhone('+91' + ten);
        $('#u-list').innerHTML = found.length ? userRows(found) : `<div class="empty">${tr('no_account_num')}</div>`;
        bind(found);
      } catch (e) { fail(e); }
    };
  },

  async deletions() {
    const list = await db.deletions();
    const owner = me.role === 'owner';
    setMain(`
      <h1>${tr('s_deletions')}</h1>
      <p class="muted">${tr('del_intro')} ${owner ? '' : tr('del_owner_only')}</p>
      ${list.length ? list.map((d) => `
        <div class="card row between">
          <div><div class="title">${phoneShow(d.phone)}</div><div class="sub">${when(d.at)}${d.done ? tr('done_mark') : ''}</div></div>
          ${!d.done && owner ? `<button class="danger" data-wipe="${d.id}">${tr('del_btn')}</button>` : ''}
        </div>`).join('') : `<div class="empty">${tr('del_none')}</div>`}`);
    document.querySelectorAll('[data-wipe]').forEach((b) => {
      b.onclick = async () => {
        if (!confirm(tr('del_q'))) return;
        try { const n = await db.wipeFarmer(b.dataset.wipe); toast(tr('del_done', { n })); PAGES.deletions(); } catch (e) { fail(e); }
      };
    });
  },

  async team() {
    const list = await db.staff();
    setMain(`
      <h1>${tr('tab_team')}</h1>
      <p class="muted">${tr('team_intro')}</p>
      ${list.map((s) => `
        <div class="card row between">
          <div><div class="title">${esc(s.id)}</div><div class="sub">${esc(s.role)}${s.name ? ' · ' + esc(s.name) : ''}</div></div>
          ${s.id !== me.email ? `<button class="danger" data-rm="${esc(s.id)}">${tr('remove')}</button>` : `<span class="muted small">${tr('you')}</span>`}
        </div>`).join('')}
      <h2>${tr('new_member')}</h2>
      <div class="card"><div class="form">
        <div><label>${tr('g_email')}</label><input id="s-email" type="email"></div>
        <div><label>${tr('name')}</label><input id="s-name"></div>
        <div><label>${tr('role')}</label><select id="s-role"><option value="staff">staff</option><option value="owner">owner</option></select></div>
      </div><div class="actions"><button class="main" id="s-add">${tr('add')}</button></div></div>`);
    document.querySelectorAll('[data-rm]').forEach((b) => {
      b.onclick = async () => {
        if (!confirm(tr('rm_q', { e: b.dataset.rm }))) return;
        try { await db.removeStaff(b.dataset.rm); PAGES.team(); } catch (e) { fail(e); }
      };
    });
    $('#s-add').onclick = async () => {
      const email = $('#s-email').value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast(tr('v_email'));
      try { await db.addStaff(email, $('#s-role').value, $('#s-name').value.trim()); toast(tr('added')); PAGES.team(); } catch (e) { fail(e); }
    };
  },

  async audit() {
    const list = await db.audit();
    setMain(`
      <h1>${tr('tab_audit')} <span class="muted small">${tr('audit_sub')}</span></h1>
      ${list.length ? `<table><tr><th>${tr('a_when')}</th><th>${tr('a_who')}</th><th>${tr('a_what')}</th><th>${tr('a_details')}</th></tr>
        ${list.map((a) => `<tr><td>${when(a.at)}</td><td>${esc(a.by)}</td><td>${esc(a.action)}</td><td class="small">${esc(JSON.stringify(a.details || {}))}</td></tr>`).join('')}
      </table>` : `<div class="empty">${tr('nothing_yet')}</div>`}`);
  },

  // Everyone on the team: language, time zone, who am I, links.
  async settings() {
    const choice = (name, value, current, label) =>
      `<label class="choice"><input type="radio" name="${name}" value="${value}" ${value === current ? 'checked' : ''}> <span>${label}</span></label>`;
    const p = db.project && db.project !== 'demo' ? encodeURIComponent(db.project) : '';
    const fb = (path) => `https://console.firebase.google.com/project/${p}/${path}`;
    const link = (href, label) => `<a class="btnlink" href="${href}" target="_blank" rel="noopener">${label} ↗</a>`;
    setMain(`
      <h1>${tr('tab_settings')}</h1>
      <div class="card">
        <div class="title">${tr('set_lang')}</div>
        <div class="sub">${tr('set_lang_d')}</div>
        <div class="choices">
          ${choice('lang', 'en', lang, 'English')}
          ${choice('lang', 'hi', lang, 'हिन्दी (Hindi)')}
        </div>
      </div>
      <div class="card">
        <div class="title">${tr('set_time')}</div>
        <div class="sub">${tr('set_time_d')}</div>
        <div class="choices">
          ${choice('tz', 'ist', tz, tr('set_time_ist'))}
          ${choice('tz', 'local', tz, tr('set_time_local'))}
        </div>
      </div>
      <div class="card">
        <div class="title">${tr('set_me')}</div>
        <div class="kv">
          <div>${tr('k_email')}</div><div>${esc(me.email)}</div>
          <div>${tr('role')}</div><div>${me.role === 'owner' ? tr('role_owner') : tr('role_staff')}</div>
          ${me.name ? `<div>${tr('name')}</div><div>${esc(me.name)}</div>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="title">${tr('set_about')}</div>
        <div class="kv">
          <div>${tr('k_version')}</div><div>${ADMIN_VERSION}${db.demo ? ' · ' + tr('demo') : ''}</div>
          <div>${tr('k_project')}</div><div>${esc(db.project || '—')}</div>
        </div>
      </div>
      ${p ? `<div class="card">
        <div class="title">${tr('set_links')}</div>
        <div class="sub">${tr('set_links_d')}</div>
        <div class="actions">
          ${link(fb('overview'), tr('l_console'))}
          ${link(fb('firestore/databases/-default-/data'), tr('l_firestore'))}
          ${link(fb('authentication/users'), tr('l_auth'))}
          ${link(fb('analytics'), tr('l_analytics'))}
          ${link(fb('crashlytics'), tr('l_crash'))}
          ${link('https://play.google.com/console', tr('l_play'))}
        </div>
      </div>` : ''}
      <p class="muted small">${tr('set_note')}</p>`);
    document.querySelectorAll('input[name="lang"]').forEach((r) => {
      r.onchange = () => {
        lang = r.value;
        store.set('lang', lang);
        applyLanguage();
        $('#who').textContent = whoLine();
        tabs();
        PAGES.settings();
        toast(tr('set_saved'));
      };
    });
    document.querySelectorAll('input[name="tz"]').forEach((r) => {
      r.onchange = () => {
        tz = r.value === 'local' ? 'local' : 'ist';
        store.set('tz', tz);
        toast(tr('set_saved'));
      };
    });
  },
};

// ── pieces ─────────────────────────────────────────────────────────────
function istToday() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function reqCard(r) {
  return `<div class="card click" data-req="${esc(r.id)}">
    <div class="row between">
      <div class="grow">
        <div class="title">${esc(r.crop)} · ${esc(r.qty)} ${tr('qtl')} · ${rs(r.price)}</div>
        <div class="sub">${esc(r.village)}${r.district ? ', ' + esc(r.district) : ''} · ${r.name ? esc(r.name) + ' · ' : ''}${phoneShow(r.phone)}</div>
        <div class="sub">${when(r.at)}${r.uid ? ' · ' + tr('otp_verified') : ''}${r.assigned ? ' · ' + esc(r.assigned) : ''}</div>
      </div>
      ${chip(r.status)}
    </div>
  </div>`;
}

function showRequest(r) {
  if (!r) return;
  const ten = phoneTen(r.phone);
  const nexts = NEXT[r.status] || [];
  const history = (r.history || []).slice().sort((a, b) => toMs(a.at) - toMs(b.at));
  const panel = openPanel(`
    <h1>${esc(r.crop)} — ${esc(r.qty)} ${tr('qtl')}</h1>
    <div>${chip(r.status)}</div>
    <div class="kv">
      <div>${tr('k_farmer')}</div><div>${esc(r.name || '—')}</div>
      <div>${tr('k_mobile')}</div><div>${phoneShow(r.phone)} ${r.uid ? '✓ OTP' : ''}</div>
      <div>${tr('k_village')}</div><div>${esc(r.village)}${r.district ? ', ' + esc(r.district) : ''}</div>
      <div>${tr('k_offer')}</div><div>${esc(r.offer)} · ${rs(r.price)}${tr('per_qtl')}</div>
      <div>${tr('k_when')}</div><div>${when(r.at)}</div>
      <div>${tr('k_lang_app')}</div><div>${esc(r.lang)} · v${esc(r.app)}</div>
      ${r.final_qty ? `<div>${tr('k_weight')}</div><div>${esc(r.final_qty)} ${tr('qtl')}</div>` : ''}
      ${r.final_price ? `<div>${tr('k_final_price')}</div><div>${rs(r.final_price)}</div>` : ''}
    </div>
    <div class="actions">
      ${ten.length === 10 ? `<a class="btnlink" href="tel:+91${ten}">${tr('call')}</a>
      <a class="btnlink" href="https://wa.me/91${ten}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ''}
    </div>
    <h2>${tr('next_h')}</h2>
    ${nexts.length ? `
      <label>${tr('note_label')}</label><textarea id="r-note" maxlength="300"></textarea>
      <div class="form">
        <div><label>${tr('final_price_label')}</label><input id="r-price" type="number" value="${esc(r.final_price || '')}"></div>
        <div><label>${tr('final_qty_label')}</label><input id="r-qty" type="number" value="${esc(r.final_qty || '')}"></div>
      </div>
      <div class="actions">${nexts.map((s) => `<button class="${s === 'cancelled' ? 'danger' : 'main'}" data-move="${s}">${statusLabel(s)}</button>`).join('')}</div>`
      : `<p class="muted">${tr('deal_done')}</p>`}
    <h2>${tr('history')}</h2>
    <div class="timeline">${history.length ? history.map((h) =>
      `<div>${chip(h.status)} <span class="sub">${when(toDate(h.at))} · ${esc(h.by)}</span>${h.note ? `<div>${esc(h.note)}</div>` : ''}</div>`).join('')
      : `<div class="muted">${tr('nothing_yet')}</div>`}</div>`);
  panel.querySelectorAll('[data-move]').forEach((b) => {
    b.onclick = async () => {
      const status = b.dataset.move;
      if (status === 'cancelled' && !confirm(tr('confirm_cancel'))) return;
      b.disabled = true;
      try {
        await db.moveRequest(r.id, status, panel.querySelector('#r-note').value.trim(), {
          final_price: panel.querySelector('#r-price').value,
          final_qty: panel.querySelector('#r-qty').value,
        });
        toast(`${statusLabel(status)} ✓`);
        closePanel();
        PAGES.requests();
      } catch (e) { b.disabled = false; fail(e); }
    };
  });
}

function toDate(v) {
  if (v instanceof Date) return v;
  if (v && typeof v.toDate === 'function') return v.toDate();
  return null;
}
function toMs(v) { const d = toDate(v); return d ? d.getTime() : 0; }

function offerCard(o) {
  const crop = CROPS.find((c) => JSON.stringify(c.crops) === JSON.stringify(o.crops));
  const where = o.pickup === 'centre' ? tr('o_centre_at', { c: esc(o.centre) }) : tr('o_doorstep');
  const pay = Number(o.payment_days || 0) ? tr('o_pay_in', { n: esc(o.payment_days) }) : tr('o_pay_same');
  return `<div class="card">
    <div class="row between">
      <div class="grow">
        <div class="title">${crop ? cropLabel(crop) : esc((o.crops || []).join(', '))} · ${rs(o.price)}${tr('per_qtl')}</div>
        <div class="sub">${esc((o.districts || []).join(', ') || tr('o_all_districts'))} · ${where} · ${pay}
          ${o.moisture_max ? tr('o_moist_max', { n: esc(o.moisture_max) }) : ''}${o.min_qty ? tr('o_min_q', { n: esc(o.min_qty) }) : ''}</div>
        <div class="sub">${tr('o_until', { d: esc(o.until) })} · ${o.whatsapp ? 'WhatsApp ' + phoneShow(o.whatsapp) : tr('o_no_wa')} · ${esc(o.id)}</div>
      </div>
      <button class="danger" data-end="${esc(o.id)}">${tr('o_end')}</button>
    </div>
  </div>`;
}

async function saveOffer() {
  const word = $('#o-crop').value;
  const crop = CROPS.find((c) => c.word === word);
  const price = Number($('#o-price').value);
  const days = Number($('#o-days').value || 7);
  const pay = Number($('#o-pay').value || 0);
  const moist = $('#o-moist').value ? Number($('#o-moist').value) : null;
  const minQty = $('#o-min').value ? Number($('#o-min').value) : null;
  const districts = $('#o-districts').value.split(',').map((d) => d.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
  let wa = $('#o-wa').value.replace(/\D/g, '');
  if (wa.length === 10) wa = '91' + wa;
  if (!crop) return toast(tr('v_crop'));
  if (!(price >= 100 && price <= 50000)) return toast(tr('v_price'));
  if (!(days >= 1 && days <= 60)) return toast(tr('v_days'));
  if (!(pay >= 0 && pay <= 60)) return toast(tr('v_pay'));
  if (moist != null && !(moist >= 1 && moist <= 40)) return toast(tr('v_moist'));
  if (minQty != null && !(minQty >= 1 && minQty <= 10000)) return toast(tr('v_min'));
  if (wa && !/^91[6-9][0-9]{9}$/.test(wa)) return toast(tr('v_wa'));
  if (!wa && !confirm(tr('q_no_wa'))) return;
  const today = istToday();
  const until = new Date(today + 'T00:00:00Z');
  until.setUTCDate(until.getUTCDate() + days - 1);
  const centre = $('#o-centre').value.trim();
  const offer = {
    id: `${word}-${districts.join('-') || 'all'}-${today.replace(/-/g, '')}`,
    crops: crop.crops,
    districts,
    state: 'Maharashtra',
    price,
    pickup: centre ? 'centre' : 'doorstep',
    centre,
    payment_days: pay,
    until: until.toISOString().slice(0, 10),
    whatsapp: wa,
  };
  if (moist != null) offer.moisture_max = moist;
  if (minQty != null) offer.min_qty = minQty;
  const note = $('#o-note').value.trim().slice(0, 200);
  if (note) offer.note = { hi: note };
  const same = (o) => JSON.stringify(o.crops) === JSON.stringify(offer.crops)
    && JSON.stringify([...(o.districts || [])].sort()) === JSON.stringify([...districts].sort());
  if (!confirm(tr('q_save_offer', { crop: cropLabel(crop), price: rs(price), until: offer.until }))) return;
  try {
    await db.saveOffers((all) => [...all.filter((o) => !same(o) && String(o.until || '') >= today), offer]);
    toast(tr('o_saved'));
    PAGES.offers();
  } catch (e) { fail(e); }
}

function userRows(list) {
  if (!list.length) return `<div class="empty">${tr('no_accounts')}</div>`;
  return list.map((u) => `<div class="card click" data-user="${esc(u.id)}">
    <div class="row between"><div class="grow">
      <div class="title">${esc(u.name || '—')} · ${phoneShow(u.phone)}</div>
      <div class="sub">${esc(u.district || '')}${u.state ? ', ' + esc(u.state) : ''} · ${esc((u.crops || []).slice(0, 5).join(', '))}</div>
    </div><div class="sub">${when(u.seen)}</div></div>
  </div>`).join('');
}

async function showUser(u) {
  if (!u) return;
  const panel = openPanel(`
    <h1>${esc(u.name || tr('farmer'))}</h1>
    <div class="kv">
      <div>${tr('k_mobile')}</div><div>${phoneShow(u.phone)}</div>
      <div>${tr('k_place')}</div><div>${esc(u.district || '—')}, ${esc(u.state || '')}</div>
      <div>${tr('k_lang_app')}</div><div>${esc(u.lang)} · v${esc(u.app)}</div>
      <div>${tr('k_crops')}</div><div>${esc((u.crops || []).join(', ') || '—')}</div>
      <div>${tr('k_created')}</div><div>${when(u.created)}</div>
      <div>${tr('k_seen')}</div><div>${when(u.seen)}</div>
    </div>
    <h2>${tr('sales_h')}</h2><div id="u-req" class="muted">${tr('loading')}</div>`);
  try {
    const reqs = await db.requestsOf(u.id);
    panel.querySelector('#u-req').innerHTML = reqs.length ? reqs.map(reqCard).join('') : tr('none');
  } catch (e) { fail(e); }
}

// ── start ──────────────────────────────────────────────────────────────
function whoLine() {
  return me ? `${me.email} · ${me.role}${db && db.demo ? ' · ' + tr('demo') : ''}` : '';
}

function loginScreen(message) {
  $('#tabs').hidden = true;
  $('#logout').hidden = true;
  $('#who').textContent = '';
  setMain(`<section class="center"><div>
    <h1>Khalihan Admin</h1>
    <p class="muted">${message || tr('login_msg')}</p>
    <button class="main" id="login">${tr('login_btn')}</button>
    <p class="muted small" style="margin-top:18px">
      <button class="plain" id="lang-switch">${lang === 'en' ? 'हिन्दी' : 'English'}</button>
    </p>
  </div></section>`);
  $('#login').onclick = () => db.login().catch(fail);
  $('#lang-switch').onclick = () => {
    const signedInButNotTeam = !$('#logout').hidden;
    lang = lang === 'en' ? 'hi' : 'en';
    store.set('lang', lang);
    applyLanguage();
    loginScreen(message);
    $('#logout').hidden = !signedInButNotTeam;
  };
}

async function start() {
  applyLanguage();
  setMain(`<section class="center"><p class="muted">${tr('loading')}</p></section>`);
  try {
    const mod = DEMO ? await import('./demo-db.js') : await import('./firebase-db.js');
    db = await mod.connect();
  } catch (e) {
    console.error(e);
    setMain(`<section class="center"><div><h1>${tr('not_started')}</h1><p class="muted">${esc(e.message || e)}</p></div></section>`);
    return;
  }
  $('#logout').onclick = () => db.logout();
  db.onUser((user) => {
    if (!user) { me = null; return loginScreen(); }
    if (!user.role) {
      me = null;
      loginScreen(tr('not_team', { e: esc(user.email), x: user.error ? ' (' + esc(user.error) + ')' : '' }));
      $('#logout').hidden = false;
      return;
    }
    me = user;
    $('#who').textContent = whoLine();
    $('#logout').hidden = false;
    go('home');
  });
}

start();
