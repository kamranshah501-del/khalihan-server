// Khalihan Admin — one small page for the team: sell requests and where each
// one stands, offers, feature switches, suggestions, farmers, account
// deletions, the team itself, a record of every change, and settings.
// No build step: plain modules, served by Firebase Hosting. `?demo` shows
// the screens with made-up data and saves nothing.
//
// Languages: English (default) and Hindi — chosen in Settings, kept in this
// browser. Every word on screen comes from I18N below.

import { markSVG } from './mark.js';
import { columnChart, wireTips, pipeline, table } from './charts.js';
import { chime, askDesktop, desktopAllowed, desktopNotify } from './live.js';
import { dealNumbers, monthSummary, offerPlan } from './money.js';
import { KENDRA_WORDS, createKendra } from './kendra.js';
import { SWITCH_WORDS, FEATURE_INFO, createSwitches } from './switches.js';
import { BIZ_WORDS, createBusiness } from './business.js';
import { plusPage } from './plus.js';
import { statsPage } from './stats.js';
import { budgetPage, sums as budgetSums } from './budget.js';
import { aiTestPage } from './aitest.js';
import { aiFormsPage } from './aiforms.js';
import { ALERT_WORDS, alertsCard, bellList } from './alerts.js';
import { MSG_WORDS, msgHead, msgStats, msgKind, openMessage } from './messages.js';

const ADMIN_VERSION = '1.33 · 22 Nov 2026';
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
    tab_stats: 'App numbers',
    tab_budget: 'Budget & targets',
    tab_aiforms: 'AI forms',
    tab_aitest: 'AI test',
    tab_plus: 'Khalihan Pro',
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
    on: 'On',
    off: 'Off',
    fb_only_new: 'Only new',
    fb_all: 'Show all',
    fb_reopen: 'Reopen',
    fb_done: 'Done ✓',
    fb_none: 'No new suggestions.',
    fb_total: 'All suggestions',
    fb_f_new: 'New',
    fb_f_done: 'Done',
    fb_f_all: 'All',
    fb_week: 'Last 7 days (loaded)',
    fb_from: 'From:',
    fb_search: 'Search the words, district or team note…',
    fb_any_lang: 'Every language',
    fb_any_dist: 'Every district',
    fb_any_ver: 'Every app version',
    fb_clear: 'Clear',
    fb_showing: 'Showing {a} of {b} loaded',
    fb_more: 'Show older suggestions',
    fb_all_loaded: 'Every suggestion is loaded.',
    fb_none_filter: 'No suggestion matches these filters.',
    fb_note: 'Team note',
    fb_note_label: 'Team note',
    fb_note_ph: 'Private note for the team — farmers never see it (max 500 letters)',
    fb_save: 'Save note',
    fb_cancel: 'Cancel',
    fb_note_saved: 'Note saved',
    fb_copy: 'Copy text',
    fb_copied: 'Copied',
    fb_delete: 'Delete',
    fb_delete_q: 'Delete this suggestion for good? It cannot be brought back. Do this when the farmer asked for it (privacy policy: within 30 days).',
    fb_deleted: 'Suggestion deleted',
    fb_last: 'Last change by {e}',
    fb_csv: 'Download CSV',
    fb_age_today: 'today',
    fb_age_yday: 'yesterday',
    fb_age_days: '{n} days ago',
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
    live: 'Live',
    live_title: 'New requests appear here the moment a farmer sends one.',
    live_off: 'Not live — refresh the page',
    live_new: 'New request: {crop} · {qty} quintal · {village}',
    waiting_many: 'farmers waiting for a call',
    waiting_one: 'farmer waiting for a call',
    waiting_none: 'No one is waiting for a call',
    waiting_none_d: 'Every new request has been called. New ones show up here.',
    oldest: 'The oldest has waited {t}',
    open_oldest: 'Open the oldest',
    waited: 'waiting {t}',
    t_min: '{n} min',
    t_hr: '{h} h {m} min',
    t_day: '{d} d {h} h',
    first_call: 'Average time to the first call, last 30 days',
    pipeline_h: 'Deals right now',
    pipeline_d: 'Tap a step to see its requests. Cancelled: {n}',
    days_h: 'Requests, last 14 days',
    days_tip: '{d}: {n} requests · {q} quintal',
    days_table: 'Show as a table',
    day_col: 'Day',
    req_col: 'Requests',
    qtl_col: 'Quintal',
    money_h: 'Earnings this month',
    money_owner: 'Only owners see this — not staff, and never farmers.',
    m_bought: 'Bought',
    m_paid: 'Paid to farmers',
    m_margin: 'Our margin',
    m_per_q: 'Margin per quintal',
    m_deals: '{n} paid deals',
    m_missing: '{n} paid deals have no processor rate yet — open them in Sell requests to add it.',
    m_crop: 'Crop',
    m_none: 'No paid deals this month yet.',
    more_h: 'Also',
    money_section: 'Money — only owners see this',
    mo_rate: 'Processor pays (₹ per quintal)',
    mo_transport: 'Transport (₹, whole deal)',
    mo_labour: 'Labour and loading (₹, whole deal)',
    mo_other: 'Other costs (₹, whole deal)',
    mo_farmer: 'Paid to the farmer',
    mo_sale: 'From the processor',
    mo_costs: 'Costs',
    mo_margin: 'Margin',
    mo_save: 'Save money details',
    mo_saved: 'Money details saved',
    plan_h: 'Margin planner — only owners see this',
    plan_transport: 'Transport per quintal (₹)',
    plan_other: 'Other costs per quintal (₹)',
    plan_result: 'Margin {m} per quintal · {t} on a 100-quintal truck',
    plan_thin: 'Thin margin — under 2% of what the processor pays.',
    plan_loss: 'Loss — the farmer price and costs come to more than the processor pays.',
    plan_card: 'Processor ₹{r} · margin {m} per quintal',
    set_alerts: 'New request alerts',
    set_alerts_d: 'For whoever keeps the panel open at work.',
    set_sound: 'Play a sound',
    set_desktop: 'Show a computer notification when this tab is in the background',
    set_desktop_blocked: 'The browser has blocked notifications for this site — allow them in the browser settings.',
    notif_title: 'New sell request',
    install_btn: 'Install',
    set_app: 'Khalihan Admin as an app',
    set_app_d: 'An icon on the desktop, Dock or taskbar — one click opens the panel in its own window. Do it once on each computer.',
    set_app_done: '✅ This panel is open as an app on this computer.',
    set_app_menu: 'Chrome or Edge: click the install icon at the right end of the address bar (a screen with an arrow) → Install. Or Chrome menu ⋮ → "Cast, save and share" → "Install page as app…"; Edge menu ⋯ → Apps → "Install this site as an app". Then pin it to the taskbar or Dock.',
    set_app_safari: 'Safari on a Mac: menu File → "Add to Dock…" → Add.',
    set_app_ios: 'iPhone / iPad: the Share button → "Add to Home Screen".',
    set_app_firefox: 'Firefox cannot install it as an app — open this link in Chrome or Edge and install from there.',
    app_installed: 'Installed — open Khalihan Admin from the desktop, Dock or taskbar.',
    help_home: 'Today at a glance — what is waiting for the team. Click any box to open its list.',
    search_ph: 'Search a farmer\'s number, name, village, order code…',
    search_none: 'Nothing found.',
    search_ph_short: 'Search…',
    search_farmer: 'Farmer account with {p}',
    menu: 'Menu',
    n_live: '{n} live',
    nav_owner: 'Owner',
    open: 'Open', read: 'Read',
    ago: '{t} ago',
    a_offer: '+ New offer', a_kendra: 'Kendra',
    g_waiting: '{n} waiting for a call', g_calm: 'no one is waiting for a call', g_orders: '{n} new Kendra order(s)',
    k1: 'Waiting for a call', k1_none: 'All called ✓',
    k2: 'Sell requests · 7 days', k2_sub: 'week before: {n}', vs_last: 'vs last week',
    k3: 'Kendra orders · today', k3_sub: '{rs} reserved', k3_none: 'None yet today',
    k4_sub: '{n} joined this week', k4_wait: 'First call in {t} on average',
    need_h: 'Needs attention', need_none: 'Nothing waiting — all done ✓', need_none_d: 'New requests, Kendra orders and suggestions show up here.',
    feed_h: 'Live activity', feed_none: 'Nothing in the last two weeks yet.',
    t_call: 'Call {who} — {qty} q {crop}', t_waited: 'Waiting {t}',
    t_more_waiting: '{n} more farmer(s) waiting', t_more_waiting_d: 'Oldest first in Sell requests',
    t_k_new: '{n} new Kendra order(s) to prepare', t_k_ready: '{n} ready, waiting to be picked up', t_k_new_d: 'Mark them Ready when the bags are set aside',
    t_stock: 'Kendra stock: {s}', t_stock_d: 'Farmers see this in the app — update it when stock comes', t_update: 'Update',
    t_complaints: '{n} complaint(s) about Kendra orders', t_oldest_on: 'Oldest: {d}',
    t_feedback: '{n} new suggestion(s)',
    t_deletions: '{n} account deletion(s) to finish', t_del_d: 'Remove their sell requests and WhatsApp chat', t_del_left: '{d} days left to remove their data',
    t_offers_end: '{n} offer(s) end in the next 2 days',
    e_wants: 'wants to sell {qty} q {crop}', e_moved: 'moved {who}', e_order: 'reserved {code} · {rs}', e_feedback: 'suggested: “{t}”',
    help_requests: 'Farmers who want to sell to Khalihan. Call the farmer, then move the request on: New → Called → Deal agreed → Picked up → Paid (or Cancelled). Every step keeps your name.',
    help_offers: 'The price Khalihan pays for a crop, and where. Start, change or end an offer here; the app shows it at its next start — only where "Sell to Khalihan" is on.',
    help_kendra: 'The Khalihan Kendra shop: orders (mark Ready, then Picked up), products and stock, the square card on Home, the shop\'s details, and complaints.',
    help_feedback: 'Suggestions farmers send from the app — no name, no phone. Search and filter them, add a team note, then tick Done. Owner: delete one only when a farmer asks (privacy policy: within 30 days).',
    help_farmers: 'Farmers who made an account (mobile login). Find one by mobile number.',
    help_deletions: 'Farmers who deleted their account. Remove their sell requests and WhatsApp chat within 30 days, then mark Done.',
    help_stats: 'Owner only. Downloads from Google Play and what farmers do in the app, from Google Analytics for Firebase — updated twice a day, counts only.',
    help_budget: 'Owner only. The month\'s plan against what was really spent, your loss limit, and how far the targets are — farmers using the app, Plus members. The amounts are kept only in your owner account.',
    help_aiforms: 'Owner only. What Khalihan AI does inside "Fill a government form" and "Get a document": its model, instruction, limits, notes about a site and the lists of sites — changed without a new app. A change goes to your test phones first, then "Send to every farmer"; any earlier version comes back in one click. The safety rules (Aadhaar, bank, OTP, password, captcha, Submit) stay locked in the app.',
    help_aitest: 'Owner only. Khalihan AI\'s 200-question test: farmers\' real questions, asked on the test phone, every answer marked by an agri graduate. The share marked right is the only accuracy number AI may show.',
    help_features: 'Owner only. One section per feature: click it to switch it on or off and change its settings — states, where Khalihan buys, the Kendra\'s districts and location.',
    help_team: 'Who can open this panel. Add a Gmail as staff (daily work) or owner (everything, including switches and money).',
    help_audit: 'Every change made in this panel — who, what and when.',
    help_settings: 'Language, time, alerts and the desktop app — for this computer only.',
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
    tab_stats: 'आँकड़े',
    tab_budget: 'बजट और लक्ष्य',
    tab_aiforms: 'AI फ़ॉर्म',
    tab_aitest: 'AI की जाँच',
    tab_plus: 'Khalihan Pro',
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
    on: 'चालू',
    off: 'बंद',
    fb_only_new: 'सिर्फ़ नए',
    fb_all: 'सब दिखाएँ',
    fb_reopen: 'वापस खोलें',
    fb_done: 'हो गया ✓',
    fb_none: 'कोई नया सुझाव नहीं।',
    fb_total: 'कुल सुझाव',
    fb_f_new: 'नए',
    fb_f_done: 'हो गए',
    fb_f_all: 'सब',
    fb_week: 'पिछले 7 दिन (लोड हुए)',
    fb_from: 'कहाँ से:',
    fb_search: 'शब्द, ज़िला या टीम नोट से ढूँढें…',
    fb_any_lang: 'हर भाषा',
    fb_any_dist: 'हर ज़िला',
    fb_any_ver: 'हर ऐप वर्ज़न',
    fb_clear: 'साफ़ करें',
    fb_showing: 'लोड हुए {b} में से {a} दिख रहे हैं',
    fb_more: 'पुराने सुझाव दिखाएँ',
    fb_all_loaded: 'सारे सुझाव लोड हो गए।',
    fb_none_filter: 'इन फ़िल्टर से कोई सुझाव नहीं मिला।',
    fb_note: 'टीम नोट',
    fb_note_label: 'टीम नोट',
    fb_note_ph: 'टीम के लिए निजी नोट — किसान को कभी नहीं दिखता (ज़्यादा से ज़्यादा 500 अक्षर)',
    fb_save: 'नोट सेव करें',
    fb_cancel: 'रद्द करें',
    fb_note_saved: 'नोट सेव हो गया',
    fb_copy: 'टेक्स्ट कॉपी करें',
    fb_copied: 'कॉपी हो गया',
    fb_delete: 'हटाएँ',
    fb_delete_q: 'ये सुझाव हमेशा के लिए हटाएँ? वापस नहीं आएगा। तभी हटाएँ जब किसान ने कहा हो (प्राइवेसी पॉलिसी: 30 दिन के अंदर)।',
    fb_deleted: 'सुझाव हटा दिया',
    fb_last: 'आख़िरी बदलाव: {e}',
    fb_csv: 'CSV डाउनलोड करें',
    fb_age_today: 'आज',
    fb_age_yday: 'कल',
    fb_age_days: '{n} दिन पहले',
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
    live: 'लाइव',
    live_title: 'किसान के भेजते ही नई रिक्वेस्ट यहाँ दिखती है।',
    live_off: 'लाइव नहीं — पेज रिफ़्रेश करें',
    live_new: 'नई रिक्वेस्ट: {crop} · {qty} क्विंटल · {village}',
    waiting_many: 'किसान फ़ोन का इंतज़ार कर रहे हैं',
    waiting_one: 'किसान फ़ोन का इंतज़ार कर रहा है',
    waiting_none: 'कोई फ़ोन का इंतज़ार नहीं कर रहा',
    waiting_none_d: 'हर नई रिक्वेस्ट पर फ़ोन हो चुका है। नई यहाँ दिखेंगी।',
    oldest: 'सबसे पुरानी {t} से इंतज़ार में',
    open_oldest: 'सबसे पुरानी खोलें',
    waited: '{t} से इंतज़ार',
    t_min: '{n} मिनट',
    t_hr: '{h} घंटे {m} मिनट',
    t_day: '{d} दिन {h} घंटे',
    first_call: 'पहले फ़ोन तक औसत समय, पिछले 30 दिन',
    pipeline_h: 'अभी के सौदे',
    pipeline_d: 'किसी क़दम को दबाएँ, उसकी रिक्वेस्ट दिखेंगी। रद्द: {n}',
    days_h: 'रिक्वेस्ट, पिछले 14 दिन',
    days_tip: '{d}: {n} रिक्वेस्ट · {q} क्विंटल',
    days_table: 'टेबल में देखें',
    day_col: 'दिन',
    req_col: 'रिक्वेस्ट',
    qtl_col: 'क्विंटल',
    money_h: 'इस महीने की कमाई',
    money_owner: 'ये सिर्फ़ मालिक देखते हैं — staff नहीं, और किसान कभी नहीं।',
    m_bought: 'ख़रीदा',
    m_paid: 'किसानों को दिया',
    m_margin: 'हमारा मार्जिन',
    m_per_q: 'प्रति क्विंटल मार्जिन',
    m_deals: '{n} पूरे सौदे',
    m_missing: '{n} पूरे सौदों में प्रोसेसर का भाव नहीं डाला — "बिक्री रिक्वेस्ट" में खोलकर डालें।',
    m_crop: 'फ़सल',
    m_none: 'इस महीने अभी कोई पूरा सौदा नहीं।',
    more_h: 'और',
    money_section: 'पैसा — सिर्फ़ मालिक देखते हैं',
    mo_rate: 'प्रोसेसर देगा (₹ प्रति क्विंटल)',
    mo_transport: 'गाड़ी भाड़ा (₹, पूरा सौदा)',
    mo_labour: 'हमाली और लोडिंग (₹, पूरा सौदा)',
    mo_other: 'बाक़ी ख़र्च (₹, पूरा सौदा)',
    mo_farmer: 'किसान को दिया',
    mo_sale: 'प्रोसेसर से मिला',
    mo_costs: 'ख़र्च',
    mo_margin: 'मार्जिन',
    mo_save: 'पैसे का हिसाब सेव करें',
    mo_saved: 'पैसे का हिसाब सेव हो गया',
    plan_h: 'मार्जिन का हिसाब — सिर्फ़ मालिक देखते हैं',
    plan_transport: 'प्रति क्विंटल भाड़ा (₹)',
    plan_other: 'प्रति क्विंटल बाक़ी ख़र्च (₹)',
    plan_result: 'मार्जिन {m} प्रति क्विंटल · 100 क्विंटल की गाड़ी पर {t}',
    plan_thin: 'मार्जिन बहुत कम — प्रोसेसर के भाव के 2% से कम।',
    plan_loss: 'घाटा — किसान का भाव और ख़र्च मिलाकर प्रोसेसर के भाव से ज़्यादा है।',
    plan_card: 'प्रोसेसर ₹{r} · मार्जिन {m} प्रति क्विंटल',
    set_alerts: 'नई रिक्वेस्ट की सूचना',
    set_alerts_d: 'जो काम पर पैनल खुला रखता है, उसके लिए।',
    set_sound: 'आवाज़ करें',
    set_desktop: 'टैब पीछे हो तो कंप्यूटर पर सूचना दिखाएँ',
    set_desktop_blocked: 'ब्राउज़र ने इस साइट की सूचनाएँ बंद कर रखी हैं — ब्राउज़र की सेटिंग में चालू करें।',
    notif_title: 'नई बिक्री रिक्वेस्ट',
    install_btn: 'इंस्टॉल',
    set_app: 'Khalihan Admin ऐप की तरह',
    set_app_d: 'डेस्कटॉप, Dock या टास्कबार पर एक आइकन — एक क्लिक में पैनल अपनी अलग विंडो में खुलेगा। हर कंप्यूटर पर एक बार करें।',
    set_app_done: '✅ ये पैनल इस कंप्यूटर पर ऐप की तरह खुला है।',
    set_app_menu: 'Chrome या Edge: एड्रेस बार के दाएँ कोने में इंस्टॉल वाला आइकन (स्क्रीन पर तीर) → Install। या Chrome मेन्यू ⋮ → "Cast, save and share" → "Install page as app…"; Edge मेन्यू ⋯ → Apps → "Install this site as an app"। फिर उसे टास्कबार या Dock पर पिन कर लें।',
    set_app_safari: 'Mac पर Safari: मेन्यू File → "Add to Dock…" → Add।',
    set_app_ios: 'iPhone / iPad: Share बटन → "Add to Home Screen"।',
    set_app_firefox: 'Firefox में ऐप इंस्टॉल नहीं होता — ये लिंक Chrome या Edge में खोलकर वहाँ से इंस्टॉल करें।',
    app_installed: 'इंस्टॉल हो गया — Khalihan Admin अब डेस्कटॉप, Dock या टास्कबार से खोलें।',
    help_home: 'आज का हाल — टीम के लिए क्या बाकी है। किसी भी डिब्बे पर क्लिक करके उसकी सूची खोलें।',
    search_ph: 'किसान का नंबर, नाम, गाँव, ऑर्डर कोड खोजें…',
    search_none: 'कुछ नहीं मिला।',
    search_ph_short: 'खोजें…',
    search_farmer: '{p} वाला किसान खाता',
    menu: 'मेन्यू',
    n_live: '{n} चालू',
    nav_owner: 'मालिक',
    open: 'खोलें', read: 'पढ़ें',
    ago: '{t} पहले',
    a_offer: '+ नया ऑफ़र', a_kendra: 'Kendra',
    g_waiting: '{n} फ़ोन का इंतज़ार कर रहे हैं', g_calm: 'कोई फ़ोन का इंतज़ार नहीं कर रहा', g_orders: '{n} नए Kendra ऑर्डर',
    k1: 'फ़ोन का इंतज़ार', k1_none: 'सबको फ़ोन हो गया ✓',
    k2: 'बिक्री रिक्वेस्ट · 7 दिन', k2_sub: 'उससे पहले का हफ़्ता: {n}', vs_last: 'पिछले हफ़्ते से',
    k3: 'Kendra ऑर्डर · आज', k3_sub: '{rs} का माल रखवाया', k3_none: 'आज अभी कोई नहीं',
    k4_sub: 'इस हफ़्ते {n} जुड़े', k4_wait: 'पहला फ़ोन औसतन {t} में',
    need_h: 'ध्यान दें', need_none: 'कुछ बाकी नहीं — सब हो गया ✓', need_none_d: 'नई रिक्वेस्ट, Kendra ऑर्डर और सुझाव यहाँ दिखेंगे।',
    feed_h: 'अभी क्या हुआ', feed_none: 'पिछले दो हफ़्ते में अभी कुछ नहीं।',
    t_call: '{who} को फ़ोन करें — {qty} क्विंटल {crop}', t_waited: '{t} से इंतज़ार',
    t_more_waiting: '{n} और किसान इंतज़ार में', t_more_waiting_d: 'बिक्री रिक्वेस्ट में सबसे पुराने पहले',
    t_k_new: '{n} नए Kendra ऑर्डर तैयार करने हैं', t_k_ready: '{n} तैयार, उठाने का इंतज़ार', t_k_new_d: 'बोरियाँ अलग रखते ही "तैयार" करें',
    t_stock: 'Kendra स्टॉक: {s}', t_stock_d: 'किसान ऐप में यही देखते हैं — माल आते ही बदलें', t_update: 'बदलें',
    t_complaints: 'Kendra ऑर्डर की {n} शिकायत', t_oldest_on: 'सबसे पुरानी: {d}',
    t_feedback: '{n} नए सुझाव',
    t_deletions: '{n} खाता हटाने का काम बाकी', t_del_d: 'उनकी बिक्री रिक्वेस्ट और WhatsApp चैट हटाएँ', t_del_left: 'डेटा हटाने के {d} दिन बचे',
    t_offers_end: '{n} ऑफ़र अगले 2 दिन में ख़त्म',
    e_wants: '{qty} क्विंटल {crop} बेचना चाहते हैं', e_moved: 'ने {who} की रिक्वेस्ट आगे बढ़ाई', e_order: 'ने {code} रखवाया · {rs}', e_feedback: 'का सुझाव: “{t}”',
    help_requests: 'जो किसान Khalihan को बेचना चाहते हैं। किसान को फ़ोन करें, फिर रिक्वेस्ट आगे बढ़ाएँ: नई → फ़ोन किया → सौदा पक्का → माल उठाया → पैसा दिया (या रद्द)। हर कदम पर आपका नाम सेव होता है।',
    help_offers: 'Khalihan किसी फ़सल का क्या भाव देगा, और कहाँ। यहाँ ऑफ़र शुरू करें, बदलें या बंद करें; ऐप अगली बार खुलने पर दिखाएगा — सिर्फ़ वहाँ जहाँ "Khalihan को बेचें" चालू है।',
    help_kendra: 'Khalihan Kendra दुकान: ऑर्डर (पहले "तैयार", फिर "उठा लिया"), माल और स्टॉक, Home का square card, दुकान की जानकारी और शिकायतें।',
    help_feedback: 'किसानों के ऐप से भेजे सुझाव — नाम या फ़ोन नहीं। ढूँढें, फ़िल्टर करें, टीम नोट लिखें, फिर "हो गया" दबाएँ। Owner: सिर्फ़ तभी हटाएँ जब किसान कहे (प्राइवेसी पॉलिसी: 30 दिन के अंदर)।',
    help_farmers: 'जिन किसानों ने खाता बनाया (मोबाइल लॉग इन)। मोबाइल नंबर से ढूँढें।',
    help_deletions: 'जिन किसानों ने खाता हटाया। उनकी बिक्री रिक्वेस्ट और WhatsApp चैट 30 दिन में हटाएँ, फिर "हो गया" करें।',
    help_stats: 'सिर्फ़ मालिक। Google Play से डाउनलोड, और Google Analytics for Firebase से किसान ऐप में क्या करते हैं — दिन में दो बार अपडेट, सिर्फ़ गिनती।',
    help_budget: 'सिर्फ़ मालिक। महीने का प्लान और असली खर्च, घाटे की सीमा, और लक्ष्य कितना पूरा हुआ — ऐप चलाने वाले किसान, Plus मेंबर। रकम सिर्फ़ आपके मालिक वाले खाते में रहती है।',
    help_aiforms: 'सिर्फ़ मालिक। "सरकारी फ़ॉर्म भरें" और "दस्तावेज़ निकालें" में Khalihan AI क्या करता है: मॉडल, समझाने वाला टेक्स्ट, सीमाएँ, साइट के नोट और साइटों की सूची — नए ऐप के बिना बदलें। बदलाव पहले आपके टेस्ट फ़ोन पर, फिर "हर किसान को भेजें"; पुराना वर्शन एक क्लिक में वापस। सुरक्षा के नियम (Aadhaar, बैंक, OTP, पासवर्ड, कैप्चा, जमा करें) ऐप में बंद रहते हैं।',
    help_aitest: 'सिर्फ़ मालिक। Khalihan AI की 200 सवाल वाली जाँच: किसानों के असली सवाल टेस्ट फ़ोन पर पूछे जाते हैं, हर जवाब कृषि स्नातक जाँचते हैं। जितने सही, बस वही संख्या AI दिखा सकता है।',
    help_features: 'सिर्फ़ मालिक। हर फ़ीचर का अपना हिस्सा: उस पर क्लिक करके चालू/बंद करें और सेटिंग बदलें — राज्य, Khalihan कहाँ ख़रीदे, Kendra के ज़िले और जगह।',
    help_team: 'ये पैनल कौन खोल सकता है। Gmail को staff (रोज़ का काम) या owner (सब कुछ, स्विच और पैसा भी) बनाकर जोड़ें।',
    help_audit: 'इस पैनल में हुआ हर बदलाव — किसने, क्या, कब।',
    help_settings: 'भाषा, समय, सूचना और डेस्कटॉप ऐप — सिर्फ़ इस कंप्यूटर के लिए।',
  },
};

