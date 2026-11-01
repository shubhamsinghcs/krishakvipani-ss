"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";
import { IconScan, IconSprout, IconCalendar, IconShieldCheck } from "@/components/ui/Icons";

export default function HistoryPage() {
  const { lang, t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(false);

  const locale = lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN";

  const load = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setHasToken(Boolean(token));
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || t.history?.loadError || "Failed to load history.");
        setItems([]);
        return;
      }
      setItems(json.history || []);
    } catch {
      setError(t.history?.loadError || "Failed to load history.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t.history?.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6 py-6 overflow-x-hidden">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <IconScan className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-950 md:text-3xl">
              {t.history?.title || (lang === "hi" ? "फसल स्कैन इतिहास" : "Crop Scan History")}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
              {t.history?.subtitle || "Previous foliar diagnoses and agronomic recommendations"}
            </p>
          </div>
        </div>
      </div>

      {!hasToken ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs sm:text-sm text-amber-950 space-y-2">
          <p className="font-bold">
            {t.history?.loginPrompt || (lang === "hi" ? "अपना स्कैन इतिहास देखने के लिए कृपया लॉग इन करें।" : "Please log in to view your saved scan history.")}
          </p>
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all active:scale-95 shadow-xs"
          >
            {t.auth?.loginSubmit || "Log In"}
          </Link>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-xs sm:text-sm text-gray-500 font-medium">
          {t.common?.loading || "Loading scan records..."}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs sm:text-sm text-red-700 font-medium">{error}</p>
      ) : null}

      {!loading && hasToken && !error && items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs space-y-2">
          <IconSprout className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-900">
            {t.history?.empty || (lang === "hi" ? "अभी तक कोई फसल स्कैन दर्ज नहीं है।" : "No crop scans recorded yet.")}
          </p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {lang === "hi"
              ? "फसल की पत्तियों की 1-3 फोटो लेकर स्कैनर से जांच करें ताकि आपका इतिहास यहां सुरक्षित रहे।"
              : "Capture or upload crop photos using the 6-tier scanner to see your diagnoses saved here."}
          </p>
          <div className="pt-2">
            <Link
              href="/scanner"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-95"
            >
              {lang === "hi" ? "क्रॉप स्कैनर खोलें" : "Open Crop Scanner"}
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xs hover:border-emerald-300 transition-all"
            >
              <div className="flex gap-3">
                {row.thumbnail ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img
                      src={row.thumbnail}
                      alt={row.crop || "Crop"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <IconSprout className="w-6 h-6 stroke-[2]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-gray-950">
                    {row.crop || "Crop"}
                  </p>
                  <p className="line-clamp-1 text-xs sm:text-sm font-bold text-red-700">
                    {row.disease || "Healthy Foliage"}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
                    <IconCalendar className="w-3 h-3 text-gray-400" />
                    <span>
                      {row.date
                        ? new Date(row.date).toLocaleString(locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.is_healthy
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {row.is_healthy ? "Healthy" : `${row.severity || "Medium"} Extent`}
                </span>
                <span className="font-bold text-gray-700 text-[11px]">
                  {t.history?.confidence || "Reliability"}: {Math.round(row.confidence)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
