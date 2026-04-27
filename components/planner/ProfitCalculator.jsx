"use client";

import { useState } from "react";

export default function ProfitCalculator({ land, crop, soil, handleReset }) {
  const [cost, setCost] = useState(0);

  // Mock standard yields
  const yieldPerAcre = crop.toLowerCase().includes("wheat") ? 20 : crop.toLowerCase().includes("rice") ? 25 : 15;
  const pricePerQuintal = crop.toLowerCase().includes("wheat") ? 2275 : crop.toLowerCase().includes("rice") ? 2300 : 5000;
  
  const expectedYield = parseFloat(land || 0) * yieldPerAcre;
  const grossProfit = expectedYield * pricePerQuintal;
  const netProfit = grossProfit - parseFloat(cost || 0);

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 space-y-4">
      <h3 className="text-lg font-bold text-brand-textDark border-b pb-2 border-green-100">💰 अनुमानित लाभ</h3>
      
      <div>
        <label className="text-sm font-medium text-gray-700">अनुमानित लागत (₹)</label>
        <input 
          type="number"
          placeholder="उदा: 10000"
          value={cost || ""}
          onChange={e => setCost(e.target.value)}
          className="w-full mt-1 min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500" 
        />
      </div>

      <div className="bg-green-50 rounded-xl p-4 space-y-2 border border-green-100">
        <p className="flex justify-between text-sm text-gray-700">
          <span>कुल उपज:</span> <span className="font-semibold">{expectedYield} क्विंटल</span>
        </p>
        <p className="flex justify-between text-sm text-gray-700">
          <span>अनुमानित आय:</span> <span className="font-semibold text-blue-700">₹{grossProfit.toLocaleString()}</span>
        </p>
        <div className="border-t border-green-200 pt-2 flex justify-between text-base font-bold">
          <span>शुद्ध लाभ:</span> 
          <span className={netProfit >= 0 ? "text-green-700" : "text-red-600"}>
            ₹{netProfit.toLocaleString()}
          </span>
        </div>
      </div>

      <button 
        onClick={handleReset}
        className="w-full min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-semibold active:scale-95 transition-all shadow-sm"
      >
        नयी गणना करें
      </button>
    </div>
  );
}
