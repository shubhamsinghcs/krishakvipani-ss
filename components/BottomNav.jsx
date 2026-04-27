"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const links = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "Community", href: "/community", icon: "🤝" },
    { label: "Market", href: "/market", icon: "🛒" },
    { label: "Planner", href: "/planner", icon: "🌾" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur-lg border-t border-green-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-200 active:scale-95 ${
                active ? "text-green-600" : "text-gray-500 hover:text-green-500"
              }`}
            >
              <span className={`text-xl ${active ? "scale-110 drop-shadow-md" : ""}`}>{item.icon}</span>
              <span className={`text-[10px] font-medium tracking-tight ${active ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