// Khalihan Kendra's words live in kendra.js.
Object.assign(I18N.en, KENDRA_WORDS.en);
Object.assign(I18N.hi, KENDRA_WORDS.hi);
Object.assign(I18N.en, SWITCH_WORDS.en);
Object.assign(I18N.hi, SWITCH_WORDS.hi);
Object.assign(I18N.en, BIZ_WORDS.en);
Object.assign(I18N.hi, BIZ_WORDS.hi);
Object.assign(I18N.en, ALERT_WORDS.en);
Object.assign(I18N.hi, ALERT_WORDS.hi);
Object.assign(I18N.en, MSG_WORDS.en);
Object.assign(I18N.hi, MSG_WORDS.hi);

// Admin 1.29 (owner, 18 Nov 2026 — the Admin rework, Parts 3 and 4
// approved 10:55 and 11:43): the new names in the menu, the Today page and
// the Later shelf. Kept last so these names win over the older ones above.
Object.assign(I18N.en, {
  tab_home: 'Today',
  tab_feedback: 'Farmer messages',
  tab_stats: 'Launch and numbers',
  tab_budget: 'Money',
  tab_compliance: 'Dates and deadlines',
  tab_features: 'Switches',
  tab_team: 'Team and change log',
  tab_team_only: 'Team',
  tab_settings: 'Settings and alerts',
  tab_later: 'Later shelf',
  nav_owner: 'Owner only',
  n_asleep: '{n} asleep',
  td_msgs: 'FARMER MESSAGES',
  td_waiting: '{n} waiting',
  td_all_answered: 'All answered',
  td_oldest: 'Oldest {t}',
  td_left: '{t} to the 4-hour promise',
  td_over: '{t} past the 4-hour promise',
  td_reply: 'Reply now',
  td_open: 'Open',
  td_problem: 'PROBLEM RIGHT NOW',
  td_prob_job: 'The price job has not run since {d}',
  td_prob_state: '{s}: today\'s prices did not come',
  td_prob_see: 'See the states',
  td_well: 'ALL WELL',
  td_well_d: 'The price job ran {t} ago',
  td_well_none: 'No price run seen yet',
  td_answered: 'ANSWERED THIS WEEK',
  td_answered_n: '{a} of {b}',
  td_answered_sub: 'Messages of the last 7 days marked done',
  td_answered_soon: 'Replying inside the app comes with app 1.0.9.',
  td_latest: 'Latest',
  td_latest_none: 'Nothing new in the last two weeks.',
  td_need: 'Needs doing',
  td_only_you: 'ONLY YOU SEE THIS PART',
  td_launch: 'LAUNCH COUNTER',
  td_launch_of: 'of 1,000',
  td_launch_pace: '+{p} a day · about {d} more days',
  td_launch_done: 'Reached — the Launch button is on Switches',
  td_launch_wait: 'Waiting for the first count',
  td_pro: 'KHALIHAN PRO',
  td_pro_off: 'Sale starts at 1,000',
  td_pro_on: 'On sale',
  td_pro_sub: '{m} members · {g} gift codes in use',
  td_money: 'MONEY THIS MONTH',
  td_money_plan: 'Plan {rs}',
  td_money_spent: 'Spent so far {rs}',
  td_money_none: 'Type the month\'s plan on Money',
  td_money_pro: 'Pro income {rs}',
  td_dates: 'NEXT DATES',
  td_dates_none: 'No dates yet. Add them on Dates and deadlines.',
  td_dates_late: '{d} days late',
  later_intro: 'Pages for features that are switched off. They keep everything and come back to the menu by themselves when their feature turns on or something new arrives in them.',
  later_why_sell: 'Wakes when Sell to Khalihan is on',
  later_why_kendra: 'Wakes when the Kendra shop is on',
  later_why_login: 'Wakes when mobile login is on',
  later_why_trade: 'Wakes when trading starts (plan step 1)',
  later_why_aitest: 'Wakes when you start a test',
  later_open: 'Open anyway',
  later_awake: 'Awake · in the menu',
  later_d_requests: 'Farmers who want to sell their crop to Khalihan.',
  later_d_offers: 'The price Khalihan pays for a crop, and where.',
  later_d_kendra: 'The shop: orders, stock, the Home card, complaints.',
  later_d_farmers: 'Farmers who logged in with their mobile number.',
  later_d_deletions: 'Farmers who deleted their account — clean up in 30 days.',
  later_d_processors: 'Who buys from us: formulas, quotes, what they owe.',
  later_d_plan: 'Steps, conditions and money from Business Plan v2.',
  later_d_aitest: 'The 200 real questions, every answer checked.',
  later_banner: 'This page is asleep on the Later shelf. {why}.',
  help_home: 'What is waiting for the team today. Farmer messages carry a 4-hour promise. Pages of features that are off sleep on the Later shelf.',
  help_features: 'Owner only. The Launch card on top; below it the switches you use, new features on trial, sleeping features, and Emergency off for the finished ones.',
  help_later: 'Pages of switched-off features. Each one wakes by itself when its feature turns on or something new arrives in it.',
  help_team: 'Who can open this panel, and every change made in it. Add a Gmail as staff (daily work) or owner (everything, including switches and money).',
  help_settings: 'Alerts for you on your phone and computer; language, time and sound for this browser.',
  help_feedback: 'Problems, suggestions, praise and "AI answer wrong" from the app. Reply within 4 hours: open a message, write in Hindi or English, Send in the app — the farmer reads it in his language with a notification (app 1.0.9 and newer; older ones: only Done).',
  set_note: 'Language, time and sound stay in this browser. Your alert choices go with your account, on every device.',
});
Object.assign(I18N.hi, {
  tab_home: 'आज',
  tab_feedback: 'किसानों के संदेश',
  tab_stats: 'लॉन्च और आँकड़े',
  tab_budget: 'पैसा',
  tab_compliance: 'तारीखें और डेडलाइन',
  tab_features: 'स्विच',
  tab_team: 'टीम और रिकॉर्ड',
  tab_team_only: 'टीम',
  tab_settings: 'सेटिंग्स और अलर्ट',
  tab_later: 'बाद वाली शेल्फ़',
  nav_owner: 'सिर्फ़ मालिक',
  n_asleep: '{n} सोए हुए',
  td_msgs: 'किसानों के संदेश',
  td_waiting: '{n} बाकी',
  td_all_answered: 'सबका जवाब हो गया',
  td_oldest: 'सबसे पुराना {t}',
  td_left: '4 घंटे के वादे में {t} बाकी',
  td_over: '4 घंटे का वादा {t} पहले टूटा',
  td_reply: 'अभी जवाब दें',
  td_open: 'खोलें',
  td_problem: 'अभी की दिक्कत',
  td_prob_job: 'भाव वाला काम {d} से नहीं चला',
  td_prob_state: '{s}: आज के भाव नहीं आए',
  td_prob_see: 'राज्य देखें',
  td_well: 'सब ठीक',
  td_well_d: 'भाव वाला काम {t} पहले चला',
  td_well_none: 'अभी भाव का कोई रन नहीं दिखा',
  td_answered: 'इस हफ़्ते के जवाब',
  td_answered_n: '{b} में से {a}',
  td_answered_sub: 'पिछले 7 दिन के संदेश जो पूरे हुए',
  td_answered_soon: 'ऐप के अंदर जवाब ऐप 1.0.9 से।',
  td_latest: 'ताज़ा',
  td_latest_none: 'पिछले दो हफ़्ते में कुछ नया नहीं।',
  td_need: 'करना है',
  td_only_you: 'ये हिस्सा सिर्फ़ आप देखते हैं',
  td_launch: 'लॉन्च काउंटर',
  td_launch_of: '1,000 में से',
  td_launch_pace: 'रोज़ +{p} · लगभग {d} दिन और',
  td_launch_done: 'पूरा — Launch बटन स्विच पेज पर है',
  td_launch_wait: 'पहली गिनती का इंतज़ार',
  td_pro: 'KHALIHAN PRO',
  td_pro_off: '1,000 पर बिक्री शुरू',
  td_pro_on: 'बिक्री चालू',
  td_pro_sub: '{m} सदस्य · {g} गिफ़्ट कोड चालू',
  td_money: 'इस महीने का पैसा',
  td_money_plan: 'प्लान {rs}',
  td_money_spent: 'अब तक खर्च {rs}',
  td_money_none: 'महीने का प्लान "पैसा" पेज पर लिखें',
  td_money_pro: 'Pro की कमाई {rs}',
  td_dates: 'आने वाली तारीखें',
  td_dates_none: 'अभी कोई तारीख नहीं। "तारीखें और डेडलाइन" में जोड़ें।',
  td_dates_late: '{d} दिन देर',
  later_intro: 'बंद फ़ीचर के पेज। सब कुछ सँभाल कर रखते हैं, और फ़ीचर चालू होते ही या कुछ नया आते ही अपने-आप मेन्यू में लौट आते हैं।',
  later_why_sell: '"Khalihan को बेचो" चालू होने पर जागेगा',
  later_why_kendra: 'Kendra दुकान चालू होने पर जागेगा',
  later_why_login: 'मोबाइल लॉगिन चालू होने पर जागेगा',
  later_why_trade: 'ट्रेड शुरू होने पर जागेगा (प्लान का कदम 1)',
  later_why_aitest: 'जाँच शुरू करने पर जागेगा',
  later_open: 'फिर भी खोलें',
  later_awake: 'जागा हुआ · मेन्यू में',
  later_d_requests: 'किसान जो अपनी फ़सल Khalihan को बेचना चाहते हैं।',
  later_d_offers: 'Khalihan किस फ़सल का क्या भाव देता है, और कहाँ।',
  later_d_kendra: 'दुकान: ऑर्डर, स्टॉक, Home का कार्ड, शिकायतें।',
  later_d_farmers: 'किसान जिन्होंने मोबाइल नंबर से लॉगिन किया।',
  later_d_deletions: 'किसान जिन्होंने खाता हटाया — 30 दिन में सफ़ाई।',
  later_d_processors: 'हमसे कौन ख़रीदता है: फ़ॉर्मूला, भाव, उनका बकाया।',
  later_d_plan: 'Business Plan v2 के कदम, शर्तें और पैसा।',
  later_d_aitest: '200 असली सवाल, हर जवाब की जाँच।',
  later_banner: 'ये पेज बाद वाली शेल्फ़ पर सोया है। {why}।',
  help_home: 'आज टीम के लिए क्या बाकी है। किसानों के संदेश का जवाब 4 घंटे में। बंद फ़ीचर के पेज बाद वाली शेल्फ़ पर सोते हैं।',
  help_features: 'सिर्फ़ मालिक। ऊपर Launch कार्ड; नीचे आपके काम के स्विच, ट्रायल वाले नए फ़ीचर, सोए हुए फ़ीचर, और पक्के फ़ीचर के लिए इमरजेंसी बंद।',
  help_later: 'बंद फ़ीचर के पेज। फ़ीचर चालू होते ही या कुछ नया आते ही हर पेज अपने-आप जाग जाता है।',
  help_team: 'ये पैनल कौन खोल सकता है, और इसमें हुआ हर बदलाव। Gmail को staff (रोज़ का काम) या owner (सब कुछ, स्विच और पैसा भी) बनाएँ।',
  help_settings: 'आपके फ़ोन और कंप्यूटर पर आपके अलर्ट; भाषा, समय और आवाज़ इस ब्राउज़र के लिए।',
  help_feedback: 'ऐप से आईं दिक्कतें, सुझाव, तारीफ़ और "AI का जवाब गलत"। 4 घंटे में जवाब दें: संदेश खोलें, हिंदी या English में लिखें, "ऐप में भेजें" — किसान अपनी भाषा में सूचना के साथ पढ़ेगा (ऐप 1.0.9 और नया; पुराने: सिर्फ़ पूरा करें)।',
  set_note: 'भाषा, समय और आवाज़ इसी ब्राउज़र में रहते हैं। अलर्ट की पसंद आपके खाते के साथ, हर डिवाइस पर।',
});

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


