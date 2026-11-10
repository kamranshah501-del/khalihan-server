// 📊 App numbers — owner only (Admin 1.18, 10 Nov 2026). Owner: "admin
// panel per pata kaise chalega kitne download huwe, app ki details sirf
// owner ko dikhni chahiye, aur log kis cheez par zyada active hain".
//
// One document, owner_stats/latest, written twice a day by the server
// (tools/owner_stats.py): Google Play's own reports (downloads, phones,
// uninstalls, rating, crashes — Google posts them 3–7 days late) and Google
// Analytics for Firebase (what the app records: active people, new people,
// tabs, screens, features, crops, districts, languages, versions). Counts
// only — no name, no phone, no device id. Firestore rules: owner reads,
// nobody writes from a browser.

import { columnChart, wireTips, table } from './charts.js';

const T = {
  en: {
    title: '📊 App numbers',
    sub: 'Downloads, people using the app, and what they use most. Only owners see this page.',
    only_you: 'Owners only',
    updated: 'Updated {t}',
    never: 'Not fetched yet',
    ga_till: 'App data till {d}',
    play_till: 'Play data till {d}',
    play_late: 'Google Play posts its numbers 3–7 days late; app data is 1 day late.',
    k_total: 'Downloads (all time)',
    k_total_sub: '+{n} in 28 days',
    k_now: 'Phones that have it now',
    k_now_sub: '{n} removed it in 28 days',
    k_active: 'People using it (28 days)',
    k_active_sub: 'Yesterday {a} · 7 days {b}',
    k_active_in: 'People in India using it (28 days)',
    k_active_in_sub: 'Yesterday {a} · 7 days {b} · all countries {c}',
    k_new: 'New people (28 days)',
    k_new_in: 'New people in India (28 days)',
    k_new_sub: '{n} came back again',
    k_wait_play: 'Waiting for Google Play',
    today: 'Today so far: {n}',
    daily_h: 'People using the app each day',
    daily_tip: '{d}: {a} people, {n} new',
    dl_h: 'Downloads each day (Google Play)',
    dl_tip: '{d}: {i} downloads, {u} removed',
    feat_h: 'What people use most (28 days)',
    feat_d: 'Each line: how many people did it, and how many times in all.',
    people: 'people', times: 'times',
    all_events: 'Everything the app records',
    screens_h: 'Tabs and pages opened (28 days)',
    screens_soon: 'Tabs and pages are counted from app version 1.0.7. Until then, see "What people use most".',
    views: 'opens',
    crops_h: 'Crops opened most (28 days)',
    places_h: 'Where people are (28 days)',
    places_from_ip: 'In India, by Google\'s guess from the internet connection — districts chosen in the app show here from setup day on.',
    outside: 'Outside India: {list}. Mostly you and the testers (Kuwait) and Google\'s own test phones that check every new version (USA, Europe) — not farmers.',
    setup_ev: 'First start and settings (language, state, look…)',
    why_h: 'Why prices didn\'t download',
    where_h: 'In which state',
    why_old: 'Reasons are recorded from app 1.0.7 on.',
    fail_where: 'Country', fail_ver: 'App version', fail_day: 'Day',
    guide_h: '🧭 Get-ready guide (28 days)',
    guide_soon: 'Counted from app 1.0.7, once the "Get-ready guide" switch is on.',
    g_shown: 'Saw the guide', g_done: 'Guide finished', g_steps: 'Buttons pressed in the guide',
    perm_h: 'Phones with location / notifications',
    perm_loc: 'Location', perm_notif: 'Notifications',
    th_step: 'Step', th_result: 'What happened',
    fail_note: 'Prices don\'t need location — they come by the chosen state. Failures outside India are you, the testers or Google\'s test phones.',
    langs_h: 'App language',
    ver_h: 'App versions',
    ver_app: 'People by version (app data)',
    ver_play: 'Phones by version code (Play)',
    health_h: 'Health (28 days)',
    h_rating: 'Play rating',
    h_crash: 'Crashes',
    h_anr: 'App stuck (ANR)',
    h_removed: 'Removed the app',
    h_errors: 'Price download failed',
    no_rating: 'No rating yet',
    fills_soon: 'This starts filling from the day setup is done (Google doesn\'t count backwards).',
    none: 'Nothing yet.',
    setup_h: 'Setup — once, about 10 minutes',
    setup_d: 'The numbers come in by themselves twice a day once these are done.',
    s_ga: 'App data (Google Analytics for Firebase)',
    s_play: 'Downloads (Google Play)',
    st_ok: 'Working',
    st_wait: 'Waiting',
    m_setup: 'Not set up yet.',
    sa_h: 'Give this email access (it is our server — it only reads):',
    copy: 'Copy', copied: 'Copied',
    st1: 'Play Console → Users and permissions → Invite new users → this email → "Account permissions" tab → only "View app information and download bulk reports (read only)"',
    st2: 'Google Analytics → Admin → Property access management (Khalihan) → + → this email → role Editor',
    st3: 'Google Cloud: press "Enable" on both pages (check the Khalihan project is chosen at the top)',
    st4: 'Play Console → Download reports → Statistics → "Copy Cloud Storage URI" → send it to Claude',
    m_no_property: 'Add the service account to the Khalihan property in Google Analytics (Property access management → Editor).',
    m_api_off: 'Turn on "Google Analytics Data API" and "Google Analytics Admin API" in Google Cloud for the Firebase project.',
    m_denied: 'The service account has no access yet. In Play Console it can take up to a day to start working after the invite.',
    m_no_bucket: 'Send Claude the "Cloud Storage URI" from Play Console → Download reports → Statistics.',
    m_no_files: 'Google Play hasn\'t posted a report yet — they come 3–7 days late.',
    m_error: 'Something went wrong on the last try ({h}). It tries again in a few hours.',
    m_need_editor: 'The crop / district / language fields need the service account as Editor (not Viewer) in Google Analytics.',
    privacy: 'Counted: opens, tabs, pages, buttons, chosen state, district, language and crops — never a name, phone number or exact location. As written in the privacy policy.',
    th_day: 'Day', th_people: 'People', th_new: 'New', th_dl: 'Downloads', th_rm: 'Removed',
    show_table: 'Show as a table',
  },
  hi: {
    title: '📊 आँकड़े',
    sub: 'कितने डाउनलोड, कितने लोग ऐप चला रहे हैं, और किस चीज़ पर ज़्यादा। ये पेज सिर्फ़ मालिक देखते हैं।',
    only_you: 'सिर्फ़ मालिक',
    updated: 'अपडेट: {t}',
    never: 'अभी तक नहीं आया',
    ga_till: 'ऐप का डेटा {d} तक',
    play_till: 'Play का डेटा {d} तक',
    play_late: 'Google Play अपने आँकड़े 3–7 दिन देर से देता है; ऐप का डेटा 1 दिन देर से।',
    k_total: 'कुल डाउनलोड (शुरू से)',
    k_total_sub: '28 दिन में +{n}',
    k_now: 'अभी कितने फ़ोन में है',
    k_now_sub: '28 दिन में {n} ने हटाया',
    k_active: 'ऐप चलाने वाले (28 दिन)',
    k_active_sub: 'कल {a} · 7 दिन {b}',
    k_active_in: 'भारत में ऐप चलाने वाले (28 दिन)',
    k_active_in_sub: 'कल {a} · 7 दिन {b} · सब देश {c}',
    k_new: 'नए लोग (28 दिन)',
    k_new_in: 'भारत में नए लोग (28 दिन)',
    k_new_sub: '{n} लोग दोबारा आए',
    k_wait_play: 'Google Play से आना बाकी',
    today: 'आज अब तक: {n}',
    daily_h: 'रोज़ कितने लोगों ने ऐप चलाया',
    daily_tip: '{d}: {a} लोग, {n} नए',
    dl_h: 'रोज़ के डाउनलोड (Google Play)',
    dl_tip: '{d}: {i} डाउनलोड, {u} ने हटाया',
    feat_h: 'लोग किस चीज़ पर ज़्यादा (28 दिन)',
    feat_d: 'हर लाइन: कितने लोगों ने किया, और कुल कितनी बार।',
    people: 'लोग', times: 'बार',
    all_events: 'ऐप जो कुछ गिनता है, सब',
    screens_h: 'कौन सा टैब और पेज खुला (28 दिन)',
    screens_soon: 'टैब और पेज की गिनती ऐप वर्शन 1.0.7 से होगी। तब तक "लोग किस चीज़ पर ज़्यादा" देखें।',
    views: 'बार खुला',
    crops_h: 'सबसे ज़्यादा देखी गई फ़सल (28 दिन)',
    places_h: 'लोग कहाँ से (28 दिन)',
    places_from_ip: 'भारत में, Google के अंदाज़े से (इंटरनेट कनेक्शन से) — ऐप में चुने गए ज़िले setup के दिन से यहाँ दिखेंगे।',
    outside: 'भारत के बाहर: {list}। ये ज़्यादातर आप और टेस्टर (कुवैत) और Google के अपने जाँच वाले फ़ोन हैं जो हर नया वर्शन चलाकर देखते हैं (अमेरिका, यूरोप) — किसान नहीं।',
    setup_ev: 'पहली शुरुआत और सेटिंग (भाषा, राज्य, रंग…)',
    why_h: 'भाव डाउनलोड क्यों नहीं हुए',
    where_h: 'किस राज्य में',
    why_old: 'वजह ऐप 1.0.7 से गिनी जाएगी।',
    fail_where: 'देश', fail_ver: 'ऐप वर्शन', fail_day: 'दिन',
    guide_h: '🧭 ऐप तैयार करें — गाइड (28 दिन)',
    guide_soon: 'ऐप 1.0.7 से गिना जाएगा, जब "ऐप तैयार करें" स्विच चालू हो।',
    g_shown: 'गाइड देखी', g_done: 'गाइड पूरी हुई', g_steps: 'गाइड में दबाए गए बटन',
    perm_h: 'फ़ोन में लोकेशन / सूचनाएँ',
    perm_loc: 'लोकेशन', perm_notif: 'सूचनाएँ',
    th_step: 'स्टेप', th_result: 'क्या हुआ',
    fail_note: 'भाव के लिए लोकेशन नहीं चाहिए — भाव चुने हुए राज्य से आते हैं। भारत के बाहर वाले fail आप, टेस्टर या Google के जाँच वाले फ़ोन हैं।',
    langs_h: 'ऐप की भाषा',
    ver_h: 'ऐप वर्शन',
    ver_app: 'वर्शन के हिसाब से लोग (ऐप डेटा)',
    ver_play: 'वर्शन कोड के हिसाब से फ़ोन (Play)',
    health_h: 'सेहत (28 दिन)',
    h_rating: 'Play रेटिंग',
    h_crash: 'क्रैश',
    h_anr: 'ऐप अटका (ANR)',
    h_removed: 'ऐप हटाया',
    h_errors: 'भाव डाउनलोड नहीं हुए',
    no_rating: 'अभी कोई रेटिंग नहीं',
    fills_soon: 'ये setup वाले दिन से भरना शुरू होगा (Google पीछे का नहीं गिनता)।',
    none: 'अभी कुछ नहीं।',
    setup_h: 'Setup — एक बार, करीब 10 मिनट',
    setup_d: 'ये हो जाने के बाद आँकड़े दिन में दो बार अपने आप आएँगे।',
    s_ga: 'ऐप का डेटा (Google Analytics for Firebase)',
    s_play: 'डाउनलोड (Google Play)',
    st_ok: 'चालू',
    st_wait: 'बाकी',
    m_setup: 'अभी setup नहीं हुआ।',
    sa_h: 'इस ईमेल को पहुँच दें (ये हमारा सर्वर है — सिर्फ़ पढ़ता है):',
    copy: 'कॉपी', copied: 'कॉपी हो गया',
    st1: 'Play Console → Users and permissions → Invite new users → ये ईमेल → "Account permissions" टैब → सिर्फ़ "View app information and download bulk reports (read only)"',
    st2: 'Google Analytics → Admin → Property access management (Khalihan) → + → ये ईमेल → role Editor',
    st3: 'Google Cloud: दोनों पेज पर "Enable" दबाएँ (ऊपर Khalihan प्रोजेक्ट चुना हो)',
    st4: 'Play Console → Download reports → Statistics → "Copy Cloud Storage URI" → Claude को भेजें',
    m_no_property: 'Google Analytics में Khalihan property पर service account जोड़ें (Property access management → Editor)।',
    m_api_off: 'Google Cloud में Firebase प्रोजेक्ट के लिए "Google Analytics Data API" और "Google Analytics Admin API" चालू करें।',
    m_denied: 'Service account को अभी पहुँच नहीं मिली। Play Console में invite के बाद चालू होने में एक दिन तक लग सकता है।',
    m_no_bucket: 'Play Console → Download reports → Statistics से "Cloud Storage URI" Claude को भेजें।',
    m_no_files: 'Google Play ने अभी रिपोर्ट नहीं डाली — ये 3–7 दिन देर से आती है।',
    m_error: 'पिछली बार कुछ गड़बड़ हुई ({h})। कुछ घंटे में फिर कोशिश होगी।',
    m_need_editor: 'फ़सल / ज़िला / भाषा के लिए Google Analytics में service account को Editor बनाना होगा (Viewer नहीं)।',
    privacy: 'गिनती होती है: ऐप खोलना, टैब, पेज, बटन, चुना हुआ राज्य, ज़िला, भाषा और फ़सल — नाम, फ़ोन नंबर या सही जगह कभी नहीं। जैसा प्राइवेसी पॉलिसी में लिखा है।',
    th_day: 'दिन', th_people: 'लोग', th_new: 'नए', th_dl: 'डाउनलोड', th_rm: 'हटाया',
    show_table: 'टेबल में देखें',
  },
};

