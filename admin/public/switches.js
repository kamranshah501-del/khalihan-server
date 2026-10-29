// Khalihan Admin — the Switches page (owner only).
//
// Owner's rule (13 Oct 2026): the app is complete, and every feature can be
// switched from here, so Khalihan opens step by step as it grows.
// Owner, 14 Oct 2026: one section per feature — click a section and its own
// switches and settings open; the Kendra is its own section with its own
// districts and location.
//
//   config/app → features.{key}          a feature ON/OFF (app reads it at start)
//   config/app → launch_states           states farmers can pick (Maharashtra always)
//   config/app → sell_districts.{State}  where Khalihan buys ("Khalihan ko becho")
//   kendra/info → districts, km, lat, lon, address   who sees the Kendra
//   kendra/home_card → on                the square card on Home
//   config/app → notice                  a strip on the app's Home (v1.0.4+)
//   config/app → festival                lights on Home's header for some days (v1.0.4+)
//   waiting/{id} → s                     "my state isn't in the list" (counted)
//
// In the app (v1.0.4+) Schemes and the Kendra sit inside the Services tab
// (AppConfig.featureParent). `def` = what the app does while the server has
// said nothing — must match AppConfig.featureDefaults.

import { KENDRA_WORDS } from './kendra.js';

export const SWITCH_WORDS = {
  en: {
    tab_features: 'Switches',
    sw_intro: 'A change applies the next time a farmer opens the app — no update needed. "v1.0.4+" = works on app v1.0.4 and newer.',
    sw_sections: 'Sections',
    sw_back: '← All sections',
    sw_always: 'Always on',
    sw_on: 'ON', sw_off: 'OFF',
    sw_section_off: 'This section is off — everything inside it is off in the app.',
    sw_off_confirm: 'Turn off "{s}"? Everything inside it goes off too: {k}.',
    sw_prices: 'Mandi prices',
    sw_prices_d: 'The heart of the app — always on. The pieces inside can be switched one by one.',
    sw_since: 'v{v}+',
    sw_n_of: '{a} of {b} on',
    sw_states: 'States',
    sw_states_d: 'A state ON = farmers there can pick it; prices, weather, calendar and schemes work in the whole state. Districts are chosen inside "Sell to Khalihan" and "Khalihan Kendra".',
    sw_states_sum: 'Open: {s}',
    sw_other_states: 'Other states ({n})',
    sw_refresh: '↻ Check data',
    sw_mh_locked: 'Maharashtra is always open.',
    sw_data_none: 'No prices yet',
    sw_data_ok: 'Prices: {d} · {n} rows',
    sw_data_old: 'Last prices: {d}',
    sw_app_full: 'App: ready',
    sw_app_soon: 'App: towns & map from v1.0.4',
    sw_app_basic: 'App: prices only',
    sw_state_confirm_soon: 'Open {s}? Its mandi towns, district map and schemes come with app v1.0.4 — farmers on older versions see prices, weather and the calendar only.',
    sw_waiting: '⏳ {n} waiting',
    sw_waiting_total: 'Farmers waiting for their state (from the app): {n}',
    sw_waiting_none: 'No farmer has asked for another state yet.',
    sw_notice: 'Notice on Home',
    sw_notice_d: 'A strip at the top of Home on the days you choose — mandis closed for a festival, prices late, or your own words. Farmers can hide it; a new notice shows again. App v1.0.4+.',
    sw_notice_none: 'No notice',
    sw_notice_live: 'Live',
    sw_notice_sched: 'From {d}',
    sw_notice_ended: 'Ended',
    sw_n_now: 'Now on the app',
    sw_n_kind: 'Type',
    sw_n_closed: 'Mandis closed (festival / holiday)',
    sw_n_late: 'Prices late today',
    sw_n_custom: 'My own words',
    sw_n_a: 'Mandis closed from',
    sw_n_b: 'to',
    sw_n_from: 'Show from',
    sw_n_until: 'Show until',
    sw_n_states: 'Which states',
    sw_n_all: 'All open states',
    sw_n_words: 'Your words (write at least one language)',
    sw_n_extra: 'Extra line (optional), e.g. "Diwali"',
    sw_n_preview: 'How farmers see it',
    sw_n_save: 'Put up the notice',
    sw_n_remove: 'Take it down',
    sw_n_remove_q: 'Take the notice down from every phone?',
    sw_n_saved: 'Notice saved — open phones show it within seconds',
    sw_n_removed: 'Notice taken down',
    sw_n_bad_dates: 'Check the dates: "Show until" must be on or after "Show from".',
    sw_n_bad_closed: 'Give the day the mandis close.',
    sw_n_bad_words: 'Write the notice in at least one language.',
    sw_n_old: 'Phones on app v1.0.3 or older don\'t show notices.',
    sw_fest: 'Festival look',
    sw_fest_d: 'Lights on Home\'s header for the days you choose — behind the words, never over them. App v1.0.4+.',
    sw_fest_none: 'None',
    sw_fest_kind: 'Festival',
    sw_fest_diwali: 'Diwali — strings of lights',
    sw_fest_from: 'From',
    sw_fest_until: 'Until',
    sw_fest_save: 'Put it up',
    sw_fest_remove: 'Take it down',
    sw_fest_remove_q: 'Take the festival look down from every phone?',
    sw_fest_saved: 'Festival look saved — open phones show it within seconds',
    sw_fest_removed: 'Festival look taken down',
    sw_fest_bad: 'Check the dates: "Until" must be on or after "From".',
    sw_fest_more: 'More festivals (Bail Pola, Gudi Padwa, Eid, Holi…) come with app updates.',
    sw_state_confirm: 'Open {s}? The app has only its prices so far — no mandi distances, district map or state schemes yet. Farmers there will see prices, weather and the calendar.',
    sw_state_close: 'Close {s}? Farmers who already picked it keep it, but new farmers can\'t pick it.',
    sw_server: '🖥️ Server\'s last run: {t}',
    sw_gov_down: 'Government price API (data.gov.in): not answering ❌ — only states with a second source get fresh prices.',
    sw_gov_ok: 'Government price API (data.gov.in): working ✅',
    sw_server_none: '🖥️ The server hasn\'t reported yet.',
    sw_phone: '🖥️ Mumbai collector: prices for {n} states ✅',
    sw_gov_abroad: 'Government price API from GitHub (USA): blocked — normal, it answers only Indian computers. The Mumbai collector brings the prices.',
    sw_feed_quiet: '❌ Mumbai collector silent since {t} — other states get no prices. Google Cloud → VM instances → SSH → type  ~/bin/khalihan  and send Claude what it shows.',
    sw_via: 'via {s}',
    sw_last_err: 'Last run: {e}',
    sw_all_on: 'All ON',
    sw_all_off: 'All OFF',
    sw_dist_loading: 'Reading the districts from the latest prices…',
    sw_dist_nodata: 'No price data for this state yet — its districts show here once prices arrive.',
    sw_dist_show: 'Show districts',
    sw_saved: 'Saved — the app picks it up at its next start',
    sw_n_dist: '{n} district(s)',
    sw_no_dist: 'no district yet',
    sw_sell_d: 'The offer card and sell requests — only in the districts below, and only for crops with a live offer (Offers tab).',
    sw_sell_dist: 'Districts where Khalihan buys',
    sw_sell_dist_d: 'Tap a district to switch buying there on or off.',
    sw_sell_none: '⚠️ No district is ON yet — no farmer will see the offer.',
    sw_kendra_d: 'Khalihan\'s seed & fertiliser shop: the shop in Services and the square card on Home. Products, orders and slides are in the Kendra tab.',
    sw_k_parent: '⚠️ The Services tab is OFF — the Kendra stays hidden until Services is ON.',
    sw_k_card: 'Square card on Home',
    sw_k_card_d: 'Offers, today\'s urea/DAP/potash, new arrivals, notices — the slides are made in Kendra tab → Home card.',
    sw_k_where: 'Who sees the shop — districts',
    sw_k_where_d: 'Farmers whose district is ON here see the Kendra.',
    sw_k_none: '⚠️ The Kendra has no district — no farmer will see it.',
    sw_k_loc: 'Location',
    sw_k_loc_d: 'Shown to farmers with "Directions". With km set, a farmer who picked their town sees the Kendra when it is within that distance by road — even across a district line.',
    sw_k_address: 'Address',
    sw_k_point: 'Map location — "lat, lon" or a Google Maps link',
    sw_k_point_bad: 'Could not read a place in India from that — paste "20.81, 75.78" or a Google Maps link.',
    sw_k_km: 'Reach by road',
    sw_k_km_0: 'Districts only',
    sw_k_map: 'Check on the map ↗',
    sw_k_save: 'Save location',
    sw_k_more: 'Shop name, phone, licence, hours → Kendra tab → Kendra',
    f_price_map: 'Price map', f_price_map_d: 'List | Map in "Where to sell?".',
    f_hold_sell: 'Sell now or wait?', f_hold_sell_d: 'What waiting costs, and the break-even price.',
    f_sell_menu: '"Want to sell?" button', f_sell_menu_d: 'The green button on a crop page and everything behind it (app v1.0.6). Off = no button. The button also hides by itself when every piece inside is off.',
    f_where_sell: 'Where to sell?', f_where_sell_d: 'Which mandi leaves the most in hand after rent — in the green button, Home\'s button, the comparison page\'s best mandi and the target celebration.',
    f_sell_interest: 'How much do you want to sell?', f_sell_interest_d: 'The quantity form for crops Khalihan doesn\'t buy yet — it tells us where selling is wanted.',
    f_target: 'Target price', f_target_d: 'The target rings on a crop page, the "target reached" alert and the celebration (app v1.0.6). Off = all three hide; saved targets stay on the phone.',
    f_plus: 'Khalihan Plus', f_plus_d: 'The paid plan. Off = nothing locked, everything free as before. ⚠️ Keep OFF until Plus can be bought (Google Play Billing, next app update) — on now = the features below lock for everyone and nobody can unlock them.',
    f_plus_target: 'Target price in Plus', f_plus_target_d: 'With Plus on: farmers without Plus see the target rings locked (🔒 Plus) and get no target alert.',
    f_day_voice: 'Hear today\'s prices', f_day_voice_d: 'The Home button and the "Listen" button on the morning message.',
    f_share_picture: 'Send prices as a picture', f_share_picture_d: 'Off = Share sends a plain WhatsApp message.',
    f_alerts: 'Price alerts', f_alerts_d: 'The bell on a crop page and the "price moved / target reached" alert. Off = no bell, no alerts.',
    f_brief: 'Morning message', f_brief_d: 'The 6–8 am message with the farmer\'s crops and the weather. Off = no message, and its switch in Profile hides.',
    f_weather: 'Weather', f_weather_d: 'The weather card on Home, the weather page and the hail / storm / heat warnings.',
    f_calendar: 'Crop calendar', f_calendar_d: 'The Home button, the crop page tile, "This week on the farm" and the weekly field reminder.',
    f_services: 'Services tab', f_services_d: 'The Services tab in the bottom bar. Off = the tab hides, and the schemes and the Kendra with it.',
    f_schemes: 'Government schemes', f_schemes_d: 'The schemes card in Services.',
    f_sell: 'Sell to Khalihan', f_sell_d: 'The offer card and sell requests.',
    f_login: 'Mobile OTP login', f_login_d: '"My account" and an OTP before selling. Every SMS costs money (about ₹6) — before turning it on, finish part D of the admin README (Blaze, Phone sign-in, SHA).',
    f_feedback: 'Suggestions', f_feedback_d: '"सुझाव दें" in Profile and Services.',
    f_home_sky: 'Living sky in headers', f_home_sky_d: 'The headers of Home, My Crops and Services show the farm\'s own sky — dawn, day, dusk, night, clouds, rain — with the temperature (app v1.0.4: My Crops and Services from build v5.44). Off = plain navy headers. The small weather pill on inner pages follows the Weather switch.',
    f_advice: 'Farming advice', f_advice_d: 'The "Farming Advice" card on Home and on the weather page, and its page: spraying, irrigation, harvest, the next 3 days. Off = no advice card.',
    f_widget_weather: 'Weather on the big widget', f_widget_weather_d: 'The home-screen widget at 4x3 and bigger shows today\'s weather and the spraying / rain line on top (app v1.0.5). Off = only the crops.',
    f_dark: 'Dark mode', f_dark_d: 'The app turns dark after sunset and light at sunrise (at the farm), or the farmer fixes it in Profile → App Colour (app v1.0.5). Off = always light for everyone, and the Profile row hides.',
  },
  hi: {
    tab_features: 'स्विच',
    sw_intro: 'बदलाव किसान के अगली बार ऐप खोलने पर लागू — अपडेट की ज़रूरत नहीं। "v1.0.4+" = v1.0.4 और नए ऐप में चलता है।',
    sw_sections: 'हिस्से',
    sw_back: '← सारे हिस्से',
    sw_always: 'हमेशा चालू',
    sw_on: 'चालू', sw_off: 'बंद',
    sw_section_off: 'ये हिस्सा बंद है — इसके अंदर का सब कुछ ऐप में बंद है।',
    sw_off_confirm: '"{s}" बंद करें? इसके अंदर का सब भी बंद होगा: {k}।',
    sw_prices: 'मंडी भाव',
    sw_prices_d: 'ऐप का दिल — हमेशा चालू। अंदर के हिस्से एक-एक करके बंद हो सकते हैं।',
    sw_since: 'v{v}+',
    sw_n_of: '{b} में से {a} चालू',
    sw_states: 'राज्य',
    sw_states_d: 'राज्य चालू = वहाँ के किसान उसे चुन सकते हैं; भाव, मौसम, कैलेंडर और योजनाएँ पूरे राज्य में। ज़िले "Khalihan को बेचें" और "Khalihan Kendra" के अंदर चुने जाते हैं।',
    sw_states_sum: 'खुले: {s}',
    sw_other_states: 'बाकी राज्य ({n})',
    sw_refresh: '↻ डेटा जाँचें',
    sw_mh_locked: 'महाराष्ट्र हमेशा खुला है।',
    sw_data_none: 'अभी भाव नहीं',
    sw_data_ok: 'भाव: {d} · {n} लाइनें',
    sw_data_old: 'आख़िरी भाव: {d}',
    sw_app_full: 'ऐप: तैयार',
    sw_app_soon: 'ऐप: मंडी व नक्शा v1.0.4 से',
    sw_state_confirm_soon: '{s} खोलें? इसकी मंडियाँ, ज़िलों का नक्शा और योजनाएँ ऐप v1.0.4 के साथ आती हैं — पुराने ऐप वाले किसानों को सिर्फ़ भाव, मौसम और कैलेंडर दिखेंगे।',
    sw_waiting: '⏳ {n} इंतज़ार में',
    sw_waiting_total: 'अपने राज्य का इंतज़ार कर रहे किसान (ऐप से): {n}',
    sw_waiting_none: 'अभी किसी किसान ने दूसरा राज्य नहीं माँगा।',
    sw_notice: 'Home पर सूचना',
    sw_notice_d: 'Home के ऊपर एक पट्टी, आपके चुने दिनों में — त्योहार पर मंडी बंद, भाव देर से, या आपके अपने शब्द। किसान इसे हटा सकते हैं; नई सूचना फिर दिखती है। ऐप v1.0.4+।',
    sw_notice_none: 'कोई सूचना नहीं',
    sw_notice_live: 'चालू',
    sw_notice_sched: '{d} से',
    sw_notice_ended: 'ख़त्म',
    sw_n_now: 'अभी ऐप में',
    sw_n_kind: 'प्रकार',
    sw_n_closed: 'मंडी बंद (त्योहार / छुट्टी)',
    sw_n_late: 'आज भाव देर से',
    sw_n_custom: 'मेरे अपने शब्द',
    sw_n_a: 'मंडी बंद, कब से',
    sw_n_b: 'कब तक',
    sw_n_from: 'दिखाना, कब से',
    sw_n_until: 'दिखाना, कब तक',
    sw_n_states: 'किन राज्यों में',
    sw_n_all: 'सभी चालू राज्य',
    sw_n_words: 'आपके शब्द (कम से कम एक भाषा में)',
    sw_n_extra: 'एक और लाइन (चाहें तो), जैसे "दिवाली"',
    sw_n_preview: 'किसान को ऐसे दिखेगा',
    sw_n_save: 'सूचना लगाएँ',
    sw_n_remove: 'सूचना हटाएँ',
    sw_n_remove_q: 'सभी फ़ोन से सूचना हटाएँ?',
    sw_n_saved: 'सूचना लग गई — खुले फ़ोन पर कुछ सेकंड में दिखेगी',
    sw_n_removed: 'सूचना हटा दी',
    sw_n_bad_dates: 'तारीख़ देखें: "कब तक" "कब से" के बाद होनी चाहिए।',
    sw_n_bad_closed: 'मंडी बंद होने का दिन डालें।',
    sw_n_bad_words: 'कम से कम एक भाषा में सूचना लिखें।',
    sw_n_old: 'ऐप v1.0.3 या पुराने वाले फ़ोन पर सूचना नहीं दिखती।',
    sw_fest: 'त्योहार की सजावट',
    sw_fest_d: 'आपके चुने दिनों में Home के हेडर पर रोशनी — शब्दों के पीछे, ऊपर कभी नहीं। ऐप v1.0.4+।',
    sw_fest_none: 'कोई नहीं',
    sw_fest_kind: 'त्योहार',
    sw_fest_diwali: 'दिवाली — रोशनी की लड़ियाँ',
    sw_fest_from: 'कब से',
    sw_fest_until: 'कब तक',
    sw_fest_save: 'सजावट लगाएँ',
    sw_fest_remove: 'सजावट हटाएँ',
    sw_fest_remove_q: 'सभी फ़ोन से सजावट हटाएँ?',
    sw_fest_saved: 'सजावट लग गई — खुले फ़ोन पर कुछ सेकंड में दिखेगी',
    sw_fest_removed: 'सजावट हटा दी',
    sw_fest_bad: 'तारीख़ देखें: "कब तक" "कब से" के बाद होनी चाहिए।',
    sw_fest_more: 'और त्योहार (बैल पोळा, गुढी पाडवा, ईद, होली…) ऐप अपडेट के साथ आएँगे।',
    sw_app_basic: 'ऐप: सिर्फ़ भाव',
    sw_state_confirm: '{s} खोलें? ऐप में अभी इसके सिर्फ़ भाव हैं — मंडी की दूरी, ज़िलों का नक्शा और राज्य की योजनाएँ नहीं। वहाँ के किसानों को भाव, मौसम और कैलेंडर दिखेंगे।',
    sw_state_close: '{s} बंद करें? जिन किसानों ने चुन लिया है उनके पास रहेगा, नए किसान नहीं चुन पाएँगे।',
    sw_server: '🖥️ सर्वर की आख़िरी बार: {t}',
    sw_gov_down: 'सरकारी भाव API (data.gov.in): जवाब नहीं दे रहा ❌ — ताज़ा भाव सिर्फ़ उन राज्यों के जिनका दूसरा स्रोत है।',
    sw_gov_ok: 'सरकारी भाव API (data.gov.in): चल रहा है ✅',
    sw_server_none: '🖥️ सर्वर ने अभी रिपोर्ट नहीं दी।',
    sw_phone: '🖥️ मुंबई कलेक्टर: {n} राज्यों के भाव ✅',
    sw_gov_abroad: 'GitHub (अमेरिका) से सरकारी भाव API: बंद — यह सामान्य है, यह सिर्फ़ भारत के कंप्यूटर को जवाब देता है। भाव मुंबई कलेक्टर लाता है।',
    sw_feed_quiet: '❌ मुंबई कलेक्टर {t} से चुप है — बाकी राज्यों के भाव नहीं आ रहे। Google Cloud → VM instances → SSH → लिखें  ~/bin/khalihan  और जो दिखे Claude को भेजें।',
    sw_via: '{s} से',
    sw_last_err: 'पिछली बार: {e}',
    sw_all_on: 'सब चालू',
    sw_all_off: 'सब बंद',
    sw_dist_loading: 'ताज़ा भाव से ज़िले पढ़ रहे हैं…',
    sw_dist_nodata: 'इस राज्य का अभी भाव नहीं आया — भाव आते ही ज़िले यहाँ दिखेंगे।',
    sw_dist_show: 'ज़िले दिखाएँ',
    sw_saved: 'सेव हो गया — ऐप अगली बार खुलने पर ले लेगा',
    sw_n_dist: '{n} ज़िले',
    sw_no_dist: 'अभी कोई ज़िला नहीं',
    sw_sell_d: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट — सिर्फ़ नीचे के ज़िलों में, और सिर्फ़ उन फ़सलों के लिए जिनका ऑफ़र चालू है (ऑफ़र टैब)।',
    sw_sell_dist: 'ज़िले जहाँ Khalihan ख़रीदता है',
    sw_sell_dist_d: 'किसी ज़िले पर टैप करके वहाँ ख़रीद चालू/बंद करें।',
    sw_sell_none: '⚠️ अभी कोई ज़िला चालू नहीं — किसी किसान को ऑफ़र नहीं दिखेगा।',
    sw_kendra_d: 'Khalihan की बीज-खाद की दुकान: Services में दुकान और Home पर square card। माल, ऑर्डर और slides Kendra टैब में।',
    sw_k_parent: '⚠️ Services टैब बंद है — जब तक Services चालू नहीं, Kendra छिपा रहेगा।',
    sw_k_card: 'Home पर square card',
    sw_k_card_d: 'ऑफ़र, आज का यूरिया/DAP/पोटाश, नया माल, सूचना — slides Kendra टैब → Home card में बनती हैं।',
    sw_k_where: 'दुकान किसे दिखे — ज़िले',
    sw_k_where_d: 'जिन किसानों का ज़िला यहाँ चालू है, उन्हें Kendra दिखेगा।',
    sw_k_none: '⚠️ Kendra का कोई ज़िला नहीं — किसी किसान को नहीं दिखेगा।',
    sw_k_loc: 'जगह',
    sw_k_loc_d: 'किसानों को "रास्ता" बटन के साथ दिखती है। km भरने पर, जिस किसान ने अपना गाँव चुना है उसे Kendra तब दिखेगा जब सड़क से उतनी दूरी में हो — ज़िले की सीमा के पार भी।',
    sw_k_address: 'पता',
    sw_k_point: 'नक्शे पर जगह — "lat, lon" या Google Maps का लिंक',
    sw_k_point_bad: 'इससे भारत की कोई जगह नहीं पढ़ पाए — "20.81, 75.78" या Google Maps का लिंक डालें।',
    sw_k_km: 'सड़क से पहुँच',
    sw_k_km_0: 'सिर्फ़ ज़िले',
    sw_k_map: 'नक्शे पर देखें ↗',
    sw_k_save: 'जगह सेव करें',
    sw_k_more: 'दुकान का नाम, फ़ोन, लाइसेंस, समय → Kendra टैब → Kendra',
    f_price_map: 'भाव का नक्शा', f_price_map_d: '"कहाँ बेचें?" में सूची | नक्शा।',
    f_hold_sell: 'अभी बेचें या रुकें?', f_hold_sell_d: 'रुकने का ख़र्च और ब्रेक-ईवन भाव।',
    f_sell_menu: '"बेचना है?" बटन', f_sell_menu_d: 'फ़सल पेज का हरा बटन और उसके अंदर का सब (ऐप v1.0.6)। बंद = बटन नहीं। अंदर का हर हिस्सा बंद हो तो बटन अपने आप छिप जाता है।',
    f_where_sell: 'कहाँ बेचें?', f_where_sell_d: 'भाड़े के बाद किस मंडी में सबसे ज़्यादा हाथ में — हरे बटन में, Home के बटन में, तुलना पेज की सबसे अच्छी मंडी में और टारगेट की ख़ुशी वाली स्क्रीन में।',
    f_sell_interest: 'कितना बेचना है?', f_sell_interest_d: 'जो फ़सल Khalihan अभी नहीं ख़रीदता, उसकी मात्रा का फ़ॉर्म — इससे पता चलता है कहाँ बेचने की माँग है।',
    f_target: 'लक्ष्य भाव (टारगेट)', f_target_d: 'फ़सल पेज के टारगेट रिंग, "टारगेट पूरा" अलर्ट और ख़ुशी वाली स्क्रीन (ऐप v1.0.6)। बंद = तीनों छिप जाते हैं; सेव टारगेट फ़ोन में रहते हैं।',
    f_plus: 'Khalihan Plus', f_plus_d: 'पैसे वाला प्लान। बंद = कुछ भी लॉक नहीं, सब पहले जैसा मुफ़्त। ⚠️ जब तक Plus ख़रीदा न जा सके (Google Play Billing, अगला ऐप अपडेट) तब तक बंद रखें — अभी चालू = नीचे के फ़ीचर सबके लिए लॉक हो जाएँगे और कोई खोल नहीं पाएगा।',
    f_plus_target: 'टारगेट भाव Plus में', f_plus_target_d: 'Plus चालू हो तो: बिना Plus वाले किसान को टारगेट रिंग लॉक (🔒 Plus) दिखेंगे और टारगेट अलर्ट नहीं आएगा।',
    f_day_voice: 'आज का भाव सुनें', f_day_voice_d: 'Home का बटन और सुबह के मैसेज का "सुनें" बटन।',
    f_share_picture: 'भाव की फ़ोटो भेजें', f_share_picture_d: 'बंद = Share सीधे WhatsApp मैसेज भेजेगा।',
    f_alerts: 'भाव अलर्ट', f_alerts_d: 'फ़सल पेज की घंटी और "भाव बदला / टारगेट पूरा" अलर्ट। बंद = न घंटी, न अलर्ट।',
    f_brief: 'सुबह का मैसेज', f_brief_d: 'सुबह 6–8 बजे किसान की फ़सलों और मौसम वाला मैसेज। बंद = मैसेज नहीं, और Profile में उसका स्विच भी छिप जाएगा।',
    f_weather: 'मौसम', f_weather_d: 'Home का मौसम कार्ड, मौसम पेज और ओले / तूफ़ान / लू की चेतावनी।',
    f_calendar: 'फ़सल कैलेंडर', f_calendar_d: 'Home का बटन, फ़सल पेज की टाइल, "इस हफ़्ते खेत में" और हफ़्ते का खेत रिमाइंडर।',
    f_services: 'Services टैब', f_services_d: 'नीचे की पट्टी का Services टैब। बंद = टैब छिप जाएगा, और योजनाएँ व Kendra भी।',
    f_schemes: 'सरकारी योजनाएँ', f_schemes_d: 'Services में योजनाओं का कार्ड।',
    f_sell: 'Khalihan को बेचें', f_sell_d: 'ऑफ़र कार्ड और बेचने की रिक्वेस्ट।',
    f_login: 'मोबाइल OTP लॉग इन', f_login_d: '"मेरा खाता" और बेचने से पहले OTP। हर SMS का पैसा लगता है (लगभग ₹6) — चालू करने से पहले admin README का भाग D पूरा करें (Blaze, Phone sign-in, SHA)।',
    f_feedback: 'सुझाव', f_feedback_d: 'Profile और Services में "सुझाव दें"।',
    f_home_sky: 'हेडर में जीता-जागता आसमान', f_home_sky_d: 'Home, My Crops और Services के हेडर में खेत का अपना आसमान — सुबह, दिन, शाम, रात, बादल, बारिश — तापमान के साथ। बंद = सादे नेवी हेडर। अंदर के पेजों पर छोटा मौसम चिप Weather स्विच से चलता है।',
    f_advice: 'खेती की सलाह', f_advice_d: 'Home और मौसम पेज पर "खेती की सलाह" कार्ड और उसका पेज: छिड़काव, सिंचाई, कटाई, अगले 3 दिन। बंद = सलाह कार्ड नहीं दिखेगा।',
    f_widget_weather: 'बड़े विजेट पर मौसम', f_widget_weather_d: 'होम-स्क्रीन विजेट 4x3 या बड़ा हो तो ऊपर आज का मौसम और छिड़काव / बारिश की लाइन (ऐप v1.0.5)। बंद = सिर्फ़ फसलें।',
    f_dark: 'डार्क मोड', f_dark_d: 'सूर्यास्त के बाद ऐप अपने आप डार्क, सूर्योदय पर लाइट (खेत के हिसाब से); या किसान Profile → ऐप का रंग में तय करे (ऐप v1.0.5)। बंद = सबके लिए हमेशा लाइट, Profile की लाइन छिप जाती है।',
  },
};
SWITCH_WORDS.en.f_kendra = KENDRA_WORDS.en.feat_kendra;
SWITCH_WORDS.hi.f_kendra = KENDRA_WORDS.hi.feat_kendra;

