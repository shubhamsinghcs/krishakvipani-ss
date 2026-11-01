"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import {
  IconUser,
  IconSprout,
  IconShieldCheck,
  IconCheckCircle,
  IconAlertCircle,
} from "@/components/ui/Icons";

const DISTRICTS = [
  "Patiala", "Ludhiana", "Amritsar", "Bathinda", "Jalandhar", "Sangrur", "Moga",
  "Indore", "Dhar", "Ujjain", "Bhopal", "Sehore", "Raisen", "Vidisha", "Jabalpur",
  "Satna", "Rewa", "Jhabua", "Mandsaur", "Ratlam", "Nagpur", "Akola", "Nashik",
];

const CROPS = [
  "Wheat", "Paddy / Rice", "Maize", "Cotton", "Mustard", "Sugarcane", "Soybean", "Groundnut", "Gram / Pulses",
  "Tomato", "Onion", "Potato", "Chilli", "Turmeric", "Barley",
];

export default function ProfilePage() {
  const { t, lang, changeLang, languageOptions = [] } = useLang();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    district: "",
    cropType: "",
    farmSize: "",
    phoneNumber: "",
    language: lang,
    preferences: {
      notifications: true,
      weatherAlerts: true,
      priceUpdates: true,
      diseaseWarnings: true,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json.success && json.profile) {
          setFormData((prev) => ({
            ...prev,
            ...json.profile,
            language: json.profile.language || lang,
          }));
        }
      } catch {}
    };
    fetchProfile();
  }, [lang]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        if (formData.language && formData.language !== lang) {
          changeLang(formData.language);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        setError(json.message || t.profile?.error || "Failed to save profile");
      }
    } catch (err) {
      setError(err.message || t.profile?.error || "Error saving profile details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <IconUser className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-950 md:text-3xl">
              {t.profile?.title || (lang === "hi" ? "किसान प्रोफ़ाइल व सेटिंग्स" : "Farmer Profile & Settings")}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
              {t.profile?.subtitle || "Manage your farm location, primary crops, and localized alerts."}
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-900 font-bold flex items-center gap-2">
          <IconCheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{t.profile?.saved || (lang === "hi" ? "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!" : "Profile saved successfully!")}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-900 font-bold flex items-center gap-2">
          <IconAlertCircle className="w-5 h-5 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
            <IconUser className="w-4 h-4 text-emerald-700" />
            <span>{t.profile?.personalInfo || "Personal Information"}</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.profile?.name || (lang === "hi" ? "पूरा नाम" : "Full Name")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                placeholder={t.profile?.name || "e.g. Ramesh Patel"}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.profile?.phoneNumber || (lang === "hi" ? "मोबाइल नंबर" : "Phone Number")}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Farm Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
            <IconSprout className="w-4 h-4 text-emerald-700" />
            <span>{t.profile?.farmDetails || (lang === "hi" ? "खेत व कृषि विवरण" : "Farm Details")}</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.profile?.district || (lang === "hi" ? "जिला" : "District")}
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
              >
                <option value="">{t.profile?.district || "Select District"}</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.profile?.primaryCrop || (lang === "hi" ? "मुख्य फसल" : "Primary Crop")}
                </label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleChange}
                  className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
                >
                  <option value="">{t.profile?.primaryCrop || "Select Crop"}</option>
                  {CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.profile?.farmSize || (lang === "hi" ? "जमीन (एकड़)" : "Farm Size (Acres)")}
                </label>
                <input
                  type="number"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  placeholder="e.g. 5.5"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
            <IconShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t.profile?.preferences || (lang === "hi" ? "सूचनाएं व अलर्ट प्राथमिकताएं" : "Notification Preferences")}</span>
          </h2>

          <div className="space-y-2">
            {[
              { key: "notifications", label: t.profile?.notifications || "General Updates & KVK Notices" },
              { key: "weatherAlerts", label: t.profile?.weatherAlerts || "Heavy Rain & Heatwave Alerts" },
              { key: "priceUpdates", label: t.profile?.priceUpdates || "Mandi Rate & MSP Changes" },
              { key: "diseaseWarnings", label: t.profile?.diseaseWarnings || "Pest & Crop Blight Outbreak Warnings" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2.5 rounded-xl border border-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  name={key}
                  checked={formData.preferences[key]}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-700 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-800">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Language & Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-950">
            {t.profile?.language || (lang === "hi" ? "भाषा प्राथमिकता" : "Language Preference")}
          </h2>

          <div>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs font-semibold"
            >
              {languageOptions.map((item) => (
                <option key={item.key || item.code} value={item.key || item.code}>
                  {item.label || item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t.profile?.saving || "Saving..." : t.profile?.save || (lang === "hi" ? "सेटिंग्स सुरक्षित करें" : "Save Settings")}
        </button>
      </form>
    </div>
  );
}
