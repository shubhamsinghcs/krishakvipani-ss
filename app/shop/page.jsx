"use client";

import { useState } from "react";

const MOCK_PRODUCTS = [
  { id: 1, name: "Pusa 44 Rice Seeds", category: "Seeds", price: 1200, unit: "10kg", badge: "Best Seller" },
  { id: 2, name: "DAP Fertilizer", category: "Fertilizer", price: 1350, unit: "50kg" },
  { id: 3, name: "UVM Wheat Seeds", category: "Seeds", price: 950, unit: "10kg" },
  { id: 4, name: "Neem Oil Pesticide", category: "Pesticide", price: 450, unit: "1L", badge: "Organic" },
];

export default function MarketPage() {
  const [filter, setFilter] = useState("All");
  const [authError, setAuthError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const filtered = filter === "All" ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter(p => p.category === filter);

  const handleBuy = async (productId, price) => {
    setAuthError("");
    setLoadingId(productId);
    try {
      const res = await fetch("/api/market/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1, totalCost: price })
      });
      const json = await res.json();
      if (json.success) {
        alert("आपका ऑर्डर 🚀 सफलता पूर्वक बुक हो गया है!");
      } else {
        if (res.status === 401) setAuthError(json.message);
      }
    } catch {
       setAuthError("सर्वर त्रुटि।");
    } finally {
       setLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">🛒 दुकान (बीज व खाद)</h1>
        <p className="mt-1 text-sm text-brand-textMid">सस्ते और असली उत्पाद सीधे कंपनियों से।</p>
        {authError && <p className="text-xs text-red-500 font-bold mt-2">⚠️ {authError}</p>}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Seeds", "Fertilizer", "Pesticide"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`min-h-[36px] px-4 rounded-full text-sm font-semibold transition active:scale-95 whitespace-nowrap ${filter === f ? "bg-green-600 text-white" : "bg-white border border-green-200 text-gray-600 shadow-sm"}`}
          >
            {f === "All" ? "सभी" : f === "Seeds" ? "बीज" : f === "Fertilizer" ? "खाद" : "कीटनाशक"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 min-h-[160px]">
             <div>
               {p.badge && <span className="inline-block px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold mb-2">{p.badge}</span>}
               <h3 className="font-bold text-gray-800">{p.name}</h3>
               <p className="text-sm text-gray-500 mt-0.5">{p.category} | {p.unit}</p>
             </div>
             <div className="mt-4 flex items-center justify-between">
               <span className="text-xl font-bold text-brand-accent">₹{p.price}</span>
               <button 
                  onClick={() => handleBuy(p.id, p.price)}
                  disabled={loadingId === p.id}
                  className="min-h-[40px] px-6 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 active:scale-95 transition-all shadow disabled:opacity-50"
                >
                 {loadingId === p.id ? "ऑर्डर हो रहा है..." : "खरीदें"}
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
