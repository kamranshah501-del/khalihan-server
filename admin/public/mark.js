// Khalihan's mark (logo concept 3) as SVG — the same measurements as the
// app (lib/widgets/khalihan_mark.dart) and the app icon (tool/brand_icons.py):
// in column widths, origin at the bottom left of the red column, y up.
// Here 1 column = 10 SVG units.

const TOPS = [3.32, 4.23, 5.14];
const COLOURS = ['#FF453A', '#FEC407', '#FFA100'];
const NOTCH_Y = 1.29;
const NOTCH_R = 0.75;
const DOT = [0.41, 4.52, 0.59];
const LEFT = -0.18, RIGHT = 3.0, TOP = 5.14;

const X = (x) => +(x * 10).toFixed(2);
const Y = (y) => +((TOP - y) * 10).toFixed(2);

function column(i) {
  const x0 = i, x1 = i + 1, top = TOPS[i], r = NOTCH_R * 10, ym = NOTCH_Y;
  const rr = NOTCH_R;
  // Upper block: bottom edge, the notch's upper curve, right edge, round top.
  const upper = `M${X(x0)} ${Y(ym)} L${X(x1 - rr)} ${Y(ym)} A${r} ${r} 0 0 0 ${X(x1)} ${Y(ym + rr)}`
    + ` L${X(x1)} ${Y(top)} A10 10 0 0 0 ${X(x0)} ${Y(top - 1)} Z`;
  // Lower block: the foot, the notch's lower curve.
  const lower = `M${X(x0)} ${Y(0)} L${X(x1)} ${Y(0)} L${X(x1)} ${Y(ym - rr)} A${r} ${r} 0 0 0 ${X(x1 - rr)} ${Y(ym)}`
    + ` L${X(x0)} ${Y(ym)} Z`;
  const notch = i < 2
    ? `<rect x="${X(x1 - rr)}" y="${Y(ym + rr)}" width="${X(rr)}" height="${X(2 * rr)}" fill="${COLOURS[i + 1]}"/>`
    : '';
  return `<g class="mk-col mk-c${i}">${notch}<path d="${upper}" fill="${COLOURS[i]}"/><path d="${lower}" fill="${COLOURS[i]}"/></g>`;
}

/** The mark as an <svg>. `animate` lets the columns rise and the dot drop
 *  (once, on load; style.css keeps it still for reduced motion). */
export function markSVG(height, { animate = false, label = 'Khalihan' } = {}) {
  const vbX = X(LEFT), w = X(RIGHT - LEFT), h = X(TOP);
  const width = +(height * w / h).toFixed(1);
  const clip = `mkclip${Math.random().toString(36).slice(2, 8)}`;
  return `<svg class="mark${animate ? ' rise' : ''}" viewBox="${vbX} -2 ${w} ${h + 2}" width="${width}" height="${height}" role="img" aria-label="${label}">
    <clipPath id="${clip}"><rect x="${vbX}" y="-40" width="${w}" height="${h + 40}"/></clipPath>
    <g clip-path="url(#${clip})">${column(0)}${column(1)}${column(2)}</g>
    <circle class="mk-dot" cx="${X(DOT[0])}" cy="${Y(DOT[1])}" r="${X(DOT[2])}" fill="#FEC407"/>
  </svg>`;
}
