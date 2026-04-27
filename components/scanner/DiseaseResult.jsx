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
    const message = result.is_healthy
      ? `${t.scanner.healthyTitle}\n${t.scanner.confidence}: ${result.confidence}%\nKrishakVipani`
      : `🚨 ${result.disease}\n${t.scanner.confidence}: ${result.confidence}%\n${t.scanner.chemical}: ${result.chemical_remedy}\n${t.scanner.organic}: ${result.organic_remedy}\nKrishakVipani`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (result.is_healthy) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="border-green-200 bg-green-50">
          <h3 className="text-lg font-bold text-green-800">{t.scanner.healthyTitle}</h3>
          <p className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-700">
            {t.scanner.confidence}: {result.confidence}%
          </p>
          <p className="mt-3 text-sm leading-relaxed text-green-800 line-clamp-6">{t.scanner.healthyDesc}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 overflow-x-hidden">
      <Card className="border-red-200 bg-red-50">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-red-800 sm:text-xl">🚨 {result.disease}</h3>
          <span
            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${severityClasses[result.severity] || severityClasses.Medium}`}
          >
            {result.severity}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-red-900">
          {t.scanner.confidence}: <span className="font-semibold">{result.confidence}%</span> · {t.scanner.crop}:{" "}
          <span className="line-clamp-2 font-medium">{result.crop_type}</span>
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-full bg-red-600 transition-[width]"
            style={{ width: `${Math.min(Math.max(result.confidence || 0, 0), 100)}%` }}
          />
        </div>
        {result.crop_stage ? <p className="mt-2 text-xs text-red-800">Stage: {result.crop_stage}</p> : null}
        {result.severity_reason ? (
          <p className="mt-3 text-sm leading-relaxed text-red-900 line-clamp-4">{result.severity_reason}</p>
        ) : null}
      </Card>

      <Card className="border-orange-200 bg-white">
        <h4 className="text-base font-semibold text-brand-textDark">{t.scanner.symptoms}</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-800">
          {(result.symptoms || []).map((symptom, idx) => (
            <li key={`${symptom}-${idx}`} className="line-clamp-3">
              {symptom}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <h4 className="text-base font-semibold text-orange-800">{t.scanner.chemical}</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-6">{result.chemical_remedy}</p>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <h4 className="text-base font-semibold text-green-800">{t.scanner.organic}</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-6">{result.organic_remedy}</p>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <h4 className="text-base font-semibold text-blue-800">{t.scanner.prevention}</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-6">{result.prevention}</p>
      </Card>

      <button
        type="button"
        onClick={shareToWhatsApp}
        className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95 sm:w-auto"
      >
        {t.common.whatsappShare}
      </button>
    </div>
  );
}
