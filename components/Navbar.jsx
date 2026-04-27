"use client";

import Image from "next/image";
import { useSidebar } from "@/lib/SidebarContext";
import { useLang } from "@/lib/LanguageContext";
import { DEFAULT_REGION_CITY, DEFAULT_REGION_STATE } from "@/lib/regionDefaults";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { lang, changeLang, t } = useLang();
  const regionLabel = `${DEFAULT_REGION_STATE}, ${DEFAULT_REGION_CITY}`;
  const languageOptions = [
    { key: "en", label: "English" },
    { key: "hi", label: "हिंदी" },
    { key: "pa", label: "ਪੰਜਾਬੀ" },
    { key: "bn", label: "বাংলা" },
    { key: "gu", label: "ગુજરાતી" },
    { key: "mr", label: "मराठी" },
    { key: "ta", label: "தமிழ்" },
    { key: "te", label: "తెలుగు" },
    { key: "kn", label: "ಕನ್ನಡ" },
    { key: "ml", label: "മലയാളം" },
    { key: "or", label: "ଓଡ଼ିଆ" },
    { key: "as", label: "অসমীয়া" },
    { key: "ur", label: "اردو" },
    { key: "sa", label: "संस्कृतम्" },
    { key: "ks", label: "कॉशुर" },
    { key: "ne", label: "नेपाली" },
    { key: "sd", label: "سنڌي" },
    { key: "kok", label: "कोंकणी" },
    { key: "mai", label: "मैथिली" },
    { key: "mni", label: "মৈতৈলোন্" },
    { key: "doi", label: "डोगरी" },
    { key: "brx", label: "बड़ो" }
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-white/40 bg-white/50 text-gray-800 transition-all duration-300 ease-out hover:bg-white/80 active:scale-95 lg:hidden"
            aria-label={t("nav.openSidebar") || t.nav?.openSidebar}
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <Image src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0" unoptimized />
            <span className="truncate text-base font-bold text-gray-600 md:text-lg">{t("common.appName") || t.common?.appName}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center rounded-xl border border-white/40 bg-white/50 shadow-sm overflow-hidden min-h-[44px] transition-all duration-300 hover:bg-white/80 active:scale-95">
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="bg-transparent pl-3 pr-8 py-2 text-sm font-semibold text-gray-800 outline-none cursor-pointer transition-all duration-300 w-full h-full"
              aria-label="Select Language"
            >
              {languageOptions.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div
            className="hidden max-w-[10rem] truncate sm:block"
            title={regionLabel}
          >
            <span className="inline-flex min-h-[44px] items-center rounded-full border border-white/40 bg-white/50 px-3 text-xs font-medium text-brand-textMid shadow-sm transition-all duration-300 hover:bg-white/80">
              {regionLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
