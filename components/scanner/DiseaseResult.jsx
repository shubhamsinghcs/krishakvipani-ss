"use client";

import { useLang } from "@/lib/LanguageContext";

const severityClasses = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
  None: "bg-green-100 text-green-700",
};

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-md md:p-5 ${className}`}>{children}</div>
  );
}

export default function DiseaseResult({ result }) {
  const { t } = useLang();
  if (!result) return null;

  const shareToWhatsApp = () => {
    const message = result.disease.is_healthy
      ? `${t.scanner?.healthyTitle || "Crop Healthy"}\nCrop: ${result.crop.name}\nConfidence: ${result.disease.confidence}%\nDate: ${new Date(result.timestamp).toLocaleDateString()}\nKrishakVipani`
      : `${result.disease.name}\nCrop: ${result.crop.name}\nSeverity: ${result.disease.severity}\nDate: ${new Date(result.timestamp).toLocaleDateString()}\n\n${result.disease.action_required}\n\nKrishakVipani`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

    if (result.disease.is_healthy) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800">{t.scanner?.healthyTitle || "Crop is Healthy"}</h3>
              <p className="mt-2 text-sm font-semibold text-green-700">{result.crop.name}</p>
              <p className="mt-1 text-xs text-green-600">Stage: {result.crop.stage}</p>
            </div>
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold text-green-700">
              {result.disease.confidence}%
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-green-800">{t.scanner?.healthyDesc || "Your crop appears to be in good health. Continue regular monitoring."}</p>
          <p className="mt-2 text-xs text-green-600">{new Date(result.timestamp).toLocaleDateString()}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 overflow-x-hidden">
      <Card className="border-red-200 bg-red-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800 sm:text-xl">{result.disease.name}</h3>
            <p className="mt-1 text-sm font-semibold text-red-700">{result.crop.name} · Stage: {result.crop.stage}</p>
          </div>
          <span
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${severityClasses[result.disease.severity] || severityClasses.Medium}`}
          >
            {result.disease.severity}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-red-900">Confidence:</span>
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-red-100">
            <div
              className="h-full rounded-full bg-red-600 transition-[width]"
              style={{ width: `${Math.min(Math.max(result.disease.confidence || 0, 0), 100)}%` }}
            />
          </div>
          <span className="text-sm font-bold text-red-900">{result.disease.confidence}%</span>
        </div>
        <p className="mt-2 text-xs text-red-600">{new Date(result.timestamp).toLocaleDateString()}</p>
      </Card>

      {result.disease.action_required && (
        <Card className="border-orange-300 bg-orange-50">
          <h4 className="text-base font-bold text-orange-800">Action Required</h4>
          <p className="mt-2 text-sm leading-relaxed text-orange-900">{result.disease.action_required}</p>
        </Card>
      )}

      <Card className="border-orange-200 bg-white">
        <h4 className="text-base font-semibold text-brand-textDark">Symptoms</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-800">
          {(result.disease.symptoms || []).map((symptom, idx) => (
            <li key={`${symptom}-${idx}`} className="line-clamp-3">
              {symptom}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <h4 className="text-base font-semibold text-orange-800">Chemical Treatment</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-6">{result.disease.chemical_remedy}</p>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <h4 className="text-base font-semibold text-green-800">Organic Alternative</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-6">{result.disease.organic_remedy}</p>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <h4 className="text-base font-semibold text-blue-800">Prevention</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-6">{result.disease.prevention}</p>
      </Card>

      <button
        type="button"
        onClick={shareToWhatsApp}
        className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95 sm:w-auto"
      >
        {t.common?.whatsappShare || "Share on WhatsApp"}
      </button>
    </div>
  );
}
