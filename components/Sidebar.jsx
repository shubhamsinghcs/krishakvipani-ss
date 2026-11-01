"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/SidebarContext";
import { useLang } from "@/lib/LanguageContext";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const { t, lang } = useLang();

  const sections = [
    {
      id: 'core',
      title: lang === 'hi' ? 'मुख्य सेवाएं' : lang === 'pa' ? 'ਮੁੱਖ ਸੇਵਾਵਾਂ' : 'Core Farming',
      items: [
        { key: 'dashboard', label: t.nav?.dashboard || 'Dashboard', href: '/' },
        { key: 'scanner', label: t.nav?.scanner || 'Crop Scanner', href: '/scanner' },
        { key: 'mandi', label: t.nav?.mandi || 'Mandi Prices', href: '/mandi' },
        { key: 'marketplace', label: lang === 'hi' ? 'कृषि बाज़ार' : 'Krishi Bazaar', href: '/bazaar' },
      ],
    },
    {
      id: 'advisory',
      title: lang === 'hi' ? 'सलाह व संवाद' : lang === 'pa' ? 'ਸਲਾਹ ਅਤੇ ਸੰਵਾਦ' : 'Advisory & Community',
      items: [
        { key: 'assistant', label: t.nav?.assistantNav || 'AI Assistant', href: '/assistant' },
        { key: 'weather', label: t.nav?.weather || 'Weather Forecast', href: '/weather' },
        { key: 'community', label: t.nav?.community || 'Community', href: '/community' },
        { key: 'news', label: t.nav?.news || 'Agri News', href: '/news' },
        { key: 'policy', label: t.nav?.policy || 'Govt Schemes', href: '/policy' },
      ],
    },
    {
      id: 'management',
      title: lang === 'hi' ? 'खेत प्रबंधन' : lang === 'pa' ? 'ਖੇਤ ਪ੍ਰਬੰਧਨ' : 'Farm Management',
      items: [
        { key: 'expenses', label: t.nav?.expenses || 'Expenses & Profit', href: '/expenses' },
        { key: 'finance', label: t.nav?.finance || 'KCC & Insurance', href: '/finance' },
        { key: 'planner', label: t.nav?.planner || 'Smart Planner', href: '/planner' },
        { key: 'calculator', label: t.nav?.calculator || 'Calculators', href: '/calculator' },
        { key: 'transport', label: t.nav?.transport || 'Transport & Logistics', href: '/transport' },
        { key: 'services', label: t.nav?.services || 'Farm Services', href: '/services' },
      ],
    },
    {
      id: 'account',
      title: lang === 'hi' ? 'खाता व सेटिंग्स' : lang === 'pa' ? 'ਖਾਤਾ' : 'Account',
      items: [
        { key: 'profile', label: t.nav?.profile || 'My Profile', href: '/profile' },
        { key: 'history', label: lang === 'hi' ? 'स्कैन इतिहास' : 'Scan History', href: '/history' },
        { key: 'login', label: t.nav?.login || 'Login / Signup', href: '/login' },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState(() => {
    try {
      const raw = localStorage.getItem('sidebar_open_sections');
      return raw ? JSON.parse(raw) : { core: true, advisory: true, management: false, account: false };
    } catch {
      return { core: true, advisory: true, management: false, account: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_open_sections', JSON.stringify(openSections));
    } catch {}
  }, [openSections]);

  function toggleSection(id) {
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));
  }

  function Icon({ name }) {
    const map = {
      dashboard: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      scanner: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h4V3M21 7h-4V3M3 17h4v4M21 17h-4v4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.5"/></svg>),
      mandi: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      marketplace: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      assistant: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      weather: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      community: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4"/></svg>),
      news: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      policy: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      expenses: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      finance: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      planner: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      calculator: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/></svg>),
      transport: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>),
      services: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      profile: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      history: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      login: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    };
    return map[name] || (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/></svg>);
  }

  const asideRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevActive = typeof document !== 'undefined' ? document.activeElement : null;
    try {
      const el = asideRef.current;
      const focusable = el ? Array.from(el.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(Boolean) : [];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      function handleKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSidebar();
        } else if (e.key === 'Tab') {
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      document.addEventListener('keydown', handleKey);
      if (first) first.focus();

      return () => {
        document.removeEventListener('keydown', handleKey);
        try { if (prevActive && prevActive.focus) prevActive.focus(); } catch (e) {}
      };
    } catch (e) {}
  }, [isOpen, closeSidebar]);

  return (
    <>
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        ref={asideRef}
        aria-label={t.nav?.sidebarAriaLabel || 'Sidebar Navigation'}
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-out flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-4">
          <nav className="space-y-4">
            {sections.map((sec) => (
              <div key={sec.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  aria-expanded={Boolean(openSections[sec.id])}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-green-700 transition"
                >
                  <span>{sec.title}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {openSections[sec.id] ? '▲' : '▼'}
                  </span>
                </button>

                {openSections[sec.id] && (
                  <div className="space-y-0.5 pt-0.5">
                    {sec.items.map((it) => {
                      const active = pathname === it.href;
                      return (
                        <Link
                          key={it.key}
                          href={it.href}
                          onClick={() => closeSidebar()}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            active
                              ? 'bg-green-50 text-green-800 font-bold border-l-4 border-green-600 pl-2.5'
                              : 'text-gray-700 hover:bg-gray-100/70 hover:text-green-700'
                          }`}
                        >
                          <span className={`${active ? 'text-green-700' : 'text-gray-500'}`}>
                            <Icon name={it.key} />
                          </span>
                          <span className="truncate">{it.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center font-medium">
            Krishak Vipani v2.0 · ICAR Verified
          </p>
        </div>
      </aside>
    </>
  );
}
