import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeEnv } from "./env.js";

export async function callGemini(prompt, images = [], context = {}) {
  const apiKey = safeEnv("GEMINI_API_KEY");
  
  if (!apiKey || apiKey.includes("your_")) {
    return {
      success: false,
      message: "GEMINI_API_KEY_MISSING",
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const maxOutputTokens = context.maxOutputTokens || 1200;
  const temperature = typeof context.temperature === "number" ? context.temperature : 0.4;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens,
      temperature,
    }
  });

  // If a custom system instruction is provided in context, use it; otherwise build default context prompt
  let finalPrompt = "";
  if (context.skipSystemInstruction) {
    finalPrompt = prompt;
  } else if (context.systemInstruction) {
    finalPrompt = `${context.systemInstruction}\n\n${prompt}`;
  } else {
    const systemInstruction = `You are a highly intelligent, Smart AI Assistant for farmers in India.
Current Context:
- Location: ${context.location || 'Unknown'}
- Crop: ${context.crop || 'Unknown'}
- Weather: ${context.weather || 'Unknown'}

RULES:
1. Answer in simple, easy-to-understand Hindi (or the user's requested language).
2. Keep your answers short, concise, and highly relevant to the context.
3. Be professional and supportive.`;
    finalPrompt = `${systemInstruction}\n\nFarmer Query: ${prompt}`;
  }

  const parts = [finalPrompt];

  // Safely extract and attach images (supporting both img.data and img.base64)
  for (const img of images) {
    const rawData = img.data || img.base64;
    const mimeType = img.mimeType || img.type || "image/jpeg";
    if (rawData && typeof rawData === "string") {
      // Strip any data:image/xyz;base64, prefix if present
      const cleanData = rawData.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanData,
        },
      });
    }
  }

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const response = await Promise.race([
          model.generateContent(parts),
          new Promise((_, reject) => {
            controller.signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true });
          }),
        ]);
        
        clearTimeout(timer);
        
        let text = response.response.text();
        text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        
        try {
          const parsed = JSON.parse(text);
          return { success: true, data: parsed };
        } catch {
          // Attempt extracting JSON substring if there's conversational wrapper text
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const extracted = JSON.parse(jsonMatch[0]);
              return { success: true, data: extracted };
            } catch {}
          }
          return { success: true, data: { answer: text } };
        }
      } catch (err) {
        clearTimeout(timer);
        if (err.message !== "timeout") {
          throw err;
        }
      }
    } catch (error) {
      console.error(`Gemini Error (attempt ${attempts}):`, error.message);
      if (attempts >= 3) {
        return {
          success: false,
          message: error.message || "AI service temporarily unavailable",
        };
      }
    }
  }

  return {
    success: false,
    message: "AI service temporarily unavailable",
  };
}
