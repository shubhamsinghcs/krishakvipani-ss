"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";

const ImageUploader = dynamic(() => import("@/components/scanner/ImageUploader"), { ssr: false });
const DiseaseResult = dynamic(() => import("@/components/scanner/DiseaseResult"), { ssr: false });
const RecommendedArchitectureView = dynamic(
  () => import("@/components/scanner/RecommendedArchitectureView"),
  { ssr: false }
);

export default function ScannerPage() {
  const { t, lang } = useLang();
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0); // 0 to 5
  const [error, setError] = useState("");
  const [showArchitecture, setShowArchitecture] = useState(false);

  const onFilesChange = useCallback((next) => {
    setFiles(next);
    setResult(null);
    setError("");
    setImageUrls(next.map((f) => URL.createObjectURL(f)));
  }, []);

  // Multi-stage 6-tier scan progress simulation while waiting for API response
  useEffect(() => {
    let interval;
    if (isScanning) {
      setScanStage(0);
      interval = setInterval(() => {
        setScanStage((prev) => (prev < 5 ? prev + 1 : prev));
      }, 950);
    } else {
      setScanStage(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Aligned directly to the 6-tier Recommended Architecture
  const stagesText = [
    {
      en: "1/6 Farmer Interface: Validating 1-3 photos & confirmed crop...",
      hi: "1/6 किसान इंटरफ़ेस: तस्वीरों व फसल की पुष्टि की जा रही है...",
      pa: "1/6 ਕਿਸਾਨ ਇੰਟਰਫੇਸ: ਤਸਵੀਰਾਂ ਅਤੇ ਫ਼ਸਲ ਦੀ ਪੁਸ਼ਟੀ...",
    },
    {
      en: "2/6 Quality Control: Inspecting resolution, blur & foliage spectrum...",
      hi: "2/6 गुणवत्ता नियंत्रण: रिज़ॉल्यूशन, धुंधलापन व पत्ती पहचान की जांच...",
      pa: "2/6 ਗੁਣਵੱਤਾ ਜਾਂਚ: ਰੈਜ਼ੋਲਿਊਸ਼ਨ, ਧੁੰਦਲਾਪਨ ਅਤੇ ਪੌਦੇ ਦੀ ਜਾਂਚ...",
    },
    {
      en: "3/6 AI Vision Engine: Multi-view foliar pathology analysis...",
      hi: "3/6 AI विज़न इंजन: बहु-दृश्य फफूंद व रोग लक्षणों का विश्लेषण...",
      pa: "3/6 AI ਵਿਜ਼ਨ ਇੰਜਣ: ਪੱਤਿਆਂ 'ਤੇ ਉੱਲੀ ਅਤੇ ਰੋਗ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ...",
    },
    {
      en: "4/6 Decision Engine: Calibrating confidence & uncertainty bands...",
      hi: "4/6 निर्णय इंजन: कैलिब्रेटेड विश्वास स्तर व वैकल्पिक संभावनाओं की जांच...",
      pa: "4/6 ਫੈਸਲਾ ਇੰਜਣ: ਵਿਸ਼ਵਾਸ ਪੱਧਰ ਅਤੇ ਬਦਲਵੇਂ ਰੋਗਾਂ ਦੀ ਜਾਂਚ...",
    },
    {
      en: "5/6 Advisory Engine: Matching ICAR, PAU & CIBRC registered remedies...",
      hi: "5/6 परामर्श इंजन: ICAR, PAU व CIBRC प्रमाणित उपचार व सुरक्षा समय (PHI)...",
      pa: "5/6 ਸਲਾਹਕਾਰ ਇੰਜਣ: ਸਰਕਾਰੀ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰਾਂ ਅਨੁਸਾਰ ਢੁਕਵਾਂ ਇਲਾਜ...",
    },
    {
      en: "6/6 Farmer Diagnosis Report: Synthesizing actionable guidance...",
      hi: "6/6 किसान निदान रिपोर्ट: विस्तृत उपचार व रोकथाम रिपोर्ट तैयार...",
      pa: "6/6 ਕਿਸਾਨ ਰਿਪੋਰਟ: ਵਿਸਤ੍ਰਿਤ ਇਲਾਜ ਅਤੇ ਰੋਕਥਾਮ ਰਿਪੋਰਟ ਤਿਆਰ...",
    },
  ];

  const scanImage = async () => {
    if (!files.length) return;
    setError("");
    setIsScanning(true);
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      
      const headers = {};
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/scan?lang=${encodeURIComponent(lang || "en")}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to analyze crop image.");
      }

      setResult(json.result || null);
    } catch (err) {
      setError(err.message || t.scanner?.failed || "Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    imageUrls.forEach((url) => URL.revokeObjectURL(url));
    setImageUrls([]);
    setFiles([]);
    setResult(null);
    setError("");
  };

  const isScanButtonEnabled = files.length > 0 && !isScanning;

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 text-xl shadow-xs">
              🔬
            </span>
            <div>
              <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
                {t.scanner?.title || "AI Crop Disease Scanner"}
              </h1>
              <p className="text-xs sm:text-sm text-brand-textMid mt-0.5">
                {t.scanner?.subtitle || "Instant plant diagnosis & ICAR-approved remedies powered by multimodal vision"}
              </p>
            </div>
          </div>

          {/* Architecture Pipeline Toggle Button */}
          <button
            type="button"
            onClick={() => setShowArchitecture((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 active:scale-95 shadow-2xs"
          >
            <span>🏗️</span>
            <span>
              {showArchitecture
                ? lang === "hi"
                  ? "संरचना विवरण छुपाएं"
                  : "Hide Architecture"
                : lang === "hi"
                ? "अनुशंसित संरचना (6-स्तरीय पाइपलाइन)"
                : "Recommended Architecture"}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Architecture View */}
      {showArchitecture && (
        <div className="transition-all duration-300">
          <RecommendedArchitectureView />
        </div>
      )}

      {!result ? (
        <div className="space-y-5">
          {/* Main Uploader Box */}
          <div className="rounded-2xl border border-green-100 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <ImageUploader onFilesChange={onFilesChange} />

            {/* Scan Action Area */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={scanImage}
                  disabled={!isScanButtonEnabled}
                  className={`flex min-h-[50px] flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-md ${
                    isScanButtonEnabled
                      ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isScanning ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>
                        {stagesText[scanStage]?.[lang] || stagesText[scanStage]?.en}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">⚡</span>
                      <span>
                        {files.length === 0
                          ? lang === "hi"
                            ? "स्कैन करने के लिए कम से कम 1 फोटो चुनें"
                            : lang === "pa"
                            ? "ਸਕੈਨ ਕਰਨ ਲਈ ਘੱਟੋ-ਘੱਟ 1 ਫੋਟੋ ਚੁਣੋ"
                            : "Select at least 1 Photo to Scan"
                          : lang === "hi"
                          ? `रोग पहचान शुरू करें (${files.length} फोटो तैयार)`
                          : lang === "pa"
                          ? `ਰੋਗ ਪਛਾਣ ਸ਼ੁਰੂ ਕਰੋ (${files.length} ਫੋਟੋ ਤਿਆਰ)`
                          : `Analyze Crop Disease (${files.length} ${files.length === 1 ? "Photo" : "Photos"} Ready)`}
                      </span>
                    </>
                  )}
                </button>

                {files.length > 0 && !isScanning && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[50px] rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95"
                  >
                    {t.common?.clear || "Reset"}
                  </button>
                )}
              </div>

              {/* Requirement State Message */}
              {files.length === 0 && !isScanning && (
                <p className="text-center text-xs text-gray-500 font-medium">
                  {lang === "hi"
                    ? "📌 स्कैन बटन चालू करने के लिए ऊपर कैमरा या गैलरी से 1 से 3 तस्वीरें जोड़ें।"
                    : "📌 Please take or upload 1 to 3 photos of the affected crop above to enable the scan button."}
                </p>
              )}
            </div>
          </div>

          {/* Scanning Progress Live Architecture Stepper */}
          {isScanning && (
            <div className="rounded-2xl border border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white font-bold animate-pulse">
                  🌱
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-green-900 mb-1">
                    <span>{stagesText[scanStage]?.[lang] || stagesText[scanStage]?.en}</span>
                    <span>Step {scanStage + 1} of 6</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-green-200">
                    <div
                      className="h-full bg-green-600 transition-all duration-700"
                      style={{ width: `${((scanStage + 1) / 6) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Architecture Pipeline Execution */}
              <div className="border-t border-green-200/60 pt-3">
                <RecommendedArchitectureView currentStep={scanStage + 1} compact={true} />
              </div>
            </div>
          )}

          {/* Error Alert with Retry */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold">{lang === "hi" ? "स्कैन त्रुटि" : "Scan Alert"}</p>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={scanImage}
                disabled={!files.length || isScanning}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 shrink-0"
              >
                {t.common?.retry || "Try Again"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-green-100 shadow-xs">
            <button
              type="button"
              onClick={handleReset}
              className="flex min-h-[40px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95"
            >
              <span>←</span>
              <span>{t.scanner?.scanAnother || "Scan Another Plant"}</span>
            </button>
            <span className="text-xs font-semibold text-green-700">
              ✓ {lang === "hi" ? "सत्यापित रोग निदान" : "Verified Diagnosis Report"}
            </span>
          </div>

          <DiseaseResult result={result} uploadedImages={imageUrls} onReset={handleReset} />
        </div>
      )}
    </div>
  );
}
