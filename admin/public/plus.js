// Khalihan Plus — the owner's settings and help page (Admin 1.15, 1 Nov
// 2026). Plus has no switches (owner: "paid ke switch nahi chahiye — jaise
// hi user khareede, apne aap chalu ho; hum sirf madad karein"). This page
// says how it turns on by itself, what's in it, and how we help a farmer
// when something goes wrong.
//
// Admin 1.16 (1 Nov 2026): free Plus by gift code, owner only (owner: "10
// logon ko free dena chahun to — section banao, sirf owner ke liye"). A
// code in plus_gifts/{CODE}; Plus opens on the phone that uses it — no
// login, no payment. One code, one phone; "Free for a new phone" lets it
// move. The owner's own test phones also see the switched-off features.
//
// Admin 1.25 (16 Nov 2026, v1.0.9): two plans, Kisan Plus and Khalihan Pro,
// bought on Google Play and checked by our server (plus-verify), which
// writes users/{uid}/plus/state. Members: how many on each plan, on trial,
// and about how much reaches us a month (price from Google, less 18% GST
// and Google's 15%). Gift codes go by link only (owner: "gift code sab ke
// app me nahi rahega, sirf main decide karunga") and carry a plan.
//
// Same day, 17:25–17:41 (owner): one plan only — "Plus nikal do, sirf Pro";
// ₹149 / ₹419 / ₹799 / ₹1,499 (set in Play Console, not here); and "Free
// plan me form bharna nahi rahega". A gift is always Khalihan Pro.

