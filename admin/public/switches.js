// Khalihan Admin — the Switches page (owner only).
//
// Owner's rule (13 Oct 2026): the app is complete, and every feature can be
// switched from here, so Khalihan opens step by step as it grows.
// Owner, 14 Oct 2026: one section per feature — click a section and its own
// switches and settings open; the Kendra is its own section with its own
// districts and location.
//
//   config/app → features.{key}          a feature ON/OFF (app reads it at start)
//   config/app → launch_states           states farmers can pick (Maharashtra always)
//   config/app → sell_districts.{State}  where Khalihan buys ("Khalihan ko becho")
//   kendra/info → districts, km, lat, lon, address   who sees the Kendra
//   kendra/home_card → on                the square card on Home
//
// In the app (v1.0.4+) Schemes and the Kendra sit inside the Services tab
// (AppConfig.featureParent). `def` = what the app does while the server has
// said nothing — must match AppConfig.featureDefaults.

import { KENDRA_WORDS } from './kendra.js';

export const SWITCH_WORDS = {
  en: {
    tab_features: 'Switches',
    sw_intro: 'A change applies the next time a farmer opens the app — no update needed. "v1.0.4+" = works on app v1.0.4 and newer.',
    sw_sections: 'Sections',
    sw_back: '← All sections',
    sw_always: 'Always on',
    sw_on: 'ON', sw_off: 'OFF',
    sw_section_off: 'This section is off — everything inside it is off in the app.',
    sw_off_confirm: 'Turn off "{s}"? Everything inside it goes off too: {k}.',
    sw_prices: 'Mandi prices',
    sw_prices_d: 'The heart of the app — always on. The pieces inside can be switched one by one.',
    sw_since: 'v{v}+',
    sw_n_of: '{a} of {b} on',
    sw_states: 'States',
    sw_states_d: 'A state ON = farmers there can pick it; prices, weather, calendar and schemes work in the whole state. Districts are chosen inside "Sell to Khalihan" and "Khalihan Kendra".',
    sw_states_sum: 'Open: {s}',
    sw_other_states: 'Other states ({n})',
    sw_refresh: '↻ Check data',
    sw_mh_locked: 'Maharashtra is always open.',
    sw_data_none: 'No prices yet',
    sw_data_ok: 'Prices: {d} · {n} rows',
    sw_data_old: 'Last prices: {d}',
    sw_app_full: 'App: ready',
    sw_app_soon: 'App: towns & map in v1.0.5',
    sw_app_basic: 'App: prices only',
    sw_state_confirm: 'Open {s}? The app has only its prices so far — no mandi distances, district map or state schemes yet. Farmers there will see prices, weather and the calendar.',
    sw_state_close: 'Close {s}? Farmers who already picked it keep it, but new farmers can\'t pick it.',
    sw_server: '🖥️ Server\'s last run: {t}',
    sw_gov_down: 'Government price API (data.gov.in): not answering ❌ — only states with a second source get fresh prices.',
    sw_gov_ok: 'Government price API (data.gov.in): working ✅',
    sw_server_none: '🖥️ The server hasn\'t reported yet.',
    sw_phone: '📱 Khalihan collector (phone): prices for {n} states ✅',
    sw_via: 'via {s}',
    sw_last_err: 'Last run: {e}',
    sw_all_on: 'All ON',
    sw_all_off: 'All OFF',
    sw_dist_loading: 'Reading the districts from the latest prices…',
    sw_dist_nodata: 'No price data for this state yet — its districts show here once prices arrive.',
    sw_dist_show: 'Show districts',
    sw_saved: 'Saved — the app picks it up at its next start',
    sw_n_dist: '{n} district(s)',
    sw_no_dist: 'no district yet',
    sw_sell_d: 'The offer card and sell requests — only in the districts below, and only for crops with a live offer (Offers tab).',
    sw_sell_dist: 'Districts where Khalihan buys',
    sw_sell_dist_d: 'Tap a district to switch buying there on or off.',
    sw_sell_none: '⚠️ No district is ON yet — no farmer will see the offer.',
    sw_kendra_d: 'Khalihan\'s seed & fertiliser shop: the shop in Services and the square card on Home. Products, orders and slides are in the Kendra tab.',
    sw_k_parent: '⚠️ The Services tab is OFF — the Kendra stays hidden until Services is ON.',
    sw_k_card: 'Square card on Home',
    sw_k_card_d: 'Offers, today\'s urea/DAP/potash, new arrivals, notices — the slides are made in Kendra tab → Home card.',
    sw_k_where: 'Who sees the shop — districts',
    sw_k_where_d: 'Farmers whose district is ON here see the Kendra.',
    sw_k_none: '⚠️ The Kendra has no district — no farmer will see it.',
    sw_k_loc: 'Location',
    sw_k_loc_d: 'Shown to farmers with "Directions". With km set, a farmer who picked their town sees the Kendra when it is within that distance by road — even across a district line.',
    sw_k_address: 'Address',
    sw_k_point: 'Map location — "lat, lon" or a Google Maps link',
    sw_k_point_bad: 'Could not read a place in India from that — paste "20.81, 75.78" or a Google Maps link.',
    sw_k_km: 'Reach by road',
    sw_k_km_0: 'Districts only',
    sw_k_map: 'Check on the map ↗',
    sw_k_save: 'Save location',
    sw_k_more: 'Shop name, phone, licence, hours → Kendra tab → Kendra',
    f_price_map: 'Price map', f_price_map_d: 'List | Map in "Where to sell?".',
    f_hold_sell: 'Sell now or wait?', f_hold_sell_d: 'What waiting costs, and the break-even price.',
    f_day_voice: 'Hear today\'s prices', f_day_voice_d: 'The Home button and the "Listen" button on the morning message.',
    f_share_picture: 'Send prices as a picture', f_share_picture_d: 'Off = Share sends a plain WhatsApp message.',
    f_alerts: 'Price alerts', f_alerts_d: 'The bell on a crop page and the "price moved / target reached" alert. Off = no bell, no alerts.',
    f_brief: 'Morning message', f_brief_d: 'The 6–8 am message with the farmer\'s crops and the weather. Off = no message, and its switch in Profile hides.',
    f_weather: 'Weather', f_weather_d: 'The weather card on Home, the weather page and the hail / storm / heat warnings.',
    f_calendar: 'Crop calendar', f_calendar_d: 'The Home button, the crop page tile, "This week on the farm" and the weekly field reminder.',
    f_services: 'Services tab', f_services_d: 'The Services tab in the bottom bar. Off = the tab hides, and the schemes and the Kendra with it.',
    f_schemes: 'Government schemes', f_schemes_d: 'The schemes card in Services.',
    f_sell: 'Sell to Khalihan', f_sell_d: 'The offer card and sell requests.',
    f_login: 'Mobile OTP login', f_login_d: '"My account" and an OTP before selling. Every SMS costs money (about ₹6) — before turning it on, finish part D of the admin README (Blaze, Phone sign-in, SHA).',
    f_feedback: 'Suggestions', f_feedback_d: '"सुझाव दें" in Profile and Services.',
  },
  hi: {
    tab_features: 'स्विच',
    sw_intro: 'बदलाव किसान के अगली बार ऐप खोलने पर लागू — अपडेट की ज़रूरत नहीं। "v1.0.4+" = v1.0.4 और नए ऐप में चलता है।',
    sw_sections: 'हिस्से',
    sw_back: '← सारे हिस्से',
    sw_always: 'हमेशा चालू',
    sw_on: 'चालू', sw_off: 'बंद',
    sw_section_off: 'ये हिस्सा बंद है — इसके अंदर का सब कुछ ऐप में बंद है।',
    sw_off_confirm: '"{s}" बंद करें? इसके अंदर का सब भी बंद होगा: {k}।',
    sw_prices: 'मंडी भाव',
    sw_prices_d: 'ऐप का दिल — हमेशा चालू। अंदर के हिस्से एक-एक करके बंद हो सकते हैं।',
    sw_since: 'v{v}+',
    sw_n_of: '{b} में से {a} चालू',
    sw_states: 'राज्य',
    sw_states_d: 'राज्य चालू = वहाँ के किसान उसे चुन सकते हैं; भाव, मौसम, कैलेंडर और योजनाएँ पूरे राज्य में। ज़िले "Khalihan को बेचें" और "Khalihan Kendra" के अंदर चुने जाते हैं।',
    sw_states_sum: 'खुले: {s}',
    sw_other_states: 'बाकी राज्य ({n})',
    sw_refresh: '↻ डेटा जाँचें',
    sw_mh_locked: 'महाराष्ट्र हमेशा खुला है।',
    sw_data_none: 'अभी भाव नहीं',
    sw_data_ok: 'भाव: {d} · {n} लाइनें',
    sw_data_old: 'आख़िरी भाव: {d}',
    sw_app_full: 'ऐप: तैयार',
    sw_app_soon: 'ऐप: मंडी व नक्शा v1.0.5 में',
    sw_app_basic: 'ऐप: सिर्फ़ भाव',
    sw_state_confirm: '{s} खोलें? ऐप में अभी इसके सिर्फ़ भाव हैं — मंडी की दूरी, ज़िलों का नक्शा और राज्य की योजनाएँ नहीं। वहाँ के किसानों को भाव, मौसम और कैलेंडर दिखेंगे।',
    sw_state_close: '{s} बंद करें? जिन किसानों ने चुन लिया है उनके पास रहेगा, नए किसान नहीं चुन पाएँगे।',
    sw_server: '🖥️ सर्वर की आख़िरी बार: {t}',
    sw_gov_down: 'सरकारी भाव API (data.gov.in): जवाब नहीं दे रहा ❌ — ताज़ा भाव सिर्फ़ उन राज्यों के जिनका दूसरा स्रोत है।',
    sw_gov_ok: 'सरकारी भाव API (data.gov.in): चल रहा है ✅',
    sw_server_none: '🖥️ सर्वर ने अभी रिपोर्ट नहीं दी।',
    sw_phone: '📱 खलिहान कलेक्टर (फ़ोन): {n} राज्यों के भाव ✅',
    sw_via: '{s} से',
    sw_last_err: 'पिछली बार: {e}',
    sw_all_on: 'सब चालू',
    sw_all_off: 'सब बंद',
    sw_dist_loading: 'ताज़ा भाव से ज़िले पढ़ रहे हैं…',
    sw_dist_nodata: 'इस राज्य का अभी भाव नहीं आया — भाव आते ही ज़िले यहाँ दिखेंगे।',
    sw_dist_show: 'ज़िले दिखाएँ',
    sw_saved: 'सेव हो गया — ऐप अगली बार खुलने पर ले लेगा',
    sw_n_dist: '{n} ज़िले',
    sw_no_dist: 'अभी कोई ज़िला नहीं',
    sw_sell_d: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट — सिर्फ़ नीचे के ज़िलों में, और सिर्फ़ उन फ़सलों के लिए जिनका ऑफ़र चालू है (ऑफ़र टैब)।',
    sw_sell_dist: 'ज़िले जहाँ Khalihan ख़रीदता है',
    sw_sell_dist_d: 'किसी ज़िले पर टैप करके वहाँ ख़रीद चालू/बंद करें।',
    sw_sell_none: '⚠️ अभी कोई ज़िला चालू नहीं — किसी किसान को ऑफ़र नहीं दिखेगा।',
    sw_kendra_d: 'Khalihan की बीज-खाद की दुकान: Services में दुकान और Home पर square card। माल, ऑर्डर और slides Kendra टैब में।',
    sw_k_parent: '⚠️ Services टैब बंद है — जब तक Services चालू नहीं, Kendra छिपा रहेगा।',
    sw_k_card: 'Home पर square card',
    sw_k_card_d: 'ऑफ़र, आज का यूरिया/DAP/पोटाश, नया माल, सूचना — slides Kendra टैब → Home card में बनती हैं।',
    sw_k_where: 'दुकान किसे दिखे — ज़िले',
    sw_k_where_d: 'जिन किसानों का ज़िला यहाँ चालू है, उन्हें Kendra दिखेगा।',
    sw_k_none: '⚠️ Kendra का कोई ज़िला नहीं — किसी किसान को नहीं दिखेगा।',
    sw_k_loc: 'जगह',
    sw_k_loc_d: 'किसानों को "रास्ता" बटन के साथ दिखती है। km भरने पर, जिस किसान ने अपना गाँव चुना है उसे Kendra तब दिखेगा जब सड़क से उतनी दूरी में हो — ज़िले की सीमा के पार भी।',
    sw_k_address: 'पता',
    sw_k_point: 'नक्शे पर जगह — "lat, lon" या Google Maps का लिंक',
    sw_k_point_bad: 'इससे भारत की कोई जगह नहीं पढ़ पाए — "20.81, 75.78" या Google Maps का लिंक डालें।',
    sw_k_km: 'सड़क से पहुँच',
    sw_k_km_0: 'सिर्फ़ ज़िले',
    sw_k_map: 'नक्शे पर देखें ↗',
    sw_k_save: 'जगह सेव करें',
    sw_k_more: 'दुकान का नाम, फ़ोन, लाइसेंस, समय → Kendra टैब → Kendra',
    f_price_map: 'भाव का नक्शा', f_price_map_d: '"कहाँ बेचें?" में सूची | नक्शा।',
    f_hold_sell: 'अभी बेचें या रुकें?', f_hold_sell_d: 'रुकने का ख़र्च और ब्रेक-ईवन भाव।',
    f_day_voice: 'आज का भाव सुनें', f_day_voice_d: 'Home का बटन और सुबह के मैसेज का "सुनें" बटन।',
    f_share_picture: 'भाव की फ़ोटो भेजें', f_share_picture_d: 'बंद = Share सीधे WhatsApp मैसेज भेजेगा।',
    f_alerts: 'भाव अलर्ट', f_alerts_d: 'फ़सल पेज की घंटी और "भाव बदला / टारगेट पूरा" अलर्ट। बंद = न घंटी, न अलर्ट।',
    f_brief: 'सुबह का मैसेज', f_brief_d: 'सुबह 6–8 बजे किसान की फ़सलों और मौसम वाला मैसेज। बंद = मैसेज नहीं, और Profile में उसका स्विच भी छिप जाएगा।',
    f_weather: 'मौसम', f_weather_d: 'Home का मौसम कार्ड, मौसम पेज और ओले / तूफ़ान / लू की चेतावनी।',
    f_calendar: 'फ़सल कैलेंडर', f_calendar_d: 'Home का बटन, फ़सल पेज की टाइल, "इस हफ़्ते खेत में" और हफ़्ते का खेत रिमाइंडर।',
    f_services: 'Services टैब', f_services_d: 'नीचे की पट्टी का Services टैब। बंद = टैब छिप जाएगा, और योजनाएँ व Kendra भी।',
    f_schemes: 'सरकारी योजनाएँ', f_schemes_d: 'Services में योजनाओं का कार्ड।',
    f_sell: 'Khalihan को बेचें', f_sell_d: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट।',
    f_login: 'मोबाइल OTP लॉग इन', f_login_d: '"मेरा खाता" और बेचने से पहले OTP। हर SMS का पैसा लगता है (लगभग ₹6) — चालू करने से पहले admin README का भाग D पूरा करें (Blaze, Phone sign-in, SHA)।',
    f_feedback: 'सुझाव', f_feedback_d: 'Profile और Services में "सुझाव दें"।',
  },
};
SWITCH_WORDS.en.f_kendra = KENDRA_WORDS.en.feat_kendra;
SWITCH_WORDS.hi.f_kendra = KENDRA_WORDS.hi.feat_kendra;

