"""Field maps for the official blank forms (Step 3, 19 Nov 2026).

Writes maps/<form>.json. Positions are PDF points from the page's top-left;
for text, y is the baseline. 'who':
  profile — from the farmer's saved profile (on the phone)
  ai      — worded by the AI from what the farmer said (Marathi), farmer confirms
  farmer  — typed by the farmer only; never sent to the AI (Aadhaar, bank, card no.)
  ink     — left empty on purpose (thumb impression in ink)
Office-only parts of each form (inspector's report, counterfoil, sanction) are
never filled. 'sample' values are made up — only for checking positions.
"""
import json
import os

OUT = os.path.dirname(os.path.abspath(__file__))  # this folder: content/local_forms/maps

L = lambda mr, hi, en: {"mr": mr, "hi": hi, "en": en}  # noqa: E731


def T(fid, page, x, y, size, who, label, sample, **kw):
    d = {"id": fid, "page": page, "kind": "text", "x": x, "y": y, "size": size, "who": who, "label": label, "sample": sample}
    d.update(kw)
    return d


def CH(fid, page, who, label, options, sample):
    """A printed choice to circle: options = {value: [x, y_top, w, h]}."""
    return {"id": fid, "page": page, "kind": "choice", "who": who, "label": label, "options": options, "sample": sample}


def TICK(fid, page, who, label, options, sample):
    """Tick one printed item: options = {value: [x_of_its_printed_number, y_baseline]};
    stored as the tick's own position, 12 pt left of the number."""
    opts = {k: [round(v[0] - 12, 1), v[1]] for k, v in options.items()}
    return {"id": fid, "page": page, "kind": "tick", "who": who, "label": label, "options": opts, "sample": sample}


def BOX(fid, page, kind, x, y, w, h, who, label, **kw):
    d = {"id": fid, "page": page, "kind": kind, "x": x, "y": y, "w": w, "h": h, "who": who, "label": label}
    d.update(kw)
    return d


def table(prefix, page, rows_y, cols, size=8, skew=0.0, x0=0.0):
    """cols = [(key, x, who, label, sample_row1)]; one field per cell. skew: how far a
    scanned page's line drops per point to the right of x0 (tilted scan)."""
    out = []
    for r, y in enumerate(rows_y, start=1):
        for key, x, who, label, sample in cols:
            yy = round(y + skew * (x - x0), 1)
            out.append(T(f"{prefix}{r}_{key}", page, x, yy, size, who, label, sample if r == 1 else "", row=r, col=key))
    return out


VILLAGE = L("शिधावाटप क्षेत्र / गाव", "गाँव", "Village / rationing area")
TALUKA = L("विभाग / तालुका", "तालुका", "Taluka")
DIST = L("परिमंडळ / जिल्हा", "ज़िला", "District")
NAME = L("अर्जदाराचे नाव (प्रथम आडनाव)", "आवेदक का नाम (पहले उपनाम)", "Applicant's name (surname first)")
AGE = L("वय", "उम्र", "Age")
ADDR = L("पूर्ण निवासी पत्ता", "पूरा पता", "Full address")
SHOP = L("दुकान क्रमांक", "राशन दुकान नंबर", "Ration shop number")
CARD = L("शिधापत्रिका क्रमांक", "राशन कार्ड नंबर", "Ration card number")
DATE = L("दिनांक", "तारीख", "Date")
SIGN = L("अर्जदाराची सही", "आवेदक के हस्ताक्षर", "Applicant's signature")
THUMB = L("अंगठ्याचा ठसा", "अंगूठे का निशान", "Thumb impression")

S = {"village": "शेंदुर्णी", "taluka": "जामनेर", "district": "जळगाव", "name": "पाटील रामदास गणपत", "age": "४२",
     "addr": "मु. पो. शेंदुर्णी, ता. जामनेर, जि. जळगाव", "shop": "१२", "date": "१९/११/२०२६"}

FORMS = {}