const T = {
  en: {
    title: '⭐ Khalihan Pro',
    sub: 'One paid plan, Khalihan Pro (1, 3, 6 or 12 months). It runs by itself — no switches, nothing to turn on for any farmer.',
    st_off: 'Not started',
    st_on: 'Running',
    st_off_d: 'Pro starts by itself once Khalihan Pro is on Google Play (Play Console → Monetise → Subscriptions) and app 1.0.9 is out. Until then every Pro feature stays hidden in the app — nobody uses one free and loses it later. Gift codes (below) work already.',
    how: 'How it works',
    how1: 'The farmer logs in with his mobile number and buys a plan in the app (Google Play payment — UPI, UPI Autopay, card).',
    how2: 'A 7-day free trial is offered only with auto-pay on (UPI Autopay or a card) — Google\'s rule; Google shows it once per person.',
    how3: 'Our server checks the payment with Google; only then Pro opens — in his account, on every phone he logs in on.',
    how4: 'Renewals, cancellations and refunds: Google tells our server and the account follows by itself.',
    mem: 'Members',
    m_plus: 'Kisan Plus (old)', m_pro: 'Khalihan Pro', m_trial: 'on the free trial', m_off: 'auto-renew turned off', m_paid: 'paying',
    m_money: '≈ ₹{r} a month reaches us',
    m_money_d: 'From the price Google gives for each paid member (not trials, not test purchases), spread over the plan\'s months, less 18% GST and Google\'s 15%. An estimate — Google\'s payout is in Play Console → Financial reports.',
    m_prepaid: '{n} on a one-time plan (Google gives no price for it — not in the sum)',
    m_tests: '{n} test purchase(s) — not counted',
    m_none: 'No members yet.',
    m_failed: 'Could not load the members — check the internet and open the page again.',
    th_plan: 'Plan', th_len: 'Length', th_n: 'Members', th_price: 'Price', th_month: 'To us a month',
    len_m: '{n} month(s)',
    gifts: 'Free Khalihan Pro — gift codes',
    gifts_d: 'Give Khalihan Pro free, without paying, to up to 10 people you choose. Make a code and send the person its link; the link opens Khalihan with the code filled in, and Khalihan Pro opens on that phone at once — no login, no payment. One code works on one phone. The app has no code box any more: only people you send a link to can use one.',
    g_count: '{n} of 10 given',
    g_tests: '{n} test phone(s) of yours',
    g_name: 'Who is it for', g_name_ph: 'Name, village',
    g_note: 'Note (optional)', g_note_ph: 'e.g. tester, KVK, family',
    g_until: 'Free till (blank = always)',
    g_test: 'My own test phone — on that phone the switched-off features (Sell, Kendra, Login) show too, so I can check the whole app. Not counted in the 10.',
    g_make: 'Make code',
    g_need_name: 'Write who the code is for.',
    g_full: 'All 10 gifts are given. Remove one to give another.',
    g_tests_full: 'Three test phones are the most.',
    g_new: 'New code for {name}',
    g_tell: 'Send them this link (WhatsApp is fine). It opens Khalihan with the code — app 1.0.9 or newer. On an older app they type the code: Profile → मदद और जानकारी → गिफ़्ट कोड.',
    g_copy: 'Copy code', g_copy_link: 'Copy link', g_copied: 'Copied',
    th_for: 'For', th_code: 'Code', th_till: 'Free till', th_phone: 'Phone',
    g_always: 'Always', g_ended: 'Ended {d}',
    g_waiting: 'Not used yet',
    g_on_phone: 'On a phone since {d} · app {v}',
    g_test_tag: 'Test phone',
    g_free: 'Free for a new phone',
    g_free_q: 'Free the code for {name} for a new phone? The old phone loses Pro at its next start.',
    g_free_done: 'Done — the code now works on the next phone that opens its link.',
    g_rm: 'Remove',
    g_rm_q: 'Remove the code for {name}? Pro closes on their phone at its next start.',
    g_none: 'No codes yet.',
    g_failed: 'Could not load the codes — check the internet and open the page again.',
    need: 'Before Pro can start',
    need1: 'Play Console payments profile and merchant account — done 16 Nov ✅; the BillDesk video KYC for cross-border sales (owner)',
    need2: 'Subscription khalihan_pro (Khalihan Pro) in Play Console: base plans m1 · m3 · m6 · m12 at the prices the owner chose, and a 7-day trial offer on m1 (Claude makes them with the owner\'s yes)',
    need3: 'Play Billing in the app + the payment check on our server — built for 1.0.9 (Claude) ✅',
    need4: 'Google Play connects to our server: the service account plus-verify invited in Play Console — done 16 Nov ✅',
    need5: 'Play Data safety "Purchase history" + privacy policy lines (Claude writes, owner submits)',
    need6: 'A test purchase with a license tester (no money taken) before farmers see it',
    inside: 'What\'s in each plan',
    i_feat: 'Feature', i_free: 'Every farmer', i_pro: 'Khalihan Pro',
    f1: 'Fill a government form with Khalihan AI', f1a: '— (fills the site himself)', f1b: 'Unlimited',
    f2: 'Papers and applied forms kept in the account', f2a: '—', f2b: '✓',
    f3: 'Khalihan AI — questions, photo reads (Switches → AI limits)', f3a: '— (none once Pro is on sale)', f3b: 'normal share + extra (red)',
    f4: '"Ask anything" and Google search', f4a: '—', f4b: '✓',
    f5: 'Kaptan\'s voice — the AI speaks in its own voice', f5a: '— (the phone\'s voice)', f5b: '✓',
    f6: 'Target price alert', f6a: '—', f6b: '✓',
    help: 'Helping a farmer',
    help_d: 'Coming next: type the farmer\'s mobile number → his plan, valid till, payment state, and a "Check again with Google" button that fixes a paid-but-not-open Pro in one click. Until then: he opens the Pro sheet and taps "Restore purchase".',
    help_ph: 'Mobile number — coming next',
    probs: 'Usual problems and what to do',
    p_q: 'Farmer says', p_a: 'What to do',
    q1: 'Money was taken but Pro didn\'t open', a1: 'In the app: Profile → Khalihan Pro → "Restore purchase" — our server checks with Google again. The order number (GPA.…) is in his Google Play receipt e-mail.',
    q2: 'New phone or app reinstalled', a2: 'Log in with the same mobile number — Pro comes back by itself.',
    q3: 'Wants to cancel', a3: 'In the app: Profile → Khalihan Pro → Manage (or Play Store → Payments & subscriptions → Subscriptions → Khalihan → Cancel). Pro keeps working till the paid period ends.',
    q4: 'Wants a refund', a4: 'In the first 48 hours the farmer can ask Google Play directly; after that we refund from Play Console → Order management.',
    q5: 'UPI/card failed, renewal didn\'t go through', a5: 'Google gives a few days\' grace; Pro keeps working meanwhile. The farmer updates the payment method in Play.',
    q6: 'Logged in with another number', a6: 'Pro belongs to the number he bought with — log in with that one. A purchase can\'t move to a second account.',
    q7: 'No free trial shown', a7: 'Google shows the trial once per person and only with auto-pay (UPI Autopay or a card). Someone who had it before sees the normal price.',
  },
  hi: {
    title: '⭐ Khalihan Pro',
    sub: 'एक ही पैसे वाला प्लान, Khalihan Pro (1, 3, 6 या 12 महीने)। अपने आप चलता है — कोई स्विच नहीं, किसी किसान के लिए हाथ से कुछ चालू नहीं करना।',
    st_off: 'अभी शुरू नहीं',
    st_on: 'चल रहा है',
    st_off_d: 'जैसे ही Google Play पर Khalihan Pro बनेगा (Play Console → Monetise → Subscriptions) और ऐप 1.0.9 आएगा, Pro अपने आप शुरू हो जाएगा। तब तक ऐप में Pro के सारे फ़ीचर छिपे रहेंगे — कोई उन्हें मुफ़्त में चलाकर बाद में खोएगा नहीं। गिफ़्ट कोड (नीचे) अभी से चलते हैं।',
    how: 'कैसे चलता है',
    how1: 'किसान मोबाइल नंबर से लॉग-इन करके ऐप में प्लान ख़रीदता है (Google Play से पेमेंट — UPI, UPI Autopay, कार्ड)।',
    how2: '7 दिन का मुफ़्त ट्रायल सिर्फ़ ऑटो-पे चालू करने पर (UPI Autopay या कार्ड) — Google का नियम; एक इंसान को एक बार।',
    how3: 'हमारा सर्वर Google से पेमेंट पक्का करता है; उसके बाद ही Pro खुलता है — उसके खाते में, जिस भी फ़ोन पर लॉग-इन करे।',
    how4: 'रिन्यू, कैंसल, रिफ़ंड: Google हमारे सर्वर को बताता है, खाता अपने आप बदल जाता है।',
    mem: 'सदस्य',
    m_plus: 'Kisan Plus (पुराना)', m_pro: 'Khalihan Pro', m_trial: 'मुफ़्त ट्रायल पर', m_off: 'ऑटो-रिन्यू बंद किया', m_paid: 'पैसे देने वाले',
    m_money: '≈ ₹{r} महीना हम तक पहुँचता है',
    m_money_d: 'हर पैसे देने वाले सदस्य (ट्रायल और टेस्ट ख़रीदारी नहीं) का Google वाला दाम, प्लान के महीनों में बाँटकर, 18% GST और Google के 15% घटाकर। अंदाज़ा है — Google का असली भुगतान Play Console → Financial reports में।',
    m_prepaid: '{n} एक बार वाले प्लान पर (Google उसका दाम नहीं बताता — जोड़ में नहीं)',
    m_tests: '{n} टेस्ट ख़रीदारी — गिनी नहीं',
    m_none: 'अभी कोई सदस्य नहीं।',
    m_failed: 'सदस्य नहीं खुले — इंटरनेट देखकर पेज दोबारा खोलिए।',
    th_plan: 'प्लान', th_len: 'अवधि', th_n: 'सदस्य', th_price: 'दाम', th_month: 'हम तक महीना',
    len_m: '{n} महीने',
    gifts: 'मुफ़्त Khalihan Pro — गिफ़्ट कोड',
    gifts_d: 'बिना पैसे के, आपकी पसंद के 10 लोगों तक को Khalihan Pro मुफ़्त दें। कोड बनाइए और उस इंसान को उसका लिंक भेजिए; लिंक Khalihan को कोड भरकर खोलता है और उसी फ़ोन पर Khalihan Pro तुरंत चालू — न लॉग-इन, न पेमेंट। एक कोड एक फ़ोन पर चलता है। ऐप में अब कोड डालने की जगह नहीं: सिर्फ़ जिन्हें आप लिंक भेजें, वही इस्तेमाल कर सकते हैं।',
    g_count: '10 में से {n} दिए',
    g_tests: 'आपके {n} टेस्ट फ़ोन',
    g_name: 'किसके लिए', g_name_ph: 'नाम, गाँव',
    g_note: 'नोट (चाहें तो)', g_note_ph: 'जैसे टेस्टर, KVK, घरवाले',
    g_until: 'कब तक मुफ़्त (ख़ाली = हमेशा)',
    g_test: 'मेरा अपना टेस्ट फ़ोन — उस फ़ोन पर बंद स्विच वाले फ़ीचर (बेचें, केंद्र, लॉग-इन) भी दिखेंगे, ताकि पूरा ऐप जाँच सकूँ। 10 में नहीं गिना जाएगा।',
    g_make: 'कोड बनाओ',
    g_need_name: 'लिखिए कि कोड किसके लिए है।',
    g_full: '10 के 10 गिफ़्ट दिए जा चुके। नया देने के लिए एक हटाइए।',
    g_tests_full: 'तीन टेस्ट फ़ोन से ज़्यादा नहीं।',
    g_new: '{name} का नया कोड',
    g_tell: 'उन्हें ये लिंक भेजिए (WhatsApp से भी)। लिंक Khalihan को कोड के साथ खोलता है — ऐप 1.0.9 या नया। पुराने ऐप पर कोड लिखें: प्रोफ़ाइल → मदद और जानकारी → गिफ़्ट कोड।',
    g_copy: 'कोड कॉपी', g_copy_link: 'लिंक कॉपी', g_copied: 'कॉपी हो गया',
    th_for: 'किसके लिए', th_code: 'कोड', th_till: 'कब तक', th_phone: 'फ़ोन',
    g_always: 'हमेशा', g_ended: '{d} को ख़त्म',
    g_waiting: 'अभी इस्तेमाल नहीं हुआ',
    g_on_phone: '{d} से एक फ़ोन पर · ऐप {v}',
    g_test_tag: 'टेस्ट फ़ोन',
    g_free: 'नए फ़ोन के लिए खोलो',
    g_free_q: '{name} का कोड नए फ़ोन के लिए खोलें? पुराने फ़ोन पर Pro अगली बार ऐप खुलने पर बंद हो जाएगा।',
    g_free_done: 'हो गया — अब जो फ़ोन इसका लिंक खोलेगा, उस पर चलेगा।',
    g_rm: 'हटाओ',
    g_rm_q: '{name} का कोड हटाएँ? उनके फ़ोन पर Pro अगली बार ऐप खुलने पर बंद हो जाएगा।',
    g_none: 'अभी कोई कोड नहीं।',
    g_failed: 'कोड नहीं खुले — इंटरनेट देखकर पेज दोबारा खोलिए।',
    need: 'Pro शुरू होने से पहले',
    need1: 'Play Console पेमेंट्स प्रोफ़ाइल और मर्चेंट अकाउंट — 16 नवंबर को हो गया ✅; विदेश की बिक्री के लिए BillDesk का वीडियो KYC (मालिक)',
    need2: 'Play Console में khalihan_pro (Khalihan Pro) सब्सक्रिप्शन: बेस प्लान m1 · m3 · m6 · m12 मालिक के तय दाम पर, और m1 पर 7 दिन का ट्रायल ऑफ़र (मालिक की हाँ पर Claude बनाएगा)',
    need3: 'ऐप में Play Billing + सर्वर पर पेमेंट की जाँच — 1.0.9 के लिए बना (Claude) ✅',
    need4: 'Google Play हमारे सर्वर से जुड़े: plus-verify सर्विस अकाउंट Play Console में — 16 नवंबर को हो गया ✅',
    need5: 'Play Data safety में "Purchase history" + प्राइवेसी पॉलिसी (Claude लिखेगा, मालिक भेजेगा)',
    need6: 'किसानों से पहले लाइसेंस टेस्टर से एक टेस्ट ख़रीदारी (पैसे नहीं कटते)',
    inside: 'किस प्लान में क्या',
    i_feat: 'फ़ीचर', i_free: 'हर किसान', i_pro: 'Khalihan Pro',
    f1: 'Khalihan AI से सरकारी फ़ॉर्म भरना', f1a: '— (साइट ख़ुद भरता है)', f1b: 'बेहिसाब',
    f2: 'कागज़ और भरे फ़ॉर्म खाते में', f2a: '—', f2b: '✓',
    f3: 'Khalihan AI — सवाल, फ़ोटो पढ़ना (स्विच → AI की हद)', f3a: '— (Pro बिकने के बाद कुछ नहीं)', f3b: 'हिस्सा + एक्स्ट्रा (लाल)',
    f4: '"कुछ भी पूछें" और Google खोज', f4a: '—', f4b: '✓',
    f5: 'Kaptan की आवाज़ — AI अपनी आवाज़ में बोलता है', f5a: '— (फ़ोन की आवाज़)', f5b: '✓',
    f6: 'टारगेट भाव अलर्ट', f6a: '—', f6b: '✓',
    help: 'किसान की मदद',
    help_d: 'आगे आएगा: किसान का मोबाइल नंबर डालो → उसका प्लान, कब तक, पेमेंट की हालत, और "Google से दोबारा जाँच" बटन — पैसे कटे पर Pro न खुला हो तो एक क्लिक में ठीक। तब तक: किसान Pro वाली शीट खोलकर "Restore purchase" दबाए।',
    help_ph: 'मोबाइल नंबर — आगे आएगा',
    probs: 'आम दिक़्क़तें और क्या करें',
    p_q: 'किसान कहे', p_a: 'क्या करें',
    q1: 'पैसे कट गए, Pro नहीं खुला', a1: 'ऐप में: प्रोफ़ाइल → Khalihan Pro → "Restore purchase" — हमारा सर्वर Google से दोबारा जाँचता है। ऑर्डर नंबर (GPA.…) किसान के Google Play वाले रसीद ई-मेल में होता है।',
    q2: 'नया फ़ोन / ऐप दोबारा डाला', a2: 'उसी मोबाइल नंबर से लॉग-इन करें — Pro अपने आप वापस।',
    q3: 'कैंसल करना है', a3: 'ऐप में: प्रोफ़ाइल → Khalihan Pro → Manage (या Play Store → Payments & subscriptions → Subscriptions → Khalihan → Cancel)। जितने दिन के पैसे दिए, उतने दिन Pro चलता रहेगा।',
    q4: 'रिफ़ंड चाहिए', a4: 'पहले 48 घंटे में किसान सीधे Google Play से माँग सकता है; उसके बाद हम Play Console → Order management से रिफ़ंड करते हैं।',
    q5: 'UPI/कार्ड फ़ेल, रिन्यू नहीं हुआ', a5: 'Google कुछ दिन की मोहलत देता है, तब तक Pro चलता है। किसान Play में पेमेंट का तरीका बदले।',
    q6: 'दूसरे नंबर से लॉग-इन किया', a6: 'Pro उसी नंबर का है जिससे ख़रीदा — उसी से लॉग-इन करें। एक ख़रीदारी दूसरे खाते में नहीं जाती।',
    q7: 'मुफ़्त ट्रायल नहीं दिखा', a7: 'Google ट्रायल एक इंसान को एक बार और सिर्फ़ ऑटो-पे (UPI Autopay या कार्ड) के साथ दिखाता है। जिसने पहले लिया, उसे सीधा दाम दिखेगा।',
  },
};

