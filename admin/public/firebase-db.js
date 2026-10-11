// Khalihan Admin — the real data, from the same Firebase project as the app.
// Every write also leaves a line in `audit` (who, what, when).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, serverTimestamp, arrayUnion, Timestamp, runTransaction,
  getCountFromServer, writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js';

const toDate = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : null);
const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

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
          me = { email, role: snap.data().role === 'owner' ? 'owner' : 'staff', name: snap.data().name || '' };
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
      return { features: data.features || {}, launch_states: data.launch_states || [] };
    },
    async setFeature(key, on) {
      await setDoc(doc(db, 'config', 'app'), { features: { [key]: on } }, { merge: true });
      log('feature', { key, on });
    },

    // ── suggestions ──
    async feedback() {
      const snap = await getDocs(query(collection(db, 'feedback'), orderBy('at', 'desc'), limit(200)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },
    async feedbackDone(id, done) {
      await updateDoc(doc(db, 'feedback', id), { done, by: me.email });
      log('feedback_done', { id, done });
    },

    // ── farmers ──
    async usersCount() {
      const snap = await getCountFromServer(collection(db, 'users'));
      return snap.data().count;
    },
    async users() {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('seen', 'desc'), limit(200)));
      return rows(snap).map((r) => ({ ...r, seen: toDate(r.seen), created: toDate(r.created) }));
    },
    async userByPhone(phone) {
      const snap = await getDocs(query(collection(db, 'users'), where('phone', '==', phone), limit(5)));
      return rows(snap).map((r) => ({ ...r, seen: toDate(r.seen), created: toDate(r.created) }));
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
      await batch.commit();
      await updateDoc(doc(db, 'deletion_requests', uid), { done: true, by: me.email });
      log('farmer_deleted', { uid, requests: snap.size });
      return snap.size;
    },

    // ── team (owner) ──
    async staff() {
      return rows(await getDocs(collection(db, 'staff')));
    },
    async addStaff(email, role, name) {
      const id = email.trim().toLowerCase();
      await setDoc(doc(db, 'staff', id), { role, name: name || '', added: serverTimestamp(), by: me.email });
      log('staff_add', { email: id, role });
    },
    async removeStaff(email) {
      await deleteDoc(doc(db, 'staff', email));
      log('staff_remove', { email });
    },

    // ── record (owner) ──
    async audit() {
      const snap = await getDocs(query(collection(db, 'audit'), orderBy('at', 'desc'), limit(300)));
      return rows(snap).map((r) => ({ ...r, at: toDate(r.at) }));
    },
  };
}
