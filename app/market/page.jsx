"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function DirectMarketPage() {
  const { t } = useLang();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    crop: "",
    quantity: "",
    price: "",
    location: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCrops = useCallback(async () => {
    try {
      const res = await fetch("/api/market");
      const data = await res.json();
      if (data.success) {
        setCrops(data.crops);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(t("marketPage.loadError") || "Error loading crops.");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ crop: "", quantity: "", price: "", location: "", phone: "" });
        fetchCrops();
      } else {
        alert(data.message || t("errors.unknown") || "An error occurred");
      }
    } catch (err) {
      alert(t("errors.server") || "Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t("marketPage.title") || "Direct Mandi Market"}</h1>
          <p className="mt-1 text-sm text-brand-textMid">{t("marketPage.subtitle") || "Sell your crop directly to buyers without middlemen."}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white font-bold py-2.5 px-5 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all"
        >
          {showForm ? (t("marketPage.cancel") || "Cancel") : (t("marketPage.sellButton") || "+ Sell Crop")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-5 max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-xl font-bold mb-4">{t("marketPage.post") || "Post"} {t("marketplace.cropName") || "Crop Details"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("calculator.crop") || "Crop"}</label>
                <input required value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" placeholder={t("marketplace.cropPlaceholder") || "e.g. Basmati Rice"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("marketPage.quantityUnit") || "qtl"}</label>
                <input required type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" placeholder="50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("marketplace.price") || "Price (₹/qtl)"}</label>
                <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" placeholder="3200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("common.location") || "Location"}</label>
                <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" placeholder={t("marketplace.locationPlaceholder") || "e.g. Karnal"} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.phoneLabel") || "Phone Number"}</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 outline-none focus:ring-2 focus:ring-green-500 bg-white/50" placeholder="9876543210" />
              </div>
            </div>
            <button disabled={submitting} type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all mt-4 disabled:opacity-50">
              {submitting ? (t("marketPage.posting") || "Posting...") : (t("marketPage.post") || "Post")}
            </button>
          </form>
        </div>
      )}

      {error && <p className="text-center text-red-500 bg-red-50 p-3 rounded-xl font-medium">{error}</p>}

      {loading ? (
        <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div></div>
      ) : crops.length === 0 ? (
          <div className="text-center py-10 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40">
            <span aria-hidden className="text-4xl text-green-700 flex justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <p className="mt-3 text-gray-600 font-medium">{t("marketPage.empty") || "No crops available right now."}</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {crops.map(crop => (
            <div key={crop.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg p-5 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">{crop.crop}</h3>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-md">{crop.quantity} {t("marketPage.quantityUnit") || "qtl"}</span>
              </div>
              <p className="text-2xl font-black text-green-700 mb-3">₹{crop.price}<span className="text-sm font-medium text-gray-500">/{t("calculator.quintalAbbr") || "qtl"}</span></p>
              <p className="text-sm text-gray-600 mb-4">{crop.location}</p>

              <a href={`tel:${crop.phone}`} className="w-full bg-green-50 text-green-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-100 transition-all border border-green-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M22 16.92V21a1 1 0 0 1-1 1A19 19 0 0 1 2 3a1 1 0 0 1 1-1h3.09a1 1 0 0 1 1 .75c.12.5.38 1.74.86 2.98a1 1 0 0 1-.24 1l-1.27 1.27a16 16 0 0 0 6.58 6.58l1.27-1.27a1 1 0 0 1 1-.24c1.24.48 2.48.74 2.98.86a1 1 0 0 1 .75 1V21z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t("marketPage.contactBuyer") || "Contact buyer"}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
