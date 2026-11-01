// Khalihan Plus — the owner's settings and help page (Admin 1.15, 1 Nov
// 2026). Plus has no switches (owner: "paid ke switch nahi chahiye — jaise
// hi user khareede, apne aap chalu ho; hum sirf madad karein"). This page
// says how it turns on by itself, what's in it, and how we help a farmer
// when something goes wrong. The member lookup and "check again with
// Google" come with Play Billing (server + Firestore rules, asked first).

const T = {
  en: {
    title: '⭐ Khalihan Plus',
    sub: 'The one paid plan. It runs by itself — no switches, nothing to turn on for any farmer.',
    st_off: 'Off for now',
    st_off_d: 'Plus turns on by itself once the khalihan_plus subscription is on Google Play and the app has Play Billing. Until then every Plus feature stays hidden in the app — nobody uses one free and loses it later.',
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
    st_off_d: 'जैसे ही Google Play पर khalihan_plus सब्सक्रिप्शन बनेगा और ऐप में Play Billing आएगी, Plus अपने आप चालू हो जाएगा। तब तक ऐप में Plus के सारे फ़ीचर छिपे रहेंगे — कोई उन्हें मुफ़्त में चलाकर बाद में खोएगा नहीं।',
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

/** The page. [deps]: { esc, setMain, lang: () => 'en' | 'hi' }. */
export function plusPage({ esc, setMain, lang }) {
  const t = (k) => (T[lang()] || T.en)[k] || T.en[k] || k;
  const steps = ['how1', 'how2', 'how3', 'how4'];
  const needs = ['need1', 'need2', 'need3', 'need4', 'need5', 'need6'];
  const feats = [1, 2, 3, 4, 5];
  const probs = [1, 2, 3, 4, 5, 6];
  setMain(`
    <h1>${esc(t('title'))}</h1>
    <p class="muted" style="margin-top:-6px">${esc(t('sub'))}</p>
    <div class="card">
      <div class="row between"><div class="title">${esc(t('how'))}</div><span class="pill">${esc(t('st_off'))}</span></div>
      <div class="sub" style="line-height:1.5">${esc(t('st_off_d'))}</div>
      <ol style="margin:10px 0 0 18px;padding:0;line-height:1.6">${steps.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ol>
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
}
