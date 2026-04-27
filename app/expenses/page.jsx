"use client";

import { useState, useEffect } from "react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const json = await res.json();
      if (json.success) setExpenses(json.expenses);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAdd = async () => {
    if (!desc || !amount) return;
    setAuthError("");
    try {
      const res = await fetch("/api/expenses", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ desc, amount, date: new Date().toISOString().split("T")[0] })
      });
      const json = await res.json();
      if (json.success) {
         setExpenses([json.expense, ...expenses]);
         setDesc("");
         setAmount("");
      } else {
         if (res.status === 401) setAuthError(json.message);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div className="flex justify-between items-center bg-green-600 rounded-2xl p-6 shadow-md text-white">
        <div>
           <h1 className="text-xl font-bold opacity-90">कुल खर्च</h1>
           <p className="text-3xl font-extrabold mt-1">₹{total.toLocaleString()}</p>
        </div>
        <div className="text-5xl opacity-30">📊</div>
      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 space-y-4">
         <h3 className="font-bold text-gray-800">नया खर्च जोड़ें</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="विवरण (उदा: बीज)"
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
            />
            <input 
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="राशि (₹)"
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
            />
         </div>
         <div className="flex items-center gap-3">
            {authError && <span className="text-xs text-red-500 font-semibold">{authError}</span>}
            <button 
              onClick={handleAdd}
              disabled={!amount || !desc}
              className="flex-1 min-h-[44px] rounded-xl bg-green-600 text-white font-semibold active:scale-95 transition-all shadow disabled:opacity-50"
            >
              खर्च सुरक्षित करें
            </button>
         </div>
      </div>

      <div className="space-y-3">
         <h3 className="font-bold text-gray-800 mt-2">हाल के खर्च</h3>
         {loading ? (
             <div className="h-16 bg-green-50 animate-pulse rounded-xl w-full"></div>
         ) : expenses.map(e => (
           <div key={e._id || e.id} className="flex justify-between items-center bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div>
               <p className="font-semibold text-gray-900">{e.desc}</p>
               <p className="text-xs text-gray-500">{e.date}</p>
             </div>
             <p className="font-bold text-red-500">- ₹{e.amount}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
