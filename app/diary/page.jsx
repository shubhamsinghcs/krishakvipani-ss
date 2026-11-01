"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function DiaryPage() {
  const { t, lang } = useLang();
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "irrigation",
    crop: "",
    notes: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("farm_diary_logs");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const saveLog = (e) => {
    e.preventDefault();
    const newLog = { ...form, id: Date.now() };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem("farm_diary_logs", JSON.stringify(newLogs));
    setShowForm(false);
    setForm({ ...form, crop: "", notes: "" });
  };

  const deleteLog = (id) => {
    const newLogs = logs.filter(l => l.id !== id);
    setLogs(newLogs);
    localStorage.setItem("farm_diary_logs", JSON.stringify(newLogs));
  };

  const activityLabels = {
    irrigation: t.diary?.irrigation || "Irrigation",
    spray: t.diary?.spray || "Spraying",
    fertilizer: t.diary?.fertilizerWork || "Fertilizer Application",
    sowing: t.diary?.sowing || "Sowing",
    other: t.diary?.otherWork || "Other",
  };

  const getIcon = (type) => {
    if (type === "irrigation" || (typeof type === "string" && type.includes("सिंचाई"))) return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (type === "spray" || (typeof type === "string" && type.includes("स्प्रे"))) return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M21 11c0 5-9 11-9 11s-9-6-9-11a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (type === "fertilizer" || (typeof type === "string" && type.includes("खाद"))) return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2v20M5 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 10l5-5 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">
            {t.diary?.title || "Farmer Diary"}
          </h1>
          <p className="mt-1 text-sm text-brand-textMid">
            {t.diary?.subtitle || "Track daily field activities (irrigation, spraying, fertilizer application)."}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white font-bold py-2.5 px-5 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all whitespace-nowrap"
        >
          {showForm ? (t.diary?.close || "Close") : (t.diary?.addNew || "+ Add Activity")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveLog} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 animate-fade-in space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.diary?.date || "Date"}
              </label>
              <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.diary?.workType || "Activity Type"}
              </label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50">
                <option value="irrigation">{t.diary?.irrigation || "Irrigation"}</option>
                <option value="spray">{t.diary?.spray || "Spraying"}</option>
                <option value="fertilizer">{t.diary?.fertilizerWork || "Fertilizer Application"}</option>
                <option value="sowing">{t.diary?.sowing || "Sowing"}</option>
                <option value="other">{t.diary?.otherWork || "Other"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.diary?.cropOptional || "Crop (optional)"}
              </label>
              <input value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} placeholder={t.diary?.cropPlaceholder || "e.g., Wheat"} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.diary?.notes || "Notes"}
              </label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder={t.diary?.notesPlaceholder || "e.g., 1 bag urea applied in field 1"} className="w-full rounded-xl border border-green-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 bg-white/50 min-h-[80px]" />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all">
            {t.diary?.save || "Save to Diary"}
          </button>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40">
           <div className="mx-auto mb-3 text-green-700" aria-hidden>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M3 4h14v16H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M7 4v16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </div>
           <p className="mt-3 text-gray-600 font-medium">
             {t.diary?.noLogs || "No activities recorded yet. Add your first field log!"}
           </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl">
                {getIcon(log.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {activityLabels[log.type] || log.type}
                  </h3>
                  <button aria-label="delete-log" onClick={() => deleteLog(log.id)} className="text-red-400 hover:text-red-600 text-sm">
                    {t.common?.delete || "Delete"}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(log.date).toLocaleDateString(lang === "en" ? "en-IN" : `${lang}-IN`)} {log.crop && `• ${log.crop}`}
                </p>
                {log.notes && <p className="text-gray-700 bg-green-50/50 p-2 rounded-lg text-sm border border-green-100/50 mt-2">{log.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