// What each recorded event means (lib/services/insights.dart and the
// screens). [English, Hindi]. Unknown names show as they are.
const EVENTS = {
  crop_opened: ['Opened a crop\'s page', 'फ़सल का पेज खोला'],
  where_to_sell: ['Where to sell', 'कहाँ बेचें'],
  hold_or_sell: ['Sell now or wait', 'अभी बेचें या रुकें'],
  weather_opened: ['Weather', 'मौसम देखा'],
  weather_warn: ['Saw a weather warning', 'मौसम की चेतावनी देखी'],
  market_opened: ['Market Locator', 'मंडी लोकेटर'],
  my_mandi: ['Starred a mandi', 'मंडी को "मेरी मंडी" बनाया'],
  my_mandi_open: ['Opened my mandi', 'मेरी मंडी खोली'],
  mandi_maps: ['Mandi directions (Maps)', 'मंडी का रास्ता (मैप)'],
  price_map: ['Price map', 'भाव का नक्शा'],
  compare_opened: ['Compared crops', 'फ़सलों की तुलना'],
  shared: ['Shared prices', 'भाव शेयर किया'],
  day_voice: ['🔊 Listened to today\'s prices', '🔊 आज का भाव सुना'],
  voice_search: ['🎤 Voice search', '🎤 बोलकर खोजा'],
  crop_pinned: ['Added to my crops', 'मेरी फ़सल में जोड़ी'],
  crop_unpinned: ['Removed from my crops', 'मेरी फ़सल से हटाई'],
  category_chosen: ['Chose a crop group', 'फ़सल का समूह चुना'],
  alert_toggled: ['Price alert on / off', 'भाव अलर्ट चालू / बंद'],
  alert_opened: ['Opened the app from an alert', 'अलर्ट से ऐप खोला'],
  target_set: ['Set a target price', 'टारगेट भाव लगाया'],
  target_removed: ['Removed a target price', 'टारगेट भाव हटाया'],
  target_celebrated: ['Target price reached', 'टारगेट भाव पहुँचा'],
  brief_toggled: ['Morning brief on / off', 'सुबह की खबर चालू / बंद'],
  brief_hour: ['Changed the brief\'s time', 'सुबह की खबर का समय बदला'],
  calendar_open: ['Crop calendar', 'फ़सल कैलेंडर'],
  calendar_date: ['Set a sowing date', 'बुवाई की तारीख डाली'],
  calendar_remind: ['Calendar reminders on / off', 'कैलेंडर याद दिलाना चालू / बंद'],
  scheme_open: ['Opened a scheme', 'सरकारी योजना खोली'],
  scheme_link: ['Opened a scheme\'s link', 'योजना की लिंक खोली'],
  price_report: ['Reported a wrong price', '"भाव गलत" बताया'],
  feedback_sent: ['Sent a suggestion', 'सुझाव भेजा'],
  widget_opened: ['Opened from the home-screen widget', 'विजेट से ऐप खोला'],
  state_waiting: ['"My state isn\'t listed"', '"मेरा राज्य नहीं है"'],
  state_open_tap: ['Switched to a newly opened state', 'नया खुला राज्य चुना'],
  village_set: ['Added their village', 'गाँव जोड़ा'],
  photo: ['Profile photo', 'प्रोफ़ाइल फ़ोटो'],
  text_size: ['Changed text size', 'अक्षर का आकार बदला'],
  theme_chosen: ['Changed light / dark look', 'रंग (दिन / रात) बदला'],
  voice_speed: ['Changed the voice speed', 'आवाज़ की रफ़्तार बदली'],
  language_chosen: ['Chose a language', 'भाषा चुनी'],
  state_chosen: ['Chose a state', 'राज्य चुना'],
  district_chosen: ['Chose a district', 'ज़िला चुना'],
  update_prompt: ['Answered the update message', 'अपडेट संदेश का जवाब'],
  plus_gift: ['Used a gift code', 'गिफ़्ट कोड लगाया'],
  kendra_open: ['Khalihan Kendra', 'खलिहान केंद्र'],
  kendra_order: ['Kendra order', 'केंद्र ऑर्डर'],
  sell_offer_open: ['Opened "Sell to Khalihan"', '"खलिहान को बेचो" खोला'],
  sell_interest: ['"How much to sell?"', '"कितना बेचना है?"'],
  sell_request: ['Sell request', 'बेचने की रिक्वेस्ट'],
  login_open: ['Opened login', 'लॉगिन खोला'],
  login: ['Logged in', 'लॉगिन किया'],
  logout: ['Logged out', 'लॉगआउट किया'],
  privacy_open: ['Read the privacy policy', 'प्राइवेसी पॉलिसी पढ़ी'],
  account_restored: ['Account restored', 'अकाउंट वापस आया'],
  account_deleted: ['Deleted their account', 'अकाउंट हटाया'],
  // Recorded by Google itself
  first_open: ['Opened for the first time', 'पहली बार खोला'],
  session_start: ['Opened the app', 'ऐप खोला'],
  screen_view: ['Opened a page', 'पेज खोला'],
  user_engagement: ['Used the app', 'ऐप चलाया'],
  app_update: ['Got an update', 'ऐप अपडेट हुआ'],
  app_remove: ['Removed the app', 'ऐप हटाया'],
  app_clear_data: ['Cleared the app\'s data', 'ऐप का डेटा मिटाया'],
  os_update: ['Phone software updated', 'फ़ोन का सॉफ़्टवेयर अपडेट'],
  notification_receive: ['Got a notification', 'सूचना मिली'],
  notification_open: ['Opened a notification', 'सूचना खोली'],
  notification_dismiss: ['Swiped a notification away', 'सूचना हटाई'],
  notification_foreground: ['Notification while in the app', 'ऐप खुले में सूचना'],
  app_exception: ['App error', 'ऐप में गड़बड़ी'],
  alert_sent: ['Alert sent (by the app)', 'अलर्ट भेजा (ऐप ने)'],
  guide_shown: ['Saw the get-ready guide', 'गाइड देखी'],
  guide_step: ['Pressed a guide button', 'गाइड का बटन दबाया'],
  guide_done: ['Guide finished', 'गाइड पूरी हुई'],
  prices_loaded: ['Prices downloaded', 'भाव डाउनलोड हुए'],
  prices_failed: ['Prices failed to download', 'भाव डाउनलोड नहीं हुए'],
  where_to_sell_from: ['(where "Where to sell" was opened from)', '("कहाँ बेचें" कहाँ से खुला)'],
  login_error: ['Login error', 'लॉगिन में गड़बड़ी'],
};
// Not something a farmer chose to do: kept out of "what people use most".
const TECH = new Set(['first_open', 'session_start', 'screen_view', 'user_engagement', 'app_update', 'app_remove',
  'app_clear_data', 'os_update', 'notification_receive', 'notification_dismiss', 'notification_foreground',
  'app_exception', 'alert_sent', 'prices_loaded', 'prices_failed', 'where_to_sell_from', 'login_error',
  'firebase_campaign', 'firebase_in_app_message_impression', 'dynamic_link_first_open',
  'guide_shown', 'guide_step', 'guide_done']);

