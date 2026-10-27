"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import DriverCard from "@/components/transport/DriverCard";
import { useLang } from "@/lib/LanguageContext";
import { generateTransportMessage, generateWhatsAppUrl } from "@/lib/transportMessage";

const MapView = dynamic(() => import("@/components/transport/MapView"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[400px] bg-green-50 animate-pulse rounded-2xl flex items-center justify-center">Loading map...</div>
});

export default function TransportPage() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    fromMandi: "",
    toMandi: "",
    crop: "",
    quantity: "",
    date: "",
  });

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLoc, setUserLoc] = useState(null);
  const [fromLoc, setFromLoc] = useState(null);
  const [toLoc, setToLoc] = useState(null);
  const [previewDriver, setPreviewDriver] = useState(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLoc({ lat: 30.3398, lng: 76.3869 })
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

      if (!res.ok || !data.success) throw new Error(data.message || "Failed to search");

      setDrivers(data.drivers || []);
      if (data.fromLoc) setFromLoc(data.fromLoc);
      if (data.toLoc) setToLoc(data.toLoc);
    } catch (err) {
      setError("Error finding drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewRoute = (driver) => {
    setPreviewDriver(driver);
    // ensure map recenters if user location not provided
    if (!userLoc && driver.location) setUserLoc({ lat: driver.location.lat, lng: driver.location.lng });
    const el = document.querySelector('.map-root'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleContactViaWhatsApp = (driver) => {
    if (!driver.phone) {
      alert("Driver phone number not available");
      return;
    }

    const message = generateTransportMessage(
      {
        pickupLocation: form.fromMandi || "my location",
        destination: form.toMandi || "destination",
        cropType: form.crop || "crops",
        quantity: form.quantity || "unknown",
        preferredDate: form.date || "ASAP",
        farmerName: localStorage.getItem("farmer_name"),
      },
      lang
    );

    const waUrl = generateWhatsAppUrl(driver.phone, message);

    if (waUrl) {
      window.open(waUrl, "_blank");
    } else {
      alert("Invalid driver phone number");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6 py-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-md p-5 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Transport Marketplace</h1>
        <p className="text-sm text-gray-600">
          Find local truck drivers and coordinate logistics directly via WhatsApp
        </p>
        <div className="flex gap-2 flex-wrap mt-3">
          <Link
            href="/driver/register"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition"
          >
            Register as Driver
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-1 border border-white/40 bg-white/70 backdrop-blur-lg rounded-2xl p-5 shadow-xl h-fit">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">From (Pickup Location) *</label>
              <input
                className="w-full min-h-[44px] rounded-lg border border-green-200 px-4 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                placeholder="e.g., Patiala"
                value={form.fromMandi}
                onChange={(e) => setForm({ ...form, fromMandi: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">To (Destination) *</label>
              <input
                className="w-full min-h-[44px] rounded-lg border border-green-200 px-4 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                placeholder="e.g., Chandigarh"
                value={form.toMandi}
                onChange={(e) => setForm({ ...form, toMandi: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Type</label>
                <input
                  className="w-full min-h-[44px] rounded-lg border border-green-200 px-4 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                  placeholder="e.g., Wheat"
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity (Tons)</label>
                <input
                  type="number"
                  className="w-full min-h-[44px] rounded-lg border border-green-200 px-4 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                  placeholder="e.g., 5"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  min="0.5"
                  step="0.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date</label>
              <input
                type="date"
                className="w-full min-h-[44px] rounded-lg border border-green-200 px-4 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold rounded-lg min-h-[48px] hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Find Drivers"}
            </button>

            {error && (
              <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
          </form>

          {/* Driver List */}
          {drivers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-green-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Available Drivers</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {drivers.length}
                </span>
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide pb-2">
                {drivers.map((d) => (
                  <DriverCard key={d._id} driver={d} onContactViaWhatsApp={handleContactViaWhatsApp} onPreviewRoute={handlePreviewRoute} />
                ))}
              </div>
            </div>
          )}

          {drivers.length === 0 && !loading && form.fromMandi && (
            <div className="mt-6 pt-6 border-t border-green-100 text-center">
              <p className="text-gray-600 text-sm mb-4">No drivers found for this route yet.</p>
              <p className="text-gray-500 text-xs">Try different locations or check back later.</p>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-2 h-[50vh] md:h-[60vh] lg:h-[80vh] min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-white/40 map-root">
          <MapView drivers={drivers} userLocation={userLoc} fromLoc={fromLoc} toLoc={toLoc} previewDriver={previewDriver} />
        </div>
      </div>

      {/* WhatsApp Info */}
      <div className="rounded-2xl border border-green-100 bg-green-50/70 backdrop-blur-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900 mb-1">1. Find Drivers</p>
            <p className="text-gray-600">Search for available truck drivers in your area</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">2. Contact via WhatsApp</p>
            <p className="text-gray-600">Click &quot;Contact via WhatsApp&quot; to message driver directly</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">3. Coordinate Logistics</p>
            <p className="text-gray-600">Negotiate terms and arrange pickup directly with driver</p>
          </div>
        </div>
      </div>
    </div>
  );
}
