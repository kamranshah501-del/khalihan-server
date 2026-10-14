# Khalihan Admin — setup (11 Oct 2026)

Team ka web panel: bechne ki requests aur unka status, offers, feature switch,
sujhav, kisan, khata hatane ki maang, team aur har badlav ka record.
Ye usi Firebase project pe chalta hai jis pe app hai. Login: Google account se,
sirf wahi log jo `staff` me hain.

Pata: **https://khalihan-admin.web.app** — computer pe app ki tarah install ho
jata hai (neeche "Computer pe app").

`?demo` lagake kholo (`https://khalihan-admin.web.app/?demo`) to banawati data
ke saath saari screens dekh sakte ho — kuch save nahi hota.

**Bhasha:** panel **English** me khulta hai. Hindi chahiye to **⚙️ Settings →
Language → हिन्दी** — har browser apni pasand yaad rakhta hai (login page pe
bhi "हिन्दी / English" button hai). Settings me samay (India time / is
computer ka time), aapka khata, panel version aur Firebase ke kaam ke link bhi
hain.

**Abhi ke liye Blaze plan ki zaroorat nahi** — panel, Google login aur Hosting
free (Spark) plan pe chalte hain. Blaze sirf tab, jab app me mobile OTP login
chalu karna ho (neeche "Baad me").

---

## A. Ek baar ka setup — Firebase console (browser me)

1. **Authentication → Get started → Sign-in method → Google → Enable**
   (support email: apna). Ye sirf admin panel ke liye hai.
2. **Web app** — ⚙️ Project settings → *Your apps* → *Add app* → Web (`</>`) →
   naam "Khalihan Admin" → ✅ *Also set up Firebase Hosting* → Register →
   baaki screens pe sirf *Next / Continue*. (Config copy karne ki zaroorat
   nahi — Hosting khud deta hai.)
3. **Purane Firestore rules ka backup** — Firestore Database → Rules → sara
   text copy karke Notes me save karo. Naye rules (`firestore.rules`) unki
   jagah lenge — app ke saare purane kaam unme shaamil hain.
4. **App Check** — App Check → APIs → Cloud Firestore: agar **Enforced** likha
   hai, to App Check → Apps → "Khalihan Admin" → **reCAPTCHA v3** register
   karo, site key mujhe bhejo (ya `admin/public/config.js` me daalo).
   *Unenforced / Monitoring* hai to kuch nahi karna.

## B. Deploy — Mac pe (Terminal)

```bash
curl -sL https://firebase.tools | bash        # sirf pehli baar (Firebase CLI)
cd ~/khalihan-server 2>/dev/null || git clone https://github.com/kamranshah501-del/khalihan-server ~/khalihan-server
cd ~/khalihan-server && git pull
bash admin/deploy.sh                          # panel + rules
```
Sirf panel badla ho to `bash admin/deploy.sh hosting` kaafi hai; **jab
`firestore.rules` bhi badle** (jaise 11 Oct ko paisa wale `deal_money` /
`offer_money` ke liye) to poora `bash admin/deploy.sh` chalao.

Pehli baar ye Google login aur project chunne ko kahega (Khalihan wala project
chuno, alias kuch bhi, jaise `khalihan`).

**Panel ka pata: `https://khalihan-admin.web.app`** (12 Oct 2026 se). Script
pehli baar ye site khud banata hai (naam kisi aur ka nikla to
`khalihan-admin-panel`), aur project ka purana pata
(`https://<project>.web.app`) sirf naye pe bhej deta hai — `?demo` ke saath.
Naya site banne ke baad script rukta hai: **Authentication → Settings →
Authorized domains → Add domain → `khalihan-admin.web.app`** — ye kiye bina
naye pate pe Google login nahi chalega (`auth/unauthorized-domain`).
Agar naye pate pe "Firebase config not found" aaye: Hosting → `khalihan-admin`
site → ⋮ → *Link to a Firebase web app* → "Khalihan Admin", phir dobara deploy.

### Computer pe app (desktop icon)

Har staff ke computer pe ek baar: Chrome ya Edge me panel kholo → address bar
ke right me **Install** icon (screen pe teer) → *Install*. Ya panel me
**⚙️ Settings → "Khalihan Admin as an app" → 💻 Install**. Iske baad desktop /
Start menu / Dock pe navy-peela "ADMIN" wala Khalihan icon — click karte hi
panel apni alag window me khulta hai. Taskbar/Dock pe right-click → *Pin*.
Mac Safari: *File → Add to Dock…*. Firefox me install nahi hota — Chrome/Edge
use karo. Hatana ho to app window ke ⋮ menu → *Uninstall*.

