"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CROPS } from "@/lib/constants";
import { useLang } from "@/lib/LanguageContext";

const CropTimeline = dynamic(() => import("@/components/calendar/CropTimeline"), { ssr: false });

export default function CalendarPage() {
  const { t } = useLang();
  const [crop, setCrop] = useState("Wheat");

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-0">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.calendar?.title}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.calendar?.subtitle}</p>
      </div>

      <div className="space-y-2 rounded-2xl border border-green-100 bg-white p-4 shadow-md">
        <label className="text-sm font-medium text-brand-textDark">{t.calendar?.selectCrop}</label>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-green-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-green-400"
        >
          {CROPS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <CropTimeline cropName={crop} />
    </div>
  );
}
