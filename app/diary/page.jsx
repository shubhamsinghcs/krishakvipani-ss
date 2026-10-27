"use client";

import { useState, useEffect } from "react";

export default function DiaryPage() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "सिंचाई (Irrigation)",
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

  const getIcon = (type) => {
    if (type.includes("सिंचाई")) return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (type.includes("स्प्रे")) return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M21 11c0 5-9 11-9 11s-9-6-9-11a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (type.includes("खाद")) return (
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
          <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">किसान डायरी</h1>
          <p className="mt-1 text-sm text-brand-textMid">
            अपने खेत के रोज़ाना काम (सिंचाई, स्प्रे, खाद) का हिसाब रखें।
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white font-bold py-2.5 px-5 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all whitespace-nowrap"
        >
          {showForm ? "बंद करें" : "नया काम जोड़ें"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveLog} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 animate-fade-in space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">तारीख</label>
              <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">काम का प्रकार</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50">
                <option value="सिंचाई (Irrigation)">सिंचाई (Irrigation)</option>
                <option value="स्प्रे (Spray)">स्प्रे (Spray)</option>
                <option value="खाद (Fertilizer)">खाद (Fertilizer)</option>
                <option value="बिजाई (Sowing)">बिजाई (Sowing)</option>
                <option value="अन्य (Other)">अन्य (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">फसल (वैकल्पिक)</label>
              <input value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} placeholder="जैसे: गेहूं" className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">विवरण</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="जैसे: यूरिया डाला (1 बोरी)" className="w-full rounded-xl border border-green-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 bg-white/50 min-h-[80px]" />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all">
            सेव करें
          </button>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40">
           <div className="mx-auto mb-3" aria-hidden>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M3 4h14v16H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M7 4v16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </div>
           <p className="mt-3 text-gray-600 font-medium">डायरी में कोई काम दर्ज नहीं है।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                {getIcon(log.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg">{log.type}</h3>
                  <button aria-label="delete-log" onClick={() => deleteLog(log.id)} className="text-red-400 hover:text-red-600 text-sm">हटाएँ</button>
                </div>
                <p className="text-sm text-gray-500 mb-1">{new Date(log.date).toLocaleDateString('hi-IN')} {log.crop && `• ${log.crop}`}</p>
                {log.notes && <p className="text-gray-700 bg-green-50/50 p-2 rounded-lg text-sm border border-green-100/50 mt-2">{log.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
