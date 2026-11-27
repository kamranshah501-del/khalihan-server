// khalihan-weather — the parts with no Google or network in them (node test.js).
//
// Owner, 27 Nov 2026: "agar Google sahi raha to phir Google pe hi leke
// jaate hain, Open-Meteo ko chhod dete … 3000 bahut zyada ho raha hai".
// Nine days against IMD's own thermometers (wx_compare, 19–27 Nov) put
// Google ahead on the night's minimum (±1.6 °C against Open-Meteo's ±2.3).
//
// The app has always read Open-Meteo's answer; this file turns Google's
// Weather API answer into that same shape, so the app only changes where it
// asks. What Google does not give is left out (soil moisture) or worked out
// here (ET0, by Hargreaves, from Google's highest and lowest temperature).
//
// Google's terms (Maps Service Specific Terms 19.2, read 27 Nov 2026):
// current and hourly values may be kept one hour, daily values 24 hours,
// then deleted — so a cell's answer is kept here at most `keepMin` minutes
// (55 by default) and nothing older is ever served.

const OWN = {
  day: 4000, // Google calls a day, everyone together (≈ 1,20,000 a month at most)
  hours: 48, // hours of hourly forecast (Google gives 24 a call)
  keepMin: 55, // minutes a cell's answer is kept (Google allows 60)
  step: 0.05, // a cell is 0.05° (about 5 km) — farmers in one cell share one answer
  days: 7,
};

const whole = (v, own, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : own);

// config/app → weather (Khalihan Admin): off, day, hours, keepMin.
function settings(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    off: r.off === true,
    day: whole(r.day, OWN.day, 0, 200000),
    hours: whole(r.hours, OWN.hours, 24, 240),
    keepMin: whole(r.keepMin, OWN.keepMin, 5, 59),
    step: OWN.step,
    days: OWN.days,
  };
}

// The farmer's place, rounded to its cell. Null when it is not a place in
// India (the app is for Indian farmers; anything else is a mistake or abuse).
function cellOf(lat, lon, step = OWN.step) {
  const a = Number(lat);
  const o = Number(lon);
  if (!Number.isFinite(a) || !Number.isFinite(o)) return null;
  if (a < 6 || a > 37.5 || o < 68 || o > 97.5) return null;
  const r = (x) => Math.round(Math.round(x / step) * step * 1000) / 1000;
  const la = r(a);
  const lo = r(o);
  return { lat: la, lon: lo, id: `${la.toFixed(2)}_${lo.toFixed(2)}` };
}

// The day in India, for the day's count: d20261127.
function dayId(date) {
  const t = new Date(date.getTime() + 330 * 60000);
  const p = (n) => String(n).padStart(2, '0');
  return `d${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}`;
}

// Google's sky → the WMO code the app has always read from Open-Meteo
// (lib/services/weather_service.dart conditionOf: 0 clear — windy when the
// wind is over 25 km/h —, 1–3 clouds, 45 fog, 61–67 and 80–82 rain, 71–77
// and 85–86 snow, 95–99 thunder).
const WMO = {
  CLEAR: 0, VERY_HOT: 0, WINDY: 0,
  MOSTLY_CLEAR: 1, PARTLY_CLOUDY: 2, MOSTLY_CLOUDY: 3, CLOUDY: 3,
  FOG: 45,
  LIGHT_RAIN: 61, LIGHT_TO_MODERATE_RAIN: 63, RAIN: 63, WIND_AND_RAIN: 63,
  MODERATE_TO_HEAVY_RAIN: 65, HEAVY_RAIN: 65, RAIN_PERIODICALLY_HEAVY: 65, HEAVY_RAIN_TO_RAINSTORM: 65,
  RAIN_AND_SNOW: 66, SLEET: 66,
  LIGHT_SNOW: 71, LIGHT_TO_MODERATE_SNOW: 73, SNOW: 73,
  MODERATE_TO_HEAVY_SNOW: 75, HEAVY_SNOW: 75, SNOW_PERIODICALLY_HEAVY: 75, SNOWSTORM: 75, HEAVY_SNOW_STORM: 75, BLOWING_SNOW: 75,
  CHANCE_OF_SHOWERS: 80, LIGHT_RAIN_SHOWERS: 80, SCATTERED_SHOWERS: 80, RAIN_SHOWERS: 81, HEAVY_RAIN_SHOWERS: 82,
  CHANCE_OF_SNOW_SHOWERS: 85, LIGHT_SNOW_SHOWERS: 85, SCATTERED_SNOW_SHOWERS: 85, SNOW_SHOWERS: 85, HEAVY_SNOW_SHOWERS: 86,
  THUNDERSTORM: 95, THUNDERSHOWER: 95, LIGHT_THUNDERSTORM_RAIN: 95, SCATTERED_THUNDERSTORMS: 95, HEAVY_THUNDERSTORM: 95,
  HAIL: 96, HAIL_SHOWERS: 96,
};

