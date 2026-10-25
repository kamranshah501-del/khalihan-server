// Khalihan Admin — the business side of Business Plan v2 (23 Oct 2026),
// owner only (Firestore rules): processors with their rate formula, quotes
// and what they owe us (#3); the licence / renewal calendar (#12); and the
// plan page — the step ("kadam") tracker with each step's conditions, each
// income source's month and the money tied up (#1).

export const BIZ_WORDS = {
  en: {
    tab_plan: 'Plan',
    tab_processors: 'Processors',
    tab_compliance: 'Licences & dates',

    // plan
    pl_h: 'Business plan',
    pl_sub: 'Steps, conditions and money — from Business Plan v2 (23 Oct 2026)',
    pl_now: 'Now: Step {k} — {name}',
    pl_pick: 'Current step',
    pl_step: 'Step {k}',
    pl_pass: '{a} of {b} conditions met',
    pl_all_pass: 'All conditions met — you can start the next step.',
    pl_next: 'Start step {k}',
    pl_fail: 'If it fails',
    pl_auto: 'automatic',
    pl_ok: 'met',
    pl_no: 'not yet',
    pl_saved: 'Saved',
    pl_target: 'target',
    pl_sources_h: 'Income by source',
    pl_src: 'Source',
    pl_this: 'This month',
    pl_last: 'Last month',
    pl_note_src: 'Trade: paid deals with the processor rate entered. Kendra: completed orders with costs entered. The rest start later in the plan.',
    pl_later: 'not started',
    pl_locked_h: 'Money tied up',
    pl_proc_due: 'Processors still to pay us',
    pl_overdue_part: 'overdue {rs}',
    pl_bg: 'Bank guarantee (DML)',
    pl_stock: 'Kendra stock',
    pl_stock_na: 'not tracked yet',
    pl_total: 'Total',
    pl_home: 'Plan: step {k} · {a}/{b} conditions met',
    src_trade: 'Sell to Khalihan (trade)',
    src_kendra: 'Khalihan Kendra',
    src_brand: 'Own brand',
    src_suraksha: 'Suraksha Seva',
    src_b2b: 'Trader tool',

    st0: 'Foundation', st0_when: 'Nov 2026 – Jan 2027', st0_fail: "Don't start trading. Keep the v1 road (My Sales, digital bill); research goes on.",
    st1: 'First truck', st1_when: 'Feb – Apr 2027', st1_fail: 'Stop trading. Try once with another processor or crop; if that fails too, skip — v1 road.',
    st2: 'Kharif 2027', st2_when: 'May – Sep 2027', st2_fail: "Don't open the shop; one more season of Plan 1. Stop brand A, sell the rest in the field.",
    st3: 'Season 2', st3_when: 'Oct 2027 – Mar 2028', st3_fail: 'Kendra back to Plan 1. Stop Suraksha — only the free fencing guide. Keep trade at its level, no new team.',
    st4: 'Grow', st4_when: 'Apr 2028 – Mar 2029', st4_fail: 'Skip China — India OEM only. Trader tool free or off. Close any source in the minus.',

    c_partner: 'Field partner found in Jamner',
    c_formulas: '2+ processors gave a written rate formula',
    c_survey: 'Of 30 farmers surveyed, how many want Suraksha (need 12+)',
    c_path: 'Company / DML or FPO buyer-of-record road decided',
    c_trucks: 'Trucks completed (need 5+)',
    c_margin: 'Net margin per quintal (need ₹40+)',
    c_farmer_more: 'Every deal paid the farmer more than the mandi (after costs)',
    c_on_time: 'Processor payments on time (need 95%+)',
    c_disputes: 'Quality disputes, % of deals (need under 10%)',
    c_repeat: 'Farmers who ordered again (need 150+)',
    c_licences: 'All three Kendra licences received',
    c_brand_sold: 'Brand lot sold, % (need 80%+)',
    c_brand_back: 'Brand returns, % (need under 5%)',
    c_shop: 'Shop sales in 6 months, ₹ lakh (need 25+)',
    c_renew: 'Suraksha members who want to renew, % (need 60%+)',
    c_visits: 'Visits on time, % (need 90%+)',
    c_safety: 'Safety incidents (need 0)',
    c_peak: 'Trucks in the busiest month (need 8+)',
    c_china: 'China cost under 90% of India + sample QC passed',
    c_traders: 'Traders paying fees for 3 months (need 10+)',
    c_sources: 'Every running source in the plus',

    // processors
    pr_h: 'Processors',
    pr_sub: 'Who buys from us: their written formula, cuts, payment days, daily quotes and what they owe',
    pr_add: '+ New processor',
    pr_compare: 'Compare quotes',
    pr_none: 'No processors yet. Add the 3–5 you are talking to (plan, step 0).',
    pr_overdue: '{n} payment(s) overdue: {rs}',
    pr_written: 'written formula',
    pr_no_formula: 'no written formula yet',
    pr_gst: 'GST active',
    pr_mca: 'MCA active',
    pr_checked: 'checked {d}',
    pr_pay_days: 'pays in {n} days',
    pr_owes: 'owes {rs}',
    pr_latest: 'Latest quote',
    f_name: 'Name', f_place: 'Place', f_crops: 'Crops (comma between)', f_contact: 'Contact person', f_phone: 'Phone',
    f_gstin: 'GSTIN', f_gst_active: 'GST active (checked on the GST site)', f_mca_active: 'Company active on MCA',
    f_checked: 'Checked on', f_written: 'Formula received in writing', f_formula: 'Rate formula', f_moisture: 'Moisture limit %',
    f_cuts: 'Quality cuts (moisture, dirt, broken)', f_pay_days: 'Pays in (days)', f_pay_way: 'Pays by', f_notes: 'Notes',
    pr_save: 'Save', pr_delete: 'Delete processor', pr_delete_q: 'Delete {n}? Quotes and payments stay in the list.',
    pr_quotes_h: 'Quotes (gate rate)', pr_q_day: 'Day', pr_q_crop: 'Crop', pr_q_rate: '₹ / quintal', pr_q_basis: 'Where',
    pr_q_gate: 'at their gate', pr_q_farm: 'at the farm', pr_q_note: 'Note', pr_q_add: 'Add quote', pr_q_none: 'No quotes yet — note the gate rate every day for two weeks.',
    pr_pay_h: 'Payments they owe us', pr_p_ref: 'Truck / lot', pr_p_amount: 'Amount ₹', pr_p_due: 'Due on', pr_p_paid: 'Paid on', pr_p_utr: 'UTR / ref',
    pr_p_add: 'Add payment', pr_p_mark: 'Mark paid', pr_p_none: 'Nothing owed.', pr_p_late: '{n} days late', pr_p_left: 'in {n} days', pr_p_today: 'due today',
    pr_v_name: 'Write a name.', pr_v_rate: 'Write the day, crop and rate.', pr_v_pay: 'Write the truck/lot, amount and due date.',
    pr_cmp_h: 'Compare quotes', pr_cmp_crop: 'Crop', pr_cmp_latest: 'Latest', pr_cmp_avg: '14-day average', pr_cmp_n: 'Quotes', pr_cmp_none: 'No quotes for this crop yet.',

    // compliance
    co_h: 'Licences & dates',
    co_sub: 'DML, Kendra licences, IEC, trademark, insurance, GST — nothing should lapse',
    co_add: '+ Add',
    co_quick: 'Quick add:',
    co_none: 'Nothing here yet. Add the licences and filings the plan needs.',
    co_overdue: '{n} days late',
    co_soon: 'in {n} days',
    co_today: 'today',
    co_later: 'in {n} days',
    co_done: 'Done',
    co_done_once: 'Completed',
    co_edit: 'Edit',
    co_delete_q: 'Delete “{n}”?',
    co_every: 'Repeats',
    ev_0: 'once', ev_1: 'every month', ev_3: 'every 3 months', ev_12: 'every year', ev_36: 'every 3 years',
    f_kind: 'Kind', f_due: 'Due date', f_every: 'Repeats', f_remind: 'Remind this many days before',
    kind_licence: 'Licence', kind_filing: 'Filing', kind_renewal: 'Renewal', kind_insurance: 'Insurance', kind_trademark: 'Trademark', kind_other: 'Other',
    co_v: 'Write a name and the due date.',
    co_t_dml: 'DML licence (MSAMB)', co_t_seed: 'Seed licence', co_t_fert: 'Fertiliser licence', co_t_pest: 'Pesticide licence',
    co_t_iec: 'IEC update (Apr–Jun)', co_t_tm: 'Trademark — Khalihan', co_t_ins: 'Insurance renewal', co_t_gst: 'GST return', co_t_roc: 'Company / FPO filing',
    co_task: '{name}: {when}',
    co_task_d: 'Licences & dates',
    pr_task: '{n} processor payment(s) overdue',
  },
  hi: {
    tab_plan: 'प्लान',
    tab_processors: 'प्रोसेसर',
    tab_compliance: 'लाइसेंस और तारीखें',

    pl_h: 'बिज़नेस प्लान',
    pl_sub: 'कदम, शर्तें और पैसा — Business Plan v2 (23 Oct 2026) से',
    pl_now: 'अभी: कदम {k} — {name}',
    pl_pick: 'अभी का कदम',
    pl_step: 'कदम {k}',
    pl_pass: '{b} में से {a} शर्तें पास',
    pl_all_pass: 'सब शर्तें पास — अगला कदम शुरू कर सकते हैं।',
    pl_next: 'कदम {k} शुरू करें',
    pl_fail: 'फ़ेल हो तो',
    pl_auto: 'अपने आप',
    pl_ok: 'पास',
    pl_no: 'बाकी',
    pl_saved: 'सेव हुआ',
    pl_target: 'लक्ष्य',
    pl_sources_h: 'स्रोत के हिसाब से कमाई',
    pl_src: 'स्रोत',
    pl_this: 'इस महीने',
    pl_last: 'पिछले महीने',
    pl_note_src: 'ट्रेड: पैसा दिए गए सौदे जिनमें प्रोसेसर का भाव भरा है। Kendra: पूरे हुए ऑर्डर जिनकी लागत भरी है। बाकी प्लान में आगे शुरू होंगे।',
    pl_later: 'शुरू नहीं',
    pl_locked_h: 'फँसा पैसा',
    pl_proc_due: 'प्रोसेसर से आना बाकी',
    pl_overdue_part: 'देर से {rs}',
    pl_bg: 'बैंक गारंटी (DML)',
    pl_stock: 'Kendra का स्टॉक',
    pl_stock_na: 'अभी गिना नहीं जाता',
    pl_total: 'कुल',
    pl_home: 'प्लान: कदम {k} · {b} में से {a} शर्तें पास',
    src_trade: 'खलिहान को बेचो (ट्रेड)',
    src_kendra: 'खलिहान केंद्र',
    src_brand: 'अपना ब्रांड',
    src_suraksha: 'सुरक्षा सेवा',
    src_b2b: 'व्यापारी टूल',

    st0: 'नींव', st0_when: 'नवं 2026 – जन 2027', st0_fail: 'ट्रेड शुरू मत करो। v1 का रास्ता (मेरी बिक्री, डिजिटल बिल) चलाओ, रिसर्च जारी।',
    st1: 'पहली गाड़ी', st1_when: 'फ़र – अप्रै 2027', st1_fail: 'ट्रेड रोको। एक बार दूसरा प्रोसेसर या दूसरी फसल; फिर भी फ़ेल तो स्किप — v1 रास्ता।',
    st2: 'खरीफ़ 2027', st2_when: 'मई – सितं 2027', st2_fail: 'दुकान मत खोलो, एक सीज़न और Plan 1। ब्रांड A बंद, बचा माल फ़ील्ड से बेचो।',
    st3: 'सीज़न 2', st3_when: 'अक्टू 2027 – मार्च 2028', st3_fail: 'Kendra वापस Plan 1। सुरक्षा बंद — सिर्फ़ मुफ़्त फ़ेंसिंग गाइड। ट्रेड उसी लेवल पर, टीम मत बढ़ाओ।',
    st4: 'बढ़ाओ', st4_when: 'अप्रै 2028 – मार्च 2029', st4_fail: 'चीन स्किप — सिर्फ़ भारत का OEM। व्यापारी टूल मुफ़्त या बंद। माइनस वाला स्रोत बंद।',

    c_partner: 'जामनेर में फ़ील्ड पार्टनर मिला',
    c_formulas: '2+ प्रोसेसर ने लिखित भाव-फ़ॉर्मूला दिया',
    c_survey: '30 में से कितने किसानों को सुरक्षा चाहिए (12+ चाहिए)',
    c_path: 'कंपनी / DML या FPO buyer of record का रास्ता पक्का',
    c_trucks: 'पूरी गाड़ियाँ (5+ चाहिए)',
    c_margin: 'प्रति क्विंटल साफ़ मार्जिन (₹40+ चाहिए)',
    c_farmer_more: 'हर सौदे में किसान को मंडी (खर्च के बाद) से ज़्यादा मिला',
    c_on_time: 'प्रोसेसर का भुगतान समय पर (95%+ चाहिए)',
    c_disputes: 'क्वालिटी झगड़े, सौदों का % (10% से कम चाहिए)',
    c_repeat: 'दोबारा ऑर्डर करने वाले किसान (150+ चाहिए)',
    c_licences: 'Kendra के तीनों लाइसेंस मिले',
    c_brand_sold: 'ब्रांड लॉट बिका, % (80%+ चाहिए)',
    c_brand_back: 'ब्रांड वापसी, % (5% से कम चाहिए)',
    c_shop: 'दुकान की 6 महीने की बिक्री, ₹ लाख (25+ चाहिए)',
    c_renew: 'सुरक्षा सदस्य जो रिन्यू करना चाहते हैं, % (60%+ चाहिए)',
    c_visits: 'समय पर विज़िट, % (90%+ चाहिए)',
    c_safety: 'सुरक्षा घटनाएँ (0 चाहिए)',
    c_peak: 'सबसे बड़े महीने में गाड़ियाँ (8+ चाहिए)',
    c_china: 'चीन की लागत भारत के 90% से कम + सैंपल QC पास',
    c_traders: '3 महीने फ़ीस देने वाले व्यापारी (10+ चाहिए)',
    c_sources: 'हर चालू स्रोत प्लस में',

    pr_h: 'प्रोसेसर',
    pr_sub: 'जो हमसे खरीदते हैं: लिखित फ़ॉर्मूला, कटौती, भुगतान के दिन, रोज़ के भाव और बकाया',
    pr_add: '+ नया प्रोसेसर',
    pr_compare: 'भाव तुलना',
    pr_none: 'अभी कोई प्रोसेसर नहीं। जिन 3–5 से बात चल रही है उन्हें जोड़ें (प्लान, कदम 0)।',
    pr_overdue: '{n} भुगतान देर से: {rs}',
    pr_written: 'लिखित फ़ॉर्मूला',
    pr_no_formula: 'अभी लिखित फ़ॉर्मूला नहीं',
    pr_gst: 'GST चालू',
    pr_mca: 'MCA चालू',
    pr_checked: '{d} को देखा',
    pr_pay_days: '{n} दिन में भुगतान',
    pr_owes: 'बकाया {rs}',
    pr_latest: 'आखिरी भाव',
    f_name: 'नाम', f_place: 'जगह', f_crops: 'फसलें (बीच में कॉमा)', f_contact: 'संपर्क व्यक्ति', f_phone: 'फ़ोन',
    f_gstin: 'GSTIN', f_gst_active: 'GST चालू (GST साइट पर देखा)', f_mca_active: 'MCA पर कंपनी चालू',
    f_checked: 'कब देखा', f_written: 'फ़ॉर्मूला लिखित में मिला', f_formula: 'भाव-फ़ॉर्मूला', f_moisture: 'नमी सीमा %',
    f_cuts: 'क्वालिटी कटौती (नमी, कचरा, टूटा)', f_pay_days: 'भुगतान (दिन में)', f_pay_way: 'भुगतान का तरीका', f_notes: 'नोट',
    pr_save: 'सेव करें', pr_delete: 'प्रोसेसर हटाएँ', pr_delete_q: '{n} हटाएँ? भाव और भुगतान सूची में रहेंगे।',
    pr_quotes_h: 'भाव (गेट रेट)', pr_q_day: 'दिन', pr_q_crop: 'फसल', pr_q_rate: '₹ / क्विंटल', pr_q_basis: 'कहाँ',
    pr_q_gate: 'उनके गेट पर', pr_q_farm: 'खेत पर', pr_q_note: 'नोट', pr_q_add: 'भाव जोड़ें', pr_q_none: 'अभी कोई भाव नहीं — दो हफ़्ते रोज़ गेट रेट लिखें।',
    pr_pay_h: 'उन पर हमारा बकाया', pr_p_ref: 'गाड़ी / लॉट', pr_p_amount: 'रकम ₹', pr_p_due: 'कब तक', pr_p_paid: 'कब मिला', pr_p_utr: 'UTR / रेफ़',
    pr_p_add: 'भुगतान जोड़ें', pr_p_mark: 'मिल गया', pr_p_none: 'कोई बकाया नहीं।', pr_p_late: '{n} दिन देर', pr_p_left: '{n} दिन में', pr_p_today: 'आज',
    pr_v_name: 'नाम लिखें।', pr_v_rate: 'दिन, फसल और भाव लिखें।', pr_v_pay: 'गाड़ी/लॉट, रकम और तारीख लिखें।',
    pr_cmp_h: 'भाव तुलना', pr_cmp_crop: 'फसल', pr_cmp_latest: 'आखिरी', pr_cmp_avg: '14 दिन का औसत', pr_cmp_n: 'भाव', pr_cmp_none: 'इस फसल का अभी कोई भाव नहीं।',

    co_h: 'लाइसेंस और तारीखें',
    co_sub: 'DML, Kendra लाइसेंस, IEC, ट्रेडमार्क, बीमा, GST — कुछ भी छूटना नहीं चाहिए',
    co_add: '+ जोड़ें',
    co_quick: 'जल्दी जोड़ें:',
    co_none: 'अभी कुछ नहीं। प्लान के लिए ज़रूरी लाइसेंस और फ़ाइलिंग जोड़ें।',
    co_overdue: '{n} दिन देर',
    co_soon: '{n} दिन में',
    co_today: 'आज',
    co_later: '{n} दिन में',
    co_done: 'हो गया',
    co_done_once: 'पूरा',
    co_edit: 'बदलें',
    co_delete_q: '“{n}” हटाएँ?',
    co_every: 'दोहराव',
    ev_0: 'एक बार', ev_1: 'हर महीने', ev_3: 'हर 3 महीने', ev_12: 'हर साल', ev_36: 'हर 3 साल',
    f_kind: 'किस्म', f_due: 'आखिरी तारीख', f_every: 'दोहराव', f_remind: 'कितने दिन पहले याद दिलाएँ',
    kind_licence: 'लाइसेंस', kind_filing: 'फ़ाइलिंग', kind_renewal: 'रिन्यूअल', kind_insurance: 'बीमा', kind_trademark: 'ट्रेडमार्क', kind_other: 'अन्य',
    co_v: 'नाम और आखिरी तारीख लिखें।',
    co_t_dml: 'DML लाइसेंस (MSAMB)', co_t_seed: 'बीज लाइसेंस', co_t_fert: 'खाद लाइसेंस', co_t_pest: 'कीटनाशक लाइसेंस',
    co_t_iec: 'IEC अपडेट (अप्रै–जून)', co_t_tm: 'ट्रेडमार्क — खलिहान', co_t_ins: 'बीमा रिन्यूअल', co_t_gst: 'GST रिटर्न', co_t_roc: 'कंपनी / FPO फ़ाइलिंग',
    co_task: '{name}: {when}',
    co_task_d: 'लाइसेंस और तारीखें',
    pr_task: '{n} प्रोसेसर भुगतान देर से',
  },
};

