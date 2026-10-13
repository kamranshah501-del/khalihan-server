// Khalihan Admin — the Switches page (owner only).
//
// Owner's rule (13 Oct 2026): the app is complete, and every feature can be
// switched from here, so Khalihan opens step by step as it grows.
//
//   config/app → features.{key}        a feature ON/OFF (app reads it at start)
//   config/app → launch_states         states farmers can pick (Maharashtra always)
//   config/app → districts.{State}     districts where Khalihan's own business
//                                      runs: Sell to Khalihan and the Kendra.
//                                      Prices, weather, calendar and schemes
//                                      work in the whole state.
//
// Each section has one main switch and, inside it, the features that belong
// to it. In the app (v1.0.4+) a feature inside "Services" is on only while
// Services is on (AppConfig.featureParent). `def` = what the app does while
// the server has said nothing — must match AppConfig.featureDefaults.

import { KENDRA_WORDS } from './kendra.js';

export const SWITCH_WORDS = {
  en: {
    tab_features: 'Switches',
    sw_intro: 'Turn parts of the app on or off — no app update needed. A change applies the next time a farmer opens the app. A switch marked "v1.0.4+" works only on app v1.0.4 and newer.',
    sw_always: 'Always on',
    sw_section_off: 'This section is off — everything inside it is off in the app.',
    sw_off_confirm: 'Turn off "{s}"? Everything inside it goes off too: {k}.',
    sw_prices: 'Mandi prices',
    sw_prices_d: 'The heart of the app — always on. The pieces inside can be switched one by one.',
    sw_since: 'v{v}+',
    sw_need_dist: 'Works only in districts switched ON under "States & districts".',
    sw_dist_none: '⚠️ No district is ON yet — nobody will see it.',
    sw_dist_list: 'Districts ON: {d}',
    sw_states: 'States & districts',
    sw_states_d: 'State ON = farmers there can pick it; prices, weather, calendar and schemes work in the whole state. District ON = Khalihan\'s own business there: Sell to Khalihan and the Kendra.',
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
    sw_districts: 'Districts · {n} ON',
    sw_all_on: 'All ON',
    sw_all_off: 'All OFF',
    sw_dist_loading: 'Reading the districts from the latest prices…',
    sw_dist_nodata: 'No price data for this state yet — its districts show here once prices arrive.',
    sw_dist_help: 'Tap a district to switch Khalihan\'s business there (Sell to Khalihan, the Kendra).',
    sw_saved: 'Saved — the app picks it up at its next start',
    f_price_map: 'Price map', f_price_map_d: 'List | Map in "Where to sell?".',
    f_hold_sell: 'Sell now or wait?', f_hold_sell_d: 'What waiting costs, and the break-even price.',
    f_day_voice: 'Hear today\'s prices', f_day_voice_d: 'The Home button and the "Listen" button on the morning message.',
    f_share_picture: 'Send prices as a picture', f_share_picture_d: 'Off = Share sends a plain WhatsApp message.',
    f_alerts: 'Price alerts', f_alerts_d: 'The bell on a crop page and the "price moved / target reached" alert. Off = no bell, no alerts.',
    f_brief: 'Morning message', f_brief_d: 'The 6–8 am message with the farmer\'s crops and the weather. Off = no message, and its switch in Profile hides.',
    f_weather: 'Weather', f_weather_d: 'The weather card on Home, the weather page and the hail / storm / heat warnings.',
    f_calendar: 'Crop calendar', f_calendar_d: 'The Home button, the crop page tile, "This week on the farm" and the weekly field reminder.',
    f_services: 'Services tab', f_services_d: 'The Services tab in the bottom bar. Off = the tab hides and everything below goes off too.',
    f_schemes: 'Government schemes', f_schemes_d: 'The schemes card in Services.',
    f_sell: 'Sell to Khalihan', f_sell_d: 'The offer card and sell requests. Turn on only when a processor\'s price is confirmed in the district.',
    f_login: 'Mobile OTP login', f_login_d: '"My account" and an OTP before selling. Every SMS costs money (about ₹6) — before turning it on, finish part D of the admin README (Blaze, Phone sign-in, SHA).',
    f_feedback: 'Suggestions', f_feedback_d: '"सुझाव दें" in Profile and Services.',
  },
  hi: {
    tab_features: 'स्विच',
    sw_intro: 'ऐप के हिस्से चालू या बंद करें — ऐप अपडेट की ज़रूरत नहीं। बदलाव किसान के अगली बार ऐप खोलने पर लागू होता है। "v1.0.4+" वाला स्विच सिर्फ़ v1.0.4 और नए ऐप में चलता है।',
    sw_always: 'हमेशा चालू',
    sw_section_off: 'ये हिस्सा बंद है — इसके अंदर का सब कुछ ऐप में बंद है।',
    sw_off_confirm: '"{s}" बंद करें? इसके अंदर का सब भी बंद होगा: {k}।',
    sw_prices: 'मंडी भाव',
    sw_prices_d: 'ऐप का दिल — हमेशा चालू। अंदर के हिस्से एक-एक करके बंद हो सकते हैं।',
    sw_since: 'v{v}+',
    sw_need_dist: 'सिर्फ़ उन ज़िलों में चलेगा जो "राज्य और ज़िले" में चालू हैं।',
    sw_dist_none: '⚠️ अभी कोई ज़िला चालू नहीं — किसी को नहीं दिखेगा।',
    sw_dist_list: 'चालू ज़िले: {d}',
    sw_states: 'राज्य और ज़िले',
    sw_states_d: 'राज्य चालू = वहाँ के किसान उसे चुन सकते हैं; भाव, मौसम, कैलेंडर और योजनाएँ पूरे राज्य में चलती हैं। ज़िला चालू = वहाँ Khalihan का अपना धंधा: Khalihan को बेचें और Kendra।',
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
    sw_districts: 'ज़िले · {n} चालू',
    sw_all_on: 'सब चालू',
    sw_all_off: 'सब बंद',
    sw_dist_loading: 'ताज़ा भाव से ज़िले पढ़ रहे हैं…',
    sw_dist_nodata: 'इस राज्य का अभी भाव नहीं आया — भाव आते ही ज़िले यहाँ दिखेंगे।',
    sw_dist_help: 'किसी ज़िले पर टैप करके वहाँ Khalihan का धंधा चालू/बंद करें (Khalihan को बेचें, Kendra)।',
    sw_saved: 'सेव हो गया — ऐप अगली बार खुलने पर ले लेगा',
    f_price_map: 'भाव का नक्शा', f_price_map_d: '"कहाँ बेचें?" में सूची | नक्शा।',
    f_hold_sell: 'अभी बेचें या रुकें?', f_hold_sell_d: 'रुकने का ख़र्च और ब्रेक-ईवन भाव।',
    f_day_voice: 'आज का भाव सुनें', f_day_voice_d: 'Home का बटन और सुबह के मैसेज का "सुनें" बटन।',
    f_share_picture: 'भाव की फ़ोटो भेजें', f_share_picture_d: 'बंद = Share सीधे WhatsApp मैसेज भेजेगा।',
    f_alerts: 'भाव अलर्ट', f_alerts_d: 'फ़सल पेज की घंटी और "भाव बदला / टारगेट पूरा" अलर्ट। बंद = न घंटी, न अलर्ट।',
    f_brief: 'सुबह का मैसेज', f_brief_d: 'सुबह 6–8 बजे किसान की फ़सलों और मौसम वाला मैसेज। बंद = मैसेज नहीं, और Profile में उसका स्विच भी छिप जाएगा।',
    f_weather: 'मौसम', f_weather_d: 'Home का मौसम कार्ड, मौसम पेज और ओले / तूफ़ान / लू की चेतावनी।',
    f_calendar: 'फ़सल कैलेंडर', f_calendar_d: 'Home का बटन, फ़सल पेज की टाइल, "इस हफ़्ते खेत में" और हफ़्ते का खेत रिमाइंडर।',
    f_services: 'Services टैब', f_services_d: 'नीचे की पट्टी का Services टैब। बंद = टैब छिप जाएगा और नीचे का सब भी बंद।',
    f_schemes: 'सरकारी योजनाएँ', f_schemes_d: 'Services में योजनाओं का कार्ड।',
    f_sell: 'Khalihan को बेचें', f_sell_d: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट। तभी चालू करें जब ज़िले में प्रोसेसर का भाव पक्का हो।',
    f_login: 'मोबाइल OTP लॉग इन', f_login_d: '"मेरा खाता" और बेचने से पहले OTP। हर SMS का पैसा लगता है (लगभग ₹6) — चालू करने से पहले admin README का भाग D पूरा करें (Blaze, Phone sign-in, SHA)।',
    f_feedback: 'सुझाव', f_feedback_d: 'Profile और Services में "सुझाव दें"।',
  },
};
SWITCH_WORDS.en.f_kendra = KENDRA_WORDS.en.feat_kendra;
SWITCH_WORDS.en.f_kendra_d = KENDRA_WORDS.en.feat_kendra_d;
SWITCH_WORDS.hi.f_kendra = KENDRA_WORDS.hi.feat_kendra;
SWITCH_WORDS.hi.f_kendra_d = KENDRA_WORDS.hi.feat_kendra_d;

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
  kendra: { def: false, since: '1.0.4', districts: true },
  sell: { def: false, since: '1.0.3', districts: true },
  login: { def: false, since: '1.0.3' },
  feedback: { def: true, since: '1.0.4' },
};

