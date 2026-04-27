"use client";

import { useLang } from "@/lib/LanguageContext";

export default function WeatherAlert({ alert }) {
  const { t } = useLang();
  if (!alert) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        {t.weather.noAlert}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4">
      <p className="text-sm font-semibold text-orange-800">{t.weather.alert}</p>
      <p className="mt-1 text-sm text-orange-700">{alert}</p>
    </div>
  );
}
