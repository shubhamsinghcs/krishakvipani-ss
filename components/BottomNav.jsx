"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const links = [
    { label: t.nav?.dashboard || "Home", href: "/", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5L12 4l9 7.5v7a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1v-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
    { label: t.nav?.community || "Community", href: "/community", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 20v-1c0-2.21 3.58-4 6-4s6 1.79 6 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
    { label: t.nav?.market || "Market", href: "/market", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2l1.5 4h9L18 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6h18l-1 14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
    { label: t.nav?.planner || "Planner", href: "/planner", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur-lg border-t border-green-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="flex h-16 items-center justify-around px-2 safe-bottom">
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
