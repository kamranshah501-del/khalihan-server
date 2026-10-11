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
  const features = { login: true, sell: true };
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
    async appConfig() { return { features: { ...features }, launch_states: ['Maharashtra'] }; },
    async setFeature(key, on) { features[key] = on; log('feature', { key, on }); },
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
  };
}
