// The budget stop's decision, without Google's libraries (test.js checks it).

/** What to do with one budget notification: 'stop', 'test', 'done' or 'under'. */
function decide(n, stopped) {
  const cost = Number(n && n.costAmount);
  const budget = Number(n && n.budgetAmount);
  if (!Number.isFinite(cost) || !Number.isFinite(budget) || budget <= 0) return 'under';
  if (cost < budget) return 'under';
  const period = String((n && n.costIntervalStart) || '');
  if (stopped && stopped.period === period) return 'done';
  if (n.khalihanTest === true) return 'test';
  return 'stop';
}

/** The notification inside a Pub/Sub CloudEvent, or null. */
function read(event) {
  const raw = event && event.data && event.data.message && event.data.message.data;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch (_) {
    return null;
  }
}

module.exports = { decide, read };
