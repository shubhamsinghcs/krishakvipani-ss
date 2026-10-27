import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getFarmerProfile } from "@/lib/models/FarmerProfile";
import { callGemini } from "@/lib/gemini";
import { autoTranslate } from "@/lib/autoTranslate";
import { saveNotification } from "@/lib/models/Notification";

export const dynamic = "force-dynamic";

const ACTION_ENGINE_PROMPT = `You are an expert Indian farm action engine AI.

Generate 3-5 urgent, actionable recommendations based on:
- Crop type and growth stage
- Current weather conditions (temp, humidity, rainfall)
- Location/district
- Time of year

Return ONLY valid JSON in this structure:
{
  "actions": [
    {
      "priority": "high|medium|low",
      "icon": "string_identifier",
      "title": "action title",
      "description": "specific action to take today",
      "reason": "why this matters now",
      "deadline": "today|tomorrow|3-days|week",
      "crop_stage_specific": true/false
    }
  ],
  "urgency": "immediate_action|monitor|plan_ahead"
}

Rules:
1. Actions must be specific, time-bound, and immediately actionable (prefer "today" or "tomorrow" deadlines when urgent).
2. Prioritize by season, crop stage, and current conditions; prefer interventions that minimize farmer cost and risk.
3. Use a short string icon identifier (e.g., "irrigate","spray","harvest","monitor","pin"); do not use emoji.
4. Keep titles to 6 words max and descriptions under 50 words.
5. If information is missing (unknown crop, no weather), return conservative, low-risk recommendations and flag the missing data in the reason.
6. For pesticide/fungicide recommendations: do NOT provide brand names or dosages; instead give non-specific action guidance (e.g., "apply appropriate fungicide at label rates if disease confirmed") and recommend consulting extension services for exact products and dosages.
7. For irrigation recommendations: specify timing (e.g., "early morning"), approximate volume or frequency language (e.g., "light irrigation (~1 inch)"), and note soil moisture checks where possible.
8. For harvest suggestions: include indicators that justify harvest (e.g., "grain moisture < 20% or physiological maturity") and recommend immediate drying/storage steps.
9. If multiple urgent actions conflict (e.g., spray vs. irrigation when rain is imminent), prefer safety-first guidance and recommend postponing non-essential chemical applications.
10. Always include a brief reason explaining why the action matters now and whether it is crop-stage specific.
11. Return ONLY JSON; do not include notes, markdown, or any text outside the JSON object.

Example outputs (must match schema):
{
  "actions": [
    {"priority":"high","icon":"irrigate","title":"Irrigate early morning","description":"Apply light irrigation to relieve heat stress (approx. 1 inch)","reason":"High temp (35°C) and low humidity increasing stress","deadline":"today","crop_stage_specific":true},
    {"priority":"medium","icon":"monitor","title":"Monitor for disease","description":"Inspect lower leaves daily for lesions; take photos if found","reason":"Recent showers increase fungal risk","deadline":"3-days","crop_stage_specific":false}
  ],
  "urgency":"immediate_action"
}

Edge cases:
- Unknown crop: return a short set of general, low-risk actions (monitor weather, soil moisture checks, update profile) and mark priority accordingly.
- Missing weather: return actions that are not weather-dependent and ask the user to provide location or check weather.
- High uncertainty: prefer monitoring actions and suggest targeted scouting rather than blanket chemical use.
`;

async function generateRecommendations(farmerProfile, weatherData) {
  const prompt = `${ACTION_ENGINE_PROMPT}

Farmer Context:
- Crop: ${farmerProfile.cropType || "Mixed"}
- Farm Size: ${farmerProfile.farmSize || "Unknown"} acres
- District: ${farmerProfile.district || "Unknown"}
- Last Scan: ${farmerProfile.lastScan || "None"}

Weather Now:
- Temperature: ${weatherData.temp}°C
- Humidity: ${weatherData.humidity}%
- Condition: ${weatherData.condition}
- Rainfall Today: ${weatherData.rainfall || "None"}mm`;

  return callGemini(prompt, [], {
    location: farmerProfile.district || "Unknown",
    crop: farmerProfile.cropType || "Mixed",
    weather: `${weatherData.temp || "N/A"}C ${weatherData.condition || "Unknown"}`,
  });
}

export async function GET(request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") || "en";

  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const profile = await getFarmerProfile(db, userId);

    if (!profile || !profile.cropType || !profile.district) {
      return NextResponse.json(
        {
          success: true,
          actions: [
            {
              priority: "high",
              icon: "user",
              title: "Complete Your Profile",
              description: "Set your crop type and district for personalized recommendations",
              reason: "We need this to generate accurate farming actions",
              deadline: "today",
            },
          ],
        },
        { status: 200 }
      );
    }

    // Get weather data from localStorage or recent request
    // In production, this would fetch from weather API
    const weatherData = {
      temp: 25,
      humidity: 60,
      condition: "Partly Cloudy",
      rainfall: 0,
    };

    const result = await generateRecommendations(profile, weatherData);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: true,
          actions: [
            {
              priority: "medium",
              icon: "checklist",
              title: "Monitor Weather",
              description: "Check weather updates regularly for irrigation planning",
              reason: "Weather-based irrigation saves water and improves yields",
              deadline: "today",
            },
          ],
        },
        { status: 200 }
      );
    }

    const analysis = result.data;
    const translatedActions = [];

    for (const action of analysis.actions || []) {
      translatedActions.push({
        priority: action.priority || "medium",
        icon: action.icon || "pin",
        title: await autoTranslate(action.title || "Action", lang),
        description: await autoTranslate(action.description || "", lang),
        reason: await autoTranslate(action.reason || "", lang),
        deadline: action.deadline || "today",
        cropStageSpecific: action.crop_stage_specific || false,
        timestamp: new Date().toISOString(),
      });
    }

    // Persist a notification for urgent recommendations (best-effort)
    try {
      const urgent = (analysis.actions || []).find(a => a.priority === 'high');
      const top = urgent || (analysis.actions || [])[0];
      if (top) {
        await saveNotification(db, {
          userId,
          title: `Recommendation: ${top.title}`,
          body: top.description || top.reason || 'New recommendation available',
          meta: { type: 'recommendation', urgency: analysis.urgency || null }
        });
      }
    } catch (e) {
      console.error('Failed to persist recommendation notification', e);
    }

    return NextResponse.json(
      {
        success: true,
        urgency: analysis.urgency || "monitor",
        actions: translatedActions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Action Engine Error:", error);
    return NextResponse.json(
      {
        success: true,
        actions: [
          {
            priority: "low",
            icon: "info",
            title: "Check Back Later",
            description: "Recommendations will be available shortly",
            reason: "System is processing your farm data",
            deadline: "tomorrow",
          },
        ],
      },
      { status: 200 }
    );
  }
}
