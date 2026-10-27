"use client";

import { useLang } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-auto border-t border-green-100/80 bg-white/90 py-5 text-center backdrop-blur-sm transition-colors relative z-10 safe-bottom">
      <p className="mx-auto max-w-xl px-4 text-[12px] leading-relaxed text-gray-600 sm:text-sm">
        {t.footer?.credit || "Developed by SrijanSetu — Solution Challenge: Build with AI 2026."}
      </p>
    </footer>
  );
}
