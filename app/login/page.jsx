"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";
import { IconUser, IconPhone, IconShieldCheck, IconAlertCircle } from "@/components/ui/Icons";

export default function LoginPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ""), password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.token) {
        setError(json.message || t.auth.loginFailed);
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
          {t.auth.loginTitle || (lang === "hi" ? "किसान लॉगिन" : "Farmer Login")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {t.auth.loginSubtitle || "Enter your registered mobile number to continue"}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs"
      >
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
            {t.auth.passwordLabel || (lang === "hi" ? "पासवर्ड" : "Password")}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            required
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
          {loading ? t.common.loading : t.auth.loginSubmit || "Log In"}
        </button>

        <p className="text-center text-xs text-gray-600 pt-2">
          {lang === "hi" ? "खाता नहीं है? " : "Don't have an account? "}
          <Link
            href="/signup"
            className="font-bold text-emerald-800 underline-offset-2 hover:underline"
          >
            {t.auth.goSignup || (lang === "hi" ? "नया किसान पंजीकरण करें" : "Register here")}
          </Link>
        </p>
      </form>
    </div>
  );
}