/** Every switch the app reads: its default and the first app version that reads it. */
export const FEATURE_INFO = {
  price_map: { def: true, since: '1.0.3' },
  hold_sell: { def: true, since: '1.0.3' },
  day_voice: { def: true, since: '1.0.3' },
  share_picture: { def: true, since: '1.0.3' },
  alerts: { def: true, since: '1.0.4' },
  brief: { def: true, since: '1.0.4' },
  weather: { def: true, since: '1.0.4' },
  calendar: { def: true, since: '1.0.3' },
  services: { def: true, since: '1.0.4' },
  schemes: { def: true, since: '1.0.3' },
  kendra: { def: false, since: '1.0.4' },
  sell: { def: false, since: '1.0.3' },
  login: { def: false, since: '1.0.3' },
  feedback: { def: true, since: '1.0.4' },
  home_sky: { def: true, since: '1.0.4' },
  advice: { def: true, since: '1.0.4' },
  widget_weather: { def: true, since: '1.0.5' },
  dark: { def: true, since: '1.0.5' },
  sell_menu: { def: true, since: '1.0.6' },
  where_sell: { def: true, since: '1.0.6' },
  sell_interest: { def: true, since: '1.0.6' },
  target: { def: true, since: '1.0.6' },
  plus: { def: false, since: '1.0.6' },
  plus_target: { def: true, since: '1.0.6' },
};