/** Admin's sections: one main switch (or none: always on), and what belongs inside. */
const SECTIONS = [
  { id: 'prices', icon: '📈', master: null, kids: ['price_map', 'hold_sell', 'day_voice', 'share_picture', 'alerts', 'brief'] },
  { id: 'weather', icon: '🌦️', master: 'weather', kids: [] },
  { id: 'calendar', icon: '🌱', master: 'calendar', kids: [] },
  { id: 'services', icon: '🏛️', master: 'services', kids: ['schemes', 'kendra'] },
  { id: 'sell', icon: '🤝', master: 'sell', kids: [] },
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

/** The server's document name for a state ("NCT of Delhi" → "nct_of_delhi"). */
export const stateSlug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

/** A district name from the price data → the key the app compares
 *  (MandiGeo.districtKey without Maharashtra's spelling table). */
export const districtKey = (d) => String(d).replace(/\([^)]*\)/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function createSwitches(c) {
  const { tr, esc, toast, fail, setMain } = c;
  const memo = { status: null, districts: {}, open: new Set() };

  const featOn = (features, key) =>
    (typeof features[key] === 'boolean' ? features[key] : FEATURE_INFO[key].def);
  const stateName = (s) => (c.lang() === 'hi' && STATE_HI[s] ? STATE_HI[s] : s);
  const sinceChip = (key) => (FEATURE_INFO[key].since === '1.0.3' ? '' : `<span class="chip swver">${tr('sw_since', { v: FEATURE_INFO[key].since })}</span>`);
  const shortDay = (d) => d.toLocaleDateString(c.lang() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

  function districtNote(districts) {
    const names = [];
    for (const [state, keys] of Object.entries(districts || {})) {
      for (const k of keys || []) {
        const mh = state === 'Maharashtra' ? MH_DISTRICTS.find(([key]) => key === k) : null;
        names.push(mh ? mh[1].replace(/ \(.*\)$/, '') : k.charAt(0).toUpperCase() + k.slice(1));
      }
    }
    return names.length
      ? `<p class="small swnote">${esc(tr('sw_dist_list', { d: names.join(', ') }))}</p>`
      : `<p class="small swnote warn">${tr('sw_dist_none')}</p>`;
  }

  function kidRow(features, key, sectionOn, districts) {
    const on = featOn(features, key);
    return `<label class="swkid${sectionOn ? '' : ' dim'}">
      <input type="checkbox" data-feature="${key}" ${on ? 'checked' : ''} ${sectionOn ? '' : 'disabled'}>
      <div class="grow"><div class="swkt">${esc(tr('f_' + key))} ${sinceChip(key)}</div>
        <div class="sub">${esc(tr('f_' + key + '_d'))}</div>
        ${FEATURE_INFO[key].districts && on && sectionOn ? districtNote(districts) : ''}</div>
    </label>`;
  }

  function sectionCard(features, districts, s) {
    const masterOn = s.master ? featOn(features, s.master) : true;
    const title = s.master ? tr('f_' + s.master) : tr('sw_prices');
    const desc = s.master ? tr('f_' + s.master + '_d') : tr('sw_prices_d');
    const toggle = s.master
      ? `<button class="kswitch${masterOn ? ' on' : ''}" data-master="${s.master}" aria-pressed="${masterOn}"><span class="knob"></span>${masterOn ? tr('on') : tr('off')}</button>`
      : `<span class="chip swalways">${tr('sw_always')}</span>`;
    return `<section class="card swsec${masterOn ? '' : ' off'}">
      <div class="swhead">
        <div class="swicon" aria-hidden="true">${s.icon}</div>
        <div class="grow"><div class="title">${esc(title)} ${s.master ? sinceChip(s.master) : ''}</div><div class="sub">${esc(desc)}</div>
          ${s.master && FEATURE_INFO[s.master].districts && masterOn ? districtNote(districts) : ''}</div>
        ${toggle}
      </div>
      ${s.kids.length ? `<div class="swkids">
        ${masterOn ? '' : `<p class="small muted">${tr('sw_section_off')}</p>`}
        ${s.kids.map((k) => kidRow(features, k, masterOn, districts)).join('')}
      </div>` : ''}
    </section>`;
  }

  function statusChip(state) {
    const st = memo.status && memo.status[state];
    if (!st || !st.rows) return `<span class="chip swdata none">${tr('sw_data_none')}</span>`;
    const fresh = st.at instanceof Date && Date.now() - st.at.getTime() < 36 * 3600e3;
    const day = st.at instanceof Date ? shortDay(st.at) : '—';
    return fresh
      ? `<span class="chip swdata ok">${tr('sw_data_ok', { d: day, n: Number(st.rows).toLocaleString('en-IN') })}</span>`
      : `<span class="chip swdata old">${tr('sw_data_old', { d: day })}</span>`;
  }

  function appChip(state) {
    const r = APP_READY[state];
    return `<span class="chip swapp ${r || 'basic'}">${tr(r === 'full' ? 'sw_app_full' : r === 'soon' ? 'sw_app_soon' : 'sw_app_basic')}</span>`;
  }

  function stateRow(state, open, districts) {
    const mh = state === 'Maharashtra';
    const nOn = (districts[state] || []).length;
    return `<div class="swstate${open ? ' on' : ''}">
      <button class="kswitch small${open ? ' on' : ''}" data-state="${esc(state)}" aria-pressed="${open}" ${mh ? `disabled title="${esc(tr('sw_mh_locked'))}"` : ''}><span class="knob"></span></button>
      <div class="grow"><div class="swkt">${esc(stateName(state))}</div>
        <div class="row swchips">${statusChip(state)} ${appChip(state)}</div></div>
      ${open ? `<button class="plain" data-dists="${esc(state)}" aria-expanded="${memo.open.has(state)}">${tr('sw_districts', { n: nOn })} ${memo.open.has(state) ? '▴' : '▾'}</button>` : ''}
    </div>
    ${open && memo.open.has(state) ? `<div class="swdists" data-for="${esc(state)}">${districtPanel(state, districts)}</div>` : ''}`;
  }

  function districtPanel(state, districts) {
    const list = state === 'Maharashtra' ? MH_DISTRICTS : memo.districts[state];
    if (list === undefined) return `<p class="small muted">${tr('sw_dist_loading')}</p>`;
    if (!list.length) return `<p class="small muted">${tr('sw_dist_nodata')}</p>`;
    const on = new Set(districts[state] || []);
    return `<p class="small muted">${tr('sw_dist_help')}</p>
      <div class="row" style="margin-bottom:8px">
        <button class="plain small" data-dall="${esc(state)}" data-v="1">${tr('sw_all_on')}</button>
        <button class="plain small" data-dall="${esc(state)}" data-v="0">${tr('sw_all_off')}</button>
      </div>
      <div class="dchips">${list.map(([k, name]) =>
        `<button class="dchip${on.has(k) ? ' on' : ''}" data-dstate="${esc(state)}" data-d="${esc(k)}" aria-pressed="${on.has(k)}">${on.has(k) ? '✓ ' : ''}${esc(name)}</button>`).join('')}</div>`;
  }

  function statesCard(launch, districts) {
    const open = new Set(['Maharashtra', ...launch]);
    // Maharashtra (always open) first, then the others A–Z.
    const openList = ['Maharashtra', ...STATES.filter((s) => s !== 'Maharashtra' && open.has(s))];
    const rest = STATES.filter((s) => !open.has(s));
    return `<section class="card swsec" id="sw-states">
      <div class="swhead">
        <div class="swicon" aria-hidden="true">📍</div>
        <div class="grow"><div class="title">${tr('sw_states')}</div><div class="sub">${tr('sw_states_d')}</div></div>
        <button class="plain" id="sw-refresh">${tr('sw_refresh')}</button>
      </div>
      <div class="swstates">${openList.map((s) => stateRow(s, true, districts)).join('')}</div>
      <details class="swmore"${memo.moreOpen ? ' open' : ''}><summary>${tr('sw_other_states', { n: rest.length })}</summary>
        <div class="swstates">${rest.map((s) => stateRow(s, false, districts)).join('')}</div>
      </details>
    </section>`;
  }

  async function loadStatus(force) {
    if (memo.status && !force) return;
    try { memo.status = await c.db().liveStatus(STATES.map((s) => [s, stateSlug(s)])); } catch (e) { console.warn(e); memo.status = {}; }
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

  async function page() {
    const [{ features, launch_states: launch, districts }] = await Promise.all([c.db().appConfig(), loadStatus(false)]);
    const ds = districts || {};
    const scrollY = window.scrollY;
    setMain(`
      <h1>${tr('tab_features')}</h1>
      <p class="muted">${tr('sw_intro')}</p>
      ${statesCard(launch || [], ds)}
      ${SECTIONS.map((s) => sectionCard(features, ds, s)).join('')}`);
    window.scrollTo(0, scrollY);
    wire(features, launch || [], ds);
  }

  function wire(features, launch, districts) {
    const $$ = (sel) => document.querySelectorAll(sel);
    const kidsOf = (master) => (SECTIONS.find((s) => s.master === master) || { kids: [] }).kids;

    $$('[data-master]').forEach((b) => {
      b.onclick = async () => {
        const key = b.dataset.master;
        const next = !featOn(features, key);
        if (!next && kidsOf(key).length) {
          const names = kidsOf(key).map((k) => tr('f_' + k)).join(', ');
          if (!confirm(tr('sw_off_confirm', { s: tr('f_' + key), k: names }))) return;
        }
        b.disabled = true;
        try { await c.db().setFeature(key, next); toast(`${tr('f_' + key)}: ${next ? tr('on') : tr('off')}`); await page(); } catch (e) { b.disabled = false; fail(e); }
      };
    });

    $$('[data-feature]').forEach((box) => {
      box.onchange = async () => {
        const key = box.dataset.feature;
        try { await c.db().setFeature(key, box.checked); toast(`${tr('f_' + key)}: ${box.checked ? tr('on') : tr('off')}`); await page(); } catch (e) { box.checked = !box.checked; fail(e); }
      };
    });

    $$('[data-state]').forEach((b) => {
      b.onclick = async () => {
        const state = b.dataset.state;
        if (state === 'Maharashtra') return;
        const isOpen = launch.includes(state);
        if (!isOpen && APP_READY[state] !== 'full' && !confirm(tr('sw_state_confirm', { s: stateName(state) }))) return;
        if (isOpen && !confirm(tr('sw_state_close', { s: stateName(state) }))) return;
        const next = isOpen ? launch.filter((s) => s !== state) : [...launch.filter((s) => s !== 'Maharashtra'), state];
        b.disabled = true;
        try {
          await c.db().setLaunchStates(['Maharashtra', ...next.filter((s) => s !== 'Maharashtra')]);
          toast(tr('sw_saved'));
          await page();
        } catch (e) { b.disabled = false; fail(e); }
      };
    });

    $$('[data-dists]').forEach((b) => {
      b.onclick = async () => {
        const state = b.dataset.dists;
        if (memo.open.has(state)) { memo.open.delete(state); await page(); return; }
        memo.open.add(state);
        await page();
        if (state !== 'Maharashtra' && memo.districts[state] === undefined) { await loadDistricts(state); await page(); }
      };
    });

    const saveDistricts = async (state, keys) => {
      try { await c.db().setDistricts(state, keys); toast(tr('sw_saved')); await page(); } catch (e) { fail(e); }
    };
    $$('[data-d]').forEach((b) => {
      b.onclick = () => {
        const state = b.dataset.dstate;
        const cur = new Set(districts[state] || []);
        if (cur.has(b.dataset.d)) cur.delete(b.dataset.d); else cur.add(b.dataset.d);
        b.disabled = true;
        saveDistricts(state, [...cur].sort());
      };
    });
    $$('[data-dall]').forEach((b) => {
      b.onclick = () => {
        const state = b.dataset.dall;
        const list = state === 'Maharashtra' ? MH_DISTRICTS : (memo.districts[state] || []);
        saveDistricts(state, b.dataset.v === '1' ? list.map(([k]) => k).sort() : []);
      };
    });

    const more = document.querySelector('.swmore');
    if (more) more.ontoggle = () => { memo.moreOpen = more.open; };
    const refresh = document.getElementById('sw-refresh');
    if (refresh) refresh.onclick = async () => { refresh.disabled = true; memo.districts = {}; await loadStatus(true); await page(); };
  }

  return { page };
}
