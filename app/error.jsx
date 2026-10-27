"use client";

import { useLang } from "@/lib/LanguageContext";

export default function Error({ reset }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="mt-2 text-xl font-semibold text-red-700">{t.errors.genericTitle}</h2>
      <p className="mt-1 text-sm text-gray-600">{t.errors.genericDesc}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 min-h-[44px] rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
      >
        {t.common.retry}
      </button>
    </div>
  );
}