## C. Pehla owner (ek baar)

Firestore Database → Data → *Start collection* → Collection ID `staff` →
Document ID = **aapka Gmail, chhote akshar me** (jaise `kamranshah501@gmail.com`)
→ fields: `role` = `owner` (string), `name` = `Kamran` (string) → Save.
Phir panel kholo → "Google से लॉग इन करें". Baaki log panel ke **टीम** tab se
jodo (`staff` ya `owner`).

---

## D. Baad me — jab kisi zile me processor pakka ho aur kharidi shuru ho

App (v1.0.3 se) me **mobile OTP login** aur **"Khalihan को बेचें"** dono
pehle se **band** hain. Chalu karne se pehle ye karo, phir panel ke
**स्विच** page pe dono ON (aur jis zile me kharidi hai wo zila ON):

1. **Blaze plan** — console → "Upgrade" → Blaze. Phir Google Cloud → Billing →
   **Budgets & alerts** → budget (jaise ₹2,000/mahina), 50% / 90% / 100% pe email.
   India me ek OTP SMS lagbhag $0.07 (≈₹6); din ke pehle 10 free.
2. **Authentication → Sign-in method → Phone → Enable.**
3. **Authentication → Settings → SMS region policy** → *Allow* → sirf **India**
   (bahar ke numbers pe SMS bhej ke koi kharcha na badha sake).
4. **Test number** (paisa nahi lagta, Google review ke liye bhi): Sign-in method
   → Phone → *Phone numbers for testing* → `+91 99999 99999`, code `123456`.
5. **Android fingerprints** — Project settings → Your apps → `in.khalihan.app` →
   *Add fingerprint*: **SHA-1 aur SHA-256** dono —
   - upload key ke (Mac pe: `keytool -list -v -keystore ~/khalihan-upload.jks`)
   - aur Play ke **App signing key** ke (Play Console → Test and release →
     App integrity → App signing).
   Phir **naya `google-services.json` download** karke Mac pe
   `android/app/google-services.json` ki jagah rakh do aur app dobara build karo.
6. **Privacy policy + Play Data safety** — account (mobile number, naam, gaon,
   fasalein) ki baat jodni hai; main likh dunga.
7. **Play Console → App access** — "All or some functionality is restricted" →
   test number + code (step 4) do, taaki Google review login kar sake.
8. Panel → **स्विच** → "Khalihan को बेचें" ON, "मोबाइल OTP लॉग इन" ON →
   **🤝 Khalihan को बेचें** ke andar us zile ka button ON → **ऑफ़र** tab se pehla offer.

---

## Panel me kya hai

(Naam English me; Hindi me wahi tab डैशबोर्ड, बिक्री रिक्वेस्ट, … dikhte hain.)