/** The sections, in order. `kind` picks a special settings panel. */
const SECTIONS = [
  { id: 'states', icon: '📍', kind: 'states' },
  { id: 'notice', icon: '📣', kind: 'notice' },
  { id: 'festival', icon: '🪔', kind: 'festival' },
  { id: 'prices', icon: '📈', master: null, kids: ['day_voice', 'share_picture', 'alerts', 'target', 'brief'] },
  { id: 'sellmenu', icon: '🛒', master: 'sell_menu', kids: ['where_sell', 'price_map', 'hold_sell', 'sell_interest'] },
  { id: 'weather', icon: '🌦️', master: 'weather', kids: ['home_sky', 'advice', 'widget_weather'] },
  { id: 'calendar', icon: '🌱', master: 'calendar', kids: [] },
  { id: 'services', icon: '🏛️', master: 'services', kids: ['schemes'] },
  { id: 'kendra', icon: '🏪', master: 'kendra', kind: 'kendra' },
  { id: 'sell', icon: '🤝', master: 'sell', kind: 'sell' },
  { id: 'plus', icon: '⭐', master: 'plus', kids: ['plus_target'] },
  { id: 'login', icon: '👤', master: 'login', kids: [] },
  { id: 'feedback', icon: '💬', master: 'feedback', kids: [] },
  { id: 'dark', icon: '🌙', master: 'dark', kids: [] },
];

