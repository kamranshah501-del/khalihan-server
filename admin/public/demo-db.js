// Khalihan Admin — demo data (open the panel with ?demo). Nothing is saved;
// it is only for trying the screens without touching the real database.
const day = (n, h = 10) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 15, 0, 0); return d; };

export async function connect() {
  const me = { email: 'owner@example.com', role: 'owner', name: 'Demo owner' };
  let requests = [
    { id: 'r1', crop: 'Maize', qty: 40, price: 1980, village: 'Shendurni', district: 'jalgaon', name: 'Ramesh Patil', phone: '+919876543210', uid: 'u1', offer: 'maize-jalgaon-20261008', lang: 'mr', app: '1.0.2', at: day(0, 9), status: 'new', history: [] },
    { id: 'r2', crop: 'Cotton', qty: 25, price: 7400, village: 'Pahur', district: 'jalgaon', name: '', phone: '+919812345678', uid: 'u2', offer: 'cotton-jalgaon-20261007', lang: 'hi', app: '1.0.2', at: day(1, 16), status: 'called', history: [{ status: 'called', by: 'staff@example.com', at: day(1, 17), note: 'Kal subah aayenge' }] },
    { id: 'r3', crop: 'Maize', qty: 120, price: 1980, village: 'Jamner', district: 'jalgaon', name: 'Sunil Mahajan', phone: '9822001122', offer: 'maize-jalgaon-20261008', lang: 'mr', app: '1.0.1', at: day(2, 11), status: 'paid', final_price: 1990, final_qty: 118, history: [] },
  ];
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
    onUser(cb) { setTimeout(() => cb(me), 50); },
    login: async () => {},
    logout: async () => { location.href = location.pathname; },
    async sellRequests() { return requests.map((r) => ({ ...r })); },
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
