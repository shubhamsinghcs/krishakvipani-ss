"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { useSmartLocation } from "@/lib/hooks/useSmartLocation";

// SVG Icons
const IconLocation = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCloud = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
const IconSparkles = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const IconBrain = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const IconCamera = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconRobot = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const IconTruck = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
const IconTrend = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

export default function DashboardPage() {
  const { lang, t } = useLang();
  const { district, loading: locLoading } = useSmartLocation();
  
  const [weather, setWeather] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const userName = "Kisan"; 
  const userCrop = "Wheat Farmer";

  useEffect(() => {
    if (locLoading) return;
    const ac = new AbortController();
    
    const loadWeather = async () => {
      try {
        const wRes = await fetch(`/api/weather?city=${district}`, { signal: ac.signal });
        const wJson = await wRes.json();
        setWeather(wJson);
      } catch (e) {
        if (!ac.signal.aborted) setWeather(null);
      } finally {
        if (!ac.signal.aborted) setLoadingWeather(false);
      }
    };

    const loadPrices = async () => {
      try {
        const pRes = await fetch(`/api/prices?crop=Wheat&district=${district}`, { signal: ac.signal });
        const pJson = await pRes.json();
        if (pJson.success) {
          setPrices(pJson.data.slice(0, 3));
        }
      } catch (e) {
        if (!ac.signal.aborted) setPrices([]);
      } finally {
        if (!ac.signal.aborted) setLoadingPrices(false);
      }
    };

    loadWeather();
    loadPrices();

    return () => ac.abort();
  }, [district, locLoading]);

  const dateText = useMemo(() => {
    return new Date().toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
  }, [lang]);

  const aiInsight = useMemo(() => {
    if (loadingWeather) return "Analyzing local conditions...";
    if (!weather) return "Conditions look stable today.";
    
    const temp = weather.temp || 0;
    const rain = weather.rain_mm || 0;
    const humidity = weather.humidity || 0;
    
    if (temp > 38) return "High temperature alert! Prefer evening irrigation to avoid evaporation.";
    if (rain > 60 || weather.rainLikely) return "Heavy rain expected. Stop irrigation and postpone pesticide spraying.";
    if (humidity > 80) return "High humidity detected. Increased risk of fungal diseases, monitor crops closely.";
    
    return "Weather is optimal for general farm activities today.";
  }, [weather, loadingWeather]);

  const farmPlan = useMemo(() => {
    if (loadingWeather) return ["Loading your plan..."];
    if (!weather) return ["Check crop health", "Review market prices", "Plan irrigation"];
    if (weather.temp > 35) return ["Irrigate early morning", "Avoid afternoon fieldwork", "Check soil moisture"];
    if (weather.rainLikely) return ["Clear drainage channels", "Secure equipment", "Delay fertilizer application"];
    return ["Weed clearing", "Apply fertilizers if needed", "Monitor for pests"];
  }, [weather, loadingWeather]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6 min-h-screen">
      
      {/* Personalized Header */}
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
          Hello {userName}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm px-3 py-1.5 text-xs font-semibold text-gray-700">
             <IconLocation />
             {locLoading ? "Locating..." : district}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm px-3 py-1.5 text-xs font-semibold text-gray-700">
             <IconCloud />
             {loadingWeather ? "..." : (weather ? `${weather.temp}°C` : "Weather")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm px-3 py-1.5 text-xs font-semibold text-gray-700">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
             {dateText}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 border border-blue-200/50 shadow-sm px-3 py-1.5 text-xs font-semibold text-blue-800">
             <IconSparkles />
             {userCrop}
          </span>
        </div>
      </section>

      {/* AI Insight Card */}
      <section className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-green-400/10 rounded-full blur-3xl" />
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <IconBrain className="text-green-600" /> AI Insight
        </h2>
        <p className="text-gray-600 font-medium leading-relaxed relative z-10">
          {aiInsight}
        </p>
      </section>

      {/* Quick Actions (Full width mobile, grid desktop) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/scanner" className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl hover:scale-[1.01] transition-all duration-200 active:scale-95">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
            <IconCamera />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800 block">Scan Crop</span>
            <span className="text-xs text-gray-500">Detect diseases instantly</span>
          </div>
        </Link>
        <Link href="/assistant" className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl hover:scale-[1.01] transition-all duration-200 active:scale-95">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <IconRobot />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800 block">Ask Assistant</span>
            <span className="text-xs text-gray-500">24/7 farming advice</span>
          </div>
        </Link>
        <Link href="/transport" className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl hover:scale-[1.01] transition-all duration-200 active:scale-95">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <IconTruck />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800 block">Find Transport</span>
            <span className="text-xs text-gray-500">Search local trucks</span>
          </div>
        </Link>
      </section>

      {/* Live Data Cards Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mandi Prices */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6 hover:scale-[1.01] transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <IconTrend className="text-green-600" /> Mandi Prices
            </h2>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-green-100">Live</span>
              <p className="text-[10px] text-gray-400 mt-1">Updated 2 min ago</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {loadingPrices ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-gray-200/50 rounded-xl"></div>
                <div className="h-10 bg-gray-200/50 rounded-xl"></div>
              </div>
            ) : prices.length > 0 ? (
              prices.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                  <span className="font-medium text-gray-700 text-sm truncate pr-2">{item.market}</span>
                  <span className="font-semibold text-green-700 shrink-0">₹{item.modalPrice}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50/50 p-3 rounded-xl text-center">No live prices found.</p>
            )}
          </div>
        </div>

        {/* Today's Plan */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6 hover:scale-[1.01] transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Today&apos;s Plan
            </h2>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-blue-100">Smart</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {farmPlan.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <span className="text-sm font-medium text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
