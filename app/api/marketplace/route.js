import { NextResponse } from "next/server";

// In-memory store for demonstration purposes
// In a real app, use MongoDB or PostgreSQL
let marketListings = [
  { id: 1, farmerName: "Ramesh Singh", crop: "Wheat", quantity: 50, unit: "Quintals", price: 2150, location: "Ludhiana, Punjab", phone: "+91-9876543210", date: new Date().toISOString() },
  { id: 2, farmerName: "Suresh Kumar", crop: "Rice", quantity: 30, unit: "Quintals", price: 3200, location: "Karnal, Haryana", phone: "+91-9876543211", date: new Date().toISOString() }
];

export async function GET() {
  return NextResponse.json({ success: true, data: marketListings });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.crop || !body.quantity || !body.price || !body.location) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newListing = {
      id: Date.now(),
      farmerName: body.farmerName || "Kisan",
      crop: body.crop,
      quantity: body.quantity,
      unit: body.unit || "Quintals",
      price: body.price,
      location: body.location,
      phone: body.phone || "Not Provided",
      date: new Date().toISOString()
    };

    marketListings.unshift(newListing); // Add to beginning

    return NextResponse.json({ success: true, data: newListing });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to post listing" }, { status: 500 });
  }
}
