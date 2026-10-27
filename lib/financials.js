/**
 * lib/financials.js
 * Single source of truth for all financial calculations.
 */

export function parseAmount(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function computeTotalExpenses(expenses) {
  if (!Array.isArray(expenses)) return 0;
  return expenses.reduce((acc, e) => acc + parseAmount(e?.amount), 0);
}

export function computeActualIncome(incomeRecords) {
  if (!Array.isArray(incomeRecords)) return 0;
  return incomeRecords
    .filter((r) => !r?.status || r.status === "received" || r.status === "completed")
    .reduce((acc, r) => acc + parseAmount(r?.amount), 0);
}

export function computeExpectedIncome(incomeRecords) {
  if (!Array.isArray(incomeRecords)) return 0;
  return incomeRecords
    .filter((r) => r?.status === "pending" || r?.status === "expected")
    .reduce((acc, r) => acc + parseAmount(r?.amount), 0);
}

/**
 * Actual profit = actualIncome − totalExpenses.
 * Negative profit is returned as-is (never clamped to 0).
 */
export function computeActualProfit(actualIncome, totalExpenses) {
  return parseAmount(actualIncome) - parseAmount(totalExpenses);
}

export function formatCurrency(value, fractionDigits = 0) {
  return parseAmount(value).toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function filterByDateRange(records, startDate, endDate) {
  if (!startDate && !endDate) return records;
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
  return records.filter((r) => {
    if (!r?.date) return false;
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) return false;
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  });
}

export function computeMonthlyTotals(records, months = 6) {
  const buckets = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    buckets.push({ key, label: d.toLocaleString(undefined, { month: "short" }), total: 0 });
  }
  for (const e of records) {
    const dd = e?.date ? new Date(e.date) : null;
    if (!dd || Number.isNaN(dd.getTime())) continue;
    const key = `${dd.getFullYear()}-${dd.getMonth() + 1}`;
    const idx = buckets.findIndex((b) => b.key === key);
    if (idx >= 0) buckets[idx].total += parseAmount(e.amount);
  }
  return buckets;
}
