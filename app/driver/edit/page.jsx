"use client";

import { useEffect, useState } from "react";
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

export default function DriverEditPage() {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const phone = localStorage.getItem("driver_phone");
    const name = localStorage.getItem("driver_name");
    const city = localStorage.getItem("driver_city");

    if (!phone) {
      router.push("/driver/register");
      return;
    }

    setForm((prev) => ({
      ...prev,
      phone,
      name: name || "",
      city: city || "",
    }));
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/driver/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Update failed");
        return;
      }

      // Update localStorage
      localStorage.setItem("driver_name", form.name);
      localStorage.setItem("driver_city", form.city);

      setSuccess(true);
      setTimeout(() => router.push("/driver/dashboard"), 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-6">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-6">
      <div className="mx-auto max-w-2xl px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t.driver?.editProfile || "Edit Your Profile"}
          </h1>
          <p className="text-gray-600">
            {t.driver?.updateInfo || "Update your driver information"}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-green-800">
            <p className="font-semibold">
              {t.driver?.updateSuccess || "Profile updated successfully!"}
            </p>
            <p className="text-sm">
              {t.driver?.redirecting || "Redirecting to dashboard..."}
            </p>
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
            <h2 className="text-lg font-semibold text-gray-900">
              {t.driver?.personalInformation || "Personal Information"}
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.fullName || "Full Name"} *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                placeholder={t.driver?.fullName || "Full name"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.phoneNumber || "Phone Number"} (read-only)
              </label>
              <input
                type="tel"
                value={form.phone}
                disabled
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.driver?.phoneReadOnly ||
                  "Phone number cannot be changed"}
              </p>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t.driver?.vehicleInformation || "Vehicle Information"}
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.truckType || "Truck Type"}
              </label>
              <select
                name="truckType"
                value={form.truckType}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
              >
                <option value="">
                  {t.driver?.selectTruckType || "Select truck type"}
                </option>
                {TRUCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.capacity || "Capacity (Tons)"}
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                step="0.5"
                min="0.5"
                max="20"
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.vehicleNumber || "Vehicle Number"}
              </label>
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
            <h2 className="text-lg font-semibold text-gray-900">
              {t.driver?.operatingArea || "Operating Area"}
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.currentCity || "Current City"} *
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
              >
                <option value="">
                  {t.driver?.selectCity || "Select city"}
                </option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.driver?.preferredRoutes || "Preferred Routes"}
              </label>
              <input
                type="text"
                name="preferredRoutes"
                value={form.preferredRoutes}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                placeholder="e.g., Patiala-Delhi, Rajpura-Chandigarh (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.driver?.preferredRoutesDesc ||
                  "Comma-separated list of your preferred routes"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-green-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? t.driver?.saving || "Saving..."
                : t.driver?.save || "Save Changes"}
            </button>
            <Link
              href="/driver/dashboard"
              className="flex-1 min-h-[44px] rounded-lg bg-gray-200 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-300 transition flex items-center justify-center"
            >
              {t.driver?.cancel || "Cancel"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
