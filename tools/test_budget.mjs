// Checks for the sums of Admin → 💰 Budget & targets (admin/public/budget.js):
//   node tools/test_budget.mjs
// Made-up amounts only — the real ones live in Firestore, never in this repo.
import { copyFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'budget-'));
copyFileSync(join(here, '..', 'admin', 'public', 'budget.js'), join(dir, 'budget.mjs'));
const { sums } = await import(pathToFileURL(join(dir, 'budget.mjs')).href);

let bad = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `: ${JSON.stringify(got)} != ${JSON.stringify(want)}`}`);
  if (!ok) bad++;
};

const data = {
  limit: 1000,
  lines: [
    { id: 'a', name: 'Ads', plan: 600, daily: true },
    { id: 'b', name: 'Tool', plan: 300, daily: false },
    { id: 'c', name: 'Free', plan: null, daily: false },
  ],
  months: { '2026-11': { spent: { a: 100, gone: 999 }, income: 50 }, '2026-10': { spent: { a: 700, b: 300 } } },
};
const day10 = new Date(2026, 10, 10); // 10 Nov 2026

let s = sums(data, '2026-11', day10);
check('plan adds every line, blank = 0', s.plan, 900);
check('spent counts only lines that exist', s.spent, 100);
check('net = spent − income', s.net, 50);
check('day of the month', [s.day, s.days, s.current], [10, 30, true]);
// ads: 100 so far + 600 × 20/30 = 500; tool not paid yet → its plan 300; − income 50
check('month-end estimate', s.est, 100 + 400 + 300 - 50);

s = sums(data, '2026-10', day10);
check('a past month is whole', [s.day, s.days, s.current, s.past], [31, 31, false, true]);
check('past month: spent and estimate', [s.spent, s.est], [1000, 1000]);

s = sums(data, '2026-12', day10);
check('a coming month: nothing spent, estimate = plan', [s.spent, s.day, s.est], [0, 0, 900]);

s = sums({}, '2026-11', day10);
check('an empty budget is all zero', [s.plan, s.spent, s.net, s.est], [0, 0, 0, 0]);

// A fixed bill that came in higher than planned counts as paid, not planned.
s = sums({ lines: [{ id: 'b', plan: 300, daily: false }], months: { '2026-11': { spent: { b: 350 } } } }, '2026-11', day10);
check('a bill above its plan', s.est, 350);

if (bad) { console.log(`${bad} check(s) failed`); process.exit(1); }
console.log('all budget checks passed');
