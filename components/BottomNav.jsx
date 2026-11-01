"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import {
  IconHome,
  IconScan,
  IconStore,
  IconSprout,
  IconUser,
} from "@/components/ui/Icons";

export default function BottomNav() {
  const pathname = usePathname();
  const { t, lang } = useLang();

  const isScannerActive = pathname === "/scanner";
  const isHomeActive = pathname === "/";
  const isMarketActive =
    pathname.startsWith("/bazaar") ||
    pathname === "/market" ||
    pathname === "/marketplace" ||
    pathname === "/shop";
  const isFarmActive =
    pathname.startsWith("/planner") || pathname.startsWith("/diary");
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-200 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex h-16 items-center justify-between px-2 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            isHomeActive
              ? "text-emerald-800 font-bold"
              : "text-gray-500 hover:text-emerald-700"
          }`}
          aria-current={isHomeActive ? "page" : undefined}
        >
          <IconHome className={`w-5 h-5 ${isHomeActive ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            {t.nav?.dashboard || (lang === "hi" ? "होम" : lang === "pa" ? "ਹੋਮ" : "Home")}
          </span>
        </Link>

        {/* 2. Marketplace / Krishi Bazaar */}
        <Link
          href="/bazaar"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            isMarketActive
              ? "text-emerald-800 font-bold"
              : "text-gray-500 hover:text-emerald-700"
          }`}
          aria-current={isMarketActive ? "page" : undefined}
        >
          <IconStore className={`w-5 h-5 ${isMarketActive ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            {lang === "hi" ? "बाज़ार" : lang === "pa" ? "ਬਾਜ਼ਾਰ" : "Market"}
          </span>
        </Link>

        {/* 3. CENTER ELEVATED CROP SCANNER CTA */}
        <div className="flex-1 flex justify-center -mt-5">
          <Link
            href="/scanner"
            className="flex flex-col items-center group active:scale-95 transition-all focus:outline-none"
            aria-label={lang === "hi" ? "फसल रोग स्कैन करें" : "Scan Crop Disease"}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform ${
                isScannerActive
                  ? "bg-emerald-700 text-white ring-4 ring-emerald-200 scale-105"
                  : "bg-emerald-600 text-white hover:scale-105 ring-4 ring-white"
              }`}
            >
              <IconScan className="w-7 h-7 stroke-[2.2]" />
            </div>
            <span
              className={`text-[11px] font-bold mt-1 tracking-tight ${
                isScannerActive ? "text-emerald-800" : "text-gray-800"
              }`}
            >
              {lang === "hi" ? "स्कैनर" : lang === "pa" ? "ਸਕੈਨਰ" : "Scan"}
            </span>
          </Link>
        </div>

        {/* 4. My Farm / Planner */}
        <Link
          href="/planner"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            isFarmActive
              ? "text-emerald-800 font-bold"
              : "text-gray-500 hover:text-emerald-700"
          }`}
          aria-current={isFarmActive ? "page" : undefined}
        >
          <IconSprout className={`w-5 h-5 ${isFarmActive ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            {lang === "hi" ? "मेरी खेती" : lang === "pa" ? "ਮੇਰੀ ਖੇਤੀ" : "My Farm"}
          </span>
        </Link>

        {/* 5. Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            isProfileActive
              ? "text-emerald-800 font-bold"
              : "text-gray-500 hover:text-emerald-700"
          }`}
          aria-current={isProfileActive ? "page" : undefined}
        >
          <IconUser className={`w-5 h-5 ${isProfileActive ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            {t.nav?.profile || (lang === "hi" ? "प्रोफ़ाइल" : lang === "pa" ? "ਪ੍ਰੋਫਾਈਲ" : "Profile")}
          </span>
        </Link>
      </div>
    </nav>
  );
}
