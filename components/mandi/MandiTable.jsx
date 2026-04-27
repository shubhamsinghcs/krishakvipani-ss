"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/LanguageContext";

const mspMap = {
  wheat: 2275,
  rice: 2300,
  cotton: 7100,
  maize: 2225,
  mustard: 5650,
  potato: 1400,
  onion: 1800,
  chana: 5440,
};

export default function MandiTable({ data = [], crop = "", district = "" }) {
  const { t } = useLang();
  const [sortKey, setSortKey] = useState("modalPrice");
  const [sortOrder, setSortOrder] = useState("desc");
  const mspValue = mspMap[crop.toLowerCase()] || 0;

  const sorted = useMemo(() => {
    const cloned = [...data];
    cloned.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return cloned;
  }, [data, sortKey, sortOrder]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {sorted.map((row, idx) => {
          const isAboveMsp = row.modalPrice >= mspValue;
          return (
            <div key={`${row.market}-${idx}`} className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-brand-textDark">🏪 {row.market}</h3>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-brand-textMid">{row.variety}</span>
              </div>
              <p className="text-sm text-gray-700">
                {t.mandi.min} ₹{row.minPrice} ·{" "}
                <span className={isAboveMsp ? "font-semibold text-green-700" : "font-semibold text-red-600"}>
                  {t.mandi.modal} ₹{row.modalPrice}
                  {isAboveMsp && <span className="ml-1 text-xs text-blue-600 font-normal">भाव बढ़ सकता है 📈</span>}
                </span>{" "}
                · {t.mandi.max} ₹{row.maxPrice}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {t.mandi.unitLabel}: {row.unit} | {t.mandi.districtLabel}: {district}
              </p>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-green-50 text-brand-textDark">
            <tr>
              {[
                ["market", t.mandi.market],
                ["variety", t.mandi.variety],
                ["minPrice", t.mandi.min],
                ["modalPrice", t.mandi.modal],
                ["maxPrice", t.mandi.max],
                ["unit", t.mandi.unitLabel],
              ].map(([key, label]) => (
                <th key={key} className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort(key)}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const isAboveMsp = row.modalPrice >= mspValue;
              return (
                <tr key={`${row.market}-${idx}`} className="border-t border-green-100">
                  <td className="px-4 py-3">{row.market}</td>
                  <td className="px-4 py-3">{row.variety}</td>
                  <td className="px-4 py-3">₹{row.minPrice}</td>
                  <td className={`px-4 py-3 font-semibold ${isAboveMsp ? "text-green-700" : "text-red-600"}`}>
                    ₹{row.modalPrice}
                    {isAboveMsp && <span className="ml-2 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">भाव बढ़ सकता है 📈</span>}
                  </td>
                  <td className="px-4 py-3">₹{row.maxPrice}</td>
                  <td className="px-4 py-3">{row.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
