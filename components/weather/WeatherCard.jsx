"use client";

import { useLang } from "@/lib/LanguageContext";

export default function WeatherCard({ weather }) {
  const { lang, t } = useLang();
  const now = new Date().toLocaleString(lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-white shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{weather.city}</h3>
          <p className="text-xs text-blue-100">{now}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-6xl font-bold">{weather.temp}°</p>
        <p className="text-5xl">{weather.condition_icon}</p>
      </div>
      <p className="mt-2 text-sm text-blue-100">{weather.condition}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/10 p-2">
          <p className="text-xs">{t.weather.humidity}</p>
          <p className="text-sm font-semibold">{weather.humidity}%</p>
        </div>
        <div className="rounded-xl bg-white/10 p-2">
          <p className="text-xs">{t.weather.wind}</p>
          <p className="text-sm font-semibold">{weather.wind_speed} km/h</p>
        </div>
        <div className="rounded-xl bg-white/10 p-2">
          <p className="text-xs">{t.weather.feelsLike}</p>
          <p className="text-sm font-semibold">{weather.feels_like}°C</p>
        </div>
      </div>
    </div>
  );
}
