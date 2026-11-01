"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";
import { IconUser, IconPhone, IconMapPin, IconShieldCheck, IconAlertCircle } from "@/components/ui/Icons";

export default function SignupPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\s/g, ""),
          password,
          district,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.token) {
        setError(json.message || t.auth.signupFailed);
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, json.token);
      }
      router.push("/");
      router.refresh();
    } catch {
      setError(t.auth.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-0 py-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 mx-auto flex items-center justify-center mb-2">
          <IconUser className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-black text-gray-950 md:text-3xl">
          {t.auth.signupTitle || (lang === "hi" ? "किसान पंजीकरण" : "Farmer Registration")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {t.auth.signupSubtitle || "Join Krishak Vipani for instant diagnosis and direct mandi trading"}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            {t.auth.nameLabel || (lang === "hi" ? "किसान का नाम" : "Full Name")}
          </label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs font-medium"
            placeholder="e.g. Ramesh Patel"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            {t.auth.phoneLabel || (lang === "hi" ? "मोबाइल नंबर" : "Mobile Number")}
          </label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs font-medium"
            placeholder="9876543210"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            {t.auth.districtLabel || (lang === "hi" ? "जिला / राज्य" : "District / State")}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            placeholder={t.auth.districtPlaceholder || "e.g. Patiala, Punjab"}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            {t.auth.passwordLabel || (lang === "hi" ? "पासवर्ड" : "Password")}
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            required
            minLength={6}
          />
        </div>

        {error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-bold flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-xs disabled:opacity-50"
        >
          {loading ? t.common.loading : t.auth.signupSubmit || "Complete Registration"}
        </button>

        <p className="text-center text-xs text-gray-600 pt-2">
          {lang === "hi" ? "पहले से पंजीकृत हैं? " : "Already registered? "}
          <Link
            href="/login"
            className="font-bold text-emerald-800 underline-offset-2 hover:underline"
          >
            {t.auth.loginSubmit || (lang === "hi" ? "लॉग इन करें" : "Log In")}
          </Link>
        </p>
      </form>
    </div>
  );
}
