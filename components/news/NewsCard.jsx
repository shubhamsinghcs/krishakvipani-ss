"use client";

import { useLang } from "@/lib/LanguageContext";

export default function NewsCard({ article }) {
  const { lang } = useLang();
  const locale = lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN";
  return (
    <article className="flex h-full flex-col rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <h3 className="line-clamp-2 text-base font-semibold text-brand-textDark">{article.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-gray-600">{article.summary}</p>
      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{article.source}</span>
          <span>{new Date(article.date).toLocaleDateString(locale)}</span>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-[44px] items-center text-sm font-semibold text-green-700"
        >
          और पढ़ें →
        </a>
      </div>
    </article>
  );
}
