"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function MarketplacePage() {
  const { t } = useLang();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    crop: "",
    quantity: "",
    unit: "Quintals",
    price: "",
    location: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/marketplace");
      const json = await res.json();
      if (json.success) {
        setListings(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setListings([json.data, ...listings]);
        setShowForm(false);
        setFormData({ crop: "", quantity: "", unit: "Quintals", price: "", location: "", phone: "" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors shadow-sm">
            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t("marketplace.title") || "Direct Mandi Market"}</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          {showForm ? (t("marketplace.cancel") || "Cancel") : (t("marketplace.sellCrop") || "+ Sell Crop")}
        </button>
      </div>

      {/* Sell Form */}
      {showForm && (
        <section className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-3xl shadow-lg p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-blue-800 mb-4">{t("marketplace.postListing") || "Post a new listing"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("marketplace.cropName") || "Crop Name"}</label>
                <input required value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder={t("marketplace.cropPlaceholder") || "e.g. Wheat"} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("marketplace.price") || "Price (₹/Quintal)"}</label>
                <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. 2150" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("marketplace.quantity") || "Quantity"}</label>
                <input required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("marketplace.unit") || "Unit"}</label>
                <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="Quintals">{t("marketplace.unitQuintals") || "Quintals"}</option>
                  <option value="Tons">{t("marketplace.unitTons") || "Tons"}</option>
                  <option value="Kg">{t("marketplace.unitKg") || "Kg"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("marketplace.location") || "Location"}</label>
              <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder={t("marketplace.locationPlaceholder") || "e.g. Karnal, Haryana"} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("marketplace.contact") || "Contact Number"}</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. +91-9876543210" />
            </div>

            <button disabled={submitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (t("marketplace.submit") || "Post Listing")}
            </button>
          </form>
        </section>
      )}

      {/* Listings */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center text-gray-500 py-10">{t("marketplace.noListings") || "No listings available. Be the first to sell!"}</p>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="bg-white/70 backdrop-blur-lg border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{item.crop}</h3>
                  <p className="text-xs text-gray-500">{item.farmerName} • {new Date(item.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600 text-xl">₹{item.price}</div>
                  <div className="text-xs text-gray-500">{t("marketplace.per") || "per"} {item.unit.slice(0, -1)}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-100 font-medium">
                  {item.quantity} {item.unit} {t("marketplace.total") || "Total"}
                </span>
                <span className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {item.location}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100/80">
                <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-2 w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2 rounded-xl transition-colors border border-green-200/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {t("marketplace.contactSeller") || "Contact Seller"}
                </a>
              </div>
            </div>
          ))
        )}
      </section>

    </div>
  );
}
