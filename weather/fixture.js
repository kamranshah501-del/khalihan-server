// Google's two answers in their documented shape (developers.google.com/maps/
// documentation/weather: forecast/days:lookup, forecast/hours:lookup), made
// up for the tests: Jalgaon, from 27 Nov 2026 09:00 IST.

const p2 = (n) => String(n).padStart(2, '0');

// Hours from 27 Nov 2026 09:00 IST (03:30 UTC), [count] of them, in pages of 24.
function hoursPages(count = 48) {
  const start = Date.UTC(2026, 10, 27, 3, 30);
  const all = [];
  for (let i = 0; i < count; i++) {
    const utc = new Date(start + i * 3600000);
    const ist = new Date(utc.getTime() + 19800000);
    const h = ist.getUTCHours();
    const rainy = i >= 30 && i < 33; // 28 Nov 15:00–17:00
    all.push({
      interval: { startTime: utc.toISOString(), endTime: new Date(utc.getTime() + 3600000).toISOString() },
      displayDateTime: { year: ist.getUTCFullYear(), month: ist.getUTCMonth() + 1, day: ist.getUTCDate(), hours: h, utcOffset: '19800s' },
      isDaytime: h >= 7 && h < 18,
      weatherCondition: { type: rainy ? 'THUNDERSHOWER' : h >= 7 && h < 18 ? 'CLEAR' : 'MOSTLY_CLEAR', description: { text: 'x', languageCode: 'en' } },
      temperature: { degrees: 18 + Math.round(12 * Math.sin(((h - 6) / 24) * Math.PI * 2) * 10) / 10, unit: 'CELSIUS' },
      feelsLikeTemperature: { degrees: 19, unit: 'CELSIUS' },
      relativeHumidity: 40 + (h % 5),
      uvIndex: h >= 10 && h <= 15 ? 6 : 0,
      precipitation: { probability: { percent: rainy ? 70 : 5, type: 'RAIN' }, qpf: { quantity: rainy ? 2.4 : 0, unit: 'MILLIMETERS' } },
      thunderstormProbability: rainy ? 40 : 0,
      wind: { direction: { degrees: 45, cardinal: 'NORTHEAST' }, speed: { value: 9, unit: 'KILOMETERS_PER_HOUR' }, gust: { value: 18, unit: 'KILOMETERS_PER_HOUR' } },
      cloudCover: rainy ? 90 : 10,
    });
  }
  const pages = [];
  for (let i = 0; i < all.length; i += 24) {
    const last = i + 24 >= all.length;
    pages.push({ forecastHours: all.slice(i, i + 24), timeZone: { id: 'Asia/Kolkata' }, ...(last ? {} : { nextPageToken: `page${i / 24 + 2}` }) });
  }
  return pages;
}

function part(type, percent, mm, gust) {
  return {
    weatherCondition: { type, description: { text: 'x', languageCode: 'en' } },
    relativeHumidity: 45,
    uvIndex: 6,
    precipitation: { probability: { percent, type: 'RAIN' }, qpf: { quantity: mm, unit: 'MILLIMETERS' } },
    thunderstormProbability: 0,
    wind: { direction: { degrees: 45 }, speed: { value: 10 }, gust: { value: gust } },
    cloudCover: 20,
  };
}

function days(count = 7) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(2026, 10, 27 + i));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const wet = i === 1;
    out.push({
      interval: { startTime: `${y}-${p2(m)}-${p2(day)}T01:30:00Z`, endTime: 'x' },
      displayDate: { year: y, month: m, day },
      daytimeForecast: part(wet ? 'THUNDERSHOWER' : 'CLEAR', wet ? 70 : 5, wet ? 6.2 : 0, wet ? 38 : 20),
      nighttimeForecast: part('MOSTLY_CLEAR', wet ? 30 : 0, wet ? 1.1 : 0, 15),
      maxTemperature: { degrees: 30.4 - i * 0.3, unit: 'CELSIUS' },
      minTemperature: { degrees: 14.2 + i * 0.1, unit: 'CELSIUS' },
      sunEvents: { sunriseTime: `${y}-${p2(m)}-${p2(day)}T01:16:00Z`, sunsetTime: `${y}-${p2(m)}-${p2(day)}T12:15:00Z` },
    });
  }
  return { forecastDays: out, timeZone: { id: 'Asia/Kolkata' } };
}

// 27 Nov 2026 09:20 IST.
const NOW = Date.UTC(2026, 10, 27, 3, 50);

module.exports = { hoursPages, days, NOW };
