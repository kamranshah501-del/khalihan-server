# Khalihan Admin — setup (11 Oct 2026)

Team ka web panel: bechne ki requests aur unka status, offers, feature switch,
sujhav, kisan, khata hatane ki maang, team aur har badlav ka record.
Ye usi Firebase project pe chalta hai jis pe app hai. Login: Google account se,
sirf wahi log jo `staff` me hain.

`?demo` lagake kholo (jaise `…web.app/?demo`) to banawati data ke saath
saari screens dekh sakte ho — kuch save nahi hota.

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
Pehli baar ye Google login aur project chunne ko kahega (Khalihan wala project
chuno, alias kuch bhi, jaise `khalihan`). Aakhir me **Hosting URL** dikhega
(jaise `https://<project>.web.app`) — wahi admin panel hai. Bookmark kar lo.

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
**फ़ीचर स्विच** me dono ON:

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
8. Panel → **फ़ीचर स्विच** → "Khalihan को बेचें" ON, "मोबाइल OTP लॉग इन" ON →
   **ऑफ़र** tab se pehla offer.

---

## Panel me kya hai

| Tab | Kaam |
|---|---|
| डैशबोर्ड | Nayi requests (phone karna baaki), aaj ki, chal rahe saude, poore, chalu offers, khate wale kisan, naye sujhav, khata hatane ki maang |
| बिक्री रिक्वेस्ट | Har request: kisan, OTP wala number ✓, gaon, fasal, maal, bhav. 📞 phone / 💬 WhatsApp. Status: **नई → फ़ोन किया → सौदा पक्का → माल उठाया → पैसा दिया** (ya रद्द), note, pakka bhav, taul. Kisne kya kiya — itihaas. Kisan app ke "मेरी बिक्री" me wahi status dekhta hai. |
| ऑफ़र | Chalu offers, बंद करें, naya offer — GitHub wale "Khalihan buy offers" jaisa hi (dono chalte hain) |
| सुझाव | "सुझाव दें" ke message, "हो गया ✓" |
| किसान | Khate wale kisan (aakhiri 200), number se dhoondo, unki requests |
| खाता हटाना | Jinhone app se khata hataya: owner unki requests + data hatata hai (30 din ke andar); WhatsApp chat phone me khud hatao |
| फ़ीचर स्विच (owner) | App ke features chalu/band — agli baar app khulne pe lagu, update ki zaroorat nahi (v1.0.3 se) |
| टीम (owner) | Kaun panel khol sakta hai |
| रिकॉर्ड (owner) | Har badlav: kab, kisne, kya |

Rules (`firestore.rules`): kisan sirf apna khata aur apni requests padh sakta
hai; staff requests/offers/sujhav sambhalta hai; switches, team aur record
sirf owner. Prices, schemes, calendar aur offers sab ke liye khule hain, jaise
pehle.
