/**
 * tests/financials.test.js
 * Run with: node tests/financials.test.js
 */

import {
  parseAmount,
  computeTotalExpenses,
  computeActualIncome,
  computeExpectedIncome,
  computeActualProfit,
  filterByDateRange,
  computeMonthlyTotals,
} from "../lib/financials.js";

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  const ok =
    typeof expected === "number"
      ? Math.abs(actual - expected) < 0.0001
      : JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✅  ${description}`);
    passed++;
  } else {
    console.error(`  ❌  ${description}`);
    console.error(`      Expected: ${JSON.stringify(expected)}`);
    console.error(`      Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

console.log("\n▶  parseAmount");
assert("integer",           parseAmount(1000),     1000);
assert("float string",      parseAmount("3.50"),   3.50);
assert("null → 0",          parseAmount(null),     0);
assert("undefined → 0",     parseAmount(undefined),0);
assert("empty string → 0",  parseAmount(""),       0);
assert("NaN string → 0",    parseAmount("abc"),    0);
assert("Infinity → 0",      parseAmount(Infinity), 0);
assert("zero",              parseAmount(0),        0);
assert("negative",          parseAmount(-500),     -500);

console.log("\n▶  Test A — Basic calculations");
{
  const expenses    = [{ amount: 2000, date: "2024-01-10" }, { amount: 2000, date: "2024-01-15" }];
  const income      = [{ amount: 6000, status: "received" }, { amount: 4000, status: "received" }];
  const expectedInc = [{ amount: 3000, status: "pending" }];
  const te = computeTotalExpenses(expenses);
  const ai = computeActualIncome(income);
  const ei = computeExpectedIncome(expectedInc);
  const p  = computeActualProfit(ai, te);
  assert("total expenses = 4000",   te, 4000);
  assert("actual income = 10000",   ai, 10000);
  assert("expected income = 3000",  ei, 3000);
  assert("actual profit = 6000",    p,  6000);
}

console.log("\n▶  Test B — Negative profit (never clamped to 0)");
{
  const p = computeActualProfit(
    computeActualIncome([{ amount: 2000, status: "received" }]),
    computeTotalExpenses([{ amount: 3000 }, { amount: 2000 }])
  );
  assert("profit = −3000", p, -3000);
}

console.log("\n▶  Test C — No transactions");
{
  assert("total expenses = 0",  computeTotalExpenses([]),  0);
  assert("actual income = 0",   computeActualIncome([]),   0);
  assert("expected income = 0", computeExpectedIncome([]), 0);
  assert("profit = 0",          computeActualProfit(0, 0), 0);
}

console.log("\n▶  Test D — Mixed transaction types");
{
  const incomeRecords = [
    { amount: 5000, status: "received" },
    { amount: 3000, status: "received" },
    { amount: 2000, status: "pending" },
    { amount: 1000, status: "cancelled" },
  ];
  const expenseRecords = [{ amount: 1500 }, { amount: 2500 }];
  assert("actual income = 8000",   computeActualIncome(incomeRecords),   8000);
  assert("expected income = 2000", computeExpectedIncome(incomeRecords), 2000);
  assert("total expenses = 4000",  computeTotalExpenses(expenseRecords), 4000);
  assert("profit = 4000",          computeActualProfit(8000, 4000),      4000);
}

console.log("\n▶  Test E — Status changes / no double-counting");
{
  const pending  = [{ amount: 5000, status: "pending" }];
  const received = [{ amount: 5000, status: "received" }];
  assert("pending: actual income = 0",      computeActualIncome(pending),    0);
  assert("pending: expected income = 5000", computeExpectedIncome(pending),  5000);
  assert("received: actual income = 5000",  computeActualIncome(received),   5000);
  assert("received: expected income = 0",   computeExpectedIncome(received), 0);
  assert("no double-count", computeActualIncome(received) + computeExpectedIncome(received), 5000);
}

console.log("\n▶  Test F — Date filters");
{
  const records = [
    { amount: 100, date: "2024-01-01" },
    { amount: 200, date: "2024-01-31" },
    { amount: 300, date: "2024-02-15" },
    { amount: 400, date: "2024-03-01" },
  ];
  const jan   = filterByDateRange(records, "2024-01-01", "2024-01-31");
  assert("Jan filter count = 2", jan.length,                2);
  assert("Jan total = 300",      computeTotalExpenses(jan), 300);
  const all   = filterByDateRange(records, "", "");
  assert("No filter = all 4",    all.length,                4);
  const exact = filterByDateRange(records, "2024-02-15", "2024-02-15");
  assert("Exact day count = 1",  exact.length,              1);
  assert("Exact day total = 300",computeTotalExpenses(exact),300);
}

console.log("\n▶  Test G — Numeric edge cases");
{
  const edgeCases = [
    { amount: 0 }, { amount: null }, { amount: undefined },
    { amount: "" }, { amount: "abc" }, { amount: Infinity },
    { amount: "10.50" }, { amount: 100000000 },
  ];
  assert("edge total = 100000010.5", computeTotalExpenses(edgeCases), 100000010.5);
  assert("decimal string: 10.5",     parseAmount("10.5"),             10.5);
}

console.log("\n▶  Test H — Data isolation");
{
  const user1 = [{ amount: 500, userId: "user1" }];
  const user2 = [{ amount: 9000, userId: "user2" }];
  assert("user1 total = 500",  computeTotalExpenses(user1.filter((e) => e.userId === "user1")), 500);
  assert("user2 total = 9000", computeTotalExpenses(user2.filter((e) => e.userId === "user2")), 9000);
}

console.log("\n▶  computeMonthlyTotals");
{
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-15`;
  const buckets = computeMonthlyTotals(
    [{ amount: 1000, date: thisMonth }, { amount: 500, date: thisMonth }, { amount: 250, date: "1990-01-01" }],
    6
  );
  assert("6 buckets",                 buckets.length,                     6);
  assert("current month total = 1500", buckets[buckets.length - 1].total, 1500);
}

console.log(`\n${"─".repeat(50)}`);
console.log(`  Tests passed: ${passed}`);
console.log(`  Tests failed: ${failed}`);
if (failed > 0) { console.error("\n  ⚠️  Some tests FAILED.\n"); process.exit(1); }
else { console.log("\n  ✅  All tests passed.\n"); }
