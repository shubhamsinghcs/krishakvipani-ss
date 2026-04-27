"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import DriverCard from "@/components/transport/DriverCard";

// Lazy load the Map component
const MapView = dynamic(() => import("@/components/transport/MapView"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[400px] bg-green-50 animate-pulse rounded-2xl flex items-center justify-center">नक्शा लोड हो रहा है...</div>
});

export default function TransportPage() {
  const [form, setForm] = useState({
    fromMandi: "",
    toMandi: "",
    crop: "",
    quantity: ""
  });
  
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLoc, setUserLoc] = useState(null);

  // Auto fetch user location
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLoc({ lat: 30.3398, lng: 76.3869 }) // Fallback patiala
      );
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
       const res = await fetch(`/api/transport?from=${encodeURIComponent(form.fromMandi)}&to=${encodeURIComponent(form.toMandi)}`);
       const data = await res.json();
       
       if (!res.ok || !data.success) throw new Error(data.message || "API FAILED");
       
       setDrivers(data.drivers || []);
    } catch (err) {
       setError("ड्राइवर खोजने में त्रुटि। कृपया बाद में प्रयास करें।");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6 py-6 overflow-x-hidden">
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-md p-5">
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">🚛 ट्रांसपोर्ट सेवा</h1>
        <p className="mt-1 text-sm text-brand-textMid">
          अपनी फसल मंडी ले जाने के लिए नजदीकी ट्रक और ट्रैक्टर ड्राइवर खोजें।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Form */}
        <div className="lg:col-span-1 border border-white/40 bg-white/70 backdrop-blur-lg rounded-2xl p-5 shadow-xl h-fit">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">कहाँ से (मंडी/गाँव)</label>
              <input 
                 className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                 placeholder="जैसे: पटियाला मंडी"
                 value={form.fromMandi}
                 onChange={e => setForm({...form, fromMandi: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">कहाँ तक</label>
              <input 
                 className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                 placeholder="जैसे: खन्ना मंडी"
                 value={form.toMandi}
                 onChange={e => setForm({...form, toMandi: e.target.value})}
                 required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">फसल</label>
                <input 
                   className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                   placeholder="गेहुं"
                   value={form.crop}
                   onChange={e => setForm({...form, crop: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">मात्रा (क्विंटल)</label>
                <input 
                   type="number"
                   className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                   placeholder="50"
                   value={form.quantity}
                   onChange={e => setForm({...form, quantity: e.target.value})}
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold rounded-xl min-h-[48px] hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? "खोज रहे हैं..." : "ड्राइवर खोजें"}
            </button>
            
            {error && <p className="text-red-500 text-sm font-medium mt-2 text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
          </form>
          
          {drivers.length > 0 && (
             <div className="mt-6 pt-4 border-t border-green-100">
               <h3 className="font-bold text-brand-textDark mb-4 flex items-center justify-between">
                 <span>उपलब्ध ड्राइवर</span>
                 <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{drivers.length}</span>
               </h3>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide pb-2">
                 {drivers.map(d => (
                   <DriverCard key={d._id} driver={d} />
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Right Side: Map */}
        <div className="lg:col-span-2 h-[50vh] md:h-[60vh] lg:h-[80vh] min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-white/40">
           <MapView drivers={drivers} userLocation={userLoc} />
        </div>
      </div>
    </div>
  );
}
