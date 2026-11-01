"use client";

import { useLang } from "@/lib/LanguageContext";

export default function ServicesPage() {
  const { t } = useLang();

  const cards = [
    {
      title: t.services?.tractorTitle || "Tractor on Rent",
      desc: t.services?.tractorDesc || "Book modern tractors and rotavators for field ploughing.",
      contact: "+91 9876543210",
    },
    {
      title: t.services?.storageTitle || "Cold Storage",
      desc: t.services?.storageDesc || "Safe storage for potatoes, vegetables, and perishable produce.",
      contact: "+91 8765432109",
    },
    {
      title: t.services?.agentTitle || "Mandi Agent",
      desc: t.services?.agentDesc || "Connect with verified commission agents for crop sales.",
      contact: "+91 9123456780",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
          {t.services?.title || "Nearby Farm Services"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.services?.subtitle || "Find rental farm machinery, cold storage, and certified mandi agents."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition-all flex flex-col items-center text-center">
            <div className="text-4xl mb-3 text-green-700" aria-hidden>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7h18v10H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-gray-800">{c.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex-1">{c.desc}</p>
            <a href={`tel:${c.contact.replace(/ /g,'')}`} className="mt-4 w-full min-h-[44px] bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center active:scale-95 transition-all shadow">
              {t.services?.contact || "Contact Now"}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