/** Every switch the app reads: its default and the first app version that reads it. */
export const FEATURE_INFO = {
  price_map: { def: true, since: '1.0.3' },
  hold_sell: { def: true, since: '1.0.3' },
  day_voice: { def: true, since: '1.0.3' },
  share_picture: { def: true, since: '1.0.3' },
  alerts: { def: true, since: '1.0.4' },
  brief: { def: true, since: '1.0.4' },
  weather: { def: true, since: '1.0.4' },
  calendar: { def: true, since: '1.0.3' },
  services: { def: true, since: '1.0.4' },
  schemes: { def: true, since: '1.0.3' },
  kendra: { def: false, since: '1.0.4' },
  sell: { def: false, since: '1.0.3' },
  login: { def: false, since: '1.0.3' },
  feedback: { def: true, since: '1.0.4' },
};

/** The sections, in order. `kind` picks a special settings panel. */
const SECTIONS = [
  { id: 'states', icon: '📍', kind: 'states' },
  { id: 'prices', icon: '📈', master: null, kids: ['price_map', 'hold_sell', 'day_voice', 'share_picture', 'alerts', 'brief'] },
  { id: 'weather', icon: '🌦️', master: 'weather', kids: [] },
  { id: 'calendar', icon: '🌱', master: 'calendar', kids: [] },
  { id: 'services', icon: '🏛️', master: 'services', kids: ['schemes'] },
  { id: 'kendra', icon: '🏪', master: 'kendra', kind: 'kendra' },
  { id: 'sell', icon: '🤝', master: 'sell', kind: 'sell' },
  { id: 'login', icon: '👤', master: 'login', kids: [] },
  { id: 'feedback', icon: '💬', master: 'feedback', kids: [] },
];

