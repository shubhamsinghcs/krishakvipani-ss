"use client";

import { useEffect, useRef, useState } from "react";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/clientAuth";
import { useLang } from "@/lib/LanguageContext";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotifications() {
  const { t } = useLang();
  const [status, setStatus] = useState("idle");
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid || vapid.includes("your_")) return;

    attempted.current = true;

    const run = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          setStatus("ready");
          return;
        }
        if (Notification.permission === "denied") {
          setStatus("denied");
          return;
        }
        if (Notification.permission !== "granted") {
          setStatus("prompt");
          return;
        }
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        });
        const json = sub.toJSON();
        const headers = { "Content-Type": "application/json" };
        const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers,
          body: JSON.stringify({ subscription: json }),
        });
        if (res.ok) setStatus("ready");
        else setStatus("error");
      } catch {
        setStatus("error");
      }
    };

    void run();
  }, []);

  const requestPermission = async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }
      attempted.current = false;
      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapid || vapid.includes("your_")) return;
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const json = sub.toJSON();
      const headers = { "Content-Type": "application/json" };
      const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers,
        body: JSON.stringify({ subscription: json }),
      });
      setStatus(res.ok ? "ready" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "idle" || status === "ready") return null;
  if (status === "prompt") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">{t.weather.pushPrompt}</p>
        <button
          type="button"
          onClick={requestPermission}
          className="mt-3 min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
        >
          {t.weather.pushEnable}
        </button>
      </div>
    );
  }
  if (status === "denied" || status === "error") {
    return (
      <p className="text-xs text-gray-500">
        {status === "denied" ? t.weather.pushDenied : t.weather.pushError}
      </p>
    );
  }
  return null;
}
