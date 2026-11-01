"use client";

import { useLang } from "@/lib/LanguageContext";

export default function FinancePage() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
          {t.finance?.title || "Loans & Insurance"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.finance?.subtitle || "Easily apply for Kisan Credit Card (KCC) and crop insurance."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition-all">
          <h2 className="text-lg font-bold text-gray-900 border-b border-green-100 pb-2">
            {t.finance?.kccTitle || "Kisan Credit Card (KCC)"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t.finance?.kccDesc || "Get agricultural loans up to ₹3 Lakh at low interest rates (4%)."}
          </p>
          <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
            <li>{t.finance?.kccReq1 || "Aadhaar Card mandatory"}</li>
            <li>{t.finance?.kccReq2 || "Land ownership documents (Fard/Khasra)"}</li>
          </ul>
          <button className="mt-4 w-full min-h-[44px] bg-green-600 text-white font-semibold rounded-xl active:scale-95 transition-all shadow">
            {t.finance?.kccDownload || "Download Application Form"}
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition-all">
          <h2 className="text-lg font-bold text-gray-900 border-b border-green-100 pb-2">
            {t.finance?.pmfbyTitle || "PM Fasal Bima Yojana"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t.finance?.pmfbyDesc || "Guaranteed compensation for drought, flood, or pest damage."}
          </p>
          <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
            <li>{t.finance?.pmfbyRabi || "For Rabi crops: 1.5% premium"}</li>
            <li>{t.finance?.pmfbyKharif || "For Kharif crops: 2% premium"}</li>
          </ul>
          <button className="mt-4 w-full min-h-[44px] bg-blue-600 text-white font-semibold rounded-xl active:scale-95 transition-all shadow">
            {t.finance?.pmfbyCalculate || "Calculate Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}
