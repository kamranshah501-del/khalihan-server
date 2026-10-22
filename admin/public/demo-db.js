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
  const feedback = [
    { id: 'f1', text: 'Kapas ka bhav Pachora ka bhi dikhao', state: 'Maharashtra', district: 'Jalgaon', lang: 'hi', app: '1.0.2', at: day(0, 8) },
    { id: 'f2', text: 'खताची किंमत पाहिजे', state: 'Maharashtra', district: 'Jalgaon', lang: 'mr', app: '1.0.2', at: day(3), done: true },
  ];
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
    async feedbackDone(id, done) { const f = feedback.find((x) => x.id === id); if (f) f.done = done; },
    async usersCount() { return users.length; },
    async users() { return users.map((u) => ({ ...u })); },
    async userByPhone(phone) { return users.filter((u) => u.phone === phone); },
    async requestsOf(uid) { return requests.filter((r) => r.uid === uid); },
    async deletions() { return deletions.map((d) => ({ ...d })); },
    async wipeFarmer(uid) { const d = deletions.find((x) => x.id === uid); if (d) d.done = true; return 0; },
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
    async kendraComplaints() { return kComplaints.map((x) => ({ ...x })); },
    async kendraComplaintDone(id, done) { const x = kComplaints.find((k) => k.id === id); if (x) x.done = done; },
  };
}
