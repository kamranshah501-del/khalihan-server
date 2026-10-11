// Khalihan Admin — one small page for the team: sell requests and where each
// one stands, offers, feature switches, suggestions, farmers, account
// deletions, the team itself, and a record of every change.
// No build step: plain modules, served by Firebase Hosting. `?demo` shows
// the screens with made-up data and saves nothing.

const DEMO = new URLSearchParams(location.search).has('demo');
const $ = (sel) => document.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rs = (n) => (typeof n === 'number' && isFinite(n) ? '₹' + Math.round(n).toLocaleString('en-IN') : '—');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const when = (d) => (d instanceof Date
  ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  : '—');
const phoneTen = (p) => String(p || '').replace(/\D/g, '').slice(-10);
const phoneShow = (p) => { const t = phoneTen(p); return t.length === 10 ? `+91 ${t.slice(0, 5)} ${t.slice(5)}` : esc(p || '—'); };

// The steps of one purchase. Farmers see the same words in "मेरी बिक्री".
const STATUS = {
  new: { label: 'नई', cls: 's-new' },
  called: { label: 'फ़ोन किया', cls: 's-called' },
  agreed: { label: 'सौदा पक्का', cls: 's-agreed' },
  picked: { label: 'माल उठाया', cls: 's-picked' },
  paid: { label: 'पैसा दिया', cls: 's-paid' },
  cancelled: { label: 'रद्द', cls: 's-cancelled' },
};
const NEXT = {
  new: ['called', 'cancelled'],
  called: ['agreed', 'cancelled'],
  agreed: ['picked', 'cancelled'],
  picked: ['paid', 'cancelled'],
  paid: [],
  cancelled: ['new'],
};
const chip = (s) => `<span class="chip ${(STATUS[s] || STATUS.new).cls}">${(STATUS[s] || STATUS.new).label}</span>`;

// Farmer words → the start of the Agmarknet crop names (as buy_offers.py).
const CROPS = [
  { word: 'makka', label: 'मक्का (Maize)', crops: ['maize'] },
  { word: 'kapas', label: 'कपास (Cotton)', crops: ['cotton', 'kapas'] },
  { word: 'chana', label: 'चना (Chana)', crops: ['bengal gram'] },
  { word: 'tur', label: 'तूर (Tur)', crops: ['arhar'] },
  { word: 'soybean', label: 'सोयाबीन (Soybean)', crops: ['soyabean'] },
  { word: 'jowar', label: 'ज्वार (Jowar)', crops: ['jowar'] },
  { word: 'bajra', label: 'बाजरा (Bajra)', crops: ['bajra'] },
  { word: 'wheat', label: 'गेहूँ (Wheat)', crops: ['wheat'] },
  { word: 'moong', label: 'मूँग (Moong)', crops: ['green gram'] },
  { word: 'urad', label: 'उड़द (Urad)', crops: ['black gram'] },
  { word: 'onion', label: 'प्याज़ (Onion)', crops: ['onion'] },
  { word: 'banana', label: 'केला (Banana)', crops: ['banana'] },
];

// Switches the app reads from config/app → features (see app_config.dart).
// `def` = what the app does while the server has said nothing — it must
// match AppConfig.featureDefaults. Login and selling start OFF (owner,
// 11 Oct 2026): they go on together when Khalihan starts buying in a district.
const FEATURES = [
  { key: 'sell', def: false, label: 'Khalihan को बेचें', d: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट। तभी चालू करें जब ज़िले में प्रोसेसर का भाव पक्का हो। बंद = कोई ऑफ़र नहीं दिखेगा।' },
  { key: 'login', def: false, label: 'मोबाइल OTP लॉग इन', d: '"मेरा खाता" और बेचने से पहले OTP। हर SMS का पैसा लगता है (लगभग ₹6) — चालू करने से पहले README का "लॉग इन चालू करना" पूरा करें (Blaze, Phone sign-in, SHA)।' },
  { key: 'calendar', def: true, label: 'फ़सल कैलेंडर', d: 'Home का बटन, फ़सल पेज की टाइल, "इस हफ़्ते खेत में"।' },
  { key: 'schemes', def: true, label: 'सरकारी योजनाएँ', d: 'Services में योजनाओं का कार्ड।' },
  { key: 'price_map', def: true, label: 'भाव का नक्शा', d: '"कहाँ बेचें?" में सूची | नक्शा।' },
  { key: 'hold_sell', def: true, label: 'अभी बेचें या रुकें?', d: 'रुकने का ख़र्च और ब्रेक-ईवन भाव।' },
  { key: 'day_voice', def: true, label: 'आज का भाव सुनें', d: 'Home का बटन और सुबह के मैसेज का "सुनें" बटन।' },
  { key: 'share_picture', def: true, label: 'भाव की फ़ोटो भेजें', d: 'बंद = Share सीधे WhatsApp मैसेज भेजेगा।' },
];

let db = null;
let me = null;
let page = 'home';
let cache = {};

function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 3200);
}

