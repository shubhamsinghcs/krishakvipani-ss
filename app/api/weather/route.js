import { NextResponse } from "next/server";
import { getWeatherCache, setWeatherCache } from "@/lib/cache";
import { sendRainAlertNotification } from "@/lib/notifications";
import { safeEnv } from "@/lib/env";
import { autoTranslate } from "@/lib/autoTranslate";
export const dynamic = "force-dynamic";

const WEATHER_FALLBACK = {
  city: "Patiala",
  temp: 31,
  feels_like: 34,
  humidity: 58,
  wind_speed: 14,
  condition: "साफ आसमान",
  condition_icon: "☀️",
  description: "हल्के बादल, मौसम सामान्य",
  alert: null,
  advisory: "मौसम अनुकूल है — खेती के लिए अच्छा दिन",
  hourly_advisory: [],
  forecast: [],
  fetchedAt: new Date().toISOString(),
  rainProbabilityPercent: 0,
};

const rainNotifyCooldownMs = 45 * 60 * 1000;
const rainNotifyLastByCity = new Map();

async function maybeNotifyRain(cityLabel, rainLikely) {
  if (!rainLikely || !cityLabel) return;
  const key = String(cityLabel).toLowerCase();
  const now = Date.now();
  const last = rainNotifyLastByCity.get(key) || 0;
  if (now - last < rainNotifyCooldownMs) return;
  rainNotifyLastByCity.set(key, now);
  try {
    await sendRainAlertNotification(cityLabel);
  } catch {
    /* non-fatal */
  }
}

function mapCondition(weatherId) {
  if (weatherId >= 200 && weatherId <= 232) return { condition: "आंधी-तूफान", icon: "⛈️" };
  if (weatherId >= 300 && weatherId <= 321) return { condition: "बूंदाबांदी", icon: "🌦️" };
  if (weatherId >= 500 && weatherId <= 531) return { condition: "बारिश", icon: "🌧️" };
  if (weatherId >= 600 && weatherId <= 622) return { condition: "बर्फबारी", icon: "❄️" };
  if (weatherId >= 700 && weatherId <= 781) return { condition: "धुंध/कोहरा", icon: "🌫️" };
  if (weatherId === 800) return { condition: "साफ आसमान", icon: "☀️" };
  if (weatherId >= 801 && weatherId <= 804) return { condition: "बादल", icon: "☁️" };
  return { condition: "मौसम अपडेट", icon: "🌤️" };
}

function advisoryByWeather(temp, humidity, windSpeed, weatherId) {
  if (weatherId >= 500 && weatherId <= 531) return "सिंचाई रोकें — बारिश आने वाली है";
  if (temp > 40) return "अत्यधिक गर्मी — फसल को पानी दें";
  if (temp > 38) return "दोपहर में खेत में न जाएं, गर्मी अधिक है";
  if (humidity > 80) return "फफूंद रोग का खतरा — दवा छिड़कें";
  if (windSpeed > 30) return "कीटनाशक छिड़काव न करें";
  return "मौसम अनुकूल है — खेती के लिए अच्छा दिन";
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function computeRainLikely(weatherId, hourlyAdvisory, forecast) {
  if (weatherId >= 200 && weatherId <= 232) {
    return { rainLikely: true, rainReason: "storm_current" };
  }
  if (weatherId >= 300 && weatherId <= 321) {
    return { rainLikely: true, rainReason: "drizzle_current" };
  }
  if (weatherId >= 500 && weatherId <= 531) {
    return { rainLikely: true, rainReason: "rain_current" };
  }
  if (Array.isArray(hourlyAdvisory) && hourlyAdvisory.some((h) => (h.rain_mm || 0) > 0)) {
    return { rainLikely: true, rainReason: "forecast_hourly_rain" };
  }
  if (Array.isArray(forecast)) {
    const wet = forecast.some((f) => {
      const c = `${f.condition || ""}${f.condition_icon || ""}`;
      return /बारिश|बूंदा|वर्षा|Rain|🌧|⛈|🌦/i.test(c);
    });
    if (wet) return { rainLikely: true, rainReason: "forecast_day_rain" };
  }
  return { rainLikely: false, rainReason: null };
}

function makeHourlyAdvisory(hourly = []) {
  return hourly.slice(0, 6).map((entry) => {
    const temp = Math.round(entry.main?.temp || 0);
    const humidity = entry.main?.humidity || 0;
    const windKmh = Math.round((entry.wind?.speed || 0) * 3.6);
    const rainMm = entry.rain?.["3h"] || 0;
    let advisory = "मौसम सामान्य — नियमित खेती कार्य करें";
    if (rainMm > 0) advisory = "बारिश संभव — सिंचाई टालें";
    else if (temp > 38) advisory = "उच्च तापमान — दोपहर में खेत कार्य सीमित रखें";
    else if (humidity > 85) advisory = "अधिक नमी — फफूंद नियंत्रण पर ध्यान दें";
    else if (windKmh > 30) advisory = "तेज हवा — स्प्रे कार्य टालें";
    return {
      time: entry.dt_txt,
      temp,
      humidity,
      wind_speed: windKmh,
      rain_mm: rainMm,
      advisory,
    };
  });
}

function maxPrecipitationProbabilityPercent(list) {
  if (!Array.isArray(list) || !list.length) return 0;
  let max = 0;
  for (const entry of list.slice(0, 12)) {
    const raw = entry?.pop;
    const p = typeof raw === "number" ? raw : 0;
    max = Math.max(max, Math.round(p * 100));
  }
  return max;
}

function makeFiveDayForecast(list = []) {
  const grouped = new Map();
  for (const item of list) {
    const dateKey = new Date(item.dt_txt).toISOString().split("T")[0];
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey).push(item);
  }
  return [...grouped.entries()].slice(0, 5).map(([date, entries]) => {
    const max = Math.round(Math.max(...entries.map((e) => e.main?.temp_max || 0)));
    const min = Math.round(Math.min(...entries.map((e) => e.main?.temp_min || 0)));
    const weatherId = entries[0]?.weather?.[0]?.id || 800;
    const mapped = mapCondition(weatherId);
    return {
      date,
      max,
      min,
      condition: mapped.condition,
      condition_icon: mapped.icon,
    };
  });
}

