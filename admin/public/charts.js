// Small charts for the dashboard, drawn as plain SVG / HTML (no library).
// Rules followed: thin columns (≤ 24 px) with a 4 px rounded top and a
// square foot, one hairline baseline and two recessive gridlines, labels in
// text colours (never the bar colour), one highlighted bar, a tooltip on
// hover / tap, and the same numbers in a table for screen readers.

const NS = 'http://www.w3.org/2000/svg';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n));

function niceMax(v) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/** Column chart. points: [{label, value, tip}] — the last one is "today"
 *  and drawn in the dark navy; the rest in a lighter step. */
export function columnChart(points, { title = '', height = 150 } = {}) {
  const n = points.length;
  const slot = 34, bar = 20, left = 30, top = 18, bottom = 24;
  const w = left + n * slot + 6;
  const h = height;
  const plotH = h - top - bottom;
  const max = niceMax(Math.max(1, ...points.map((p) => p.value)));
  const y = (v) => top + plotH - (v / max) * plotH;
  const grid = [0, max / 2, max].map((v) => `
    <line x1="${left}" x2="${w - 4}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)" stroke-width="1"/>
    <text x="${left - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${compact(v)}</text>`).join('');
  const bars = points.map((p, i) => {
    const x = left + i * slot + (slot - bar) / 2;
    const yy = y(p.value);
    const hh = top + plotH - yy;
    const last = i === n - 1;
    const r = Math.min(4, hh);
    // Rounded top, square foot.
    const d = hh <= 0 ? '' : `M${x} ${top + plotH} V${yy + r} Q${x} ${yy} ${x + r} ${yy} H${x + bar - r} Q${x + bar} ${yy} ${x + bar} ${yy + r} V${top + plotH} Z`;
    const showLabel = last || p.value === Math.max(...points.map((q) => q.value));
    return `<g class="bar${last ? ' today' : ''}" data-tip="${esc(p.tip)}" tabindex="0">
      <rect x="${left + i * slot}" y="${top}" width="${slot}" height="${plotH}" fill="transparent"/>
      ${d ? `<path d="${d}"/>` : ''}
      ${showLabel && p.value > 0 ? `<text x="${x + bar / 2}" y="${yy - 5}" text-anchor="middle" class="val">${p.value}</text>` : ''}
      ${i % 2 === (n - 1) % 2 ? `<text x="${x + bar / 2}" y="${h - 6}" text-anchor="middle" class="ax">${esc(p.label)}</text>` : ''}
    </g>`;
  }).join('');
  return `<figure class="chart">
    <svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(title)}" preserveAspectRatio="xMidYMid meet">
      ${grid}${bars}
    </svg>
    <div class="tip" hidden></div>
  </figure>`;
}

/** Hover / tap / keyboard focus on a bar shows its tooltip. */
export function wireTips(root) {
  root.querySelectorAll('figure.chart').forEach((fig) => {
    const tip = fig.querySelector('.tip');
    const show = (g) => {
      tip.textContent = g.dataset.tip;
      tip.hidden = false;
      const fb = fig.getBoundingClientRect();
      const gb = g.getBoundingClientRect();
      const x = Math.min(Math.max(gb.left + gb.width / 2 - fb.left, 70), fb.width - 70);
      tip.style.left = `${x}px`;
      fig.querySelectorAll('.bar.on').forEach((b) => b.classList.remove('on'));
      g.classList.add('on');
    };
    const hide = () => { tip.hidden = true; fig.querySelectorAll('.bar.on').forEach((b) => b.classList.remove('on')); };
    fig.querySelectorAll('.bar').forEach((g) => {
      g.addEventListener('mouseenter', () => show(g));
      g.addEventListener('focus', () => show(g));
      g.addEventListener('click', () => show(g));
    });
    fig.addEventListener('mouseleave', hide);
  });
}

/** The steps of a purchase as bars that step up like the logo's columns:
 *  one hue, light (first step) to dark (paid). */
export function pipeline(steps) {
  const ramp = ['#9AAEC2', '#7590AB', '#557493', '#38597A', '#20405E'];
  const max = Math.max(1, ...steps.map((s) => s.value));
  return `<div class="pipe">${steps.map((s, i) => `
    <button class="pipe-row" data-f="${esc(s.key)}">
      <span class="pipe-l">${esc(s.label)}</span>
      <span class="pipe-track"><span class="pipe-bar" style="width:${s.value ? Math.max(4, (s.value / max) * 100) : 0}%;background:${ramp[i % ramp.length]}"></span></span>
      <span class="pipe-n">${s.value}</span>
    </button>`).join('')}</div>`;
}

/** The same numbers as a table (under a "show as a table" toggle). */
export function table(headers, rows) {
  return `<table class="data"><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>
    ${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
}