function fail(e) {
  console.error(e);
  const msg = String((e && (e.code || e.message)) || e);
  toast(msg.includes('permission') ? 'इजाज़त नहीं — Firestore rules या आपकी भूमिका देखें' : 'गड़बड़: ' + msg);
}

function setMain(html) { $('#main').innerHTML = html; }

function closePanel() {
  document.querySelectorAll('.panel, .shade').forEach((n) => n.remove());
}
function openPanel(html) {
  closePanel();
  const shade = document.createElement('div');
  shade.className = 'shade';
  shade.onclick = closePanel;
  const panel = document.createElement('aside');
  panel.className = 'panel';
  panel.innerHTML = `<div class="row between"><div></div><button class="plain" data-close>बंद करें ✕</button></div>${html}`;
  panel.querySelector('[data-close]').onclick = closePanel;
  document.body.append(shade, panel);
  return panel;
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

// ── tabs ───────────────────────────────────────────────────────────────
function tabs() {
  const owner = me && me.role === 'owner';
  const list = [
    ['home', 'डैशबोर्ड'],
    ['requests', 'बिक्री रिक्वेस्ट'],
    ['offers', 'ऑफ़र'],
    ['feedback', 'सुझाव'],
    ['farmers', 'किसान'],
    ['deletions', 'खाता हटाना'],
    ...(owner ? [['features', 'फ़ीचर स्विच'], ['team', 'टीम'], ['audit', 'रिकॉर्ड']] : []),
  ];
  const nav = $('#tabs');
  nav.hidden = false;
  const fresh = (cache.requests || []).filter((r) => r.status === 'new').length;
  nav.innerHTML = list.map(([k, l]) =>
    `<button data-tab="${k}" class="${k === page ? 'on' : ''}">${l}${k === 'requests' && fresh ? `<span class="badge">${fresh}</span>` : ''}</button>`).join('');
  nav.querySelectorAll('button').forEach((b) => { b.onclick = () => go(b.dataset.tab); });
}

async function go(next) {
  page = next;
  closePanel();
  tabs();
  setMain('<p class="muted">लोड हो रहा है…</p>');
  try {
    await (PAGES[next] || PAGES.home)();
  } catch (e) {
    fail(e);
    setMain('<div class="empty">ये पेज लोड नहीं हुआ। इंटरनेट और अपनी भूमिका देखें, फिर दोबारा खोलें।</div>');
  }
}

// ── pages ──────────────────────────────────────────────────────────────
const PAGES = {
  async home() {
    const [requests, feedback, deletions, offers, users] = await Promise.all([
      db.sellRequests(), db.feedback(), db.deletions(), db.offers(), db.usersCount().catch(() => null),
    ]);
    cache.requests = requests;
    tabs();
    const today = new Date().toDateString();
    const count = (s) => requests.filter((r) => r.status === s).length;
    const todayN = requests.filter((r) => r.at && r.at.toDateString() === today).length;
    const live = offers.list.filter((o) => String(o.until || '') >= istToday()).length;
    const openFeedback = feedback.filter((f) => !f.done).length;
    const openDel = deletions.filter((d) => !d.done).length;
    const stat = (n, l, cls, to) => `<div class="stat ${cls || ''} ${to ? 'link' : ''}" ${to ? `data-go="${to}"` : ''}><div class="n">${n}</div><div class="l">${l}</div></div>`;
    setMain(`
      <h1>नमस्ते${me.name ? ' ' + esc(me.name) : ''} 👋</h1>
      ${db.demo ? '<p class="note">डेमो — ये बनावटी डेटा है, कुछ सेव नहीं होता।</p>' : ''}
      <div class="grid">
        ${stat(count('new'), 'नई रिक्वेस्ट (फ़ोन करना बाक़ी)', count('new') ? 'warn' : '', 'requests')}
        ${stat(todayN, 'आज आईं', '', 'requests')}
        ${stat(count('called') + count('agreed') + count('picked'), 'चल रहे सौदे', '', 'requests')}
        ${stat(count('paid'), 'पूरे हुए (पैसा दिया)', 'good', 'requests')}
        ${stat(live, 'चालू ऑफ़र', '', 'offers')}
        ${stat(users == null ? '—' : users, 'खाते वाले किसान', '', 'farmers')}
        ${stat(openFeedback, 'नए सुझाव', openFeedback ? 'warn' : '', 'feedback')}
        ${stat(openDel, 'खाता हटाने की माँग', openDel ? 'warn' : '', 'deletions')}
      </div>
      <p class="muted small" style="margin-top:14px">आख़िरी 300 रिक्वेस्ट से गिना गया। ऐप के इस्तेमाल के आँकड़े Firebase Analytics में देखें।</p>`);
    document.querySelectorAll('[data-go]').forEach((n) => { n.onclick = () => go(n.dataset.go); });
  },

  async requests() {
    const list = await db.sellRequests();
    cache.requests = list;
    tabs();
    const filter = cache.reqFilter || 'open';
    const shown = list.filter((r) =>
      filter === 'all' ? true : filter === 'open' ? !['paid', 'cancelled'].includes(r.status) : r.status === filter);
    const btn = (k, l) => `<button data-f="${k}" class="${filter === k ? 'on' : ''}">${l}</button>`;
    setMain(`
      <h1>बिक्री रिक्वेस्ट</h1>
      <div class="filters">
        ${btn('open', 'खुली')}${Object.keys(STATUS).map((k) => btn(k, STATUS[k].label)).join('')}${btn('all', 'सब')}
      </div>
      ${shown.length ? shown.map(reqCard).join('') : '<div class="empty">इसमें कोई रिक्वेस्ट नहीं।</div>'}`);
    document.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { cache.reqFilter = b.dataset.f; PAGES.requests(); }; });
    document.querySelectorAll('[data-req]').forEach((n) => {
      n.onclick = () => showRequest(list.find((r) => r.id === n.dataset.req));
    });
  },

  async offers() {
    const { version, list } = await db.offers();
    const today = istToday();
    const live = list.filter((o) => String(o.until || '') >= today);
    setMain(`
      <h1>ऑफ़र <span class="muted small">version ${version}</span></h1>
      <p class="muted">ऑफ़र तभी डालें जब प्रोसेसर ने भाव का फ़ॉर्मूला और क्वालिटी की शर्त लिखकर पक्की कर दी हो। बदलाव अगली बार ऐप खुलते ही दिखता है।</p>
      ${live.length ? live.map(offerCard).join('') : '<div class="empty">कोई चालू ऑफ़र नहीं — ऐप में "Khalihan को बेचें" छिपा है।</div>'}
      <h2>नया ऑफ़र / भाव बदलें</h2>
      <div class="card">
        <div class="form">
          <div><label>फ़सल</label><select id="o-crop">${CROPS.map((c) => `<option value="${c.word}">${c.label}</option>`).join('')}</select></div>
          <div><label>भाव (₹/क्विंटल, किसान को)</label><input id="o-price" type="number" min="100" max="50000" inputmode="numeric"></div>
          <div><label>ज़िले (कॉमा से)</label><input id="o-districts" value="jalgaon"></div>
          <div><label>सेंटर का नाम <span class="muted small">(ख़ाली = खेत से उठाएँगे)</span></label><input id="o-centre"></div>
          <div><label>पैसा कितने दिन में (0 = उसी दिन)</label><input id="o-pay" type="number" min="0" max="60" value="0"></div>
          <div><label>ज़्यादा से ज़्यादा नमी %</label><input id="o-moist" type="number" min="1" max="40"></div>
          <div><label>कम से कम माल (क्विंटल)</label><input id="o-min" type="number" min="1" max="10000"></div>
          <div><label>कितने दिन चलेगा</label><input id="o-days" type="number" min="1" max="60" value="7"></div>
          <div><label>WhatsApp नंबर (किसान की रिक्वेस्ट यहाँ आएगी)</label><input id="o-wa" inputmode="numeric" value="${esc(phoneTen((live[0] || list[0] || {}).whatsapp || ''))}"></div>
          <div class="wide"><label>किसानों के लिए छोटा नोट (हिंदी/मराठी)</label><input id="o-note" maxlength="200"></div>
        </div>
        <div class="actions"><button class="main" id="o-save">ऑफ़र सेव करें</button></div>
      </div>`);
    document.querySelectorAll('[data-end]').forEach((b) => {
      b.onclick = async () => {
        const o = live.find((x) => x.id === b.dataset.end);
        if (!o || !confirm(`"${o.id}" बंद करें?`)) return;
        try {
          await db.saveOffers((all) => all.filter((x) => x.id !== o.id && String(x.until || '') >= istToday()));
          toast('ऑफ़र बंद हो गया');
          PAGES.offers();
        } catch (e) { fail(e); }
      };
    });
    $('#o-save').onclick = saveOffer;
  },

  async features() {
    const { features, launch_states } = await db.appConfig();
    setMain(`
      <h1>फ़ीचर स्विच</h1>
      <p class="muted">यहाँ बदला हुआ स्विच ऐप में अगली बार खुलने पर लागू होता है — ऐप अपडेट की ज़रूरत नहीं। ये स्विच v1.0.3 से पढ़े जाते हैं; पुराने ऐप (v1.0.2 और पहले) इन्हें नहीं पढ़ते।</p>
      ${FEATURES.map((f) => {
        const on = typeof features[f.key] === 'boolean' ? features[f.key] : f.def;
        return `<div class="card switch"><input type="checkbox" data-feature="${f.key}" ${on ? 'checked' : ''} aria-label="${esc(f.label)}">
          <div><div class="title">${esc(f.label)}</div><div class="sub">${esc(f.d)}</div></div></div>`;
      }).join('')}
      <h2>खुले राज्य</h2>
      <p>${launch_states.length ? launch_states.map(esc).join(', ') : 'Maharashtra'}</p>`);
    document.querySelectorAll('[data-feature]').forEach((box) => {
      box.onchange = async () => {
        const key = box.dataset.feature;
        try {
          await db.setFeature(key, box.checked);
          toast(`${FEATURES.find((f) => f.key === key).label}: ${box.checked ? 'चालू' : 'बंद'}`);
        } catch (e) { box.checked = !box.checked; fail(e); }
      };
    });
  },

  async feedback() {
    const list = await db.feedback();
    const show = cache.fbAll ? list : list.filter((f) => !f.done);
    setMain(`
      <div class="row between"><h1>सुझाव</h1>
        <button class="plain" id="fb-toggle">${cache.fbAll ? 'सिर्फ़ नए' : 'सब दिखाएँ'}</button></div>
      ${show.length ? show.map((f) => `
        <div class="card">
          <div class="row between"><div class="sub">${when(f.at)} · ${esc(f.district || f.state || '')} · ${esc(f.lang || '')} · v${esc(f.app || '')}</div>
            <button class="plain" data-done="${f.id}" data-v="${f.done ? '0' : '1'}">${f.done ? 'वापस खोलें' : 'हो गया ✓'}</button></div>
          <div style="margin-top:6px;white-space:pre-wrap">${esc(f.text)}</div>
        </div>`).join('') : '<div class="empty">कोई नया सुझाव नहीं।</div>'}`);
    $('#fb-toggle').onclick = () => { cache.fbAll = !cache.fbAll; PAGES.feedback(); };
    document.querySelectorAll('[data-done]').forEach((b) => {
      b.onclick = async () => {
        try { await db.feedbackDone(b.dataset.done, b.dataset.v === '1'); PAGES.feedback(); } catch (e) { fail(e); }
      };
    });
  },

  async farmers() {
    const list = await db.users();
    setMain(`
      <h1>किसान <span class="muted small">(खाते वाले, आख़िरी 200)</span></h1>
      <div class="row" style="margin-bottom:12px">
        <input id="u-phone" class="grow" inputmode="numeric" placeholder="मोबाइल नंबर से ढूँढें (10 अंक)">
        <button class="plain" id="u-find">ढूँढें</button>
      </div>
      <div id="u-list">${userRows(list)}</div>`);
    const bind = (rowsList) => document.querySelectorAll('[data-user]').forEach((n) => {
      n.onclick = () => showUser(rowsList.find((u) => u.id === n.dataset.user));
    });
    bind(list);
    $('#u-find').onclick = async () => {
      const ten = phoneTen($('#u-phone').value);
      if (ten.length !== 10) return toast('10 अंक का नंबर डालें');
      try {
        const found = await db.userByPhone('+91' + ten);
        $('#u-list').innerHTML = found.length ? userRows(found) : '<div class="empty">इस नंबर का कोई खाता नहीं।</div>';
        bind(found);
      } catch (e) { fail(e); }
    };
  },

  async deletions() {
    const list = await db.deletions();
    const owner = me.role === 'owner';
    setMain(`
      <h1>खाता हटाने की माँग</h1>
      <p class="muted">किसान ने ऐप से खाता हटाया है। ऐप उसका खाता-डेटा पहले ही हटा चुका है; यहाँ उसकी बिक्री रिक्वेस्ट और हमारे WhatsApp की बातचीत भी 30 दिन के अंदर हटानी है। ${owner ? '' : 'रिक्वेस्ट हटाना सिर्फ़ मालिक कर सकते हैं।'}</p>
      ${list.length ? list.map((d) => `
        <div class="card row between">
          <div><div class="title">${phoneShow(d.phone)}</div><div class="sub">${when(d.at)}${d.done ? ' · हो गया ✓' : ''}</div></div>
          ${!d.done && owner ? `<button class="danger" data-wipe="${d.id}">रिक्वेस्ट और डेटा हटाएँ</button>` : ''}
        </div>`).join('') : '<div class="empty">कोई माँग नहीं।</div>'}`);
    document.querySelectorAll('[data-wipe]').forEach((b) => {
      b.onclick = async () => {
        if (!confirm('इस किसान की सारी बिक्री रिक्वेस्ट और खाता-डेटा हमेशा के लिए हटाएँ? (WhatsApp की बातचीत फ़ोन में ख़ुद हटाएँ)')) return;
        try { const n = await db.wipeFarmer(b.dataset.wipe); toast(`${n} रिक्वेस्ट हटाई गईं`); PAGES.deletions(); } catch (e) { fail(e); }
      };
    });
  },

  async team() {
    const list = await db.staff();
    setMain(`
      <h1>टीम</h1>
      <p class="muted">यहाँ जोड़ा गया Google ईमेल Khalihan Admin खोल सकता है। "staff" सब देख और रिक्वेस्ट/ऑफ़र बदल सकता है; "owner" स्विच, टीम और रिकॉर्ड भी।</p>
      ${list.map((s) => `
        <div class="card row between">
          <div><div class="title">${esc(s.id)}</div><div class="sub">${esc(s.role)}${s.name ? ' · ' + esc(s.name) : ''}</div></div>
          ${s.id !== me.email ? `<button class="danger" data-rm="${esc(s.id)}">हटाएँ</button>` : '<span class="muted small">आप</span>'}
        </div>`).join('')}
      <h2>नया सदस्य</h2>
      <div class="card"><div class="form">
        <div><label>Google ईमेल</label><input id="s-email" type="email"></div>
        <div><label>नाम</label><input id="s-name"></div>
        <div><label>भूमिका</label><select id="s-role"><option value="staff">staff</option><option value="owner">owner</option></select></div>
      </div><div class="actions"><button class="main" id="s-add">जोड़ें</button></div></div>`);
    document.querySelectorAll('[data-rm]').forEach((b) => {
      b.onclick = async () => {
        if (!confirm(`${b.dataset.rm} को टीम से हटाएँ?`)) return;
        try { await db.removeStaff(b.dataset.rm); PAGES.team(); } catch (e) { fail(e); }
      };
    });
    $('#s-add').onclick = async () => {
      const email = $('#s-email').value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('सही ईमेल डालें');
      try { await db.addStaff(email, $('#s-role').value, $('#s-name').value.trim()); toast('जोड़ दिया'); PAGES.team(); } catch (e) { fail(e); }
    };
  },

  async audit() {
    const list = await db.audit();
    setMain(`
      <h1>रिकॉर्ड <span class="muted small">(हर बदलाव, आख़िरी 300)</span></h1>
      ${list.length ? `<table><tr><th>कब</th><th>किसने</th><th>क्या</th><th>ब्योरा</th></tr>
        ${list.map((a) => `<tr><td>${when(a.at)}</td><td>${esc(a.by)}</td><td>${esc(a.action)}</td><td class="small">${esc(JSON.stringify(a.details || {}))}</td></tr>`).join('')}
      </table>` : '<div class="empty">अभी कुछ नहीं।</div>'}`);
  },
};

