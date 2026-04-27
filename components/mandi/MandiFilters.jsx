"use client";

import { CROPS, PUNJAB_DISTRICTS } from "@/lib/constants";
import { useLang } from "@/lib/LanguageContext";

export default function MandiFilters({ crop, district, onCropChange, onDistrictChange, onSearch }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-md">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={crop}
          onChange={(e) => onCropChange(e.target.value)}
          className="min-h-[44px] rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
        >
          {CROPS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="min-h-[44px] rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
        >
          {PUNJAB_DISTRICTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSearch}
          className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95 sm:w-auto"
        >
          {t.common.search}
        </button>
      </div>
    </div>
  );
}