# ── namuna 8: add a name (Letter 612×792, 2 pages; text layer) ──────────────
FORMS["ration_add_name"] = {
    "page_pt": [[612, 792], [612, 792]],
    "fields": [
        BOX("photo", 1, "photo_row", 300, 86, 270, 92, "farmer", L("नवीन सदस्याचा पासपोर्ट साईज फोटो", "नए सदस्य का पासपोर्ट फ़ोटो", "Passport photo of each new member"), each=[66, 86]),
        T("gav", 1, 108, 213, 10, "profile", VILLAGE, S["village"], profile="village_mr"),
        T("taluka", 1, 238, 213, 10, "profile", TALUKA, S["taluka"], profile="taluka"),
        T("jilha", 1, 410, 213, 10, "profile", DIST, S["district"], profile="district"),
        T("naav", 1, 60, 279, 10.5, "profile", NAME, S["name"], profile="name_mr"),
        T("vay", 1, 385, 279, 10.5, "profile", AGE, S["age"], profile="age"),
        T("ling", 1, 66, 312, 10, "profile", L("लिंग", "लिंग", "Gender"), "पुरुष", profile="gender"),
        T("nagrikatva", 1, 140, 312, 10, "ai", L("नागरिकत्व", "नागरिकता", "Citizenship"), "भारतीय"),
        T("patta", 1, 112, 328, 10, "profile", ADDR, S["addr"], profile="address"),
        T("dukan", 1, 128, 361, 10, "farmer", SHOP, S["shop"]),
        BOX("card_no", 1, "boxes", 437, 352, 143.5, 13, "farmer", CARD, n=12, sensitive=False),
        *table("m", 1, [433, 454, 476, 497], [
            ("naav", 58, "ai", L("नाव", "नाम", "Name"), "पाटील सीमा रामदास"),
            ("nate", 170, "ai", L("अर्जदाराशी नाते", "आवेदक से रिश्ता", "Relation"), "मुलगी"),
            ("janm", 217, "ai", L("जन्म दिनांक", "जन्म तारीख", "Date of birth"), "०५/०६/२००८"),
            ("vyavsay", 266, "ai", L("व्यवसाय", "काम", "Occupation"), "विद्यार्थिनी"),
            ("mobile", 323, "farmer", L("मोबाईल क्रमांक", "मोबाइल", "Mobile"), ""),
            ("agaman", 366, "ai", L("आगमनाची तारीख", "आने की तारीख", "Date of joining the family"), "जन्मापासून"),
            ("aadhaar", 418, "farmer", L("आधारकार्ड क्रमांक", "आधार नंबर", "Aadhaar number"), "XXXX XXXX XXXX"),
            ("bank", 497, "farmer", L("बँकखाते क्रमांक", "बैंक खाता", "Bank account"), "XXXXXXXXXX"),
        ], size=7.5),
        CH("divyang", 1, "ai", L("सदस्य दिव्यांग आहे काय?", "कोई सदस्य दिव्यांग?", "Any member disabled?"), {"होय": [285, 547, 16, 13], "नाही": [302, 547, 19, 13]}, "नाही"),
        CH("ajar", 1, "ai", L("सदस्य गंभीर आजाराने ग्रस्त आहे काय?", "कोई गंभीर बीमारी?", "Any serious illness?"), {"होय": [327, 571, 17, 13], "नाही": [345, 571, 18, 13]}, "नाही"),
        TICK("olakh", 1, "ai", L("ओळखीचा पुरावा", "पहचान का प्रमाण", "Proof of identity"), {"आधार कार्ड": [73, 625], "पॅन कार्ड": [145, 625], "ड्रायव्हिंग लायसन्स": [217, 625], "शासकीय दाखला / ओळखपत्र": [325, 625]}, "आधार कार्ड"),
        T("dinank", 1, 72, 737, 10, "profile", DATE, S["date"], profile="today"),
        BOX("sahi", 1, "sign", 418, 690, 80, 34, "farmer", SIGN, optional=True),
        BOX("angtha", 1, "thumb", 540, 680, 44, 44, "ink", THUMB),
    ],
    "office_only": ["कोड / अनुक्रमांक / नोंदणी क्रमांक", "संदर्भ क्रमांक", "page 2: शिधावाटप निरीक्षकाचे प्रतिवृत्त, अधिकाऱ्याचे आदेश (and the signature line under the order — signed at the office), स्थळप्रत"],
}