let db = null;
let me = null;
let kendraPages = null;
let bizPages = null;
/** Business Plan v2 pages (owner only): plan, processors, compliance. */
function biz() {
  bizPages = bizPages || createBusiness({
    tr, esc, rs, toast, fail, setMain, openPanel, closePanel, signedRs,
    db: () => db, lang: () => lang, today: () => istToday(),
    // Every paid deal so far: the margin per quintal for the plan's step 1.
    tradeAll: async () => {
      const [list, money] = await Promise.all([db.sellRequests(), db.allDealMoney().catch(() => ({}))]);
      return monthSummary(list, money, new Date(0));
    },
    // This month's and last month's margin: trade and Kendra.
    sourceMonths: async () => {
      const thisStart = monthStart();
      const lastStart = new Date(thisStart); lastStart.setMonth(lastStart.getMonth() - 1);
      const [list, money, orders, products, costs] = await Promise.all([
        db.sellRequests(), db.allDealMoney().catch(() => ({})),
        db.kendraOrders ? db.kendraOrders().catch(() => []) : [],
        db.kendraProducts ? db.kendraProducts().catch(() => []) : [],
        db.kendraCosts ? db.kendraCosts().catch(() => ({})) : {},
      ]);
      const tThis = monthSummary(list, money, thisStart).margin;
      const tLast = monthSummary(list, money, lastStart).margin - tThis;
      const kMargin = (from, to) => {
        let m = 0;
        orders.filter((o) => o.status === 'done' && o.at instanceof Date && o.at >= from && (!to || o.at < to)).forEach((o) => (o.items || []).forEach((i) => {
          const cost = ((costs[i.pid] || {}).costs || {})[i.s];
          if (typeof cost === 'number') m += ((Number(i.p) || 0) - cost) * (Number(i.q) || 0);
        }));
        return m;
      };
      return { tradeThis: tThis, tradeLast: tLast, kThis: kMargin(thisStart), kLast: kMargin(lastStart, thisStart) };
    },
  });
  return bizPages;
}
let switchPages = null;
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

function setMain(html) {
  const main = $('#main');
  main.innerHTML = html;
  // One line under the title: what this page is for (owner, 13 Oct 2026).
  const help = me ? (I18N[lang]['help_' + page] || I18N.en['help_' + page]) : '';
  const h1 = main.querySelector('h1');
  if (help && h1) {
    const p = document.createElement('p');
    p.className = 'pagehelp';
    p.textContent = help;
    let block = h1;
    while (block.parentElement && block.parentElement !== main) block = block.parentElement;
    block.after(p);
  }
}

