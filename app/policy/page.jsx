"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PolicyCard from "@/components/policy/PolicyCard";
import { useLang } from "@/lib/LanguageContext";

const categories = ["All", "MSP", "Subsidy", "Insurance", "Loan", "Technology", "Export"];

export default function PolicyPage() {
  const { t } = useLang();
  const [active, setActive] = useState("All");
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const query = active === "All" ? "" : `?category=${encodeURIComponent(active)}`;
        const res = await fetch(`/api/policy${query}`);
        const json = await res.json();
        setPolicies(json.policies || []);
      } catch (_error) {
        setPolicies([]);
      }
    };
    load();
  }, [active]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-0">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.policy.title}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.policy.subtitle}</p>
      </div>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => {
          const selected = item === active;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setActive(item)}
              className={`min-h-[44px] whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition active:scale-95 ${
                selected ? "border-green-600 bg-green-600 text-white" : "border-green-200 bg-white text-green-700"
              }`}
            >
              {item === "All" ? t.policy.all : item}
            </button>
          );
        })}
      </div>

      {policies.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      ) : (
        <EmptyState title={t.policy.noDataTitle} description={t.policy.noDataDesc} />
      )}
    </div>
  );
}
