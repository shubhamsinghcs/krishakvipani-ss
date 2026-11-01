"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function NewsPage() {
  const { t } = useLang();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNews([
        { id: 1, title: t.news?.news1Title || "Wheat procurement begins across mandis with streamlined digital facilities.", date: t.news?.today || "Today" },
        { id: 2, title: t.news?.news2Title || "Government increases DAP fertilizer subsidy to support farmers this season.", date: t.news?.yesterday || "Yesterday" },
        { id: 3, title: t.news?.news3Title || "Weather department issues alert for heavy rain over next 3 days.", date: t.news?.yesterday || "Yesterday" }
      ]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
          {t.news?.title || "Agricultural News"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.news?.subtitle || "Latest farming updates, subsidies, and advisories."}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 bg-green-50 animate-pulse rounded-2xl w-full"></div>
          <div className="h-24 bg-green-50 animate-pulse rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((n) => (
            <div key={n.id} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-4 hover:scale-[1.02] transition-all">
              <h3 className="font-bold text-gray-800 text-lg">{n.title}</h3>
              <p className="text-xs text-gray-500 mt-2">{n.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
