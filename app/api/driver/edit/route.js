import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(req) {
  try {
    const body = await req.json();
    const {
      phone,
      name,
      truckType,
      capacity,
      city,
      vehicleNumber,
      preferredRoutes,
    } = body;

    // Validation
    if (!phone || !name || !city) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields (phone, name, city)",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await getDb();
    const driversCollection = db.collection("drivers");

    // Build update object - only include provided fields
    const updateData = {
      name: name.trim(),
      city: city.trim(),
    };

    if (truckType) {
      updateData.truckType = truckType;
    }
    if (capacity) {
      updateData.capacity = parseFloat(capacity);
    }
    if (vehicleNumber) {
      updateData.vehicleNumber = vehicleNumber.trim();
    }
    if (preferredRoutes) {
      updateData.preferredRoutes = preferredRoutes
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r);
    }

    updateData.updatedAt = new Date();

    // Update driver
    const result = await driversCollection.updateOne(
      { phone: phone.trim() },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Driver not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile updated successfully",
        phone: phone.trim(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Driver edit error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
