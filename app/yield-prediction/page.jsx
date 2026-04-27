"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function YieldPredictionPage() {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    crop: "wheat",
    landSize: "",
    weather: "sunny",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.landSize || isNaN(formData.landSize)) {
      setError(t("yield.invalidLandSize") || "Please enter a valid land size in acres.");
      return;
    }
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || t("yield.errorCalculate") || "Failed to calculate yield.");
      }
    } catch (err) {
      setError(t("yield.networkError") || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{t("yield.title") || "Yield Prediction"}</h1>
      </div>

      {/* Input Form */}
      <section className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-3xl shadow-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("yield.cropType") || "Crop Type"}</label>
            <select
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              <option value="wheat">{t("yield.wheat") || "Wheat"}</option>
              <option value="rice">{t("yield.rice") || "Rice"}</option>
              <option value="cotton">{t("yield.cotton") || "Cotton"}</option>
              <option value="sugarcane">{t("yield.sugarcane") || "Sugarcane"}</option>
              <option value="maize">{t("yield.maize") || "Maize"}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("yield.landSize") || "Land Size (Acres)"}</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={formData.landSize}
              onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              placeholder="e.g. 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("yield.weather") || "Expected Weather"}</label>
            <select
              value={formData.weather}
              onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              <option value="sunny">{t("yield.weatherSunny") || "Sunny / Normal"}</option>
              <option value="rainy">{t("yield.weatherRainy") || "Heavy Rain"}</option>
              <option value="drought">{t("yield.weatherDrought") || "Drought / Dry"}</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              t("yield.predict") || "Predict Yield"
            )}
          </button>
        </form>
      </section>

      {/* Results Section */}
      {result && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/60 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-sm font-bold text-yellow-800 mb-1">{t("yield.estimatedHarvest") || "Estimated Harvest"}</h2>
            <div className="flex items-baseline gap-2 text-yellow-900">
              <span className="text-4xl font-black">{result.estimatedYield}</span>
              <span className="text-lg font-semibold">{t(`yield.unit.${result.unit}`) || result.unit}</span>
            </div>
            
            <div className="mt-4 flex items-center justify-between bg-white/60 p-3 rounded-xl">
              <span className="text-sm font-medium text-gray-700">{t("yield.confidence") || "AI Confidence"}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-800">{result.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">{t("yield.recommendations") || "AI Recommendations"}</h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2 bg-gray-50/50 p-3 rounded-xl">
                  <span className="text-brand-primary mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