/** The side panel slides back out, then goes. */
function closePanel() {
  const nodes = document.querySelectorAll('.panel, .shade');
  if (!nodes.length) return;
  if (reducedMotion()) { nodes.forEach((n) => n.remove()); return; }
  nodes.forEach((n) => {
    if (n.classList.contains('closing')) return;
    n.classList.add('closing');
    setTimeout(() => n.remove(), 240);
  });
}
function openPanel(html) {
  // Replacing an open panel: no slide out and in again.
  document.querySelectorAll('.panel, .shade').forEach((n) => n.remove());
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

// ── install as an app on the computer (manifest.webmanifest) ───────────
const installedAsApp = () =>
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

/** How this browser installs: 'prompt' (our button can do it), 'safari',
 *  'ios', 'firefox', or 'menu' (Chrome / Edge, from their own menu). */
function installWay() {
  if (window.khalihanInstall) return 'prompt';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Firefox\//.test(ua)) return 'firefox';
  if (/Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg/.test(ua)) return 'safari';
  return 'menu';
}

function showInstall() {
  $('#install').hidden = !window.khalihanInstall || installedAsApp();
}

async function installApp() {
  const ask = window.khalihanInstall;
  if (!ask) return;
  window.khalihanInstall = null; // the browser lets us ask only once
  showInstall();
  ask.prompt();
  try { await ask.userChoice; } catch (_) { /* closed */ }
  if (page === 'settings' && me) PAGES.settings();
}

window.addEventListener('khalihan-installable', () => {
  showInstall();
  if (page === 'settings' && me) PAGES.settings();
});
window.addEventListener('appinstalled', () => {
  window.khalihanInstall = null;
  showInstall();
  toast(tr('app_installed'));
});

/** The words that live in index.html, in the chosen language. */
function applyLanguage() {
  document.documentElement.lang = lang;
  $('#logout').textContent = tr('logout');
  $('#install').textContent = `💻 ${tr('install_btn')}`;
  $('#q').placeholder = window.innerWidth < 600 ? tr('search_ph_short') : tr('search_ph');
  $('#q').setAttribute('aria-label', tr('search_ph'));
  $('#langbtn').textContent = lang === 'en' ? 'हिं' : 'EN';
  $('#langbtn').title = lang === 'en' ? 'हिन्दी' : 'English';
  $('#livetext').textContent = tr('live');
  $('#menu').setAttribute('aria-label', tr('menu'));
}

// ── the side menu ──────────────────────────────────────────────────────
const ICON_PATHS = {
  stats: 'M4 20h16M7 16v-5M12 16V6M17 16v-8',
  budget: 'M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4zM4 7V5a1 1 0 0 1 1-1h11v3M15.5 13.5h1.5',
  aitest: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 15h9',
  aiforms: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h4M17.5 14.5l1 1.5 1.5.5-1.5.5-1 1.5-.5-1.5-1.5-.5 1.5-.5z',
  home: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  later: 'M3 4h18M3 20h18M5 4v16M19 4v16M5 12h14M9 8h2M9 16h2',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
  requests: 'M4 7h16M4 12h16M4 17h10',
  offers: 'M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9zM8 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3',
  kendra: 'M4 9h16l-1.5-5h-13zM5 9v11h14V9M9.5 20v-6h5v6',
  feedback: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  farmers: 'M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M2.5 20a6.5 6.5 0 0 1 13 0M16 4a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6',
  deletions: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  features: 'M8 7h8a5 5 0 0 1 0 10H8A5 5 0 0 1 8 7zM16 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  plus: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z',
  team: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 21a8 8 0 0 1 16 0',
  audit: 'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  plan: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  processors: 'M3 21V10l6 3V9l6 3V5l6 3v13zM7 17h2M12 17h2M17 17h2',
  compliance: 'M7 3v3M17 3v3M4 7h16v13H4zM8 12h3M8 16h6',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6A7 7 0 0 0 19 12z',
};
const icon = (k) => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON_PATHS[k] || ''}"/></svg>`;

// ── sleeping pages: the Later shelf (Admin 1.29, owner 18 Nov 2026) ────
// A page whose feature is off waits on the Later shelf instead of the menu.
// It comes back by itself when its feature turns on, or when something new
// arrives in it (a sell request, a Kendra order, an account deletion).
const SLEEPERS = [
  { tab: 'requests', feature: 'sell', why: 'later_why_sell' },
  { tab: 'offers', feature: 'sell', why: 'later_why_sell' },
  { tab: 'kendra', feature: 'kendra', why: 'later_why_kendra' },
  { tab: 'farmers', feature: 'login', why: 'later_why_login' },
  { tab: 'deletions', feature: 'login', why: 'later_why_login' },
  { tab: 'processors', owner: true, why: 'later_why_trade' },
  { tab: 'plan', owner: true, why: 'later_why_trade' },
  { tab: 'aitest', owner: true, why: 'later_why_aitest' },
];
const featureOn = (key) => {
  const f = cache.features || {};
  return typeof f[key] === 'boolean' ? f[key] : !!(FEATURE_INFO[key] && FEATURE_INFO[key].def);
};
function isAwake(s) {
  if (s.feature && featureOn(s.feature)) return true;
  if (s.tab === 'requests') return (cache.requests || []).some((r) => r.status === 'new');
  if (s.tab === 'kendra') return !!cache.kendraNew;
  if (s.tab === 'deletions') return !!cache.delOpen;
  if (s.tab === 'processors') return (cache.kadam || 0) >= 1 || !!(cache.biz && cache.biz.processors);
  if (s.tab === 'plan') return (cache.kadam || 0) >= 1;
  if (s.tab === 'aitest') return !!cache.aiTestOpen;
  return false;
}
const shelfFor = (owner) => SLEEPERS.filter((s) => owner || !s.owner);
const sleeperOf = (tab) => SLEEPERS.find((s) => s.tab === tab);

/** What the menu needs to know which pages are awake — once at login, and
 *  again whenever the owner changes a switch (Switches calls it). */
async function loadWake() {
  const owner = me && me.role === 'owner';
  const [cfg, plan, tests, requests, deletions, orders, fbCounts] = await Promise.all([
    db.appConfig().catch(() => null),
    owner ? db.planState().catch(() => ({})) : Promise.resolve({}),
    owner ? db.aiTests().catch(() => ({ runs: [] })) : Promise.resolve({ runs: [] }),
    cache.requests ? Promise.resolve(cache.requests) : db.sellRequests().catch(() => []),
    db.deletions().catch(() => []),
    db.kendraOrders ? db.kendraOrders().catch(() => []) : Promise.resolve([]),
    db.feedbackCounts ? db.feedbackCounts().catch(() => null) : Promise.resolve(null),
  ]);
  if (cfg) cache.features = cfg.features || {};
  cache.requests = requests;
  cache.delOpen = deletions.filter((d) => !d.done).length;
  cache.kendraNew = orders.filter((o) => o.status === 'new').length;
  if (fbCounts) cache.fbOpen = fbCounts.open;
  cache.kadam = Number((plan || {}).kadam) || 0;
  cache.aiTestOpen = ((tests || {}).runs || []).some((r) => (r.asked || 0) > (r.marked || 0));
}

function tabs() {
  const owner = me && me.role === 'owner';
  const fresh = (cache.requests || []).filter((r) => r.status === 'new').length;
  const counts = {
    requests: fresh ? [fresh, 'red'] : null,
    kendra: cache.kendraNew ? [cache.kendraNew, 'red'] : null,
    feedback: cache.fbOpen ? [cache.fbOpen, 'amber'] : null,
    deletions: cache.delOpen ? [cache.delOpen, 'amber'] : null,
    offers: cache.liveOffers ? [tr('n_live', { n: cache.liveOffers }), 'grey'] : null,
    processors: owner && cache.biz && cache.biz.processors ? [cache.biz.processors, 'red'] : null,
    compliance: owner && cache.biz && cache.biz.compliance ? [cache.biz.compliance, 'amber'] : null,
  };
  const shelf = shelfFor(owner);
  const asleep = shelf.filter((s) => !isAwake(s));
  counts.later = asleep.length ? [tr('n_asleep', { n: asleep.length }), 'grey'] : null;
  // A sleeping page opened from the shelf lights up the shelf; the change
  // log lights up "Team and change log".
  const lit = page === 'audit' ? 'team' : (asleep.some((s) => s.tab === page) ? 'later' : page);
  const item = (k, label) => `<button data-tab="${k}" class="${k === lit ? 'on' : ''}" ${k === lit ? 'aria-current="page"' : ''}>
      ${icon(k)}<span class="lbl">${label}</span>${counts[k] ? `<span class="badge ${counts[k][1]}">${counts[k][0]}</span>` : ''}</button>`;
  const awakeTeam = shelf.filter((s) => !s.owner && isAwake(s)).map((s) => item(s.tab, tr('tab_' + s.tab))).join('');
  const awakeOwner = shelf.filter((s) => s.owner && isAwake(s)).map((s) => item(s.tab, tr('tab_' + s.tab))).join('');
  const nav = $('#tabs');
  nav.hidden = false;
  nav.innerHTML = `
    ${item('home', tr('tab_home'))}
    ${item('feedback', tr('tab_feedback'))}
    ${awakeTeam}
    ${owner ? `<div class="navh">${tr('nav_owner')}</div>${item('stats', tr('tab_stats'))}${item('plus', tr('tab_plus'))}${item('budget', tr('tab_budget'))}${item('compliance', tr('tab_compliance'))}${item('features', tr('tab_features'))}${item('aiforms', tr('tab_aiforms'))}${item('team', tr('tab_team'))}${awakeOwner}` : ''}
    <div class="navgap"></div>
    ${shelf.length ? item('later', tr('tab_later')) : ''}
    ${item('settings', tr('tab_settings'))}
    <div class="navfoot">Khalihan Admin ${ADMIN_VERSION.split(' ')[0]}</div>`;
  nav.querySelectorAll('button[data-tab]').forEach((b) => { b.onclick = () => { closeNav(); go(b.dataset.tab); }; });
  // The browser tab shows how many are waiting: "(2) Khalihan Admin".
  const waitingAll = (cache.fbOpen || 0) + fresh;
  document.title = waitingAll ? `(${waitingAll}) Khalihan Admin` : 'Khalihan Admin';
  $('#menu').hidden = false;
  $('#search').hidden = false;
  $('#langbtn').hidden = false;
  $('#livebadge').hidden = cache.live === false;
}

// Phones: the side menu slides in over the page.
function openNav() {
  $('#tabs').classList.add('open');
  $('#navscrim').hidden = false;
  $('#menu').setAttribute('aria-expanded', 'true');
}
function closeNav() {
  $('#tabs').classList.remove('open');
  $('#navscrim').hidden = true;
  $('#menu').setAttribute('aria-expanded', 'false');
}

// ── the top bar: account menu, language, search ────────────────────────
function syncMe() {
  const signedIn = !$('#logout').hidden;
  const av = $('#avatar');
  av.hidden = !signedIn;
  const who = (me && (me.name || me.email)) || $('#who').textContent || '';
  av.textContent = who ? who.trim().charAt(0).toUpperCase() : '•';
  if (!signedIn) $('#memenu').hidden = true;
}

let searchData = null;
async function searchIndex() {
  if (searchData && Date.now() - searchData.at < 60e3) return searchData;
  const [requests, orders] = await Promise.all([
    db.sellRequests().catch(() => []),
    db.kendraOrders ? db.kendraOrders().catch(() => []) : Promise.resolve([]),
  ]);
  searchData = { at: Date.now(), requests, orders };
  return searchData;
}

async function runSearch(q) {
  const box = $('#results');
  const t = q.trim().toLowerCase();
  const digits = t.replace(/\D/g, '');
  if (t.length < 2) { box.hidden = true; return; }
  const d = await searchIndex();
  if ($('#q').value.trim().toLowerCase() !== t) return; // typed on meanwhile
  const has = (v) => String(v || '').toLowerCase().includes(t);
  const phone = (p) => digits.length >= 4 && String(p || '').replace(/\D/g, '').includes(digits);
  const reqs = d.requests.filter((r) => phone(r.phone) || has(r.name) || has(r.village) || has(r.crop)).slice(0, 6);
  const ords = d.orders.filter((o) => phone(o.phone) || has(o.name) || has(o.village) || has(o.code)).slice(0, 5);
  const group = (title, html) => (html ? `<div class="rgroup">${title}</div>${html}` : '');
  const reqHtml = reqs.map((r, i) => `<button class="ritem" data-r="${i}">
      <span class="chip ${(STATUS[r.status] || STATUS.new).cls}">${statusLabel(r.status)}</span>
      <span class="grow"><b>${esc(r.name || phoneShow(r.phone))}</b> · ${esc(r.crop)} ${esc(r.qty)} q<br><span class="muted small">${esc(r.village || '')} · ${when(r.at)}</span></span></button>`).join('');
  const ordHtml = ords.map((o) => `<button class="ritem" data-k="1">
      <span class="chip">${esc(o.code || '')}</span>
      <span class="grow"><b>${esc(o.name || phoneShow(o.phone))}</b> · ${rs(o.total)}<br><span class="muted small">${esc(o.village || '')} · ${when(o.at)}</span></span></button>`).join('');
  const farmer = digits.length >= 10 ? `<button class="ritem" data-f="${esc(digits.slice(-10))}">${icon('farmers')}<span class="grow">${tr('search_farmer', { p: phoneShow(digits.slice(-10)) })}</span></button>` : '';
  box.innerHTML = group(tr('tab_requests'), reqHtml) + group('Khalihan Kendra', ordHtml) + group(tr('tab_farmers'), farmer)
    || `<div class="rnone">${tr('search_none')}</div>`;
  box.hidden = false;
  box.querySelectorAll('[data-r]').forEach((b) => { b.onclick = () => { closeSearch(); showRequest(reqs[Number(b.dataset.r)]); }; });
  box.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { closeSearch(); go('kendra'); }; });
  box.querySelectorAll('[data-f]').forEach((b) => {
    b.onclick = async () => {
      closeSearch();
      await go('farmers');
      const input = $('#u-phone');
      if (input) { input.value = b.dataset.f; const find = $('#u-find'); if (find) find.click(); }
    };
  });
}
function closeSearch() { $('#results').hidden = true; $('#q').value = ''; $('#q').blur(); }

function wireTop() {
  $('#menu').onclick = () => ($('#tabs').classList.contains('open') ? closeNav() : openNav());
  $('#navscrim').onclick = closeNav;
  $('#avatar').onclick = (e) => {
    e.stopPropagation();
    const m = $('#memenu');
    m.hidden = !m.hidden;
    $('#avatar').setAttribute('aria-expanded', String(!m.hidden));
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.me')) $('#memenu').hidden = true;
    if (!e.target.closest('#search')) $('#results').hidden = true;
  });
  $('#langbtn').onclick = () => {
    lang = lang === 'en' ? 'hi' : 'en';
    store.set('lang', lang);
    applyLanguage();
    $('#who').textContent = whoLine();
    tabs();
    go(page);
  };
  let timer = null;
  $('#q').oninput = () => { clearTimeout(timer); timer = setTimeout(() => runSearch($('#q').value).catch(fail), 220); };
  $('#search').onsubmit = (e) => { e.preventDefault(); runSearch($('#q').value).catch(fail); };
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
    if (e.key === '/' && !typing && !$('#search').hidden) { e.preventDefault(); $('#q').focus(); }
    if (e.key === 'Escape') { $('#results').hidden = true; $('#memenu').hidden = true; closeNav(); }
  });
  // Whoever can log out has an account menu.
  new MutationObserver(syncMe).observe($('#logout'), { attributes: true, attributeFilter: ['hidden'] });
}

/** Grey blocks in the shape of a page while its data loads. */
const skeleton = () => `<div class="skel" aria-hidden="true">
  <div class="sk sk-h"></div><div class="sk sk-l"></div>
  <div class="sk-row"><div class="sk sk-c"></div><div class="sk sk-c"></div><div class="sk sk-c"></div><div class="sk sk-c"></div></div>
  <div class="sk sk-b"></div></div><p class="sr-only">${tr('loading')}</p>`;

