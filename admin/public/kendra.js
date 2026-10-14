// Khalihan Admin — Khalihan Kendra (seed & fertiliser shop, Jamner first).
//
// Sub-pages: Orders (with the urea / DAP / potash switches), Products,
// Home card (ON/OFF + slides), Kendra (name, hours, area) and Complaints.
// Owner only: what we pay per pack and the margin. Pesticides can never be
// added — the counter's farm assistant handles them (owner, 12 Oct 2026).
//
// The app reads: kendra/info, kendra/home_card, kendra_products (show=true).
// It writes: kendra_orders (reserve → pick up → pay at the Kendra),
// kendra_complaints. The whole shop is the "kendra" feature switch.

export const KENDRA_WORDS = {
  en: {
    tab_kendra: 'Kendra',
    feat_kendra: 'Khalihan Kendra (shop)',
    feat_kendra_d: 'The shop in Services and the square card on Home — only for farmers near the Kendra. Turn on when the Kendra opens and products are entered.',
    k_orders: 'Orders',
    k_products: 'Products',
    k_card: 'Home card',
    k_info: 'Kendra',
    k_complaints: 'Complaints',
    k_off_note: 'The Kendra switch is OFF — farmers don\'t see the shop yet. Owner: Switches → Services tab → Khalihan Kendra.',
    k_nodist_note: 'The Kendra has no district yet — farmers don\'t see the shop. Owner: Switches → Khalihan Kendra → Districts.',
    k_where_note: 'Address, map location, districts and km (who sees the shop) are under Switches → Khalihan Kendra (owner).',
    k_new: 'New',
    k_ready: 'Ready',
    k_done: 'Picked up',
    k_cancelled: 'Cancelled',
    k_all: 'All',
    k_none: 'Nothing here.',
    k_items: '{n} items',
    k_pickup: 'Pick up {d} · {s}',
    k_m: 'morning', k_a: 'afternoon', k_e: 'evening',
    k_mark_ready: 'Mark ready',
    k_mark_done: 'Picked up & paid',
    k_cancel: 'Cancel',
    k_reopen: 'Reopen',
    k_cancel_q: 'Cancel order {c}?',
    k_paid_how: 'Paid by',
    k_cash: 'Cash', k_upi: 'UPI',
    k_bill: 'Bill no. (optional)',
    k_note: 'Note (optional)',
    k_saved: 'Saved',
    k_live_new: 'New Kendra order {c} · {n} items',
    k_govt_h: 'Shown in the app today',
    k_govt_d: 'Farmers see this on the Kendra page and the Home card at once.',
    k_urea: 'Urea', k_dap: 'DAP', k_mop: 'MOP (potash)',
    k_ok: 'In stock', k_low: 'Low', k_out: 'Out',
    k_low_h: 'Running low (5 or fewer)',
    k_month_h: 'This month · owner only',
    k_sales: 'Sales (picked up)',
    k_margin: 'Margin',
    k_margin_missing: '{n} items without a cost — enter it in Products',
    k_own_share: 'Khalihan brand share',
    k_add_product: '+ New product',
    k_edit_product: 'Edit product',
    k_hidden: 'hidden',
    k_stock_n: '{n} in stock',
    k_name_hi: 'Name — हिंदी', k_name_mr: 'Name — मराठी', k_name_en: 'Name — English',
    k_cat: 'Category',
    cat_seed: 'Seeds', cat_fert: 'Fertiliser', cat_organic: 'Organic manure', cat_micro: 'Micronutrients', cat_tools: 'Pumps & tools',
    k_no_pesticide: 'Pesticides cannot be added — counter only.',
    k_brand: 'Brand / company',
    k_own: 'Khalihan brand (our own)',
    k_govt: 'Government price (Aadhaar on the PoS machine)',
    k_show: 'Show in the app',
    k_crops: 'For which crops',
    k_packs: 'Packs, prices and stock',
    k_size: 'Pack (e.g. 30 kg)', k_mrp: 'MRP ₹', k_price: 'Our price ₹', k_stock: 'In stock',
    k_add_pack: '+ Pack',
    k_facts: 'Label facts — copy from the bag (no doses)',
    f_variety: 'Variety', f_days: 'Crop duration (days)', f_sowing: 'Sowing time', f_germ: 'Germination % (label)',
    f_purity: 'Purity % (label)', f_lot: 'Lot no.', f_test: 'Test date', f_grade: 'Grade / contents (fertiliser)',
    k_lic: 'Licence / registration no.',
    k_order: 'Order in lists (smaller = first)',
    k_cost_h: '🔒 What we pay (owner only — never in the app)',
    k_cost_for: 'We buy {s} at ₹',
    k_margin_line: 'Margin on {s}: {m} ({p}%)',
    k_save: 'Save',
    k_delete: 'Delete',
    k_delete_q: 'Delete this product?',
    k_err_name: 'Write the name in at least one language.',
    k_err_pack: 'Add at least one pack with a size and a price.',
    k_err_price: 'Our price can\'t be above MRP ({s}).',
    k_card_on: 'Show on Home: ON',
    k_card_off: 'Show on Home: OFF',
    k_card_d: 'The square card on farmers\' Home — offers, today\'s stock, new arrivals, notices. Only farmers near the Kendra see it; phones pick up changes the next time the app opens. OFF, or no live slide: no card.',
    k_secs: 'Change slide every',
    k_slides: 'Slides',
    k_add_offer: '+ Offer', k_add_stock: '+ Today\'s stock', k_add_new: '+ New arrival', k_add_notice: '+ Notice',
    st_offer: 'Offer', st_stock: 'Today\'s stock', st_new: 'New arrival', st_notice: 'Notice',
    k_slide_live: 'Live', k_slide_sched: 'Scheduled', k_slide_off: 'Off', k_slide_ended: 'Ended',
    k_slide_edit: 'Slide',
    k_title_hi: 'Title — हिंदी', k_title_mr: 'Title — मराठी', k_title_en: 'Title — English',
    k_line_hi: 'Line — हिंदी', k_line_mr: 'Line — मराठी', k_line_en: 'Line — English',
    k_line_hint_offer: 'e.g. 5 बैग पर ₹50 कम',
    k_product: 'Product (optional)',
    k_from: 'Show from', k_to: 'Show until',
    k_live: 'Live',
    k_stock_auto: 'Fills itself from the urea / DAP / potash switches. A title is optional.',
    k_up: '↑', k_down: '↓',
    k_preview: 'Preview',
    k_gentle: 'On phones with "remove animations" on, the card does not move by itself — farmers swipe.',
    k_info_h: 'The Kendra',
    k_kname: 'Name shown in the app', k_address: 'Address', k_phone: 'Phone (for "Call")',
    k_open: 'Opens at (hour, 0–23)', k_close: 'Closes at (hour, 0–23)',
    k_closed_day: 'Weekly closed day', k_none_day: 'None',
    k_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    k_holidays: 'Holidays (YYYY-MM-DD, comma between)',
    k_districts: 'Districts that see the shop (comma between, e.g. jalgaon)',
    k_lat: 'Latitude', k_lon: 'Longitude',
    k_km: 'Or within … road km (when the farmer picked a town)',
    k_hold: 'Keep a reservation for … days',
    k_info_saved: 'Kendra saved — phones see it the next time the app opens.',
    k_comp_none: 'No complaints.',
    k_comp_done: 'Done', k_comp_reopen: 'Reopen',
  },
  hi: {
    tab_kendra: 'Kendra',
    feat_kendra: 'Khalihan Kendra (दुकान)',
    feat_kendra_d: 'Services में दुकान और Home पर square card — सिर्फ़ Kendra के पास के किसानों को। Kendra खुलने और माल डालने के बाद चालू करें।',
    k_orders: 'ऑर्डर',
    k_products: 'माल',
    k_card: 'Home card',
    k_info: 'Kendra',
    k_complaints: 'शिकायतें',
    k_off_note: 'Kendra स्विच बंद है — किसानों को अभी दुकान नहीं दिखती। Owner: स्विच → Services टैब → Khalihan Kendra।',
    k_nodist_note: 'Kendra का अभी कोई ज़िला नहीं — किसानों को दुकान नहीं दिखती। Owner: स्विच → Khalihan Kendra → ज़िले।',
    k_where_note: 'पता, नक्शे पर जगह, ज़िले और km (दुकान किसे दिखे) — स्विच → Khalihan Kendra में (owner)।',
    k_new: 'नया',
    k_ready: 'तैयार',
    k_done: 'उठा लिया',
    k_cancelled: 'रद्द',
    k_all: 'सब',
    k_none: 'यहाँ कुछ नहीं।',
    k_items: '{n} चीज़ें',
    k_pickup: 'उठाना {d} · {s}',
    k_m: 'सुबह', k_a: 'दोपहर', k_e: 'शाम',
    k_mark_ready: 'तैयार किया',
    k_mark_done: 'उठा लिया, पैसे मिले',
    k_cancel: 'रद्द करें',
    k_reopen: 'फिर खोलें',
    k_cancel_q: 'ऑर्डर {c} रद्द करें?',
    k_paid_how: 'पैसे कैसे',
    k_cash: 'नकद', k_upi: 'UPI',
    k_bill: 'बिल नंबर (चाहें तो)',
    k_note: 'नोट (चाहें तो)',
    k_saved: 'सेव हो गया',
    k_live_new: 'नया Kendra ऑर्डर {c} · {n} चीज़ें',
    k_govt_h: 'आज ऐप में यह दिख रहा है',
    k_govt_d: 'किसान इसे Kendra पेज और Home card पर तुरंत देखते हैं।',
    k_urea: 'यूरिया', k_dap: 'DAP', k_mop: 'MOP (पोटाश)',
    k_ok: 'है', k_low: 'कम', k_out: 'नहीं',
    k_low_h: 'कम बचा (5 या कम)',
    k_month_h: 'इस महीने · सिर्फ़ owner',
    k_sales: 'बिक्री (उठाया गया)',
    k_margin: 'मार्जिन',
    k_margin_missing: '{n} चीज़ों की लागत नहीं डली — माल में डालें',
    k_own_share: 'Khalihan ब्रांड का हिस्सा',
    k_add_product: '+ नया माल',
    k_edit_product: 'माल बदलें',
    k_hidden: 'छिपा',
    k_stock_n: '{n} स्टॉक में',
    k_name_hi: 'नाम — हिंदी', k_name_mr: 'नाम — मराठी', k_name_en: 'नाम — English',
    k_cat: 'श्रेणी',
    cat_seed: 'बीज', cat_fert: 'खाद', cat_organic: 'जैविक खाद', cat_micro: 'सूक्ष्म पोषक', cat_tools: 'पंप व औज़ार',
    k_no_pesticide: 'कीटनाशक नहीं डाल सकते — सिर्फ़ काउंटर पर।',
    k_brand: 'ब्रांड / कंपनी',
    k_own: 'Khalihan ब्रांड (हमारा अपना)',
    k_govt: 'सरकारी दाम (PoS मशीन पर आधार)',
    k_show: 'ऐप में दिखाएँ',
    k_crops: 'किन फसलों के लिए',
    k_packs: 'पैक, दाम और स्टॉक',
    k_size: 'पैक (जैसे 30 kg)', k_mrp: 'MRP ₹', k_price: 'हमारा दाम ₹', k_stock: 'स्टॉक',
    k_add_pack: '+ पैक',
    k_facts: 'लेबल की जानकारी — बोरी से लिखें (मात्रा नहीं)',
    f_variety: 'किस्म', f_days: 'फसल की अवधि (दिन)', f_sowing: 'बुवाई का समय', f_germ: 'अंकुरण % (लेबल)',
    f_purity: 'शुद्धता % (लेबल)', f_lot: 'लॉट नंबर', f_test: 'परीक्षण तारीख', f_grade: 'ग्रेड / घटक (खाद)',
    k_lic: 'लाइसेंस / रजिस्ट्रेशन नंबर',
    k_order: 'सूची में क्रम (छोटा = पहले)',
    k_cost_h: '🔒 हम कितने में खरीदते हैं (सिर्फ़ owner — ऐप में कभी नहीं)',
    k_cost_for: '{s} हम ₹ में खरीदते हैं',
    k_margin_line: '{s} पर मार्जिन: {m} ({p}%)',
    k_save: 'सेव करें',
    k_delete: 'हटाएँ',
    k_delete_q: 'यह माल हटाएँ?',
    k_err_name: 'कम से कम एक भाषा में नाम लिखें।',
    k_err_pack: 'कम से कम एक पैक — साइज़ और दाम के साथ।',
    k_err_price: 'हमारा दाम MRP से ज़्यादा नहीं हो सकता ({s})।',
    k_card_on: 'Home पर दिखाएँ: चालू',
    k_card_off: 'Home पर दिखाएँ: बंद',
    k_card_d: 'किसानों के Home पर square card — ऑफ़र, आज का स्टॉक, नया माल, सूचना। सिर्फ़ Kendra के पास के किसानों को; बदलाव अगली बार ऐप खुलने पर। बंद, या कोई slide चालू नहीं: card नहीं दिखेगा।',
    k_secs: 'slide कितनी देर में बदले',
    k_slides: 'Slides',
    k_add_offer: '+ ऑफ़र', k_add_stock: '+ आज का स्टॉक', k_add_new: '+ नया माल', k_add_notice: '+ सूचना',
    st_offer: 'ऑफ़र', st_stock: 'आज का स्टॉक', st_new: 'नया माल', st_notice: 'सूचना',
    k_slide_live: 'चालू', k_slide_sched: 'आगे चलेगा', k_slide_off: 'बंद', k_slide_ended: 'खत्म',
    k_slide_edit: 'Slide',
    k_title_hi: 'शीर्षक — हिंदी', k_title_mr: 'शीर्षक — मराठी', k_title_en: 'शीर्षक — English',
    k_line_hi: 'लाइन — हिंदी', k_line_mr: 'लाइन — मराठी', k_line_en: 'लाइन — English',
    k_line_hint_offer: 'जैसे 5 बैग पर ₹50 कम',
    k_product: 'माल (चाहें तो)',
    k_from: 'कब से', k_to: 'कब तक',
    k_live: 'चालू',
    k_stock_auto: 'यूरिया / DAP / पोटाश के स्विच से अपने आप भरता है। शीर्षक ज़रूरी नहीं।',
    k_up: '↑', k_down: '↓',
    k_preview: 'झलक',
    k_gentle: 'जिन फ़ोन में "animation बंद" है, वहाँ card अपने आप नहीं सरकेगा — किसान उँगली से सरकाएगा।',
    k_info_h: 'Kendra',
    k_kname: 'ऐप में नाम', k_address: 'पता', k_phone: 'फ़ोन ("फ़ोन करें" के लिए)',
    k_open: 'खुलने का घंटा (0–23)', k_close: 'बंद होने का घंटा (0–23)',
    k_closed_day: 'हफ़्ते की छुट्टी', k_none_day: 'कोई नहीं',
    k_days: 'सोम,मंगल,बुध,गुरु,शुक्र,शनि,रवि',
    k_holidays: 'छुट्टियाँ (YYYY-MM-DD, बीच में comma)',
    k_districts: 'किन ज़िलों को दुकान दिखे (comma से, जैसे jalgaon)',
    k_lat: 'Latitude', k_lon: 'Longitude',
    k_km: 'या … सड़क km के अंदर (जब किसान ने गाँव चुना हो)',
    k_hold: 'ऑर्डर … दिन तक रखें',
    k_info_saved: 'Kendra सेव — फ़ोन अगली बार ऐप खुलने पर देखेंगे।',
    k_comp_none: 'कोई शिकायत नहीं।',
    k_comp_done: 'हो गया', k_comp_reopen: 'फिर खोलें',
  },
};