/** The plan's steps and their conditions (Business Plan v2, "Step-by-step plan"). */
const STEPS = [
  { k: 0, conds: [
    { key: 'partner', type: 'bool' },
    { key: 'formulas', type: 'num', min: 2, auto: 'formulas' },
    { key: 'survey', type: 'num', min: 12 },
    { key: 'path', type: 'bool' },
  ] },
  { k: 1, conds: [
    { key: 'trucks', type: 'num', min: 5 },
    { key: 'margin', type: 'num', min: 40, auto: 'margin', rs: true },
    { key: 'farmer_more', type: 'bool' },
    { key: 'on_time', type: 'num', min: 95, auto: 'onTime', pct: true },
    { key: 'disputes', type: 'num', lt: 10, pct: true },
  ] },
  { k: 2, conds: [
    { key: 'repeat', type: 'num', min: 150 },
    { key: 'licences', type: 'bool' },
    { key: 'brand_sold', type: 'num', min: 80, pct: true },
    { key: 'brand_back', type: 'num', lt: 5, pct: true },
  ] },
  { k: 3, conds: [
    { key: 'shop', type: 'num', min: 25 },
    { key: 'renew', type: 'num', min: 60, pct: true },
    { key: 'visits', type: 'num', min: 90, pct: true },
    { key: 'safety', type: 'num', max: 0 },
    { key: 'peak', type: 'num', min: 8 },
  ] },
  { k: 4, conds: [
    { key: 'china', type: 'bool' },
    { key: 'traders', type: 'num', min: 10 },
    { key: 'sources', type: 'bool' },
  ] },
];

