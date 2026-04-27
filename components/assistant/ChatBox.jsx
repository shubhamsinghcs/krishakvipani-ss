"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LanguageContext";

function speechLang(code) {
  return `${code}-IN`;
}

export default function ChatBox() {
  const { lang, t } = useLang();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const utterRef = useRef(null);

  const welcomeText = t.assistant?.welcome || "";
  const suggestions = t.assistant?.suggestions || [];

  const [messages, setMessages] = useState([{ role: "assistant", text: welcomeText, id: "0" }]);

  useEffect(() => {
    setMessages([{ role: "assistant", text: welcomeText, id: `w-${Date.now()}` }]);
  }, [lang, welcomeText]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    utterRef.current = null;
  }, []);

  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const speakText = useCallback(
    (text, id) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      stopSpeaking();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang(lang);
      u.onend = () => setSpeakingId(null);
      u.onerror = () => setSpeakingId(null);
      utterRef.current = u;
      setSpeakingId(id);
      window.speechSynthesis.speak(u);
    },
    [lang, stopSpeaking]
  );

  const sendMessage = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setError("");
    setInput("");
    const userId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { role: "user", text, id: userId }]);
    setLoading(true);
    try {
      const controller = new AbortController();
      const history = messages
        .filter(m => m.id !== "0" && !String(m.id).startsWith("w-"))
        .slice(-5)
        .map(m => ({ role: m.role, text: typeof m.text === "object" ? m.text.answer : m.text }));

      const context = {
         location: localStorage.getItem("user_district") || "Unknown",
         weather: "Unknown"
      };
      
      try {
        const weatherCache = JSON.parse(localStorage.getItem("weather_data") || "{}");
        if (weatherCache?.temp) {
           context.weather = `${weatherCache.temp}°C, ${weatherCache.condition}`;
        }
      } catch (e) {}

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang, history, context }),
        signal: controller.signal,
      });
      clearTimeout(tId);
      const payload = await response.json();
      const reply = payload?.reply; // Can be object {answer, tips, urgency} or string
      if (!reply) {
        throw new Error("empty");
      }
      setMessages((prev) => [...prev, { role: "assistant", text: reply, id: `a-${Date.now()}` }]);
    } catch {
      setError(t.assistant?.failSend || "");
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("⚠️ आपका ब्राउज़र वॉइस सपोर्ट नहीं करता। (Chrome उपयोग करें)"); // Fallback for unsupported browsers
      return;
    }
    
    // Toggle logic
    if (listening && recognitionRef.current) {
       stopListening();
       return;
    }

    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    const recognition = new SpeechRecognition();
    recognition.lang = speechLang(lang);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        setInput(transcript.trim());
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setError(t.assistant?.voiceError || "");
    };
    recognitionRef.current = recognition;
    setError("");
    recognition.start();
  };

  const stopListening = () => {
     if (recognitionRef.current) {
        recognitionRef.current.stop();
     }
     setListening(false);
  };

  const bubbleBase = "max-w-[min(85%,20rem)] rounded-2xl px-3 py-2.5 text-sm leading-relaxed break-words shadow-sm";

  return (
    <div className="flex h-[min(72vh,calc(100dvh-12rem))] flex-col overflow-hidden rounded-2xl border border-green-100 bg-[#e5ddd5] shadow-md md:h-[min(520px,calc(100dvh-10rem))]">
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-4 md:px-4"
        style={{ background: "linear-gradient(180deg,#e5ddd5 0%,#d8d0c8 100%)" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full min-w-0 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`${bubbleBase} ${
                message.role === "user" ? "rounded-br-md bg-[#dcf8c6] text-gray-900" : "rounded-bl-md bg-white text-gray-800"
              }`}
            >
              {typeof message.text === "object" ? (
                 <div className="space-y-2">
                    <p className="whitespace-pre-wrap font-semibold">{message.text.answer}</p>
                    {message.text.tips && message.text.tips.length > 0 && (
                       <ul className="list-disc pl-4 text-xs space-y-1">
                          {message.text.tips.map((t, i) => <li key={i}>{t}</li>)}
                       </ul>
                    )}
                    {message.text.urgency && (
                       <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold ${
                         message.text.urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                       }`}>
                          Urgency: {message.text.urgency}
                       </span>
                    )}
                 </div>
              ) : (
                 <p className="whitespace-pre-wrap">{message.text}</p>
              )}
              {message.role === "assistant" && message.id !== "0" && !String(message.id).startsWith("w-") ? (
                <button
                  type="button"
                  onClick={() =>
                    speakingId === message.id ? stopSpeaking() : speakText(typeof message.text === "object" ? message.text.answer : message.text, message.id)
                  }
                  className="mt-2 min-h-[40px] rounded-lg bg-green-50 px-2 text-xs font-semibold text-green-800 transition active:scale-95"
                >
                  {speakingId === message.id ? t.assistant?.stopSpeak : t.assistant?.speak}
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
              {t.assistant?.thinking}
            </div>
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-green-200/80 bg-white/95 px-3 py-3 backdrop-blur-sm md:px-4">
        {suggestions.length > 0 ? (
          <div className="mb-3 flex max-w-full flex-wrap gap-2">
            {suggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="line-clamp-2 max-w-full rounded-full border border-green-200 bg-green-50 px-3 py-2 text-left text-xs font-medium text-brand-textMid transition active:scale-95 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex min-w-0 items-end gap-2">
          <button
            type="button"
            onClick={startListening}
            disabled={loading}
            className={`flex shrink-0 items-center justify-center rounded-2xl border bg-white transition active:scale-95 disabled:opacity-50 ${listening ? 'min-h-[64px] min-w-[64px] text-3xl border-red-400 animate-pulse shadow-md' : 'min-h-[56px] min-w-[56px] text-2xl border-green-300 shadow-md hover:scale-[1.02]'}`}
            aria-label={t.assistant?.voiceLabel}
            title={t.assistant?.voiceLabel}
          >
            🎤
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            placeholder={listening ? t.assistant?.voiceListening : t.assistant?.placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="min-h-[44px] shrink-0 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
          >
            {t.assistant?.send}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