# ── namuna 9: remove a name (A4 scan) ───────────────────────────────────────
FORMS["ration_remove_name"] = {
    "page_pt": [[595.3, 841.9]],
    "fields": [
        T("gav", 1, 112, 127, 9.5, "profile", VILLAGE, S["village"], profile="village_mr"),
        T("taluka", 1, 362, 127, 9.5, "profile", TALUKA, S["taluka"], profile="taluka"),
        T("naav", 1, 158, 199, 9.5, "profile", NAME, S["name"], profile="name_mr"),
        T("vay", 1, 313, 199, 9.5, "profile", AGE, S["age"], profile="age"),
        T("patta", 1, 130, 212, 9, "profile", ADDR, S["addr"], profile="address"),
        T("patta2", 1, 122, 224, 9, "profile", L("पत्ता (पुढे)", "पता (आगे)", "Address (cont.)"), "", profile="address_rest"),
        T("dukan", 1, 122, 236, 9, "farmer", SHOP, S["shop"]),
        T("card_no", 1, 393, 236, 8.5, "farmer", CARD, "XXXXXXXXXXXX"),
        *table("m", 1, [317, 329.5, 342, 354.5, 367], [
            ("naav", 88, "ai", L("नाव", "नाम", "Name"), "पाटील गणपत भिका"),
            ("nate", 232, "ai", L("अर्जदाराशी नाते", "रिश्ता", "Relation"), "वडील"),
            ("vay", 286, "ai", AGE, "७८"),
            ("vyavsay", 318, "ai", L("व्यवसाय", "काम", "Occupation"), "शेती"),
            ("tarikh", 376, "ai", L("निघून गेल्याची किंवा मृत्यूची तारीख", "जाने या मृत्यु की तारीख", "Date of leaving or death"), "मृत्यू ०२/०९/२०२६"),
            ("thikan", 438, "ai", L("सध्याचे ठिकाण", "अभी कहाँ रहते हैं", "Present address"), "—"),
        ], size=7.5),
        T("dinank", 1, 96, 403, 9.5, "profile", DATE, S["date"], profile="today"),
        BOX("sahi", 1, "sign", 418, 404, 76, 28, "farmer", SIGN, optional=True),
    ],
    "office_only": ["अनुक्रमांक", "अर्ज No.", "संदर्भ क्रमांक", "शिधावाटप अधिकाऱ्याचा आदेश", "स्थळप्रत"],
    "thumb_note": "The form prints only 'अर्जदाराची सही'. A farmer who signs with his thumb gets a thumb box beside it (General Clauses Act s.3(56)).",
}

# ── namuna 14: change (A4 scan) ─────────────────────────────────────────────
FORMS["ration_change"] = {
    "page_pt": [[595.3, 841.9]],
    "fields": [
        T("gav", 1, 114, 125, 9, "profile", VILLAGE, S["village"], profile="village_mr"),
        T("taluka", 1, 241, 125, 9, "profile", TALUKA, S["taluka"], profile="taluka"),
        T("naav", 1, 182, 247, 9.5, "profile", NAME, S["name"], profile="name_mr"),
        T("vay", 1, 365, 247, 9.5, "profile", AGE, S["age"], profile="age"),
        T("patta", 1, 132, 260, 9, "profile", ADDR, S["addr"], profile="address"),
        T("dukan", 1, 184, 282, 8.5, "farmer", SHOP, S["shop"]),
        T("card_no", 1, 228, 294, 7, "farmer", CARD, "XXXXXXXXXXXX"),
        T("sthiti", 1, 172, 306, 9, "ai", L("(अ) विद्यमान स्थिती", "अभी क्या लिखा है", "(a) What the card says now"), "पत्ता: मु. पो. वाकोद, ता. जामनेर"),
        T("pherphar", 1, 172, 318, 9, "ai", L("(ब) इच्छित फेरफार", "क्या बदलना है", "(b) Change wanted"), "पत्ता: मु. पो. शेंदुर्णी, ता. जामनेर"),
        T("karan", 1, 150, 330, 9, "ai", L("(क) कारणे", "कारण", "(c) Reason"), "कुटुंब शेंदुर्णी येथे राहण्यास आले"),
        T("dinank", 1, 108, 384, 9.5, "profile", DATE, S["date"], profile="today"),
        BOX("sahi", 1, "sign", 376, 366, 72, 26, "farmer", SIGN, optional=True),
    ],
    "office_only": ["NO. x y z", "पावती / अधिकाऱ्याचा आदेश", "स्थळप्रत"],
    "thumb_note": "Prints only 'अर्जदाराची सही' — thumb box only if the farmer signs with his thumb.",
}

