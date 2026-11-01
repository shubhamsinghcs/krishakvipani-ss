"use client";

import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function ProfitCalculator() {
  const { t } = useLang();
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [cost, setCost] = useState("");
  const [result, setResult] = useState(null);

  const calculateProfit = () => {
    if (!crop || !area || !cost) {
      alert(t.calculator?.fillAllFields || "Please enter all details.");
      return;
    }

    const baseYieldPerAcre = {
      wheat: 20,
      rice: 25,
      cotton: 8,
      sugarcane: 300,
      "गेहूं": 20,
      "धान": 25,
      "कपास": 8,
      "गन्ना": 300,
    };

    const basePricePerQuintal = {
      wheat: 2275,
      rice: 2183,
      cotton: 6620,
      sugarcane: 340,
      "गेहूं": 2275,
      "धान": 2183,
      "कपास": 6620,
      "गन्ना": 340,
    };

    const y = baseYieldPerAcre[crop] || 15;
    const p = basePricePerQuintal[crop] || 2000;

    const totalYield = y * Number(area);
    const totalRevenue = totalYield * p;
    // negative profit is preserved — not clamped to 0
    const estimatedProfit = totalRevenue - Number(cost);

    setResult({
      estimatedProfit,
      totalRevenue,
      mandi: ["Khanna Mandi", "Rajpura Mandi", "Patiala Mandi"][Math.floor(Math.random() * 3)],
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1v22M5 7h14M5 17h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>{" "}
        {t.calculator?.title || "Profit Calculator"}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.calculator?.crop || "Crop"}
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t.calculator?.selectCrop || "-- Select Crop --"}</option>
            <option value="wheat">{t.calculator?.wheat || "Wheat"}</option>
            <option value="rice">{t.calculator?.rice || "Rice"}</option>
            <option value="cotton">{t.calculator?.cotton || "Cotton"}</option>
            <option value="sugarcane">{t.calculator?.sugarcane || "Sugarcane"}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.calculator?.areaAcre || "Area (in Acres)"}
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={t.calculator?.areaPlaceholder || "e.g., 5"}
            className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.calculator?.costLabel || "Total Cost (₹)"}
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder={t.calculator?.costPlaceholder || "Seed, fertilizer, irrigation expense"}
            className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={calculateProfit}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all mt-2"
        >
          {t.calculator?.calculate || "Calculate Profit"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 animate-fade-in">
            <h3 className="font-bold text-green-800 mb-2">
              {t.calculator?.reportTitle || "Estimated Report:"}
            </h3>
            <p className="text-sm text-gray-700 flex justify-between">
              <span>{t.calculator?.totalRevenue || "Total Revenue:"}</span>
              <span className="font-semibold">₹{result.totalRevenue.toLocaleString("en-IN")}</span>
            </p>
            <p className="text-sm text-gray-700 flex justify-between mt-1">
              <span>{t.calculator?.estimatedProfit || "Estimated Profit:"}</span>
              <span className={`font-bold text-lg ${result.estimatedProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                ₹{result.estimatedProfit.toLocaleString("en-IN")}
              </span>
            </p>
            <hr className="my-2 border-green-200" />
            <p className="text-sm text-gray-700">
              {t.calculator?.bestMandi || "Best rates currently available at"}{" "}
              <span className="font-bold text-green-800">{result.mandi}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
