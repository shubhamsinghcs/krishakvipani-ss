import { NextResponse } from "next/server";

// Mock data for transport drivers
const MOCK_DRIVERS = [
  { _id: "1", name: "रविंदर सिंह", phone: "+919876543210", truckType: "महिंद्रा पिकअप (1.5 टन)", route_from: "पटियाला", route_to: "चंडीगढ़", lat: 30.3398, lng: 76.3869 },
  { _id: "2", name: "सुखविंदर सिंह", phone: "+919876543211", truckType: "ट्रैक्टर ट्रॉली (5 टन)", route_from: "राजपुरा", route_to: "खन्ना", lat: 30.4851, lng: 76.5937 },
  { _id: "3", name: "गुरप्रीत सिंह", phone: "+919876543212", truckType: "टाटा ऐस (1 टन)", route_from: "पटियाला", route_to: "सरहिंद", lat: 30.3400, lng: 76.3900 },
  { _id: "4", name: "बलजीत संधू", phone: "+919876543213", truckType: "आयशर प्रो (3 टन)", route_from: "खन्ना", route_to: "लुधियाना", lat: 30.7046, lng: 76.2120 },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromMandi = searchParams.get("from")?.toLowerCase() || "";
    const toMandi = searchParams.get("to")?.toLowerCase() || "";
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filtered = MOCK_DRIVERS;
    
    if (fromMandi) {
      filtered = filtered.filter(d => d.route_from.toLowerCase().includes(fromMandi) || fromMandi.includes(d.route_from.toLowerCase()));
    }
    if (toMandi) {
      filtered = filtered.filter(d => d.route_to.toLowerCase().includes(toMandi) || toMandi.includes(d.route_to.toLowerCase()));
    }
    
    // Fallback: If no strict matches, return all nearby (mocked logic)
    if (filtered.length === 0) {
      filtered = MOCK_DRIVERS;
    }

    return NextResponse.json({
      success: true,
      drivers: filtered,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "ड्राइवर खोजने में त्रुटि।",
      error: error.message
    }, { status: 500 });
  }
}
