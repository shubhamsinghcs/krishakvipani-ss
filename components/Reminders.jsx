"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLang } from "@/lib/LanguageContext";

export default function Reminders() {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifyMode, setNotifyMode] = useState("immediate"); // immediate | daily
  const [pollId, setPollId] = useState(null);
  const lastNotifiedRef = useRef(new Set());
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders");
      const json = await res.json();
      if (json.success) setList(json.reminders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" && window.localStorage.getItem("reminders_notify_enabled");
    const mode = typeof window !== "undefined" && window.localStorage.getItem("reminders_notify_mode");
    if (saved === "true") setNotificationsEnabled(true);
    if (mode) setNotifyMode(mode);
  }, []);

  const pollReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const json = await res.json();
      if (!json.success) return;
      // Ask server to persist notifications for due reminders (best-effort)
      try {
        await fetch('/api/reminders/notify', { method: 'POST' });
      } catch (e) { /* ignore */ }
      const now = Date.now();
      const windowMs = notifyMode === "immediate" ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const due = (json.reminders || []).filter((r) => {
        if (!r.dueDate) return false;
        const d = new Date(r.dueDate).getTime();
        return d <= now + windowMs && d >= now - 60 * 1000; // within window and not far past
      });
      // show notifications for due items not yet notified
      for (const r of due) {
        if (lastNotifiedRef.current.has(String(r._id))) continue;
        showNotification(r);
        lastNotifiedRef.current.add(String(r._id));
      }
    } catch (e) {
      console.error("Polling reminders failed", e);
    }
  }, [notifyMode]);

  const startPolling = useCallback(async () => {
    const ok = await requestPermission();
    if (!ok) {
      setNotificationsEnabled(false);
      return;
    }
    // immediate mode: poll every 5 minutes (non-irritating)
    const interval = notifyMode === "immediate" ? 5 * 60 * 1000 : 60 * 60 * 1000;
    if (pollId) clearInterval(pollId);
    // run an initial check
    pollReminders();
    const id = setInterval(pollReminders, interval);
    setPollId(id);
  }, [notifyMode, pollId, pollReminders]);

  const stopPolling = useCallback(() => {
    if (pollId) {
      clearInterval(pollId);
      setPollId(null);
    }
    lastNotifiedRef.current = new Set();
  }, [pollId]);

  useEffect(() => {
    if (notificationsEnabled) {
      startPolling();
    } else {
      stopPolling();
    }
    if (typeof window !== "undefined") window.localStorage.setItem("reminders_notify_enabled", notificationsEnabled ? "true" : "false");
  }, [notificationsEnabled, notifyMode, startPolling, stopPolling]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const p = await Notification.requestPermission();
    return p === "granted";
  };

  

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  

  const showNotification = (r) => {
    try {
      if (Notification.permission !== "granted") return;
      const title = r.title || "Reminder";
      const body = r.notes ? `${r.notes}` : "Reminder due";
      const n = new Notification(title, { body, tag: `reminder-${r._id}` });
      n.onclick = function () {
        window.focus();
      };
    } catch (e) {
      console.error("Show notification error", e);
    }
  };

  const create = async () => {
    if (!title.trim()) return;
    const payload = { title: title.trim(), notes: notes.trim(), dueDate: dueDate || null };
    try {
      const res = await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        setTitle(""); setNotes(""); setDueDate("");
        setList((s) => [json.reminder, ...s]);
      }
    } catch (e) { console.error(e); }
  };

  const toggleDone = async (id, done) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: !done }) });
      const json = await res.json();
      if (json.success) setList((s) => s.map((r) => (r._id === json.reminder._id ? json.reminder : r)));
    } catch (e) { console.error(e); }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setList((s) => s.filter((r) => r._id !== id));
    } catch (e) { console.error(e); }
  };

  const snooze = async (id, minutes) => {
    try {
      const due = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const res = await fetch(`/api/reminders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dueDate: due, done: false }) });
      const json = await res.json();
      if (json.success) setList((s) => s.map((r) => (r._id === json.reminder._id ? json.reminder : r)));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-lg p-4 shadow-md space-y-3">
      <h3 className="text-lg font-semibold">Reminders & Tasks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="col-span-2 min-h-[44px] rounded-lg border px-3" />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="min-h-[44px] rounded-lg border px-3" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="col-span-3 rounded-lg border px-3 py-2" />
        <div className="col-span-3 flex gap-2">
          <button onClick={create} className="min-h-[44px] rounded-lg bg-green-600 text-white px-4">Add</button>
          <button onClick={() => { setTitle(""); setNotes(""); setDueDate(""); }} className="min-h-[44px] rounded-lg border px-4">Clear</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
            <span>Enable reminders</span>
          </label>
          <select value={notifyMode} onChange={(e) => { setNotifyMode(e.target.value); if (typeof window !== "undefined") window.localStorage.setItem("reminders_notify_mode", e.target.value); }} className="text-sm rounded border px-2 py-1">
            <option value="immediate">Immediate (gentle)</option>
            <option value="daily">Daily summary</option>
          </select>
        </div>
        <div className="text-xs text-gray-500">Notifications are opt-in and non-intrusive.</div>
      </div>

      <div className="space-y-2 mt-2">
        {loading ? <div className="text-sm text-gray-500">Loading...</div> : null}
        {list.length === 0 && !loading ? <div className="text-sm text-gray-500">No reminders yet.</div> : null}
        {list.map((r) => (
          <div key={r._id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!r.done} onChange={() => toggleDone(r._id, r.done)} />
                <h4 className={`font-semibold truncate ${r.done ? 'line-through text-gray-500' : ''}`}>{r.title}</h4>
              </div>
              {r.notes ? <p className="text-xs text-gray-600 truncate">{r.notes}</p> : null}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : ''}</div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1">
                  <button onClick={() => snooze(r._id, 10)} className="text-xs text-gray-700">Snooze 10m</button>
                  <button onClick={() => snooze(r._id, 30)} className="text-xs text-gray-700">Snooze 30m</button>
                  <button onClick={() => snooze(r._id, 60)} className="text-xs text-gray-700">Snooze 1h</button>
                </div>
                <button onClick={() => remove(r._id)} className="text-xs text-red-600 mt-2">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
