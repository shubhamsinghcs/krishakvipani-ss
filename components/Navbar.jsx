"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/lib/SidebarContext";
import NotificationCenter from "./NotificationCenter";
import { useLang } from "@/lib/LanguageContext";
import { DEFAULT_REGION_CITY, DEFAULT_REGION_STATE } from "@/lib/regionDefaults";
import { useEffect, useState } from "react";
import { IconMapPin, IconSun, IconUser } from "@/components/ui/Icons";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { lang, changeLang, t, languageOptions = [] } = useLang();
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("theme") || "light" : "light"
  );
  const regionLabel = `${DEFAULT_REGION_STATE}, ${DEFAULT_REGION_CITY}`;
  useInitTheme(setTheme);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 bg-white border-b border-gray-200 shadow-xs transition-all duration-200">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 transition-all hover:bg-gray-100 active:scale-95 lg:hidden"
            aria-label={t("nav.openSidebar") || t.nav?.openSidebar || "Toggle Sidebar"}
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
          <Link href="/" className="flex min-w-0 items-center gap-2.5 focus:outline-none">
            <Image
              src="/logo.svg"
              alt="KrishakVipani"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
              unoptimized
            />
            <span className="truncate text-base font-bold text-gray-950 md:text-lg tracking-tight">
              {t("common.appName") || t.common?.appName || "KrishakVipani"}
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {/* Prominent High-Contrast Vernacular Language Selector */}
          <div className="relative flex items-center rounded-xl border border-emerald-300 bg-emerald-50/70 shadow-2xs overflow-hidden min-h-[42px] transition hover:bg-emerald-100/60 active:scale-95">
            <span className="pl-2.5 text-sm select-none" aria-hidden="true">🌐</span>
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="bg-transparent pl-1.5 pr-7 py-2 text-xs sm:text-sm font-bold text-emerald-950 outline-none cursor-pointer w-full h-full appearance-none"
              aria-label="Select Language / भाषा चुनें"
            >
              {languageOptions.map((item) => (
                <option
                  key={item.key || item.code}
                  value={item.key || item.code}
                  className="text-gray-900 font-medium"
                >
                  {item.label || item.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 text-[10px] text-emerald-800 font-bold">
              ▼
            </span>
          </div>

          <div className="hidden max-w-[11rem] truncate sm:block" title={regionLabel}>
            <span className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-700 shadow-2xs">
              <IconMapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate">{regionLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                try {
                  document.documentElement.classList.toggle("dark", next === "dark");
                  window.localStorage.setItem("theme", next);
                } catch {}
              }}
              aria-pressed={theme === "dark"}
              aria-label={theme === "dark" ? "Disable dark theme" : "Enable dark theme"}
              className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95 shadow-2xs"
            >
              <IconSun className="w-4 h-4" />
            </button>

            <div>
              <NotificationCenter />
            </div>

            {/* Desktop Account / Login Link */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 min-h-[42px] px-3.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold transition-all shadow-2xs"
            >
              <IconUser className="w-4 h-4 stroke-[2.2]" />
              <span>{t.nav?.login || (lang === "hi" ? "लॉग इन" : "Login")}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function useInitTheme(setTheme) {
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("theme");
      const t =
        saved ||
        (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      setTheme(t);
      document.documentElement.classList.toggle("dark", t === "dark");
    } catch {}
  }, [setTheme]);
}
