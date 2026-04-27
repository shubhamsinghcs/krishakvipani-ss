"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";

export default function SignupPage() {
  const { t } = useLang();
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
    <div className="mx-auto max-w-md space-y-6 px-0">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.auth.signupTitle}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.auth.signupSubtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-green-100 bg-white p-4 shadow-sm md:p-6">
        <label className="block text-sm font-medium text-brand-textDark">
          {t.auth.nameLabel}
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            required
            minLength={2}
          />
        </label>
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
          {t.auth.districtLabel}
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            placeholder={t.auth.districtPlaceholder}
          />
        </label>
        <label className="block text-sm font-medium text-brand-textDark">
          {t.auth.passwordLabel}
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          {loading ? t.common.loading : t.auth.signupSubmit}
        </button>

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            {t.auth.goLogin}
          </Link>
        </p>
      </form>
    </div>
  );
}
