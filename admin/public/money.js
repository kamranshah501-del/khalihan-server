// Khalihan's own sums: what a deal leaves us, and what an offer would.
// The inputs (processor rate, costs) live in owner-only collections
// (deal_money, offer_money) — never in sell_requests or the public offers,
// which farmers can read.

const toDate = (v) => (v instanceof Date ? v : v && typeof v.toDate === 'function' ? v.toDate() : null);
const num = (v) => (v === '' || v == null || !isFinite(Number(v)) ? 0 : Number(v));

/** One deal. null when the processor rate isn't entered yet. */
export function dealNumbers(r, m) {
  const qty = num(r.final_qty) || num(r.qty);
  const farmerRate = num(r.final_price) || num(r.price);
  const farmer = qty * farmerRate;
  if (!m || !num(m.rate)) return { qty, farmer, sale: null, costs: null, margin: null, perQ: null, pct: null };
  const sale = qty * num(m.rate);
  const costs = num(m.transport) + num(m.labour) + num(m.other);
  const margin = sale - farmer - costs;
  return { qty, farmer, sale, costs, margin, perQ: qty ? margin / qty : null, pct: sale ? (margin / sale) * 100 : null };
}

/** When a deal was paid: the "paid" step in its history, else last update. */
export function paidAt(r) {
  const step = (r.history || []).filter((h) => h.status === 'paid').map((h) => toDate(h.at)).filter(Boolean);
  return step.length ? step[step.length - 1] : toDate(r.updated) || toDate(r.at);
}

/** This month's paid deals, totalled, and by crop. */
export function monthSummary(requests, money, since) {
  const paid = requests.filter((r) => r.status === 'paid' && (paidAt(r) || 0) >= since);
  let qty = 0, farmer = 0, margin = 0, marginQty = 0, missing = 0;
  const byCrop = new Map();
  for (const r of paid) {
    const n = dealNumbers(r, money[r.id]);
    qty += n.qty;
    farmer += n.farmer;
    const c = byCrop.get(r.crop) || { crop: r.crop, qty: 0, farmer: 0, margin: 0, known: 0 };
    c.qty += n.qty;
    c.farmer += n.farmer;
    if (n.margin == null) {
      missing += 1;
    } else {
      margin += n.margin;
      marginQty += n.qty;
      c.margin += n.margin;
      c.known += n.qty;
    }
    byCrop.set(r.crop, c);
  }
  return {
    deals: paid.length, qty, farmer, margin, missing,
    perQ: marginQty ? margin / marginQty : null,
    byCrop: [...byCrop.values()].sort((a, b) => b.qty - a.qty),
  };
}

/** An offer: margin per quintal and per 100-quintal truck. */
export function offerPlan(farmerPrice, rate, transportPerQ, otherPerQ) {
  if (!num(rate) || !num(farmerPrice)) return null;
  const perQ = num(rate) - num(farmerPrice) - num(transportPerQ) - num(otherPerQ);
  return { perQ, truck: perQ * 100, pct: (perQ / num(rate)) * 100 };
}
