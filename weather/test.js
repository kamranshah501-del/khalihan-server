// node test.js — the parts of khalihan-weather with no Google or network in them.
const assert = require('node:assert/strict');
const core = require('./core.js');
const fx = require('./fixture.js');

// settings: the function's own when Admin set nothing or nonsense
let s = core.settings(null);
assert.deepEqual([s.off, s.day, s.hours, s.keepMin, s.days], [false, 4000, 48, 55, 7]);
s = core.settings({ off: 'yes', day: -1, hours: 500, keepMin: 90 });
assert.deepEqual([s.off, s.day, s.hours, s.keepMin], [false, 4000, 48, 55]); // Google allows one hour: never more than 59 minutes
s = core.settings({ off: true, day: 0, hours: 72, keepMin: 30 });
assert.deepEqual([s.off, s.day, s.hours, s.keepMin], [true, 0, 72, 30]);
assert.equal(core.callsFor(core.settings(null)), 3); // the days + 2 pages of 24 hours
assert.equal(core.callsFor(core.settings({ hours: 72 })), 4);
assert.equal(core.callsFor(core.settings({ hours: 25 })), 3);

// the cell: about 5 km, India only
assert.deepEqual(core.cellOf('21.0077', '75.5626'), { lat: 21, lon: 75.55, id: '21.00_75.55' });
assert.deepEqual(core.cellOf(19.879, 75.343), { lat: 19.9, lon: 75.35, id: '19.90_75.35' });
assert.equal(core.cellOf(51.5, -0.1), null); // London
assert.equal(core.cellOf('x', 75), null);
assert.equal(core.cellOf(undefined, undefined), null);
// two farmers 2 km apart share one answer
assert.equal(core.cellOf(20.51, 76.18).id, core.cellOf(20.52, 76.19).id);

// the day in India
assert.equal(core.dayId(new Date(Date.UTC(2026, 10, 26, 18, 29))), 'd20261126');
assert.equal(core.dayId(new Date(Date.UTC(2026, 10, 26, 18, 31))), 'd20261127');

// Google's sky → the app's WMO codes
assert.equal(core.wmo('CLEAR'), 0);
assert.equal(core.wmo('WINDY'), 0); // the app shows "windy" for 0 with wind over 25 km/h
assert.equal(core.wmo('PARTLY_CLOUDY'), 2);
assert.equal(core.wmo('CLOUDY'), 3);
assert.equal(core.wmo('FOG'), 45);
assert.equal(core.wmo('LIGHT_RAIN'), 61);
assert.equal(core.wmo('HEAVY_RAIN'), 65);
assert.equal(core.wmo('SCATTERED_SHOWERS'), 80);
assert.equal(core.wmo('THUNDERSHOWER'), 95);
assert.equal(core.wmo('HAIL'), 96);
assert.equal(core.wmo('CLOUDY_WITH_PERIODIC_RAIN_ACCOMPANIED_BY_THUNDER'), 95);
assert.equal(core.wmo('CLEAR_WITH_BRIEF_RAIN_LATER'), 61);
assert.equal(core.wmo('TYPE_UNSPECIFIED', 5), 0);
assert.equal(core.wmo(undefined, 85), 3);
assert.equal(core.wmo(undefined), 3);

// ET0 by Hargreaves: Jalgaon in late November, 30/14 °C → about 4 mm a day
const e = core.et0(30.4, 14.2, 21.0, '2026-11-27');
assert.ok(e > 3.2 && e < 4.6, `et0 ${e}`);
assert.equal(core.et0(null, 14, 21, '2026-11-27'), 0);
assert.equal(core.et0(10, 20, 21, '2026-11-27'), 0); // max below min: nothing made up
assert.ok(core.et0(40, 25, 21, '2026-05-15') > e); // May dries the field faster

// times on the farm's clock, Open-Meteo's way
assert.equal(core.localTime('2026-11-27T01:16:00Z', 19800), '2026-11-27T06:46');
assert.equal(core.localTime('nonsense', 19800), null);
assert.equal(core.offsetOf([{ displayDateTime: { utcOffset: '19800s' } }]), 19800);
assert.equal(core.offsetOf([]), 19800);

// Google's answers → kept → what the app reads
const cell = core.cellOf(21.0077, 75.5626);
const b = core.bundle(fx.days(), fx.hoursPages(48), cell.lat, fx.NOW);
assert.equal(b.hours.length, 48);
assert.equal(b.days.length, 7);
assert.equal(b.off, 19800);
assert.equal(b.hours[0][0], '2026-11-27T09:00');
assert.equal(b.days[0][0], '2026-11-27');
assert.equal(b.days[1][1], 95); // the wet day: its worse half (thundershower)
assert.equal(b.days[1][4], 7.3); // day + night rain
assert.equal(b.days[1][5], 70);
assert.equal(b.days[1][6], 38);
assert.equal(b.days[0][9], '2026-11-27T06:46');
assert.ok(b.days[0][8] > 3);

let a = core.answer(b, cell, fx.NOW);
assert.equal(a.source, 'google');
assert.equal(a.utc_offset_seconds, 19800);
assert.equal(a.current.time, '2026-11-27T09:00');
assert.equal(a.hourly.time.length, 48);
assert.equal(a.hourly.time[0], a.current.time); // the app starts the hours at "now"
assert.equal(a.daily.time.length, 7);
for (const k of ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation', 'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'cloud_cover']) {
  assert.ok(k in a.current, `current.${k}`);
}
for (const k of ['precipitation', 'precipitation_probability', 'temperature_2m', 'weather_code', 'is_day', 'relative_humidity_2m', 'wind_speed_10m']) {
  assert.equal(a.hourly[k].length, 48, `hourly.${k}`);
}
for (const k of ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'precipitation_probability_max',
  'wind_gusts_10m_max', 'sunrise', 'sunset', 'uv_index_max', 'et0_fao_evapotranspiration']) {
  assert.equal(a.daily[k].length, 7, `daily.${k}`);
}
assert.ok(!('soil_moisture_3_to_9cm' in a.hourly)); // Google has none: the app leaves that line out

// 50 minutes later, in the next hour: the hours start at the new hour
a = core.answer(b, cell, fx.NOW + 50 * 60000);
assert.equal(a.current.time, '2026-11-27T10:00');
assert.equal(a.hourly.time.length, 47);
// the next morning: today's day is gone too (but the kept answer never lives that long)
a = core.answer(b, cell, fx.NOW + 24 * 3600000);
assert.equal(a.daily.time[0], '2026-11-28');
// past every hour: nothing to give
assert.equal(core.answer(b, cell, fx.NOW + 49 * 3600000), null);
assert.equal(core.answer(null, cell, fx.NOW), null);
assert.equal(core.answer({ hours: [], days: [] }, cell, fx.NOW), null);

console.log('khalihan-weather core: all good');
