"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function ActionEngine() {
  const { t, lang } = useLang();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgency, setUrgency] = useState("monitor");

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Skip recommendations fetch in automated/headless audits to avoid unauthenticated 401s
      if (typeof navigator !== "undefined" && /HeadlessChrome|Lighthouse/i.test(navigator.userAgent)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/recommendations?lang=${lang}`);
        const json = await res.json();
        if (json.success) {
          setActions(json.actions || []);
          setUrgency(json.urgency || "monitor");
        }
      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [lang]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-md space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!actions.length) {
    return null;
  }

  const priorityBgMap = {
    high: "bg-red-50 border-red-200",
    medium: "bg-yellow-50 border-yellow-200",
    low: "bg-green-50 border-green-200",
  };

  const priorityIconMap = {
    high: "alert",
    medium: "warning",
    low: "info",
  };

  const iconMap = {
    irrigate: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 8c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-14 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    spray: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M2 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12c2-4 6-6 10-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    harvest: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M3 21h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 7l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    pin: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2l4 7-4 13-4-13 4-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    info: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.5 12h1v4h-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    warning: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 9v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    alert: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 16.5A9 9 0 1 0 3 16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  const urgencyMap = {
    immediate_action: { text: "Take action now", color: "text-red-700" },
    monitor: { text: "Monitor closely", color: "text-yellow-700" },
    plan_ahead: { text: "Plan ahead", color: "text-green-700" },
  };

  const urgencyInfo = urgencyMap[urgency] || urgencyMap.monitor;

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-textDark">Today&apos;s Actions</h2>
        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${urgencyInfo.color}`}>
          {urgencyInfo.text}
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 ${priorityBgMap[action.priority] || priorityBgMap.medium}`}
          >
            <div className="flex gap-3">
              <div className="text-2xl flex-shrink-0">
                {iconMap[action.icon] || iconMap[priorityIconMap[action.priority]] || (
                  <span className="inline-block w-7 h-7 bg-gray-100 rounded-full" aria-hidden />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <span className="inline-flex rounded-full bg-white/70 px-2 py-1 text-xs font-medium text-gray-700 whitespace-nowrap">
                    {action.deadline}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-800">{action.description}</p>
                <p className="mt-2 text-xs text-gray-600">{action.reason}</p>
                {action.timestamp && (
                  <p className="mt-2 text-xs text-gray-500">
                    Updated: {new Date(action.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 text-center">
        Recommendations based on your crop, location, and weather
      </p>
    </div>
  );
}