# ── namuna 15: duplicate card (A4 scan) ─────────────────────────────────────
FORMS["ration_duplicate"] = {
    "page_pt": [[595.3, 841.9]],
    "fields": [
        T("gav", 1, 120, 144, 9, "profile", VILLAGE, S["village"], profile="village_mr"),
        T("taluka", 1, 322, 149, 9, "profile", TALUKA, S["taluka"], profile="taluka"),
        T("naav", 1, 140, 217, 9.5, "profile", NAME, S["name"], profile="name_mr"),
        T("vay", 1, 368, 217, 9, "profile", AGE, S["age"], profile="age"),
        T("rahnar", 1, 420, 217, 9, "profile", L("राहणार", "निवासी", "Resident of"), S["village"], profile="village_mr"),
        T("dukan", 1, 190, 243, 8.5, "farmer", SHOP, S["shop"]),
        T("card_no", 1, 270, 254, 7.5, "farmer", CARD, "XXXXXXXXXXXX"),
        T("card_date", 1, 370, 254, 7.5, "ai", L("दिनांक (कार्ड हरवले / खराब झाले)", "कार्ड कब खोया / खराब हुआ", "Date lost / damaged"), "१०/११/२०२६"),
        CH("karan", 1, "ai", L("कारण", "कारण", "Reason"), {"हरवल्यामुळे": [438, 248, 46, 12], "चोरीस गेल्यामुळे": [484, 248, 32, 12], "फाटल्यामुळे": [113, 258, 38, 12], "खराब झाल्यामुळे": [151, 258, 58, 12]}, "फाटल्यामुळे"),
        T("navin_dukan", 1, 367, 281, 8, "farmer", L("नवीन कार्ड कोणत्या दुकानात नोंदवणार", "किस दुकान में दर्ज", "Shop for the new card"), S["shop"]),
        T("dhanda", 1, 278, 301, 8, "ai", L("मालकाचे / धंद्याचे नाव व पत्ता", "काम / मालिक का नाम और पता", "Employer / business and address"), "स्वतःची शेती, मु. पो. शेंदुर्णी"),
        *table("m", 1, [384, 396, 408, 421, 434], [
            ("naav", 92, "ai", L("नाव", "नाम", "Name"), "पाटील सुमन रामदास"),
            ("nate", 270, "ai", L("नाते", "रिश्ता", "Relation"), "पत्नी"),
            ("vay", 326, "ai", AGE, "३८"),
            ("vyavsay", 352, "ai", L("व्यवसाय", "काम", "Occupation"), "शेती"),
        ], size=7, skew=0.022, x0=92),
        *table("m", 1, [396, 411, 425.5, 439.5, 454], [
            ("aadhaar", 396, "farmer", L("आधार क्रमांक", "आधार", "Aadhaar"), "XXXX XXXX XXXX"),
            ("bank", 489, "farmer", L("बँक खाते क्रमांक", "बैंक खाता", "Bank account"), "XXXXXXXXXX"),
        ], size=7),
        T("juna_card", 1, 198, 474, 8, "farmer", L("माझी जुनी शिधापत्रिका क्रमांक", "पुराना कार्ड नंबर", "Old card number"), "XXXXXXXXXXXX"),
        T("dinank", 1, 104, 549, 9.5, "profile", DATE, S["date"], profile="today"),
        BOX("sahi", 1, "sign", 430, 505, 74, 26, "farmer", SIGN, optional=True),
        BOX("angtha", 1, "thumb", 522, 492, 42, 42, "ink", THUMB),
    ],
    "office_only": ["कोड क्रमांक", "अनुक्रमांक", "संदर्भ नोंदणी पुस्तक क्रमांक", "दुकानदाराकडून माहिती", "स्थळप्रत"],
}