const COMPLIANCE_TEMPLATES = [
  { key: 'dml', kind: 'licence', every: 12 },
  { key: 'seed', kind: 'licence', every: 36 },
  { key: 'fert', kind: 'licence', every: 36 },
  { key: 'pest', kind: 'licence', every: 36 },
  { key: 'iec', kind: 'renewal', every: 12 },
  { key: 'tm', kind: 'trademark', every: 0 },
  { key: 'ins', kind: 'insurance', every: 12 },
  { key: 'gst', kind: 'filing', every: 1 },
  { key: 'roc', kind: 'filing', every: 12 },
];

const KINDS = ['licence', 'filing', 'renewal', 'insurance', 'trademark', 'other'];
const EVERY = [0, 1, 3, 12, 36];

export function createBusiness(c) {
  const { tr, esc, rs, toast, fail, setMain, openPanel, closePanel } = c;
  const db = () => c.db();
  const num = (v) => (v === '' || v == null || !isFinite(Number(v)) ? null : Number(v));

  // ── dates (India) ──
  const today = () => c.today(); // 'YYYY-MM-DD'
  const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
  const addMonths = (iso, months) => {
    const [y, m, d] = iso.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1 + months, 1));
    const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
    t.setUTCDate(Math.min(d, last));
    return t.toISOString().slice(0, 10);
  };
  const showDay = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString(c.lang() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  // ── shared sums ──
  function overdue(payments) {
    const t = today();
    return payments.filter((p) => !p.paid && p.due && p.due < t);
  }
  function dueSoon(items) {
    const t = today();
    return items
      .filter((x) => !x.done && x.due)
      .map((x) => ({ ...x, left: daysBetween(t, x.due) }))
      .filter((x) => x.left <= (num(x.remind) ?? 30))
      .sort((a, b) => a.left - b.left);
  }
  function autoValues(procs, payments, trade) {
    const written = procs.filter((p) => p.written && String(p.formula || '').trim()).length;
    const paidOnes = payments.filter((p) => p.paid && p.due);
    const onTime = paidOnes.length ? Math.round((paidOnes.filter((p) => p.paid <= p.due).length / paidOnes.length) * 100) : null;
    return { formulas: written, margin: trade && trade.perQ != null ? Math.round(trade.perQ) : null, onTime };
  }
  function condValue(cond, values, auto) {
    if (cond.auto && auto[cond.auto] != null) return { v: auto[cond.auto], auto: true };
    return { v: values[cond.key], auto: false };
  }
  function condOk(cond, v) {
    if (cond.type === 'bool') return v === true;
    const n = num(v);
    if (n == null) return false;
    if (cond.min != null && n < cond.min) return false;
    if (cond.lt != null && n >= cond.lt) return false;
    if (cond.max != null && n > cond.max) return false;
    return true;
  }
  function stepScore(step, values, auto) {
    const ok = step.conds.filter((cd) => condOk(cd, condValue(cd, values, auto).v)).length;
    return { ok, all: step.conds.length };
  }

  /** Everything Home needs, in one go (owner only). */
  async function homeData() {
    const [items, payments, plan, procs] = await Promise.all([
      db().compliance().catch(() => []),
      db().procPayments().catch(() => []),
      db().planState().catch(() => ({})),
      db().processors().catch(() => []),
    ]);
    return { items, payments, plan, procs };
  }

  /** Home's "what needs doing" lines: dates coming up, payments overdue. */
  function homeTasks(d) {
    if (!d) return [];
    const out = [];
    const late = overdue(d.payments);
    if (late.length) {
      out.push({ icon: '🏭', tone: 'red', title: tr('pr_task', { n: late.length }),
        sub: rs(late.reduce((s, p) => s + (num(p.amount) || 0), 0)),
        actions: `<button class="btn sec" data-go="processors">${tr('open')}</button>` });
    }
    dueSoon(d.items).slice(0, 3).forEach((x) => {
      out.push({ icon: '📅', tone: x.left < 0 ? 'red' : 'amber',
        title: tr('co_task', { name: esc(x.name), when: whenLeft(x.left) }), sub: `${showDay(x.due)} · ${tr('co_task_d')}`,
        actions: `<button class="btn sec" data-go="compliance">${tr('open')}</button>` });
    });
    return out;
  }

  /** A small card on Home: the current step and its score. */
  function homeCard(d, trade) {
    if (!d) return '';
    const k = Number(d.plan.kadam) || 0;
    const step = STEPS[k] || STEPS[0];
    const sc = stepScore(step, (d.plan.values || {}), autoValues(d.procs, d.payments, trade));
    return `<section class="card click" data-go="plan">
      <div class="ch"><h2>${esc(tr('pl_now', { k, name: tr('st' + k) }))}</h2><span class="pill ${sc.ok === sc.all ? 'on' : 'warn'}">${sc.ok}/${sc.all}</span></div>
      <p class="muted small">${esc(tr('st' + k + '_when'))} · ${esc(tr('pl_pass', { a: sc.ok, b: sc.all }))}</p>
    </section>`;
  }

  /** Counts for the side menu: dates due soon, payments overdue. */
  function badges(d) {
    if (!d) return {};
    return { compliance: dueSoon(d.items).length, processors: overdue(d.payments).length };
  }

  const whenLeft = (left) => (left < 0 ? tr('co_overdue', { n: -left }) : left === 0 ? tr('co_today') : tr('co_soon', { n: left }));

  // ── the plan page ──
  async function plan() {
    const [state, procs, payments, trade, kendra] = await Promise.all([
      db().planState(),
      db().processors().catch(() => []),
      db().procPayments().catch(() => []),
      c.tradeAll(),
      c.sourceMonths(),
    ]);
    const values = { ...(state.values || {}) };
    let kadam = Number(state.kadam) || 0;
    const auto = autoValues(procs, payments, trade);

    const condRow = (cd) => {
      const { v, auto: isAuto } = condValue(cd, values, auto);
      const ok = condOk(cd, v);
      const goal = cd.min != null ? '≥ ' + (cd.rs ? '₹' : '') + cd.min : cd.lt != null ? '< ' + cd.lt : '= ' + cd.max;
      const target = cd.type === 'bool' ? '' : `<span class="muted small">${tr('pl_target')}: ${goal}${cd.pct ? '%' : ''}</span>`;
      let input;
      if (isAuto) {
        input = `<b>${cd.rs ? rs(v) : esc(v)}${cd.pct ? '%' : ''}</b> <span class="pill info">${tr('pl_auto')}</span>`;
      } else if (cd.type === 'bool') {
        input = `<input type="checkbox" data-cond="${cd.key}" ${v === true ? 'checked' : ''} style="width:22px;height:22px">`;
      } else {
        input = `<input type="number" inputmode="decimal" data-cond="${cd.key}" value="${v == null ? '' : esc(v)}" style="width:110px">`;
      }
      return `<div class="row between planrow" style="padding:8px 0;border-top:1px solid var(--line)">
        <div class="grow"><div>${esc(tr('c_' + cd.key))}</div>${target}</div>
        <div class="row">${input}<span class="pill ${ok ? 'on' : 'off'}">${ok ? tr('pl_ok') : tr('pl_no')}</span></div></div>`;
    };

    const stepCard = (step) => {
      const sc = stepScore(step, values, auto);
      const current = step.k === kadam;
      return `<details class="card" ${current ? 'open' : ''}>
        <summary class="row between" style="cursor:pointer">
          <span><b>${tr('pl_step', { k: step.k })} — ${esc(tr('st' + step.k))}</b> <span class="muted small">${esc(tr('st' + step.k + '_when'))}</span></span>
          <span class="pill ${sc.ok === sc.all ? 'on' : current ? 'warn' : 'off'}">${sc.ok}/${sc.all}</span>
        </summary>
        ${step.conds.map(condRow).join('')}
        <p class="small" style="margin-top:10px"><b>${tr('pl_fail')}:</b> ${esc(tr('st' + step.k + '_fail'))}</p>
        ${current && sc.ok === sc.all && step.k < 4 ? `<div class="actions"><span class="pill on">${tr('pl_all_pass')}</span><button class="btn pri" data-next="${step.k + 1}">${tr('pl_next', { k: step.k + 1 })}</button></div>` : ''}
      </details>`;
    };

    // Income by source, this month and last.
    const srcRow = (key, a, b, started) => `<tr><td>${esc(tr('src_' + key))}</td>
      <td>${started ? c.signedRs(a) : `<span class="muted">${tr('pl_later')}</span>`}</td>
      <td>${started ? c.signedRs(b) : `<span class="muted">${tr('pl_later')}</span>`}</td></tr>`;
    const tradeThis = kendra.tradeThis, tradeLast = kendra.tradeLast;
    const totalThis = (tradeThis || 0) + (kendra.kThis || 0);
    const totalLast = (tradeLast || 0) + (kendra.kLast || 0);

    // Money tied up.
    const unpaid = payments.filter((p) => !p.paid);
    const owed = unpaid.reduce((s, p) => s + (num(p.amount) || 0), 0);
    const lateSum = overdue(payments).reduce((s, p) => s + (num(p.amount) || 0), 0);
    const bg = num(values.bg) || 0;

    setMain(`
      <div class="ph"><div class="ph-t"><h1>${tr('pl_h')}</h1></div></div>
      <p class="muted">${tr('pl_sub')}</p>
      <div class="card row between">
        <b>${esc(tr('pl_now', { k: kadam, name: tr('st' + kadam) }))}</b>
        <label class="row small">${tr('pl_pick')}
          <select id="pl-kadam">${STEPS.map((s) => `<option value="${s.k}" ${s.k === kadam ? 'selected' : ''}>${s.k} — ${esc(tr('st' + s.k))}</option>`).join('')}</select>
        </label>
      </div>
      ${STEPS.map(stepCard).join('')}
      <section class="card">
        <h2 style="margin-top:0">${tr('pl_sources_h')}</h2>
        <table><tr><th>${tr('pl_src')}</th><th>${tr('pl_this')}</th><th>${tr('pl_last')}</th></tr>
          ${srcRow('trade', tradeThis, tradeLast, true)}
          ${srcRow('kendra', kendra.kThis, kendra.kLast, true)}
          ${srcRow('brand', 0, 0, false)}
          ${srcRow('suraksha', 0, 0, false)}
          ${srcRow('b2b', 0, 0, false)}
          <tr><td><b>${tr('pl_total')}</b></td><td><b>${c.signedRs(totalThis)}</b></td><td><b>${c.signedRs(totalLast)}</b></td></tr>
        </table>
        <p class="muted small">${tr('pl_note_src')}</p>
      </section>
      <section class="card">
        <h2 style="margin-top:0">${tr('pl_locked_h')}</h2>
        <div class="kv">
          <div>${tr('pl_proc_due')}</div><div><b>${rs(owed)}</b>${lateSum ? ` · <span class="neg">${tr('pl_overdue_part', { rs: rs(lateSum) })}</span>` : ''}</div>
          <div>${tr('pl_bg')}</div><div><input type="number" inputmode="numeric" data-cond="bg" value="${bg || ''}" style="width:140px"></div>
          <div>${tr('pl_stock')}</div><div class="muted">${tr('pl_stock_na')}</div>
          <div><b>${tr('pl_total')}</b></div><div><b>${rs(owed + bg)}</b></div>
        </div>
      </section>`);

    let timer = null;
    const save = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try { await db().savePlanState({ kadam, values }); toast(tr('pl_saved')); } catch (e) { fail(e); }
      }, 500);
    };
    document.querySelectorAll('[data-cond]').forEach((el) => {
      el.onchange = () => {
        values[el.dataset.cond] = el.type === 'checkbox' ? el.checked : num(el.value);
        save();
        if (el.dataset.cond !== 'bg') setTimeout(plan, 650);
      };
    });
    document.getElementById('pl-kadam').onchange = (e) => { kadam = Number(e.target.value); save(); setTimeout(plan, 650); };
    document.querySelectorAll('[data-next]').forEach((b) => {
      b.onclick = () => { kadam = Number(b.dataset.next); save(); setTimeout(plan, 650); };
    });
  }

  // ── processors ──
  const memo = { cmpCrop: null };

  async function processors() {
    const [procs, quotes, payments] = await Promise.all([db().processors(), db().procQuotes(), db().procPayments()]);
    const late = overdue(payments);
    const latestOf = (pid) => {
      const seen = new Set();
      return quotes.filter((q) => q.proc === pid && !seen.has(q.crop) && seen.add(q.crop)).slice(0, 3);
    };
    const owesOf = (pid) => payments.filter((p) => p.proc === pid && !p.paid).reduce((s, p) => s + (num(p.amount) || 0), 0);
    const tick = (on, label) => `<span class="pill ${on ? 'on' : 'off'}">${on ? '✓' : '✗'} ${label}</span>`;
    setMain(`
      <div class="ph"><div class="ph-t"><h1>${tr('pr_h')}</h1></div>
        <div class="ph-acts"><button class="btn sec" id="pr-cmp">${tr('pr_compare')}</button><button class="btn pri" id="pr-add">${tr('pr_add')}</button></div></div>
      <p class="muted">${tr('pr_sub')}</p>
      ${late.length ? `<p class="warnline">⚠️ ${tr('pr_overdue', { n: late.length, rs: rs(late.reduce((s, p) => s + (num(p.amount) || 0), 0)) })}</p>` : ''}
      ${procs.length ? procs.sort((a, b) => String(a.name).localeCompare(String(b.name))).map((p) => `
        <div class="card click" data-proc="${esc(p.id)}">
          <div class="row between"><div class="title">${esc(p.name)}</div><div class="sub">${esc(p.place || '')}</div></div>
          <div class="sub">${esc((p.crops || []).join(', '))}${p.payDays != null && p.payDays !== '' ? ' · ' + tr('pr_pay_days', { n: esc(p.payDays) }) : ''}${owesOf(p.id) ? ' · <b>' + tr('pr_owes', { rs: rs(owesOf(p.id)) }) + '</b>' : ''}</div>
          <div class="row" style="margin-top:6px">
            ${tick(p.written && String(p.formula || '').trim(), p.written && String(p.formula || '').trim() ? tr('pr_written') : tr('pr_no_formula'))}
            ${tick(p.gstActive, tr('pr_gst'))}${tick(p.mcaActive, tr('pr_mca'))}
            ${p.checkedOn ? `<span class="muted small">${tr('pr_checked', { d: showDay(p.checkedOn) })}</span>` : ''}
          </div>
          ${latestOf(p.id).length ? `<div class="small" style="margin-top:6px">${tr('pr_latest')}: ${latestOf(p.id).map((q) => `<b>${esc(q.crop)} ${rs(num(q.rate))}</b> <span class="muted">(${showDay(q.day)})</span>`).join(' · ')}</div>` : ''}
        </div>`).join('') : `<div class="empty">${tr('pr_none')}</div>`}`);
    document.getElementById('pr-add').onclick = () => procPanel(null, quotes, payments);
    document.getElementById('pr-cmp').onclick = () => comparePanel(procs, quotes);
    document.querySelectorAll('[data-proc]').forEach((el) => {
      el.onclick = () => procPanel(procs.find((p) => p.id === el.dataset.proc), quotes, payments);
    });
  }

  function procPanel(p, quotes, payments) {
    const v = p || { crops: [], written: false, gstActive: false, mcaActive: false };
    const t = today();
    const myQuotes = p ? quotes.filter((q) => q.proc === p.id).slice(0, 30) : [];
    const myPays = p ? payments.filter((x) => x.proc === p.id).sort((a, b) => String(a.paid ? 'z' : a.due).localeCompare(String(b.paid ? 'z' : b.due))) : [];
    const field = (id, label, value, type = 'text', extra = '') =>
      `<div><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value ?? '')}" ${extra}></div>`;
    const box = (id, label, on) => `<label class="choice"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}> <span>${label}</span></label>`;
    const payLine = (x) => {
      const left = x.paid ? null : daysBetween(t, x.due || t);
      const status = x.paid ? `<span class="pill on">✓ ${showDay(x.paid)}${x.utr ? ' · ' + esc(x.utr) : ''}</span>`
        : `<span class="pill ${left < 0 ? 'warn' : 'info'}">${left < 0 ? tr('pr_p_late', { n: -left }) : left === 0 ? tr('pr_p_today') : tr('pr_p_left', { n: left })}</span>`;
      return `<div class="row between" style="padding:6px 0;border-top:1px solid var(--line)">
        <div class="grow"><b>${esc(x.ref)}</b> · ${rs(num(x.amount))}<div class="sub">${tr('pr_p_due')}: ${showDay(x.due)}</div></div>
        ${status}${x.paid ? '' : `<button class="plain" data-markpaid="${esc(x.id)}">${tr('pr_p_mark')}</button>`}</div>`;
    };
    const panel = openPanel(`
      <h1>${p ? esc(p.name) : tr('pr_add').replace('+ ', '')}</h1>
      <div class="form">
        ${field('pf-name', tr('f_name'), v.name)}
        ${field('pf-place', tr('f_place'), v.place)}
        ${field('pf-crops', tr('f_crops'), (v.crops || []).join(', '))}
        ${field('pf-contact', tr('f_contact'), v.contact)}
        ${field('pf-phone', tr('f_phone'), v.phone, 'tel')}
        ${field('pf-gstin', tr('f_gstin'), v.gstin)}
        ${field('pf-checked', tr('f_checked'), v.checkedOn, 'date')}
        ${field('pf-paydays', tr('f_pay_days'), v.payDays, 'number', 'inputmode="numeric"')}
        ${field('pf-payway', tr('f_pay_way'), v.payWay, 'text', 'placeholder="RTGS / NEFT"')}
        ${field('pf-moisture', tr('f_moisture'), v.moistureMax, 'number', 'inputmode="decimal"')}
        <div class="wide"><label for="pf-formula">${tr('f_formula')}</label><textarea id="pf-formula" rows="2">${esc(v.formula || '')}</textarea></div>
        <div class="wide"><label for="pf-cuts">${tr('f_cuts')}</label><textarea id="pf-cuts" rows="2">${esc(v.cuts || '')}</textarea></div>
        <div class="wide"><label for="pf-notes">${tr('f_notes')}</label><textarea id="pf-notes" rows="2">${esc(v.notes || '')}</textarea></div>
      </div>
      <div class="choices">${box('pf-written', tr('f_written'), v.written)}${box('pf-gst', tr('f_gst_active'), v.gstActive)}${box('pf-mca', tr('f_mca_active'), v.mcaActive)}</div>
      <div class="actions"><button class="main" id="pf-save">${tr('pr_save')}</button>${p ? `<button class="danger" id="pf-del">${tr('pr_delete')}</button>` : ''}</div>
      ${p ? `
      <h2>${tr('pr_quotes_h')}</h2>
      <div class="form">
        ${field('pq-day', tr('pr_q_day'), t, 'date')}
        <div><label for="pq-crop">${tr('pr_q_crop')}</label><input id="pq-crop" list="pq-crops" value="${esc((v.crops || [])[0] || '')}"><datalist id="pq-crops">${(v.crops || []).map((x) => `<option value="${esc(x)}">`).join('')}</datalist></div>
        ${field('pq-rate', tr('pr_q_rate'), '', 'number', 'inputmode="numeric"')}
        <div><label for="pq-basis">${tr('pr_q_basis')}</label><select id="pq-basis"><option value="gate">${tr('pr_q_gate')}</option><option value="farm">${tr('pr_q_farm')}</option></select></div>
        <div class="wide">${field('pq-note', tr('pr_q_note'), '')}</div>
      </div>
      <div class="actions"><button class="plain" id="pq-add">${tr('pr_q_add')}</button></div>
      ${myQuotes.length ? `<table><tr><th>${tr('pr_q_day')}</th><th>${tr('pr_q_crop')}</th><th>${tr('pr_q_rate')}</th><th>${tr('pr_q_basis')}</th><th></th></tr>
        ${myQuotes.map((q) => `<tr><td>${showDay(q.day)}</td><td>${esc(q.crop)}</td><td><b>${rs(num(q.rate))}</b></td><td class="small">${q.basis === 'farm' ? tr('pr_q_farm') : tr('pr_q_gate')}${q.note ? ' · ' + esc(q.note) : ''}</td><td><button class="plain" data-delq="${esc(q.id)}">✕</button></td></tr>`).join('')}</table>`
        : `<p class="muted small">${tr('pr_q_none')}</p>`}
      <h2>${tr('pr_pay_h')}</h2>
      <div class="form">
        ${field('pp-ref', tr('pr_p_ref'), '')}
        ${field('pp-amount', tr('pr_p_amount'), '', 'number', 'inputmode="numeric"')}
        ${field('pp-due', tr('pr_p_due'), '', 'date')}
      </div>
      <div class="actions"><button class="plain" id="pp-add">${tr('pr_p_add')}</button></div>
      ${myPays.length ? myPays.map(payLine).join('') : `<p class="muted small">${tr('pr_p_none')}</p>`}` : ''}
    `);
    const val = (id) => panel.querySelector('#' + id).value.trim();
    panel.querySelector('#pf-save').onclick = async () => {
      const name = val('pf-name');
      if (!name) return toast(tr('pr_v_name'));
      const data = {
        name, place: val('pf-place'),
        crops: val('pf-crops').split(',').map((x) => x.trim()).filter(Boolean),
        contact: val('pf-contact'), phone: val('pf-phone'), gstin: val('pf-gstin').toUpperCase(),
        checkedOn: val('pf-checked'), payDays: num(val('pf-paydays')), payWay: val('pf-payway'),
        moistureMax: num(val('pf-moisture')), formula: val('pf-formula'), cuts: val('pf-cuts'), notes: val('pf-notes'),
        written: panel.querySelector('#pf-written').checked, gstActive: panel.querySelector('#pf-gst').checked, mcaActive: panel.querySelector('#pf-mca').checked,
      };
      try { await db().saveProcessor(p ? p.id : null, data); toast(tr('pl_saved')); closePanel(); processors(); } catch (e) { fail(e); }
    };
    if (!p) return;
    panel.querySelector('#pf-del').onclick = async () => {
      if (!confirm(tr('pr_delete_q', { n: p.name }))) return;
      try { await db().deleteProcessor(p.id); closePanel(); processors(); } catch (e) { fail(e); }
    };
    const reopen = async () => {
      const [procs, q2, pay2] = await Promise.all([db().processors(), db().procQuotes(), db().procPayments()]);
      procPanel(procs.find((x) => x.id === p.id) || p, q2, pay2);
      processors();
    };
    panel.querySelector('#pq-add').onclick = async () => {
      const day = val('pq-day'), crop = val('pq-crop'), rate = num(val('pq-rate'));
      if (!day || !crop || !rate) return toast(tr('pr_v_rate'));
      try { await db().addProcQuote({ proc: p.id, day, crop, rate, basis: val('pq-basis'), note: val('pq-note') }); await reopen(); } catch (e) { fail(e); }
    };
    panel.querySelectorAll('[data-delq]').forEach((b) => {
      b.onclick = async () => { try { await db().deleteProcQuote(b.dataset.delq); await reopen(); } catch (e) { fail(e); } };
    });
    panel.querySelector('#pp-add').onclick = async () => {
      const ref = val('pp-ref'), amount = num(val('pp-amount')), due = val('pp-due');
      if (!ref || !amount || !due) return toast(tr('pr_v_pay'));
      try { await db().saveProcPayment(null, { proc: p.id, ref, amount, due, paid: '', utr: '' }); await reopen(); } catch (e) { fail(e); }
    };
    panel.querySelectorAll('[data-markpaid]').forEach((b) => {
      b.onclick = async () => {
        const paid = prompt(tr('pr_p_paid') + ' (YYYY-MM-DD)', today());
        if (!paid || !/^\d{4}-\d{2}-\d{2}$/.test(paid.trim())) return;
        const utr = prompt(tr('pr_p_utr'), '') || '';
        try { await db().saveProcPayment(b.dataset.markpaid, { paid: paid.trim(), utr: utr.trim() }); await reopen(); } catch (e) { fail(e); }
      };
    });
  }

  function comparePanel(procs, quotes) {
    const crops = [...new Set(quotes.map((q) => q.crop))].sort();
    const crop = memo.cmpCrop && crops.includes(memo.cmpCrop) ? memo.cmpCrop : crops[0];
    const t = today();
    const rows = crop ? procs.map((p) => {
      const mine = quotes.filter((q) => q.proc === p.id && q.crop === crop);
      if (!mine.length) return null;
      const recent = mine.filter((q) => daysBetween(q.day, t) <= 14);
      const avg = recent.length ? recent.reduce((s, q) => s + (num(q.rate) || 0), 0) / recent.length : null;
      return { p, latest: mine[0], avg, n: mine.length };
    }).filter(Boolean).sort((a, b) => (num(b.latest.rate) || 0) - (num(a.latest.rate) || 0)) : [];
    const panel = openPanel(`
      <h1>${tr('pr_cmp_h')}</h1>
      <label>${tr('pr_cmp_crop')} <select id="cmp-crop">${crops.map((x) => `<option ${x === crop ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      ${rows.length ? `<table><tr><th>${tr('pr_h')}</th><th>${tr('pr_cmp_latest')}</th><th>${tr('pr_cmp_avg')}</th><th>${tr('pr_cmp_n')}</th><th>${tr('f_pay_days')}</th></tr>
        ${rows.map((r) => `<tr><td><b>${esc(r.p.name)}</b><div class="sub">${esc(r.p.formula || '')}</div></td>
          <td><b>${rs(num(r.latest.rate))}</b><div class="sub">${showDay(r.latest.day)}</div></td>
          <td>${r.avg == null ? '—' : rs(r.avg)}</td><td>${r.n}</td><td>${r.p.payDays ?? '—'}</td></tr>`).join('')}</table>`
        : `<p class="muted">${tr('pr_cmp_none')}</p>`}`);
    const sel = panel.querySelector('#cmp-crop');
    if (sel) sel.onchange = () => { memo.cmpCrop = sel.value; comparePanel(procs, quotes); };
  }

  // ── compliance ──
  async function compliance() {
    const items = await db().compliance();
    const t = today();
    const open = items.filter((x) => !x.done).map((x) => ({ ...x, left: x.due ? daysBetween(t, x.due) : 9999 })).sort((a, b) => a.left - b.left);
    const closed = items.filter((x) => x.done);
    const tone = (x) => (x.left < 0 ? 'warn' : x.left <= (num(x.remind) ?? 30) ? 'info' : 'off');
    const line = (x) => `
      <div class="card">
        <div class="row between"><div class="title">${esc(x.name)}</div>
          <span class="pill ${tone(x)}">${x.left < 0 ? tr('co_overdue', { n: -x.left }) : x.left === 0 ? tr('co_today') : tr('co_later', { n: x.left })}</span></div>
        <div class="sub">${tr('kind_' + (x.kind || 'other'))} · ${showDay(x.due)} · ${tr('co_every')}: ${tr('ev_' + (EVERY.includes(Number(x.every)) ? Number(x.every) : 0))}${x.last ? ' · ✓ ' + showDay(x.last) : ''}</div>
        ${x.notes ? `<div class="small" style="margin-top:4px">${esc(x.notes)}</div>` : ''}
        <div class="actions"><button class="btn pri" data-codone="${esc(x.id)}">${tr('co_done')}</button><button class="btn sec" data-coedit="${esc(x.id)}">${tr('co_edit')}</button></div>
      </div>`;
    setMain(`
      <div class="ph"><div class="ph-t"><h1>${tr('co_h')}</h1></div><div class="ph-acts"><button class="btn pri" id="co-add">${tr('co_add')}</button></div></div>
      <p class="muted">${tr('co_sub')}</p>
      <div class="row small" style="margin-bottom:12px"><span class="muted">${tr('co_quick')}</span>
        ${COMPLIANCE_TEMPLATES.filter((tp) => !items.some((x) => x.tpl === tp.key && !x.done)).map((tp) => `<button class="plain" data-tpl="${tp.key}">${esc(tr('co_t_' + tp.key))}</button>`).join('')}</div>
      ${open.length ? open.map(line).join('') : `<div class="empty">${tr('co_none')}</div>`}
      ${closed.length ? `<details class="small"><summary>${tr('co_done_once')} (${closed.length})</summary>${closed.map((x) => `<div class="row between" style="padding:6px 0"><span>${esc(x.name)}</span><span class="muted">✓ ${showDay(x.last)}</span></div>`).join('')}</details>` : ''}`);
    document.getElementById('co-add').onclick = () => coPanel(null);
    document.querySelectorAll('[data-tpl]').forEach((b) => {
      const tp = COMPLIANCE_TEMPLATES.find((x) => x.key === b.dataset.tpl);
      b.onclick = () => coPanel({ name: tr('co_t_' + tp.key), kind: tp.kind, every: tp.every, remind: tp.every === 1 ? 7 : 30, tpl: tp.key });
    });
    document.querySelectorAll('[data-coedit]').forEach((b) => { b.onclick = () => coPanel(items.find((x) => x.id === b.dataset.coedit)); });
    document.querySelectorAll('[data-codone]').forEach((b) => {
      b.onclick = async () => {
        const x = items.find((y) => y.id === b.dataset.codone);
        const every = Number(x.every) || 0;
        const patch = every ? { last: t, due: addMonths(x.due || t, every) } : { last: t, done: true };
        try { await db().saveCompliance(x.id, patch); toast(tr('pl_saved')); compliance(); } catch (e) { fail(e); }
      };
    });
  }

  function coPanel(x) {
    const v = x || { kind: 'licence', every: 12, remind: 30 };
    const isNew = !x || !x.id;
    const panel = openPanel(`
      <h1>${isNew ? tr('co_add').replace('+ ', '') : esc(v.name)}</h1>
      <div class="form">
        <div class="wide"><label for="cf-name">${tr('f_name')}</label><input id="cf-name" value="${esc(v.name || '')}"></div>
        <div><label for="cf-kind">${tr('f_kind')}</label><select id="cf-kind">${KINDS.map((k) => `<option value="${k}" ${k === v.kind ? 'selected' : ''}>${tr('kind_' + k)}</option>`).join('')}</select></div>
        <div><label for="cf-due">${tr('f_due')}</label><input id="cf-due" type="date" value="${esc(v.due || '')}"></div>
        <div><label for="cf-every">${tr('f_every')}</label><select id="cf-every">${EVERY.map((e) => `<option value="${e}" ${Number(v.every) === e ? 'selected' : ''}>${tr('ev_' + e)}</option>`).join('')}</select></div>
        <div><label for="cf-remind">${tr('f_remind')}</label><input id="cf-remind" type="number" inputmode="numeric" value="${esc(v.remind ?? 30)}"></div>
        <div class="wide"><label for="cf-notes">${tr('f_notes')}</label><textarea id="cf-notes" rows="2">${esc(v.notes || '')}</textarea></div>
      </div>
      <div class="actions"><button class="main" id="cf-save">${tr('pr_save')}</button>${isNew ? '' : `<button class="danger" id="cf-del">✕</button>`}</div>`);
    const val = (id) => panel.querySelector('#' + id).value.trim();
    panel.querySelector('#cf-save').onclick = async () => {
      const name = val('cf-name'), due = val('cf-due');
      if (!name || !due) return toast(tr('co_v'));
      const data = { name, kind: val('cf-kind'), due, every: Number(val('cf-every')) || 0, remind: num(val('cf-remind')) ?? 30, notes: val('cf-notes'), done: false };
      if (v.tpl) data.tpl = v.tpl;
      try { await db().saveCompliance(isNew ? null : v.id, data); closePanel(); compliance(); } catch (e) { fail(e); }
    };
    const del = panel.querySelector('#cf-del');
    if (del) del.onclick = async () => {
      if (!confirm(tr('co_delete_q', { n: v.name }))) return;
      try { await db().deleteCompliance(v.id); closePanel(); compliance(); } catch (e) { fail(e); }
    };
  }

  return { plan, processors, compliance, homeData, homeTasks, homeCard, badges };
}
