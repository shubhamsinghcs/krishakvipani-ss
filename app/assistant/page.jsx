"use client";

import dynamic from "next/dynamic";
import { useLang } from "@/lib/LanguageContext";

const ChatBox = dynamic(() => import("@/components/assistant/ChatBox"), { ssr: false });

export default function AssistantPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">{t.assistant?.title}</h1>
        <p className="mt-1 text-sm text-brand-textMid">{t.assistant?.subtitle}</p>
      </div>
      <ChatBox />
    </div>
  );
}
