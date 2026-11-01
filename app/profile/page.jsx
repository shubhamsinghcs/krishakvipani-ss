"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";

const DISTRICTS = [
  "Indore", "Dhar", "Ujjain", "Bhopal", "Sehore", "Raisen", "Vidisha", "Jabalpur",
  "Satna", "Rewa", "Jhabua", "Mandsaur", "Ratlam", "Nagpur", "Akola", "Aurangabad",
];

const CROPS = [
  "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Soybean", "Groundnut", "Pulses",
  "Tomato", "Onion", "Potato", "Chilli", "Turmeric", "Sorghum", "Millet", "Barley",
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
          setFormData((prev) => ({ ...prev, ...json.profile, language: json.profile.language || lang }));
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
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(json.message || t.profile?.error || "Failed to save");
      }
    } catch (err) {
      setError(err.message || t.profile?.error || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-textDark">
          {t.profile?.title || "My Profile"}
        </h1>
        <p className="mt-1 text-sm text-brand-textMid">
          {t.profile?.subtitle || "Manage your farming details and preferences"}
        </p>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          {t.profile?.saved || "Profile saved successfully"}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-textDark mb-4">
            {t.profile?.personalInfo || "Personal Information"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.profile?.name || "Name"}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                placeholder={t.profile?.name || "Your full name"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.profile?.phoneNumber || "Phone Number"}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
        </div>

        {/* Farm Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-textDark mb-4">
            {t.profile?.farmDetails || "Farm Details"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.profile?.district || "District"}
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="">{t.profile?.district || "Select District"}</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.profile?.primaryCrop || "Primary Crop"}
              </label>
              <select
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="">{t.profile?.primaryCrop || "Select Crop"}</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.profile?.farmSize || "Farm Size (acres)"}
              </label>
              <input
                type="number"
                name="farmSize"
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                placeholder="0.00"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-textDark mb-4">
            {t.profile?.preferences || "Notification Preferences"}
          </h2>

          <div className="space-y-3">
            {[
              { key: "notifications", label: t.profile?.notifications || "General Notifications" },
              { key: "weatherAlerts", label: t.profile?.weatherAlerts || "Weather Alerts" },
              { key: "priceUpdates", label: t.profile?.priceUpdates || "Mandi Price Updates" },
              { key: "diseaseWarnings", label: t.profile?.diseaseWarnings || "Disease Warnings" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  name={key}
                  checked={formData.preferences[key]}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Language & Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-textDark mb-4">
            {t.profile?.language || "Language & Settings"}
          </h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t.profile?.preferredLanguage || "Preferred Language"}
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
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
          className="min-h-[44px] w-full rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (t.profile?.saving || "Saving...") : (t.profile?.save || "Save Profile")}
        </button>
      </form>
    </div>
  );
}
