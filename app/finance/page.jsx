"use client";

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">🏦 लोन व बीमा</h1>
        <p className="mt-1 text-sm text-brand-textMid">KCC और फसल बीमा के लिए आसानी से आवेदन करें।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition-all">
            <h2 className="text-lg font-bold text-gray-900 border-b border-green-100 pb-2">Kisan Credit Card (KCC)</h2>
            <p className="text-sm text-gray-600 mt-2">कम ब्याज दर (4%) पर 3 लाख तक का कृषि ऋण प्राप्त करें।</p>
            <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
               <li>आधार कार्ड अनिवार्य</li>
               <li>जमीन के कागजात (फ़र्द)</li>
            </ul>
            <button className="mt-4 w-full min-h-[44px] bg-green-600 text-white font-semibold rounded-xl active:scale-95 transition-all shadow">
               आवेदन फॉर्म डाउनलोड करें
            </button>
         </div>

         <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition-all">
            <h2 className="text-lg font-bold text-gray-900 border-b border-green-100 pb-2">PM Fasal Bima Yojana</h2>
            <p className="text-sm text-gray-600 mt-2">सूखा, बाढ़ या कीट हमले पर फसल मुआवजे की गारंटी।</p>
            <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
               <li>रबी फसल के लिए: 1.5% प्रीमियम</li>
               <li>खरीफ फसल के लिए: 2% प्रीमियम</li>
            </ul>
            <button className="mt-4 w-full min-h-[44px] bg-blue-600 text-white font-semibold rounded-xl active:scale-95 transition-all shadow">
               प्रीमियम कैलकुलेट करें
            </button>
         </div>
      </div>
    </div>
  );
}
