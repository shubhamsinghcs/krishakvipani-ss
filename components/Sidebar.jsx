"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/SidebarContext";
import { useLang } from "@/lib/LanguageContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const { t } = useLang();
  const links = [
    { label: t.nav?.dashboard || "Dashboard", href: "/" },
    { label: t.nav?.credit || "Credit Score", href: "/credit-score" },
    { label: t.nav?.yield || "Yield Prediction", href: "/yield-prediction" },
    { label: t.nav?.marketplace || "Marketplace", href: "/marketplace" },
    { label: t.nav?.mandi || "Mandi Prices", href: "/mandi" },
    { label: t.nav?.scanner || "Crop Scanner", href: "/scanner" },
    { label: t.nav?.history || "History", href: "/history" },
    { label: t.nav?.weather || "Weather", href: "/weather" },
    { label: t.nav?.transport || "Transport", href: "/transport" },
    { label: t.nav?.community || "Community", href: "/community" },
    { label: t.nav?.market || "Old Market", href: "/market" },
    { label: t.nav?.planner || "Planner", href: "/planner" },
    { label: t.nav?.expenses || "Expenses", href: "/expenses" },
    { label: t.nav?.finance || "Finance", href: "/finance" },
    { label: t.nav?.services || "Services", href: "/services" },
    { label: t.nav?.policy || "Policy", href: "/policy" },
    { label: t.nav?.assistantNav || "AI Assistant", href: "/assistant" },
    { label: t.nav?.news || "News", href: "/news" },
    { label: t.nav?.calculator || "Calculator", href: "/calculator" },
    { label: t.nav?.login || "Login", href: "/login" },
  ];

  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-label={t.nav.closeSidebar}
        />
      )}
      <aside
        className={`sidebar-slide fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-full max-w-xs border-r border-green-100/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm safe-bottom overflow-y-auto scrollbar-hide lg:fixed lg:z-30 lg:block lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col pb-8">
          <div className="space-y-1">
            {links.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex min-h-11 items-center rounded-xl border-l-4 px-3 py-2 text-sm transition duration-200 ease-out ${
                    active
                      ? "border-brand-primary bg-green-100 font-semibold text-green-800"
                      : "border-transparent text-gray-600 hover:bg-gray-50 active:scale-[0.99]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