// Crop keys as the app knows them (lib/l10n/crop_names.dart).
const KCROPS = [
  ['cotton', 'Cotton', 'कपास'], ['soyabean', 'Soybean', 'सोयाबीन'], ['maize', 'Maize', 'मक्का'],
  ['bengal gram', 'Chana', 'चना'], ['wheat', 'Wheat', 'गेहूँ'], ['jowar', 'Jowar', 'ज्वार'], ['bajra', 'Bajra', 'बाजरा'],
  ['arhar', 'Tur', 'तूर'], ['green gram', 'Moong', 'मूँग'], ['black gram', 'Urad', 'उड़द'], ['groundnut', 'Groundnut', 'मूँगफली'],
  ['sunflower', 'Sunflower', 'सूरजमुखी'], ['sesamum', 'Sesame', 'तिल'], ['banana', 'Banana', 'केला'], ['papaya', 'Papaya', 'पपीता'],
  ['pomegranate', 'Pomegranate', 'अनार'], ['grapes', 'Grapes', 'अंगूर'], ['lemon', 'Lemon', 'नींबू'], ['onion', 'Onion', 'प्याज़'],
  ['potato', 'Potato', 'आलू'], ['tomato', 'Tomato', 'टमाटर'], ['green chilli', 'Chilli', 'मिर्च'], ['brinjal', 'Brinjal', 'बैंगन'],
  ['bhindi', 'Okra', 'भिंडी'], ['cabbage', 'Cabbage', 'पत्तागोभी'], ['cauliflower', 'Cauliflower', 'फूलगोभी'],
  ['turmeric', 'Turmeric', 'हल्दी'], ['ginger', 'Ginger', 'अदरक'], ['sugarcane', 'Sugarcane', 'गन्ना'],
];
const CATS = ['seed', 'fert', 'organic', 'micro', 'tools'];
const FACTS = ['variety', 'days', 'sowing', 'germ', 'purity', 'lot', 'test', 'grade'];
const OSTATUS = { new: 's-new', ready: 's-agreed', done: 's-paid', cancelled: 's-cancelled' };

