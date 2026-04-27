"use client";

import { useEffect, useState } from "react";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback mocks mapping standard failure protections natively
  const fallbackNews = [
    { id: 1, title: "पंजाब में गेहूं खरीद शुरू, मंडियों में व्यवस्थाएं दुरुस्त", date: "Today" },
    { id: 2, title: "सरकार ने DAP खाद पर सब्सिडी बढ़ाई, किसानों को मिलेगी राहत", date: "Yesterday" },
    { id: 3, title: "आने वाले 3 दिनों में भारी बारिश की चेतावनी, फसल बचाएं", date: "Yesterday" }
  ];

  useEffect(() => {
    // Simulated API Fetch logic
    const timer = setTimeout(() => {
       setNews(fallbackNews);
       setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">📰 स्थानीय समाचार</h1>
        <p className="mt-1 text-sm text-brand-textMid">खेती-बाड़ी से जुड़ी ताज़ा खबरें।</p>
      </div>

      {loading ? (
         <div className="space-y-4">
            <div className="h-24 bg-green-50 animate-pulse rounded-2xl w-full"></div>
            <div className="h-24 bg-green-50 animate-pulse rounded-2xl w-full"></div>
         </div>
      ) : (
         <div className="space-y-4">
            {news.map(n => (
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
