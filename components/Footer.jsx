"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { IconShieldCheck, IconPhone, IconMapPin } from "@/components/ui/Icons";

export default function Footer() {
  const { lang, t } = useLang();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-8 transition-colors relative z-10 safe-bottom">
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-gray-600">
          <div className="space-y-2 md:col-span-2">
            <span className="text-sm font-black text-gray-950 block">
              KrishakVipani · कृषक विपणि
            </span>
            <p className="leading-relaxed text-gray-600 max-w-md">
              {lang === "hi"
                ? "भारतीय किसानों के लिए समर्पित डिजिटल कृषि मंच — सटीक फसल रोग पहचान, लाइव मंडी भाव, न्यूनतम समर्थन मूल्य (MSP) और पारदर्शी कृषि बाज़ार।"
                : "A unified digital agriculture platform for Indian farmers — providing calibrated crop diagnosis, live mandi rates, statutory MSP benchmarks, and commission-free farm trading."}
            </p>
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold pt-1">
              <IconShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>ICAR, PAU & CIBRC Agronomic Compliance</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-gray-950 uppercase tracking-wider block">
              {lang === "hi" ? "त्वरित लिंक्स" : "Quick Links"}
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link href="/scanner" className="hover:text-emerald-700 transition-colors">
                  {t.nav?.scanner || "Crop Scanner"}
                </Link>
              </li>
              <li>
                <Link href="/mandi" className="hover:text-emerald-700 transition-colors">
                  {t.nav?.mandi || "Mandi Prices"}
                </Link>
              </li>
              <li>
                <Link href="/bazaar" className="hover:text-emerald-700 transition-colors">
                  {lang === "hi" ? "कृषि बाज़ार" : "Krishi Bazaar"}
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-emerald-700 transition-colors">
                  {t.nav?.planner || "Smart Crop Planner"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-gray-950 uppercase tracking-wider block">
              {lang === "hi" ? "किसान सहायता" : "Farmer Helpline"}
            </span>
            <p className="text-gray-600 leading-relaxed">
              {lang === "hi"
                ? "सरकारी किसान कॉल सेंटर (24x7 टोल-फ्री):"
                : "National Kisan Call Centre (24x7 Toll-Free):"}
            </p>
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-1.5 font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
            >
              <IconPhone className="w-3.5 h-3.5" />
              <span>1800-180-1551</span>
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
          <p>
            {t.footer?.credit || "Developed by SrijanSetu — Solution Challenge: Build with AI 2026."}
          </p>
          <p>
            {lang === "hi"
              ? "डेटा स्रोत: Agmarknet, DAC&FW, ICAR व राज्य कृषि विश्वविद्यालय।"
              : "Data Sources: Agmarknet, DAC&FW, ICAR & State Agricultural Universities."}
          </p>
        </div>
      </div>
    </footer>
  );
}