// ── pieces ─────────────────────────────────────────────────────────────
function istToday() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function reqCard(r) {
  return `<div class="card click" data-req="${esc(r.id)}">
    <div class="row between">
      <div class="grow">
        <div class="title">${esc(r.crop)} · ${esc(r.qty)} क्विंटल · ${rs(r.price)}</div>
        <div class="sub">${esc(r.village)}${r.district ? ', ' + esc(r.district) : ''} · ${r.name ? esc(r.name) + ' · ' : ''}${phoneShow(r.phone)}</div>
        <div class="sub">${when(r.at)}${r.uid ? ' · OTP से पक्का नंबर ✓' : ''}${r.assigned ? ' · ' + esc(r.assigned) : ''}</div>
      </div>
      ${chip(r.status)}
    </div>
  </div>`;
}

function showRequest(r) {
  if (!r) return;
  const ten = phoneTen(r.phone);
  const nexts = NEXT[r.status] || [];
  const history = (r.history || []).slice().sort((a, b) => toMs(a.at) - toMs(b.at));
  const panel = openPanel(`
    <h1>${esc(r.crop)} — ${esc(r.qty)} क्विंटल</h1>
    <div>${chip(r.status)}</div>
    <div class="kv">
      <div>किसान</div><div>${esc(r.name || '—')}</div>
      <div>मोबाइल</div><div>${phoneShow(r.phone)} ${r.uid ? '✓ OTP' : ''}</div>
      <div>गाँव</div><div>${esc(r.village)}${r.district ? ', ' + esc(r.district) : ''}</div>
      <div>ऑफ़र</div><div>${esc(r.offer)} · ${rs(r.price)}/क्विंटल</div>
      <div>कब</div><div>${when(r.at)}</div>
      <div>भाषा · ऐप</div><div>${esc(r.lang)} · v${esc(r.app)}</div>
      ${r.final_qty ? `<div>तौल</div><div>${esc(r.final_qty)} क्विंटल</div>` : ''}
      ${r.final_price ? `<div>पक्का भाव</div><div>${rs(r.final_price)}</div>` : ''}
    </div>
    <div class="actions">
      ${ten.length === 10 ? `<a class="btnlink" href="tel:+91${ten}">📞 फ़ोन करें</a>
      <a class="btnlink" href="https://wa.me/91${ten}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ''}
    </div>
    <h2>आगे क्या हुआ</h2>
    ${nexts.length ? `
      <label>नोट (किसने, क्या बात हुई)</label><textarea id="r-note" maxlength="300"></textarea>
      <div class="form">
        <div><label>पक्का भाव ₹ (सौदे पर)</label><input id="r-price" type="number" value="${esc(r.final_price || '')}"></div>
        <div><label>तौल क्विंटल (माल उठाने पर)</label><input id="r-qty" type="number" value="${esc(r.final_qty || '')}"></div>
      </div>
      <div class="actions">${nexts.map((s) => `<button class="${s === 'cancelled' ? 'danger' : 'main'}" data-move="${s}">${STATUS[s].label}</button>`).join('')}</div>`
      : '<p class="muted">ये सौदा पूरा हो चुका है।</p>'}
    <h2>इतिहास</h2>
    <div class="timeline">${history.length ? history.map((h) =>
      `<div>${chip(h.status)} <span class="sub">${when(toDate(h.at))} · ${esc(h.by)}</span>${h.note ? `<div>${esc(h.note)}</div>` : ''}</div>`).join('')
      : '<div class="muted">अभी कुछ नहीं।</div>'}</div>`);
  panel.querySelectorAll('[data-move]').forEach((b) => {
    b.onclick = async () => {
      const status = b.dataset.move;
      if (status === 'cancelled' && !confirm('ये रिक्वेस्ट रद्द करें?')) return;
      b.disabled = true;
      try {
        await db.moveRequest(r.id, status, panel.querySelector('#r-note').value.trim(), {
          final_price: panel.querySelector('#r-price').value,
          final_qty: panel.querySelector('#r-qty').value,
        });
        toast(`${STATUS[status].label} ✓`);
        closePanel();
        PAGES.requests();
      } catch (e) { b.disabled = false; fail(e); }
    };
  });
}

function toDate(v) {
  if (v instanceof Date) return v;
  if (v && typeof v.toDate === 'function') return v.toDate();
  return null;
}
function toMs(v) { const d = toDate(v); return d ? d.getTime() : 0; }

function offerCard(o) {
  const crop = CROPS.find((c) => JSON.stringify(c.crops) === JSON.stringify(o.crops));
  const where = o.pickup === 'centre' ? `सेंटर: ${esc(o.centre)}` : 'खेत से उठाएँगे';
  return `<div class="card">
    <div class="row between">
      <div class="grow">
        <div class="title">${crop ? crop.label : esc((o.crops || []).join(', '))} · ${rs(o.price)}/क्विंटल</div>
        <div class="sub">${esc((o.districts || []).join(', ') || 'सब ज़िले')} · ${where} · पैसा ${Number(o.payment_days || 0) ? esc(o.payment_days) + ' दिन में' : 'उसी दिन'}
          ${o.moisture_max ? ' · नमी ≤' + esc(o.moisture_max) + '%' : ''}${o.min_qty ? ' · कम से कम ' + esc(o.min_qty) + ' क्विंटल' : ''}</div>
        <div class="sub">${esc(o.until)} तक · ${o.whatsapp ? 'WhatsApp ' + phoneShow(o.whatsapp) : '⚠️ WhatsApp नंबर नहीं'} · ${esc(o.id)}</div>
      </div>
      <button class="danger" data-end="${esc(o.id)}">बंद करें</button>
    </div>
  </div>`;
}

async function saveOffer() {
  const word = $('#o-crop').value;
  const crop = CROPS.find((c) => c.word === word);
  const price = Number($('#o-price').value);
  const days = Number($('#o-days').value || 7);
  const pay = Number($('#o-pay').value || 0);
  const moist = $('#o-moist').value ? Number($('#o-moist').value) : null;
  const minQty = $('#o-min').value ? Number($('#o-min').value) : null;
  const districts = $('#o-districts').value.split(',').map((d) => d.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
  let wa = $('#o-wa').value.replace(/\D/g, '');
  if (wa.length === 10) wa = '91' + wa;
  if (!crop) return toast('फ़सल चुनें');
  if (!(price >= 100 && price <= 50000)) return toast('भाव ₹100 से ₹50,000 के बीच');
  if (!(days >= 1 && days <= 60)) return toast('दिन 1 से 60');
  if (!(pay >= 0 && pay <= 60)) return toast('पैसे के दिन 0 से 60');
  if (moist != null && !(moist >= 1 && moist <= 40)) return toast('नमी 1 से 40%');
  if (minQty != null && !(minQty >= 1 && minQty <= 10000)) return toast('माल 1 से 10,000 क्विंटल');
  if (wa && !/^91[6-9][0-9]{9}$/.test(wa)) return toast('WhatsApp नंबर सही नहीं');
  if (!wa && !confirm('WhatsApp नंबर नहीं है — रिक्वेस्ट सिर्फ़ यहाँ (Admin) आएँगी। ठीक है?')) return;
  const today = istToday();
  const until = new Date(today + 'T00:00:00Z');
  until.setUTCDate(until.getUTCDate() + days - 1);
  const centre = $('#o-centre').value.trim();
  const offer = {
    id: `${word}-${districts.join('-') || 'all'}-${today.replace(/-/g, '')}`,
    crops: crop.crops,
    districts,
    state: 'Maharashtra',
    price,
    pickup: centre ? 'centre' : 'doorstep',
    centre,
    payment_days: pay,
    until: until.toISOString().slice(0, 10),
    whatsapp: wa,
  };
  if (moist != null) offer.moisture_max = moist;
  if (minQty != null) offer.min_qty = minQty;
  const note = $('#o-note').value.trim().slice(0, 200);
  if (note) offer.note = { hi: note };
  const same = (o) => JSON.stringify(o.crops) === JSON.stringify(offer.crops)
    && JSON.stringify([...(o.districts || [])].sort()) === JSON.stringify([...districts].sort());
  if (!confirm(`${crop.label}: ${rs(price)}/क्विंटल, ${offer.until} तक — सेव करें?`)) return;
  try {
    await db.saveOffers((all) => [...all.filter((o) => !same(o) && String(o.until || '') >= today), offer]);
    toast('ऑफ़र सेव हो गया');
    PAGES.offers();
  } catch (e) { fail(e); }
}

function userRows(list) {
  if (!list.length) return '<div class="empty">अभी कोई खाता नहीं।</div>';
  return list.map((u) => `<div class="card click" data-user="${esc(u.id)}">
    <div class="row between"><div class="grow">
      <div class="title">${esc(u.name || '—')} · ${phoneShow(u.phone)}</div>
      <div class="sub">${esc(u.district || '')}${u.state ? ', ' + esc(u.state) : ''} · ${esc((u.crops || []).slice(0, 5).join(', '))}</div>
    </div><div class="sub">${when(u.seen)}</div></div>
  </div>`).join('');
}

async function showUser(u) {
  if (!u) return;
  const panel = openPanel(`
    <h1>${esc(u.name || 'किसान')}</h1>
    <div class="kv">
      <div>मोबाइल</div><div>${phoneShow(u.phone)}</div>
      <div>जगह</div><div>${esc(u.district || '—')}, ${esc(u.state || '')}</div>
      <div>भाषा · ऐप</div><div>${esc(u.lang)} · v${esc(u.app)}</div>
      <div>फ़सलें</div><div>${esc((u.crops || []).join(', ') || '—')}</div>
      <div>खाता बना</div><div>${when(u.created)}</div>
      <div>आख़िरी बार</div><div>${when(u.seen)}</div>
    </div>
    <h2>बिक्री रिक्वेस्ट</h2><div id="u-req" class="muted">लोड हो रहा है…</div>`);
  try {
    const reqs = await db.requestsOf(u.id);
    panel.querySelector('#u-req').innerHTML = reqs.length ? reqs.map(reqCard).join('') : 'कोई नहीं।';
  } catch (e) { fail(e); }
}

// ── start ──────────────────────────────────────────────────────────────
function loginScreen(message) {
  $('#tabs').hidden = true;
  $('#logout').hidden = true;
  $('#who').textContent = '';
  setMain(`<section class="center"><div>
    <h1>Khalihan Admin</h1>
    <p class="muted">${message || 'सिर्फ़ Khalihan टीम के लिए। अपने Google खाते से लॉग इन करें।'}</p>
    <button class="main" id="login">Google से लॉग इन करें</button>
  </div></section>`);
  $('#login').onclick = () => db.login().catch(fail);
}

async function start() {
  try {
    const mod = DEMO ? await import('./demo-db.js') : await import('./firebase-db.js');
    db = await mod.connect();
  } catch (e) {
    console.error(e);
    setMain(`<section class="center"><div><h1>शुरू नहीं हुआ</h1><p class="muted">${esc(e.message || e)}</p></div></section>`);
    return;
  }
  $('#logout').onclick = () => db.logout();
  db.onUser((user) => {
    if (!user) return loginScreen();
    if (!user.role) {
      loginScreen(`${esc(user.email)} टीम में नहीं है।${user.error ? ' (' + esc(user.error) + ')' : ''} मालिक से "टीम" में जुड़वाएँ, फिर दोबारा आएँ।`);
      $('#logout').hidden = false;
      return;
    }
    me = user;
    $('#who').textContent = `${user.email} · ${user.role}${db.demo ? ' · डेमो' : ''}`;
    $('#logout').hidden = false;
    go('home');
  });
}

start();
