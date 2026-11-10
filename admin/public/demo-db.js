// Khalihan Admin — demo data (open the panel with ?demo). Nothing is saved;
// it is only for trying the screens without touching the real database.
const day = (n, h = 10) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 15, 0, 0); return d; };

export async function connect() {
  const me = { email: 'owner@example.com', role: 'owner', name: 'Demo owner' };
  // Spread over two weeks so the dashboard has something to show.
  const crops = [['Maize', 1980], ['Cotton', 7400], ['Soybean', 4650], ['Maize', 1990]];
  const older = [];
  for (let n = 3; n < 14; n++) {
    const k = (n * 7) % 5;
    for (let j = 0; j < k; j++) {
      const [crop, price] = crops[(n + j) % crops.length];
      const paid = n > 4 && j % 2 === 0;
      older.push({
        id: `o${n}_${j}`, crop, qty: 20 + ((n * 13 + j * 7) % 90), price, village: ['Pahur', 'Jamner', 'Shendurni', 'Neri'][j % 4],
        district: 'jalgaon', name: '', phone: '98220' + String(10000 + n * 100 + j), offer: 'demo', lang: 'mr', app: '1.0.2',
        at: day(n, 9 + j), status: paid ? 'paid' : (j % 3 === 1 ? 'cancelled' : 'agreed'),
        final_price: paid ? price : undefined, final_qty: paid ? 20 + ((n * 13 + j * 7) % 90) : undefined,
        history: [{ status: 'called', by: 'staff@example.com', at: day(n, 10 + j), note: '' }, ...(paid ? [{ status: 'paid', by: 'staff@example.com', at: day(Math.max(0, n - 2), 15), note: '' }] : [])],
      });
    }
  }
  let requests = [
    { id: 'r1', crop: 'Maize', qty: 40, price: 1980, village: 'Shendurni', district: 'jalgaon', name: 'Ramesh Patil', phone: '+919876543210', uid: 'u1', offer: 'maize-jalgaon-20261008', lang: 'mr', app: '1.0.2', at: day(0, 9), status: 'new', history: [] },
    { id: 'r2', crop: 'Cotton', qty: 25, price: 7400, village: 'Pahur', district: 'jalgaon', name: '', phone: '+919812345678', uid: 'u2', offer: 'cotton-jalgaon-20261007', lang: 'hi', app: '1.0.2', at: day(1, 16), status: 'called', history: [{ status: 'called', by: 'staff@example.com', at: day(1, 17), note: 'Kal subah aayenge' }] },
    { id: 'r3', crop: 'Maize', qty: 120, price: 1980, village: 'Jamner', district: 'jalgaon', name: 'Sunil Mahajan', phone: '9822001122', offer: 'maize-jalgaon-20261008', lang: 'mr', app: '1.0.1', at: day(2, 11), status: 'paid', final_price: 1990, final_qty: 118, history: [{ status: 'called', by: 'staff@example.com', at: day(2, 12), note: '' }, { status: 'paid', by: 'staff@example.com', at: day(1, 15), note: '' }] },
    ...older,
  ];
  const dealMoney = { r3: { rate: 2140, transport: 6500, labour: 1200, other: 0 } };
  older.filter((r) => r.status === 'paid').forEach((r, i) => {
    if (i % 3 !== 2) dealMoney[r.id] = { rate: r.price + 160 + (i % 4) * 25, transport: 40 * r.final_qty, labour: 10 * r.final_qty, other: 0 };
  });
  const offerMoney = { 'makka-jalgaon-20261008': { rate: 2140, transport: 45, other: 15 } };
  let offers = { version: 3, list: [{ id: 'makka-jalgaon-20261008', crops: ['maize'], districts: ['jalgaon'], state: 'Maharashtra', price: 1980, pickup: 'doorstep', centre: '', payment_days: 0, until: day(-6).toISOString().slice(0, 10), whatsapp: '919800000000', moisture_max: 14, min_qty: 10, note: { hi: 'खेत से उठाएँगे' } }] };
  const features = { login: true, sell: true, kendra: true };
  let launchStates = ['Maharashtra'];
  const sellDistricts = { Maharashtra: ['jalgaon'] };
  let notice = null;
  let festival = null;
  // Free Plus gift codes (Admin 1.16).
  let gifts = [
    { id: 'R7KM4QXP', name: 'Mera phone', note: '', until: null, test: true, device: 'a1b2c3d4e5f6g7h8i9j0', claimed: day(0, 8), app: '1.0.6', at: day(0, 7) },
    { id: 'HN3T8WCE', name: 'Ramesh Patil, Shendurni', note: 'Tester', until: null, test: false, device: 'z9y8x7w6v5u4t3s2r1q0', claimed: day(1, 18), app: '1.0.6', at: day(1, 17) },
    { id: 'PQ6VB2KD', name: 'Sunil Mahajan, Jamner', note: 'KVK', until: day(-30, 23), test: false, at: day(0, 9) },
  ];
  // Business Plan v2 — made-up businesses, only for trying the screens.
  const iso = (n) => day(n).toISOString().slice(0, 10);
  let procs = [
    { id: 'p1', name: 'Demo Starch Mill', place: 'Chalisgaon', crops: ['Maize'], contact: 'Purchase desk', phone: '9800000001', gstin: '27AAAAA0000A1Z5', gstActive: true, mcaActive: true, checkedOn: iso(5), written: true, formula: 'Gate rate − ₹15; nami 14% se upar har 1% pe 1% kat', moistureMax: 14, cuts: 'Kachra 2% se upar 1:1 kat', payDays: 7, payWay: 'RTGS', notes: '' },
    { id: 'p2', name: 'Demo Ginning', place: 'Jamner', crops: ['Cotton'], contact: 'Malik', phone: '9800000002', gstin: '', gstActive: false, mcaActive: false, checkedOn: '', written: false, formula: '', moistureMax: 8, cuts: '', payDays: 15, payWay: 'NEFT', notes: 'Formula likhit me maangna hai' },
    { id: 'p3', name: 'Demo Dal Mill', place: 'Jalgaon', crops: ['Bengal Gram', 'Tur'], contact: 'Office', phone: '9800000003', gstin: '27BBBBB0000B1Z5', gstActive: true, mcaActive: false, checkedOn: iso(20), written: true, formula: 'FAQ rate − transport ₹40', moistureMax: 12, cuts: '', payDays: 10, payWay: 'RTGS', notes: '' },
  ];
  let quotes = [];
  for (let n = 0; n < 14; n++) {
    quotes.push({ id: 'qa' + n, proc: 'p1', day: iso(n), crop: 'Maize', rate: 2140 + ((n * 37) % 90) - 40, basis: 'gate', note: '' });
    if (n % 2 === 0) quotes.push({ id: 'qb' + n, proc: 'p3', day: iso(n), crop: 'Bengal Gram', rate: 5450 + ((n * 23) % 120), basis: 'gate', note: '' });
  }
  quotes.push({ id: 'qc1', proc: 'p2', day: iso(2), crop: 'Cotton', rate: 7720, basis: 'gate', note: 'Phone pe' });
  let payments = [
    { id: 'pp1', proc: 'p1', ref: 'Gaadi #1 · 118 qtl', amount: 252520, due: iso(3), paid: '', utr: '' },
    { id: 'pp2', proc: 'p3', ref: 'Gaadi #2 · 96 qtl', amount: 521000, due: iso(-4), paid: '', utr: '' },
    { id: 'pp3', proc: 'p1', ref: 'Trial lot', amount: 42800, due: iso(12), paid: iso(11), utr: 'UTR123' },
  ];
  let compliance = [
    { id: 'c1', name: 'GST return (GSTR-3B)', kind: 'filing', due: iso(-6), every: 1, remind: 7, notes: '' },
    { id: 'c2', name: 'DML licence (MSAMB)', kind: 'licence', due: iso(-40), every: 12, remind: 30, notes: 'Bank guarantee ₹5 lakh' },
    { id: 'c3', name: 'Trademark — Khalihan (class 31)', kind: 'trademark', due: iso(3), every: 0, remind: 15, notes: 'Hearing ki tareekh' },
  ];
  let plan = { kadam: 0, values: { partner: false, survey: 9, path: false } };
  // Made-up suggestions (no name or phone, like the real ones).
  let feedback = [
    { id: 'f1', text: 'Kapas ka bhav Pachora ka bhi dikhao', state: 'Maharashtra', district: 'Jalgaon', lang: 'hi', app: '1.0.6', at: day(0, 8) },
    { id: 'f2', text: 'खताची किंमत पाहिजे', state: 'Maharashtra', district: 'Jalgaon', lang: 'mr', app: '1.0.5', at: day(3), done: true, note: 'MRP list v1.0.7 mein', by: 'owner@example.com' },
    { id: 'f3', text: 'कांद्याचा भाव कालचा दिसतो, आजचा कधी येतो?', state: 'Maharashtra', district: 'Nashik', lang: 'mr', app: '1.0.6', at: day(1, 19) },
    { id: 'f4', text: 'Please add soybean price alert at night also', state: 'Maharashtra', district: 'Latur', lang: 'en', app: '1.0.6', at: day(2, 7) },
    { id: 'f5', text: 'मौसम बहुत अच्छा बताता है, धन्यवाद', state: 'Maharashtra', district: 'Jalgaon', lang: 'hi', app: '1.0.5', at: day(5), done: true, by: 'staff@example.com' },
    { id: 'f6', text: 'जामनेर मंडीचा भाव रोज यावा', state: 'Maharashtra', district: 'Jalgaon', lang: 'mr', app: '1.0.6', at: day(9, 18) },
  ];
  const FB_PAGE = 4; // small in the demo, so "older" can be tried
  const users = [
    { id: 'u1', phone: '+919876543210', name: 'Ramesh Patil', state: 'Maharashtra', district: 'Jalgaon', lang: 'mr', app: '1.0.2', crops: ['Maize', 'Cotton'], seen: day(0, 9), created: day(5) },
    { id: 'u2', phone: '+919812345678', name: '', state: 'Maharashtra', district: 'Jalgaon', lang: 'hi', app: '1.0.2', crops: ['Cotton'], seen: day(1), created: day(1) },
  ];
  const deletions = [{ id: 'u9', phone: '+919900112233', at: day(2) }];
  const staff = [{ id: 'owner@example.com', role: 'owner', name: 'Demo owner' }, { id: 'staff@example.com', role: 'staff', name: 'Jamner' }];
  const audit = [{ id: 'a1', by: 'staff@example.com', action: 'sell_request_status', details: { id: 'r2', status: 'called' }, at: day(1, 17) }];
  const log = (action, details) => audit.unshift({ id: 'a' + Date.now(), by: me.email, action, details, at: new Date() });

  // Khalihan Kendra — made-up goods and orders (names and prices are samples).
  let kInfo = { name: 'Khalihan Kendra, Jamner', address: 'Pahur road, Jamner', phone: '9800000000', lic: 'DEMO-LIC-001', open: 8, close: 19, closedDay: 0, holidays: [], districts: ['jalgaon'], lat: 20.8106, lon: 75.7798, km: 25, holdDays: 2, stock: { urea: 'ok', dap: 'low', mop: 'out' }, stockAt: new Date() };
  let kProducts = [
    { id: 'kp1', n: { hi: 'चना बीज · किस्म A', mr: 'हरभरा बियाणे · वाण A', en: 'Chana seed · variety A' }, cat: 'seed', crops: ['bengal gram'], brand: 'Company 1', own: false, govt: false, show: true, order: 10, packs: [{ s: '10 kg', mrp: 1250, p: 1200, stock: 14 }, { s: '30 kg', mrp: 3600, p: 3450, stock: 22 }], facts: { variety: 'A', days: '105', lot: 'L-2291', test: '2026-08-20', germ: '85%' }, lic: '' },
    { id: 'kp2', n: { hi: 'चना बीज · किस्म B', en: 'Chana seed · variety B' }, cat: 'seed', crops: ['bengal gram'], brand: 'Company 2', own: false, govt: false, show: true, order: 11, packs: [{ s: '30 kg', mrp: 3500, p: 3400, stock: 4 }], facts: {}, lic: '' },
    { id: 'kp3', n: { hi: 'राइज़ोबियम कल्चर (चना)', en: 'Rhizobium culture (chana)' }, cat: 'organic', crops: ['bengal gram', 'soyabean', 'arhar'], brand: '', own: true, govt: false, show: true, order: 20, packs: [{ s: '250 ml', mrp: 120, p: 99, stock: 40 }], facts: {}, lic: '' },
    { id: 'kp4', n: { hi: 'सूक्ष्म पोषक मिश्रण', en: 'Micronutrient mix' }, cat: 'micro', crops: ['cotton', 'bengal gram', 'wheat'], brand: '', own: true, govt: false, show: true, order: 21, packs: [{ s: '1 kg', mrp: 260, p: 230, stock: 3 }], facts: { grade: 'Maharashtra notified grade' }, lic: '' },
    { id: 'kp5', n: { hi: 'DAP', en: 'DAP' }, cat: 'fert', crops: ['bengal gram', 'wheat', 'cotton'], brand: 'Company 3', own: false, govt: true, show: true, order: 30, packs: [{ s: '50 kg', mrp: 1350, p: null, stock: 8 }], facts: {}, lic: '' },
  ];
  const kCost = { kp1: { costs: { '10 kg': 1080, '30 kg': 3150 } }, kp3: { costs: { '250 ml': 55 } } };
  let kCard = { on: true, secs: 4, slides: [
    { type: 'offer', title: { hi: 'Khalihan वर्मी कम्पोस्ट' }, line: { hi: '5 बैग पर ₹50 कम' }, pid: '', from: '', to: day(-7).toISOString().slice(0, 10), live: true },
    { type: 'stock', title: {}, line: {}, pid: '', from: '', to: '', live: true },
    { type: 'new', title: { hi: 'रबी के लिए चना बीज' }, line: { hi: 'किस्म A · Company 1' }, pid: 'kp1', from: '', to: '', live: true },
    { type: 'notice', title: { hi: 'दिवाली पर Kendra बंद' }, line: { hi: '[तारीख] से [तारीख] तक' }, pid: '', from: day(-20).toISOString().slice(0, 10), to: day(-24).toISOString().slice(0, 10), live: true },
  ] };
  let kOrders = [
    { id: 'ko1', code: 'KJ-7F3QX', items: [{ pid: 'kp1', n: 'चना बीज · किस्म A', s: '30 kg', q: 2, p: 3450 }, { pid: 'kp3', n: 'राइज़ोबियम कल्चर (चना)', s: '250 ml', q: 1, p: 99 }], total: 6999, day: day(-1).toISOString().slice(0, 10), slot: 'm', name: 'Ramesh Patil', phone: '9876543210', village: 'Shendurni', district: 'jalgaon', lang: 'mr', app: '1.0.4', at: new Date(Date.now() - 40 * 60e3), status: 'new' },
    { id: 'ko2', code: 'KJ-2MB8D', items: [{ pid: 'kp5', n: 'DAP', s: '50 kg', q: 4, p: 1350 }], total: 5400, day: day(0).toISOString().slice(0, 10), slot: 'e', name: '', phone: '9812345678', village: 'Pahur', district: 'jalgaon', lang: 'hi', app: '1.0.4', at: new Date(Date.now() - 3 * 3600e3), status: 'ready' },
    { id: 'ko3', code: 'KJ-Q8N1A', items: [{ pid: 'kp1', n: 'चना बीज · किस्म A', s: '10 kg', q: 3, p: 1200 }], total: 3600, day: day(2).toISOString().slice(0, 10), slot: 'a', name: 'Sunil', phone: '9822001122', village: 'Jamner', district: 'jalgaon', lang: 'mr', app: '1.0.4', at: day(2, 11), status: 'done', paid: 'cash' },
  ];
  const kComplaints = [{ id: 'kc1', order: 'ko3', code: 'KJ-Q8N1A', text: 'Ek bori fati hui thi', phone: '9822001122', at: day(1, 12) }];

  // 📊 App numbers (Admin 1.18): sample numbers. "?demo&setup" shows the
  // page before the owner's one-time setup.
  const ymd = (d) => d.toISOString().slice(0, 10);
  const series = (len, f) => Array.from({ length: len }, (_, i) => f(len - 1 - i));
  const ownerStats = new URLSearchParams(location.search).has('setup')
    ? { at: new Date(Date.now() - 2 * 3600e3), sa: 'firebase-adminsdk-demo@khalihan-demo.iam.gserviceaccount.com', project: 'khalihan-demo',
        ga: { ok: false, msg: 'no_property', hint: '' },
        play: { ok: false, msg: 'no_bucket', hint: '' } }
    : {
      at: new Date(Date.now() - 2 * 3600e3),
      ga: {
        ok: true, through: ymd(day(1)), a1: 14, a7: 31, a28: 52, n1: 3, n7: 17, n28: 41, today: 6,
        daily: series(30, (b) => ({ d: ymd(day(b)), a: Math.max(2, Math.round(4 + (30 - b) * 0.45 + ((b * 7) % 5))), n: Math.max(0, Math.round((30 - b) / 6 + ((b * 3) % 3) - 1)) })),
        events: [
          { k: 'session_start', c: 412, u: 52 }, { k: 'screen_view', c: 1630, u: 52 }, { k: 'user_engagement', c: 980, u: 52 },
          { k: 'crop_opened', c: 233, u: 38 }, { k: 'weather_opened', c: 141, u: 33 }, { k: 'first_open', c: 41, u: 41 },
          { k: 'day_voice', c: 62, u: 19 }, { k: 'where_to_sell', c: 48, u: 17 }, { k: 'market_opened', c: 40, u: 15 },
          { k: 'shared', c: 27, u: 12 }, { k: 'crop_pinned', c: 35, u: 14 }, { k: 'alert_toggled', c: 18, u: 9 },
          { k: 'hold_or_sell', c: 15, u: 8 }, { k: 'scheme_open', c: 22, u: 10 }, { k: 'calendar_open', c: 12, u: 7 },
          { k: 'price_map', c: 9, u: 5 }, { k: 'compare_opened', c: 8, u: 4 }, { k: 'feedback_sent', c: 3, u: 3 },
          { k: 'widget_opened', c: 11, u: 3 }, { k: 'app_remove', c: 6, u: 6 }, { k: 'prices_failed', c: 2, u: 2 },
          { k: 'notification_open', c: 25, u: 11 }, { k: 'app_update', c: 30, u: 30 },
        ],
        screens: [
          { k: 'tab_home', v: 520, u: 52 }, { k: 'crop', v: 233, u: 38 }, { k: 'tab_prices', v: 190, u: 35 },
          { k: 'weather', v: 141, u: 33 }, { k: 'where_sell', v: 48, u: 17 }, { k: 'market_locator', v: 40, u: 15 },
          { k: 'tab_services', v: 37, u: 16 }, { k: 'schemes', v: 22, u: 10 }, { k: 'tab_profile', v: 30, u: 14 },
          { k: 'mandi', v: 19, u: 9 }, { k: 'hold_sell', v: 15, u: 8 }, { k: 'price_graph', v: 14, u: 7 },
        ],
        versions: [{ k: '1.0.6', n: 49 }, { k: '1.0.5', n: 3 }],
        regions: [{ k: 'Maharashtra', n: 44 }, { k: 'Madhya Pradesh', n: 4 }, { k: 'Gujarat', n: 2 }],
        crops: [{ k: 'Cotton', n: 61 }, { k: 'Soyabean', n: 44 }, { k: 'Maize', n: 31 }, { k: 'Onion', n: 24 }, { k: 'Bengal Gram(Gram)(Whole)', n: 19 }, { k: 'Wheat', n: 15 }, { k: 'Tur', n: 12 }],
        states: [{ k: 'Maharashtra', n: 47 }, { k: 'Madhya Pradesh', n: 5 }],
        districts: [{ k: 'Jalgaon', n: 26 }, { k: 'Buldhana', n: 7 }, { k: 'Aurangabad', n: 5 }, { k: 'Jalna', n: 4 }, { k: 'Dhule', n: 3 }, { k: 'Burhanpur', n: 3 }],
        langs: [{ k: 'mr', n: 30 }, { k: 'hi', n: 18 }, { k: 'en', n: 4 }],
        dims: ['crop', 'district', 'from', 'language', 'state', 'what'], dims_note: '',
      },
      play: {
        ok: true, through: ymd(day(4)), total: 96, now: 88, active: 84, i28: 59, u28: 6, rating: 4.8, crash28: 0, anr28: 1,
        daily: series(26, (b) => ({ d: ymd(day(b + 4)), i: Math.max(0, Math.round((26 - b) / 5 + ((b * 5) % 4) - 1)), u: b % 9 === 0 ? 1 : 0, up: b < 6 ? 8 : 0 })),
        versions: [{ k: '11', n: 79 }, { k: '9', n: 5 }],
      },
    };

  return {
    demo: true,
    project: 'demo',
    onUser(cb) { setTimeout(() => cb(me), 50); },
    login: async () => {},
    logout: async () => { location.href = location.pathname; },
    async sellRequests() { return requests.map((r) => ({ ...r })); },
    watchRequests(onAdded, onState) {
      if (onState) setTimeout(() => onState(true), 300);
      // A made-up farmer sends a request a few seconds after opening.
      const t = setTimeout(() => {
        const r = { id: 'r' + Date.now(), crop: 'Soybean', qty: 35, price: 4650, village: 'Neri', district: 'jalgaon', name: 'Ganesh', phone: '+919850011223', uid: 'u3', offer: 'demo', lang: 'mr', app: '1.0.3', at: new Date(), status: 'new', history: [] };
        requests = [r, ...requests];
        onAdded({ ...r });
      }, 7000);
      return () => clearTimeout(t);
    },
    async allDealMoney() { return JSON.parse(JSON.stringify(dealMoney)); },
    async saveDealMoney(id, data) { dealMoney[id] = { ...data }; log('deal_money', { id, rate: data.rate }); },
    async allOfferMoney() { return JSON.parse(JSON.stringify(offerMoney)); },
    async saveOfferMoney(id, data) { offerMoney[id] = { ...data }; log('offer_money', { id, rate: data.rate }); },
    async moveRequest(id, status, note, extra) {
      requests = requests.map((r) => (r.id !== id ? r : {
        ...r, status, note: note || r.note, assigned: me.email,
        final_price: extra && extra.final_price ? Number(extra.final_price) : r.final_price,
        final_qty: extra && extra.final_qty ? Number(extra.final_qty) : r.final_qty,
        history: [...(r.history || []), { status, by: me.email, at: new Date(), note: note || '' }],
      }));
      log('sell_request_status', { id, status });
    },
    async offers() { return { version: offers.version, list: offers.list.map((o) => ({ ...o })) }; },
    async saveOffers(change) {
      offers = { version: offers.version + 1, list: change(offers.list.map((o) => ({ ...o }))) };
      log('offers', { version: offers.version });
      return offers;
    },
    async appConfig() { return { features: { ...features }, launch_states: [...launchStates], sell_districts: JSON.parse(JSON.stringify(sellDistricts)), notice: notice ? JSON.parse(JSON.stringify(notice)) : null, festival: festival ? { ...festival } : null }; },
    async setFestival(f) { festival = f ? { ...f } : null; log('festival', f ? { kind: f.kind } : { removed: true }); },
    async setNotice(n) { notice = n ? JSON.parse(JSON.stringify(n)) : null; log('notice', n ? { kind: n.kind } : { removed: true }); },
    async waitingCounts() { return { _total: 737, 'Madhya Pradesh': 412, Gujarat: 230, 'Uttar Pradesh': 95 }; },
    async setFeature(key, on) { features[key] = on; log('feature', { key, on }); },
    async setLaunchStates(list) { launchStates = [...list]; log('launch_states', { states: list.join(', ') }); },
    async setSellDistricts(state, keys) { sellDistricts[state] = [...keys]; log('sell_districts', { state, on: keys.length }); },
    async liveStatus(pairs) {
      const out = {};
      const fresh = { Maharashtra: 4210 };
      for (const [state] of pairs) {
        if (fresh[state]) out[state] = { at: new Date(Date.now() - 3 * 3600e3), rows: fresh[state] };
        else if (state === 'Telangana') out[state] = { at: new Date(Date.now() - 18 * 86400e3), rows: 900 };
        else out[state] = null;
      }
      return out;
    },
    async serverStatus() {
      return {
        at: new Date(Date.now() - 2 * 3600e3), mode: 'refresh', took_s: 287, gov_api_down: true,
        phone_states: 28, feed_at: new Date(Date.now() - 3 * 3600e3).toISOString(),
        states: {
          Maharashtra: { source: 'msamb', rows: 4210, error: 'data.gov.in: 503 Server Error: Service Unavailable' },
          'Madhya Pradesh': { source: '', rows: 0, error: 'data.gov.in: skipped — the government API is down this run · second source: eNAM trade data: HTTP 500' },
          Gujarat: { source: '', rows: 0, error: 'data.gov.in: skipped — the government API is down this run' },
        },
      };
    },
    async liveDistricts(slug) {
      const lists = {
        madhya_pradesh: ['Burhanpur', 'Khandwa', 'Khargone', 'Barwani', 'Dhar', 'Indore', 'Ujjain', 'Dewas', 'Bhopal', 'Sehore', 'Vidisha', 'Sagar', 'Jabalpur', 'Chhindwara', 'Betul', 'Harda', 'Hoshangabad', 'Ratlam', 'Mandsaur', 'Neemuch'],
        gujarat: ['Surat', 'Tapi', 'Navsari', 'Vadodara(Baroda)', 'Rajkot', 'Ahmedabad', 'Junagarh', 'Amreli', 'Bhavnagar', 'Mehsana'],
      };
      return lists[slug] || [];
    },
    async feedback() { return feedback.map((f) => ({ ...f })); },
    async feedbackPage(after) {
      const from = after || 0;
      const page = feedback.slice(from, from + FB_PAGE).map((f) => ({ ...f }));
      return { rows: page, next: from + FB_PAGE < feedback.length ? from + FB_PAGE : null };
    },
    async feedbackCounts() {
      const done = feedback.filter((f) => f.done).length;
      return { total: feedback.length, done, open: feedback.length - done };
    },
    async feedbackDone(id, done) { const f = feedback.find((x) => x.id === id); if (f) { f.done = done; f.by = me.email; } log('feedback_done', { id, done }); },
    async feedbackNote(id, note) { const f = feedback.find((x) => x.id === id); if (f) { f.note = note; f.by = me.email; } log('feedback_note', { id }); },
    async feedbackDelete(id) { feedback = feedback.filter((x) => x.id !== id); log('feedback_delete', { id }); },
    async usersCount() { return users.length; },
    async users() { return users.map((u) => ({ ...u })); },
    async userByPhone(phone) { return users.filter((u) => u.phone === phone); },
    async requestsOf(uid) { return requests.filter((r) => r.uid === uid); },
    async deletions() { return deletions.map((d) => ({ ...d })); },
    async wipeFarmer(uid) { const d = deletions.find((x) => x.id === uid); if (d) d.done = true; return 0; },
    async ownerStats() { return JSON.parse(JSON.stringify(ownerStats), (k, v) => (k === 'at' || k === 'tried' ? new Date(v) : v)); },
    async plusGifts() { return gifts.map((g) => ({ ...g })); },
    async addPlusGift(code, data) { gifts.push({ id: code, ...data, at: new Date() }); log('plus_gift_add', { code, name: data.name, test: !!data.test }); },
    async freePlusGift(code) { const g = gifts.find((x) => x.id === code); if (g) { delete g.device; delete g.claimed; delete g.app; } log('plus_gift_free', { code }); },
    async removePlusGift(code) { gifts = gifts.filter((x) => x.id !== code); log('plus_gift_remove', { code }); },
    async staff() { return staff.map((s) => ({ ...s })); },
    async addStaff(email, role, name) { staff.push({ id: email.toLowerCase(), role, name }); },
    async removeStaff(email) { const i = staff.findIndex((s) => s.id === email); if (i >= 0) staff.splice(i, 1); },
    async audit() { return audit.map((a) => ({ ...a })); },
    async kendraInfo() { return JSON.parse(JSON.stringify({ ...kInfo, stockAt: undefined })); },
    async saveKendraInfo(data) { kInfo = { ...kInfo, ...data }; log('kendra_info', {}); },
    async setKendraStock(key, level) { kInfo = { ...kInfo, stock: { ...kInfo.stock, [key]: level }, stockAt: new Date() }; },
    async kendraCard() { return JSON.parse(JSON.stringify(kCard)); },
    async saveKendraCard(card) { kCard = JSON.parse(JSON.stringify(card)); log('kendra_card', { on: card.on }); },
    async kendraProducts() { return JSON.parse(JSON.stringify(kProducts)); },
    async saveKendraProduct(id, data) {
      const pid = id || 'kp' + Date.now();
      kProducts = [...kProducts.filter((p) => p.id !== pid), { id: pid, ...JSON.parse(JSON.stringify(data)) }];
      return pid;
    },
    async deleteKendraProduct(id) { kProducts = kProducts.filter((p) => p.id !== id); },
    async kendraCosts() { return JSON.parse(JSON.stringify(kCost)); },
    async saveKendraCost(id, costs) { kCost[id] = { costs: { ...costs } }; },
    async kendraOrders() { return kOrders.map((o) => ({ ...o })); },
    async moveKendraOrder(id, status, extra) {
      kOrders = kOrders.map((o) => (o.id !== id ? o : { ...o, status, ...(extra || {}) }));
    },
    watchKendraOrders(onAdded) {
      // A made-up farmer reserves something a little after opening.
      const t = setTimeout(() => {
        const o = { id: 'ko' + Date.now(), code: 'KJ-NEW01', items: [{ pid: 'kp4', n: 'सूक्ष्म पोषक मिश्रण', s: '1 kg', q: 2, p: 230 }], total: 460, day: day(-1).toISOString().slice(0, 10), slot: 'm', name: 'Ganesh', phone: '9850011223', village: 'Neri', status: 'new', at: new Date() };
        kOrders = [o, ...kOrders];
        onAdded({ ...o });
      }, 12000);
      return () => clearTimeout(t);
    },
    // ── Business Plan v2 (made-up demo businesses) ──
    async processors() { return JSON.parse(JSON.stringify(procs)); },
    async saveProcessor(id, data) {
      const pid = id || 'p' + Date.now();
      procs = [...procs.filter((p) => p.id !== pid), { ...(procs.find((p) => p.id === pid) || {}), id: pid, ...JSON.parse(JSON.stringify(data)) }];
      log('processor', { id: pid });
      return pid;
    },
    async deleteProcessor(id) { procs = procs.filter((p) => p.id !== id); },
    async procQuotes() { return JSON.parse(JSON.stringify(quotes)).sort((a, b) => (a.day < b.day ? 1 : -1)); },
    async addProcQuote(data) { const id = 'q' + Date.now(); quotes = [...quotes, { id, ...data }]; return id; },
    async deleteProcQuote(id) { quotes = quotes.filter((q) => q.id !== id); },
    async procPayments() { return JSON.parse(JSON.stringify(payments)); },
    async saveProcPayment(id, data) {
      const pid = id || 'pp' + Date.now();
      payments = [...payments.filter((x) => x.id !== pid), { ...(payments.find((x) => x.id === pid) || {}), id: pid, ...data }];
      return pid;
    },
    async compliance() { return JSON.parse(JSON.stringify(compliance)); },
    async saveCompliance(id, data) {
      const cid = id || 'c' + Date.now();
      compliance = [...compliance.filter((x) => x.id !== cid), { ...(compliance.find((x) => x.id === cid) || {}), id: cid, ...data }];
      return cid;
    },
    async deleteCompliance(id) { compliance = compliance.filter((x) => x.id !== id); },
    async planState() { return JSON.parse(JSON.stringify(plan)); },
    async savePlanState(data) { plan = { ...plan, ...JSON.parse(JSON.stringify(data)) }; },

    async kendraComplaints() { return kComplaints.map((x) => ({ ...x })); },
    async kendraComplaintDone(id, done) { const x = kComplaints.find((k) => k.id === id); if (x) x.done = done; },
  };
}