/** States as the government price data names them (same list as the app). */
export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'NCT of Delhi', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
const STATE_HI = {
  'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश', Assam: 'असम', Bihar: 'बिहार',
  Chandigarh: 'चंडीगढ़', Chhattisgarh: 'छत्तीसगढ़', Goa: 'गोवा', Gujarat: 'गुजरात', Haryana: 'हरियाणा',
  'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jammu and Kashmir': 'जम्मू और कश्मीर', Jharkhand: 'झारखंड',
  Karnataka: 'कर्नाटक', Kerala: 'केरल', 'Madhya Pradesh': 'मध्य प्रदेश', Maharashtra: 'महाराष्ट्र',
  Manipur: 'मणिपुर', Meghalaya: 'मेघालय', Mizoram: 'मिज़ोरम', Nagaland: 'नागालैंड', 'NCT of Delhi': 'दिल्ली',
  Odisha: 'ओडिशा', Punjab: 'पंजाब', Rajasthan: 'राजस्थान', Sikkim: 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु',
  Telangana: 'तेलंगाना', Tripura: 'त्रिपुरा', 'Uttar Pradesh': 'उत्तर प्रदेश', Uttarakhand: 'उत्तराखंड',
  'West Bengal': 'पश्चिम बंगाल',
};

/** How much of a state the app knows beyond its prices (mandi towns, map, schemes). */
const APP_READY = { Maharashtra: 'full', 'Madhya Pradesh': 'soon' };

