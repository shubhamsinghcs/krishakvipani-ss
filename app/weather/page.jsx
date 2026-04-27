"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import WeatherAlert from "@/components/weather/WeatherAlert";
import { useLang } from "@/lib/LanguageContext";
import { DEFAULT_REGION_CITY } from "@/lib/regionDefaults";
import WeatherCard from "@/components/weather/WeatherCard";
import PushNotifications from "@/components/PushNotifications";
import SmartAlertBanners from "@/components/weather/SmartAlertBanners";

export default function WeatherPage() {
  const { lang, t } = useLang();
  const [city, setCity] = useState(DEFAULT_REGION_CITY);
  const [inputCity, setInputCity] = useState(DEFAULT_REGION_CITY);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const locale = lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN";
  const fallbackForecast = Array.from({ length: 5 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      day: date.toLocaleDateString(locale, { weekday: "short" }),
      icon: "—",
      max: 34 - index,
      min: 22 - Math.floor(index / 2),
    };
  });

  const fetchWeather = useCallback(async (targetCity) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(targetCity)}`);
      const json = await res.json();
      setWeather(json);
      if (json?.fetchedAt) {
        setLastUpdated(new Date(json.fetchedAt).toLocaleString(locale));
      }
    } catch (_error) {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/location?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const payload = await response.json();
          const label = payload?.city || payload?.district || payload?.state;
          if (label) {
            setInputCity(label);
            setCity(label);
          }
        } catch (_error) {
        }
      },
      () => {},
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    fetchWeather(city);
  }, [city, fetchWeather]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-0">
      <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.weather.title}</h1>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          placeholder={t.weather.cityPlaceholder}
          className="min-h-[44px] w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="button"
          onClick={() => setCity(inputCity.trim() || DEFAULT_REGION_CITY)}
          className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95 sm:w-auto"
        >
          {t.common.search}
        </button>
      </div>

      <PushNotifications />

      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : weather ? (
        <>
          <SmartAlertBanners weather={weather} />
          <WeatherCard weather={weather} />
          <p className="text-xs text-gray-500">
            {t.weather.updatedAt}: {lastUpdated || "--"}
          </p>
          <WeatherAlert alert={weather.alert} />

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-base font-semibold text-blue-700">{t.weather.advisoryTitle}</h3>
            <p className="mt-1 text-sm text-blue-700">{weather.advisory}</p>
          </section>

          <section>
            <h3 className="mb-2 text-xl font-semibold text-brand-textDark">{t.weather.forecastTitle}</h3>
            {Array.isArray(weather.hourly_advisory) && weather.hourly_advisory.length ? (
              <div className="space-y-2 rounded-2xl border border-blue-100 bg-white p-4">
                <h4 className="text-sm font-semibold text-brand-textDark">
                  {lang === "en" ? "Hourly Advisory" : lang === "pa" ? "ਘੰਟਾਵਾਰ ਸਲਾਹ" : "घंटावार सलाह"}
                </h4>
                <div className="space-y-2">
                  {weather.hourly_advisory.slice(0, 4).map((item) => (
                    <p key={item.time} className="text-xs text-gray-600">
                      {new Date(item.time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}: {item.advisory}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 md:grid-cols-5">
              {(weather.forecast?.length ? weather.forecast : fallbackForecast).map((day, index) => (
                <div
                  key={`${day.day || day.date}-${index}`}
                  className="flex min-h-[120px] flex-col justify-center rounded-xl bg-white p-3 text-center shadow-sm"
                >
                  <p className="text-sm font-semibold text-brand-textDark">
                    {day.day || new Date(day.date).toLocaleDateString(locale, { weekday: "short" })}
                  </p>
                  <p className="mt-1 text-2xl">{day.icon || day.condition_icon}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {day.max}° / {day.min}°
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyState title={t.weather.noDataTitle} description={t.weather.noDataDesc} />
      )}
    </div>
  );
}
