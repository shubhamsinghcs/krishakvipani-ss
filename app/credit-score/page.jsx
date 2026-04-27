"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function CreditScorePage() {
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    const fetchCredit = async () => {
      try {
        const res = await fetch("/api/credit");
        const json = await res.json();
        if (json.success) {
          setCreditData(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCredit();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const score = creditData?.score || 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{t("credit.title") || "Farmer Credit Score"}</h1>
      </div>

      {/* Main Score Card */}
      <section className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-3xl shadow-xl p-8 mb-6 flex flex-col items-center">
        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="45" className="stroke-gray-200" strokeWidth="8" fill="none" />
            <circle 
              cx="80" 
              cy="80" 
              r="45" 
              className="stroke-green-500 transition-all duration-1000 ease-out" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-gray-800">{score}</span>
            <span className="text-xs text-gray-500 font-medium">/ 100</span>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">{t("credit.level") || "Level"}: {creditData?.level || t("credit.unknown") || "Unknown"}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("credit.description") || "Your trust level is based on your farming activity."}</p>
        </div>
      </section>

      {/* Breakdown */}
      <section className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-3xl shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">{t("credit.breakdown") || "Score Breakdown"}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl">
            <span className="text-sm font-medium text-gray-600">{t("credit.base") || "Base Score"}</span>
            <span className="font-bold text-gray-800">+{creditData?.breakdown?.base || 0}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl">
            <span className="text-sm font-medium text-gray-600">{t("credit.history") || "Crop History"}</span>
            <span className="font-bold text-green-600">+{creditData?.breakdown?.history || 0}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl">
            <span className="text-sm font-medium text-gray-600">{t("credit.consistency") || "Consistency"}</span>
            <span className="font-bold text-green-600">+{creditData?.breakdown?.consistency || 0}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl">
            <span className="text-sm font-medium text-gray-600">{t("credit.mandi") || "Mandi Activity"}</span>
            <span className="font-bold text-green-600">+{creditData?.breakdown?.mandi || 0}</span>
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl shadow-sm p-6">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          {t("credit.improve") || "Improve Your Score"}
        </h3>
        <ul className="space-y-2">
          {creditData?.suggestions?.map((suggestion, i) => (
            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
              <span className="mt-0.5">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
