"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import {
  IconSprout,
  IconTrendingUp,
  IconCalendar,
  IconShieldCheck,
} from "@/components/ui/Icons";

const ProfitCalculator = dynamic(
  () => import("@/components/planner/ProfitCalculator"),
  { ssr: false }
);
const Reminders = dynamic(() => import("@/components/Reminders"), { ssr: false });

export default function PlannerPage() {
  const { t, lang } = useLang();
  const [land, setLand] = useState("");
  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState("Loamy");
  const [showProfit, setShowProfit] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <IconSprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-950 md:text-3xl">
              {lang === "hi"
                ? "मेरी खेती व फसल योजना (My Farm Planner)"
                : lang === "pa"
                ? "ਮੇਰੀ ਖੇਤੀ ਅਤੇ ਯੋਜਨਾ"
                : "My Farm & Crop Planner"}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
              {t.planner?.subtitle ||
                "Choose the optimal crop tailored to your land acreage, soil chemistry, and projected market prices."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
              <IconTrendingUp className="w-4 h-4 text-emerald-700" />
              <span>{lang === "hi" ? "भूमि व फसल विवरण" : "Land & Crop Input"}</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              PAU / ICAR Cost Model
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.planner?.landAcre || (lang === "hi" ? "कुल कृषि भूमि (एकड़ में)" : "Land (in Acres)")}
            </label>
            <input
              type="number"
              className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              placeholder={t.planner?.landPlaceholder || "e.g., 5"}
              value={land}
              onChange={(e) => setLand(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.planner?.soilType || (lang === "hi" ? "मिट्टी का प्रकार" : "Soil Type")}
            </label>
            <select
              className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
              value={soil}
              onChange={(e) => setSoil(e.target.value)}
            >
              <option value="Loamy">{t.planner?.soilLoamy || "Loamy (दोमट मिट्टी)"}</option>
              <option value="Clay">{t.planner?.soilClay || "Clay (चिकनी मिट्टी)"}</option>
              <option value="Sandy">{t.planner?.soilSandy || "Sandy (बलुई मिट्टी)"}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.planner?.proposedCrop || (lang === "hi" ? "प्रस्तावित फसल" : "Proposed Crop")}
            </label>
            <select
              className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            >
              <option value="">{t.planner?.selectCrop || "-- Select Crop --"}</option>
              <option value="wheat">{t.planner?.wheat || "Wheat (गेहूं)"}</option>
              <option value="rice">{t.planner?.rice || "Rice / Paddy (धान)"}</option>
              <option value="mustard">{t.planner?.mustard || "Mustard (सरसों)"}</option>
            </select>
          </div>

          <button
            type="button"
            disabled={!land || !crop}
            onClick={() => setShowProfit(true)}
            className="w-full bg-emerald-700 text-white font-bold min-h-[44px] rounded-xl hover:bg-emerald-800 active:scale-95 transition-all shadow-xs disabled:opacity-50 text-xs sm:text-sm"
          >
            {t.planner?.viewProfit || (lang === "hi" ? "अनुमानित लाभ व लागत की गणना करें" : "Calculate Estimated Profit")}
          </button>
        </div>

        {showProfit && (
          <div className="transition-all duration-300">
            <ProfitCalculator
              land={land}
              crop={crop}
              soil={soil}
              handleReset={() => setShowProfit(false)}
            />
          </div>
        )}

        <div className="md:col-span-2">
          <Reminders />
        </div>
      </div>
    </div>
  );
}