/** Maharashtra's districts, with the keys the app uses (lib/data/mandi_places.dart). */
const MH_DISTRICTS = [
  ['ahmednagar', 'Ahmednagar (Ahilyanagar)'], ['akola', 'Akola'], ['amravati', 'Amravati'],
  ['aurangabad', 'Aurangabad (Chh. Sambhajinagar)'], ['beed', 'Beed'], ['bhandara', 'Bhandara'],
  ['buldhana', 'Buldhana'], ['chandrapur', 'Chandrapur'], ['dhule', 'Dhule'], ['gadchiroli', 'Gadchiroli'],
  ['gondia', 'Gondia'], ['hingoli', 'Hingoli'], ['jalgaon', 'Jalgaon'], ['jalna', 'Jalna'],
  ['kolhapur', 'Kolhapur'], ['latur', 'Latur'], ['mumbai', 'Mumbai'], ['nagpur', 'Nagpur'], ['nanded', 'Nanded'],
  ['nandurbar', 'Nandurbar'], ['nashik', 'Nashik'], ['osmanabad', 'Osmanabad (Dharashiv)'], ['palghar', 'Palghar'],
  ['parbhani', 'Parbhani'], ['pune', 'Pune'], ['raigad', 'Raigad'], ['ratnagiri', 'Ratnagiri'], ['sangli', 'Sangli'],
  ['satara', 'Satara'], ['sindhudurg', 'Sindhudurg'], ['solapur', 'Solapur'], ['thane', 'Thane'],
  ['wardha', 'Wardha'], ['washim', 'Washim'], ['yavatmal', 'Yavatmal'],
];

const SOURCE_NAME = { 'data.gov.in': 'data.gov.in', msamb: 'MSAMB', enam: 'eNAM', phone: 'data.gov.in · 📱' };
const KM_CHOICES = [0, 10, 15, 25, 40, 60];

/** The server's document name for a state ("NCT of Delhi" → "nct_of_delhi"). */
export const stateSlug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

/** A district name from the price data → the key the app compares
 *  (MandiGeo.districtKey without Maharashtra's spelling table). */
