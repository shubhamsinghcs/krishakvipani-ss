"use client";

import ProfitCalculator from "@/components/tools/ProfitCalculator";
import { useLang } from "@/lib/LanguageContext";

export default function CalculatorPage() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
          {t.calculator?.title || "Farm Profit Calculator"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.calculator?.subtitle || "Estimated yield, price, and profit for your farm."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfitCalculator />
        
        {/* Placeholder for more tools in future */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <span className="text-5xl mb-3 text-green-700" aria-hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <h3 className="font-bold text-green-800">
            {t.calculator?.moreToolsComing || "More Tools Coming Soon"}
          </h3>
          <p className="text-sm text-green-600 mt-2">
            {t.calculator?.toolsSubtitle || "Fertilizer calculator, seed rate calculator, and more."}
          </p>
        </div>
      </div>
    </div>
  );
}
