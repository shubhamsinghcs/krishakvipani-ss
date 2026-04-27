"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ProfitCalculator = dynamic(() => import("@/components/planner/ProfitCalculator"), { ssr: false });

export default function PlannerPage() {
  const [land, setLand] = useState("");
  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState("Loamy");
  const [showProfit, setShowProfit] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">🌾 स्मार्ट फसल योजना</h1>
        <p className="mt-1 text-sm text-brand-textMid">अपनी ज़मीन और मिट्टी के अनुसार सही फसल चुनें।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ज़मीन (एकड़ में)</label>
            <input 
              type="number"
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="जैसे: 5"
              value={land}
              onChange={e => setLand(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">मिट्टी का प्रकार</label>
            <select 
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              value={soil}
              onChange={e => setSoil(e.target.value)}
            >
              <option>दोमट (Loamy)</option>
              <option>चिकनी (Clay)</option>
              <option>रेतीली (Sandy)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">प्रस्तावित फसल</label>
            <select 
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              value={crop}
              onChange={e => setCrop(e.target.value)}
            >
              <option value="">-- चुनें --</option>
              <option value="wheat">गेहूँ (Wheat)</option>
              <option value="rice">धान (Rice)</option>
              <option value="mustard">सरसों (Mustard)</option>
            </select>
          </div>
          <button 
            type="button" 
            disabled={!land || !crop}
            onClick={() => setShowProfit(true)}
            className="w-full bg-green-600 text-white font-semibold min-h-[44px] rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            अनुमानित लाभ देखें
          </button>
        </div>

        {showProfit && (
          <div className="transition-all duration-300">
            <ProfitCalculator land={land} crop={crop} soil={soil} handleReset={() => setShowProfit(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