export async function GET(request) {
  let city = "Patiala";
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || request.headers.get("x-lang") || "en";
  try {
    city = (searchParams.get("city") || "Patiala").trim();
    const apiKey = safeEnv("OPENWEATHER_API_KEY", "");
    const cityKey = city.toLowerCase();

    const cachedFresh = getWeatherCache(cityKey + "_" + lang);
    if (cachedFresh) {
      return NextResponse.json(
        {
          rainLikely: cachedFresh.rainLikely ?? false,
          rainReason: cachedFresh.rainReason ?? null,
          ...cachedFresh,
          isCached: true,
        },
        { status: 200 }
      );
    }

    if (!apiKey || apiKey.includes("your_openweathermap_api_key_here")) {
      const { rainLikely, rainReason } = computeRainLikely(800, [], []);
      const fallback = {
        ...WEATHER_FALLBACK,
        city,
        rainLikely,
        rainReason,
        rainProbabilityPercent: 0,
        fetchedAt: new Date().toISOString(),
        isCached: false,
      };
      setWeatherCache(cityKey + "_" + lang, fallback);
      return NextResponse.json(fallback, { status: 200 });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric&lang=${lang}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric&lang=${lang}`;

    const weatherRes = await fetchWithTimeout(weatherUrl, 8000);
    if (!weatherRes.ok) {
      throw new Error(`OpenWeather current API failed: ${weatherRes.status}`);
    }
    const weatherData = await weatherRes.json();

    let alert = null;
    let forecast = [];
    let hourlyAdvisory = [];
    let rawForecastList = [];
    if (weatherData?.coord?.lat && weatherData?.coord?.lon) {
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&exclude=minutely,hourly,daily&appid=${apiKey}&units=metric&lang=hi`;
      try {
        const alertRes = await fetchWithTimeout(oneCallUrl, 8000);
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          alert = alertData?.alerts?.[0]?.description || null;
        }
      } catch {
        /* optional */
      }
    }

    const weatherId = weatherData?.weather?.[0]?.id ?? 800;
    const mapped = mapCondition(weatherId);
    const temp = Math.round(weatherData?.main?.temp ?? WEATHER_FALLBACK.temp);
    const humidity = weatherData?.main?.humidity ?? WEATHER_FALLBACK.humidity;
    const windSpeed = Math.round((weatherData?.wind?.speed ?? 0) * 3.6);

    try {
      const forecastRes = await fetchWithTimeout(forecastUrl, 8000);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        const list = Array.isArray(forecastData?.list) ? forecastData.list : [];
        rawForecastList = list;
        forecast = makeFiveDayForecast(list);
        hourlyAdvisory = makeHourlyAdvisory(list);
      }
    } catch {
      /* forecast optional */
    }

    const cityName = weatherData?.name || city;
    const rainProbabilityPercent = maxPrecipitationProbabilityPercent(rawForecastList);
    const { rainLikely, rainReason } = computeRainLikely(weatherId, hourlyAdvisory, forecast);

    await maybeNotifyRain(cityName, rainLikely);

    const mappedCondition = mapped.condition;
    const weatherDesc = weatherData?.weather?.[0]?.description || mappedCondition;
    const finalAdvisory = advisoryByWeather(temp, humidity, windSpeed, weatherId);

    const payload = {
      city: cityName,
      temp,
      feels_like: Math.round(weatherData?.main?.feels_like ?? WEATHER_FALLBACK.feels_like),
      humidity,
      wind_speed: windSpeed,
      condition: await autoTranslate(mappedCondition, lang),
      condition_icon: mapped.icon,
      description: await autoTranslate(weatherDesc, lang),
      alert: alert ? await autoTranslate(alert, lang) : null,
      advisory: await autoTranslate(finalAdvisory, lang),
      hourly_advisory: await Promise.all(hourlyAdvisory.map(async (h) => ({
        ...h,
        advisory: await autoTranslate(h.advisory, lang)
      }))),
      forecast: await Promise.all(forecast.map(async (f) => ({
        ...f,
        condition: await autoTranslate(f.condition, lang)
      }))),
      fetchedAt: new Date().toISOString(),
      isCached: false,
      rainLikely,
      rainReason,
      rainProbabilityPercent,
    };
    setWeatherCache(cityKey + "_" + lang, payload, 600000);

    return NextResponse.json(payload, { status: 200 });
  } catch {
    const stale = getWeatherCache(city.toLowerCase() + "_" + lang, { allowStale: true });
    if (stale) {
      return NextResponse.json(
        {
          ...stale,
          isCached: true,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        ...WEATHER_FALLBACK,
        city,
        isCached: true,
        rainLikely: false,
        rainReason: null,
        rainProbabilityPercent: 0,
      },
      { status: 200 }
    );
  }
}
