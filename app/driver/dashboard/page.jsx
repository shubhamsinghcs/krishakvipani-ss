"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function DriverDashboardPage() {
  const { t, lang } = useLang();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const driverPhone = localStorage.getItem("driver_phone");
    if (driverPhone) {
      setDriver({
        name: localStorage.getItem("driver_name") || "Driver",
        city: localStorage.getItem("driver_city") || "Unknown",
        phone: driverPhone,
        rating: 4.8,
        trips: 0,
        earnings: "₹0",
        availability: true,
        truckType: localStorage.getItem("driver_truck_type") || "Truck",
      });
    }
    setLoading(false);
  }, []);

   const handleToggleAvailability = async () => {
     const newStatus = !driver.availability;
     try {
       const res = await fetch("/api/driver/availability", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ phone: driver.phone, availability: newStatus }),
       });
       const data = await res.json();
       if (!res.ok) {
         alert(data.message || "Failed to update availability");
         return;
       }
       setDriver({ ...driver, availability: newStatus });
     } catch (err) {
       alert("Network error. Please try again.");
     }
   };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-6 space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-6 text-center space-y-4">
         <p className="text-gray-600 text-lg">{t.driver?.notRegistered || "No driver registered yet"}</p>
        <Link
          href="/driver/register"
          className="inline-block min-h-[44px] rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition"
        >
           {t.driver?.register || "Register as Driver"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
         <h1 className="text-3xl font-bold text-gray-900">{t.driver?.dashboardTitle || "Driver Dashboard"}</h1>
         <p className="text-gray-600 mt-1">{t.driver?.welcome || "Welcome"}, {driver.name}</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{driver.city}</p>
            <p className="text-gray-600 text-sm">{driver.phone}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-500">{driver.rating}</div>
            <p className="text-xs text-gray-600 mt-1">{driver.trips} trips completed</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-center">
          <p className="text-2xl" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 12h3v7H7zM12 8h3v11h-3zM17 3h3v16h-3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
          <p className="text-xs text-gray-600 mt-2">Earnings</p>
          <p className="text-lg font-bold text-blue-700">{driver.earnings}</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-center">
          <p className="text-2xl" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7h18v10H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
          <p className="text-xs text-gray-600 mt-2">Trips</p>
          <p className="text-lg font-bold text-green-700">{driver.trips}</p>
        </div>
        <div className="rounded-lg bg-purple-50 border border-purple-100 p-4 text-center">
          <p className="text-2xl" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
          <p className="text-xs text-gray-600 mt-2">Rating</p>
          <p className="text-lg font-bold text-purple-700">{driver.rating}</p>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-semibold text-gray-900">{t.driver?.availabilityStatus || "Availability Status"}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {driver.availability ? (t.driver?.youAreOnline || "You are online") : (t.driver?.youAreOffline || "You are offline")}
            </p>
          </div>
           <button onClick={handleToggleAvailability} className={`min-h-[44px] rounded-lg px-6 py-2 font-semibold transition ${
            driver.availability
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}>
             {driver.availability ? (t.driver?.goOffline || "Go Offline") : (t.driver?.goOnline || "Go Online")}
           </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6 space-y-3">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.driver?.quickActions || "Quick Actions"}</h3>
           <Link
             href="/driver/edit"
             className="w-full min-h-[44px] rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition border border-blue-100 flex items-center justify-center"
           >
             {t.driver?.editProfile || "Edit Profile"}
           </Link>
         <button className="w-full min-h-[44px] rounded-lg bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition border border-purple-100">
           {t.driver?.viewStatistics || "View Statistics"}
         </button>
         <button className="w-full min-h-[44px] rounded-lg bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition border border-gray-100">
           {t.driver?.settings || "Settings"}
         </button>
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.driver?.howItWorksDriver || "How It Works"}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="text-lg flex-shrink-0">1️⃣</span>
             <p className="text-gray-700">{t.driver?.step1Driver || "Farmers send WhatsApp messages"}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-lg flex-shrink-0">2️⃣</span>
             <p className="text-gray-700">{t.driver?.step2Driver || "Negotiate terms directly"}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-lg flex-shrink-0">3️⃣</span>
             <p className="text-gray-700">{t.driver?.step3Driver || "Complete trip"}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-lg flex-shrink-0">4️⃣</span>
             <p className="text-gray-700">{t.driver?.step4Driver || "Build rating"}</p>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="text-center text-sm text-gray-600">
        <Link href="/transport" className="text-green-600 font-semibold hover:text-green-700">
           ← {t.driver?.backToTransport || "Back to Transport"}
        </Link>
      </div>
    </div>
  );
}
