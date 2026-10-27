"use client";

import ProfitCalculator from "@/components/tools/ProfitCalculator";

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      <div>
          <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">कैलकुलेटर</h1>
        <p className="mt-1 text-sm text-brand-textMid">
          अपनी फसल का मुनाफ़ा और सही मंडी का चुनाव करें।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfitCalculator />
        
        {/* Placeholder for more tools in future */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
            <span className="text-5xl mb-3" aria-hidden>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          <h3 className="font-bold text-green-800">और उपकरण जल्द आ रहे हैं</h3>
          <p className="text-sm text-green-600 mt-2">खाद कैलकुलेटर, बीज मात्रा कैलकुलेटर आदि।</p>
        </div>
      </div>
    </div>
  );
}
