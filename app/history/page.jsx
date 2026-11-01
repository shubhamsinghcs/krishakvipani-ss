"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";

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
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
          {t.history?.title || "Scan History"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.history?.subtitle || "Previous crop scans and diagnostics"}
        </p>
      </div>

      {!hasToken ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{t.history?.loginPrompt || "Please log in to view your saved scan history."}</p>
          <Link
            href="/login"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
          >
            {t.auth?.loginSubmit || "Log In"}
          </Link>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-gray-500">
          {t.common?.loading || "Loading..."}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
      ) : null}

      {!loading && hasToken && !error && items.length === 0 ? (
        <div className="rounded-2xl border border-green-100 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-700">
            {t.history?.empty || "No crop scans recorded yet."}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Capture or upload a crop photo using the scanner to see your diagnoses here.
          </p>
          <Link
            href="/scanner"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-green-700 active:scale-95"
          >
            Go to Crop Scanner
          </Link>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-md transition hover:shadow-lg"
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
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl text-green-700">
                    🌱
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-gray-900">
                    {row.crop || "Crop"}
                  </p>
                  <p className="line-clamp-1 text-sm font-semibold text-red-700">
                    {row.disease || "Healthy"}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {row.date
                      ? new Date(row.date).toLocaleString(locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.is_healthy
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {row.is_healthy ? "Healthy" : `${row.severity || "Medium"} Severity`}
                </span>
                <span className="font-semibold text-gray-600">
                  {t.history?.confidence || "Confidence"}: {Math.round(row.confidence)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