function wmo(type, cloud) {
  const t = String(type || '');
  if (Object.prototype.hasOwnProperty.call(WMO, t)) return WMO[t];
  // Google's longer names (most only for Japan and Korea): by their words.
  if (/THUNDER|LIGHTNING/.test(t)) return 95;
  if (/HAIL/.test(t)) return 96;
  if (/SLEET|RAINSNOW|SNOWRAIN/.test(t)) return 66;
  if (/SNOW/.test(t)) return 73;
  if (/RAIN/.test(t)) return 61;
  if (/FOG/.test(t)) return 45;
  if (/CLOUDY/.test(t)) return 3;
  if (/CLEAR/.test(t)) return 1;
  const c = Number(cloud);
  if (!Number.isFinite(c)) return 3;
  return c <= 10 ? 0 : c <= 40 ? 1 : c <= 70 ? 2 : 3;
}

// The day's reference evapotranspiration in mm, by Hargreaves (FAO-56,
// eq. 52) — Google does not give ET0; this needs only the day's highest and
// lowest temperature, the latitude and the date. Worked out by Khalihan,
// so the app never shows it as Google's.
function et0(tmax, tmin, lat, ymd) {
  if (![tmax, tmin, lat].every(Number.isFinite) || tmax < tmin) return 0;
  const [y, m, d] = String(ymd).split('-').map(Number);
  const j = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const phi = (lat * Math.PI) / 180;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * j) / 365);
  const dec = 0.409 * Math.sin((2 * Math.PI * j) / 365 - 1.39);
  const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(dec))));
  const ra = ((24 * 60) / Math.PI) * 0.082 * dr *
    (ws * Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.sin(ws));
  const v = 0.0023 * ((tmax + tmin) / 2 + 17.8) * Math.sqrt(tmax - tmin) * ra * 0.408;
  return Math.max(0, Math.round(v * 10) / 10);
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const r1 = (v) => (v == null ? null : Math.round(v * 10) / 10);
const p2 = (n) => String(n).padStart(2, '0');

// "19800s" → 19800 (India).
function offsetOf(hours) {
  for (const h of hours || []) {
    const s = h && h.displayDateTime && h.displayDateTime.utcOffset;
    const m = /^(-?\d+)(?:\.\d+)?s$/.exec(String(s || ''));
    if (m) return Number(m[1]);
  }
  return 19800;
}

// An instant (RFC 3339) as the farm's own clock reads it, Open-Meteo's way:
// "2026-11-27T06:48".
function localTime(iso, off) {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return null;
  const d = new Date(t + off * 1000);
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}T${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
}