# ── namuna 1: new card (Letter, 2 pages; text layer) ────────────────────────
YN = lambda x1, x2, y: {"होय": [x1, y, 16, 12], "नाही": [x2, y, 16, 12]}  # noqa: E731
FORMS["ration_new"] = {
    "page_pt": [[612, 792], [612, 792]],
    "fields": [
        BOX("photo", 1, "photo_row", 40, 124, 530, 56, "farmer", L("कुटुंबातील सर्व सदस्यांचे पासपोर्ट फोटो", "परिवार के सब सदस्यों के फ़ोटो", "Passport photos of all members"), each=[44, 56]),
        T("gav", 1, 108, 236, 10, "profile", VILLAGE, S["village"], profile="village_mr"),
        T("taluka", 1, 240, 236, 10, "profile", TALUKA, S["taluka"], profile="taluka"),
        T("jilha", 1, 412, 236, 10, "profile", DIST, S["district"], profile="district"),
        T("naav", 1, 136, 318, 10.5, "profile", L("अर्जदाराचे संपूर्ण नाव (आडनावाने सुरुवात)", "पूरा नाम (उपनाम से)", "Full name (surname first)"), S["name"], profile="name_mr"),
        T("ling", 1, 92, 343, 9, "profile", L("लिंग", "लिंग", "Gender"), "पुरुष", profile="gender"),
        T("nagrikatva", 1, 176, 343, 8, "ai", L("नागरिकत्व", "नागरिकता", "Citizenship"), "भारतीय"),
        T("patta", 1, 134, 359, 10, "profile", ADDR, S["addr"], profile="address"),
        *table("m", 1, [455, 468, 482, 495, 509, 522, 535], [
            ("naav", 58, "ai", L("नाव", "नाम", "Name"), "पाटील रामदास गणपत"),
            ("nate", 198, "ai", L("अर्जदाराशी नाते", "रिश्ता", "Relation"), "स्वतः"),
            ("janm", 247, "ai", L("जन्म दिनांक", "जन्म तारीख", "Date of birth"), "०१/०६/१९८४"),
            ("mobile", 292, "farmer", L("मोबाईल", "मोबाइल", "Mobile"), "XXXXXXXXXX"),
            ("vyavsay", 351, "ai", L("व्यवसाय व वार्षिक उत्पन्न", "काम और सालाना आमदनी", "Occupation and yearly income"), "शेती, ८०,०००"),
            ("aadhaar", 412, "farmer", L("आधार क्रमांक", "आधार", "Aadhaar"), "XXXX XXXX XXXX"),
            ("bank", 490, "farmer", L("बँक, खाते क्रमांक व IFSC", "बैंक, खाता, IFSC", "Bank, account, IFSC"), "XXXXXXXXXX"),
        ], size=7),
        T("utpanna", 1, 500, 604, 8.5, "ai", L("कुटुंबाचे एकूण वार्षिक उत्पन्न (रुपये)", "परिवार की कुल सालाना आमदनी", "Family's total yearly income (₹)"), "१,२०,०००"),
        CH("divyang", 1, "ai", L("सदस्य दिव्यांग आहे काय?", "कोई दिव्यांग?", "Any member disabled?"), YN(399, 418, 611), "नाही"),
        CH("ajar", 1, "ai", L("गंभीर आजार आहे काय?", "गंभीर बीमारी?", "Serious illness?"), YN(335, 352, 626), "नाही"),
        CH("mnrega", 1, "ai", L("मनरेगा नोंदणी केली आहे का?", "मनरेगा में नाम?", "Registered under MNREGA?"), YN(228, 246, 641), "नाही"),
        CH("gas", 1, "ai", L("घरगुती गॅस आहे काय?", "घर में गैस है?", "Cooking gas connection?"), YN(210, 227, 656), "होय"),
        T("gas_details", 1, 432, 664, 7, "farmer", L("गॅस ग्राहक क्रमांक, वितरकाचे नाव व पत्ता", "गैस ग्राहक नंबर, एजेंसी", "Gas consumer no., agency"), "XXXXXXX, जामनेर गॅस"),
        CH("sodne", 1, "ai", L("हक्क स्वेच्छेने सोडू इच्छिता काय?", "अनाज का हक़ अपनी मर्ज़ी से छोड़ना?", "Give up the grain right voluntarily?"), YN(383, 400, 671), "नाही"),
        TICK("nivas_pura", 1, "ai", L("निवासाचा पुरावा", "निवास का प्रमाण", "Proof of residence"), {"भाडे पावती": [64, 714], "मालकीचा पुरावा": [181, 714], "LPG जोडणी क्रमांक": [327, 714], "विजेचे देयक": [469, 714], "टेलिफोन/मोबाईल देयक": [66, 727], "बँक पासबुक": [181, 727], "ड्रायव्हिंग लायसन्स": [327, 727], "मतदार ओळखपत्र": [469, 727], "आधार कार्ड": [66, 740], "इतर शासकीय ओळखपत्र": [181, 740]}, "विजेचे देयक"),
        TICK("olakh", 2, "ai", L("ओळखीचा पुरावा", "पहचान का प्रमाण", "Proof of identity"), {"आधार कार्ड": [73, 43], "पॅन कार्ड": [145, 43], "ड्रायव्हिंग लायसन्स": [217, 43], "शासकीय ओळखपत्र": [325, 43]}, "आधार कार्ड"),
        T("dinank", 2, 66, 239, 10, "profile", DATE, S["date"], profile="today"),
        BOX("sahi", 2, "sign", 440, 200, 72, 28, "farmer", SIGN, optional=True),
        BOX("angtha", 2, "thumb", 524, 196, 44, 44, "ink", THUMB),
    ],
    "office_only": ["क्रमांक (boxes)", "कोड / अनुक्रमांक / नोंदणी क्रमांक", "पडताळले व बरोबर आढळले — निरीक्षक", "स्थळप्रत"],
}

