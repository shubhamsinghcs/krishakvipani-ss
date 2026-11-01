"use client";

import { CROPS, PUNJAB_DISTRICTS } from "@/lib/constants";
import { useLang } from "@/lib/LanguageContext";
import { IconSearch } from "@/components/ui/Icons";

export default function MandiFilters({
  crop,
  district,
  onCropChange,
  onDistrictChange,
  onSearch,
}) {
  const { t, lang } = useLang();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
        <IconSearch className="w-4 h-4 text-emerald-700" />
        <span>{lang === "hi" ? "मंडी खोज फ़िल्टर" : "Filter Mandi Rates"}</span>
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {lang === "hi" ? "फसल चुनें" : "Select Commodity"}
          </label>
          <select
            value={crop}
            onChange={(e) => onCropChange(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            aria-label="Select Commodity"
          >
            {CROPS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {lang === "hi" ? "जिला चुनें" : "Select District"}
          </label>
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            aria-label="Select District"
          >
            {PUNJAB_DISTRICTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onSearch}
          className="w-full min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-all active:scale-95 shadow-xs flex items-center justify-center gap-2"
        >
          <IconSearch className="w-4 h-4" />
          <span>{t.common?.search || (lang === "hi" ? "भाव खोजें" : "Search Rates")}</span>
        </button>
      </div>
    </div>
  );
}