| Tab | Kaam |
|---|---|
| Dashboard · डैशबोर्ड (naya look, 14 Oct 2026) | Baayein menu (har tab ki ginti), upar **search** (kisan ka number / naam / gaon / Kendra order code — `/` dabao), Live, हिं/EN, aapka khata. **4 number cards** chhoti line-chart ke saath: phone ka intezaar (sabse purana kab se), 7 din ki requests (pichhle hafte se ▲/▼), aaj ke Kendra order (kitne ₹ ka maal), khate wale kisan. **ध्यान दें** list — har kaam ke saath button (📞 Call, Open, स्टॉक बदलें, पढ़ें): purana kisan, naye Kendra order, kam stock, shikayat, sujhav, khata hatana, khatam hote offer. **अभी क्या हुआ** — kisne kya kiya, kitne minute pehle. Saudon ke kadam, 14 din ka chart, **owner ko: is mahine ki kamai**. |
| Sell requests · बिक्री रिक्वेस्ट | Har request: kisan, OTP wala number ✓, gaon, fasal, maal, bhav. 📞 phone / 💬 WhatsApp. Status: **नई → फ़ोन किया → सौदा पक्का → माल उठाया → पैसा दिया** (ya रद्द), note, pakka bhav, taul. Kisne kya kiya — itihaas. Kisan app ke "मेरी बिक्री" me wahi status dekhta hai. Nayi request pe "kab se intezaar" ka chip (30 min ke baad peela, 2 ghante ke baad laal). **Owner:** har saude me "🔒 Paisa" — processor ka bhav, bhada, hamali, baaki kharch → margin apne aap. |
| Offers · ऑफ़र | **Owner:** naya offer banate waqt "🔒 Margin ka hisaab" — processor ka bhav aur prati quintal kharch daalo, prati quintal aur 100 quintal ki gaadi pe margin turant dikhta hai (2% se kam ho to chetavni). Chalu offers, बंद करें, naya offer — GitHub wale "Khalihan buy offers" jaisa hi (dono chalte hain) |
| Kendra (12 Oct 2026) | **Khalihan Kendra** ki dukan — 5 hisse: **Orders** (kisan ne app se rakhwaya: नया → तैयार → उठा लिया, paisa kaise mila (nakad/UPI), bill no.; 📞/WhatsApp; nayi order pe aawaz; urea / DAP / potash ke **है / कम / नहीं** switch — app me turant; kam stock; **owner:** is mahine ki bikri, margin, Khalihan brand ka hissa) · **Products** (naam 3 bhasha, shreni, kaunsi fasal, brand ya "Khalihan brand", sarkari daam, har pack ka MRP / hamara daam / stock, label ki jaankari, licence; **owner:** "🔒 hum kitne me kharidte hain" → margin. **Keetnashak daal hi nahi sakte**) · **Home card** (bada ON/OFF, slides: ऑफ़र / आज का स्टॉक / नया माल / सूचना, tareekh se tareekh, ↑↓ kram, kitne second me badle, jhalak) · **Kendra** (naam, pata, phone, licence, khulne/band hone ka ghanta, hafte ki chhutti, chhuttiyan, kaunse zile, km, kitne din rakhein) · **Complaints**. Poori dukan **Switches → 🏪 Khalihan Kendra** se chalu hoti hai (shuru me OFF); kise dikhe (zile, km) aur pata/naksha bhi wahin. Kendra tab me roz ka kaam: orders, maal, slides, dukan ka naam/phone/ghante, shikayat. |
| Suggestions · सुझाव | "सुझाव दें" ke message, "हो गया ✓" |
| Farmers · किसान | Khate wale kisan (aakhiri 200), number se dhoondo, unki requests |
| Account deletions · खाता हटाना | Jinhone app se khata hataya: owner unki requests + data hatata hai (30 din ke andar); WhatsApp chat phone me khud hatao |
| Switches · स्विच (owner, 14 Oct 2026) | **Har feature ka ek hissa — click karo, uske switch aur settings khulte hain** (computer pe baayein list, daayein settings; phone pe list → hissa → "← सारे हिस्से"). **📍 राज्य:** state ON/OFF + "aakhiri bhav kab, kitni lines, kahan se (MSAMB / eNAM)" + server ki aakhiri run (sarkari API chal rahi ya band). **📈 मंडी भाव** (hamesha ON; andar: naksha, rukein/bechein, bhav sunein, photo, bhav alert, subah ka message) · **🌦 मौसम** · **🌱 कैलेंडर** · **🏛 Services टैब** (andar: yojanayein) · **🏪 Khalihan Kendra** — ON/OFF, Home card ON/OFF, **Kendra ke apne zile** (kise dikhe), **jagah**: pata, naksha (lat, lon ya Google Maps link chipkao), sadak se kitne km tak · **🤝 Khalihan को बेचें** — ON/OFF + **zile jahan Khalihan kharidta hai** (state-wise) · **👤 OTP लॉग इन** · **💬 सुझाव**. "v1.0.4+" wala switch sirf v1.0.4 aur naye app me. Badlav agli baar app khulne pe. |
| Team · टीम (owner) | Kaun panel khol sakta hai |
| Change log · रिकॉर्ड (owner) | Har badlav: kab, kisne, kya |
| ⚙️ Settings · सेटिंग्स (sab) | Bhasha (English / हिन्दी), samay (India / is computer ka), aapka khata, version, Firebase console · Firestore · Analytics · Crashlytics · Play Console ke link |

**Paisa kahan rehta hai:** processor ka bhav aur margin `deal_money` aur
`offer_money` me — sirf owner padh/likh sakta hai. Ye jaan-boojh kar
`sell_requests` aur offers se alag hai, kyunki kisan apni request padh sakta
hai aur offers har phone padhta hai — hamara margin kisi kisan tak nahi
pahunchna chahiye.

Rules (`firestore.rules`): kisan sirf apna khata aur apni requests padh sakta
hai; staff requests/offers/sujhav sambhalta hai; switches, team aur record
sirf owner. Prices, schemes, calendar aur offers sab ke liye khule hain, jaise
pehle.