/** The Kendra page. [c] carries the panel's shared helpers. */
export function createKendra(c) {
  const { tr, esc, rs, when, toast, fail, setMain, openPanel, closePanel, $ } = c;
  const state = { sub: 'orders', filter: 'new', watching: false };
  const owner = () => c.me().role === 'owner';
  const lang = () => c.lang();
  const cropName = (k) => { const x = KCROPS.find((r) => r[0] === k); return x ? (lang() === 'hi' ? x[2] : x[1]) : k; };
  const words = (m) => (m && (m[lang()] || m.hi || m.mr || m.en || Object.values(m).find(Boolean))) || '';
  const num = (v) => { const n = Number(String(v ?? '').replace(/,/g, '')); return isFinite(n) && String(v ?? '').trim() !== '' ? n : null; };
  const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const statusLabel = (s) => tr({ new: 'k_new', ready: 'k_ready', done: 'k_done', cancelled: 'k_cancelled' }[s] || 'k_new');
  const chip = (s) => `<span class="chip ${OSTATUS[s] || 's-new'}">${statusLabel(s)}</span>`;
  const slotWord = (s) => tr({ m: 'k_m', a: 'k_a', e: 'k_e' }[s] || 'k_m');

  async function page() {
    const [cfg, kinfo] = await Promise.all([
      c.db().appConfig().catch(() => ({ features: {} })),
      c.db().kendraInfo().catch(() => ({})),
    ]);
    const features = cfg.features || {};
    // In the app (v1.0.4+) the Kendra sits inside the Services tab, and shows
    // only to farmers in its own districts (or within its km).
    const on = features.kendra === true && features.services !== false;
    // The app's default when the shop has never been given districts: Jalgaon.
    const kd = Array.isArray(kinfo.districts) ? kinfo.districts : (Object.keys(kinfo).length ? ['jalgaon'] : []);
    const anyDistrict = kd.length > 0 || Number(kinfo.km) > 0;
    const subs = [['orders', tr('k_orders')], ['products', tr('k_products')], ['card', tr('k_card')], ['info', tr('k_info')], ['complaints', tr('k_complaints')]];
    const head = `<h1>Khalihan Kendra</h1>
      ${on ? (anyDistrict ? '' : `<p class="note">${tr('k_nodist_note')}</p>`) : `<p class="note">${tr('k_off_note')}</p>`}
      <div class="filters">${subs.map(([k, l]) => `<button data-ksub="${k}" class="${k === state.sub ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div id="ksub"><p class="muted">${tr('loading')}</p></div>`;
    setMain(head);
    document.querySelectorAll('[data-ksub]').forEach((b) => { b.onclick = () => { state.sub = b.dataset.ksub; page().catch(fail); }; });
    if (!state.watching) watch();
    await SUBS[state.sub]();
  }

  const box = (html) => { $('#ksub').innerHTML = html; };

  // ── live: a new order chimes, wherever the panel is ──
  function watch() {
    state.watching = true;
    try {
      c.db().watchKendraOrders((o) => {
        const text = tr('k_live_new', { c: o.code || '', n: (o.items || []).length });
        toast(text);
        c.ding(text);
        if (c.page() === 'kendra' && state.sub === 'orders' && !document.querySelector('.panel')) SUBS.orders().catch(fail);
      });
    } catch (e) { console.warn('kendra live', e); }
  }

  // ── orders ──
  function orderCard(o) {
    const items = (o.items || []).map((i) => `${esc(i.n)} · ${esc(i.s)} × ${esc(i.q)}`).join('<br>');
    const ms = o.at instanceof Date ? Date.now() - o.at : 0;
    const wait = o.status === 'new' && ms ? `<span class="wait ${ms > 2 * 3600e3 ? 'hot' : ms > 30 * 60e3 ? 'warm' : ''}">${esc(c.dur(ms))}</span>` : '';
    const ten = String(o.phone || '').replace(/\D/g, '').slice(-10);
    return `<div class="card">
      <div class="row between">
        <div class="grow">
          <div class="title">${esc(o.code || o.id)} · ${rs(o.total)}</div>
          <div class="sub">${esc(o.name || '—')} · ${esc(o.village || '')} · ${c.phoneShow(o.phone)}</div>
          <div class="sub">${when(o.at)} · ${tr('k_pickup', { d: esc(o.day || ''), s: slotWord(o.slot) })}</div>
        </div>
        <div class="side">${chip(o.status)}${wait}</div>
      </div>
      <div class="kitems">${items}</div>
      ${o.note ? `<div class="sub">📝 ${esc(o.note)}</div>` : ''}
      <div class="actions row">
        ${ten.length === 10 ? `<a class="btnlink" href="tel:+91${ten}">📞</a><a class="btnlink" target="_blank" rel="noopener" href="https://wa.me/91${ten}">WhatsApp</a>` : ''}
        ${o.status === 'new' ? `<button class="main" data-kready="${esc(o.id)}">${tr('k_mark_ready')}</button>` : ''}
        ${o.status === 'ready' ? `<button class="main" data-kdone="${esc(o.id)}">${tr('k_mark_done')}</button>` : ''}
        ${o.status === 'new' || o.status === 'ready' ? `<button class="danger" data-kcancel="${esc(o.id)}">${tr('k_cancel')}</button>` : ''}
        ${o.status === 'cancelled' ? `<button class="plain" data-kreopen="${esc(o.id)}">${tr('k_reopen')}</button>` : ''}
      </div>
    </div>`;
  }

  function stockSwitches(info) {
    const st = info.stock || {};
    const seg = (k) => ['ok', 'low', 'out'].map((v) => `<button class="seg ${st[k] === v ? 'on ' + v : ''}" data-gk="${k}" data-gv="${v}">${tr('k_' + v)}</button>`).join('');
    return `<section class="card">
      <h2 style="margin-top:0">${tr('k_govt_h')}</h2>
      <p class="muted small">${tr('k_govt_d')}</p>
      ${['urea', 'dap', 'mop'].map((k) => `<div class="row between kgovt"><b>${tr('k_' + k)}</b><div class="segs" role="group" aria-label="${esc(tr('k_' + k))}">${seg(k)}</div></div>`).join('')}
    </section>`;
  }

  function monthCard(orders, products, costs) {
    const start = c.monthStart();
    const done = orders.filter((o) => o.status === 'done' && o.at instanceof Date && o.at >= start);
    let sales = 0; let margin = 0; let missing = 0; let own = 0;
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    done.forEach((o) => (o.items || []).forEach((i) => {
      const line = (Number(i.p) || 0) * (Number(i.q) || 0);
      sales += line;
      if (byId[i.pid] && byId[i.pid].own) own += line;
      const cost = ((costs[i.pid] || {}).costs || {})[i.s];
      if (typeof cost === 'number') margin += ((Number(i.p) || 0) - cost) * (Number(i.q) || 0); else missing += 1;
    }));
    return `<section class="card moneybox">
      <h2>${tr('k_month_h')}</h2>
      <div class="kv"><div>${tr('k_sales')}</div><div><b>${rs(sales)}</b></div>
      <div>${tr('k_margin')}</div><div><b class="${margin < 0 ? 'neg' : 'pos'}">${c.signedRs(margin)}</b>${sales ? ` · ${(margin / sales * 100).toFixed(1)}%` : ''}</div>
      <div>${tr('k_own_share')}</div><div><b>${sales ? Math.round(own / sales * 100) : 0}%</b></div></div>
      ${missing ? `<p class="warnline">${tr('k_margin_missing', { n: missing })}</p>` : ''}
    </section>`;
  }

  const SUBS = {
    async orders() {
      const [orders, info, products, costs] = await Promise.all([
        c.db().kendraOrders(), c.db().kendraInfo(), c.db().kendraProducts(),
        owner() ? c.db().kendraCosts().catch(() => ({})) : Promise.resolve({}),
      ]);
      const f = state.filter;
      const shown = f === 'all' ? orders : orders.filter((o) => o.status === f);
      const count = (s) => orders.filter((o) => o.status === s).length;
      const low = products.filter((p) => p.show !== false && (p.packs || []).reduce((a, k) => a + (Number(k.stock) || 0), 0) <= 5);
      const btn = (k, l) => `<button data-kf="${k}" class="${f === k ? 'on' : ''}">${l}${k !== 'all' ? ` (${count(k)})` : ''}</button>`;
      box(`
        <div class="kgrid">
          <div>
            <div class="filters">${btn('new', tr('k_new'))}${btn('ready', tr('k_ready'))}${btn('done', tr('k_done'))}${btn('cancelled', tr('k_cancelled'))}${btn('all', tr('k_all'))}</div>
            ${shown.length ? shown.map(orderCard).join('') : `<div class="empty">${tr('k_none')}</div>`}
          </div>
          <aside>
            ${stockSwitches(info)}
            ${low.length ? `<section class="card"><h2 style="margin-top:0">${tr('k_low_h')}</h2>${low.map((p) => `<div class="row between"><span>${esc(words(p.n))}</span><b>${(p.packs || []).reduce((a, k) => a + (Number(k.stock) || 0), 0)}</b></div>`).join('')}</section>` : ''}
            ${owner() ? monthCard(orders, products, costs) : ''}
          </aside>
        </div>`);
      document.querySelectorAll('[data-kf]').forEach((b) => { b.onclick = () => { state.filter = b.dataset.kf; SUBS.orders().catch(fail); }; });
      document.querySelectorAll('[data-gk]').forEach((b) => {
        b.onclick = async () => {
          try { await c.db().setKendraStock(b.dataset.gk, b.dataset.gv); toast(`${tr('k_' + b.dataset.gk)}: ${tr('k_' + b.dataset.gv)}`); SUBS.orders().catch(fail); } catch (e) { fail(e); }
        };
      });
      const find = (id) => orders.find((o) => o.id === id);
      document.querySelectorAll('[data-kready]').forEach((b) => {
        b.onclick = async () => { try { await c.db().moveKendraOrder(b.dataset.kready, 'ready'); toast(tr('k_saved')); SUBS.orders().catch(fail); } catch (e) { fail(e); } };
      });
      document.querySelectorAll('[data-kreopen]').forEach((b) => {
        b.onclick = async () => { try { await c.db().moveKendraOrder(b.dataset.kreopen, 'new'); SUBS.orders().catch(fail); } catch (e) { fail(e); } };
      });
      document.querySelectorAll('[data-kcancel]').forEach((b) => {
        b.onclick = async () => {
          const o = find(b.dataset.kcancel);
          if (!o || !confirm(tr('k_cancel_q', { c: o.code || o.id }))) return;
          try { await c.db().moveKendraOrder(o.id, 'cancelled'); SUBS.orders().catch(fail); } catch (e) { fail(e); }
        };
      });
      document.querySelectorAll('[data-kdone]').forEach((b) => {
        b.onclick = () => {
          const o = find(b.dataset.kdone);
          if (!o) return;
          const panel = openPanel(`<h2>${esc(o.code)} · ${rs(o.total)}</h2>
            <label>${tr('k_paid_how')}</label>
            <div class="choices"><label class="choice"><input type="radio" name="kpaid" value="cash" checked> ${tr('k_cash')}</label><label class="choice"><input type="radio" name="kpaid" value="upi"> ${tr('k_upi')}</label></div>
            <label for="k-bill">${tr('k_bill')}</label><input id="k-bill" maxlength="40">
            <label for="k-note">${tr('k_note')}</label><input id="k-note" maxlength="200">
            <div class="actions"><button class="main" id="k-done">${tr('k_mark_done')}</button></div>`);
          panel.querySelector('#k-done').onclick = async () => {
            const paid = panel.querySelector('input[name="kpaid"]:checked').value;
            try {
              await c.db().moveKendraOrder(o.id, 'done', { paid, bill: panel.querySelector('#k-bill').value.trim(), note: panel.querySelector('#k-note').value.trim() });
              closePanel(); toast(tr('k_saved')); SUBS.orders().catch(fail);
            } catch (e) { fail(e); }
          };
        };
      });
    },

    // ── products ──
    async products() {
      const [products, costs] = await Promise.all([c.db().kendraProducts(), owner() ? c.db().kendraCosts().catch(() => ({})) : Promise.resolve({})]);
      products.sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || words(a.n).localeCompare(words(b.n)));
      box(`
        <div class="row between"><p class="muted">${tr('k_no_pesticide')}</p><button class="main" id="kp-new">${tr('k_add_product')}</button></div>
        ${products.length ? products.map((p) => {
          const stock = (p.packs || []).reduce((a, k) => a + (Number(k.stock) || 0), 0);
          const packs = (p.packs || []).map((k) => `${esc(k.s)} ${rs(k.p ?? k.mrp)}`).join(' · ');
          return `<div class="card click" data-kp="${esc(p.id)}">
            <div class="row between">
              <div class="grow">
                <div class="title">${esc(words(p.n))} ${p.own ? '<span class="chip kown">Khalihan</span>' : ''} ${p.show === false ? `<span class="chip s-cancelled">${tr('k_hidden')}</span>` : ''}</div>
                <div class="sub">${tr('cat_' + p.cat)}${p.brand ? ' · ' + esc(p.brand) : ''}${(p.crops || []).length ? ' · ' + p.crops.map((k) => esc(cropName(k))).join(', ') : ''}</div>
                <div class="sub">${packs}</div>
              </div>
              <div class="side"><span class="chip ${stock <= 0 ? 's-cancelled' : stock <= 5 ? 's-agreed' : 's-paid'}">${tr('k_stock_n', { n: stock })}</span></div>
            </div>
          </div>`;
        }).join('') : `<div class="empty">${tr('k_none')}</div>`}`);
      $('#kp-new').onclick = () => editProduct(null, costs);
      document.querySelectorAll('[data-kp]').forEach((n) => { n.onclick = () => editProduct(products.find((p) => p.id === n.dataset.kp), costs); });
    },

    // ── the square card on Home ──
    async card() {
      const [card, products, info] = await Promise.all([c.db().kendraCard(), c.db().kendraProducts(), c.db().kendraInfo()]);
      const slides = card.slides || [];
      const t0 = today();
      const stateOf = (s) => {
        if (s.live === false) return ['k_slide_off', 'muted'];
        if (s.to && s.to < t0) return ['k_slide_ended', 'muted'];
        if (s.from && s.from > t0) return ['k_slide_sched', 'sky'];
        return ['k_slide_live', 'pos'];
      };
      const firstLive = slides.find((s) => stateOf(s)[0] === 'k_slide_live');
      box(`
        <div class="row between">
          <p class="muted grow">${tr('k_card_d')}</p>
          <button id="kc-onoff" class="kswitch ${card.on ? 'on' : ''}" aria-pressed="${card.on ? 'true' : 'false'}">${card.on ? tr('k_card_on') : tr('k_card_off')}<span class="knob"></span></button>
        </div>
        <div class="kgrid">
          <section class="card">
            <div class="row between"><h2 style="margin:0">${tr('k_slides')}</h2>
              <div class="row">
                <button class="plain" data-kadd="offer">${tr('k_add_offer')}</button>
                <button class="plain" data-kadd="stock">${tr('k_add_stock')}</button>
                <button class="plain" data-kadd="new">${tr('k_add_new')}</button>
                <button class="plain" data-kadd="notice">${tr('k_add_notice')}</button>
              </div>
            </div>
            ${slides.length ? slides.map((s, i) => {
              const [st, cls] = stateOf(s);
              return `<div class="kslide">
                <span class="chip kt-${esc(s.type)}">${tr('st_' + s.type)}</span>
                <div class="grow"><div class="title" style="font-size:15px">${esc(words(s.title) || (s.type === 'stock' ? tr('st_stock') : '—'))}</div>
                  <div class="sub">${esc(words(s.line))}${s.from || s.to ? ` · ${esc(s.from || '…')} → ${esc(s.to || '…')}` : ''}</div></div>
                <span class="kstate ${cls}">${tr(st)}</span>
                <button class="plain" data-kup="${i}" ${i === 0 ? 'disabled' : ''} aria-label="up">${tr('k_up')}</button>
                <button class="plain" data-kdown="${i}" ${i === slides.length - 1 ? 'disabled' : ''} aria-label="down">${tr('k_down')}</button>
                <button class="plain" data-kedit="${i}">✏️</button>
              </div>`;
            }).join('') : `<div class="empty">${tr('k_none')}</div>`}
          </section>
          <aside>
            <section class="card">
              <h2 style="margin-top:0">${tr('k_preview')}</h2>
              ${firstLive ? preview(firstLive, info, products) : `<div class="empty">${tr('k_none')}</div>`}
            </section>
            <section class="card">
              <label for="kc-secs">${tr('k_secs')}</label>
              <select id="kc-secs">${[3, 4, 5, 6, 8].map((n) => `<option value="${n}" ${Number(card.secs || 4) === n ? 'selected' : ''}>${n} s</option>`).join('')}</select>
              <p class="muted small">${tr('k_gentle')}</p>
            </section>
          </aside>
        </div>`);
      const save = async (next, msg) => {
        try { await c.db().saveKendraCard(next); toast(msg || tr('k_saved')); SUBS.card().catch(fail); } catch (e) { fail(e); }
      };
      $('#kc-onoff').onclick = () => save({ ...card, on: !card.on }, card.on ? tr('k_card_off') : tr('k_card_on'));
      $('#kc-secs').onchange = (e) => save({ ...card, secs: Number(e.target.value) });
      document.querySelectorAll('[data-kup]').forEach((b) => {
        b.onclick = () => { const i = Number(b.dataset.kup); const s = slides.slice(); [s[i - 1], s[i]] = [s[i], s[i - 1]]; save({ ...card, slides: s }); };
      });
      document.querySelectorAll('[data-kdown]').forEach((b) => {
        b.onclick = () => { const i = Number(b.dataset.kdown); const s = slides.slice(); [s[i + 1], s[i]] = [s[i], s[i + 1]]; save({ ...card, slides: s }); };
      });
      document.querySelectorAll('[data-kadd]').forEach((b) => { b.onclick = () => editSlide(card, -1, { type: b.dataset.kadd, live: true }, products, save); });
      document.querySelectorAll('[data-kedit]').forEach((b) => { b.onclick = () => editSlide(card, Number(b.dataset.kedit), slides[Number(b.dataset.kedit)], products, save); });
    },

    // ── the Kendra's facts ──
    async info() {
      const i = await c.db().kendraInfo();
      const days = tr('k_days').split(',');
      const v = (x) => esc(x ?? '');
      box(`<section class="card">
        <h2 style="margin-top:0">${tr('k_info_h')}</h2>
        <div class="form">
          <div><label for="ki-name">${tr('k_kname')}</label><input id="ki-name" maxlength="60" value="${v(i.name || 'Khalihan Kendra, Jamner')}"></div>
          <div><label for="ki-phone">${tr('k_phone')}</label><input id="ki-phone" inputmode="tel" maxlength="20" value="${v(i.phone)}"></div>
          <div><label for="ki-lic">${tr('k_lic')}</label><input id="ki-lic" maxlength="80" value="${v(i.lic)}"></div>
          <div><label for="ki-open">${tr('k_open')}</label><input id="ki-open" type="number" min="0" max="23" value="${v(i.open ?? 8)}"></div>
          <div><label for="ki-close">${tr('k_close')}</label><input id="ki-close" type="number" min="0" max="23" value="${v(i.close ?? 19)}"></div>
          <div><label for="ki-day">${tr('k_closed_day')}</label><select id="ki-day"><option value="0">${tr('k_none_day')}</option>${days.map((d, n) => `<option value="${n + 1}" ${Number(i.closedDay) === n + 1 ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
          <div class="wide"><label for="ki-hol">${tr('k_holidays')}</label><input id="ki-hol" value="${v((i.holidays || []).join(', '))}"></div>
          <div><label for="ki-hold">${tr('k_hold')}</label><input id="ki-hold" type="number" min="1" max="14" value="${v(i.holdDays ?? 2)}"></div>
        </div>
        <div class="actions"><button class="main" id="ki-save">${tr('k_save')}</button></div>
        <p class="note" style="margin-top:12px">${tr('k_where_note')}</p>
      </section>`);
      $('#ki-save').onclick = async () => {
        const list = (id) => $(id).value.split(',').map((s) => s.trim()).filter(Boolean);
        const hour = (id, d) => { const n = num($(id).value); return n == null ? d : Math.max(0, Math.min(23, Math.round(n))); };
        const data = {
          name: $('#ki-name').value.trim().slice(0, 60),
          phone: $('#ki-phone').value.replace(/[^0-9+]/g, '').slice(0, 20),
          lic: $('#ki-lic').value.trim().slice(0, 80),
          open: hour('#ki-open', 8),
          close: hour('#ki-close', 19),
          closedDay: Number($('#ki-day').value) || 0,
          holidays: list('#ki-hol').filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
          holdDays: Math.max(1, Math.min(14, Math.round(num($('#ki-hold').value) || 2))),
        };
        try { await c.db().saveKendraInfo(data); toast(tr('k_info_saved')); } catch (e) { fail(e); }
      };
    },

    async complaints() {
      const list = await c.db().kendraComplaints();
      box(list.length ? list.map((x) => `<div class="card">
          <div class="row between"><div class="sub">${when(x.at)} · ${esc(x.code || x.order)} · ${c.phoneShow(x.phone)}${x.done ? ' · ✓' : ''}</div>
            <button class="plain" data-kc="${esc(x.id)}" data-v="${x.done ? '0' : '1'}">${x.done ? tr('k_comp_reopen') : tr('k_comp_done')}</button></div>
          <div style="margin-top:6px;white-space:pre-wrap">${esc(x.text)}</div>
        </div>`).join('') : `<div class="empty">${tr('k_comp_none')}</div>`);
      document.querySelectorAll('[data-kc]').forEach((b) => {
        b.onclick = async () => { try { await c.db().kendraComplaintDone(b.dataset.kc, b.dataset.v === '1'); SUBS.complaints().catch(fail); } catch (e) { fail(e); } };
      });
    },
  };

  /** A small picture of how the slide looks on the phone. */
  function preview(s, info, products) {
    const p = products.find((x) => x.id === s.pid);
    const bg = { offer: '#FFF6CC', stock: '#FFFFFF', new: '#E8F6DF', notice: '#20405E' }[s.type] || '#FFFFFF';
    const dark = s.type === 'notice';
    let body = '';
    if (s.type === 'stock') {
      const st = info.stock || {};
      body = ['urea', 'dap', 'mop'].filter((k) => st[k]).map((k) => `<div class="row between kpv-row"><b>${tr('k_' + k)}</b><span>${tr('k_' + st[k])}</span></div>`).join('');
    } else {
      body = `<div class="kpv-t">${esc(words(s.title) || (p ? words(p.n) : ''))}</div><div class="kpv-l ${s.type}">${esc(words(s.line))}</div>`;
    }
    return `<div class="kpv" style="background:${bg};color:${dark ? '#fff' : '#0a2e4a'}">
      <div class="row between"><small><b>${esc(info.name || 'Khalihan Kendra')}</b></small><span class="chip kt-${esc(s.type)}">${tr('st_' + s.type)}</span></div>
      ${body}
      <span class="kpv-cta" style="background:${dark ? '#fff' : '#20405E'};color:${dark ? '#20405E' : '#fff'}">Kendra →</span>
    </div>`;
  }

  function editSlide(card, index, s, products, save) {
    const v = (x) => esc(x ?? '');
    const w = (m, l) => v((m || {})[l]);
    const isStock = s.type === 'stock';
    const panel = openPanel(`<h2>${tr('k_slide_edit')} · ${tr('st_' + s.type)}</h2>
      ${isStock ? `<p class="muted">${tr('k_stock_auto')}</p>` : ''}
      <div class="form">
        ${['hi', 'mr', 'en'].map((l) => `<div><label for="ks-t-${l}">${tr('k_title_' + l)}</label><input id="ks-t-${l}" maxlength="60" value="${w(s.title, l)}"></div>`).join('')}
        ${isStock ? '' : ['hi', 'mr', 'en'].map((l) => `<div><label for="ks-l-${l}">${tr('k_line_' + l)}</label><input id="ks-l-${l}" maxlength="80" value="${w(s.line, l)}" ${s.type === 'offer' ? `placeholder="${esc(tr('k_line_hint_offer'))}"` : ''}></div>`).join('')}
        ${s.type === 'offer' || s.type === 'new' ? `<div class="wide"><label for="ks-p">${tr('k_product')}</label><select id="ks-p"><option value="">—</option>${products.map((p) => `<option value="${esc(p.id)}" ${p.id === s.pid ? 'selected' : ''}>${esc(words(p.n))}</option>`).join('')}</select></div>` : ''}
        <div><label for="ks-from">${tr('k_from')}</label><input id="ks-from" type="date" value="${v(s.from)}"></div>
        <div><label for="ks-to">${tr('k_to')}</label><input id="ks-to" type="date" value="${v(s.to)}"></div>
      </div>
      <label class="check"><input type="checkbox" id="ks-live" ${s.live !== false ? 'checked' : ''}> ${tr('k_live')}</label>
      <div class="actions row">
        <button class="main" id="ks-save">${tr('k_save')}</button>
        ${index >= 0 ? `<button class="danger" id="ks-del">${tr('k_delete')}</button>` : ''}
      </div>`);
    const read = (pre) => {
      const out = {};
      ['hi', 'mr', 'en'].forEach((l) => { const el = panel.querySelector(`#${pre}-${l}`); if (el && el.value.trim()) out[l] = el.value.trim(); });
      return out;
    };
    panel.querySelector('#ks-save').onclick = () => {
      const next = {
        type: s.type,
        title: read('ks-t'),
        line: isStock ? {} : read('ks-l'),
        pid: (panel.querySelector('#ks-p') || {}).value || '',
        from: panel.querySelector('#ks-from').value || '',
        to: panel.querySelector('#ks-to').value || '',
        live: panel.querySelector('#ks-live').checked,
      };
      if (!isStock && !Object.keys(next.title).length && !next.pid) { toast(tr('k_err_name')); return; }
      const slides = (card.slides || []).slice();
      if (index >= 0) slides[index] = next; else slides.push(next);
      closePanel();
      save({ ...card, slides: slides.slice(0, 12) });
    };
    const del = panel.querySelector('#ks-del');
    if (del) del.onclick = () => { const slides = (card.slides || []).filter((_, i) => i !== index); closePanel(); save({ ...card, slides }); };
  }

  function editProduct(p, costs) {
    const x = p || { n: {}, cat: 'seed', crops: [], packs: [{ s: '', mrp: null, p: null, stock: 0 }], facts: {}, show: true, own: false, govt: false, order: 100 };
    const v = (y) => esc(y ?? '');
    const myCost = (costs[x.id] || {}).costs || {};
    const packRow = (k, i) => `<div class="kpack" data-row="${i}">
        <input aria-label="${esc(tr('k_size'))}" placeholder="${esc(tr('k_size'))}" data-f="s" maxlength="30" value="${v(k.s)}">
        <input aria-label="${esc(tr('k_mrp'))}" placeholder="${esc(tr('k_mrp'))}" data-f="mrp" inputmode="decimal" value="${v(k.mrp)}">
        <input aria-label="${esc(tr('k_price'))}" placeholder="${esc(tr('k_price'))}" data-f="p" inputmode="decimal" value="${v(k.p)}">
        <input aria-label="${esc(tr('k_stock'))}" placeholder="${esc(tr('k_stock'))}" data-f="stock" inputmode="numeric" value="${v(k.stock)}">
        ${owner() ? `<input aria-label="${esc(tr('k_cost_for', { s: k.s || '' }))}" placeholder="🔒 ₹" data-f="cost" inputmode="decimal" value="${v(myCost[k.s])}">` : ''}
      </div>`;
    const panel = openPanel(`<h2>${p ? tr('k_edit_product') : tr('k_add_product')}</h2>
      <div class="form">
        ${['hi', 'mr', 'en'].map((l) => `<div><label for="kp-n-${l}">${tr('k_name_' + l)}</label><input id="kp-n-${l}" maxlength="80" value="${v((x.n || {})[l])}"></div>`).join('')}
        <div><label for="kp-cat">${tr('k_cat')}</label><select id="kp-cat">${CATS.map((k) => `<option value="${k}" ${x.cat === k ? 'selected' : ''}>${tr('cat_' + k)}</option>`).join('')}</select></div>
        <div><label for="kp-brand">${tr('k_brand')}</label><input id="kp-brand" maxlength="40" value="${v(x.brand)}"></div>
        <div><label for="kp-order">${tr('k_order')}</label><input id="kp-order" type="number" min="0" max="999" value="${v(x.order ?? 100)}"></div>
      </div>
      <p class="muted small">${tr('k_no_pesticide')}</p>
      <label class="check"><input type="checkbox" id="kp-own" ${x.own ? 'checked' : ''}> ${tr('k_own')}</label>
      <label class="check"><input type="checkbox" id="kp-govt" ${x.govt ? 'checked' : ''}> ${tr('k_govt')}</label>
      <label class="check"><input type="checkbox" id="kp-show" ${x.show !== false ? 'checked' : ''}> ${tr('k_show')}</label>
      <label>${tr('k_crops')}</label>
      <div class="choices">${KCROPS.map(([k]) => `<label class="choice"><input type="checkbox" data-crop="${esc(k)}" ${(x.crops || []).includes(k) ? 'checked' : ''}> ${esc(cropName(k))}</label>`).join('')}</div>
      <label>${tr('k_packs')}${owner() ? ' · 🔒' : ''}</label>
      <div class="kpack khead" aria-hidden="true"><span>${tr('k_size')}</span><span>${tr('k_mrp')}</span><span>${tr('k_price')}</span><span>${tr('k_stock')}</span>${owner() ? '<span>🔒 ₹</span>' : ''}</div>
      <div id="kp-packs">${(x.packs && x.packs.length ? x.packs : [{ s: '' }]).map(packRow).join('')}</div>
      <button class="plain" id="kp-addpack">${tr('k_add_pack')}</button>
      <div id="kp-margin" class="msum" aria-live="polite"></div>
      <label>${tr('k_facts')}</label>
      <div class="form">${FACTS.map((f) => `<div><label for="kp-f-${f}">${tr('f_' + f)}</label><input id="kp-f-${f}" maxlength="80" value="${v((x.facts || {})[f])}"></div>`).join('')}</div>
      <div class="form"><div class="wide"><label for="kp-lic">${tr('k_lic')}</label><input id="kp-lic" maxlength="60" value="${v(x.lic)}"></div></div>
      <div class="actions row">
        <button class="main" id="kp-save">${tr('k_save')}</button>
        ${p ? `<button class="danger" id="kp-del">${tr('k_delete')}</button>` : ''}
      </div>`);
    const rows = () => [...panel.querySelectorAll('.kpack')].map((r) => {
      const get = (f) => { const el = r.querySelector(`[data-f="${f}"]`); return el ? el.value.trim() : ''; };
      return { s: get('s').slice(0, 30), mrp: num(get('mrp')), p: num(get('p')), stock: Math.max(0, Math.round(num(get('stock')) || 0)), cost: num(get('cost')) };
    });
    const showMargin = () => {
      if (!owner()) return;
      const lines = rows().filter((k) => k.s && k.cost != null && (k.p ?? k.mrp) != null).map((k) => {
        const sell = k.p ?? k.mrp; const m = sell - k.cost;
        return `<p class="${m < 0 ? 'neg' : 'pos'}">${tr('k_margin_line', { s: esc(k.s), m: c.signedRs(m), p: sell ? (m / sell * 100).toFixed(1) : '0' })}</p>`;
      });
      panel.querySelector('#kp-margin').innerHTML = lines.join('');
    };
    panel.querySelector('#kp-packs').oninput = showMargin;
    showMargin();
    panel.querySelector('#kp-addpack').onclick = () => {
      const wrap = panel.querySelector('#kp-packs');
      if (wrap.querySelectorAll('.kpack').length >= 6) return;
      wrap.insertAdjacentHTML('beforeend', packRow({ s: '' }, wrap.children.length));
    };
    panel.querySelector('#kp-save').onclick = async () => {
      const n = {};
      ['hi', 'mr', 'en'].forEach((l) => { const val = panel.querySelector(`#kp-n-${l}`).value.trim(); if (val) n[l] = val; });
      if (!Object.keys(n).length) return toast(tr('k_err_name'));
      const packs = rows().filter((k) => k.s && (k.p != null || k.mrp != null));
      if (!packs.length) return toast(tr('k_err_pack'));
      const bad = packs.find((k) => k.p != null && k.mrp != null && k.p > k.mrp);
      if (bad) return toast(tr('k_err_price', { s: bad.s }));
      const facts = {};
      FACTS.forEach((f) => { const val = panel.querySelector(`#kp-f-${f}`).value.trim(); if (val) facts[f] = val; });
      const data = {
        n,
        cat: panel.querySelector('#kp-cat').value,
        crops: [...panel.querySelectorAll('[data-crop]:checked')].map((b) => b.dataset.crop),
        brand: panel.querySelector('#kp-brand').value.trim(),
        own: panel.querySelector('#kp-own').checked,
        govt: panel.querySelector('#kp-govt').checked,
        show: panel.querySelector('#kp-show').checked,
        order: Math.round(num(panel.querySelector('#kp-order').value) ?? 100),
        packs: packs.map(({ s, mrp, p: price, stock }) => ({ s, mrp, p: price, stock })),
        facts,
        lic: panel.querySelector('#kp-lic').value.trim(),
      };
      if (!CATS.includes(data.cat)) return toast(tr('k_no_pesticide'));
      try {
        const id = await c.db().saveKendraProduct(p ? p.id : null, data);
        if (owner()) {
          const cost = {};
          packs.forEach((k) => { if (k.cost != null) cost[k.s] = k.cost; });
          await c.db().saveKendraCost(id, cost);
        }
        closePanel(); toast(tr('k_saved')); SUBS.products().catch(fail);
      } catch (e) { fail(e); }
    };
    const del = panel.querySelector('#kp-del');
    if (del) {
      del.onclick = async () => {
        if (!confirm(tr('k_delete_q'))) return;
        try { await c.db().deleteKendraProduct(p.id); closePanel(); SUBS.products().catch(fail); } catch (e) { fail(e); }
      };
    }
  }

  return { page };
}
