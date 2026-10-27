"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

const TRUCK_TYPES = [
  "Mahindra Pickup (1.5T)",
  "Tata Ace (1T)",
  "Tractor Trolley (5T)",
  "Ashok Leyland Pro (3T)",
  "Bolero Pik-Up (0.8T)",
  "Other",
];

const CITIES = [
  "Patiala",
  "Chandigarh",
  "Ludhiana",
  "Rajpura",
  "Khanna",
  "Sangrur",
  "Ambala",
  "Jalandhar",
  "Delhi",
  "Karnal",
];

export default function DriverRegisterPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    truckType: "",
    capacity: "",
    city: "",
    vehicleNumber: "",
    preferredRoutes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/driver/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Registration failed");
        return;
      }

      setSuccess(true);
      localStorage.setItem("driver_phone", json.phone);
      localStorage.setItem("driver_name", form.name);
      localStorage.setItem("driver_city", form.city);

      setTimeout(() => router.push("/driver/dashboard"), 2000);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-6">
      <div className="mx-auto max-w-2xl px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Join Our Network</h1>
           <p className="text-gray-600">{t.driver?.registerSubtitle || "Register as a driver and connect directly with farmers"}</p>
           <p className="text-sm text-gray-500">{t.driver?.registerBenefit || "Earn per trip • No commission • Direct payments"}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-green-800">
             <p className="font-semibold">{t.driver?.registrationSuccess || "Registration successful!"}</p>
            <p className="text-sm">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6 space-y-4">
             <h2 className="text-lg font-semibold text-gray-900">{t.driver?.personalInformation || "Personal Information"}</h2>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">{t.driver?.fullName || "Full Name"} *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                 placeholder={t.driver?.fullName || "Your full name"}
              />
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">
                 {t.driver?.phoneNumberWhatsApp || "Phone Number (WhatsApp)"} *
               </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                placeholder="+91 XXXXX XXXXX"
              />
               <p className="text-xs text-gray-500 mt-1">{t.driver?.phoneNumberDesc || "Farmers will contact you on this number"}</p>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6 space-y-4">
             <h2 className="text-lg font-semibold text-gray-900">{t.driver?.vehicleInformation || "Vehicle Information"}</h2>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">{t.driver?.truckType || "Truck Type"} *</label>
              <select
                name="truckType"
                value={form.truckType}
                onChange={handleChange}
                required
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
              >
                 <option value="">{t.driver?.selectTruckType || "Select truck type"}</option>
                {TRUCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">{t.driver?.capacity || "Capacity (Tons)"} *</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                required
                step="0.5"
                min="0.5"
                max="20"
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                 placeholder="e.g., 5"
              />
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">{t.driver?.vehicleNumber || "Vehicle Number"}</label>
              <input
                type="text"
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                placeholder="e.g., PB-01-AB-1234"
              />
            </div>
          </div>

          {/* Operating Area */}
          <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6 space-y-4">
             <h2 className="text-lg font-semibold text-gray-900">{t.driver?.operatingArea || "Operating Area"}</h2>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">{t.driver?.currentCity || "Current City"} *</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
              >
                 <option value="">{t.driver?.selectCity || "Select city"}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">{t.driver?.preferredRoutes || "Preferred Routes"}</label>
              <input
                type="text"
                name="preferredRoutes"
                value={form.preferredRoutes}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                placeholder="e.g., Patiala-Delhi, Rajpura-Chandigarh (optional)"
              />
               <p className="text-xs text-gray-500 mt-1">{t.driver?.preferredRoutesDesc || "Comma-separated list of your preferred routes"}</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-green-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {loading ? (t.driver?.registering || "Registering...") : (t.driver?.register || "Register as Driver")}
          </button>

          {/* Already Registered */}
          <div className="text-center text-sm text-gray-600">
             {t.driver?.alreadyRegistered || "Already registered?"}{" "}
             <Link href="/driver/dashboard" className="font-semibold text-green-600 hover:text-green-700">
               {t.driver?.viewDashboard || "View Dashboard"}
            </Link>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-white/50 border border-gray-100 p-4">
            <p className="text-2xl" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.9 6.3L21 9.3l-5 3.9L17.8 21 12 17.8 6.2 21 7 13.2 2 9.3l6.1-1L12 2z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round"/>
              </svg>
            </p>
             <p className="text-sm font-semibold text-gray-900">{t.driver?.directPayments || "Direct Payments"}</p>
             <p className="text-xs text-gray-600">{t.driver?.noCommission || "No commission, instant settlement"}</p>
          </div>
          <div className="rounded-lg bg-white/50 border border-gray-100 p-4">
            <p className="text-2xl" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 8V7a2 2 0 0 0-2-2h-3l-2-3H10L8 5H5a2 2 0 0 0-2 2v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 13h10v7H7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </p>
             <p className="text-sm font-semibold text-gray-900">{t.driver?.whatsappOrders || "WhatsApp Orders"}</p>
             <p className="text-xs text-gray-600">{t.driver?.farmersContactDirectly || "Farmers contact you directly"}</p>
          </div>
          <div className="rounded-lg bg-white/50 border border-gray-100 p-4">
            <p className="text-2xl" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </p>
             <p className="text-sm font-semibold text-gray-900">{t.driver?.buildRating || "Build Rating"}</p>
             <p className="text-xs text-gray-600">{t.driver?.growTrustedNetwork || "Grow your trusted network"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