async function go(next) {
  page = next;
  closePanel();
  tabs();
  setMain(skeleton());
  try {
    await (PAGES[next] || PAGES.home)();
    // Opened from the Later shelf while asleep: say so at the top.
    const s = sleeperOf(next);
    if (s && !isAwake(s) && page === next) $('#main').insertAdjacentHTML('afterbegin', `<p class="note">${esc(tr('later_banner', { why: tr(s.why) }))}</p>`);
  } catch (e) {
    fail(e);
    setMain(`<div class="empty">${tr('page_failed')}</div>`);
  }
}

// ── suggestions (Admin 1.17) ───────────────────────────────────────────
// The app sends text, state, district, language and app version — no name,
// no phone. Any other field a later app version sends shows as a small tag,
// so nothing new is hidden from the team.
const FB_KNOWN = new Set(['id', 'text', 'state', 'district', 'lang', 'app', 'at', 'done', 'note', 'by',
  // app 1.0.10 and Admin 1.30–1.31 (messages.js shows these)
  'kind', 'en', 'name', 'phone', 'photo', 'dev', 'info', 'trail', 'reply_to', 'done_at', 'replied_at', 'reply_by']);
const FB_LANGS = { en: 'English', hi: 'हिंदी', mr: 'मराठी', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', bn: 'বাংলা', ml: 'മലയാളം' };
const fbLang = (c) => FB_LANGS[c] || c || '—';
const fbPlace = (f) => f.district || f.state || '—';

function fbAge(d) {
  if (!(d instanceof Date)) return '';
  const now = new Date();
  if (sameDay(d, now)) return tr('fb_age_today');
  if (sameDay(d, new Date(now.getTime() - 86400000))) return tr('fb_age_yday');
  return tr('fb_age_days', { n: Math.max(2, Math.round((now.getTime() - d.getTime()) / 86400000)) });
}

function fbMatches(f, flt) {
  if (flt.status === 'open' && f.done) return false;
  if (flt.status === 'done' && !f.done) return false;
  if (flt.status === 'replied' && !f.replied_at) return false;
  if (flt.kind && msgKind(f) !== flt.kind) return false;
  if (flt.lang && f.lang !== flt.lang) return false;
  if (flt.place && fbPlace(f) !== flt.place) return false;
  if (flt.app && String(f.app || '') !== flt.app) return false;
  if (flt.q) {
    const hay = [f.text, f.district, f.state, f.note].join(' ').toLowerCase();
    if (!hay.includes(flt.q.toLowerCase())) return false;
  }
  return true;
}

/** [[value, count], …], most first. */
function fbTally(list, key) {
  const m = new Map();
  list.forEach((f) => { const v = key(f); if (v && v !== '—') m.set(v, (m.get(v) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

/** The shown suggestions as a CSV for Excel (owner). Cells that start with
 *  = + - @ get a ' in front, so Excel never runs a farmer's text as a formula. */
function fbCsv(list) {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = ['date', 'status', 'state', 'district', 'language', 'app_version', 'text', 'team_note', 'last_change_by'];
  const lines = list.map((f) => [when(f.at), f.done ? 'done' : 'new', f.state, f.district, f.lang, f.app, f.text, f.note, f.by].map(cell).join(','));
  const blob = new Blob(['﻿' + [head.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `khalihan_suggestions_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function fbCard(f, owner) {
  const id = esc(f.id);
  const extras = Object.entries(f)
    .filter(([k, v]) => !FB_KNOWN.has(k) && v !== '' && v != null)
    .map(([k, v]) => `<span class="pill info">${esc(k)}: ${esc(String(typeof v === 'object' ? JSON.stringify(v) : v).slice(0, 60))}</span>`)
    .join(' ');
  return `<div class="card" data-fb="${id}">
    ${msgHead(f, { tr, esc, dur })}
    <div class="row between">
      <div class="sub">${when(f.at)} · ${esc(fbAge(f.at))} · ${esc(fbPlace(f))} · ${esc(fbLang(f.lang))} · v${esc(f.app || '—')}</div>
      <span class="pill ${f.done ? 'on' : 'warn'}">${f.done ? tr('fb_f_done') : tr('fb_f_new')}</span>
    </div>
    ${extras ? `<div class="row" style="margin-top:6px">${extras}</div>` : ''}
    <div style="margin-top:8px;white-space:pre-wrap;overflow-wrap:anywhere">${esc(f.text)}</div>
    ${f.note ? `<div class="note small" style="margin-top:8px"><strong>${tr('fb_note_label')}:</strong> <span style="white-space:pre-wrap">${esc(f.note)}</span></div>` : ''}
    ${f.by ? `<div class="muted small" style="margin-top:6px">${tr('fb_last', { e: esc(f.by) })}</div>` : ''}
    <div class="actions row">
      <button class="main" data-fb-open="${id}">${tr('mg_open')}</button>
      <button class="plain" data-fb-done="${id}">${f.done ? tr('fb_reopen') : tr('fb_done')}</button>
      <button class="plain" data-fb-note="${id}" aria-expanded="false">${tr('fb_note')}</button>
      <button class="plain" data-fb-copy="${id}">${tr('fb_copy')}</button>
      ${owner ? `<button class="danger" data-fb-del="${id}">${tr('fb_delete')}</button>` : ''}
    </div>
    <div data-fb-box="${id}" hidden style="margin-top:10px">
      <label class="small muted" for="fbn-${id}">${tr('fb_note_ph')}</label>
      <textarea id="fbn-${id}" maxlength="500" style="width:100%;box-sizing:border-box;margin-top:4px">${esc(f.note || '')}</textarea>
      <div class="row" style="margin-top:6px">
        <button class="main" data-fb-save="${id}">${tr('fb_save')}</button>
        <button class="plain" data-fb-cancel="${id}">${tr('fb_cancel')}</button>
      </div>
    </div>
  </div>`;
}

const fbFilter = () => cache.fbFilter || (cache.fbFilter = { status: 'open', q: '', lang: '', place: '', app: '' });

/** Only the list part — typing in the search box keeps its focus. */
function fbList() {
  const st = cache.fb;
  const flt = fbFilter();
  const shown = st.rows.filter((f) => fbMatches(f, flt));
  const list = $('#fb-list');
  if (!list) return;
  list.innerHTML = shown.length
    ? shown.map((f) => fbCard(f, me.role === 'owner')).join('')
    : `<div class="empty">${st.rows.length ? tr('fb_none_filter') : tr('fb_none')}</div>`;
  const showing = $('#fb-showing');
  if (showing) showing.textContent = tr('fb_showing', { a: shown.length, b: st.rows.length });
  fbWire();
}

function fbDraw() {
  const st = cache.fb;
  const owner = me.role === 'owner';
  const flt = fbFilter();
  const all = st.rows;
  const c = st.counts || {
    total: all.length, done: all.filter((f) => f.done).length, open: all.filter((f) => !f.done).length,
  };
  const weekAgo = Date.now() - 7 * 86400000;
  const week = all.filter((f) => f.at instanceof Date && f.at.getTime() >= weekAgo).length;
  const places = fbTally(all, fbPlace);
  const langs = fbTally(all, (f) => f.lang);
  const apps = fbTally(all, (f) => (f.app ? String(f.app) : ''));
  const opt = (list, cur, label, fmt) => `<option value="">${esc(label)}</option>`
    + list.map(([v, n]) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(fmt ? fmt(v) : v)} (${n})</option>`).join('');
  const sbtn = (k, l) => `<button data-fb-st="${k}" class="${flt.status === k ? 'on' : ''}" aria-pressed="${flt.status === k}">${l}</button>`;
  const stat = (n, l, cls = '') => `<div class="stat ${cls}"><div class="n">${n}</div><div class="l">${l}</div></div>`;
  setMain(`
    <div class="row between"><h1>${tr('tab_feedback')}</h1>
      ${owner ? `<button class="plain" id="fb-csv">${tr('fb_csv')}</button>` : ''}</div>
    <div class="kpis">${msgStats(all, c.open, { tr, dur })}</div>
    <p class="muted small" style="margin-top:-4px">${tr('fb_total')}: ${c.total} · ${tr('fb_f_done')}: ${c.done} · ${tr('fb_week')}: ${week}</p>
    ${places.length ? `<div class="filters"><span class="small muted" style="align-self:center">${tr('fb_from')}</span>${places.slice(0, 6).map(([v, n]) => `<button data-fb-place="${esc(v)}" class="${flt.place === v ? 'on' : ''}" aria-pressed="${flt.place === v}">${esc(v)} · ${n}</button>`).join('')}</div>` : ''}
    <div class="filters">${sbtn('open', tr('fb_f_new'))}${sbtn('replied', tr('mg_f_replied'))}${sbtn('done', tr('fb_f_done'))}${sbtn('all', tr('fb_f_all'))}</div>
    <div class="filters">${['form', 'problem', 'ai_wrong', 'suggestion', 'praise'].map((k) => `<button data-fb-kind="${k}" class="${flt.kind === k ? 'on' : ''}" aria-pressed="${flt.kind === k}">${tr('mg_kind_' + k)}</button>`).join('')}</div>
    <div class="row" style="margin-bottom:12px">
      <input id="fb-q" type="search" style="flex:2 1 260px;width:auto" value="${esc(flt.q)}" placeholder="${esc(tr('fb_search'))}" aria-label="${esc(tr('fb_search'))}">
      <select id="fb-lang" style="flex:1 1 150px;width:auto" aria-label="${esc(tr('fb_any_lang'))}">${opt(langs, flt.lang, tr('fb_any_lang'), fbLang)}</select>
      <select id="fb-place" style="flex:1 1 150px;width:auto" aria-label="${esc(tr('fb_any_dist'))}">${opt(places, flt.place, tr('fb_any_dist'))}</select>
      <select id="fb-app" style="flex:1 1 150px;width:auto" aria-label="${esc(tr('fb_any_ver'))}">${opt(apps, flt.app, tr('fb_any_ver'), (v) => 'v' + v)}</select>
      <button class="plain" id="fb-clear">${tr('fb_clear')}</button>
    </div>
    <p class="muted small" id="fb-showing"></p>
    <div id="fb-list"></div>
    ${st.next ? `<button class="plain" id="fb-more">${tr('fb_more')}</button>` : (all.length ? `<p class="muted small">${tr('fb_all_loaded')}</p>` : '')}`);
  document.querySelectorAll('[data-fb-st]').forEach((b) => { b.onclick = () => { flt.status = b.dataset.fbSt; fbDraw(); }; });
  document.querySelectorAll('[data-fb-kind]').forEach((b) => { b.onclick = () => { flt.kind = flt.kind === b.dataset.fbKind ? '' : b.dataset.fbKind; fbDraw(); }; });
  document.querySelectorAll('[data-fb-place]').forEach((b) => {
    b.onclick = () => { flt.place = flt.place === b.dataset.fbPlace ? '' : b.dataset.fbPlace; fbDraw(); };
  });
  $('#fb-lang').onchange = (e) => { flt.lang = e.target.value; fbDraw(); };
  $('#fb-place').onchange = (e) => { flt.place = e.target.value; fbDraw(); };
  $('#fb-app').onchange = (e) => { flt.app = e.target.value; fbDraw(); };
  $('#fb-clear').onclick = () => { Object.assign(flt, { q: '', lang: '', place: '', app: '', kind: '' }); fbDraw(); };
  let typing;
  $('#fb-q').oninput = (e) => {
    clearTimeout(typing);
    typing = setTimeout(() => { flt.q = e.target.value.trim(); fbList(); }, 150);
  };
  if ($('#fb-more')) {
    $('#fb-more').onclick = async (e) => {
      e.target.disabled = true;
      try {
        const p = await db.feedbackPage(st.next);
        st.rows = st.rows.concat(p.rows);
        st.next = p.next;
        fbDraw();
      } catch (err) { e.target.disabled = false; fail(err); }
    };
  }
  if ($('#fb-csv')) $('#fb-csv').onclick = () => fbCsv(st.rows.filter((f) => fbMatches(f, flt)));
  fbList();
  // Opened from an alert (#feedback/<id>): show that message, open.
  if (cache.fbFocus) {
    const card = document.querySelector(`[data-fb="${CSS.escape(cache.fbFocus)}"]`);
    const f = st.rows.find((x) => x.id === cache.fbFocus);
    cache.fbFocus = null;
    if (card) { card.scrollIntoView({ block: 'center' }); card.classList.add('fresh'); }
    if (f) fbOpen(f);
  }
}

/** The whole message and the reply, in the side panel (messages.js). */
function fbOpen(f) {
  if (!f) return;
  openMessage(f, {
    tr, esc, db, me, openPanel, closePanel, toast, fail, when, dur, rows: cache.fb ? cache.fb.rows : [],
    onChange: () => PAGES.feedback(),
  }).catch(fail);
}

/** The buttons on each card. Changes are kept in the loaded list, so the
 *  page doesn't read everything again after each click. */
function fbWire() {
  const st = cache.fb;
  const find = (id) => st.rows.find((f) => f.id === id);
  document.querySelectorAll('[data-fb-open]').forEach((b) => { b.onclick = () => fbOpen(find(b.dataset.fbOpen)); });
  const boxOf = (id) => document.querySelector(`[data-fb-box="${CSS.escape(id)}"]`);
  const recount = () => { if (st.counts) { cache.fbOpen = st.counts.open; tabs(); } };
  document.querySelectorAll('[data-fb-done]').forEach((b) => {
    b.onclick = async () => {
      const f = find(b.dataset.fbDone);
      if (!f) return;
      b.disabled = true;
      try {
        const to = !f.done;
        await db.feedbackDone(f.id, to);
        f.done = to;
        f.by = me.email;
        if (st.counts) { st.counts.done += to ? 1 : -1; st.counts.open -= to ? 1 : -1; }
        recount();
        fbDraw();
      } catch (e) { b.disabled = false; fail(e); }
    };
  });
  document.querySelectorAll('[data-fb-note]').forEach((b) => {
    b.onclick = () => {
      const box = boxOf(b.dataset.fbNote);
      if (!box) return;
      box.hidden = !box.hidden;
      b.setAttribute('aria-expanded', String(!box.hidden));
      if (!box.hidden) box.querySelector('textarea').focus();
    };
  });
  document.querySelectorAll('[data-fb-cancel]').forEach((b) => {
    b.onclick = () => { const box = boxOf(b.dataset.fbCancel); if (box) box.hidden = true; };
  });
  document.querySelectorAll('[data-fb-save]').forEach((b) => {
    b.onclick = async () => {
      const f = find(b.dataset.fbSave);
      const box = boxOf(b.dataset.fbSave);
      if (!f || !box) return;
      const text = box.querySelector('textarea').value.trim().slice(0, 500);
      b.disabled = true;
      try {
        await db.feedbackNote(f.id, text);
        f.note = text;
        f.by = me.email;
        toast(tr('fb_note_saved'));
        fbDraw();
      } catch (e) { b.disabled = false; fail(e); }
    };
  });
  document.querySelectorAll('[data-fb-copy]').forEach((b) => {
    b.onclick = () => {
      const f = find(b.dataset.fbCopy);
      if (!f) return;
      navigator.clipboard.writeText(String(f.text || '')).then(() => toast(tr('fb_copied')), (e) => fail(e));
    };
  });
  document.querySelectorAll('[data-fb-del]').forEach((b) => {
    b.onclick = async () => {
      const f = find(b.dataset.fbDel);
      if (!f || !confirm(tr('fb_delete_q'))) return;
      b.disabled = true;
      try {
        await db.feedbackDelete(f.id);
        st.rows = st.rows.filter((x) => x.id !== f.id);
        if (st.counts) {
          st.counts.total -= 1;
          if (f.done) st.counts.done -= 1; else st.counts.open -= 1;
        }
        recount();
        toast(tr('fb_deleted'));
        fbDraw();
      } catch (e) { b.disabled = false; fail(e); }
    };
  });
}

// ── pages ──────────────────────────────────────────────────────────────
const teamTabs = (on) => `<div class="subtabs" role="tablist">
  <button role="tab" aria-selected="${on === 'team'}" class="${on === 'team' ? 'on' : ''}" data-sub="team">${tr('tab_team_only')}</button>
  <button role="tab" aria-selected="${on === 'audit'}" class="${on === 'audit' ? 'on' : ''}" data-sub="audit">${tr('tab_audit')}</button>
</div>`;
const wireTeamTabs = () => document.querySelectorAll('[data-sub]').forEach((b) => { b.onclick = () => go(b.dataset.sub); });

const PAGES = {
  // Today (Admin 1.29, owner 18 Nov 2026 — "Part 3" approved 10:55): what
  // waits for the team, whether something is wrong right now, and — owner
  // only — the launch counter, Pro, the month's money and the next dates.
  // Pages whose feature is off stay out of it (they sleep on the Later shelf).
  async home() {
    const owner = me.role === 'owner';
    const none = (v) => Promise.resolve(v);
    const [requests, feedback, fbCounts, deletions, offers, orders, complaints, kinfo, server, cfg] = await Promise.all([
      db.sellRequests().catch(() => []), db.feedback().catch(() => []),
      db.feedbackCounts ? db.feedbackCounts().catch(() => null) : none(null),
      db.deletions().catch(() => []), db.offers().catch(() => ({ list: [] })),
      db.kendraOrders ? db.kendraOrders().catch(() => []) : none([]),
      db.kendraComplaints ? db.kendraComplaints().catch(() => []) : none([]),
      db.kendraInfo ? db.kendraInfo().catch(() => ({})) : none({}),
      db.serverStatus ? db.serverStatus().catch(() => null) : none(null),
      db.appConfig().catch(() => null),
    ]);
    const [stats, members, gifts, budget, bizData] = owner ? await Promise.all([
      db.ownerStats().catch(() => null), db.plusMembers().catch(() => []), db.plusGifts().catch(() => []),
      db.budget().catch(() => null), biz().homeData().catch(() => null),
    ]) : [null, [], [], null, null];

    const now = Date.now();
    const day = 864e5;
    const openFeedback = feedback.filter((f) => !f.done);
    const kNew = orders.filter((o) => o.status === 'new');
    const kReady = orders.filter((o) => o.status === 'ready');
    const openComplaints = complaints.filter((x) => !x.done);
    const openDel = deletions.filter((d) => !d.done);
    const liveOffers = (offers.list || []).filter((o) => String(o.until || '') >= istToday());
    cache.requests = requests;
    cache.kendraNew = kNew.length;
    cache.fbOpen = fbCounts ? fbCounts.open : openFeedback.length;
    cache.delOpen = openDel.length;
    cache.liveOffers = liveOffers.length;
    if (cfg) cache.features = cfg.features || {};
    if (bizData) { cache.biz = biz().badges(bizData); cache.kadam = Number((bizData.plan || {}).kadam) || 0; }
    tabs();
    const awake = (tab) => isAwake(sleeperOf(tab));
    const sellAwake = awake('requests');
    const kendraAwake = awake('kendra');

    // ── farmer messages: the 4-hour promise ──
    const PROMISE = 4 * 3600e3;
    const waiting = openFeedback.filter((f) => f.at instanceof Date).sort((x, y) => x.at - y.at);
    const oldest = waiting[0];
    const nOpen = cache.fbOpen;
    let msgCard;
    if (!nOpen) {
      msgCard = `<section class="tcard green"><div class="tl">${tr('td_msgs')}</div><div class="tb">${tr('td_all_answered')}</div>
        <button class="btn sec" data-go="feedback">${tr('td_open')}</button></section>`;
    } else {
      const age = oldest ? now - oldest.at : 0;
      const late = age >= PROMISE;
      msgCard = `<section class="tcard ${late ? 'red' : 'amber'}">
        <div class="tl">${tr('td_msgs')}</div>
        <div class="tb">${tr('td_waiting', { n: nOpen })}</div>
        ${oldest ? `<div class="ts">${tr('td_oldest', { t: dur(age) })} — ${late ? tr('td_over', { t: dur(age - PROMISE) }) : tr('td_left', { t: dur(PROMISE - age) })}</div>` : ''}
        <button class="btn pri" data-go="feedback">${tr('td_reply')}</button></section>`;
    }

    // ── problem right now: the price job (more kinds come with alerts) ──
    const problems = [];
    if (server && server.at instanceof Date && now - server.at > 30 * 3600e3) problems.push({ t: tr('td_prob_job', { d: when(server.at) }) });
    const openStates = ['Maharashtra', ...(((cfg || {}).launch_states) || []).filter((x) => x !== 'Maharashtra')];
    if (server && server.states) {
      openStates.forEach((st) => {
        const run = server.states[st];
        if (run && !run.rows && run.error) problems.push({ t: tr('td_prob_state', { s: st }), d: String(run.error).slice(0, 120) });
      });
    }
    const probCard = problems.length
      ? `<section class="tcard red"><div class="tl">${tr('td_problem')}</div><div class="tb sm">${esc(problems[0].t)}</div>
          <div class="ts">${esc(problems[0].d || '')}${problems.length > 1 ? ` · +${problems.length - 1}` : ''}</div>
          ${owner ? `<button class="btn sec" data-go="features">${tr('td_prob_see')}</button>` : ''}</section>`
      : `<section class="tcard green"><div class="tl">${tr('td_well')}</div><div class="tb sm">${server && server.at instanceof Date ? tr('td_well_d', { t: dur(now - server.at) }) : tr('td_well_none')}</div></section>`;

    // ── answered this week ──
    const week = feedback.filter((f) => f.at instanceof Date && now - f.at < 7 * day);
    const weekDone = week.filter((f) => f.done).length;
    const ansCard = `<section class="tcard blue"><div class="tl">${tr('td_answered')}</div>
      <div class="tb">${week.length ? tr('td_answered_n', { a: weekDone, b: week.length }) : '—'}</div>
      <div class="ts">${tr('td_answered_sub')}</div><div class="ts dim">${tr('td_answered_soon')}</div></section>`;

    // ── needs doing: only what belongs to awake pages ──
    const tasks = [];
    const newReq = requests.filter((r) => r.status === 'new' && r.at instanceof Date).sort((x, y) => x.at - y.at);
    if (sellAwake && newReq.length) {
      const o = newReq[0];
      tasks.push({ icon: '📞', tone: 'red', title: tr('t_call', { who: esc(o.name || phoneShow(o.phone)), qty: esc(o.qty), crop: esc(o.crop) }),
        sub: [tr('t_waited', { t: dur(now - o.at) }), esc(o.village || '')].filter(Boolean).join(' · '),
        actions: `<a class="btn pri" href="tel:${esc(phoneTen(o.phone) ? '+91' + phoneTen(o.phone) : o.phone)}">${tr('call')}</a><button class="btn sec" id="open-oldest">${tr('open')}</button>` });
      if (newReq.length > 1) tasks.push({ icon: '⏳', tone: 'amber', title: tr('t_more_waiting', { n: newReq.length - 1 }), sub: tr('t_more_waiting_d'), actions: `<button class="btn sec" data-filter="new">${tr('open')}</button>` });
    }
    if (kendraAwake) {
      if (kNew.length) tasks.push({ icon: '🧾', tone: 'sky', title: tr('t_k_new', { n: kNew.length }), sub: kReady.length ? tr('t_k_ready', { n: kReady.length }) : tr('t_k_new_d'), actions: `<button class="btn sec" data-go="kendra">${tr('open')}</button>` });
      const stock = kinfo.stock || {};
      const lowStock = ['urea', 'dap', 'mop'].filter((k) => stock[k] === 'low' || stock[k] === 'out');
      if (featureOn('kendra') && lowStock.length) tasks.push({ icon: '📦', tone: 'amber', title: tr('t_stock', { s: lowStock.map((k) => `${tr('k_' + k)} ${tr('k_' + stock[k])}`).join(', ') }), sub: tr('t_stock_d'), actions: `<button class="btn sec" data-go="kendra">${tr('t_update')}</button>` });
      if (openComplaints.length) tasks.push({ icon: '⚠️', tone: 'red', title: tr('t_complaints', { n: openComplaints.length }), sub: tr('t_oldest_on', { d: when(openComplaints[openComplaints.length - 1].at) }), actions: `<button class="btn sec" data-go="kendra">${tr('read')}</button>` });
    }
    if (openDel.length) {
      const first = openDel.filter((d) => d.at instanceof Date).sort((x, y) => x.at - y.at)[0];
      const left = first ? Math.max(0, 30 - Math.floor((now - first.at) / day)) : null;
      tasks.push({ icon: '🗑️', tone: 'red', title: tr('t_deletions', { n: openDel.length }), sub: left == null ? tr('t_del_d') : tr('t_del_left', { d: left }), actions: `<button class="btn sec" data-go="deletions">${tr('open')}</button>` });
    }
    if (bizData && awake('processors')) tasks.push(...biz().homeTasks({ ...bizData, items: [] }));
    if (sellAwake) {
      const ending = liveOffers.filter((o) => { const u = String(o.until || ''); return u && u <= new Date(now + 2 * day + 5.5 * 3600e3).toISOString().slice(0, 10); });
      if (ending.length) tasks.push({ icon: '🏷️', tone: 'sky', title: tr('t_offers_end', { n: ending.length }), sub: ending.map((o) => esc(o.crop || '')).join(', '), actions: `<button class="btn sec" data-go="offers">${tr('open')}</button>` });
    }

    // ── latest ──
    const person = (email) => { const u = String(email || '').split('@')[0]; return u ? u.charAt(0).toUpperCase() + u.slice(1) : '—'; };
    const events = [];
    feedback.slice(0, 20).forEach((f) => { if (f.at instanceof Date) events.push({ at: f.at, dot: f.done ? 'green' : 'amber', html: `${tr('tab_feedback')} · “${esc(String(f.text || '').slice(0, 70))}” · ${esc(f.district || f.state || '')}` }); });
    if (sellAwake) requests.slice(0, 20).forEach((r) => {
      if (r.at instanceof Date) events.push({ at: r.at, dot: 'red', html: `${esc(r.name || phoneShow(r.phone))} ${tr('e_wants', { qty: esc(r.qty), crop: esc(r.crop) })}` });
      (r.history || []).forEach((h) => { const at = toDate(h.at); if (at) events.push({ at, dot: 'blue', html: `${esc(person(h.by))} ${tr('e_moved', { who: esc(r.name || phoneShow(r.phone)) })}` }); });
    });
    if (kendraAwake) orders.slice(0, 20).forEach((o) => { if (o.at instanceof Date) events.push({ at: o.at, dot: 'blue', html: `${esc(o.name || phoneShow(o.phone))} ${tr('e_order', { code: esc(o.code || ''), rs: rs(o.total) })}` }); });
    const feed = events.filter((e) => now - e.at < 14 * day).sort((x, y) => y.at - x.at).slice(0, 6);

    // ── owner only ──
    let ownerPart = '';
    if (owner) {
      const ga = (stats && stats.ga) || {};
      const got = ga.inn_launch != null ? ga.inn_launch : null;
      const GOAL = 1000;
      let launch;
      if (got == null) launch = `<div class="ob">—</div><div class="os">${tr('td_launch_wait')}</div>`;
      else {
        const left = Math.max(0, GOAL - got);
        const pace = ga.inn7 != null ? ga.inn7 / 7 : 0;
        launch = `<div class="ob">${got.toLocaleString('en-IN')} <small>${tr('td_launch_of')}</small></div>
          <div class="obar"><span style="width:${Math.min(100, (got / GOAL) * 100).toFixed(1)}%"></span></div>
          <div class="os">${left ? (pace > 0 ? tr('td_launch_pace', { p: Math.round(pace), d: Math.ceil(left / pace) }) : '') : tr('td_launch_done')}</div>`;
      }
      const paid = (members || []).filter((m) => !m.test && m.until instanceof Date && m.until.getTime() > now);
      const inUse = (gifts || []).filter((g) => g.device).length;
      const proOn = featureOn('pro_sale');
      const mStart = monthStart();
      const proIncome = (members || []).filter((m) => !m.test && m.at instanceof Date && m.at >= mStart).reduce((a, m) => a + (m.price || 0), 0);
      const ym = new Date();
      const key = `${ym.getFullYear()}-${String(ym.getMonth() + 1).padStart(2, '0')}`;
      const bs = budget && (budget.lines || []).length ? budgetSums(budget, key) : null;
      const money = bs && bs.plan
        ? `<div class="ob sm">${tr('td_money_plan', { rs: rs(bs.plan) })}</div><div class="os">${tr('td_money_spent', { rs: rs(bs.spent) })} · ${tr('td_money_pro', { rs: rs(proIncome) })}</div>`
        : `<div class="ob sm">—</div><div class="os">${tr('td_money_none')}</div>`;
      const t0 = istToday();
      const showDay = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
      const dates = ((bizData && bizData.items) || []).filter((x) => !x.done && x.due).sort((a, b) => String(a.due).localeCompare(String(b.due))).slice(0, 6);
      const dateRows = dates.map((x) => {
        const lateBy = Math.round((Date.parse(t0) - Date.parse(x.due)) / day);
        return `<div><b>${esc(showDay(x.due))}</b> · ${esc(x.name || '')}${lateBy > 0 ? ` <span class="late">${tr('td_dates_late', { d: lateBy })}</span>` : ''}</div>`;
      }).join('');
      ownerPart = `<section class="ownerpart">
        <div class="ohead">${icon('lock')}${tr('td_only_you')}</div>
        <div class="otiles">
          <button class="otile" data-go="stats"><div class="ol">${tr('td_launch')}</div>${launch}</button>
          <button class="otile" data-go="plus"><div class="ol">${tr('td_pro')}</div><div class="ob sm">${proOn ? tr('td_pro_on') : tr('td_pro_off')}</div><div class="os">${tr('td_pro_sub', { m: paid.length, g: inUse })}</div></button>
          <button class="otile" data-go="budget"><div class="ol">${tr('td_money')}</div>${money}</button>
        </div>
        <button class="otile wide" data-go="compliance"><div class="ol">${tr('td_dates')}</div>
          ${dateRows ? `<div class="odates">${dateRows}</div>` : `<div class="os">${tr('td_dates_none')}</div>`}</button>
      </section>`;
    }

    setMain(`
      ${db.demo ? `<p class="note">${tr('demo_note')}</p>` : ''}
      <div class="ph">
        <div class="ph-t"><h1>${tr('tab_home')}</h1><span class="ph-date">${esc(todayLabel())}</span></div>
      </div>
      <p class="hello">${markSVG(22, { animate: !cache.dashSeen })}<span>${tr('hello', { n: me.name ? ' ' + esc(me.name) : '' })}</span></p>
      <div class="trow">${msgCard}${probCard}${ansCard}</div>
      ${tasks.length ? `<section class="card">
        <div class="ch"><h2>${tr('td_need')}</h2><span class="pill warn">${tasks.length}</span></div>
        <div class="todo">${tasks.map((t) => `<div class="ti">
            <span class="tic ${t.tone}" aria-hidden="true">${t.icon}</span>
            <div class="grow"><div class="tt">${t.title}</div><div class="ts">${t.sub}</div></div>
            <div class="tact">${t.actions}</div></div>`).join('')}</div>
      </section>` : ''}
      <section class="card">
        <div class="ch"><h2>${tr('td_latest')}</h2><span class="livebadge in ${cache.live === false ? 'off' : ''}"><i></i>${cache.live === false ? tr('live_off') : tr('live')}</span></div>
        ${feed.length ? `<div class="tfeed">${feed.map((e) => `<div class="tfi"><span class="tdot ${e.dot}" aria-hidden="true"></span><span class="grow">${e.html}</span><span class="muted small">${tr('ago', { t: dur(now - e.at) })}</span></div>`).join('')}</div>`
          : `<p class="muted small">${tr('td_latest_none')}</p>`}
      </section>
      ${ownerPart}`);
    cache.dashSeen = true;
    document.querySelectorAll('[data-go]').forEach((el) => { if (el.dataset.go) el.onclick = () => go(el.dataset.go); });
    document.querySelectorAll('[data-filter]').forEach((el) => { el.onclick = () => { cache.reqFilter = el.dataset.filter; go('requests'); }; });
    const openOldest = $('#open-oldest');
    if (openOldest) openOldest.onclick = () => showRequest(newReq[0]);
  },

  // The Later shelf: every sleeping page, why it sleeps, and a way in.
  async later() {
    const owner = me.role === 'owner';
    const shelf = shelfFor(owner);
    setMain(`
      <h1>${tr('tab_later')}</h1>
      <div class="shelf">
        ${shelf.map((s) => {
          const up = isAwake(s);
          return `<section class="shelfcard${up ? ' up' : ''}">
            <div class="sht">${icon(s.tab)}<span>${tr('tab_' + s.tab)}</span></div>
            <div class="shd">${tr('later_d_' + s.tab)}</div>
            <div class="shw">${up ? tr('later_awake') : tr(s.why)}</div>
            <button class="linkbtn" data-go="${s.tab}">${up ? tr('open') : tr('later_open')} →</button>
          </section>`;
        }).join('')}
      </div>`);
    document.querySelectorAll('[data-go]').forEach((el) => { el.onclick = () => go(el.dataset.go); });
  },

  async requests() {
    const owner = me.role === 'owner';
    const [list, money] = await Promise.all([
      db.sellRequests(),
      owner ? db.allDealMoney().catch(() => ({})) : Promise.resolve({}),
    ]);
    cache.requests = list;
    cache.money = money;
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
    const owner = me.role === 'owner';
    const [{ version, list }, offerMoney] = await Promise.all([
      db.offers(),
      owner ? db.allOfferMoney().catch(() => ({})) : Promise.resolve({}),
    ]);
    cache.offerMoney = offerMoney;
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
        ${owner ? `
        <section class="moneybox">
          <h2>🔒 ${tr('plan_h')}</h2>
          <div class="form">
            <div><label for="p-rate">${tr('mo_rate')}</label><input id="p-rate" type="number" min="0" inputmode="numeric"></div>
            <div><label for="p-transport">${tr('plan_transport')}</label><input id="p-transport" type="number" min="0" inputmode="numeric"></div>
            <div><label for="p-other">${tr('plan_other')}</label><input id="p-other" type="number" min="0" inputmode="numeric"></div>
          </div>
          <div class="msum" id="p-sum" aria-live="polite"></div>
        </section>` : ''}
        <div class="actions"><button class="main" id="o-save">${tr('o_save')}</button></div>
      </div>`);
    if (owner) {
      const render = () => {
        const plan = offerPlan($('#o-price').value, $('#p-rate').value, $('#p-transport').value, $('#p-other').value);
        const box = $('#p-sum');
        if (!plan) { box.innerHTML = ''; return; }
        const warn = plan.perQ < 0 ? tr('plan_loss') : plan.pct < 2 ? tr('plan_thin') : '';
        box.innerHTML = `<p class="${plan.perQ < 0 ? 'neg' : 'pos'}"><b>${tr('plan_result', {
          m: signedRs(plan.perQ), t: signedRs(plan.truck),
        })}</b> · ${plan.pct.toFixed(1)}%</p>${warn ? `<p class="warnline">⚠️ ${warn}</p>` : ''}`;
      };
      ['#o-price', '#p-rate', '#p-transport', '#p-other'].forEach((id) => { $(id).oninput = render; });
    }
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

  async kendra() {
    kendraPages = kendraPages || createKendra({
      tr, esc, rs, when, toast, fail, setMain, openPanel, closePanel, $, dur, monthStart, phoneShow, signedRs,
      db: () => db, me: () => me, lang: () => lang, page: () => page,
      ding: (text) => {
        if (store.get('sound', 'on') === 'on') chime();
        if (store.get('desktop', 'off') === 'on') desktopNotify('Khalihan Kendra', text);
      },
    });
    await kendraPages.page();
  },

  // Owner: Business Plan v2 — steps and money, processors, licences & dates.
  async plan() { if (me.role !== 'owner') return PAGES.home(); await biz().plan(); },
  async processors() { if (me.role !== 'owner') return PAGES.home(); await biz().processors(); },
  async compliance() { if (me.role !== 'owner') return PAGES.home(); await biz().compliance(); },

  // Owner: downloads and what farmers use (Admin 1.18, see stats.js).
  async stats() {
    if (me.role !== 'owner') return PAGES.home();
    await statsPage({ esc, setMain, lang: () => lang, db: () => db, fail, crops: CROPS });
  },

  // Owner: the month's budget, the loss limit and the targets (Admin 1.20,
  // see budget.js — amounts live only in Firestore business/budget).
  async budget() {
    if (me.role !== 'owner') return PAGES.home();
    await budgetPage({ esc, setMain, lang: () => lang, db: () => db, fail, toast });
  },

  // Owner: Khalihan AI's 200-question test (Admin 1.22, see aitest.js —
  // stored under business/, owner only).
  async aitest() {
    if (me.role !== 'owner') return PAGES.home();
    await aiTestPage({ esc, setMain, lang: () => lang, db: () => db, fail, toast });
  },

  // Owner: Khalihan AI for government forms (Admin 1.33, see aiforms.js —
  // config/app → ai_forms {live, test}; history under business/, owner only).
  async aiforms() {
    if (me.role !== 'owner') return PAGES.home();
    await aiFormsPage({ esc, setMain, lang: () => lang, db: () => db, fail, toast });
  },

  // Owner: every feature, state and district switch, in sections.
  async features() {
    switchPages = switchPages || createSwitches({ tr, esc, toast, fail, setMain, db: () => db, lang: () => lang, onChange: () => loadWake().then(tabs) });
    await switchPages.page();
  },

  // Owner: Khalihan Plus — runs by itself; how it works, how we help, and
  // free Plus by gift code (Admin 1.16).
  async plus() {
    if (me.role !== 'owner') return PAGES.home();
    await plusPage({ esc, setMain, lang: () => lang, db: () => db, toast, fail });
  },

  // Admin 1.17: every page, real totals, search, filters, team note, who
  // changed it last, owner-only delete and CSV (see fbDraw above).
  async feedback() {
    const [first, counts] = await Promise.all([
      db.feedbackPage(null),
      db.feedbackCounts().catch(() => null),
    ]);
    cache.fb = { rows: first.rows, next: first.next, counts };
    if (counts) { cache.fbOpen = counts.open; tabs(); }
    fbDraw();
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
      ${teamTabs('team')}
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
    wireTeamTabs();
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
      <h1>${tr('tab_team')}</h1>
      ${teamTabs('audit')}
      <p class="muted small">${tr('audit_sub')}</p>
      ${list.length ? `<table><tr><th>${tr('a_when')}</th><th>${tr('a_who')}</th><th>${tr('a_what')}</th><th>${tr('a_details')}</th></tr>
        ${list.map((a) => `<tr><td>${when(a.at)}</td><td>${esc(a.by)}</td><td>${esc(a.action)}</td><td class="small">${esc(JSON.stringify(a.details || {}))}</td></tr>`).join('')}
      </table>` : `<div class="empty">${tr('nothing_yet')}</div>`}`);
    wireTeamTabs();
  },

  // Everyone on the team: language, time zone, who am I, links.
  async settings() {
    const alerts = await alertsCard({ tr, esc, db, me, when, toast, fail, rerender: () => PAGES.settings() })
      .catch((e) => { console.warn(e); return { html: '', wire: () => {} }; });
    const choice = (name, value, current, label) =>
      `<label class="choice"><input type="radio" name="${name}" value="${value}" ${value === current ? 'checked' : ''}> <span>${label}</span></label>`;
    const p = db.project && db.project !== 'demo' ? encodeURIComponent(db.project) : '';
    const fb = (path) => `https://console.firebase.google.com/project/${p}/${path}`;
    const link = (href, label) => `<a class="btnlink" href="${href}" target="_blank" rel="noopener">${label} ↗</a>`;
    const appCard = () => {
      if (installedAsApp()) return `<div class="card"><div class="title">${tr('set_app')}</div><div class="sub">${tr('set_app_done')}</div></div>`;
      const way = installWay();
      return `<div class="card">
        <div class="title">${tr('set_app')}</div>
        <div class="sub">${tr('set_app_d')}</div>
        ${way === 'prompt'
          ? `<div class="actions"><button class="main" id="s-install">💻 ${tr('install_btn')}</button></div>`
          : `<p class="small" style="margin:8px 0 0;line-height:1.5">${tr('set_app_' + way)}</p>`}
      </div>`;
    };
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
      ${alerts.html}
      <div class="card">
        <div class="title">${tr('al_tab_h')}</div>
        <label class="check"><input type="checkbox" id="s-sound" ${store.get('sound', 'on') === 'on' ? 'checked' : ''}> ${tr('set_sound')}</label>
        <label class="check"><input type="checkbox" id="s-desktop" ${desktopAllowed() && store.get('desktop', 'off') === 'on' ? 'checked' : ''}> ${tr('set_desktop')}</label>
        <p class="muted small" id="s-desktop-note" hidden>${tr('set_desktop_blocked')}</p>
      </div>
      ${appCard()}
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
    if ($('#s-install')) $('#s-install').onclick = installApp;
    $('#s-sound').onchange = (e) => {
      store.set('sound', e.target.checked ? 'on' : 'off');
      if (e.target.checked) chime(); // so one hears what it sounds like
      toast(tr('set_saved'));
    };
    alerts.wire();
    $('#s-desktop').onchange = async (e) => {
      if (!e.target.checked) { store.set('desktop', 'off'); toast(tr('set_saved')); return; }
      const answer = await askDesktop();
      const ok = answer === 'granted';
      e.target.checked = ok;
      store.set('desktop', ok ? 'on' : 'off');
      $('#s-desktop-note').hidden = ok;
      if (ok) toast(tr('set_saved'));
    };
  },
};

// ── pieces ─────────────────────────────────────────────────────────────
const signedRs = (n) => (typeof n === 'number' && isFinite(n) ? (n < 0 ? '−' : '') + rs(Math.abs(n)) : '—');
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** "25 min", "2 h 10 min", "3 d 4 h". */
function dur(ms) {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return tr('t_min', { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return tr('t_hr', { h, m: min % 60 });
  return tr('t_day', { d: Math.floor(h / 24), h: h % 24 });
}

/** The 1st of this month, 00:00 India time. */
function monthStart() {
  const ist = new Date(Date.now() + 5.5 * 3600e3);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - 5.5 * 3600e3);
}

/** Numbers marked data-count roll up from 0 — once, when the dashboard opens. */
/** A small line of the last days' numbers, for a KPI card. */
function sparkline(values, color) {
  const v = values.map((x) => Number(x) || 0);
  const max = Math.max(1, ...v);
  const w = 96, h = 34;
  const pts = v.map((x, i) => [(i / Math.max(1, v.length - 1)) * w, h - 3 - (x / max) * (h - 8)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${line} L${w} ${h} L0 ${h}Z" fill="${color}" opacity=".12"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** "Wed, 14 Oct" in India time (or this computer's, per Settings). */
function todayLabel() {
  return new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', ...(tz === 'ist' ? { timeZone: 'Asia/Kolkata' } : {}) });
}

function countUp() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (reducedMotion()) { els.forEach((el) => { el.textContent = el.dataset.count; }); return; }
  const start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / 750);
    const e = 1 - (1 - k) ** 3;
    els.forEach((el) => { el.textContent = Math.round(Number(el.dataset.count) * e); });
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Owner only: what this month's paid deals left us. */
function moneyCard(sum) {
  const q = (v) => Math.round(v).toLocaleString('en-IN');
  const tile = (label, value, cls) => `<div class="tile ${cls || ''}"><div class="tile-n">${value}</div><div class="tile-l">${label}</div></div>`;
  return `<section class="card wide money">
    <div class="row between"><h2>${tr('money_h')}</h2><span class="lock">🔒 ${tr('money_owner')}</span></div>
    ${sum.deals ? `
      <div class="tiles">
        ${tile(tr('m_bought'), `${q(sum.qty)} <small>${tr('qtl')}</small>`)}
        ${tile(tr('m_paid'), rs(sum.farmer))}
        ${tile(tr('m_margin'), signedRs(sum.margin), sum.margin < 0 ? 'neg' : 'pos')}
        ${tile(tr('m_per_q'), sum.perQ == null ? '—' : signedRs(sum.perQ), (sum.perQ || 0) < 0 ? 'neg' : 'pos')}
      </div>
      <p class="muted small">${tr('m_deals', { n: sum.deals })}${sum.missing ? ' · ' + tr('m_missing', { n: sum.missing }) : ''}</p>
      ${table([tr('m_crop'), tr('qtl_col'), tr('m_paid'), tr('m_margin')],
        sum.byCrop.map((c) => [c.crop, q(c.qty), rs(c.farmer), c.known ? signedRs(c.margin) : '—']))}`
      : `<p class="muted">${tr('m_none')}</p>`}
  </section>`;
}

/** "waiting 2 h 10 min" on a request nobody has called yet. */
function waitChip(r) {
  if (r.status !== 'new' || !(r.at instanceof Date)) return '';
  const ms = Date.now() - r.at;
  const cls = ms > 2 * 3600e3 ? 'hot' : ms > 30 * 60e3 ? 'warm' : '';
  return `<span class="wait ${cls}">${tr('waited', { t: dur(ms) })}</span>`;
}

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
      <div class="side">${chip(r.status)}${waitChip(r)}${marginBadge(r)}</div>
    </div>
  </div>`;
}

/** Owner only: the margin a deal left, when its money is entered. */
function marginBadge(r) {
  if (!me || me.role !== 'owner' || !cache.money) return '';
  const n = dealNumbers(r, cache.money[r.id]);
  if (n.margin == null) return '';
  return `<span class="mbadge ${n.margin < 0 ? 'neg' : ''}">${signedRs(n.margin)}</span>`;
}

function showRequest(r) {
  if (!r) return;
  const ten = phoneTen(r.phone);
  const nexts = NEXT[r.status] || [];
  const history = (r.history || []).slice().sort((a, b) => toMs(a.at) - toMs(b.at));
  const owner = me.role === 'owner';
  const m = owner ? (cache.money && cache.money[r.id]) || {} : null;
  const panel = openPanel(`
    <h1>${esc(r.crop)} — ${esc(r.qty)} ${tr('qtl')}</h1>
    <div class="row">${chip(r.status)}${waitChip(r)}</div>
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
    ${owner ? `
    <section class="moneybox">
      <h2>🔒 ${tr('money_section')}</h2>
      <div class="form">
        <div><label for="m-rate">${tr('mo_rate')}</label><input id="m-rate" type="number" min="0" inputmode="numeric" value="${esc(m.rate ?? '')}"></div>
        <div><label for="m-transport">${tr('mo_transport')}</label><input id="m-transport" type="number" min="0" inputmode="numeric" value="${esc(m.transport ?? '')}"></div>
        <div><label for="m-labour">${tr('mo_labour')}</label><input id="m-labour" type="number" min="0" inputmode="numeric" value="${esc(m.labour ?? '')}"></div>
        <div><label for="m-other">${tr('mo_other')}</label><input id="m-other" type="number" min="0" inputmode="numeric" value="${esc(m.other ?? '')}"></div>
      </div>
      <div class="msum" id="m-sum" aria-live="polite"></div>
      <div class="actions"><button class="plain" id="m-save">${tr('mo_save')}</button></div>
    </section>` : ''}
    <h2>${tr('history')}</h2>
    <div class="timeline">${history.length ? history.map((h) =>
      `<div>${chip(h.status)} <span class="sub">${when(toDate(h.at))} · ${esc(h.by)}</span>${h.note ? `<div>${esc(h.note)}</div>` : ''}</div>`).join('')
      : `<div class="muted">${tr('nothing_yet')}</div>`}</div>`);
  if (owner) wireMoney(panel, r);
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

/** The owner's money box in a request: sums update as numbers are typed. */
function wireMoney(panel, r) {
  const val = (id) => { const el = panel.querySelector(id); return el && el.value !== '' ? Number(el.value) : null; };
  const money = () => ({ rate: val('#m-rate'), transport: val('#m-transport'), labour: val('#m-labour'), other: val('#m-other') });
  const render = () => {
    // The agreed price and weight being typed above count too.
    const deal = { ...r, final_price: val('#r-price') || r.final_price, final_qty: val('#r-qty') || r.final_qty };
    const n = dealNumbers(deal, money());
    const line = (k, v, cls) => `<div>${k}</div><div class="${cls || ''}">${v}</div>`;
    panel.querySelector('#m-sum').innerHTML = `<div class="kv">
      ${line(tr('mo_farmer'), rs(n.farmer))}
      ${n.sale == null ? '' : line(tr('mo_sale'), rs(n.sale))}
      ${n.costs == null ? '' : line(tr('mo_costs'), rs(n.costs))}
      ${n.margin == null ? '' : line(tr('mo_margin'),
        `${signedRs(n.margin)}${n.perQ == null ? '' : ` · ${signedRs(n.perQ)}${tr('per_qtl')}`}${n.pct == null ? '' : ` · ${n.pct.toFixed(1)}%`}`,
        n.margin < 0 ? 'neg' : 'pos')}
    </div>`;
  };
  panel.querySelectorAll('#m-rate, #m-transport, #m-labour, #m-other, #r-price, #r-qty').forEach((el) => { el.oninput = render; });
  render();
  panel.querySelector('#m-save').onclick = async () => {
    const data = money();
    for (const k of Object.keys(data)) if (data[k] == null) data[k] = 0;
    try {
      await db.saveDealMoney(r.id, data);
      cache.money = { ...(cache.money || {}), [r.id]: data };
      toast(tr('mo_saved'));
      if (page === 'requests') PAGES.requests().then(() => {});
    } catch (e) { fail(e); }
  };
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
        ${offerMoneyLine(o)}
      </div>
      <button class="danger" data-end="${esc(o.id)}">${tr('o_end')}</button>
    </div>
  </div>`;
}

/** Owner only: the processor rate and margin behind an offer. */
function offerMoneyLine(o) {
  if (!me || me.role !== 'owner' || !cache.offerMoney) return '';
  const m = cache.offerMoney[o.id];
  if (!m || !m.rate) return '';
  const plan = offerPlan(o.price, m.rate, m.transport, m.other);
  if (!plan) return '';
  return `<div class="sub ownerline ${plan.perQ < 0 ? 'neg' : 'pos'}">🔒 ${tr('plan_card', { r: Math.round(m.rate).toLocaleString('en-IN'), m: signedRs(plan.perQ) })}</div>`;
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
    // The processor rate stays in the owner's own record, never in the
    // offers that phones read.
    const rateEl = document.querySelector('#p-rate');
    if (me.role === 'owner' && rateEl && rateEl.value) {
      await db.saveOfferMoney(offer.id, {
        rate: Number(rateEl.value),
        transport: Number($('#p-transport').value || 0),
        other: Number($('#p-other').value || 0),
        price,
      }).catch(fail);
    }
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

// ── live: new requests and farmer messages as they come ───────────────
let unwatch = null;
let unwatchFb = null;

function startLive() {
  if (unwatch) unwatch();
  unwatch = db.watchRequests(onNewRequest, (ok) => {
    cache.live = ok;
    document.querySelectorAll('.live-dot').forEach((d) => d.classList.toggle('off', !ok));
    if (me) $('#livebadge').hidden = !ok;
  });
  if (unwatchFb) unwatchFb();
  unwatchFb = db.watchFeedback ? db.watchFeedback(onNewMessage) : null;
}

// A farmer message while the panel is open: sound, toast, the menu's count.
function onNewMessage(f) {
  cache.fbOpen = (cache.fbOpen || 0) + 1;
  const text = `${tr('tab_feedback')}: “${String(f.text || '').slice(0, 80)}”`;
  toast(text);
  if (store.get('sound', 'on') === 'on') chime();
  if (store.get('desktop', 'off') === 'on') desktopNotify(tr('tab_feedback'), String(f.text || '').slice(0, 120));
  tabs();
  if (page === 'home' && !document.querySelector('.panel')) PAGES.home().catch(fail);
}

// ── deep links: an alert opens "#feedback/<id>", "#plus", … ────────────
function fromHash() {
  const [pg, id] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
  if (!pg || !PAGES[pg]) return null;
  if (pg === 'feedback' && id) cache.fbFocus = id;
  return pg;
}
window.addEventListener('hashchange', () => {
  if (!me) return;
  const pg = fromHash();
  if (pg) { go(pg); history.replaceState(null, '', location.pathname + location.search); }
});

// ── the bell: the newest alerts (alerts_team, and the owner's own) ─────
let unwatchBell = null;
const bellSeen = () => Number(store.get('alerts_seen', '0')) || 0;
function startBell() {
  const bell = $('#bell');
  if (!bell || !db.watchAlerts) return;
  bell.hidden = false;
  if (unwatchBell) unwatchBell();
  unwatchBell = db.watchAlerts((list) => { cache.alerts = list; drawBell(); });
  bell.onclick = (e) => {
    e.stopPropagation();
    const m = $('#bellmenu');
    m.hidden = !m.hidden;
    bell.setAttribute('aria-expanded', String(!m.hidden));
  };
  document.addEventListener('click', (e) => { if (!e.target.closest('.bellwrap')) $('#bellmenu').hidden = true; });
}
function drawBell() {
  const list = cache.alerts || [];
  const seen = bellSeen();
  const fresh = list.filter((a) => a.at && a.at.getTime() > seen).length;
  const count = $('#bellcount');
  count.textContent = fresh > 9 ? '9+' : String(fresh);
  count.hidden = !fresh;
  $('#bell').setAttribute('aria-label', fresh ? `${tr('bell')}, ${fresh}` : tr('bell'));
  $('#bellmenu').innerHTML = `<div class="bellhead"><b>${tr('bell')}</b>${fresh ? `<button class="linkbtn" id="bell-read">${tr('bell_read')}</button>` : ''}</div>
    <div class="belllist">${bellList(list, seen, { tr, esc, ago: (d) => tr('ago', { t: dur(Date.now() - d.getTime()) }) })}</div>
    <button class="linkbtn bellfoot" id="bell-set">${tr('bell_all')} →</button>`;
  const read = $('#bell-read');
  if (read) read.onclick = (e) => { e.stopPropagation(); store.set('alerts_seen', String(Date.now())); drawBell(); };
  $('#bell-set').onclick = () => { $('#bellmenu').hidden = true; go('settings'); };
  $('#bellmenu').querySelectorAll('.bellitem').forEach((a) => { a.addEventListener('click', () => { $('#bellmenu').hidden = true; }); });
}

function onNewRequest(r) {
  cache.requests = [r, ...(cache.requests || []).filter((x) => x.id !== r.id)];
  const text = tr('live_new', { crop: r.crop, qty: r.qty, village: r.village || '' });
  toast(text);
  if (store.get('sound', 'on') === 'on') chime();
  if (store.get('desktop', 'off') === 'on') desktopNotify(tr('notif_title'), text);
  tabs();
  const badge = document.querySelector('[data-tab="requests"] .badge');
  if (badge) badge.classList.add('bump');
  // Refresh what is on screen, unless a request is open in the side panel.
  if ((page === 'home' || page === 'requests') && !document.querySelector('.panel')) {
    PAGES[page]().then(() => {
      const hero = document.querySelector('.hero-n');
      if (hero) hero.classList.add('bump');
      const card = document.querySelector(`[data-req="${CSS.escape(r.id)}"]`);
      if (card) card.classList.add('fresh');
    }).catch(fail);
  }
}

// ── start ──────────────────────────────────────────────────────────────
function whoLine() {
  return me ? `${me.email} · ${me.role}${db && db.demo ? ' · ' + tr('demo') : ''}` : '';
}

function loginScreen(message) {
  $('#tabs').hidden = true;
  ['#search', '#langbtn', '#menu', '#livebadge'].forEach((id) => { $(id).hidden = true; });
  closeNav();
  $('#logout').hidden = true;
  $('#who').textContent = '';
  setMain(`<section class="center"><div>
    <div class="login-mark">${markSVG(96, { animate: true })}</div>
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
  wireTop();
  applyLanguage();
  $('#logo').innerHTML = markSVG(30);
  setMain(`<section class="center"><p class="muted">${tr('loading')}</p></section>`);
  try {
    const mod = DEMO ? await import('./demo-db.js') : await import('./firebase-db.js');
    db = await mod.connect();
  } catch (e) {
    console.error(e);
    setMain(`<section class="center"><div><h1>${tr('not_started')}</h1><p class="muted">${esc(e.message || e)}</p></div></section>`);
    return;
  }
  $('#logout').onclick = () => {
    [unwatch, unwatchFb, unwatchBell].forEach((f) => { if (f) f(); });
    unwatch = unwatchFb = unwatchBell = null;
    $('#bell').hidden = true;
    db.logout();
  };
  $('#install').onclick = installApp;
  showInstall();
  db.onUser((user) => {
    if (!user) {
      me = null;
      if (unwatch) { unwatch(); unwatch = null; }
      return loginScreen();
    }
    if (!user.role) {
      me = null;
      loginScreen(tr('not_team', { e: esc(user.email), x: user.error ? ' (' + esc(user.error) + ')' : '' }));
      $('#logout').hidden = false;
      return;
    }
    me = user;
    $('#who').textContent = whoLine();
    $('#logout').hidden = false;
    syncMe();
    loadWake().finally(() => go(fromHash() || 'home'));
    startLive();
    startBell();
  });
}

start();
