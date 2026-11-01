"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/LanguageContext";

const mspMap = {
  wheat: 2275,
  paddy: 2300,
  rice: 2300,
  cotton: 7121,
  maize: 2225,
  mustard: 5650,
  soybean: 4892,
  groundnut: 6783,
  gram: 5440,
  chana: 5440,
  moong: 8682,
  urad: 7400,
  bajra: 2625,
  barley: 1850,
  potato: 1400,
  onion: 1800,
  tomato: 1200,
};

export default function MandiTable({ data = [], crop = "", district = "" }) {
  const { t, lang } = useLang();
  const [sortKey, setSortKey] = useState("modalPrice");
  const [sortOrder, setSortOrder] = useState("desc");

  const cropKey = (crop || "").toLowerCase().trim();
  const mspValue = mspMap[cropKey] || 0;

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

  const stats = useMemo(() => {
    if (!mspValue || data.length === 0) return null;
    const aboveCount = data.filter((d) => d.modalPrice >= mspValue).length;
    const belowCount = data.length - aboveCount;
    return { aboveCount, belowCount };
  }, [data, mspValue]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  }

  return (
    <div className="space-y-4">
      {/* MSP Benchmark Notification Banner */}
      {mspValue > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🏛️</span>
            <div>
              <span className="font-bold text-emerald-950">
                {lang === "hi"
                  ? `न्यूनतम समर्थन मूल्य (MSP 2024-25): ₹${mspValue}/क्विंटल`
                  : lang === "pa"
                  ? `ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP 2024-25): ₹${mspValue}/ਕਵਿੰਟਲ`
                  : `Official Govt MSP (2024-25): ₹${mspValue}/Quintal`}
              </span>
              <p className="text-[11px] text-emerald-800">
                {lang === "hi"
                  ? `${crop} के लिए केंद्र सरकार द्वारा घोषित वैधानिक मूल्य`
                  : lang === "pa"
                  ? `${crop} ਲਈ ਕੇਂਦਰ ਸਰਕਾਰ ਵੱਲੋਂ ਨਿਰਧਾਰਤ ਮੁੱਲ`
                  : `Statutory benchmark price for ${crop}`}
              </p>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs text-emerald-900 font-bold">
                ✓ {stats.aboveCount} {lang === "hi" ? "मंडियां MSP से ऊपर" : "Mandis Above MSP"}
              </span>
              {stats.belowCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs text-amber-900 font-bold">
                  ⚠️ {stats.belowCount} {lang === "hi" ? "MSP से नीचे" : "Below MSP"}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {sorted.map((row, idx) => {
          const isAboveMsp = mspValue ? row.modalPrice >= mspValue : true;
          const diff = mspValue ? row.modalPrice - mspValue : 0;
          return (
            <div
              key={`${row.market}-${idx}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-gray-950">{row.market}</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100">
                  {row.variety}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="text-xs text-gray-500 font-medium">{t.mandi.modal}: </span>
                  <span
                    className={`text-lg font-black ${
                      isAboveMsp ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    ₹{row.modalPrice}
                  </span>
                  <span className="text-xs text-gray-500"> / {row.unit || "Quintal"}</span>
                </div>

                {mspValue > 0 && (
                  <span
                    className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isAboveMsp
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {diff >= 0 ? `+₹${diff} MSP` : `-₹${Math.abs(diff)} MSP`}
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>
                  {t.mandi.min}: ₹{row.minPrice} · {t.mandi.max}: ₹{row.maxPrice}
                </span>
                <span className="text-gray-400 font-medium">{district}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50/70 text-gray-900 border-b border-gray-200">
            <tr>
              {[
                ["market", t.mandi.market],
                ["variety", t.mandi.variety],
                ["minPrice", t.mandi.min],
                ["modalPrice", t.mandi.modal],
                ["maxPrice", t.mandi.max],
                ["unit", t.mandi.unitLabel],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="cursor-pointer px-4 py-3.5 font-bold hover:text-emerald-800 transition-colors"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{label}</span>
                    {sortKey === key && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
              ))}
              {mspValue > 0 && (
                <th className="px-4 py-3.5 font-bold text-gray-900">
                  {lang === "hi" ? "MSP तुलना" : "MSP Benchmark"}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((row, idx) => {
              const isAboveMsp = mspValue ? row.modalPrice >= mspValue : true;
              const diff = mspValue ? row.modalPrice - mspValue : 0;
              return (
                <tr key={`${row.market}-${idx}`} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-950">{row.market}</td>
                  <td className="px-4 py-3 text-gray-700">{row.variety}</td>
                  <td className="px-4 py-3 text-gray-600">₹{row.minPrice}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-base font-extrabold ${
                        isAboveMsp ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      ₹{row.modalPrice}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{row.maxPrice}</td>
                  <td className="px-4 py-3 text-gray-500 font-medium">{row.unit}</td>
                  {mspValue > 0 && (
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isAboveMsp
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {diff >= 0 ? `+₹${diff} Above MSP` : `-₹${Math.abs(diff)} Below MSP`}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