export const districtKey = (d) => String(d).replace(/\([^)]*\)/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** "20.81, 75.78" or a Google Maps link → {lat, lon} inside India, else null. */
export function parsePoint(text) {
  const t = String(text || '').trim();
  const m = t.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
    || t.match(/[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i)
    || t.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    || t.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{2,3}(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const lat = Number(m[1]), lon = Number(m[2]);
  if (!(lat > 6 && lat < 38 && lon > 68 && lon < 98)) return null;
  return { lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5 };
}

export function createSwitches(c) {
  const { tr, esc, toast, fail, setMain } = c;
  const memo = { status: null, server: null, districts: {}, openStates: new Set(['Maharashtra']), sel: null, moreOpen: false };
  let data = null; // { features, launch, sell, kinfo, kcard }

  const wide = () => window.matchMedia('(min-width: 900px)').matches;
  const featOn = (key) => (typeof data.features[key] === 'boolean' ? data.features[key] : FEATURE_INFO[key].def);
  const stateName = (s) => (c.lang() === 'hi' && STATE_HI[s] ? STATE_HI[s] : s);
  const sinceChip = (key) => (FEATURE_INFO[key].since === '1.0.3' ? '' : `<span class="chip swver">${tr('sw_since', { v: FEATURE_INFO[key].since })}</span>`);
  const shortDay = (d) => d.toLocaleDateString(c.lang() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  const openStates = () => ['Maharashtra', ...STATES.filter((s) => s !== 'Maharashtra' && data.launch.includes(s))];
  const kendraDistricts = () => (Array.isArray(data.kinfo.districts) ? data.kinfo.districts : (Object.keys(data.kinfo).length ? ['jalgaon'] : []));
  const nameOfDistrict = (k) => {
    const mh = MH_DISTRICTS.find(([key]) => key === k);
    if (mh) return mh[1].replace(/ \(.*\)$/, '');
    for (const list of Object.values(memo.districts)) {
      const hit = (list || []).find(([key]) => key === k);
      if (hit) return hit[1];
    }
    return k.charAt(0).toUpperCase() + k.slice(1);
  };
  const toggle = (attr, key, on, extra = '') =>
    `<button class="kswitch${on ? ' on' : ''}" ${attr}="${esc(key)}" aria-pressed="${on}" ${extra}><span class="knob"></span>${on ? tr('sw_on') : tr('sw_off')}</button>`;

  // ── the list of sections ──────────────────────────────────────────────
  function sectionTitle(s) {
    if (s.kind === 'states') return tr('sw_states');
    return s.master ? tr('f_' + s.master) : tr('sw_prices');
  }

  /** One line under a section's name: what is on. */
  function summary(s) {
    if (s.kind === 'states') {
      const list = openStates().map(stateName).join(', ');
      return esc(tr('sw_states_sum', { s: list }));
    }
    if (!s.master) {
      const on = s.kids.filter(featOn).length;
      return esc(tr('sw_n_of', { a: on, b: s.kids.length }));
    }
    if (s.kind === 'kendra') {
      const n = kendraDistricts().length;
      const km = Number(data.kinfo.km) || 0;
      return esc([n ? tr('sw_n_dist', { n }) : tr('sw_no_dist'), km ? `${km} km` : ''].filter(Boolean).join(' · '));
    }
    if (s.kind === 'sell') {
      const n = Object.values(data.sell).reduce((a, l) => a + (l || []).length, 0);
      return esc(n ? tr('sw_n_dist', { n }) : tr('sw_no_dist'));
    }
    if (s.kids && s.kids.length) return esc(s.kids.map((k) => `${tr('f_' + k)}: ${featOn(k) ? tr('sw_on') : tr('sw_off')}`).join(' · '));
    return esc(tr('f_' + s.master + '_d')).slice(0, 90);
  }

  function statePill(s) {
    if (s.kind === 'states') return `<span class="pill info">${openStates().length}</span>`;
    if (!s.master) return `<span class="pill on">${tr('sw_always')}</span>`;
    const on = featOn(s.master) && (s.id !== 'kendra' || featOn('services'));
    const warn = on && ((s.kind === 'kendra' && !kendraDistricts().length && !Number(data.kinfo.km))
      || (s.kind === 'sell' && !Object.values(data.sell).some((l) => (l || []).length)));
    return `<span class="pill ${on ? (warn ? 'warn' : 'on') : 'off'}">${on ? (warn ? '⚠️ ' : '') + tr('sw_on') : tr('sw_off')}</span>`;
  }

  function listHtml() {
    return `<nav class="swlist" aria-label="${esc(tr('sw_sections'))}">
      ${SECTIONS.map((s) => `<button class="swrow${memo.sel === s.id ? ' sel' : ''}" data-sec="${s.id}">
        <span class="swicon" aria-hidden="true">${s.icon}</span>
        <span class="grow"><span class="swrt">${esc(sectionTitle(s))}</span><span class="swrs">${summary(s)}</span></span>
        ${statePill(s)}<span class="chev" aria-hidden="true">›</span>
      </button>`).join('')}
    </nav>`;
  }

  // ── settings of one section ───────────────────────────────────────────
  function head(s, desc) {
    const master = s.master ? toggle('data-master', s.master, featOn(s.master)) : `<span class="pill on">${tr('sw_always')}</span>`;
    return `<div class="swdh">
      <span class="swicon big" aria-hidden="true">${s.icon}</span>
      <div class="grow"><h2>${esc(sectionTitle(s))} ${s.master ? sinceChip(s.master) : ''}</h2><p class="sub">${esc(desc)}</p></div>
      ${s.kind === 'states' ? '' : master}
    </div>`;
  }

  function kidRow(key, sectionOn) {
    const on = featOn(key);
    return `<label class="swkid${sectionOn ? '' : ' dim'}">
      <input type="checkbox" data-feature="${key}" ${on ? 'checked' : ''} ${sectionOn ? '' : 'disabled'}>
      <div class="grow"><div class="swkt">${esc(tr('f_' + key))} ${sinceChip(key)}</div><div class="sub">${esc(tr('f_' + key + '_d'))}</div></div>
    </label>`;
  }

  function featureDetail(s) {
    const masterOn = s.master ? featOn(s.master) : true;
    const desc = s.master ? tr('f_' + s.master + '_d') : tr('sw_prices_d');
    return `${head(s, desc)}
      ${s.kids.length ? `<div class="swblock">
        ${masterOn ? '' : `<p class="small muted">${tr('sw_section_off')}</p>`}
        ${s.kids.map((k) => kidRow(k, masterOn)).join('')}
      </div>` : ''}`;
  }

  // ── States ──
  function statusChip(state) {
    const st = memo.status && memo.status[state];
    if (!st || !st.rows) return `<span class="chip swdata none">${tr('sw_data_none')}</span>`;
    const fresh = st.at instanceof Date && Date.now() - st.at.getTime() < 36 * 3600e3;
    const day = st.at instanceof Date ? shortDay(st.at) : '—';
    return fresh
      ? `<span class="chip swdata ok">${tr('sw_data_ok', { d: day, n: Number(st.rows).toLocaleString('en-IN') })}</span>`
      : `<span class="chip swdata old">${tr('sw_data_old', { d: day })}</span>`;
  }
  const serverRun = (state) => (memo.server && memo.server.states ? memo.server.states[state] : null);
  function sourceChip(state) {
    const run = serverRun(state);
    return run && run.rows && run.source ? `<span class="chip swsrc">${tr('sw_via', { s: SOURCE_NAME[run.source] || run.source })}</span>` : '';
  }
  function lastError(state) {
    const run = serverRun(state);
    if (!run || run.rows || !run.error) return '';
    return `<div class="small swerr">${esc(tr('sw_last_err', { e: run.error }))}</div>`;
  }
  function appChip(state) {
    const r = APP_READY[state];
    return `<span class="chip swapp ${r || 'basic'}">${tr(r === 'full' ? 'sw_app_full' : r === 'soon' ? 'sw_app_soon' : 'sw_app_basic')}</span>`;
  }
  function serverLine() {
    const sv = memo.server;
    if (!sv) return `<p class="small muted">${tr('sw_server_none')}</p>`;
    const t = sv.at instanceof Date ? sv.at.toLocaleString(c.lang() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—';
    const phone = sv.phone_states > 0 ? `<br>${esc(tr('sw_phone', { n: sv.phone_states }))}` : '';
    return `<div class="swserver ${sv.gov_api_down && !phone ? 'down' : 'up'}"><b>${esc(tr('sw_server', { t }))}</b><br>${tr(sv.gov_api_down ? 'sw_gov_down' : 'sw_gov_ok')}${phone}</div>`;
  }
  function stateRow(state, open) {
    const mh = state === 'Maharashtra';
    return `<div class="swstate${open ? ' on' : ''}">
      <button class="kswitch small${open ? ' on' : ''}" data-state="${esc(state)}" aria-pressed="${open}" aria-label="${esc(stateName(state))}" ${mh ? `disabled title="${esc(tr('sw_mh_locked'))}"` : ''}><span class="knob"></span></button>
      <div class="grow"><div class="swkt">${esc(stateName(state))}</div>
        <div class="row swchips">${statusChip(state)} ${sourceChip(state)} ${appChip(state)}</div>
        ${open ? lastError(state) : ''}</div>
    </div>`;
  }
  function statesDetail(s) {
    const open = openStates();
    const rest = STATES.filter((x) => !open.includes(x));
    return `${head(s, tr('sw_states_d'))}
      <div class="swblock">
        <div class="row between" style="margin-bottom:8px">${serverLine()}</div>
        <div class="row" style="justify-content:flex-end;margin:-4px 0 6px"><button class="plain small" id="sw-refresh">${tr('sw_refresh')}</button></div>
        ${open.map((x) => stateRow(x, true)).join('')}
        <details class="swmore"${memo.moreOpen ? ' open' : ''}><summary>${tr('sw_other_states', { n: rest.length })}</summary>
          ${rest.map((x) => stateRow(x, false)).join('')}
        </details>
      </div>`;
  }

  // ── district chips, used by Sell (per state) and by the Kendra ──
  function districtChips(scope, state, onSet) {
    const list = state === 'Maharashtra' ? MH_DISTRICTS : memo.districts[state];
    const header = `<div class="row between swdsh"><b>${esc(stateName(state))}</b>
      ${list && list.length ? `<span class="row" style="gap:6px">
        <button class="plain small" data-dall="${scope}" data-dstate="${esc(state)}" data-v="1">${tr('sw_all_on')}</button>
        <button class="plain small" data-dall="${scope}" data-dstate="${esc(state)}" data-v="0">${tr('sw_all_off')}</button></span>` : ''}</div>`;
    if (state !== 'Maharashtra' && !memo.openStates.has(state)) {
      return `${header}<button class="plain small" data-dload="${esc(state)}">${tr('sw_dist_show')}</button>`;
    }
    if (list === undefined) return `${header}<p class="small muted">${tr('sw_dist_loading')}</p>`;
    if (!list.length) return `${header}<p class="small muted">${tr('sw_dist_nodata')}</p>`;
    return `${header}<div class="dchips">${list.map(([k, name]) =>
      `<button class="dchip${onSet.has(k) ? ' on' : ''}" data-dscope="${scope}" data-dstate="${esc(state)}" data-d="${esc(k)}" aria-pressed="${onSet.has(k)}">${onSet.has(k) ? '✓ ' : ''}${esc(name)}</button>`).join('')}</div>`;
  }

  // ── Sell to Khalihan ──
  function sellDetail(s) {
    const any = Object.values(data.sell).some((l) => (l || []).length);
    return `${head(s, tr('sw_sell_d'))}
      <div class="swblock">
        <h3>${tr('sw_sell_dist')}</h3>
        <p class="small muted">${tr('sw_sell_dist_d')}</p>
        ${any ? '' : `<p class="small swnote warn">${tr('sw_sell_none')}</p>`}
        ${openStates().map((st) => `<div class="swdgroup">${districtChips('sell', st, new Set(data.sell[st] || []))}</div>`).join('')}
      </div>`;
  }

  // ── Khalihan Kendra ──
  function kendraDetail(s) {
    const k = data.kinfo;
    const kd = new Set(kendraDistricts());
    const km = Number(k.km) || 0;
    const point = k.lat != null && k.lon != null ? `${k.lat}, ${k.lon}` : '';
    const mapUrl = point ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}` : '';
    return `${head(s, tr('sw_kendra_d'))}
      ${featOn('services') ? '' : `<p class="note">${tr('sw_k_parent')}</p>`}
      <div class="swblock">
        <div class="swline">
          <div class="grow"><div class="swkt">${tr('sw_k_card')}</div><div class="sub">${tr('sw_k_card_d')}</div></div>
          ${toggle('data-kcard', 'on', data.kcard.on === true)}
        </div>
      </div>
      <div class="swblock">
        <h3>${tr('sw_k_where')}</h3>
        <p class="small muted">${tr('sw_k_where_d')}</p>
        ${kd.size || km ? '' : `<p class="small swnote warn">${tr('sw_k_none')}</p>`}
        ${openStates().map((st) => `<div class="swdgroup">${districtChips('kendra', st, kd)}</div>`).join('')}
      </div>
      <div class="swblock">
        <h3>${tr('sw_k_loc')}</h3>
        <p class="small muted">${tr('sw_k_loc_d')}</p>
        <div class="form">
          <div class="wide"><label for="kl-address">${tr('sw_k_address')}</label><input id="kl-address" maxlength="120" value="${esc(k.address || '')}"></div>
          <div class="wide"><label for="kl-point">${tr('sw_k_point')}</label><input id="kl-point" value="${esc(point)}" placeholder="20.81, 75.78"></div>
          <div><label for="kl-km">${tr('sw_k_km')}</label><select id="kl-km">${KM_CHOICES.map((n) => `<option value="${n}" ${n === km ? 'selected' : ''}>${n ? `${n} km` : tr('sw_k_km_0')}</option>`).join('')}${KM_CHOICES.includes(km) ? '' : `<option value="${km}" selected>${km} km</option>`}</select></div>
        </div>
        <div class="actions"><button class="main" id="kl-save">${tr('sw_k_save')}</button>${mapUrl ? `<a class="btnlink" href="${mapUrl}" target="_blank" rel="noopener">${tr('sw_k_map')}</a>` : ''}</div>
      </div>
      <p class="small muted">${tr('sw_k_more')}</p>`;
  }

  function detailHtml() {
    const s = SECTIONS.find((x) => x.id === memo.sel) || SECTIONS[0];
    const body = s.kind === 'states' ? statesDetail(s) : s.kind === 'kendra' ? kendraDetail(s) : s.kind === 'sell' ? sellDetail(s) : featureDetail(s);
    return `<section class="card swdetail">${wide() ? '' : `<button class="plain small swback" id="sw-back">${tr('sw_back')}</button>`}${body}</section>`;
  }

  // ── loading ───────────────────────────────────────────────────────────
  async function loadStatus(force) {
    if (memo.status && !force) return;
    const [live, server] = await Promise.all([
      c.db().liveStatus(STATES.map((s) => [s, stateSlug(s)])).catch((e) => { console.warn(e); return {}; }),
      (c.db().serverStatus ? c.db().serverStatus() : Promise.resolve(null)).catch(() => null),
    ]);
    memo.status = live;
    memo.server = server;
  }

  async function loadDistricts(state) {
    if (state === 'Maharashtra' || memo.districts[state] !== undefined) return;
    try {
      const names = await c.db().liveDistricts(stateSlug(state));
      const seen = new Map();
      for (const n of names) {
        const k = districtKey(n);
        if (k && !seen.has(k)) seen.set(k, n.replace(/\s+/g, ' ').trim());
      }
      memo.districts[state] = [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    } catch (e) {
      console.warn(e);
      memo.districts[state] = [];
    }
  }

  async function load() {
    const [cfg, kinfo, kcard] = await Promise.all([
      c.db().appConfig(),
      c.db().kendraInfo().catch(() => ({})),
      c.db().kendraCard().catch(() => ({ on: false, secs: 4, slides: [] })),
      loadStatus(false),
    ]);
    data = { features: cfg.features || {}, launch: cfg.launch_states || [], sell: cfg.sell_districts || {}, kinfo: kinfo || {}, kcard };
  }

  function render() {
    if (!memo.sel && wide()) memo.sel = 'states';
    const showList = wide() || !memo.sel;
    const scrollY = window.scrollY;
    setMain(`
      <h1>${tr('tab_features')}</h1>
      <p class="muted">${tr('sw_intro')}</p>
      <div class="swlayout${memo.sel ? ' has-sel' : ''}">
        ${showList ? listHtml() : ''}
        ${memo.sel ? detailHtml() : ''}
      </div>`);
    window.scrollTo(0, scrollY);
    wire();
  }

  async function page() {
    await load();
    render();
  }

  async function refresh() {
    await load();
    render();
  }

  // ── actions ───────────────────────────────────────────────────────────
  function wire() {
    const $$ = (sel) => document.querySelectorAll(sel);

    $$('[data-sec]').forEach((b) => {
      b.onclick = () => {
        memo.sel = b.dataset.sec;
        render();
        if (!wide()) window.scrollTo(0, 0);
      };
    });
    const back = document.getElementById('sw-back');
    if (back) back.onclick = () => { memo.sel = null; render(); };

    $$('[data-master]').forEach((b) => {
      b.onclick = async () => {
        const key = b.dataset.master;
        const next = !featOn(key);
        const sec = SECTIONS.find((s) => s.master === key);
        const inside = [...((sec && sec.kids) || []), ...(key === 'services' ? ['kendra'] : [])];
        if (!next && inside.length && !confirm(tr('sw_off_confirm', { s: tr('f_' + key), k: inside.map((k) => tr('f_' + k)).join(', ') }))) return;
        b.disabled = true;
        try { await c.db().setFeature(key, next); toast(`${tr('f_' + key)}: ${next ? tr('sw_on') : tr('sw_off')}`); await refresh(); } catch (e) { b.disabled = false; fail(e); }
      };
    });

    $$('[data-feature]').forEach((box) => {
      box.onchange = async () => {
        const key = box.dataset.feature;
        try { await c.db().setFeature(key, box.checked); toast(`${tr('f_' + key)}: ${box.checked ? tr('sw_on') : tr('sw_off')}`); await refresh(); } catch (e) { box.checked = !box.checked; fail(e); }
      };
    });

    $$('[data-state]').forEach((b) => {
      b.onclick = async () => {
        const state = b.dataset.state;
        if (state === 'Maharashtra') return;
        const isOpen = data.launch.includes(state);
        if (!isOpen && APP_READY[state] !== 'full' && !confirm(tr('sw_state_confirm', { s: stateName(state) }))) return;
        if (isOpen && !confirm(tr('sw_state_close', { s: stateName(state) }))) return;
        const others = data.launch.filter((s) => s !== 'Maharashtra' && s !== state);
        const next = isOpen ? others : [...others, state];
        b.disabled = true;
        try { await c.db().setLaunchStates(['Maharashtra', ...next]); toast(tr('sw_saved')); await refresh(); } catch (e) { b.disabled = false; fail(e); }
      };
    });

    $$('[data-dload]').forEach((b) => {
      b.onclick = async () => {
        const state = b.dataset.dload;
        memo.openStates.add(state);
        render();
        await loadDistricts(state);
        render();
      };
    });

    const saveScope = async (scope, state, keys) => {
      try {
        if (scope === 'sell') await c.db().setSellDistricts(state, keys);
        else await c.db().saveKendraInfo({ districts: keys });
        toast(tr('sw_saved'));
        await refresh();
      } catch (e) { fail(e); }
    };
    const listOf = (state) => (state === 'Maharashtra' ? MH_DISTRICTS : (memo.districts[state] || [])).map(([k]) => k);

    $$('[data-d]').forEach((b) => {
      b.onclick = () => {
        const { dscope: scope, dstate: state, d } = b.dataset;
        b.disabled = true;
        if (scope === 'sell') {
          const cur = new Set(data.sell[state] || []);
          if (cur.has(d)) cur.delete(d); else cur.add(d);
          saveScope('sell', state, [...cur].sort());
        } else {
          const cur = new Set(kendraDistricts());
          if (cur.has(d)) cur.delete(d); else cur.add(d);
          saveScope('kendra', state, [...cur].sort());
        }
      };
    });
    $$('[data-dall]').forEach((b) => {
      b.onclick = () => {
        const { dall: scope, dstate: state, v } = b.dataset;
        const keys = listOf(state);
        if (scope === 'sell') {
          saveScope('sell', state, v === '1' ? [...keys].sort() : []);
        } else {
          const cur = new Set(kendraDistricts());
          keys.forEach((k) => (v === '1' ? cur.add(k) : cur.delete(k)));
          saveScope('kendra', state, [...cur].sort());
        }
      };
    });

    const card = document.querySelector('[data-kcard]');
    if (card) card.onclick = async () => {
      card.disabled = true;
      try {
        const next = { ...data.kcard, on: !(data.kcard.on === true) };
        await c.db().saveKendraCard(next);
        toast(`${tr('sw_k_card')}: ${next.on ? tr('sw_on') : tr('sw_off')}`);
        await refresh();
      } catch (e) { card.disabled = false; fail(e); }
    };

    const save = document.getElementById('kl-save');
    if (save) save.onclick = async () => {
      const raw = document.getElementById('kl-point').value;
      const point = raw.trim() ? parsePoint(raw) : null;
      if (raw.trim() && !point) { toast(tr('sw_k_point_bad')); return; }
      const km = Number(document.getElementById('kl-km').value) || 0;
      save.disabled = true;
      try {
        await c.db().saveKendraInfo({
          address: document.getElementById('kl-address').value.trim().slice(0, 120),
          lat: point ? point.lat : null,
          lon: point ? point.lon : null,
          km: km || null,
        });
        toast(tr('sw_saved'));
        await refresh();
      } catch (e) { save.disabled = false; fail(e); }
    };

    const more = document.querySelector('.swmore');
    if (more) more.ontoggle = () => { memo.moreOpen = more.open; };
    const r = document.getElementById('sw-refresh');
    if (r) r.onclick = async () => { r.disabled = true; memo.districts = {}; await loadStatus(true); render(); };
  }

  return { page };
}