// Tabs and pages (route names in the app, v1.0.7).
const SCREENS = {
  tab_home: ['Home tab', 'होम टैब'],
  tab_prices: ['Prices tab (भाव)', 'भाव टैब'],
  tab_services: ['Services tab', 'सेवा टैब'],
  tab_profile: ['Profile tab', 'प्रोफ़ाइल टैब'],
  crop: ['A crop\'s page', 'फ़सल का पेज'],
  price_graph: ['Price graph', 'भाव का ग्राफ़'],
  where_sell: ['Where to sell', 'कहाँ बेचें'],
  hold_sell: ['Sell now or wait', 'अभी बेचें या रुकें'],
  weather: ['Weather', 'मौसम'],
  advice: ['Farm advice (weather)', 'खेती की सलाह (मौसम)'],
  market_locator: ['Market Locator', 'मंडी लोकेटर'],
  mandi: ['A mandi\'s page', 'मंडी का पेज'],
  compare: ['Compare crops', 'फ़सलों की तुलना'],
  calendar: ['Crop calendars', 'फ़सल कैलेंडर'],
  crop_calendar: ['One crop\'s calendar', 'एक फ़सल का कैलेंडर'],
  schemes: ['Schemes', 'सरकारी योजनाएँ'],
  scheme: ['One scheme', 'एक योजना'],
  price_alerts: ['My price alerts', 'मेरे भाव अलर्ट'],
  edit_profile: ['Edit profile', 'प्रोफ़ाइल बदलें'],
  about: ['About Khalihan', 'खलिहान के बारे में'],
  my_sales: ['My sales', 'मेरी बिक्री'],
  login: ['Login', 'लॉगिन'],
  onboard_state: ['First start: state', 'शुरुआत: राज्य'],
  onboard_name: ['First start: name', 'शुरुआत: नाम'],
  main: ['Started the app (after first start)', 'ऐप शुरू (पहली बार के बाद)'],
  kendra: ['Khalihan Kendra', 'खलिहान केंद्र'],
  kendra_list: ['Kendra: products', 'केंद्र: सामान'],
  kendra_product: ['Kendra: one product', 'केंद्र: एक सामान'],
  kendra_cart: ['Kendra: cart', 'केंद्र: कार्ट'],
  kendra_done: ['Kendra: order placed', 'केंद्र: ऑर्डर हुआ'],
  kendra_orders: ['Kendra: my orders', 'केंद्र: मेरे ऑर्डर'],
};
// Why prices didn't download (LiveFeed.lastMiss in the app, v1.0.7).
const WHY = {
  no_feed: ['No prices for that state on our server', 'उस राज्य के भाव हमारे सर्वर पर नहीं'],
  'fs_unavailable': ['No internet', 'इंटरनेट नहीं था'],
  'fs_deadline-exceeded': ['Internet too slow', 'इंटरनेट बहुत धीमा'],
  'fs_permission-denied': ['Refused by Firebase (App Check?)', 'Firebase ने मना किया (App Check?)'],
  empty: ['Our server\'s copy was empty', 'सर्वर की कॉपी खाली थी'],
  bad_meta: ['Our server\'s copy was incomplete', 'सर्वर की कॉपी अधूरी थी'],
  error: ['Other error', 'दूसरी गड़बड़ी'],
  err_generic: ['Older app (no reason sent)', 'पुराना ऐप (वजह नहीं भेजता)'],
};
// The guide (v1.0.7): steps, what happened, and the phone's switches.
const G_STEP = {
  prices: ['Today\'s prices', 'आज के भाव'], district: ['District', 'ज़िला'],
  location: ['Location', 'लोकेशन'], notifications: ['Notifications', 'सूचनाएँ'],
};
const G_RESULT = {
  done: ['✓ Turned on', '✓ चालू किया'], denied: ['✗ Refused', '✗ मना किया'], skipped: ['Skipped', 'छोड़ा'],
  settings: ['Sent to phone settings', 'फ़ोन की सेटिंग खोली'], retry: ['Tried prices again', 'भाव फिर से माँगे'],
  gps: ['Filled from location', 'लोकेशन से भरा'], gps_failed: ['Location didn\'t work', 'लोकेशन से नहीं हुआ'],
  manual: ['Chose it themselves', 'खुद चुना'],
};
const PERM = {
  on: ['On', 'चालू'], off: ['Off', 'बंद'], denied: ['Refused', 'मना किया'],
  denied_forever: ['Refused for good', 'हमेशा के लिए मना'],
};
// First start and settings: shown apart from what farmers use day to day.
const SETUP_EV = new Set(['language_chosen', 'state_chosen', 'district_chosen', 'theme_chosen', 'text_size', 'voice_speed',
  'photo', 'village_set', 'privacy_open', 'update_prompt', 'plus_gift', 'plus_gift_removed', 'login_open', 'login',
  'logout', 'account_restored', 'account_deleted', 'brief_hour']);
