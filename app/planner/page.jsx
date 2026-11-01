"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

const ProfitCalculator = dynamic(() => import("@/components/planner/ProfitCalculator"), { ssr: false });
const Reminders = dynamic(() => import("@/components/Reminders"), { ssr: false });

export default function PlannerPage() {
  const { t } = useLang();
  const [land, setLand] = useState("");
  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState("Loamy");
  const [showProfit, setShowProfit] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
          {t.planner?.title || "Smart Crop Planner"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.planner?.subtitle || "Choose the optimal crop tailored to your land and soil."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.planner?.landAcre || "Land (in Acres)"}
            </label>
            <input 
              type="number"
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500" 
              placeholder={t.planner?.landPlaceholder || "e.g., 5"}
              value={land}
              onChange={e => setLand(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.planner?.soilType || "Soil Type"}
            </label>
            <select 
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              value={soil}
              onChange={e => setSoil(e.target.value)}
            >
              <option value="Loamy">{t.planner?.soilLoamy || "Loamy"}</option>
              <option value="Clay">{t.planner?.soilClay || "Clay"}</option>
              <option value="Sandy">{t.planner?.soilSandy || "Sandy"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.planner?.proposedCrop || "Proposed Crop"}
            </label>
            <select 
              className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500"
              value={crop}
              onChange={e => setCrop(e.target.value)}
            >
              <option value="">{t.planner?.selectCrop || "-- Select Crop --"}</option>
              <option value="wheat">{t.planner?.wheat || "Wheat"}</option>
              <option value="rice">{t.planner?.rice || "Rice"}</option>
              <option value="mustard">{t.planner?.mustard || "Mustard"}</option>
            </select>
          </div>
          <button 
            type="button" 
            disabled={!land || !crop}
            onClick={() => setShowProfit(true)}
            className="w-full bg-green-600 text-white font-semibold min-h-[44px] rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {t.planner?.viewProfit || "Calculate Estimated Profit"}
          </button>
        </div>

        {showProfit && (
          <div className="transition-all duration-300">
            <ProfitCalculator land={land} crop={crop} soil={soil} handleReset={() => setShowProfit(false)} />
          </div>
        )}
        <div className="md:col-span-2">
          <Reminders />
        </div>
      </div>
    </div>
  );
}