// Google's two answers → what is kept for a cell (compact; one hour at most).
//   hours: [time, temp, feels, humidity, rain mm, rain %, wmo, day 1/0, wind km/h, wind from °, cloud %]
//   days:  [date, wmo, max, min, rain mm, rain %, gust km/h, uv, et0, sunrise, sunset]
function bundle(daysJson, hoursPages, lat, now) {
  const hoursRaw = [];
  for (const page of hoursPages || []) for (const h of (page && page.forecastHours) || []) hoursRaw.push(h);
  const off = offsetOf(hoursRaw);
  const hours = [];
  for (const h of hoursRaw) {
    const t = h.displayDateTime || {};
    if (![t.year, t.month, t.day, t.hours].every(Number.isInteger)) continue;
    const pr = h.precipitation || {};
    const wind = h.wind || {};
    hours.push([
      `${t.year}-${p2(t.month)}-${p2(t.day)}T${p2(t.hours)}:00`,
      r1(num((h.temperature || {}).degrees)),
      r1(num((h.feelsLikeTemperature || {}).degrees)),
      num(h.relativeHumidity),
      r1(num((pr.qpf || {}).quantity)) || 0,
      num((pr.probability || {}).percent) || 0,
      wmo((h.weatherCondition || {}).type, h.cloudCover),
      h.isDaytime === false ? 0 : 1,
      r1(num((wind.speed || {}).value)),
      num((wind.direction || {}).degrees),
      num(h.cloudCover),
    ]);
  }
  const days = [];
  for (const d of (daysJson && daysJson.forecastDays) || []) {
    const t = d.displayDate || {};
    if (![t.year, t.month, t.day].every(Number.isInteger)) continue;
    const date = `${t.year}-${p2(t.month)}-${p2(t.day)}`;
    const parts = [d.daytimeForecast || {}, d.nighttimeForecast || {}];
    const max = r1(num((d.maxTemperature || {}).degrees));
    const min = r1(num((d.minTemperature || {}).degrees));
    const codes = parts.filter((f) => f.weatherCondition).map((f) => wmo(f.weatherCondition.type, f.cloudCover));
    const rain = parts.reduce((s, f) => s + (num(((f.precipitation || {}).qpf || {}).quantity) || 0), 0);
    const chance = Math.max(0, ...parts.map((f) => num(((f.precipitation || {}).probability || {}).percent) || 0));
    const gust = Math.max(0, ...parts.map((f) => num((((f.wind || {}).gust) || {}).value) || 0));
    const sun = d.sunEvents || {};
    days.push([
      date,
      codes.length ? Math.max(...codes) : 3,
      max,
      min,
      r1(rain),
      chance,
      r1(gust),
      num((d.daytimeForecast || {}).uvIndex) || 0,
      et0(max, min, lat, date),
      localTime(sun.sunriseTime, off),
      localTime(sun.sunsetTime, off),
    ]);
  }
  return { v: 1, at: now, off, tz: ((daysJson && daysJson.timeZone) || {}).id || 'Asia/Kolkata', hours, days };
}

// What the app gets: Open-Meteo's shape, from this hour on. Null when the
// kept answer has no hour left for now (then Google is asked again).
function answer(b, cell, now) {
  if (!b || !Array.isArray(b.hours) || !Array.isArray(b.days)) return null;
  const local = new Date(now + (b.off || 0) * 1000);
  const hourNow = `${local.getUTCFullYear()}-${p2(local.getUTCMonth() + 1)}-${p2(local.getUTCDate())}T${p2(local.getUTCHours())}:00`;
  const today = hourNow.slice(0, 10);
  const hours = b.hours.filter((h) => h[0] >= hourNow);
  const days = b.days.filter((d) => d[0] >= today);
  if (!hours.length || !days.length) return null;
  const col = (rows, i) => rows.map((r) => r[i]);
  const c = hours[0];
  return {
    latitude: cell.lat,
    longitude: cell.lon,
    timezone: b.tz,
    utc_offset_seconds: b.off,
    source: 'google',
    fetched_at: new Date(b.at).toISOString(),
    current: {
      time: c[0],
      temperature_2m: c[1],
      apparent_temperature: c[2] == null ? c[1] : c[2],
      relative_humidity_2m: c[3],
      precipitation: c[4],
      weather_code: c[6],
      is_day: c[7],
      wind_speed_10m: c[8],
      wind_direction_10m: c[9],
      cloud_cover: c[10],
    },
    hourly: {
      time: col(hours, 0),
      temperature_2m: col(hours, 1),
      relative_humidity_2m: col(hours, 3),
      precipitation: col(hours, 4),
      precipitation_probability: col(hours, 5),
      weather_code: col(hours, 6),
      is_day: col(hours, 7),
      wind_speed_10m: col(hours, 8),
    },
    daily: {
      time: col(days, 0),
      weather_code: col(days, 1),
      temperature_2m_max: col(days, 2),
      temperature_2m_min: col(days, 3),
      precipitation_sum: col(days, 4),
      precipitation_probability_max: col(days, 5),
      wind_gusts_10m_max: col(days, 6),
      uv_index_max: col(days, 7),
      et0_fao_evapotranspiration: col(days, 8),
      sunrise: col(days, 9),
      sunset: col(days, 10),
    },
  };
}

// Google calls one fresh answer takes: the days, and a page per 24 hours.
const callsFor = (s) => 1 + Math.ceil(s.hours / 24);

module.exports = { OWN, settings, cellOf, dayId, wmo, et0, offsetOf, localTime, bundle, answer, callsFor };
