"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FullPageLoader } from "@/components/LoadingSpinner";
import { useLang } from "@/lib/LanguageContext";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";

const ImageUploader = dynamic(() => import("@/components/scanner/ImageUploader"), { ssr: false });
const DiseaseResult = dynamic(() => import("@/components/scanner/DiseaseResult"), { ssr: false });
const FeedbackWidget = dynamic(() => import("@/components/scanner/FeedbackWidget"), { ssr: false });

export default function ScannerPage() {
  const { t } = useLang();
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("UPLOAD"); // UPLOAD, SCANNING, CONFIRM_CROP, SHOW_DISEASE
  const [error, setError] = useState("");

  const onFilesChange = useCallback((next) => {
    setFiles(next);
    setResult(null);
    setError("");
    setStep("UPLOAD");
  }, []);

  const scanImage = async () => {
    if (!files.length) return;
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setError(t.scanner.tooLarge);
        return;
      }
    }
    setError("");
    setStep("SCANNING");
    setResult(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      const headers = {};
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/scan", { method: "POST", headers, body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "scan-failed");
      }
      setResult(json.result || null);
      setStep("CONFIRM_CROP");
    } catch (err) {
      setError(err.message || t.scanner.failed);
      setStep("UPLOAD");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.scanner.title}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.scanner.subtitle}</p>
      </div>

      {step === "UPLOAD" || step === "SCANNING" ? (
        <>
          <ImageUploader onFilesChange={onFilesChange} />
          <button
            type="button"
            onClick={scanImage}
            disabled={!files.length || step === "SCANNING"}
            className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {t.scanner.scan}
          </button>
        </>
      ) : null}

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600 shadow-sm">{error}</p> : null}
      {step === "SCANNING" ? <FullPageLoader text={t.scanner.scanning || "Analyzing crop..."} /> : null}

      {step === "CONFIRM_CROP" && result ? (
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Detected Crop: {result.crop_type || "Unknown"}</h2>
          <p className="text-gray-600 mb-6">Is this correct? Proceed to analyze disease?</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setStep("SHOW_DISEASE")}
              className="min-h-[44px] rounded-xl bg-green-600 px-6 py-2 text-white font-semibold shadow-md active:scale-95"
            >
              Yes, Analyze Disease
            </button>
            <button
              onClick={() => setStep("UPLOAD")}
              className="min-h-[44px] rounded-xl bg-gray-200 px-6 py-2 text-gray-800 font-semibold shadow-md active:scale-95"
            >
              No, Scan Again
            </button>
          </div>
        </div>
      ) : null}

      {step === "SHOW_DISEASE" && result ? (
        <div className="overflow-x-hidden transition duration-200 ease-out">
          <DiseaseResult result={result} />
          <FeedbackWidget result={result} />
          <button
            onClick={() => setStep("UPLOAD")}
            className="mt-6 min-h-[44px] w-full sm:w-auto rounded-xl border border-green-600 text-green-600 px-6 py-2 font-semibold active:scale-95"
          >
            Scan Another Plant
          </button>
        </div>
      ) : null}
    </div>
  );
}
