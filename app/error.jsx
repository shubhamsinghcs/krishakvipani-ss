"use client";

import { useLang } from "@/lib/LanguageContext";

export default function Error({ reset }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
      <p className="text-2xl">⚠️</p>
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
