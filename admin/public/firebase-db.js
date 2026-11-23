// Khalihan Admin — the real data, from the same Firebase project as the app.
// Every write also leaves a line in `audit` (who, what, when).
import { runSummary } from './aitest.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, serverTimestamp, arrayUnion, Timestamp, runTransaction,
  getCountFromServer, writeBatch, onSnapshot, deleteField, startAfter, collectionGroup,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js';
import { getMessaging, getToken, deleteToken, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';

const toDate = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : null);
const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const FB_PAGE = 200; // suggestions read per page (Admin 1.17)

export async function connect() {
  // Firebase Hosting serves this project's web config here — nothing secret
  // has to live in the code or in git.
  const res = await fetch('/__/firebase/init.json');
  if (!res.ok) throw new Error('Firebase config not found — deploy with Firebase Hosting (see README).');
  const app = initializeApp(await res.json());
  const key = (window.KHALIHAN_ADMIN || {}).recaptchaSiteKey;
  if (key) {
    initializeAppCheck(app, { provider: new ReCaptchaV3Provider(key), isTokenAutoRefreshEnabled: true });
  }
  const auth = getAuth(app);
  const db = getFirestore(app);
  let me = null; // { email, role }

  const log = (action, details) =>
    addDoc(collection(db, 'audit'), { by: me.email, at: serverTimestamp(), action, details: details || {} })
      .catch((e) => console.warn('audit', e));

  return {
    demo: false,
    project: app.options.projectId || '',

    onUser(callback) {
      onAuthStateChanged(auth, async (user) => {
        if (!user) { me = null; return callback(null); }
        const email = (user.email || '').toLowerCase();
        try {
          const snap = await getDoc(doc(db, 'staff', email));
          if (!snap.exists()) { me = null; return callback({ email, role: null }); }
          const role = snap.data().role === 'owner' ? 'owner' : 'staff';
          // Full mobile numbers and accounts: the owner, and staff he allowed
          // (staff/{email}.phones — the rules check the same, 23 Nov 2026).
          me = { email, role, name: snap.data().name || '', phones: role === 'owner' || snap.data().phones === true };
          callback(me);
        } catch (e) {
          console.warn(e);
          me = null;
          callback({ email, role: null, error: String(e.message || e) });
        }
      });
    },
    login: () => signInWithPopup(auth, new GoogleAuthProvider()),
    logout: () => signOut(auth),

    // ── sell requests ──
    async sellRequests() {
      const snap = await getDocs(query(collection(db, 'sell_requests'), orderBy('at', 'desc'), limit(300)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at), status: r.status || 'new' }));
    },
    async moveRequest(id, status, note, extra) {
      const entry = { status, by: me.email, at: Timestamp.now(), note: note || '' };
      const patch = { status, history: arrayUnion(entry), updated: serverTimestamp(), assigned: me.email };
      if (extra && extra.final_price) patch.final_price = Number(extra.final_price);
      if (extra && extra.final_qty) patch.final_qty = Number(extra.final_qty);
      if (note) patch.note = note;
      await updateDoc(doc(db, 'sell_requests', id), patch);
      log('sell_request_status', { id, status, note: note || '' });
    },

    /** New sell requests as they arrive (the newest 20 are watched). */
    watchRequests(onAdded, onState) {
      let first = true;
      return onSnapshot(
        query(collection(db, 'sell_requests'), orderBy('at', 'desc'), limit(20)),
        (snap) => {
          if (onState) onState(true);
          if (first) { first = false; return; } // what is already there isn't news
          snap.docChanges().forEach((ch) => {
            if (ch.type !== 'added') return;
            const r = { id: ch.doc.id, ...ch.doc.data() };
            onAdded({ ...r, at: toDate(r.at) || new Date(), status: r.status || 'new' });
          });
        },
        (e) => { console.warn('live', e); if (onState) onState(false); },
      );
    },

    // ── money (owner only: rules) — never in sell_requests or the offers,
    //    which farmers can read ──
    async allDealMoney() {
      const snap = await getDocs(query(collection(db, 'deal_money'), limit(2000)));
      const out = {};
      snap.docs.forEach((d) => { out[d.id] = d.data(); });
      return out;
    },
    async saveDealMoney(id, data) {
      await setDoc(doc(db, 'deal_money', id), { ...data, updated: serverTimestamp(), by: me.email });
      log('deal_money', { id, rate: data.rate });
    },
    async allOfferMoney() {
      const snap = await getDocs(query(collection(db, 'offer_money'), limit(500)));
      const out = {};
      snap.docs.forEach((d) => { out[d.id] = d.data(); });
      return out;
    },
    async saveOfferMoney(id, data) {
      await setDoc(doc(db, 'offer_money', id), { ...data, updated: serverTimestamp(), by: me.email });
      log('offer_money', { id, rate: data.rate });
    },

    // ── offers (same format as buy_offers.py) ──
    async offers() {
      const snap = await getDoc(doc(db, 'config', 'buy_offers'));
      const data = snap.data() || {};
      let list = [];
      try { list = JSON.parse(data.json || '[]'); } catch (_) { list = []; }
      return { version: Number(data.version || 0), list: Array.isArray(list) ? list : [] };
    },
    async saveOffers(change) {
      // Read, change, write in one transaction: two people saving at once
      // can't wipe each other's offer.
      const ref = doc(db, 'config', 'buy_offers');
      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const data = snap.data() || {};
        let list = [];
        try { list = JSON.parse(data.json || '[]'); } catch (_) { list = []; }
        const next = change(Array.isArray(list) ? list : []);
        const version = Number(data.version || 0) + 1;
        tx.set(ref, { version, json: JSON.stringify(next), updated: serverTimestamp() });
        return { version, list: next };
      });
      log('offers', { version: result.version, count: result.list.length });
      return result;
    },

    // ── feature switches (owner) ──
    async appConfig() {
      const snap = await getDoc(doc(db, 'config', 'app'));
      const data = snap.data() || {};
      return { features: data.features || {}, launch_states: data.launch_states || [], sell_districts: data.sell_districts || {}, notice: data.notice || null, festival: data.festival || null, ai_limits: data.ai_limits || null, plan_limits: data.plan_limits || null };
    },
    // Forms and papers per Khalihan Pro plan (app 1.0.9, owner 23 Nov 2026):
    // {week: {forms, docs}, m1: …, m12: …, forms_day}; null = the app's own.
    async setPlanLimits(limits) {
      await setDoc(doc(db, 'config', 'app'), { plan_limits: limits || deleteField() }, { merge: true });
      log('plan_limits', { set: !!limits });
    },
    // Khalihan AI's limits per phone (app v1.0.9): {free: {photo_day: 2, …},
    // plus: {…}}; null = the app's own numbers.
    async setAiLimits(limits) {
      await updateDoc(doc(db, 'config', 'app'), { ai_limits: limits || deleteField() });
      log('ai_limits', limits ? { free: Object.keys(limits.free || {}).length, plus: Object.keys(limits.plus || {}).length, pro: Object.keys(limits.pro || {}).length } : { removed: true });
    },
    // ── Khalihan AI for forms (Admin 1.33, owner 22 Nov 2026 — see aiforms.js) ──
    // config/app → ai_forms {live, test}: each {v, set, note, by, at}. The
    // app takes `test` on the owner's test phones and `live` everywhere
    // else. Every version is also kept in business/ai_forms_history (owner
    // only), so any earlier one can go live again.
    async aiForms() {
      const [c, h] = await Promise.all([
        getDoc(doc(db, 'config', 'app')),
        getDoc(doc(db, 'business', 'ai_forms_history')),
      ]);
      const f = (c.data() || {}).ai_forms || {};
      const part = (p) => (p && p.set ? { ...p, at: toDate(p.at) } : null);
      const list = (h.exists() ? h.data().list : null) || [];
      return { live: part(f.live), test: part(f.test), history: list.map((e) => ({ ...e, at: toDate(e.at) })) };
    },
    async _aiFormsKeep(entry, to) {
      const h = await getDoc(doc(db, 'business', 'ai_forms_history'));
      const list = ((h.exists() ? h.data().list : null) || []).filter((e) => e.v !== entry.v);
      list.unshift({ ...entry, to });
      await setDoc(doc(db, 'business', 'ai_forms_history'), { list: list.slice(0, 30), updated: serverTimestamp() });
    },
    async _aiFormsNext() {
      const cur = await this.aiForms();
      return Math.max(0, cur.live?.v || 0, cur.test?.v || 0, ...cur.history.map((e) => e.v || 0)) + 1;
    },
    // A change goes to the test phones first.
    async saveAiFormsTest(set, note) {
      const entry = { v: await this._aiFormsNext(), set, note: note || '', by: me.email, at: Timestamp.now() };
      await updateDoc(doc(db, 'config', 'app'), { 'ai_forms.test': entry });
      await this._aiFormsKeep(entry, 'test');
      log('ai_forms_test', { v: entry.v, note: entry.note });
      return entry.v;
    },
    // What the test phones have → every farmer.
    async aiFormsGoLive() {
      const cur = await this.aiForms();
      if (!cur.test) throw new Error('No test version to send.');
      const entry = { v: cur.test.v, set: cur.test.set, note: cur.test.note || '', by: me.email, at: Timestamp.now() };
      await updateDoc(doc(db, 'config', 'app'), { 'ai_forms.live': entry, 'ai_forms.test': deleteField() });
      await this._aiFormsKeep(entry, 'live');
      log('ai_forms_live', { v: entry.v });
      return entry.v;
    },
    async aiFormsDropTest() {
      await updateDoc(doc(db, 'config', 'app'), { 'ai_forms.test': deleteField() });
      log('ai_forms_test_removed', {});
    },
    // An earlier version back for every farmer (a new number, the old set).
    async aiFormsRollback(v) {
      const cur = await this.aiForms();
      const old = cur.history.find((e) => e.v === v);
      if (!old) throw new Error('That version is not kept.');
      const entry = { v: await this._aiFormsNext(), set: old.set, note: `back to v${v}`, by: me.email, at: Timestamp.now() };
      await updateDoc(doc(db, 'config', 'app'), { 'ai_forms.live': entry });
      await this._aiFormsKeep(entry, 'live');
      log('ai_forms_rollback', { to: v, v: entry.v });
      return entry.v;
    },
    // Back to the app's own everywhere (Admin's set removed; history kept).
    async aiFormsClear() {
      await updateDoc(doc(db, 'config', 'app'), { ai_forms: deleteField() });
      log('ai_forms_cleared', {});
    },
    // The notice on the app's Home (app v1.0.4+). The whole map is replaced,
    // so an old notice's words never mix into a new one; null takes it down.
    async setNotice(notice) {
      await updateDoc(doc(db, 'config', 'app'), { notice: notice || deleteField() });
      log('notice', notice ? { kind: notice.kind, from: notice.from, until: notice.until, states: (notice.states || []).join(', ') || 'all' } : { removed: true });
    },
    // The festival look on the app's Home header (app v1.0.4+); null takes it down.
    async setFestival(festival) {
      await updateDoc(doc(db, 'config', 'app'), { festival: festival || deleteField() });
      log('festival', festival ? { kind: festival.kind, from: festival.from, until: festival.until } : { removed: true });
    },
    // "My state isn't in the list": how many phones wait for each state.
    async waitingCounts(states) {
      const out = {};
      const total = await getCountFromServer(collection(db, 'waiting'));
      out._total = total.data().count;
      if (!out._total) return out;
      await Promise.all(states.map(async (s) => {
        try {
          const snap = await getCountFromServer(query(collection(db, 'waiting'), where('s', '==', s)));
          const n = snap.data().count;
          if (n) out[s] = n;
        } catch (e) { /* one state failing doesn't hide the rest */ }
      }));
      return out;
    },
    async setFeature(key, on) {
      await setDoc(doc(db, 'config', 'app'), { features: { [key]: on } }, { merge: true });
      log('feature', { key, on });
    },
    // Launch day (Admin 1.29): many switches in one write, one record.
    async setFeatures(map) {
      await setDoc(doc(db, 'config', 'app'), { features: map }, { merge: true });
      log('launch', { on: Object.keys(map).filter((k) => map[k]).join(', ') });
    },
    // The Switches page's own notes (owner only, business/switches): trials
    // made permanent, the launch checks ticked by hand. Nothing farmers read.
    async switchPrefs() {
      const snap = await getDoc(doc(db, 'business', 'switches'));
      return snap.exists() ? snap.data() : {};
    },
    async saveSwitchPrefs(part) {
      await setDoc(doc(db, 'business', 'switches'), { ...part, updated: serverTimestamp(), by: me.email }, { merge: true });
      log('switch_prefs', { keys: Object.keys(part).join(', ') });
    },
    // States farmers can pick (Maharashtra always first).
    async setLaunchStates(list) {
      await setDoc(doc(db, 'config', 'app'), { launch_states: list }, { merge: true });
      log('launch_states', { states: list.join(', ') });
    },
    // Districts where Khalihan buys ("Khalihan ko becho") in one state. Merge
    // keeps the other states' lists; the array itself is replaced.
    async setSellDistricts(state, keys) {
      await setDoc(doc(db, 'config', 'app'), { sell_districts: { [state]: keys } }, { merge: true });
      log('sell_districts', { state, on: keys.length });
    },
    // The daily job's latest price feed per state: live/{slug} → {at, rows}.
    async liveStatus(pairs) {
      const out = {};
      await Promise.all(pairs.map(async ([state, slug]) => {
        try {
          const snap = await getDoc(doc(db, 'live', slug));
          const d = snap.data();
          out[state] = d ? { at: toDate(d.at), rows: d.rows || 0 } : null;
        } catch (e) { out[state] = null; }
      }));
      return out;
    },
    // How the daily job's last run went (needs the 14 Oct rules).
    async serverStatus() {
      const snap = await getDoc(doc(db, 'status', 'daily'));
      const d = snap.data();
      return d ? { ...d, at: toDate(d.at) } : null;
    },
    // District names in a state's latest price feed (owner only, on demand).
    async liveDistricts(slug) {
      const snap = await getDocs(collection(db, 'live', slug, 'parts'));
      const names = new Set();
      snap.docs.forEach((d) => (d.data().r || []).forEach((row) => { if (row && row.d) names.add(String(row.d)); }));
      return [...names];
    },

    // ── suggestions ──
    async feedback() {
      const snap = await getDocs(query(collection(db, 'feedback'), orderBy('at', 'desc'), limit(200)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at), done_at: toDate(r.done_at), replied_at: toDate(r.replied_at) }));
    },
    // One page, newest first. `after` = the previous page's `next`; `next`
    // is null when nothing older is left (Admin 1.17: no more 200 limit).
    async feedbackPage(after) {
      const steps = [orderBy('at', 'desc')];
      if (after) steps.push(startAfter(after));
      steps.push(limit(FB_PAGE));
      const snap = await getDocs(query(collection(db, 'feedback'), ...steps));
      return {
        rows: rows(snap).map((r) => ({ ...r, at: toDate(r.at), done_at: toDate(r.done_at), replied_at: toDate(r.replied_at) })),
        next: snap.docs.length === FB_PAGE ? snap.docs[snap.docs.length - 1] : null,
      };
    },
    // Real totals from the server, however many pages are loaded.
    async feedbackCounts() {
      const all = collection(db, 'feedback');
      const [total, done] = await Promise.all([
        getCountFromServer(all),
        getCountFromServer(query(all, where('done', '==', true))),
      ]);
      const t = total.data().count;
      const d = done.data().count;
      return { total: t, done: d, open: Math.max(0, t - d) };
    },
    async feedbackDone(id, done) {
      // done_at (Admin 1.30): when it was answered — the morning summary and
      // Today count replies from it.
      await updateDoc(doc(db, 'feedback', id), { done, by: me.email, done_at: done ? serverTimestamp() : deleteField() });
      log('feedback_done', { id, done });
    },
    // The team's private note (rules: staff may change only done, note, by).
    async feedbackNote(id, note) {
      await updateDoc(doc(db, 'feedback', id), { note, by: me.email });
      log('feedback_note', { id });
    },
    // Owner only (rules) — when a farmer asks for their suggestion to go.
    async feedbackDelete(id) {
      await deleteDoc(doc(db, 'feedback', id));
      log('feedback_delete', { id });
    },

    // ── farmers ──
    async usersCount() {
      const snap = await getCountFromServer(collection(db, 'users'));
      return snap.data().count;
    },
    async users() {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('seen', 'desc'), limit(1000)));
      return rows(snap).map((r) => ({ ...r, seen: toDate(r.seen), created: toDate(r.created), consent: toDate(r.consent) }));
    },
    async userByPhone(phone) {
      const snap = await getDocs(query(collection(db, 'users'), where('phone', '==', phone), limit(5)));
      return rows(snap).map((r) => ({ ...r, seen: toDate(r.seen), created: toDate(r.created), consent: toDate(r.consent) }));
    },
    // The free weeks (plus_trials/{+91…}): when each began, its own end if
    // the owner changed it, the week's forms and papers. Owner and staff
    // allowed to see numbers (rules).
    async freeWeeks() {
      const snap = await getDocs(query(collection(db, 'plus_trials'), limit(5000)));
      return rows(snap).map((r) => ({ ...r, phone: r.id, start: toDate(r.start), end: toDate(r.end) }));
    },
    // Owner: end a week now, or move its end (more days).
    async setWeekEnd(phone, end, note) {
      await updateDoc(doc(db, 'plus_trials', phone), {
        end: end ? Timestamp.fromDate(end) : serverTimestamp(), note: note || '', by: me.email,
      });
      log('week_end', { phone: phone.slice(-4), end: end ? end.toISOString() : 'now' });
    },
    // A bought plan's forms and papers (users/{uid}/use/{plan_end}).
    async planUse(uid) {
      const snap = await getDocs(collection(db, 'users', uid, 'use'));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },
    async requestsOf(uid) {
      const snap = await getDocs(query(collection(db, 'sell_requests'), where('uid', '==', uid), limit(100)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at), status: r.status || 'new' }));
    },

    // ── account deletions ──
    async deletions() {
      const snap = await getDocs(query(collection(db, 'deletion_requests'), orderBy('at', 'desc'), limit(100)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },
    async wipeFarmer(uid) {
      // Owner only (rules): the farmer's sell requests and account copy.
      const snap = await getDocs(query(collection(db, 'sell_requests'), where('uid', '==', uid), limit(400)));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, 'users', uid));
      // The plan's form and paper counts (23 Nov 2026; the farmer cannot
      // delete them himself — the rules — so the team does, with the rest).
      const use = await getDocs(collection(db, 'users', uid, 'use')).catch(() => null);
      if (use) use.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      await updateDoc(doc(db, 'deletion_requests', uid), { done: true, by: me.email });
      log('farmer_deleted', { uid, requests: snap.size });
      return snap.size;
    },

    // ── app numbers (owner only; owner_stats/latest, written by the server) ──
    async ownerStats() {
      const snap = await getDoc(doc(db, 'owner_stats', 'latest'));
      if (!snap.exists()) return null;
      const d = snap.data();
      const part = (p) => (p ? { ...p, tried: toDate(p.tried) } : {});
      return { ...d, at: toDate(d.at), ga: part(d.ga), play: part(d.play) };
    },

    // ── team (owner) ──
    // ── free Plus gift codes (owner only; plus_gifts/{CODE}) ──
    async plusGifts() {
      const snap = await getDocs(query(collection(db, 'plus_gifts'), limit(50)));
      return rows(snap).map((g) => ({ ...g, at: toDate(g.at), until: toDate(g.until), claimed: toDate(g.claimed) }));
    },
    async addPlusGift(code, data) {
      const ref = doc(db, 'plus_gifts', code);
      if ((await getDoc(ref)).exists()) throw new Error('code-taken');
      await setDoc(ref, {
        name: data.name, note: data.note || '', test: !!data.test, tier: data.tier === 'pro' ? 'pro' : 'plus',
        until: data.until ? Timestamp.fromDate(data.until) : null,
        by: me.email, at: serverTimestamp(),
      });
      log('plus_gift_add', { code, name: data.name, test: !!data.test, tier: data.tier === 'pro' ? 'pro' : 'plus' });
    },
    /** Every farmer's Plus bought on Play (users/{uid}/plus/state, written by
     *  our server) — the plan only: no purchase token, no phone number. */
    async plusMembers() {
      const snap = await getDocs(query(collectionGroup(db, 'plus'), limit(5000)));
      return snap.docs.filter((d) => d.id === 'state').map((d) => {
        const m = d.data();
        return {
          tier: m.tier, basePlan: m.basePlan || '', until: toDate(m.until), autoRenew: !!m.autoRenew, trial: !!m.trial,
          prepaid: !!m.prepaid, price: typeof m.price === 'number' ? m.price : 0, test: !!m.test, at: toDate(m.at),
        };
      });
    },
    /** The phone that holds it lets go; the next phone to type it gets it. */
    async freePlusGift(code) {
      await updateDoc(doc(db, 'plus_gifts', code), { device: deleteField(), claimed: deleteField(), app: deleteField() });
      log('plus_gift_free', { code });
    },
    async removePlusGift(code) {
      await deleteDoc(doc(db, 'plus_gifts', code));
      log('plus_gift_remove', { code });
    },

    async staff() {
      return rows(await getDocs(collection(db, 'staff')));
    },
    async addStaff(email, role, name) {
      const id = email.trim().toLowerCase();
      await setDoc(doc(db, 'staff', id), { role, name: name || '', added: serverTimestamp(), by: me.email });
      log('staff_add', { email: id, role });
    },
    // Owner: may this person see farmers' full numbers and accounts?
    async setStaffPhones(email, on) {
      await updateDoc(doc(db, 'staff', email), { phones: !!on });
      log('staff_phones', { email, on: !!on });
    },
    async removeStaff(email) {
      await deleteDoc(doc(db, 'staff', email));
      log('staff_remove', { email });
    },

    // ── Khalihan Kendra ──
    async kendraInfo() {
      const snap = await getDoc(doc(db, 'kendra', 'info'));
      return snap.data() || {};
    },
    async saveKendraInfo(data) {
      await setDoc(doc(db, 'kendra', 'info'), { ...data, updated: serverTimestamp(), by: me.email }, { merge: true });
      log('kendra_info', { name: data.name || '' });
    },
    async setKendraStock(key, level) {
      await setDoc(doc(db, 'kendra', 'info'), { stock: { [key]: level }, stockAt: serverTimestamp(), by: me.email }, { merge: true });
      log('kendra_stock', { key, level });
    },
    async kendraCard() {
      const snap = await getDoc(doc(db, 'kendra', 'home_card'));
      const d = snap.data() || {};
      return { on: d.on === true, secs: Number(d.secs || 4), slides: Array.isArray(d.slides) ? d.slides : [] };
    },
    async saveKendraCard(card) {
      await setDoc(doc(db, 'kendra', 'home_card'), {
        on: card.on === true, secs: Number(card.secs || 4), slides: card.slides || [], updated: serverTimestamp(), by: me.email,
      });
      log('kendra_card', { on: card.on === true, slides: (card.slides || []).length });
    },
    async kendraProducts() {
      const snap = await getDocs(query(collection(db, 'kendra_products'), limit(500)));
      return rows(snap);
    },
    async saveKendraProduct(id, data) {
      const ref = id ? doc(db, 'kendra_products', id) : doc(collection(db, 'kendra_products'));
      await setDoc(ref, { ...data, updated: serverTimestamp(), by: me.email });
      log('kendra_product', { id: ref.id, cat: data.cat });
      return ref.id;
    },
    async deleteKendraProduct(id) {
      await deleteDoc(doc(db, 'kendra_products', id));
      log('kendra_product_delete', { id });
    },
    async kendraCosts() {
      const snap = await getDocs(query(collection(db, 'kendra_cost'), limit(500)));
      const out = {};
      snap.docs.forEach((d) => { out[d.id] = d.data(); });
      return out;
    },
    async saveKendraCost(id, costs) {
      await setDoc(doc(db, 'kendra_cost', id), { costs, updated: serverTimestamp(), by: me.email });
    },
    async kendraOrders() {
      const snap = await getDocs(query(collection(db, 'kendra_orders'), orderBy('at', 'desc'), limit(300)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at), status: r.status || 'new' }));
    },
    async moveKendraOrder(id, status, extra) {
      const patch = {
        status,
        history: arrayUnion({ status, by: me.email, at: Timestamp.now() }),
        updated: serverTimestamp(),
        by: me.email,
      };
      if (extra && extra.paid) patch.paid = extra.paid;
      if (extra && extra.bill) patch.bill = extra.bill;
      if (extra && extra.note) patch.note = extra.note;
      await updateDoc(doc(db, 'kendra_orders', id), patch);
      log('kendra_order', { id, status });
    },
    /** New Kendra orders as they arrive (the newest 20 are watched). */
    watchKendraOrders(onAdded) {
      let first = true;
      return onSnapshot(
        query(collection(db, 'kendra_orders'), orderBy('at', 'desc'), limit(20)),
        (snap) => {
          if (first) { first = false; return; }
          snap.docChanges().forEach((ch) => {
            if (ch.type !== 'added') return;
            const r = { id: ch.doc.id, ...ch.doc.data() };
            onAdded({ ...r, at: toDate(r.at) || new Date(), status: r.status || 'new' });
          });
        },
        (e) => console.warn('kendra live', e),
      );
    },
    async kendraComplaints() {
      const snap = await getDocs(query(collection(db, 'kendra_complaints'), orderBy('at', 'desc'), limit(200)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },
    async kendraComplaintDone(id, done) {
      await updateDoc(doc(db, 'kendra_complaints', id), { done, by: me.email });
      log('kendra_complaint_done', { id, done });
    },

    // ── Business Plan v2 (owner only: rules) ──
    async processors() {
      const snap = await getDocs(query(collection(db, 'processors'), limit(300)));
      return rows(snap);
    },
    async saveProcessor(id, data) {
      const ref = id ? doc(db, 'processors', id) : doc(collection(db, 'processors'));
      await setDoc(ref, { ...data, updated: serverTimestamp(), by: me.email }, { merge: true });
      log('processor', { id: ref.id, name: data.name || '' });
      return ref.id;
    },
    async deleteProcessor(id) {
      await deleteDoc(doc(db, 'processors', id));
      log('processor_delete', { id });
    },
    async procQuotes() {
      const snap = await getDocs(query(collection(db, 'proc_quotes'), orderBy('day', 'desc'), limit(3000)));
      return rows(snap);
    },
    async addProcQuote(data) {
      const ref = await addDoc(collection(db, 'proc_quotes'), { ...data, at: serverTimestamp(), by: me.email });
      log('proc_quote', { id: ref.id, proc: data.proc, crop: data.crop, rate: data.rate });
      return ref.id;
    },
    async deleteProcQuote(id) {
      await deleteDoc(doc(db, 'proc_quotes', id));
      log('proc_quote_delete', { id });
    },
    async procPayments() {
      const snap = await getDocs(query(collection(db, 'proc_pay'), limit(2000)));
      return rows(snap);
    },
    async saveProcPayment(id, data) {
      const ref = id ? doc(db, 'proc_pay', id) : doc(collection(db, 'proc_pay'));
      await setDoc(ref, { ...data, updated: serverTimestamp(), by: me.email }, { merge: true });
      log('proc_pay', { id: ref.id, proc: data.proc || '', paid: data.paid || '' });
      return ref.id;
    },
    async compliance() {
      const snap = await getDocs(query(collection(db, 'compliance'), limit(300)));
      return rows(snap);
    },
    async saveCompliance(id, data) {
      const ref = id ? doc(db, 'compliance', id) : doc(collection(db, 'compliance'));
      await setDoc(ref, { ...data, updated: serverTimestamp(), by: me.email }, { merge: true });
      log('compliance', { id: ref.id, name: data.name || '', due: data.due || '' });
      return ref.id;
    },
    async deleteCompliance(id) {
      await deleteDoc(doc(db, 'compliance', id));
      log('compliance_delete', { id });
    },
    async planState() {
      const snap = await getDoc(doc(db, 'business', 'plan'));
      return snap.exists() ? snap.data() : {};
    },
    async savePlanState(data) {
      await setDoc(doc(db, 'business', 'plan'), { ...data, updated: serverTimestamp(), by: me.email }, { merge: true });
      log('plan', { kadam: data.kadam });
    },
    // ── budget & targets (owner only; business/budget — see budget.js) ──
    async budget() {
      const snap = await getDoc(doc(db, 'business', 'budget'));
      return snap.exists() ? snap.data() : null;
    },
    async saveBudget(data) {
      // The whole document, as the page holds it. The record says only
      // that it changed — never an amount.
      await setDoc(doc(db, 'business', 'budget'), { ...data, updated: serverTimestamp(), by: me.email });
      log('budget', {});
    },

    // ── Khalihan AI test (owner only; business/ai_tests + business/ai_test_<id> — see aitest.js) ──
    async aiTests() {
      const snap = await getDoc(doc(db, 'business', 'ai_tests'));
      return snap.exists() ? snap.data() : { runs: [] };
    },
    async aiTest(id) {
      const snap = await getDoc(doc(db, 'business', `ai_test_${id}`));
      return snap.exists() ? snap.data() : null;
    },
    async saveAiTest(run) {
      await setDoc(doc(db, 'business', `ai_test_${run.id}`), { ...run, updated: serverTimestamp(), by: me.email });
      const idx = await this.aiTests();
      const runs = [runSummary(run), ...(idx.runs || []).filter((r) => r.id !== run.id)];
      await setDoc(doc(db, 'business', 'ai_tests'), { runs, updated: serverTimestamp() });
      log('ai_test', { run: run.id });
    },
    async deleteAiTest(id) {
      await deleteDoc(doc(db, 'business', `ai_test_${id}`));
      const idx = await this.aiTests();
      await setDoc(doc(db, 'business', 'ai_tests'), { runs: (idx.runs || []).filter((r) => r.id !== id), updated: serverTimestamp() });
      log('ai_test_delete', { run: id });
    },

    // ── replies to farmers, inside the app (Admin 1.31; app 1.0.10) ──
    // One write: the reply in inbox/{dev}/replies, the push request in
    // reply_queue (the alert job sends it), and the message marked answered.
    async replyToFarmer(f, text, lang) {
      const email = me.email.toLowerCase();
      const ref = doc(collection(db, 'inbox', f.dev, 'replies'));
      const batch = writeBatch(db);
      batch.set(ref, { text, shown: '', lang, for: f.id, by: email, by_name: me.name || '', at: serverTimestamp() });
      batch.set(doc(db, 'reply_queue', ref.id), { dev: f.dev, reply: ref.id, by: email, at: serverTimestamp() });
      batch.update(doc(db, 'feedback', f.id), { done: true, by: me.email, done_at: serverTimestamp(), replied_at: serverTimestamp(), reply_by: email });
      await batch.commit();
      log('farmer_reply', { id: f.id });
    },
    async farmerReplies(dev) {
      const snap = await getDocs(query(collection(db, 'inbox', dev, 'replies'), orderBy('at')));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },

    // ── alerts on phones and computers (Admin 1.30, owner 18 Nov 2026) ──
    // The browser's Firebase push token goes to staff_devices/{sha256}; the
    // server's alert job (tools/admin_alerts.py, every 10 minutes) sends to
    // it. Each person's choices: staff_prefs/{email}.
    async pushSupported() {
      try { return ('serviceWorker' in navigator) && ('Notification' in window) && await isSupported(); } catch (_) { return false; }
    },
    async turnOnPush(info) {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
      const token = await getToken(getMessaging(app), { serviceWorkerRegistration: reg });
      if (!token) throw new Error('no-token');
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const id = [...new Uint8Array(bytes)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
      await setDoc(doc(db, 'staff_devices', id), { email: me.email.toLowerCase(), token, kind: info.kind, browser: info.browser, app: !!info.app, tz: info.tz, at: serverTimestamp() });
      log('alerts_on', { kind: info.kind, browser: info.browser });
      return id;
    },
    async turnOffPush(id, here) {
      await deleteDoc(doc(db, 'staff_devices', id));
      if (here) { try { await deleteToken(getMessaging(app)); } catch (_) { /* already gone */ } }
      log('alerts_off', { id });
    },
    async myDevices() {
      const snap = await getDocs(query(collection(db, 'staff_devices'), where('email', '==', me.email.toLowerCase())));
      return rows(snap).map((d) => ({ ...d, at: toDate(d.at), last_sent: toDate(d.last_sent) }));
    },
    async alertPrefs() {
      const snap = await getDoc(doc(db, 'staff_prefs', me.email.toLowerCase()));
      return snap.exists() ? snap.data() : {};
    },
    async saveAlertPrefs(p) {
      await setDoc(doc(db, 'staff_prefs', me.email.toLowerCase()), { ...p, updated: serverTimestamp() }, { merge: true });
    },
    // "Send me a test alert": the alert job sends it at its next run.
    async testAlert(device) {
      await addDoc(collection(db, 'alert_requests'), { email: me.email.toLowerCase(), kind: 'test', device: device || '', at: serverTimestamp() });
    },
    // The bell: the newest alerts, live. Team alerts for everyone; the
    // owner's own (Pro, launch counter) only for owners.
    watchAlerts(onList) {
      const lists = { team: [], owner: [] };
      const emit = () => onList([...lists.team, ...lists.owner].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 30));
      const watch = (name, key) => onSnapshot(query(collection(db, name), orderBy('at', 'desc'), limit(30)),
        (snap) => { lists[key] = rows(snap).map((r) => ({ ...r, at: toDate(r.at) })); emit(); },
        (e) => console.warn('alerts', e));
      const offs = [watch('alerts_team', 'team')];
      if (me.role === 'owner') offs.push(watch('alerts_owner', 'owner'));
      return () => offs.forEach((f) => f());
    },
    // New farmer messages while the panel is open (in-tab sound and toast).
    watchFeedback(onNew) {
      let first = true;
      return onSnapshot(query(collection(db, 'feedback'), orderBy('at', 'desc'), limit(5)), (snap) => {
        if (first) { first = false; return; }
        snap.docChanges().forEach((ch) => { if (ch.type === 'added') onNew({ id: ch.doc.id, ...ch.doc.data(), at: toDate(ch.doc.data().at) }); });
      }, (e) => console.warn('feedback watch', e));
    },

    // ── record (owner) ──
    async audit() {
      const snap = await getDocs(query(collection(db, 'audit'), orderBy('at', 'desc'), limit(300)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },
  };
}
