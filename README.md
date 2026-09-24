# Khalihan — daily server job

Ye chhota sa program roz ek baar GitHub par apne aap chalta hai aur do kaam karta hai:

1. Har state ke mandi bhav government API se uthata hai aur Firestore me save karta hai.
   Isse naye kisan ko bhi pehle din se bhara hua trend graph milta hai.
2. Har state ke phones ko ek chhota sandesh (push) bhejta hai. Android ise app band
   hone par bhi pahunchata hai. Phone khud apne target se bhav milata hai aur zarurat
   ho to alert dikhata hai.

Kisan ka target kabhi is server tak nahi aata. Server sirf itna kehta hai:
"aaj ke bhav aa gaye".

Kharcha: **zero**. Public repo par GitHub Actions muft hai, aur Firebase ka Spark plan bhi.

---

## Ek baar ka setup (takreeban 15 minute)

### 1. GitHub account aur repo

1. [github.com](https://github.com) par account banao (muft).
2. Upar right me **+ → New repository**.
3. Naam: `khalihan-server`. **Public** rakho (public repo par Actions muft hai).
4. **Create repository** dabao.

### 2. Files upload karo

Nayi repo ke page par **"uploading an existing file"** link par click karo aur is folder
ki **saari files** drag karke chhod do:

- `daily_prices.py`
- `requirements.txt`
- `.github/workflows/daily.yml`

> `.github` folder chhupa hua hota hai. Mac ke Finder me **Command + Shift + .** dabane se
> chhupi hui files dikhne lagti hain.

Neeche **Commit changes** dabao.

### 3. Firebase ki chaabi (service account)

1. [Firebase console](https://console.firebase.google.com) → apna project →
   ⚙️ **Project settings** → **Service accounts** tab.
2. **Generate new private key** → **Generate key**. Ek `.json` file download hogi.
3. Use TextEdit me kholo aur **poora content copy** karo (pehle `{` se aakhri `}` tak).

⚠️ Ye chaabi kisi ko mat dena, kahin public mat daalna. Isse tumhare Firebase ka poora
access milta hai. Sirf GitHub secret me hi rakhni hai.

### 4. Do secrets aur ek variable

Repo → **Settings** → left me **Secrets and variables** → **Actions**.

**New repository secret** dabake do secret banao:

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | wo poora JSON jo abhi copy kiya |
| `DATA_GOV_IN_API_KEY` | tumhari data.gov.in key (app ki `.env` file me likhi hai) |

Phir usi page par **Variables** tab → **New repository variable**:

| Name | Value |
|---|---|
| `STATES` | `Maharashtra` |

Shuru me sirf ek state rakho, taaki test aasan rahe. Baad me is variable ko **delete**
kar dena — phir job khud saare states ke liye chalegi.

### 5. Ek baar haath se chala ke dekho

Repo → **Actions** tab → left me **Khalihan daily prices** → right me
**Run workflow** → **Run workflow**.

Ek minute me chalega. Us par click karke log dekho, aisa dikhna chahiye:

```
Maharashtra: 318 rows, 96 crops
  Maharashtra: updated to 96 crops
  Maharashtra: push sent to prices_maharashtra
Done. 0 state(s) failed.
```

Ab phone par (app **band** rakhna) notification aana chahiye — agar kisi track ki hui
fasal ne target chhua ho, ya bhav 5% se zyada hila ho.

---

## Roz kab chalta hai

`daily.yml` me likha hai `cron: "0 14 * * *"` — yaani **roz shaam 7:30 baje (India time)**.
Tab tak mandiyon ka data aa chuka hota hai.

Waqt badalna ho to us line me UTC likhna hota hai (India time se 5 ghante 30 minute peeche).
Jaise subah 8 baje India = `"30 2 * * *"`.

> GitHub ka schedule kabhi-kabhi 5-20 minute late chalta hai — ye normal hai.
> Aur agar repo me 60 din tak koi badlav na ho to GitHub schedule apne aap band kar deta hai;
> tab Actions tab me jaake dobara chalu karna padta hai.

---

## Aage chal ke

Jab app se kamai shuru ho, yahi kaam Firebase ke apne scheduler (Cloud Functions) par le
jaya ja sakta hai — code lagbhag yahi rahega, sirf chalne ki jagah badlegi.
