import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeEnv } from "@/lib/env";

export async function callGemini(prompt, images = [], context = {}) {
  const apiKey = safeEnv("GEMINI_API_KEY");
  
  if (!apiKey || apiKey.includes("your_")) {
    console.warn("Gemini key missing, using fallback");
    return {
      success: false,
      message: "AI सेवा अभी उपलब्ध नहीं है",
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 250,
      temperature: 0.7,
    }
  });

  const systemInstruction = `You are a highly intelligent, Smart AI Assistant for farmers in India.
Current Context:
- Location: ${context.location || 'Unknown'}
- Crop: ${context.crop || 'Unknown'}
- Weather: ${context.weather || 'Unknown'}

RULES:
1. Answer in simple, easy-to-understand Hindi (or the user's requested language).
2. Keep your answers short, concise, and highly relevant to the context.
3. Be professional and supportive.`;

  const finalPrompt = `${systemInstruction}\n\nFarmer Query: ${prompt}`;

  const parts = [finalPrompt];
  for (const img of images) {
    if (img.base64 && img.mimeType) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      });
    }
  }

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await Promise.race([
          model.generateContent(parts),
          new Promise((_, reject) => {
            controller.signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true });
          }),
        ]);
        
        clearTimeout(timer);
        
        let text = response.response.text();
        text = text.replace(/```json|```/gi, "").trim();
        
        let parsed;
        try {
          parsed = JSON.parse(text);
          return { success: true, data: parsed };
        } catch (jsonError) {
          // Fallback if the AI returns raw text instead of JSON
          return { success: true, data: { answer: text } };
        }
      } catch (err) {
        clearTimeout(timer);
        if (err.message !== "timeout") {
          throw err;
        }
      }
    } catch (error) {
      console.error("Gemini Error:", error.message);
      if (attempts >= 3) {
        return {
          success: false,
          message: "AI सेवा अभी उपलब्ध नहीं है, कृपया पुनः प्रयास करें।",
        };
      }
    }
  }

  return {
    success: false,
    message: "AI सेवा अभी उपलब्ध नहीं है",
  };
}