/** States as the government price data names them (same list as the app). */
export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'NCT of Delhi', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
const STATE_HI = {
  'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश', Assam: 'असम', Bihar: 'बिहार',
  Chandigarh: 'चंडीगढ़', Chhattisgarh: 'छत्तीसगढ़', Goa: 'गोवा', Gujarat: 'गुजरात', Haryana: 'हरियाणा',
  'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jammu and Kashmir': 'जम्मू और कश्मीर', Jharkhand: 'झारखंड',
  Karnataka: 'कर्नाटक', Kerala: 'केरल', 'Madhya Pradesh': 'मध्य प्रदेश', Maharashtra: 'महाराष्ट्र',
  Manipur: 'मणिपुर', Meghalaya: 'मेघालय', Mizoram: 'मिज़ोरम', Nagaland: 'नागालैंड', 'NCT of Delhi': 'दिल्ली',
  Odisha: 'ओडिशा', Punjab: 'पंजाब', Rajasthan: 'राजस्थान', Sikkim: 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु',
  Telangana: 'तेलंगाना', Tripura: 'त्रिपुरा', 'Uttar Pradesh': 'उत्तर प्रदेश', Uttarakhand: 'उत्तराखंड',
  'West Bengal': 'पश्चिम बंगाल',
};

/** How much of a state the app knows beyond its prices (mandi towns, map, schemes). */
// MP's pack is in app v1.0.4 (not on Play yet, 20 Oct 2026): 'full' once it is.
const APP_READY = { Maharashtra: 'full', 'Madhya Pradesh': 'soon' };

/** The ready-made notices, word for word as the app writes them (lib/l10n
 *  strings notice_closed / notice_late) — for the preview. */
const NOTICE_TEXT = {
  closed: {
    en: 'Many mandis are closed {d} — no new prices for those days.',
    hi: '{d} कई मंडियाँ बंद रहेंगी — इन दिनों के भाव नहीं आएँगे।',
    mr: '{d} अनेक बाजार समित्या बंद राहतील — या दिवसांचे भाव येणार नाहीत.',
  },
  late: {
    en: 'Today\'s prices are coming late — check again in a few hours.',
    hi: 'आज के भाव देर से आ रहे हैं — कुछ घंटों बाद फिर देखें।',
    mr: 'आजचे भाव उशिरा येत आहेत — काही तासांनी पुन्हा पाहा.',
  },
};
const NOTICE_LANGS = [['hi', 'हिंदी'], ['mr', 'मराठी'], ['en', 'English']];

/** "08–10 Nov", as the app writes it (AppNotice.days); a and b are "YYYY-MM-DD". */
export function noticeDays(a, b) {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = (x) => String(x).split('-').map(Number);
  const [ya, ma, da] = parts(a);
  const [yb, mb, db] = parts(b || a);
  const two = (n) => String(n).padStart(2, '0');
  const one = (d, m) => `${two(d)} ${M[m - 1]}`;
  if (ya === yb && ma === mb && da === db) return one(da, ma);
  if (ya === yb && ma === mb) return `${two(da)}–${one(db, mb)}`;
  return `${one(da, ma)} – ${one(db, mb)}`;
}
const todayIst = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/** Maharashtra's districts, with the keys the app uses (lib/data/mandi_places.dart). */
const MH_DISTRICTS = [
  ['ahmednagar', 'Ahmednagar (Ahilyanagar)'], ['akola', 'Akola'], ['amravati', 'Amravati'],
  ['aurangabad', 'Aurangabad (Chh. Sambhajinagar)'], ['beed', 'Beed'], ['bhandara', 'Bhandara'],
  ['buldhana', 'Buldhana'], ['chandrapur', 'Chandrapur'], ['dhule', 'Dhule'], ['gadchiroli', 'Gadchiroli'],
  ['gondia', 'Gondia'], ['hingoli', 'Hingoli'], ['jalgaon', 'Jalgaon'], ['jalna', 'Jalna'],
  ['kolhapur', 'Kolhapur'], ['latur', 'Latur'], ['mumbai', 'Mumbai'], ['nagpur', 'Nagpur'], ['nanded', 'Nanded'],
  ['nandurbar', 'Nandurbar'], ['nashik', 'Nashik'], ['osmanabad', 'Osmanabad (Dharashiv)'], ['palghar', 'Palghar'],
  ['parbhani', 'Parbhani'], ['pune', 'Pune'], ['raigad', 'Raigad'], ['ratnagiri', 'Ratnagiri'], ['sangli', 'Sangli'],
  ['satara', 'Satara'], ['sindhudurg', 'Sindhudurg'], ['solapur', 'Solapur'], ['thane', 'Thane'],
  ['wardha', 'Wardha'], ['washim', 'Washim'], ['yavatmal', 'Yavatmal'],
];

const SOURCE_NAME = { 'data.gov.in': 'data.gov.in', msamb: 'MSAMB', enam: 'eNAM', phone: 'data.gov.in · 📱' };
const KM_CHOICES = [0, 10, 15, 25, 40, 60];

