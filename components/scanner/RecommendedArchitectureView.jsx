"use client";

import { useLang } from "@/lib/LanguageContext";

export const ARCHITECTURE_TIERS = [
  {
    id: 1,
    title: { en: "Farmer interface", hi: "किसान इंटरफ़ेस", pa: "ਕਿਸਾਨ ਇੰਟਰਫੇਸ" },
    subtitle: {
      en: "Existing Crop Scanner · Camera · Gallery · Crop selection",
      hi: "कैमरा · गैलरी · 1-3 तस्वीरें · फसल पुष्टि",
      pa: "ਕੈਮਰਾ · ਗੈਲਰੀ · 1-3 ਫੋਟੋਆਂ · ਫ਼ਸਲ ਚੋਣ",
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    ),
    isHighlighted: true,
  },
  {
    id: 2,
    title: { en: "Image processing and quality control", hi: "छवि प्रसंस्करण व गुणवत्ता नियंत्रण", pa: "ਤਸਵੀਰ ਗੁਣਵੱਤਾ ਜਾਂਚ" },
    subtitle: {
      en: "Validation · Blur detection · Resolution · Plant detection · Preprocessing",
      hi: "धुंधलापन जांच · रिज़ॉल्यूशन · पत्ती पहचान · प्री-प्रोसेसिंग",
      pa: "ਧੁੰਦਲਾਪਨ ਜਾਂਚ · ਪੌਦਾ ਪਛਾਣ · ਰੈਜ਼ੋਲਿਊਸ਼ਨ",
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    isHighlighted: false,
  },
  {
    id: 3,
    title: { en: "Crop disease AI engine", hi: "फसल रोग AI इंजन", pa: "ਫ਼ਸਲ ਰੋਗ AI ਇੰਜਣ" },
    subtitle: {
      en: "Crop-specific computer vision · Disease classification · Unknown detection",
      hi: "फसल-विशिष्ट कंप्यूटर विज़न · बहु-दृश्य विश्लेषण · अज्ञात रोग पहचान",
      pa: "ਕੰਪਿਊਟਰ ਵਿਜ਼ਨ · ਰੋਗ ਵਰਗੀਕਰਨ · ਅਣਪਛਾਤੇ ਰੋਗ",
    },
    badge: "Core intelligence",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8v3H8v-3c-3-1.5-5-4.5-5-8a9 9 0 0 1 9-9z" />
        <path d="M9 10h.01M15 10h.01M10 14a2 2 0 0 0 4 0" />
      </svg>
    ),
    isHighlighted: true,
  },
  {
    id: 4,
    title: { en: "Diagnosis verification and decision engine", hi: "निदान सत्यापन व निर्णय इंजन", pa: "ਨਿਦਾਨ ਤਸਦੀਕ ਇੰਜਣ" },
    subtitle: {
      en: "Confidence calibration · Alternative predictions · Expert escalation",
      hi: "कैलिब्रेटेड विश्वास स्तर · वैकल्पिक रोग संभावनाएं · विशेषज्ञ रेफरल",
      pa: "ਵਿਸ਼ਵਾਸ ਪੱਧਰ ਕੈਲੀਬ੍ਰੇਸ਼ਨ · ਬਦਲਵੇਂ ਰੋਗ · ਮਾਹਿਰ ਰੈਫਰਲ",
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="3" x2="12" y2="21" />
        <polyline points="4 7 12 3 20 7" />
        <polyline points="4 17 8 13 12 17" />
        <polyline points="12 17 16 13 20 17" />
      </svg>
    ),
    isHighlighted: false,
  },
  {
    id: 5,
    title: { en: "Agricultural knowledge and advisory engine", hi: "कृषि ज्ञान व परामर्श इंजन", pa: "ਖੇਤੀਬਾੜੀ ਗਿਆਨ ਇੰਜਣ" },
    subtitle: {
      en: "ICAR · PAU · KVK · Validated crop protection guidance",
      hi: "ICAR · PAU · KVK · CIBRC प्रमाणित उपचार व सुरक्षा समय (PHI)",
      pa: "ਸਰਕਾਰੀ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਮਾਰਗਦਰਸ਼ਨ (ICAR, PAU, CIBRC)",
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
      </svg>
    ),
    isHighlighted: false,
  },
  {
    id: 6,
    title: { en: "Farmer diagnosis report", hi: "किसान निदान रिपोर्ट", pa: "ਕਿਸਾਨ ਨਿਦਾਨ ਰਿਪੋਰਟ" },
    subtitle: {
      en: "Likely disease · Evidence · Next steps · Advisory · Expert support",
      hi: "संभावित रोग · दिखाई देने वाले लक्षण · त्वरित कदम · प्रमाणित सलाह",
      pa: "ਸੰਭਾਵੀ ਰੋਗ · ਲੱਛਣ ਸਬੂਤ · ਅਗਲੇ ਕਦਮ · ਮਾਹਿਰ ਮਦਦ",
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    isHighlighted: true,
  },
];

export default function RecommendedArchitectureView({ currentStep = null, compact = false }) {
  const { lang } = useLang();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700 text-sm font-bold">
            🏗️
          </span>
          <h3 className="text-base font-bold text-gray-900">
            {lang === "hi"
              ? "सिफारिश की गई प्रणाली संरचना (प्रमाणित 6-स्तरीय पाइपलाइन)"
              : lang === "pa"
              ? "ਸਿਸਟਮ ਢਾਂਚਾ (6-ਪੜਾਵੀ ਪ੍ਰਮਾਣਿਤ ਪਾਈਪਲਾਈਨ)"
              : "Recommended architecture"}
          </h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
          ICAR · PAU · CIBRC Verified
        </span>
      </div>

      <div className="space-y-2.5 max-w-2xl mx-auto py-1">
        {ARCHITECTURE_TIERS.map((tier, idx) => {
          const isActive = currentStep !== null && currentStep === tier.id;
          const isCompleted = currentStep !== null && currentStep > tier.id;

          // Green tint for tiers 1, 3, 6 (or active state)
          const isGreenCard = tier.isHighlighted || isActive || isCompleted;

          return (
            <div key={tier.id} className="space-y-2">
              <div
                className={`relative rounded-xl p-3.5 sm:p-4 text-center transition-all ${
                  isActive
                    ? "ring-2 ring-emerald-500 bg-emerald-100/90 shadow-md scale-[1.02]"
                    : isGreenCard
                    ? "bg-[#EBF7EE] border border-green-200 shadow-2xs hover:border-green-300"
                    : "bg-white border border-gray-200 shadow-2xs hover:border-gray-300"
                }`}
              >
                {/* Icon */}
                <div
                  className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${
                    isActive
                      ? "text-emerald-700 animate-bounce"
                      : isGreenCard
                      ? "text-emerald-700"
                      : "text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  ) : (
                    tier.icon
                  )}
                </div>

                {/* Title */}
                <h4
                  className={`text-sm sm:text-base font-bold ${
                    isActive ? "text-emerald-950" : isGreenCard ? "text-[#1C3A27]" : "text-gray-800"
                  }`}
                >
                  {tier.title[lang] || tier.title.en}
                </h4>

                {/* Subtitle / Details */}
                <p className="text-xs text-gray-500 font-medium mt-0.5 tracking-tight">
                  {tier.subtitle[lang] || tier.subtitle.en}
                </p>

                {/* Badge if present (e.g. Core intelligence) */}
                {tier.badge && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#BFF0CC] px-2.5 py-0.5 text-[11px] font-bold text-[#14532D] shadow-2xs">
                    <span>✨</span>
                    <span>{tier.badge}</span>
                  </div>
                )}
              </div>

              {/* Downward Arrow between tiers */}
              {idx < ARCHITECTURE_TIERS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <span
                    className={`text-sm font-bold select-none ${
                      isCompleted ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    ↓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
