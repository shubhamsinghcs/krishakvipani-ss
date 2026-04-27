import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Mock logic to calculate a credit score (0-100)
    // In a real app, this would query database for farmer history
    const baseScore = 40;
    const cropHistoryScore = 25; // Good history
    const consistencyScore = 15; // Regular activity
    const mandiActivityScore = 12; // Moderate sales
    
    const totalScore = baseScore + cropHistoryScore + consistencyScore + mandiActivityScore;

    let level = "Beginner";
    if (totalScore >= 80) level = "Excellent";
    else if (totalScore >= 60) level = "Good";
    else if (totalScore >= 40) level = "Fair";

    return NextResponse.json({
      success: true,
      data: {
        score: totalScore,
        level,
        breakdown: {
          base: baseScore,
          history: cropHistoryScore,
          consistency: consistencyScore,
          mandi: mandiActivityScore
        },
        suggestions: [
          "List more crops on the Mandi to boost your score.",
          "Keep your farm activity consistent for a higher rating.",
          "Maintain clear transaction history."
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to calculate credit score" }, { status: 500 });
  }
}
