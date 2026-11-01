// Khalihan Plus — the owner's settings and help page (Admin 1.15, 1 Nov
// 2026). Plus has no switches (owner: "paid ke switch nahi chahiye — jaise
// hi user khareede, apne aap chalu ho; hum sirf madad karein"). This page
// says how it turns on by itself, what's in it, and how we help a farmer
// when something goes wrong. The member lookup and "check again with
// Google" come with Play Billing (server + Firestore rules, asked first).
//
// Admin 1.16 (1 Nov 2026): free Plus by gift code, owner only (owner: "10
// logon ko free dena chahun to — section banao, sirf owner ke liye"). A
// code in plus_gifts/{CODE}; the person types it in the app (Profile →
// मदद और जानकारी → गिफ़्ट कोड) and Plus opens on that phone — no login, no payment. One code,
// one phone; "Free for a new phone" lets it move. The owner's own test
// phones also see the switched-off features (Sell, Kendra, Login).

const T = {
  en: {
    title: '⭐ Khalihan Plus',
    sub: 'The one paid plan. It runs by itself — no switches, nothing to turn on for any farmer.',
    st_off: 'Off for now',
    st_off_d: 'Plus turns on by itself once the khalihan_plus subscription is on Google Play and the app has Play Billing. Until then every Plus feature stays hidden in the app — nobody uses one free and loses it later. Gift codes (below) work already.',
    how: 'How it works',
    how1: 'The farmer buys Plus in the app (Google Play payment — UPI, card, Play balance).',
    how2: 'Our server checks the payment with Google.',
    how3: 'Plus opens in the farmer\'s account at once — on every phone they log in on.',
    how4: 'Renewals, cancellations and refunds: Google tells our server and the account follows by itself.',
    need: 'Before Plus can start',
    need1: 'Plus price — monthly and yearly (owner)',
    need2: 'Play Console payments profile — PAN, bank account (owner)',
    need3: 'Subscription khalihan_plus in Play Console, monthly + yearly (owner, Claude gives the steps)',
    need4: 'Firebase Blaze plan (owner)',
    need5: 'Play Billing in the app + the payment check on our server (Claude)',
    need6: 'Play Data safety "Purchase history" + privacy policy lines (Claude writes, owner submits)',
    inside: 'What\'s in Plus',
    i_feat: 'Feature', i_state: 'Where it is',
    f1: 'Target price — alert when the price is reached', s1: 'Built — hidden until Plus starts',
    f2: 'Khalihan AI — questions, forms, pest photo + medicine dose, soil card', s2: 'Mock-ups ready',
    f3: 'Advanced crop calendar and reminders', s3: 'To build',
    f4: 'Lower fee in "Sell to Khalihan", Kendra discount', s4: 'When trading starts',
    f5: 'Theft alarm, field camera, fence and motor control', s5: 'Later',
    gifts: 'Free Plus — gift codes',
    gifts_d: 'Give Plus free, without a subscription, to up to 10 people. Make a code and tell it to the person; they type it in the app under Profile → Help (मदद और जानकारी) → गिफ़्ट कोड. Plus opens on that phone at once — no login, no payment. One code works on one phone.',
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
    g_tell: 'Tell them: Khalihan app → Profile → मदद और जानकारी → गिफ़्ट कोड → type the code → चालू करें.',
    g_copy: 'Copy', g_copied: 'Copied',
    th_for: 'For', th_code: 'Code', th_till: 'Free till', th_phone: 'Phone',
    g_always: 'Always', g_ended: 'Ended {d}',
    g_waiting: 'Not used yet',
    g_on_phone: 'On a phone since {d} · app {v}',
    g_test_tag: 'Test phone',
    g_free: 'Free for a new phone',
    g_free_q: 'Free the code for {name} for a new phone? The old phone loses Plus at its next start.',
    g_free_done: 'Done — the code now works on the next phone that types it.',
    g_rm: 'Remove',
    g_rm_q: 'Remove the code for {name}? Plus closes on their phone at its next start.',
    g_none: 'No codes yet.',
    g_failed: 'Could not load the codes — check the internet and open the page again.',
    help: 'Helping a farmer',
    help_d: 'With Play Billing: type the farmer\'s mobile number → their Plus (plan, valid till, payment state, order number) and a "Check again with Google" button that fixes a paid-but-not-open Plus in one click.',
    help_ph: 'Mobile number — after Play Billing',
    probs: 'Usual problems and what to do',
    p_q: 'Farmer says', p_a: 'What to do',
    q1: 'Money was taken but Plus didn\'t open', a1: '"Check again with Google" (after billing). The order number (GPA.…) is in the farmer\'s Google Play receipt e-mail.',
    q2: 'New phone or app reinstalled', a2: 'Log in with the same mobile number — Plus comes back by itself.',
    q3: 'Wants to cancel', a3: 'Play Store → Payments & subscriptions → Subscriptions → Khalihan → Cancel. Plus keeps working till the paid period ends.',
    q4: 'Wants a refund', a4: 'In the first 48 hours the farmer can ask Google Play directly; after that we refund from Play Console → Order management.',
    q5: 'UPI/card failed, renewal didn\'t go through', a5: 'Google gives a few days\' grace; Plus keeps working meanwhile. The farmer updates the payment method in Play.',
    q6: 'Logged in with another number', a6: 'Log in with the number used when buying, or use "Restore purchase" in the app (after billing).',
  },
  hi: {
    title: '⭐ Khalihan Plus',
    sub: 'एक ही पैसे वाला प्लान। अपने आप चलता है — कोई स्विच नहीं, किसी किसान के लिए हाथ से कुछ चालू नहीं करना।',
    st_off: 'अभी बंद',
    st_off_d: 'जैसे ही Google Play पर khalihan_plus सब्सक्रिप्शन बनेगा और ऐप में Play Billing आएगी, Plus अपने आप चालू हो जाएगा। तब तक ऐप में Plus के सारे फ़ीचर छिपे रहेंगे — कोई उन्हें मुफ़्त में चलाकर बाद में खोएगा नहीं। गिफ़्ट कोड (नीचे) अभी से चलते हैं।',
    how: 'कैसे चलता है',
    how1: 'किसान ऐप में Plus ख़रीदता है (Google Play से पेमेंट — UPI, कार्ड, Play बैलेंस)।',
    how2: 'हमारा सर्वर Google से पेमेंट पक्का करता है।',
    how3: 'किसान के खाते में Plus तुरंत चालू — जिस भी फ़ोन पर लॉग-इन करे।',
    how4: 'रिन्यू, कैंसल, रिफ़ंड: Google हमारे सर्वर को बताता है, खाता अपने आप बदल जाता है।',
    need: 'Plus शुरू होने से पहले',
    need1: 'Plus का दाम — महीना और साल (मालिक)',
    need2: 'Play Console पेमेंट्स प्रोफ़ाइल — PAN, बैंक खाता (मालिक)',
    need3: 'Play Console में khalihan_plus सब्सक्रिप्शन, महीना + साल (मालिक; स्टेप Claude देगा)',
    need4: 'Firebase Blaze प्लान (मालिक)',
    need5: 'ऐप में Play Billing + सर्वर पर पेमेंट की जाँच (Claude)',
    need6: 'Play Data safety में "Purchase history" + प्राइवेसी पॉलिसी (Claude लिखेगा, मालिक भेजेगा)',
    inside: 'Plus में क्या है',
    i_feat: 'फ़ीचर', i_state: 'कहाँ तक',
    f1: 'टारगेट भाव — भाव पहुँचते ही अलर्ट', s1: 'बना हुआ — Plus शुरू होने तक छिपा',
    f2: 'Khalihan AI — सवाल, फ़ॉर्म, कीट की फ़ोटो + दवा की मात्रा, मिट्टी कार्ड', s2: 'मॉकअप तैयार',
    f3: 'एडवांस फ़सल कैलेंडर और याद', s3: 'बनाना है',
    f4: '"Khalihan को बेचें" में कम फ़ीस, केंद्र पर छूट', s4: 'व्यापार शुरू होने पर',
    f5: 'चोरी का अलार्म, खेत का कैमरा, झटका मशीन, मोटर कंट्रोल', s5: 'बाद में',
    gifts: 'मुफ़्त Plus — गिफ़्ट कोड',
    gifts_d: 'बिना सब्सक्रिप्शन के 10 लोगों तक को Plus मुफ़्त दें। कोड बनाइए और उस इंसान को बताइए; वो ऐप में प्रोफ़ाइल → मदद और जानकारी → गिफ़्ट कोड में डालेगा। उसी फ़ोन पर Plus तुरंत चालू — न लॉग-इन, न पेमेंट। एक कोड एक फ़ोन पर चलता है।',
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
    g_tell: 'उन्हें बताइए: Khalihan ऐप → प्रोफ़ाइल → मदद और जानकारी → गिफ़्ट कोड → कोड लिखें → चालू करें।',
    g_copy: 'कॉपी', g_copied: 'कॉपी हो गया',
    th_for: 'किसके लिए', th_code: 'कोड', th_till: 'कब तक', th_phone: 'फ़ोन',
    g_always: 'हमेशा', g_ended: '{d} को ख़त्म',
    g_waiting: 'अभी इस्तेमाल नहीं हुआ',
    g_on_phone: '{d} से एक फ़ोन पर · ऐप {v}',
    g_test_tag: 'टेस्ट फ़ोन',
    g_free: 'नए फ़ोन के लिए खोलो',
    g_free_q: '{name} का कोड नए फ़ोन के लिए खोलें? पुराने फ़ोन पर Plus अगली बार ऐप खुलने पर बंद हो जाएगा।',
    g_free_done: 'हो गया — अब जो फ़ोन ये कोड डालेगा, उस पर चलेगा।',
    g_rm: 'हटाओ',
    g_rm_q: '{name} का कोड हटाएँ? उनके फ़ोन पर Plus अगली बार ऐप खुलने पर बंद हो जाएगा।',
    g_none: 'अभी कोई कोड नहीं।',
    g_failed: 'कोड नहीं खुले — इंटरनेट देखकर पेज दोबारा खोलिए।',
    help: 'किसान की मदद',
    help_d: 'Play Billing आने के बाद: किसान का मोबाइल नंबर डालो → उसका Plus (प्लान, कब तक, पेमेंट की हालत, ऑर्डर नंबर) और "Google से दोबारा जाँच" बटन — पैसे कटे पर Plus न खुला हो तो एक क्लिक में ठीक।',
    help_ph: 'मोबाइल नंबर — Play Billing के बाद',
    probs: 'आम दिक़्क़तें और क्या करें',
    p_q: 'किसान कहे', p_a: 'क्या करें',
    q1: 'पैसे कट गए, Plus नहीं खुला', a1: '"Google से दोबारा जाँच" दबाओ (बिलिंग के बाद)। ऑर्डर नंबर (GPA.…) किसान के Google Play वाले रसीद ई-मेल में होता है।',
    q2: 'नया फ़ोन / ऐप दोबारा डाला', a2: 'उसी मोबाइल नंबर से लॉग-इन करें — Plus अपने आप वापस।',
    q3: 'कैंसल करना है', a3: 'Play Store → Payments & subscriptions → Subscriptions → Khalihan → Cancel। जितने दिन के पैसे दिए, उतने दिन Plus चलता रहेगा।',
    q4: 'रिफ़ंड चाहिए', a4: 'पहले 48 घंटे में किसान सीधे Google Play से माँग सकता है; उसके बाद हम Play Console → Order management से रिफ़ंड करते हैं।',
    q5: 'UPI/कार्ड फ़ेल, रिन्यू नहीं हुआ', a5: 'Google कुछ दिन की मोहलत देता है, तब तक Plus चलता है। किसान Play में पेमेंट का तरीका बदले।',
    q6: 'दूसरे नंबर से लॉग-इन किया', a6: 'ख़रीदते समय वाले नंबर से लॉग-इन करें, या ऐप में "ख़रीदारी वापस लाओ" (बिलिंग के बाद)।',
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

/** The page. [deps]: { esc, setMain, lang: () => 'en' | 'hi', db: () => db, toast, fail }. */
export async function plusPage(deps) {
  const { esc, setMain, lang, db, toast, fail } = deps;
  const t = (k, v) => {
    let s = (T[lang()] || T.en)[k] || T.en[k] || k;
    if (v) Object.entries(v).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  let gifts = null;
  try { gifts = await db().plusGifts(); } catch (e) { console.warn(e); }
  const now = new Date();
  const people = (gifts || []).filter((g) => !g.test);
  const tests = (gifts || []).filter((g) => g.test);
  const sorted = [...tests, ...people.sort((a, b) => (b.at || 0) - (a.at || 0))];
  const fresh = deps.fresh; // the code just made: shown big once

  const steps = ['how1', 'how2', 'how3', 'how4'];
  const needs = ['need1', 'need2', 'need3', 'need4', 'need5', 'need6'];
  const feats = [1, 2, 3, 4, 5];
  const probs = [1, 2, 3, 4, 5, 6];

  const till = (g) => {
    if (!g.until) return esc(t('g_always'));
    return g.until < now ? `<span class="pill warn">${esc(t('g_ended', { d: ymd(g.until) }))}</span>` : esc(ymd(g.until));
  };
  const phone = (g) => (g.device
    ? esc(t('g_on_phone', { d: ymd(g.claimed), v: g.app || '?' }))
    : `<span class="muted">${esc(t('g_waiting'))}</span>`);
  const giftRows = sorted.map((g) => `
    <tr>
      <td><b>${esc(g.name)}</b>${g.test ? ` <span class="pill info">${esc(t('g_test_tag'))}</span>` : ''}${g.note ? `<div class="small muted">${esc(g.note)}</div>` : ''}</td>
      <td style="font-family:ui-monospace,monospace;font-weight:800;letter-spacing:1px;white-space:nowrap">${esc(shown(g.id))}</td>
      <td class="small">${till(g)}</td>
      <td class="small">${phone(g)}</td>
      <td style="white-space:nowrap;text-align:right">
        ${g.device ? `<button class="plain small" data-gfree="${esc(g.id)}">${esc(t('g_free'))}</button>` : ''}
        <button class="danger small" data-grm="${esc(g.id)}">${esc(t('g_rm'))}</button>
      </td>
    </tr>`).join('');

  setMain(`
    <h1>${esc(t('title'))}</h1>
    <p class="muted" style="margin-top:-6px">${esc(t('sub'))}</p>
    <div class="card">
      <div class="row between"><div class="title">${esc(t('how'))}</div><span class="pill">${esc(t('st_off'))}</span></div>
      <div class="sub" style="line-height:1.5">${esc(t('st_off_d'))}</div>
      <ol style="margin:10px 0 0 18px;padding:0;line-height:1.6">${steps.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ol>
    </div>
    <div class="card" id="gifts">
      <div class="row between"><div class="title">🎁 ${esc(t('gifts'))}</div>
        <span class="pill ${people.length >= MAX_GIFTS ? 'warn' : 'on'}">${esc(t('g_count', { n: people.length }))}</span></div>
      <div class="sub" style="line-height:1.5">${esc(t('gifts_d'))}</div>
      ${fresh ? `
        <div style="margin:14px 0 4px;padding:14px 16px;border-radius:14px;background:var(--green-tint)">
          <div class="small" style="font-weight:800">${esc(t('g_new', { name: fresh.name }))}</div>
          <div class="row between" style="margin-top:6px;gap:12px;flex-wrap:wrap">
            <div style="font-family:ui-monospace,monospace;font-size:30px;font-weight:900;letter-spacing:3px">${esc(shown(fresh.code))}</div>
            <button class="plain" id="g-copy">${esc(t('g_copy'))}</button>
          </div>
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
        <div><label>${esc(t('g_name'))}</label><input id="g-name" maxlength="60" placeholder="${esc(t('g_name_ph'))}"></div>
        <div><label>${esc(t('g_note'))}</label><input id="g-note" maxlength="120" placeholder="${esc(t('g_note_ph'))}"></div>
        <div><label>${esc(t('g_until'))}</label><input id="g-until" type="date"></div>
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
      <table><tr><th>${esc(t('i_feat'))}</th><th>${esc(t('i_state'))}</th></tr>
        ${feats.map((n) => `<tr><td>${esc(t('f' + n))}</td><td class="small">${esc(t('s' + n))}</td></tr>`).join('')}
      </table>
    </div>
    <div class="card">
      <div class="title">${esc(t('help'))}</div>
      <div class="sub" style="line-height:1.5">${esc(t('help_d'))}</div>
      <input type="tel" disabled placeholder="${esc(t('help_ph'))}" style="margin-top:10px;width:100%;max-width:360px">
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

  const copy = $('#g-copy');
  if (copy && fresh) {
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(shown(fresh.code)); toast(t('g_copied')); } catch (_) { /* old browser: they read it off */ }
    };
  }
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
  $('#g-make').onclick = async () => {
    const name = $('#g-name').value.trim();
    const test = $('#g-test').checked;
    if (!name) return toast(t('g_need_name'));
    if (!test && people.length >= MAX_GIFTS) return toast(t('g_full'));
    if (test && tests.length >= MAX_TESTS) return toast(t('g_tests_full'));
    const u = $('#g-until').value; // YYYY-MM-DD: free through the end of that day
    const until = u ? new Date(+u.slice(0, 4), +u.slice(5, 7) - 1, +u.slice(8, 10), 23, 59, 59) : null;
    const btn = $('#g-make');
    btn.disabled = true;
    try {
      let code = newCode();
      try {
        await db().addPlusGift(code, { name, note: $('#g-note').value.trim(), until, test });
      } catch (e) {
        if (String(e && e.message) !== 'code-taken') throw e;
        code = newCode(); // one in a trillion: just draw again
        await db().addPlusGift(code, { name, note: $('#g-note').value.trim(), until, test });
      }
      again({ fresh: { code, name } });
    } catch (e) { btn.disabled = false; fail(e); }
  };
}