const LANGS = { en: 'English', hi: 'हिंदी', mr: 'मराठी', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', bn: 'বাংলা', ml: 'മലയാളം' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function statsPage(deps) {
  const { esc, setMain, lang, db, fail } = deps;
  const crops = deps.crops || [];
  const L = lang() === 'hi' ? 1 : 0;
  const t = (k, v) => {
    let s = (T[lang()] || T.en)[k] || T.en[k] || k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const n = (v) => (typeof v === 'number' && isFinite(v) ? v.toLocaleString('en-IN') : '—');
  const day = (d) => { // '2026-11-09' → '9 Nov'
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
    return m ? `${+m[3]} ${MONTHS[+m[2] - 1]}` : esc(d || '—');
  };
  const when = (d) => (d instanceof Date ? `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : '');

  let s = null;
  try { s = await db().ownerStats(); } catch (e) { fail(e); }
  const ga = (s && s.ga) || {};
  const play = (s && s.play) || {};
  const gaHas = ga.a28 != null;
  const playHas = play.total != null || play.now != null;

  // ── setup card: shown until both parts work ──
  // What the owner has to do for a part that isn't working yet (codes from
  // tools/owner_stats.py). An unknown code reads as "something went wrong".
  const msg = (part) => {
    if (part.ok) return '';
    const key = 'm_' + (part.msg || 'setup');
    if (key === 'm_error' || !(T.en[key])) return t('m_error', { h: part.hint || part.msg || '?' });
    return t(key);
  };
  const setupRow = (label, part) => `
    <div class="ti">
      <span class="tic ${part.ok ? 'green' : 'amber'}" aria-hidden="true">${part.ok ? '✓' : '…'}</span>
      <div class="grow"><div class="tt">${esc(label)}</div><div class="ts">${part.ok ? esc(t('st_ok')) : esc(msg(part))}</div></div>
      <span class="pill ${part.ok ? 'on' : 'warn'}">${esc(part.ok ? t('st_ok') : t('st_wait'))}</span>
    </div>`;
  const setupCard = (ga.ok && play.ok) ? '' : `
    <section class="card">
      <div class="ch"><h2>${esc(t('setup_h'))}</h2></div>
      <p class="muted small" style="margin:0 0 6px">${esc(t('setup_d'))}</p>
      <div class="todo">${setupRow(t('s_ga'), ga)}${setupRow(t('s_play'), play)}</div>
      ${ga.ok && ga.dims_note === 'need_editor' ? `<p class="note small">${esc(t('m_need_editor'))}</p>` : ''}
      ${s && s.sa ? `
        <div style="margin-top:10px;padding:12px 14px;border-radius:12px;background:var(--page)">
          <div class="small" style="font-weight:800">${esc(t('sa_h'))}</div>
          <div class="row" style="margin-top:6px;gap:10px">
            <code id="sa-mail" style="font-size:13.5px;word-break:break-all">${esc(s.sa)}</code>
            <button class="plain small" id="sa-copy">${esc(t('copy'))}</button>
          </div>
          <ol class="small" style="margin:10px 0 0 18px;padding:0;line-height:1.7">
            <li>${esc(t('st1'))} — <a href="https://play.google.com/console" target="_blank" rel="noopener">Play Console</a></li>
            <li>${esc(t('st2'))} — <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener">Google Analytics</a></li>
            <li>${esc(t('st3'))} — <a href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=${encodeURIComponent(s.project || '')}" target="_blank" rel="noopener">Data API</a> · <a href="https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com?project=${encodeURIComponent(s.project || '')}" target="_blank" rel="noopener">Admin API</a></li>
            <li>${esc(t('st4'))}</li>
          </ol>
        </div>` : ''}
    </section>`;

  // ── tiles ──
  const kpi = (label, value, sub, cls = '') => `<div class="kpi" style="cursor:default">
      <span class="kl">${esc(label)}</span><span class="kv">${value}</span><span class="kd ${cls}" style="max-width:100%">${sub || '&nbsp;'}</span></div>`;
  // Farmers are in India; the owner, testers and Google's test phones are not.
  const hasIn = gaHas && ga.in28 != null;
  const act = hasIn ? ga.in28 : ga.a28;
  const neu = hasIn ? ga.inn28 : ga.n28;
  const back = gaHas ? Math.max(0, (act || 0) - (neu || 0)) : null;
  const waitPlay = playHas ? null : esc(t('k_wait_play'));
  const tiles = `<section class="kpis">
      ${kpi(t('k_total'), n(play.total), playHas ? esc(t('k_total_sub', { n: n(play.i28) })) : waitPlay, playHas ? 'up' : '')}
      ${kpi(t('k_now'), n(play.now), playHas ? esc(t('k_now_sub', { n: n(play.u28) })) : waitPlay, play.u28 ? 'warnt' : '')}
      ${kpi(t(hasIn ? 'k_active_in' : 'k_active'), n(act), gaHas ? esc(hasIn
        ? t('k_active_in_sub', { a: n(ga.in1), b: n(ga.in7), c: n(ga.a28) })
        : t('k_active_sub', { a: n(ga.a1), b: n(ga.a7) })) : '')}
      ${kpi(t(hasIn ? 'k_new_in' : 'k_new'), n(neu), gaHas ? esc(t('k_new_sub', { n: n(back) })) : '', 'up')}
    </section>`;

  // ── bar lists ──
  const bars = (rows, opts = {}) => {
    if (!rows || !rows.length) return `<p class="muted small">${esc(opts.empty || t('none'))}</p>`;
    const max = Math.max(1, ...rows.map((r) => r.v));
    return `<div class="pipe">${rows.map((r, i) => `
      <div class="pipe-row" style="cursor:default;grid-template-columns:minmax(110px,34%) 1fr 112px" title="${esc(r.title || '')}">
        <span class="pipe-l">${esc(r.label)}</span>
        <span class="pipe-track"><span class="pipe-bar" style="width:${r.v ? Math.max(3, (r.v / max) * 100) : 0}%;background:${i === 0 ? '#20405E' : '#7590AB'}"></span></span>
        <span class="pipe-n" style="white-space:nowrap">${n(r.v)}${r.extra ? `<span class="muted small" style="font-weight:600"> · ${esc(r.extra)}</span>` : ''}</span>
      </div>`).join('')}</div>`;
  };
  const label = (map, k) => (map[k] ? map[k][L] : k);

  const BLANK = new Set(['', '(not set)', '(other)']);
  const events = (ga.events || []).filter((e) => !BLANK.has(e.k) && e.c);
  const byUse = (a, b) => (b.u || 0) - (a.u || 0) || (b.c || 0) - (a.c || 0);
  const used = events.filter((e) => !TECH.has(e.k) && !SETUP_EV.has(e.k)).sort(byUse);
  const setupUsed = events.filter((e) => SETUP_EV.has(e.k)).sort(byUse);
  const featCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('feat_h'))}</h2></div>
      <p class="muted small" style="margin:0 0 8px">${esc(t('feat_d'))}</p>
      ${bars(used.slice(0, 14).map((e) => ({ label: label(EVENTS, e.k), v: e.u || 0, extra: `${n(e.c)} ${t('times')}`, title: e.k })))}
      ${setupUsed.length ? `<details class="small" style="margin-bottom:6px"><summary>${esc(t('setup_ev'))}</summary>
        ${bars(setupUsed.map((e) => ({ label: label(EVENTS, e.k), v: e.u || 0, extra: `${n(e.c)} ${t('times')}`, title: e.k })))}</details>` : ''}
      ${events.length ? `<details class="small"><summary>${esc(t('all_events'))}</summary>
        ${table([L ? 'क्या' : 'What', t('people'), t('times'), L ? 'नाम' : 'Name'],
          events.map((e) => [label(EVENTS, e.k), n(e.u), n(e.c), e.k]))}</details>` : ''}
    </section>`;

  const screens = (ga.screens || []).filter((x) => SCREENS[x.k]).sort((a, b) => (b.v || 0) - (a.v || 0));
  const screensCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('screens_h'))}</h2></div>
      ${screens.length ? bars(screens.slice(0, 14).map((x) => ({ label: label(SCREENS, x.k), v: x.v || 0, extra: `${n(x.u)} ${t('people')}`, title: x.k })))
        : `<p class="muted small">${esc(t('screens_soon'))}</p>`}
    </section>`;

  // Mandi names ("Bengal Gram(Gram)(Whole)") → the Admin's crop words (चना).
  const cropName = (k) => {
    const lk = String(k).toLowerCase();
    const hit = crops.find((c) => [c.en, c.word, ...(c.crops || [])].some((w) =>
      new RegExp(`(^|[^a-z])${String(w).toLowerCase().replace(/[^a-z ]/g, '')}([^a-z]|$)`).test(lk)));
    return hit ? (L ? hit.hi : hit.en) : k;
  };
  const cropsCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('crops_h'))}</h2></div>
      ${bars((ga.crops || []).slice(0, 10).map((c) => ({ label: cropName(c.k), v: c.n, title: c.k })), { empty: t('fills_soon') })}
    </section>`;

  const districts = ga.districts || [];
  const abroad = (ga.countries || []).filter((c) => c.k !== 'India');
  const placesCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('places_h'))}</h2></div>
      ${districts.length
        ? bars(districts.slice(0, 10).map((d) => ({ label: d.k, v: d.n, extra: t('people') })))
        : `${bars((ga.regions || []).slice(0, 10).map((d) => ({ label: d.k, v: d.n, extra: t('people') })))}
           <p class="muted small" style="margin:6px 0 0">${esc(t('places_from_ip'))}</p>`}
      ${abroad.length ? `<p class="note small" style="margin:10px 0 0">${esc(t('outside', { list: abroad.map((c) => `${c.k} ${c.n}`).join(', ') }))}</p>` : ''}
      ${(ga.states || []).length > 1 ? `<details class="small"><summary>${L ? 'राज्य' : 'States'}</summary>
        ${table([L ? 'राज्य' : 'State', t('people')], ga.states.map((x) => [x.k, n(x.n)]))}</details>` : ''}
    </section>`;

  const langsCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('langs_h'))}</h2></div>
      ${bars((ga.langs || []).map((x) => ({ label: LANGS[x.k] || x.k, v: x.n, extra: t('people') })), { empty: t('fills_soon') })}
    </section>`;

  const verCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('ver_h'))}</h2></div>
      <div class="small muted" style="font-weight:700;margin:2px 0 6px">${esc(t('ver_app'))}</div>
      ${bars((ga.versions || []).map((x) => ({ label: x.k, v: x.n })))}
      ${(play.versions || []).length ? `<div class="small muted" style="font-weight:700;margin:12px 0 6px">${esc(t('ver_play'))}</div>
        ${bars(play.versions.map((x) => ({ label: x.k, v: x.n })))}` : ''}
    </section>`;

  const ev = (k) => { const e = events.find((x) => x.k === k); return e ? e.c : (gaHas ? 0 : null); };
  const health = [
    [t('h_rating'), play.rating != null ? `${play.rating} ★` : (playHas ? t('no_rating') : '—')],
    [t('h_crash'), n(play.crash28)],
    [t('h_anr'), n(play.anr28)],
    [t('h_removed'), n(ev('app_remove'))],
    [t('h_errors'), n(ev('prices_failed'))],
  ];
  const healthCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('health_h'))}</h2></div>
      <div class="tiles">${health.map(([l, v]) => `<div class="tile" style="background:var(--page)"><div class="tile-n" style="font-size:22px">${esc(v)}</div><div class="tile-l">${esc(l)}</div></div>`).join('')}</div>
      ${ev('prices_failed') ? `<details class="small"><summary>${esc(t('why_h'))}</summary>
        ${(ga.fail_why || []).length ? bars(ga.fail_why.map((x) => ({ label: label(WHY, x.k), v: x.n, extra: t('times'), title: x.k }))) : `<p class="muted small">${esc(t('why_old'))}</p>`}
        ${(ga.fail_state || []).length ? `<div class="small muted" style="font-weight:700;margin:8px 0 4px">${esc(t('where_h'))}</div>${bars(ga.fail_state.map((x) => ({ label: x.k, v: x.n, extra: t('times') })))}` : ''}
        ${(ga.fail_country || []).length ? `<div class="small muted" style="font-weight:700;margin:8px 0 4px">${esc(t('fail_where'))}</div>${bars(ga.fail_country.map((x) => ({ label: x.k, v: x.n, extra: `${n(x.u)} ${t('people')}` })))}` : ''}
        ${(ga.fail_version || []).length ? `<div class="small muted" style="font-weight:700;margin:8px 0 4px">${esc(t('fail_ver'))}</div>${bars(ga.fail_version.map((x) => ({ label: x.k, v: x.n, extra: `${n(x.u)} ${t('people')}` })))}` : ''}
        ${(ga.fail_days || []).length ? `<div class="small muted" style="font-weight:700;margin:8px 0 4px">${esc(t('fail_day'))}</div>${table([t('fail_day'), t('times'), t('people')], ga.fail_days.slice().reverse().map((x) => [day(`${x.k.slice(0, 4)}-${x.k.slice(4, 6)}-${x.k.slice(6)}`), n(x.n), n(x.u)]))}` : ''}
        <p class="muted small" style="margin:8px 0 0">${esc(t('fail_note'))}</p>
      </details>` : ''}
    </section>`;

  // ── the get-ready guide (v1.0.7) ──
  const evU = (k) => { const e = events.find((x) => x.k === k); return e ? e.u : 0; };
  const steps = ga.guide_steps || [];
  const permLoc = ga.perm_loc || [];
  const permNotif = ga.perm_notif || [];
  const guideAny = evU('guide_shown') || evU('guide_done') || steps.length || permLoc.length || permNotif.length;
  const guideCard = `
    <section class="card">
      <div class="ch"><h2>${esc(t('guide_h'))}</h2></div>
      ${!guideAny ? `<p class="muted small">${esc(t('guide_soon'))}</p>` : `
        <div class="tiles">
          <div class="tile" style="background:var(--page)"><div class="tile-n" style="font-size:22px">${n(evU('guide_shown'))}</div><div class="tile-l">${esc(t('g_shown'))}</div></div>
          <div class="tile" style="background:var(--page)"><div class="tile-n" style="font-size:22px">${n(evU('guide_done'))}</div><div class="tile-l">${esc(t('g_done'))}</div></div>
        </div>
        ${steps.length ? `<div class="small muted" style="font-weight:700;margin:6px 0 4px">${esc(t('g_steps'))}</div>
          ${table([t('th_step'), t('th_result'), t('times')], steps.map((x) => [label(G_STEP, x.s), label(G_RESULT, x.r), n(x.n)]))}` : ''}
        ${permLoc.length || permNotif.length ? `<div class="small muted" style="font-weight:700;margin:12px 0 4px">${esc(t('perm_h'))}</div>
          ${permLoc.length ? `<div class="small" style="font-weight:700;margin:4px 0">${esc(t('perm_loc'))}</div>${bars(permLoc.map((x) => ({ label: label(PERM, x.k), v: x.n, extra: t('people') })))}` : ''}
          ${permNotif.length ? `<div class="small" style="font-weight:700;margin:8px 0 4px">${esc(t('perm_notif'))}</div>${bars(permNotif.map((x) => ({ label: label(PERM, x.k), v: x.n, extra: t('people') })))}` : ''}` : ''}`}
    </section>`;

  // ── charts: last 14 days ──
  const gaDays = (ga.daily || []).slice(-14);
  const playDays = (play.daily || []).slice(-14);
  const dailyCard = gaDays.length ? `
    <section class="card">
      <div class="ch"><h2>${esc(t('daily_h'))}</h2>${ga.today != null ? `<span class="pill info">${esc(t('today', { n: n(ga.today) }))}</span>` : ''}</div>
      ${columnChart(gaDays.map((d) => ({ label: day(d.d).split(' ')[0], value: d.a || 0, tip: t('daily_tip', { d: day(d.d), a: d.a || 0, n: d.n || 0 }) })), { title: t('daily_h') })}
      <details class="small"><summary>${esc(t('show_table'))}</summary>
        ${table([t('th_day'), t('th_people'), t('th_new')], gaDays.slice().reverse().map((d) => [day(d.d), n(d.a), n(d.n)]))}</details>
    </section>` : '';
  const dlCard = playDays.length ? `
    <section class="card">
      <div class="ch"><h2>${esc(t('dl_h'))}</h2></div>
      ${columnChart(playDays.map((d) => ({ label: day(d.d).split(' ')[0], value: d.i || 0, tip: t('dl_tip', { d: day(d.d), i: d.i || 0, u: d.u || 0 }) })), { title: t('dl_h') })}
      <details class="small"><summary>${esc(t('show_table'))}</summary>
        ${table([t('th_day'), t('th_dl'), t('th_rm')], playDays.slice().reverse().map((d) => [day(d.d), n(d.i), n(d.u)]))}</details>
    </section>` : '';

  const stamp = [
    s && s.at ? t('updated', { t: when(s.at) }) : t('never'),
    ga.through && gaHas ? t('ga_till', { d: day(ga.through) }) : '',
    play.through ? t('play_till', { d: day(play.through) }) : '',
  ].filter(Boolean).map(esc).join(' · ');

  setMain(`
    ${db().demo ? `<p class="note">${L ? 'डेमो: ये नमूने के आँकड़े हैं, असली नहीं।' : 'Demo: sample numbers, not real ones.'}</p>` : ''}
    <div class="ph"><div class="ph-t"><h1>${esc(t('title'))}</h1><span class="pill on">${esc(t('only_you'))}</span></div></div>
    <p class="muted small" style="margin:-4px 0 12px">${stamp}<br>${esc(t('play_late'))}</p>
    ${setupCard}
    ${tiles}
    <div class="dash" style="align-items:start">
      ${dailyCard}
      ${dlCard}
      ${featCard}
      ${screensCard}
      ${cropsCard}
      ${placesCard}
      ${langsCard}
      ${verCard}
      ${healthCard}
      ${guideCard}
    </div>
    <p class="muted small" style="margin-top:14px">🔒 ${esc(t('privacy'))}</p>`);
  wireTips(document.querySelector('#main'));
  const copy = document.querySelector('#sa-copy');
  if (copy) {
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(s.sa); copy.textContent = t('copied'); } catch (_) { /* old browser: they read it off */ }
    };
  }
}
