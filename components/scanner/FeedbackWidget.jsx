"use client";

import { useState } from "react";

export default function FeedbackWidget({ result }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (isCorrect) => {
    setLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect, context: "scanner", result }),
      });
      setSubmitted(true);
    } catch {
      // Ignore silent fail
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl bg-green-50/80 px-4 py-3 text-center text-sm font-semibold text-green-700 shadow-sm border border-green-100">
        धन्यवाद! आपका फीडबैक दर्ज हो गया है।
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-white/70 backdrop-blur-lg border border-white/40 p-4 shadow-xl">
      <p className="text-center text-sm font-semibold text-brand-textDark mb-3">
        क्या यह सही है?
      </p>
        <div className="flex gap-4 justify-center">
        <button
          disabled={loading}
          onClick={() => handleFeedback(true)}
          className="flex-1 min-h-[44px] max-w-[120px] rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M14 9V5a3 3 0 0 0-6 0v4H4v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7h-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          सही
        </button>
        <button
          disabled={loading}
          onClick={() => handleFeedback(false)}
          className="flex-1 min-h-[44px] max-w-[120px] rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M19 13V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7h4v4a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-4h-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          गलत
        </button>
      </div>
    </div>
  );
}
