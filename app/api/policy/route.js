import { NextResponse } from "next/server";
import { POLICY_UPDATES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "").trim().slice(0, 48);

    let policies = [...POLICY_UPDATES];
    if (category) {
      policies = policies.filter((policy) => policy.category.toLowerCase() === category.toLowerCase());
    }

    policies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(
      {
        success: true,
        policies,
        total: policies.length,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: false, message: "नीति डेटा लाने में त्रुटि।" }, { status: 500 });
  }
}

/*
  Real-world extension notes:
  1) Add scheduled ingestion via cron/queue from PIB, data.gov.in, state agriculture portals.
  2) Normalize incoming notices into a single schema and store in MongoDB.
  3) Use category/tag classifiers for multilingual content and deduplicate by source URL/hash.
  4) Serve cached API responses with revalidation to keep feed fresh and fast.
*/
