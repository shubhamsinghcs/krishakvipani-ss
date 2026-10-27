"use client";

import { useEffect, useMemo, useState } from "react";
import ProfitCalculator from "@/components/planner/ProfitCalculator";
import MonthlyExpenseChart from "@/components/MonthlyExpenseChart";
import { computeTotalExpenses, computeMonthlyTotals, filterByDateRange } from "@/lib/financials";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [profile, setProfile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const json = await res.json();
      if (json.success) setExpenses(json.expenses || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    (async () => {
      try {
        const res = await fetch("/api/profile");
        const j = await res.json();
        if (j.success) setProfile(j.profile || null);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // All metrics derive from the date-filtered set — single source of truth
  const filteredExpenses = useMemo(
    () => filterByDateRange(expenses, startDate, endDate),
    [expenses, startDate, endDate]
  );

  const total = useMemo(() => computeTotalExpenses(filteredExpenses), [filteredExpenses]);

  const monthsData = useMemo(() => computeMonthlyTotals(filteredExpenses, 6), [filteredExpenses]);

  const avgPerMonth = useMemo(() => {
    const nonEmpty = monthsData.filter((m) => m.total > 0);
    if (!nonEmpty.length) return 0;
    return Math.round(nonEmpty.reduce((a, b) => a + b.total, 0) / nonEmpty.length);
  }, [monthsData]);

  function buildCsv(rows) {
    return rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
  }

  const handleAdd = async () => {
    if (!desc.trim() || !amount) return;
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAuthError("Please enter a valid positive amount.");
      return;
    }
    setAuthError("");
    const payload = {
      desc: desc.trim(),
      amount: parsedAmount,
      date: new Date().toISOString().split("T")[0],
      category,
    };

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setAuthError("You are offline. Reconnect to save expenses to MongoDB.");
        return;
      }
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setExpenses((curr) => [json.expense, ...curr]);
        setDesc("");
        setAmount("");
        setCategory("other");
      } else if (res.status === 401) {
        setAuthError(json.message);
      } else {
        setAuthError(json.message || "Failed to save expense.");
      }
    } catch {
      setAuthError("Failed to save expense. Please try again when connected.");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["date", "description", "category", "amount"],
      ...filteredExpenses.map((e) => [
        e.date || "",
        e.desc || "",
        e.category || "other",
        Number.isFinite(Number(e.amount)) ? Number(e.amount) : "",
      ]),
    ];
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      startDate || endDate
        ? `expenses-${startDate || "start"}-to-${endDate || "end"}.csv`
        : "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      {/* Header — total derived from filtered set */}
      <div className="flex justify-between items-center bg-green-600 rounded-2xl p-6 shadow-md text-white">
        <div>
          <h1 className="text-xl font-bold opacity-90">
            {startDate || endDate ? "Filtered Total Expenses" : "Total Expenses"}
          </h1>
          <p className="text-3xl font-extrabold mt-1">₹{total.toLocaleString("en-IN")}</p>
          {(startDate || endDate) && (
            <p className="text-xs opacity-70 mt-1">
              {startDate || "…"} → {endDate || "…"}
            </p>
          )}
        </div>
        <div className="text-5xl opacity-30" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 14v-6M12 18V8M17 11V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Add expense form */}
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 space-y-4">
        <h2 className="font-bold text-gray-800">नया खर्च जोड़ें</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">विवरण</span>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="उदा: बीज"
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Expense description"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">राशि (₹)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="₹"
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Expense amount"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">श्रेणी</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Expense category"
            >
              <option value="other">अन्य</option>
              <option value="seeds">बीज</option>
              <option value="fertilizer">उर्वरक</option>
              <option value="labor">श्रम</option>
              <option value="transport">परिवहन</option>
              <option value="equipment">उपकरण</option>
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button
              onClick={handleAdd}
              disabled={!amount || !desc.trim()}
              className="flex-1 min-h-[44px] rounded-xl bg-green-600 text-white font-semibold active:scale-95 transition-all shadow disabled:opacity-50"
              aria-label="Save expense"
            >
              खर्च सुरक्षित करें
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3" aria-live="polite">
          {authError && <span className="text-xs text-red-500 font-semibold">{authError}</span>}
          <span className="text-xs text-gray-500">
            {typeof navigator !== "undefined" && navigator.onLine ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Chart + stats + list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-gray-800 mt-2">हाल के खर्च</h2>
          <div className="text-sm text-gray-500">Last 6 months</div>
        </div>

        <div className="bg-white/60 rounded-xl p-3 border border-gray-100 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Chart now reflects filteredExpenses */}
            <MonthlyExpenseChart data={monthsData} />
          </div>
          <div className="w-56 shrink-0 text-right text-xs text-gray-600 space-y-2">
            <div>Total: ₹{total.toLocaleString("en-IN")}</div>
            <div>Avg/month: ₹{avgPerMonth.toLocaleString("en-IN")}</div>
            <fieldset className="space-y-2" aria-label="Date range filter and CSV export">
              <legend className="sr-only">Date range filter and CSV export</legend>
              <div className="flex items-center gap-2 justify-end">
                <label className="sr-only" htmlFor="expenses-start-date">Start date</label>
                <input
                  id="expenses-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs rounded border px-2 py-1"
                />
                <label className="sr-only" htmlFor="expenses-end-date">End date</label>
                <input
                  id="expenses-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs rounded border px-2 py-1"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="text-xs text-gray-500 underline-offset-2 hover:underline"
                >
                  Clear dates
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="text-xs text-gray-700 underline-offset-2 hover:underline"
                >
                  Export CSV
                </button>
              </div>
            </fieldset>
            <div className="text-xs text-gray-500">Saved directly to MongoDB.</div>
          </div>
        </div>

        {loading ? (
          <div className="h-16 bg-green-50 animate-pulse rounded-xl w-full" aria-label="Loading expenses" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {filteredExpenses.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
                  No expenses found for the selected range.
                </p>
              ) : (
                filteredExpenses.map((e) => (
                  <div
                    key={e._id || e.id}
                    className="flex justify-between items-center bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {e.desc} <span className="text-xs text-gray-400">• {e.category || "other"}</span>
                      </p>
                      <p className="text-xs text-gray-500">{e.date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="font-bold text-red-500">
                        - ₹{Number(e.amount).toLocaleString("en-IN")}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/expenses/${e._id || e.id}`, { method: "DELETE" });
                            const j = await res.json();
                            if (j.success)
                              setExpenses((curr) =>
                                curr.filter((x) => String(x._id || x.id) !== String(e._id || e.id))
                              );
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="text-xs text-gray-500 underline-offset-2 hover:underline"
                        aria-label={`Delete expense ${e.desc}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <aside className="lg:col-span-1">
              <ProfitCalculator
                land={profile?.farmSize || 1}
                crop={profile?.cropType || "Wheat"}
                handleReset={() => {}}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
