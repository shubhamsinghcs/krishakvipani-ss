import { getDb } from "@/lib/mongodb";
import { updateDriverAvailability } from "@/lib/models/Driver";

export const dynamic = "force-dynamic";

export async function PATCH(req) {
  try {
    const { phone, availability } = await req.json();

    // Validation
    if (!phone || typeof availability !== "boolean") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing phone or invalid availability value",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await getDb();

    // Update availability
    const result = await updateDriverAvailability(
      db,
      phone.trim(),
      availability
    );

    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Driver not found or update failed",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: availability
          ? "You are now online and visible to farmers"
          : "You are now offline",
        phone: phone.trim(),
        availability: availability,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Driver availability update error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
