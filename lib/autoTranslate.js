import { callGemini } from "@/lib/gemini";

const translateCache = new Map();

export async function autoTranslate(text, lang) {
  if (!text || typeof text !== "string") return text;
  if (!lang || lang === "en") return text;

  const key = `${text}_${lang}`;
  if (translateCache.has(key)) {
    return translateCache.get(key);
  }

  try {
    const prompt = `Translate the following agricultural text into ${lang}. 
Return ONLY valid JSON in this exact format:
{"translation": "translated text here"}
Do not add any markdown formatting or extra explanations.
Text to translate:
${text}`;

    const res = await callGemini(prompt, []);
    
    if (res.success && res.data && res.data.translation) {
      const translated = res.data.translation.trim();
      translateCache.set(key, translated);
      return translated;
    }

    if (res.success && res.data && res.data.answer) {
        const translated = res.data.answer.trim();
        translateCache.set(key, translated);
        return translated;
    }
    
    // In case gemini returned JSON instead of plain string (since callGemini attempts JSON parse)
    if (res.success && res.data) {
        const str = typeof res.data === "object" ? JSON.stringify(res.data) : String(res.data);
        translateCache.set(key, str);
        return str;
    }

    return text;
  } catch (error) {
    console.error("AutoTranslate Error:", error);
    return text;
  }
}
