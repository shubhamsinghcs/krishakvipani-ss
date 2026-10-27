"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function OfflineClient() {
  const { t } = useLang();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl" aria-hidden>
        
      </p>
      <h1 className="mt-4 text-xl font-bold text-brand-textDark">{t("offlinePage.title") || t.offlinePage?.title}</h1>
      <p className="mt-2 text-sm text-brand-textMid">{t("offlinePage.desc") || t.offlinePage?.desc}</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-600 px-6 py-2 text-sm font-semibold text-white transition active:scale-95"
      >
        {t("offlinePage.home") || t.offlinePage?.home}
      </Link>
    </div>
  );
}