// Codes: 8 letters/digits, no look-alikes (no I, O, 0, 1) — easy to read
// out on a call. 32 symbols, so a random byte & 31 is fair.
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_GIFTS = 10;
const MAX_TESTS = 3;
const newCode = () => [...crypto.getRandomValues(new Uint8Array(8))].map((b) => ALPHA[b & 31]).join('');
const shown = (code) => `${code.slice(0, 4)}-${code.slice(4)}`;
const ymd = (d) => (d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const GIFT_LINK = (code) => `https://khalihan-admin.web.app/gift/${code}`;

/** "m1" → 1, "m3" → 3, "m12" → 12, "y1" → 12 (the base plan ids in Play Console). */
export function planMonths(basePlan) {
  const m = /^([my])?(\d+)/i.exec(String(basePlan || ''));
  if (!m) return 1;
  const n = Math.max(1, +m[2]);
  return (m[1] || '').toLowerCase() === 'y' ? n * 12 : n;
}

/** What reaches us of a price Google charges: less 18% GST, then Google's 15%. */
export const toUs = (price) => (price / 1.18) * 0.85;

/** Members now (not run out): counts and the month's money (≈). */
export function memberSummary(list, now = new Date()) {
  const live = (list || []).filter((m) => m.until && m.until > now && (m.tier === 'plus' || m.tier === 'pro'));
  const real = live.filter((m) => !m.test);
  const out = { plus: 0, pro: 0, trial: 0, off: 0, prepaid: 0, tests: live.length - real.length, money: 0, plans: [] };
  const byPlan = new Map();
  for (const m of real) {
    out[m.tier]++;
    if (m.trial) out.trial++;
    if (!m.autoRenew && !m.prepaid) out.off++;
    if (m.prepaid) out.prepaid++;
    const months = planMonths(m.basePlan);
    const key = `${m.tier}|${months}`;
    const row = byPlan.get(key) || { tier: m.tier, months, n: 0, price: 0, month: 0 };
    row.n++;
    if (!m.trial && m.price > 0) {
      row.price = Math.max(row.price, m.price);
      row.month += toUs(m.price) / months;
    }
    byPlan.set(key, row);
  }
  out.plans = [...byPlan.values()].sort((a, b) => (a.tier === b.tier ? a.months - b.months : a.tier === 'plus' ? -1 : 1));
  out.money = out.plans.reduce((a, r) => a + r.month, 0);
  return out;
}

/** The page. [deps]: { esc, setMain, lang: () => 'en' | 'hi', db: () => db, toast, fail }. */
export async function plusPage(deps) {
  const { esc, setMain, lang, db, toast, fail } = deps;
  const t = (k, v) => {
    let s = (T[lang()] || T.en)[k] || T.en[k] || k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  let gifts = null;
  let members = null;
  [gifts, members] = await Promise.all([
    db().plusGifts().catch((e) => { console.warn(e); return null; }),
    (db().plusMembers ? db().plusMembers() : Promise.resolve([])).catch((e) => { console.warn(e); return null; }),
  ]);
  const now = new Date();
  const people = (gifts || []).filter((g) => !g.test);
  const tests = (gifts || []).filter((g) => g.test);
  const sorted = [...tests, ...people.sort((a, b) => (b.at || 0) - (a.at || 0))];
  const fresh = deps.fresh; // the code just made: shown big once
  const sum = memberSummary(members || [], now);
  const running = sum.plus + sum.pro > 0;
  const rupees = (n) => Math.round(n).toLocaleString('en-IN');
  const tierName = (x) => t(x === 'pro' ? 'm_pro' : 'm_plus');

  const steps = ['how1', 'how2', 'how3', 'how4'];
  const needs = ['need1', 'need2', 'need3', 'need4', 'need5', 'need6'];
  const feats = [1, 2, 3, 4, 5, 6];
  const probs = [1, 2, 3, 4, 5, 6, 7];

  const till = (g) => {
    if (!g.until) return esc(t('g_always'));
    return g.until < now ? `<span class="pill warn">${esc(t('g_ended', { d: ymd(g.until) }))}</span>` : esc(ymd(g.until));
  };
  const phone = (g) => (g.device
    ? esc(t('g_on_phone', { d: ymd(g.claimed), v: g.app || '?' }))
    : `<span class="muted">${esc(t('g_waiting'))}</span>`);
  const giftTier = () => 'pro'; // one plan (owner, 16 Nov 17:25)
  const giftRows = sorted.map((g) => `
    <tr>
      <td><b>${esc(g.name)}</b> <span class="pill ${giftTier(g) === 'pro' ? 'warn' : 'on'}">${esc(tierName(giftTier(g)))}</span>${g.test ? ` <span class="pill info">${esc(t('g_test_tag'))}</span>` : ''}${g.note ? `<div class="small muted">${esc(g.note)}</div>` : ''}</td>
      <td style="font-family:ui-monospace,monospace;font-weight:800;letter-spacing:1px;white-space:nowrap">${esc(shown(g.id))}</td>
      <td class="small">${till(g)}</td>
      <td class="small">${phone(g)}</td>
      <td style="white-space:nowrap;text-align:right">
        <button class="plain small" data-glink="${esc(g.id)}">${esc(t('g_copy_link'))}</button>
        ${g.device ? `<button class="plain small" data-gfree="${esc(g.id)}">${esc(t('g_free'))}</button>` : ''}
        <button class="danger small" data-grm="${esc(g.id)}">${esc(t('g_rm'))}</button>
      </td>
    </tr>`).join('');
  const stat = (n, l, cls = '') => `<div class="stat ${cls}"><div class="n">${n}</div><div class="l">${esc(l)}</div></div>`;
  const memberCard = members === null ? `<p class="muted">${esc(t('m_failed'))}</p>` : `
      <div class="kpis" style="margin:12px 0 8px">
        ${stat(sum.pro + sum.plus, t('m_pro'), running ? 'good' : '')}${stat(sum.pro + sum.plus - sum.trial, t('m_paid'))}${stat(sum.trial, t('m_trial'))}${stat(sum.off, t('m_off'), sum.off ? 'warn' : '')}
      </div>
      ${running ? `
        <div class="title" style="margin-top:6px">${esc(t('m_money', { r: rupees(sum.money) }))}</div>
        <div class="small muted" style="line-height:1.5">${esc(t('m_money_d'))}</div>
        <div style="overflow-x:auto;margin-top:10px"><table>
          <tr><th>${esc(t('th_plan'))}</th><th>${esc(t('th_len'))}</th><th>${esc(t('th_n'))}</th><th>${esc(t('th_price'))}</th><th>${esc(t('th_month'))}</th></tr>
          ${sum.plans.map((r) => `<tr><td>${esc(tierName(r.tier))}</td><td>${esc(t('len_m', { n: r.months }))}</td><td>${r.n}</td><td>${r.price ? '₹' + rupees(r.price) : '—'}</td><td>${r.month ? '≈ ₹' + rupees(r.month) : '—'}</td></tr>`).join('')}
        </table></div>` : `<p class="muted">${esc(t('m_none'))}</p>`}
      ${sum.prepaid ? `<div class="small muted" style="margin-top:6px">${esc(t('m_prepaid', { n: sum.prepaid }))}</div>` : ''}
      ${sum.tests ? `<div class="small muted" style="margin-top:4px">${esc(t('m_tests', { n: sum.tests }))}</div>` : ''}`;

  setMain(`
    <h1>${esc(t('title'))}</h1>
    <p class="muted" style="margin-top:-6px">${esc(t('sub'))}</p>
    <div class="card">
      <div class="row between"><div class="title">${esc(t('how'))}</div><span class="pill ${running ? 'on' : ''}">${esc(t(running ? 'st_on' : 'st_off'))}</span></div>
      ${running ? '' : `<div class="sub" style="line-height:1.5">${esc(t('st_off_d'))}</div>`}
      <ol style="margin:10px 0 0 18px;padding:0;line-height:1.6">${steps.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ol>
    </div>
    <div class="card" id="members">
      <div class="title">👥 ${esc(t('mem'))}</div>
      ${memberCard}
    </div>
    <div class="card" id="gifts">
      <div class="row between"><div class="title">🎁 ${esc(t('gifts'))}</div>
        <span class="pill ${people.length >= MAX_GIFTS ? 'warn' : 'on'}">${esc(t('g_count', { n: people.length }))}</span></div>
      <div class="sub" style="line-height:1.5">${esc(t('gifts_d'))}</div>
      ${fresh ? `
        <div style="margin:14px 0 4px;padding:14px 16px;border-radius:14px;background:var(--green-tint)">
          <div class="small" style="font-weight:800">${esc(t('g_new', { name: fresh.name }))} · ${esc(tierName(fresh.tier))}</div>
          <div class="row between" style="margin-top:6px;gap:12px;flex-wrap:wrap">
            <div style="font-family:ui-monospace,monospace;font-size:30px;font-weight:900;letter-spacing:3px">${esc(shown(fresh.code))}</div>
            <div class="row" style="gap:8px"><button class="main" id="g-copy-link">${esc(t('g_copy_link'))}</button><button class="plain" id="g-copy">${esc(t('g_copy'))}</button></div>
          </div>
          <div class="small" style="margin-top:8px;font-family:ui-monospace,monospace;word-break:break-all">${esc(GIFT_LINK(fresh.code))}</div>
          <div class="small" style="margin-top:6px;line-height:1.5">${esc(t('g_tell'))}</div>
        </div>` : ''}
      ${gifts === null ? `<p class="muted">${esc(t('g_failed'))}</p>` : sorted.length ? `
        <div style="overflow-x:auto;margin-top:10px"><table>
          <tr><th>${esc(t('th_for'))}</th><th>${esc(t('th_code'))}</th><th>${esc(t('th_till'))}</th><th>${esc(t('th_phone'))}</th><th></th></tr>
          ${giftRows}
        </table></div>
        ${tests.length ? `<div class="small muted" style="margin-top:6px">${esc(t('g_tests', { n: tests.length }))}</div>` : ''}`
      : `<p class="muted">${esc(t('g_none'))}</p>`}
      <div class="form" style="margin-top:6px">
        <div><label for="g-name">${esc(t('g_name'))}</label><input id="g-name" maxlength="60" placeholder="${esc(t('g_name_ph'))}"></div>
        <div><label for="g-note">${esc(t('g_note'))}</label><input id="g-note" maxlength="120" placeholder="${esc(t('g_note_ph'))}"></div>
        <div><label for="g-until">${esc(t('g_until'))}</label><input id="g-until" type="date"></div>
        <div class="wide"><label class="check"><input type="checkbox" id="g-test"> ${esc(t('g_test'))}</label></div>
      </div>
      <div class="actions"><button class="main" id="g-make" ${gifts === null ? 'disabled' : ''}>${esc(t('g_make'))}</button></div>
    </div>
    <div class="card">
      <div class="title">${esc(t('need'))}</div>
      <ul style="margin:8px 0 0 18px;padding:0;line-height:1.6">${needs.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <div class="title">${esc(t('inside'))}</div>
      <div style="overflow-x:auto"><table><tr><th>${esc(t('i_feat'))}</th><th>${esc(t('i_free'))}</th><th>${esc(t('i_pro'))}</th></tr>
        ${feats.map((n) => `<tr><td>${esc(t('f' + n))}</td><td class="small">${esc(t('f' + n + 'a'))}</td><td class="small">${esc(t('f' + n + 'b'))}</td></tr>`).join('')}
      </table></div>
    </div>
    <div class="card">
      <div class="title">${esc(t('help'))}</div>
      <div class="sub" style="line-height:1.5">${esc(t('help_d'))}</div>
      <input type="tel" disabled placeholder="${esc(t('help_ph'))}" aria-label="${esc(t('help_ph'))}" style="margin-top:10px;width:100%;max-width:360px">
    </div>
    <div class="card">
      <div class="title">${esc(t('probs'))}</div>
      <table><tr><th>${esc(t('p_q'))}</th><th>${esc(t('p_a'))}</th></tr>
        ${probs.map((n) => `<tr><td>${esc(t('q' + n))}</td><td class="small">${esc(t('a' + n))}</td></tr>`).join('')}
      </table>
    </div>`);

  const again = (extra) => plusPage({ ...deps, fresh: undefined, ...extra });
  const byId = (code) => (gifts || []).find((g) => g.id === code) || { name: code };
  const $ = (sel) => document.querySelector(sel);
  const put = async (text) => {
    try { await navigator.clipboard.writeText(text); toast(t('g_copied')); } catch (_) { /* old browser: they read it off */ }
  };

  if (fresh) {
    const copy = $('#g-copy');
    if (copy) copy.onclick = () => put(shown(fresh.code));
    const link = $('#g-copy-link');
    if (link) link.onclick = () => put(GIFT_LINK(fresh.code));
  }
  document.querySelectorAll('[data-glink]').forEach((b) => {
    b.onclick = () => put(GIFT_LINK(b.dataset.glink));
  });
  document.querySelectorAll('[data-gfree]').forEach((b) => {
    b.onclick = async () => {
      if (!confirm(t('g_free_q', { name: byId(b.dataset.gfree).name }))) return;
      try { await db().freePlusGift(b.dataset.gfree); toast(t('g_free_done')); again(); } catch (e) { fail(e); }
    };
  });
  document.querySelectorAll('[data-grm]').forEach((b) => {
    b.onclick = async () => {
      if (!confirm(t('g_rm_q', { name: byId(b.dataset.grm).name }))) return;
      try { await db().removePlusGift(b.dataset.grm); again(); } catch (e) { fail(e); }
    };
  });
  const testBox = $('#g-test');
  $('#g-make').onclick = async () => {
    const name = $('#g-name').value.trim();
    const test = testBox.checked;
    const tier = 'pro';
    if (!name) return toast(t('g_need_name'));
    if (!test && people.length >= MAX_GIFTS) return toast(t('g_full'));
    if (test && tests.length >= MAX_TESTS) return toast(t('g_tests_full'));
    const u = $('#g-until').value; // YYYY-MM-DD: free through the end of that day
    const until = u ? new Date(+u.slice(0, 4), +u.slice(5, 7) - 1, +u.slice(8, 10), 23, 59, 59) : null;
    const btn = $('#g-make');
    btn.disabled = true;
    try {
      let code = newCode();
      const data = { name, note: $('#g-note').value.trim(), until, test, tier };
      try {
        await db().addPlusGift(code, data);
      } catch (e) {
        if (String(e && e.message) !== 'code-taken') throw e;
        code = newCode(); // one in a trillion: just draw again
        await db().addPlusGift(code, data);
      }
      again({ fresh: { code, name, tier } });
    } catch (e) { btn.disabled = false; fail(e); }
  };
}
