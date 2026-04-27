"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";

export default function LoginPage() {
  const { t } = useLang();
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
    <div className="mx-auto max-w-md space-y-6 px-0">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.auth.loginTitle}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.auth.loginSubtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-green-100 bg-white p-4 shadow-sm md:p-6">
        <label className="block text-sm font-medium text-brand-textDark">
          {t.auth.phoneLabel}
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            placeholder="9876543210"
            required
          />
        </label>
        <label className="block text-sm font-medium text-brand-textDark">
          {t.auth.passwordLabel}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          {loading ? t.common.loading : t.auth.loginSubmit}
        </button>

        <p className="text-center text-sm text-gray-600">
          <Link href="/signup" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            {t.auth.goSignup}
          </Link>
        </p>
      </form>
    </div>
  );
}
