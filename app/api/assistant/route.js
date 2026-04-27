import { NextResponse } from "next/server";
import { safeEnv } from "@/lib/env";
import { callGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

function validateLang(lang) {
  const codes = ["en", "hi", "pa", "bn", "gu", "mr", "ta", "te", "kn", "ml", "or", "as", "ur", "sa", "ks", "ne", "sd", "kok", "mai", "mni", "doi", "brx"];
  return codes.includes(lang) ? lang : "hi";
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "अमान्य JSON" }, { status: 400 });
    }
    
    const url = new URL(request.url);
    const queryLang = url.searchParams.get("lang") || request.headers.get("x-lang");
    
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const lang = validateLang(queryLang || body?.lang);

    // Limit input length directly
    if (!message || message.length > 500) {
      return NextResponse.json({ success: false, message: "प्रश्न बहुत लंबा है या खाली है।" }, { status: 400 });
    }

    const apiKey = safeEnv("GEMINI_API_KEY");
    if (!apiKey || apiKey.includes("your_")) {
      const fallbackMsg = lang === "hi" 
        ? "अभी AI सेवा उपलब्ध नहीं है। कृपया मौसम, मंडी भाव और फसल स्कैनर फीचर्स का उपयोग करें।" 
        : lang === "pa" 
        ? "AI ਸੇਵਾ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਮੌਸਮ, ਮੰਡੀ ਭਾਵ ਅਤੇ ਸਕੈਨਰ ਫੀਚਰ ਵਰਤੋ।"
        : "AI service is currently unavailable. Please use weather, mandi prices, and scanner features.";

      return NextResponse.json(
        {
          success: true,
          reply: fallbackMsg,
          fallback: true,
        },
        { status: 200 }
      );
    }

    const history = Array.isArray(body?.history) ? body.history : [];
    const context = body?.context || {};
    
    let historyContext = "";
    if (history.length > 0) {
       historyContext = "Previous conversation context:\n" + history.map(h => `${h.role}: ${h.text}`).join("\n") + "\n";
    }

    const langNames = {
      en: "English", hi: "Hindi", pa: "Punjabi", bn: "Bengali", gu: "Gujarati",
      mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", ml: "Malayalam",
      or: "Odia", as: "Assamese", ur: "Urdu", sa: "Sanskrit", ks: "Kashmiri",
      ne: "Nepali", sd: "Sindhi", kok: "Konkani", mai: "Maithili", mni: "Manipuri",
      doi: "Dogri", brx: "Bodo"
    };
    const selectedLanguageName = langNames[lang] || "Hindi";

    const prompt = `Act as a professional Indian agricultural expert.
Answer in ${selectedLanguageName} for Indian farmers.
Respond ONLY in ${lang} language.
Give simple, step-by-step actionable advice.
Use farmer-friendly tone.
If unclear, ask follow-up questions.
Avoid generic answers.

${historyContext}
User Question: ${message}

You MUST return your answer STRICTLY as a valid JSON object matching exactly this structure:
{
  "answer": "your detailed response here in ${lang}",
  "tips": ["tip1 in ${lang}", "tip2 in ${lang}"],
  "urgency": "low/medium/high"
}`;

    const geminiResult = await callGemini(prompt, [], context);

    if (!geminiResult.success) {
       return NextResponse.json(
        {
          success: true,
          reply: lang === "hi" ? "सेवा अस्थायी रूप से व्यस्त है। कृपया थोड़ी देर बाद फिर प्रयास करें।" : "Service is temporarily busy. Please try again later.",
          fallback: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, reply: geminiResult.data }, { status: 200 });
  } catch (error) {
    console.error("Assistant Error:", error.message);
    return NextResponse.json(
      {
        success: true,
        reply: lang === "hi" ? "सर्वर त्रुटि! कृपया थोड़ी देर बाद फिर प्रयास करें।" : "Server error! Please try again later.",
        fallback: true,
      },
      { status: 200 }
    );
  }
}
