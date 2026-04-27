"use client";

import Link from "next/link";
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
        setError(json.message || t.history.loadError);
        setItems([]);
        return;
      }
      setItems(json.history || []);
    } catch {
      setError(t.history.loadError);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t.history.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6 py-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.history.title}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.history.subtitle}</p>
      </div>

      {!hasToken ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{t.history.loginPrompt}</p>
          <Link
            href="/login"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
          >
            {t.auth.loginSubmit}
          </Link>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-gray-500">{t.common.loading}</div>
      ) : null}

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

      {!loading && hasToken && !error && items.length === 0 ? (
        <p className="rounded-2xl border border-green-100 bg-white p-4 text-sm text-gray-600 shadow-sm">{t.history.empty}</p>
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex h-full min-h-[140px] flex-col bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-4 hover:scale-[1.02] transition-all"
            >
              <div className="flex flex-1 flex-col gap-2">
                <p className="line-clamp-2 text-base font-semibold text-brand-textDark">
                  {row.crop || "—"} · <span className="text-brand-accent">{row.disease || "—"}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {row.date
                    ? new Date(row.date).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </p>
                <p className="mt-auto text-sm text-brand-textMid">
                  {t.history.confidence}: <span className="font-semibold text-green-700">{Math.round(row.confidence)}%</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
