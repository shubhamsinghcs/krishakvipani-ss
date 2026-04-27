"use client";

import { useLang } from "@/lib/LanguageContext";

export default function Error({ reset }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <h2 className="text-lg font-semibold text-red-700">{t.errors.mandiTitle}</h2>
      <p className="mt-1 text-sm text-red-600">{t.errors.mandiDesc}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-3 min-h-[44px] rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
      >
        {t.common.retry}
      </button>
    </div>
  );
}
