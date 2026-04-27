"use client";

import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

const badgeClass = {
  MSP: "bg-green-100 text-green-700",
  Subsidy: "bg-blue-100 text-blue-700",
  Insurance: "bg-purple-100 text-purple-700",
  Loan: "bg-yellow-100 text-yellow-700",
  Technology: "bg-cyan-100 text-cyan-700",
  Export: "bg-orange-100 text-orange-700",
};

export default function PolicyCard({ policy }) {
  const { lang, t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const locale = lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass[policy.category] || "bg-gray-100 text-gray-700"}`}>
            {policy.category}
          </span>
          {policy.isNew ? <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">{t.policy.newBadge}</span> : null}
        </div>
        <span className="text-xs text-gray-500">{new Date(policy.date).toLocaleDateString(locale)}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold text-brand-textDark">{policy.title}</h3>
      <p className={`mt-2 text-sm text-gray-600 ${expanded ? "" : "line-clamp-3"}`}>{policy.summary}</p>
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="min-h-[44px] text-sm font-semibold text-brand-textMid transition active:scale-95"
        >
          {expanded ? t.common.collapse : t.common.expand}
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between pt-3">
        <p className="text-xs text-gray-500">{policy.source}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBookmarked((prev) => !prev)}
            className="min-h-[44px] text-sm font-semibold text-brand-textMid transition active:scale-95"
          >
            {bookmarked ? `🔖 ${t.common.bookmarked}` : `🔖 ${t.common.bookmark}`}
          </button>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(policy.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] py-2 text-sm font-semibold text-green-700"
          >
            {t.common.readMore}
          </a>
        </div>
      </div>
    </article>
  );
}