for fid, f in FORMS.items():
    f["form"] = fid
    with open(os.path.join(OUT, fid + ".json"), "w", encoding="utf-8") as fh:
        json.dump(f, fh, ensure_ascii=False, indent=1)
    print(fid, len(f["fields"]), "fields")

# ── papers to attach: only what the form itself (or the department) says ───
D = lambda i, mr, hi, en, when="always": {"id": i, "mr": mr, "hi": hi, "en": en, "when": when}  # noqa: E731
ID_PROOF = D("id_proof", "ओळखीचा पुरावा: आधार कार्ड / पॅन कार्ड / ड्रायव्हिंग लायसन्स / शासकीय दाखला किंवा ओळखपत्र (एक)",
             "पहचान का एक प्रमाण: आधार / पैन / ड्राइविंग लाइसेंस / सरकारी पहचान पत्र", "One proof of identity: Aadhaar / PAN / driving licence / government ID")
DOCS = {
    "ration_add_name": [
        D("photo", "नवीन सदस्याचा पासपोर्ट साईज फोटो (अर्जावर चिकटवणे)", "नए सदस्य का पासपोर्ट साइज़ फ़ोटो (अर्ज पर चिपकाएँ)", "Passport-size photo of each new member (pasted on the form)"),
        D("removal", "इतर शिधापत्रिकेत नाव असल्यास: नाव कमी केल्याचा दाखला किंवा ती शिधापत्रिका जमा केल्याची पावती", "दूसरे राशन कार्ड में नाम हो तो: नाम कम करने का दाखला या वह कार्ड जमा करने की पावती", "If the name is in another ration card: its removal certificate or the surrender receipt", "if_other_card"),
        ID_PROOF,
        D("disability", "सदस्य दिव्यांग असल्यास: त्याबाबतचे प्रमाणपत्र", "कोई सदस्य दिव्यांग हो तो: उसका प्रमाणपत्र", "If a member is disabled: the certificate", "if_divyang"),
    ],
    "ration_remove_name": [],
    "ration_change": [],
    "ration_duplicate": [
        D("old_card", "फाटलेली / खराब झालेली जुनी शिधापत्रिका (अर्जासोबत जोडणे आवश्यक)", "फटा / खराब पुराना राशन कार्ड (अर्ज के साथ ज़रूरी)", "The torn / damaged old card (must be attached)", "if_damaged"),
    ],
    "ration_new": [
        D("photo", "कुटुंबातील सर्व सदस्यांचे पासपोर्ट साईज फोटो", "परिवार के सब सदस्यों के पासपोर्ट साइज़ फ़ोटो", "Passport-size photos of all family members"),
        D("removal", "इतर शिधापत्रिकेत नाव असल्यास: नाव कमी केल्याचा दाखला किंवा शिधापत्रिका जमा पावती", "दूसरे कार्ड में नाम हो तो: नाम कम करने का दाखला या कार्ड जमा की पावती", "If a name is in another card: removal certificate or surrender receipt", "if_other_card"),
        D("residence", "निवासाचा पुरावा (एक): भाडे पावती / मालकीचा पुरावा / LPG जोडणी / वीज देयक / टेलिफोन-मोबाईल देयक / बँक पासबुक / ड्रायव्हिंग लायसन्स / मतदार ओळखपत्र / आधार / इतर शासकीय ओळखपत्र",
          "निवास का एक प्रमाण: किराया रसीद / मालिकाना / गैस कनेक्शन / बिजली बिल / फ़ोन बिल / बैंक पासबुक / ड्राइविंग लाइसेंस / वोटर कार्ड / आधार / सरकारी पहचान पत्र",
          "One proof of residence: rent receipt / ownership / LPG / electricity bill / phone bill / bank passbook / driving licence / voter ID / Aadhaar / government ID"),
        D("rent", "घर भाड्याचे असल्यास: भाडे करारनामा व मूळ मालकाचे ना-हरकत प्रमाणपत्र (शासकीय निवासस्थान: अलॉटमेंट आदेश)", "घर किराये का हो तो: किरायानामा और मालिक का अनापत्ति प्रमाणपत्र", "If rented: rent agreement and the owner's NOC (government quarters: allotment order)", "if_rented"),
        ID_PROOF,
        D("income", "कुटुंबाचे वार्षिक उत्पन्न: शासनाचा उत्पन्नाचा दाखला किंवा स्वयंघोषणापत्र", "परिवार की सालाना आमदनी: आय प्रमाणपत्र या स्वघोषणा पत्र", "Family income: income certificate or a self-declaration"),
        D("disability", "सदस्य दिव्यांग असल्यास: प्रमाणपत्र", "कोई दिव्यांग हो तो: प्रमाणपत्र", "If a member is disabled: certificate", "if_divyang"),
    ],
}
META = {
    "ration_add_name": ("8", L("कौटुंबिक शिधापत्रिकेमध्ये नाव वाढविण्याकरिता अर्ज", "राशन कार्ड में नाम जोड़ने का आवेदन", "Add a name to the ration card")),
    "ration_remove_name": ("9", L("कौटुंबिक शिधापत्रिकेतील युनिट्स कायम स्वरूपात कमी करण्याकरिता अर्ज", "राशन कार्ड से नाम हटाने का आवेदन", "Remove a name from the ration card")),
    "ration_change": ("14", L("शिधापत्रिकेमध्ये फेरफार करण्याकरिता अर्ज (पत्ता, कुटुंबप्रमुख, दुकान, नाव दुरुस्ती)", "राशन कार्ड में बदलाव (पता, मुखिया, दुकान, नाम सुधार)", "Change in the ration card (address, head of family, shop, name)")),
    "ration_duplicate": ("15", L("हरवलेल्या / फाटलेल्या / खराब शिधापत्रिकेची दुसरी प्रत मिळण्यासाठी अर्ज", "राशन कार्ड की दूसरी प्रति (खोया / फटा / खराब)", "Duplicate ration card (lost / torn / damaged)")),
    "ration_new": ("1", L("नवीन शिधापत्रिकेसाठी अर्ज (कुटुंब प्रमुखाने भरावा)", "नया राशन कार्ड का आवेदन", "New ration card")),
}
for fid in FORMS:
    path = os.path.join(OUT, fid + ".json")
    f = json.load(open(path, encoding="utf-8"))
    f["namuna"], f["title"] = META[fid]
    f["docs"] = DOCS[fid]
    json.dump(f, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
