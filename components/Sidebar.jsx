"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/SidebarContext";
import { useLang } from "@/lib/LanguageContext";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const { t } = useLang();
  const sections = [
    {
      id: 'main',
      title: t.nav?.mainSection || 'Main',
      items: [
        { key: 'dashboard', label: t.nav?.dashboard || 'Dashboard', href: '/' },
        { key: 'profile', label: t.nav?.profile || 'My Profile', href: '/profile' },
        { key: 'planner', label: t.nav?.planner || 'Planner', href: '/planner' },
        { key: 'expenses', label: t.nav?.expenses || 'Expenses', href: '/expenses' },
      ],
    },
    {
      id: 'market',
      title: t.nav?.marketSection || 'Markets',
      items: [
        { key: 'marketplace', label: t.nav?.marketplace || 'Marketplace', href: '/marketplace' },
        { key: 'mandi', label: t.nav?.mandi || 'Mandi Prices', href: '/mandi' },
        { key: 'market', label: t.nav?.market || 'Market', href: '/market' },
      ],
    },
    {
      id: 'tools',
      title: t.nav?.toolsSection || 'Tools',
      items: [
        { key: 'scanner', label: t.nav?.scanner || 'Crop Scanner', href: '/scanner' },
        { key: 'yield', label: t.nav?.yield || 'Yield Prediction', href: '/yield-prediction' },
        { key: 'calculator', label: t.nav?.calculator || 'Calculator', href: '/calculator' },
        { key: 'finance', label: t.nav?.finance || 'Finance', href: '/finance' },
      ],
    },
    {
      id: 'community',
      title: t.nav?.communitySection || 'Community',
      items: [
        { key: 'community', label: t.nav?.community || 'Community', href: '/community' },
        { key: 'news', label: t.nav?.news || 'News', href: '/news' },
        { key: 'assistant', label: t.nav?.assistantNav || 'AI Assistant', href: '/assistant' },
      ],
    },
    {
      id: 'other',
      title: t.nav?.otherSection || 'Other',
      items: [
        { key: 'transport', label: t.nav?.transport || 'Transport', href: '/transport' },
        { key: 'weather', label: t.nav?.weather || 'Weather', href: '/weather' },
        { key: 'services', label: t.nav?.services || 'Services', href: '/services' },
        { key: 'policy', label: t.nav?.policy || 'Policy', href: '/policy' },
        { key: 'login', label: t.nav?.login || 'Login', href: '/login' },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState(() => {
    try {
      const raw = localStorage.getItem('sidebar_open_sections');
      return raw ? JSON.parse(raw) : { main: true, market: true, tools: true, community: true, other: false };
    } catch { return { main: true, market: true, tools: true, community: true, other: false }; }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebar_open_sections', JSON.stringify(openSections)); } catch {}
  }, [openSections]);

  function toggleSection(id) {
    setOpenSections(s => ({ ...s, [id]: !s[id] }));
  }

  function Icon({ name }) {
    const map = {
      dashboard: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      expenses: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      transport: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13h18v-4H3v4zM5 17h2v2H5v-2zM17 17h2v2h-2v-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      scanner: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7h4V3M21 7h-4V3M3 17h4v4M21 17h-4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
      community: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.2"/></svg>),
    };
    return map[name] || (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/></svg>);
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
      if (first) first.focus();

      const onKey = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSidebar();
        }
        if (e.key === 'Tab' && focusable.length) {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last && last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first && first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('keydown', onKey);
        try { prevActive && prevActive.focus(); } catch (e) {}
      };
    } catch (e) {}
  }, [isOpen, closeSidebar]);

  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-label={t.nav?.closeSidebar || "Close sidebar"}
        />
      )}
      <aside
        ref={asideRef}
        aria-hidden={!isOpen}
        className={`sidebar-slide fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-full max-w-xs border-r border-green-100/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm safe-bottom overflow-y-auto scrollbar-hide lg:fixed lg:z-30 lg:block lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col pb-8" aria-label="Main Navigation">
          {sections.map((sec) => (
            <div key={sec.id} className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center justify-between text-xs text-gray-500 px-1 py-2"
                aria-expanded={!!openSections[sec.id]}
                aria-controls={`sidebar-section-${sec.id}`}
              >
                <span className="font-semibold text-gray-700">{sec.title}</span>
                <span className="text-gray-400">{openSections[sec.id] ? '▾' : '▸'}</span>
              </button>
              {openSections[sec.id] && (
                <div id={`sidebar-section-${sec.id}`} className="mt-1 space-y-1">
                  {sec.items.map(item => {
                    const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link key={item.href} href={item.href} onClick={closeSidebar} aria-current={active ? 'page' : undefined} className={`flex min-h-[44px] items-center gap-3 rounded-xl border-l-4 px-3 py-2 text-sm transition duration-200 ease-out ${active ? 'border-brand-primary bg-green-100 font-semibold text-green-800' : 'border-transparent text-gray-600 hover:bg-gray-50 active:scale-[0.99]'}`}>
                        <span className="w-4 h-4 text-gray-600" aria-hidden="true">{<Icon name={item.key} />}</span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
