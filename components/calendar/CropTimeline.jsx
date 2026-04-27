"use client";

import { useMemo } from "react";
import { getCropTimelineSteps } from "@/lib/cropCalendar";
import { useLang } from "@/lib/LanguageContext";

const phaseAccent = {
  sowing: "border-emerald-200 bg-emerald-50",
  fertilizer: "border-amber-200 bg-amber-50",
  irrigation: "border-sky-200 bg-sky-50",
  harvest: "border-orange-200 bg-orange-50",
};

export default function CropTimeline({ cropName }) {
  const { t } = useLang();
  const steps = useMemo(() => getCropTimelineSteps(cropName), [cropName]);
  const phases = t.calendar?.phases || {};

  return (
    <div className="relative space-y-4 pl-1">
      <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-green-200 md:left-[17px]" aria-hidden />
      <ul className="relative space-y-4">
        {steps.map((step, index) => {
          const title = phases[step.phase] || step.phase;
          const weekText = (t.calendar?.weekLabel || "").replace("{n}", String(step.weeksFromSow));
          const accent = phaseAccent[step.phase] || "border-green-100 bg-white";
          return (
            <li key={`${step.phase}-${index}`} className="relative flex gap-4 pl-1">
              <span
                className="relative z-[1] mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-green-600 bg-white text-xs font-bold text-green-800"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className={`min-w-0 flex-1 rounded-xl border p-4 shadow-md ${accent}`}>
                <p className="text-base font-semibold text-brand-textDark">{title}</p>
                <p className="mt-1 text-xs font-medium text-brand-textMid">{weekText}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
