import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { crop, landSize, weather } = await request.json();

    if (!crop || !landSize) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Deterministic fallback/mock calculation
    // Yield per acre mapping (in quintals)
    const baseYieldMap = {
      wheat: 15,
      rice: 20,
      cotton: 8,
      sugarcane: 300,
      maize: 12,
    };

    const cropKey = crop.toLowerCase();
    const baseYield = baseYieldMap[cropKey] || 10;
    
    let estimatedTotal = baseYield * parseFloat(landSize);
    let confidence = 85;

    // Adjust based on weather simple rules
    if (weather === "rainy" && cropKey !== "rice") {
      estimatedTotal *= 0.9;
      confidence -= 5;
    } else if (weather === "drought") {
      estimatedTotal *= 0.6;
      confidence -= 15;
    } else if (weather === "sunny") {
      estimatedTotal *= 1.05;
      confidence += 5;
    }

    return NextResponse.json({
      success: true,
      data: {
        estimatedYield: estimatedTotal.toFixed(2),
        unit: "Quintals",
        confidence: confidence,
        recommendations: [
          `Ensure proper ${weather === 'drought' ? 'irrigation' : 'drainage'} for the upcoming weeks.`,
          "Use organic fertilizers to potentially boost the yield by 10%.",
          "Monitor for pests early in the season."
        ]
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to estimate yield" }, { status: 500 });
  }
}
