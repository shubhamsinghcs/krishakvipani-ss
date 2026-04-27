"use client";

import { useLang } from "@/lib/LanguageContext";

export default function SmartAlertBanners({ weather }) {
  const { t } = useLang();
  if (!weather) return null;

  const tw = t.weather || {};
  const temp = typeof weather.temp === "number" ? weather.temp : Number(weather.temp);
  const prob = typeof weather.rainProbabilityPercent === "number" ? weather.rainProbabilityPercent : 0;
  const heatOn = Number.isFinite(temp) && temp > 38;
  const rainOn = prob > 60 || Boolean(weather.rainLikely);

  if (!heatOn && !rainOn) return null;

  return (
    <div className="space-y-3">
      {rainOn ? (
        <div
          className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-sm font-medium text-blue-900 shadow-md"
          role="status"
        >
          <p className="font-semibold">{tw.rainChanceLabel || ""}</p>
          <p className="mt-1">
            {(tw.alertRainHigh || "").replace("{p}", String(Math.max(prob, weather.rainLikely ? 65 : prob)))}
          </p>
        </div>
      ) : null}
      {heatOn ? (
        <div
          className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4 text-sm font-medium text-amber-950 shadow-md"
          role="status"
        >
          <p className="mt-0">{(tw.alertHeat || "").replace("{t}", String(temp))}</p>
        </div>
      ) : null}
    </div>
  );
}