/** The server's document name for a state ("NCT of Delhi" → "nct_of_delhi"). */
export const stateSlug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

/** A district name from the price data → the key the app compares
 *  (MandiGeo.districtKey without Maharashtra's spelling table). */
export const districtKey = (d) => String(d).replace(/\([^)]*\)/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** "20.81, 75.78" or a Google Maps link → {lat, lon} inside India, else null. */
export function parsePoint(text) {
  const t = String(text || '').trim();
  const m = t.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
    || t.match(/[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i)
    || t.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    || t.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{2,3}(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const lat = Number(m[1]), lon = Number(m[2]);
  if (!(lat > 6 && lat < 38 && lon > 68 && lon < 98)) return null;
  return { lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5 };
}

export function createSwitches(c) {
  const { tr, esc, toast, fail, setMain } = c;
  const memo = { status: null, server: null, districts: {}, openStates: new Set(['Maharashtra']), sel: null, moreOpen: false };
  let data = null; // { features, launch, sell, kinfo, kcard }

  const wide = () => window.matchMedia('(min-width: 900px)').matches;
  const featOn = (key) => (typeof data.features[key] === 'boolean' ? data.features[key] : FEATURE_INFO[key].def);
  const stateName = (s) => (c.lang() === 'hi' && STATE_HI[s] ? STATE_HI[s] : s);
  const sinceChip = (key) => (FEATURE_INFO[key].since === '1.0.3' ? '' : `<span class="chip swver">${tr('sw_since', { v: FEATURE_INFO[key].since })}</span>`);
  const shortDay = (d) => d.toLocaleDateString(c.lang() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  const openStates = () => ['Maharashtra', ...STATES.filter((s) => s !== 'Maharashtra' && data.launch.includes(s))];
  const kendraDistricts = () => (Array.isArray(data.kinfo.districts) ? data.kinfo.districts : (Object.keys(data.kinfo).length ? ['jalgaon'] : []));
  const nameOfDistrict = (k) => {
    const mh = MH_DISTRICTS.find(([key]) => key === k);
    if (mh) return mh[1].replace(/ \(.*\)$/, '');
    for (const list of Object.values(memo.districts)) {
      const hit = (list || []).find(([key]) => key === k);
      if (hit) return hit[1];
    }
    return k.charAt(0).toUpperCase() + k.slice(1);
  };
  const toggle = (attr, key, on, extra = '') =>
    `<button class="kswitch${on ? ' on' : ''}" ${attr}="${esc(key)}" aria-pressed="${on}" ${extra}><span class="knob"></span>${on ? tr('sw_on') : tr('sw_off')}</button>`;

  // ── the list of sections ──────────────────────────────────────────────
  function sectionTitle(s) {
    if (s.kind === 'states') return tr('sw_states');
    if (s.kind === 'notice') return tr('sw_notice');
    if (s.kind === 'festival') return tr('sw_fest');
    return s.master ? tr('f_' + s.master) : tr('sw_prices');
  }

  /** One line under a section's name: what is on. */
  function noticeState(n) {
    if (!n || !n.from || !n.until) return null;
    const today = todayIst();
    if (n.until < today) return 'ended';
    return n.from > today ? 'sched' : 'live';
  }
  function summary(s) {
    if (s.kind === 'festival') {
      const f = data.festival;
      const st = noticeState(f);
      if (!st || st === 'ended') return esc(tr('sw_fest_none'));
      return esc(`${tr('sw_fest_' + f.kind)} · ${noticeDays(f.from, f.until)}`);
    }
    if (s.kind === 'notice') {
      const n = data.notice;
      const st = noticeState(n);
      if (!st || st === 'ended') return esc(tr('sw_notice_none'));
      return esc(`${tr('sw_n_' + n.kind)} · ${noticeDays(n.from, n.until)}`);
    }
    if (s.kind === 'states') {
      const list = openStates().map(stateName).join(', ');
      return esc(tr('sw_states_sum', { s: list }));
    }
    if (!s.master) {
      const on = s.kids.filter(featOn).length;
      return esc(tr('sw_n_of', { a: on, b: s.kids.length }));
    }
    if (s.kind === 'kendra') {
      const n = kendraDistricts().length;
      const km = Number(data.kinfo.km) || 0;
      return esc([n ? tr('sw_n_dist', { n }) : tr('sw_no_dist'), km ? `${km} km` : ''].filter(Boolean).join(' · '));
    }
    if (s.kind === 'sell') {
      const n = Object.values(data.sell).reduce((a, l) => a + (l || []).length, 0);
      return esc(n ? tr('sw_n_dist', { n }) : tr('sw_no_dist'));
    }
    if (s.kids && s.kids.length) return esc(s.kids.map((k) => `${tr('f_' + k)}: ${featOn(k) ? tr('sw_on') : tr('sw_off')}`).join(' · '));
    return esc(tr('f_' + s.master + '_d')).slice(0, 90);
  }

  function statePill(s) {
    if (s.kind === 'states') return `<span class="pill info">${openStates().length}</span>`;
    if (s.kind === 'festival') {
      const st = noticeState(data.festival);
      if (st === 'live') return `<span class="pill on">${tr('sw_notice_live')}</span>`;
      if (st === 'sched') return `<span class="pill info">${esc(tr('sw_notice_sched', { d: noticeDays(data.festival.from) }))}</span>`;
      return `<span class="pill off">${tr('sw_off')}</span>`;
    }
    if (s.kind === 'notice') {
      const st = noticeState(data.notice);
      if (st === 'live') return `<span class="pill on">${tr('sw_notice_live')}</span>`;
      if (st === 'sched') return `<span class="pill info">${esc(tr('sw_notice_sched', { d: noticeDays(data.notice.from) }))}</span>`;
      return `<span class="pill off">${tr('sw_off')}</span>`;
    }
    if (!s.master) return `<span class="pill on">${tr('sw_always')}</span>`;
    const on = featOn(s.master) && (s.id !== 'kendra' || featOn('services'));
    const warn = on && ((s.kind === 'kendra' && !kendraDistricts().length && !Number(data.kinfo.km))
      || (s.kind === 'sell' && !Object.values(data.sell).some((l) => (l || []).length)));
    return `<span class="pill ${on ? (warn ? 'warn' : 'on') : 'off'}">${on ? (warn ? '⚠️ ' : '') + tr('sw_on') : tr('sw_off')}</span>`;
  }

  function listHtml() {
    return `<nav class="swlist" aria-label="${esc(tr('sw_sections'))}">
      ${SECTIONS.map((s) => `<button class="swrow${memo.sel === s.id ? ' sel' : ''}" data-sec="${s.id}">
        <span class="swicon" aria-hidden="true">${s.icon}</span>
        <span class="grow"><span class="swrt">${esc(sectionTitle(s))}</span><span class="swrs">${summary(s)}</span></span>
        ${statePill(s)}<span class="chev" aria-hidden="true">›</span>
      </button>`).join('')}
    </nav>`;
  }

  // ── settings of one section ───────────────────────────────────────────
  function head(s, desc) {
    const master = s.master ? toggle('data-master', s.master, featOn(s.master)) : `<span class="pill on">${tr('sw_always')}</span>`;
    return `<div class="swdh">
      <span class="swicon big" aria-hidden="true">${s.icon}</span>
      <div class="grow"><h2>${esc(sectionTitle(s))} ${s.master ? sinceChip(s.master) : ''}</h2><p class="sub">${esc(desc)}</p></div>
      ${s.kind === 'states' || s.kind === 'notice' || s.kind === 'festival' ? '' : master}
    </div>`;
  }

  function kidRow(key, sectionOn) {
    const on = featOn(key);
    return `<label class="swkid${sectionOn ? '' : ' dim'}">
      <input type="checkbox" data-feature="${key}" ${on ? 'checked' : ''} ${sectionOn ? '' : 'disabled'}>
      <div class="grow"><div class="swkt">${esc(tr('f_' + key))} ${sinceChip(key)}</div><div class="sub">${esc(tr('f_' + key + '_d'))}</div></div>
    </label>`;
  }

  function featureDetail(s) {
    const masterOn = s.master ? featOn(s.master) : true;
    const desc = s.master ? tr('f_' + s.master + '_d') : tr('sw_prices_d');
    return `${head(s, desc)}
      ${s.kids.length ? `<div class="swblock">
        ${masterOn ? '' : `<p class="small muted">${tr('sw_section_off')}</p>`}
        ${s.kids.map((k) => kidRow(k, masterOn)).join('')}
      </div>` : ''}`;
  }

  // ── States ──
  function statusChip(state) {
    const st = memo.status && memo.status[state];
    if (!st || !st.rows) return `<span class="chip swdata none">${tr('sw_data_none')}</span>`;
    const fresh = st.at instanceof Date && Date.now() - st.at.getTime() < 36 * 3600e3;
    const day = st.at instanceof Date ? shortDay(st.at) : '—';
    return fresh
      ? `<span class="chip swdata ok">${tr('sw_data_ok', { d: day, n: Number(st.rows).toLocaleString('en-IN') })}</span>`
      : `<span class="chip swdata old">${tr('sw_data_old', { d: day })}</span>`;
  }
  const serverRun = (state) => (memo.server && memo.server.states ? memo.server.states[state] : null);
  function sourceChip(state) {
    const run = serverRun(state);
    return run && run.rows && run.source ? `<span class="chip swsrc">${tr('sw_via', { s: SOURCE_NAME[run.source] || run.source })}</span>` : '';
  }
  function lastError(state) {
    const run = serverRun(state);
    if (!run || run.rows || !run.error) return '';
    return `<div class="small swerr">${esc(tr('sw_last_err', { e: run.error }))}</div>`;
  }
  function appChip(state) {
    const r = APP_READY[state];
    return `<span class="chip swapp ${r || 'basic'}">${tr(r === 'full' ? 'sw_app_full' : r === 'soon' ? 'sw_app_soon' : 'sw_app_basic')}</span>`;
  }
  function serverLine() {
    const sv = memo.server;
    if (!sv) return `<p class="small muted">${tr('sw_server_none')}</p>`;
    const fmtWhen = (d) => d.toLocaleString(c.lang() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const t = sv.at instanceof Date ? fmtWhen(sv.at) : '—';
    const phone = sv.phone_states > 0 ? `<br>${esc(tr('sw_phone', { n: sv.phone_states }))}` : '';
    // The collector uploads 5 times a day; over 12 hours without a new
    // upload means its schedule stopped (23 Oct 2026: cron was never set).
    const feedAt = sv.feed_at ? new Date(sv.feed_at) : null;
    const quiet = sv.gov_api_down && (!feedAt || isNaN(feedAt) || Date.now() - feedAt.getTime() > 12 * 3600e3);
    const quietLine = quiet
      ? `<br><b>${esc(tr('sw_feed_quiet', { t: feedAt && !isNaN(feedAt) ? fmtWhen(feedAt) : '—' }))}</b>`
      : '';
    // With the Mumbai collector working, GitHub being refused by data.gov.in
    // is expected (it answers only Indian IPs) — say so instead of a red cross.
    const gov = !sv.gov_api_down ? 'sw_gov_ok' : phone && !quiet ? 'sw_gov_abroad' : 'sw_gov_down';
    return `<div class="swserver ${sv.gov_api_down && (!phone || quiet) ? 'down' : 'up'}"><b>${esc(tr('sw_server', { t }))}</b><br>${esc(tr(gov))}${phone}${quietLine}</div>`;
  }
  function waitChip(state) {
    const n = memo.waiting && memo.waiting[state];
    return n ? `<span class="chip swwait">${esc(tr('sw_waiting', { n: Number(n).toLocaleString('en-IN') }))}</span>` : '';
  }
  function waitingLine() {
    const w = memo.waiting;
    if (!w) return '';
    if (!w._total) return `<p class="small muted">${tr('sw_waiting_none')}</p>`;
    const top = Object.entries(w).filter(([k]) => k !== '_total').sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([k, n]) => `${esc(stateName(k))} ${Number(n).toLocaleString('en-IN')}`).join(' · ');
    return `<p class="small"><b>${esc(tr('sw_waiting_total', { n: Number(w._total).toLocaleString('en-IN') }))}</b>${top ? ` — ${top}` : ''}</p>`;
  }
  function stateRow(state, open) {
    const mh = state === 'Maharashtra';
    return `<div class="swstate${open ? ' on' : ''}">
      <button class="kswitch small${open ? ' on' : ''}" data-state="${esc(state)}" aria-pressed="${open}" aria-label="${esc(stateName(state))}" ${mh ? `disabled title="${esc(tr('sw_mh_locked'))}"` : ''}><span class="knob"></span></button>
      <div class="grow"><div class="swkt">${esc(stateName(state))}</div>
        <div class="row swchips">${statusChip(state)} ${sourceChip(state)} ${appChip(state)} ${waitChip(state)}</div>
        ${open ? lastError(state) : ''}</div>
    </div>`;
  }
  function statesDetail(s) {
    const open = openStates();
    const rest = STATES.filter((x) => !open.includes(x));
    return `${head(s, tr('sw_states_d'))}
      <div class="swblock">
        <div class="row between" style="margin-bottom:8px">${serverLine()}</div>
        ${waitingLine()}
        <div class="row" style="justify-content:flex-end;margin:-4px 0 6px"><button class="plain small" id="sw-refresh">${tr('sw_refresh')}</button></div>
        ${open.map((x) => stateRow(x, true)).join('')}
        <details class="swmore"${memo.moreOpen ? ' open' : ''}><summary>${tr('sw_other_states', { n: rest.length })}</summary>
          ${rest.map((x) => stateRow(x, false)).join('')}
        </details>
      </div>`;
  }

  // ── district chips, used by Sell (per state) and by the Kendra ──
  function districtChips(scope, state, onSet) {
    const list = state === 'Maharashtra' ? MH_DISTRICTS : memo.districts[state];
    const header = `<div class="row between swdsh"><b>${esc(stateName(state))}</b>
      ${list && list.length ? `<span class="row" style="gap:6px">
        <button class="plain small" data-dall="${scope}" data-dstate="${esc(state)}" data-v="1">${tr('sw_all_on')}</button>
        <button class="plain small" data-dall="${scope}" data-dstate="${esc(state)}" data-v="0">${tr('sw_all_off')}</button></span>` : ''}</div>`;
    if (state !== 'Maharashtra' && !memo.openStates.has(state)) {
      return `${header}<button class="plain small" data-dload="${esc(state)}">${tr('sw_dist_show')}</button>`;
    }
    if (list === undefined) return `${header}<p class="small muted">${tr('sw_dist_loading')}</p>`;
    if (!list.length) return `${header}<p class="small muted">${tr('sw_dist_nodata')}</p>`;
    return `${header}<div class="dchips">${list.map(([k, name]) =>
      `<button class="dchip${onSet.has(k) ? ' on' : ''}" data-dscope="${scope}" data-dstate="${esc(state)}" data-d="${esc(k)}" aria-pressed="${onSet.has(k)}">${onSet.has(k) ? '✓ ' : ''}${esc(name)}</button>`).join('')}</div>`;
  }

  // ── Sell to Khalihan ──
  function sellDetail(s) {
    const any = Object.values(data.sell).some((l) => (l || []).length);
    return `${head(s, tr('sw_sell_d'))}
      <div class="swblock">
        <h3>${tr('sw_sell_dist')}</h3>
        <p class="small muted">${tr('sw_sell_dist_d')}</p>
        ${any ? '' : `<p class="small swnote warn">${tr('sw_sell_none')}</p>`}
        ${openStates().map((st) => `<div class="swdgroup">${districtChips('sell', st, new Set(data.sell[st] || []))}</div>`).join('')}
      </div>`;
  }

  // ── Khalihan Kendra ──
  function kendraDetail(s) {
    const k = data.kinfo;
    const kd = new Set(kendraDistricts());
    const km = Number(k.km) || 0;
    const point = k.lat != null && k.lon != null ? `${k.lat}, ${k.lon}` : '';
    const mapUrl = point ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}` : '';
    return `${head(s, tr('sw_kendra_d'))}
      ${featOn('services') ? '' : `<p class="note">${tr('sw_k_parent')}</p>`}
      <div class="swblock">
        <div class="swline">
          <div class="grow"><div class="swkt">${tr('sw_k_card')}</div><div class="sub">${tr('sw_k_card_d')}</div></div>
          ${toggle('data-kcard', 'on', data.kcard.on === true)}
        </div>
      </div>
      <div class="swblock">
        <h3>${tr('sw_k_where')}</h3>
        <p class="small muted">${tr('sw_k_where_d')}</p>
        ${kd.size || km ? '' : `<p class="small swnote warn">${tr('sw_k_none')}</p>`}
        ${openStates().map((st) => `<div class="swdgroup">${districtChips('kendra', st, kd)}</div>`).join('')}
      </div>
      <div class="swblock">
        <h3>${tr('sw_k_loc')}</h3>
        <p class="small muted">${tr('sw_k_loc_d')}</p>
        <div class="form">
          <div class="wide"><label for="kl-address">${tr('sw_k_address')}</label><input id="kl-address" maxlength="120" value="${esc(k.address || '')}"></div>
          <div class="wide"><label for="kl-point">${tr('sw_k_point')}</label><input id="kl-point" value="${esc(point)}" placeholder="20.81, 75.78"></div>
          <div><label for="kl-km">${tr('sw_k_km')}</label><select id="kl-km">${KM_CHOICES.map((n) => `<option value="${n}" ${n === km ? 'selected' : ''}>${n ? `${n} km` : tr('sw_k_km_0')}</option>`).join('')}${KM_CHOICES.includes(km) ? '' : `<option value="${km}" selected>${km} km</option>`}</select></div>
        </div>
        <div class="actions"><button class="main" id="kl-save">${tr('sw_k_save')}</button>${mapUrl ? `<a class="btnlink" href="${mapUrl}" target="_blank" rel="noopener">${tr('sw_k_map')}</a>` : ''}</div>
      </div>
      <p class="small muted">${tr('sw_k_more')}</p>`;
  }

  // ── Notice on Home ──
  function noticeDraft() {
    if (memo.nf) return memo.nf;
    const n = data.notice;
    const live = noticeState(n);
    const today = todayIst();
    memo.nf = live && live !== 'ended'
      ? { kind: n.kind, a: n.a || today, b: n.b || n.a || today, from: n.from, until: n.until, states: new Set(n.states || []), text: { ...(n.text || {}) } }
      : { kind: 'closed', a: today, b: today, from: today, until: today, states: new Set(), text: {} };
    return memo.nf;
  }
  function noticePreview(d) {
    const days = noticeDays(d.a, d.b);
    return NOTICE_LANGS.map(([lang, label]) => {
      const main = d.kind === 'custom'
        ? (d.text[lang] || '').trim()
        : NOTICE_TEXT[d.kind][lang].replace('{d}', days);
      const extra = d.kind === 'custom' ? '' : (d.text[lang] || '').trim();
      if (!main) return '';
      return `<div class="nprev"><span class="small muted">${label}</span><div class="nstrip"><b>📣 ${esc(main)}</b>${extra ? `<br><span class="small">${esc(extra)}</span>` : ''}</div></div>`;
    }).join('') || `<p class="small muted">${tr('sw_n_bad_words')}</p>`;
  }
  function noticeDetail(s) {
    const d = noticeDraft();
    const n = data.notice;
    const st = noticeState(n);
    const open = openStates();
    const now = st && st !== 'ended'
      ? `<div class="swblock"><h3>${tr('sw_n_now')} · <span class="pill ${st === 'live' ? 'on' : 'info'}">${st === 'live' ? tr('sw_notice_live') : esc(tr('sw_notice_sched', { d: noticeDays(n.from) }))}</span></h3>
          <p class="small">${esc(tr('sw_n_' + n.kind))} · ${esc(noticeDays(n.from, n.until))} · ${esc((n.states || []).length ? (n.states || []).map(stateName).join(', ') : tr('sw_n_all'))}</p>
          <div class="actions"><button class="danger" id="n-remove">${tr('sw_n_remove')}</button></div></div>`
      : '';
    return `${head(s, tr('sw_notice_d'))}
      ${now}
      <div class="swblock">
        <div class="form">
          <div class="wide"><label for="n-kind">${tr('sw_n_kind')}</label><select id="n-kind">
            ${['closed', 'late', 'custom'].map((k) => `<option value="${k}" ${d.kind === k ? 'selected' : ''}>${esc(tr('sw_n_' + k))}</option>`).join('')}
          </select></div>
          <div data-nclosed ${d.kind === 'closed' ? '' : 'hidden'}><label for="n-a">${tr('sw_n_a')}</label><input type="date" id="n-a" value="${esc(d.a)}"></div>
          <div data-nclosed ${d.kind === 'closed' ? '' : 'hidden'}><label for="n-b">${tr('sw_n_b')}</label><input type="date" id="n-b" value="${esc(d.b)}"></div>
          <div><label for="n-from">${tr('sw_n_from')}</label><input type="date" id="n-from" value="${esc(d.from)}"></div>
          <div><label for="n-until">${tr('sw_n_until')}</label><input type="date" id="n-until" value="${esc(d.until)}"></div>
        </div>
        <h3>${tr('sw_n_states')}</h3>
        <label class="swkid"><input type="checkbox" id="n-all" ${d.states.size ? '' : 'checked'}><div class="grow"><div class="swkt">${tr('sw_n_all')}</div></div></label>
        ${open.map((x) => `<label class="swkid${d.states.size ? '' : ' dim'}"><input type="checkbox" data-nstate="${esc(x)}" ${d.states.has(x) ? 'checked' : ''} ${d.states.size ? '' : 'disabled'}><div class="grow"><div class="swkt">${esc(stateName(x))}</div></div></label>`).join('')}
        <h3 id="n-words-h">${d.kind === 'custom' ? tr('sw_n_words') : tr('sw_n_extra')}</h3>
        <div class="form">
          ${NOTICE_LANGS.map(([lang, label]) => `<div class="wide"><label for="n-t-${lang}">${label}</label><textarea id="n-t-${lang}" maxlength="240" rows="2">${esc(d.text[lang] || '')}</textarea></div>`).join('')}
        </div>
        <h3>${tr('sw_n_preview')}</h3>
        <div id="n-preview">${noticePreview(d)}</div>
        <p class="small muted">${tr('sw_n_old')}</p>
        <div class="actions"><button class="main" id="n-save">${tr('sw_n_save')}</button></div>
      </div>`;
  }

  // ── Festival look ──
  function festivalDetail(s) {
    const f = data.festival;
    const st = noticeState(f);
    const today = todayIst();
    const plus6 = new Date(Date.now() + 6 * 86400e3).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const d = st && st !== 'ended' ? f : { kind: 'diwali', from: today, until: plus6 };
    const now = st && st !== 'ended'
      ? `<div class="swblock"><h3>${tr('sw_n_now')} · <span class="pill ${st === 'live' ? 'on' : 'info'}">${st === 'live' ? tr('sw_notice_live') : esc(tr('sw_notice_sched', { d: noticeDays(f.from) }))}</span></h3>
          <p class="small">${esc(tr('sw_fest_' + f.kind))} · ${esc(noticeDays(f.from, f.until))}</p>
          <div class="actions"><button class="danger" id="f-remove">${tr('sw_fest_remove')}</button></div></div>`
      : '';
    return `${head(s, tr('sw_fest_d'))}
      ${now}
      <div class="swblock">
        <div class="form">
          <div class="wide"><label for="f-kind">${tr('sw_fest_kind')}</label><select id="f-kind">
            <option value="diwali" ${d.kind === 'diwali' ? 'selected' : ''}>${esc(tr('sw_fest_diwali'))}</option>
          </select></div>
          <div><label for="f-from">${tr('sw_fest_from')}</label><input type="date" id="f-from" value="${esc(d.from)}"></div>
          <div><label for="f-until">${tr('sw_fest_until')}</label><input type="date" id="f-until" value="${esc(d.until)}"></div>
        </div>
        <p class="small muted">${tr('sw_fest_more')}</p>
        <p class="small muted">${tr('sw_n_old')}</p>
        <div class="actions"><button class="main" id="f-save">${tr('sw_fest_save')}</button></div>
      </div>`;
  }

  function detailHtml() {
    const s = SECTIONS.find((x) => x.id === memo.sel) || SECTIONS[0];
    const body = s.kind === 'states' ? statesDetail(s) : s.kind === 'notice' ? noticeDetail(s) : s.kind === 'festival' ? festivalDetail(s) : s.kind === 'kendra' ? kendraDetail(s) : s.kind === 'sell' ? sellDetail(s) : featureDetail(s);
    return `<section class="card swdetail">${wide() ? '' : `<button class="plain small swback" id="sw-back">${tr('sw_back')}</button>`}${body}</section>`;
  }

  // ── loading ───────────────────────────────────────────────────────────
  async function loadStatus(force) {
    if (memo.status && !force) return;
    const [live, server, waiting] = await Promise.all([
      c.db().liveStatus(STATES.map((s) => [s, stateSlug(s)])).catch((e) => { console.warn(e); return {}; }),
      (c.db().serverStatus ? c.db().serverStatus() : Promise.resolve(null)).catch(() => null),
      // Needs the 20 Oct rules (waiting/); before the deploy this just shows nothing.
      (c.db().waitingCounts ? c.db().waitingCounts(STATES) : Promise.resolve(null)).catch(() => null),
    ]);
    memo.status = live;
    memo.server = server;
    memo.waiting = waiting;
  }

  async function loadDistricts(state) {
    if (state === 'Maharashtra' || memo.districts[state] !== undefined) return;
    try {
      const names = await c.db().liveDistricts(stateSlug(state));
      const seen = new Map();
      for (const n of names) {
        const k = districtKey(n);
        if (k && !seen.has(k)) seen.set(k, n.replace(/\s+/g, ' ').trim());
      }
      memo.districts[state] = [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    } catch (e) {
      console.warn(e);
      memo.districts[state] = [];
    }
  }

  async function load() {
    const [cfg, kinfo, kcard] = await Promise.all([
      c.db().appConfig(),
      c.db().kendraInfo().catch(() => ({})),
      c.db().kendraCard().catch(() => ({ on: false, secs: 4, slides: [] })),
      loadStatus(false),
    ]);
    data = { features: cfg.features || {}, launch: cfg.launch_states || [], sell: cfg.sell_districts || {}, notice: cfg.notice || null, festival: cfg.festival || null, kinfo: kinfo || {}, kcard };
  }

  function render() {
    if (!memo.sel && wide()) memo.sel = 'states';
    const showList = wide() || !memo.sel;
    const scrollY = window.scrollY;
    setMain(`
      <h1>${tr('tab_features')}</h1>
      <p class="muted">${tr('sw_intro')}</p>
      <div class="swlayout${memo.sel ? ' has-sel' : ''}">
        ${showList ? listHtml() : ''}
        ${memo.sel ? detailHtml() : ''}
      </div>`);
    window.scrollTo(0, scrollY);
    wire();
  }

  async function page() {
    await load();
    render();
  }

  async function refresh() {
    await load();
    render();
  }

  // ── actions ───────────────────────────────────────────────────────────
  function wire() {
    const $$ = (sel) => document.querySelectorAll(sel);

    $$('[data-sec]').forEach((b) => {
      b.onclick = () => {
        memo.sel = b.dataset.sec;
        render();
        if (!wide()) window.scrollTo(0, 0);
      };
    });
    const back = document.getElementById('sw-back');
    if (back) back.onclick = () => { memo.sel = null; render(); };

    $$('[data-master]').forEach((b) => {
      b.onclick = async () => {
        const key = b.dataset.master;
        const next = !featOn(key);
        const sec = SECTIONS.find((s) => s.master === key);
        const inside = [...((sec && sec.kids) || []), ...(key === 'services' ? ['kendra'] : [])];
        if (!next && inside.length && !confirm(tr('sw_off_confirm', { s: tr('f_' + key), k: inside.map((k) => tr('f_' + k)).join(', ') }))) return;
        b.disabled = true;
        try { await c.db().setFeature(key, next); toast(`${tr('f_' + key)}: ${next ? tr('sw_on') : tr('sw_off')}`); await refresh(); } catch (e) { b.disabled = false; fail(e); }
      };
    });

    $$('[data-feature]').forEach((box) => {
      box.onchange = async () => {
        const key = box.dataset.feature;
        try { await c.db().setFeature(key, box.checked); toast(`${tr('f_' + key)}: ${box.checked ? tr('sw_on') : tr('sw_off')}`); await refresh(); } catch (e) { box.checked = !box.checked; fail(e); }
      };
    });

    $$('[data-state]').forEach((b) => {
      b.onclick = async () => {
        const state = b.dataset.state;
        if (state === 'Maharashtra') return;
        const isOpen = data.launch.includes(state);
        if (!isOpen && APP_READY[state] !== 'full' && !confirm(tr(APP_READY[state] === 'soon' ? 'sw_state_confirm_soon' : 'sw_state_confirm', { s: stateName(state) }))) return;
        if (isOpen && !confirm(tr('sw_state_close', { s: stateName(state) }))) return;
        const others = data.launch.filter((s) => s !== 'Maharashtra' && s !== state);
        const next = isOpen ? others : [...others, state];
        b.disabled = true;
        try { await c.db().setLaunchStates(['Maharashtra', ...next]); toast(tr('sw_saved')); await refresh(); } catch (e) { b.disabled = false; fail(e); }
      };
    });

    $$('[data-dload]').forEach((b) => {
      b.onclick = async () => {
        const state = b.dataset.dload;
        memo.openStates.add(state);
        render();
        await loadDistricts(state);
        render();
      };
    });

    const saveScope = async (scope, state, keys) => {
      try {
        if (scope === 'sell') await c.db().setSellDistricts(state, keys);
        else await c.db().saveKendraInfo({ districts: keys });
        toast(tr('sw_saved'));
        await refresh();
      } catch (e) { fail(e); }
    };
    const listOf = (state) => (state === 'Maharashtra' ? MH_DISTRICTS : (memo.districts[state] || [])).map(([k]) => k);

    $$('[data-d]').forEach((b) => {
      b.onclick = () => {
        const { dscope: scope, dstate: state, d } = b.dataset;
        b.disabled = true;
        if (scope === 'sell') {
          const cur = new Set(data.sell[state] || []);
          if (cur.has(d)) cur.delete(d); else cur.add(d);
          saveScope('sell', state, [...cur].sort());
        } else {
          const cur = new Set(kendraDistricts());
          if (cur.has(d)) cur.delete(d); else cur.add(d);
          saveScope('kendra', state, [...cur].sort());
        }
      };
    });
    $$('[data-dall]').forEach((b) => {
      b.onclick = () => {
        const { dall: scope, dstate: state, v } = b.dataset;
        const keys = listOf(state);
        if (scope === 'sell') {
          saveScope('sell', state, v === '1' ? [...keys].sort() : []);
        } else {
          const cur = new Set(kendraDistricts());
          keys.forEach((k) => (v === '1' ? cur.add(k) : cur.delete(k)));
          saveScope('kendra', state, [...cur].sort());
        }
      };
    });

    const card = document.querySelector('[data-kcard]');
    if (card) card.onclick = async () => {
      card.disabled = true;
      try {
        const next = { ...data.kcard, on: !(data.kcard.on === true) };
        await c.db().saveKendraCard(next);
        toast(`${tr('sw_k_card')}: ${next.on ? tr('sw_on') : tr('sw_off')}`);
        await refresh();
      } catch (e) { card.disabled = false; fail(e); }
    };

    const save = document.getElementById('kl-save');
    if (save) save.onclick = async () => {
      const raw = document.getElementById('kl-point').value;
      const point = raw.trim() ? parsePoint(raw) : null;
      if (raw.trim() && !point) { toast(tr('sw_k_point_bad')); return; }
      const km = Number(document.getElementById('kl-km').value) || 0;
      save.disabled = true;
      try {
        await c.db().saveKendraInfo({
          address: document.getElementById('kl-address').value.trim().slice(0, 120),
          lat: point ? point.lat : null,
          lon: point ? point.lon : null,
          km: km || null,
        });
        toast(tr('sw_saved'));
        await refresh();
      } catch (e) { save.disabled = false; fail(e); }
    };

    // ── notice form ──
    const nk = document.getElementById('n-kind');
    if (nk) {
      const val = (id) => (document.getElementById(id) || {}).value || '';
      const read = () => {
        const d = noticeDraft();
        d.kind = val('n-kind');
        d.a = val('n-a'); d.b = val('n-b') || d.a;
        d.from = val('n-from'); d.until = val('n-until');
        const all = document.getElementById('n-all').checked;
        d.states = new Set(all ? [] : [...document.querySelectorAll('[data-nstate]')].filter((x) => x.checked).map((x) => x.dataset.nstate));
        NOTICE_LANGS.forEach(([lang]) => { d.text[lang] = val('n-t-' + lang).trim(); });
        return d;
      };
      const paint = () => {
        const d = read();
        document.querySelectorAll('[data-nclosed]').forEach((el) => { el.hidden = d.kind !== 'closed'; });
        document.getElementById('n-words-h').textContent = d.kind === 'custom' ? tr('sw_n_words') : tr('sw_n_extra');
        const all = document.getElementById('n-all').checked;
        document.querySelectorAll('[data-nstate]').forEach((x) => { x.disabled = all; x.closest('label').classList.toggle('dim', all); });
        document.getElementById('n-preview').innerHTML = noticePreview(d);
      };
      document.querySelectorAll('#n-kind, #n-a, #n-b, #n-from, #n-until, #n-all, [data-nstate], [id^="n-t-"]').forEach((el) => {
        el.addEventListener(el.tagName === 'TEXTAREA' ? 'input' : 'change', paint);
      });
      document.getElementById('n-save').onclick = async () => {
        const d = read();
        if (d.kind === 'closed' && !d.a) { toast(tr('sw_n_bad_closed')); return; }
        if (!d.from || !d.until || d.until < d.from) { toast(tr('sw_n_bad_dates')); return; }
        const text = {};
        NOTICE_LANGS.forEach(([lang]) => { if (d.text[lang]) text[lang] = d.text[lang].slice(0, 240); });
        if (d.kind === 'custom' && !Object.keys(text).length) { toast(tr('sw_n_bad_words')); return; }
        const notice = { id: Date.now().toString(36), kind: d.kind, from: d.from, until: d.until, states: [...d.states], text };
        if (d.kind === 'closed') { notice.a = d.a; notice.b = d.b < d.a ? d.a : d.b; }
        const btn = document.getElementById('n-save');
        btn.disabled = true;
        try { await c.db().setNotice(notice); memo.nf = null; toast(tr('sw_n_saved')); await refresh(); } catch (e) { btn.disabled = false; fail(e); }
      };
    }
    const nr = document.getElementById('n-remove');
    if (nr) nr.onclick = async () => {
      if (!confirm(tr('sw_n_remove_q'))) return;
      nr.disabled = true;
      try { await c.db().setNotice(null); memo.nf = null; toast(tr('sw_n_removed')); await refresh(); } catch (e) { nr.disabled = false; fail(e); }
    };

    // ── festival form ──
    const fs = document.getElementById('f-save');
    if (fs) fs.onclick = async () => {
      const kind = document.getElementById('f-kind').value;
      const from = document.getElementById('f-from').value;
      const until = document.getElementById('f-until').value;
      if (!from || !until || until < from) { toast(tr('sw_fest_bad')); return; }
      fs.disabled = true;
      try { await c.db().setFestival({ kind, from, until }); toast(tr('sw_fest_saved')); await refresh(); } catch (e) { fs.disabled = false; fail(e); }
    };
    const fr = document.getElementById('f-remove');
    if (fr) fr.onclick = async () => {
      if (!confirm(tr('sw_fest_remove_q'))) return;
      fr.disabled = true;
      try { await c.db().setFestival(null); toast(tr('sw_fest_removed')); await refresh(); } catch (e) { fr.disabled = false; fail(e); }
    };

    const more = document.querySelector('.swmore');
    if (more) more.ontoggle = () => { memo.moreOpen = more.open; };
    const r = document.getElementById('sw-refresh');
    if (r) r.onclick = async () => { r.disabled = true; memo.districts = {}; await loadStatus(true); render(); };
  }

  return { page };
}
