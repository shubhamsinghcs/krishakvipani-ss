import { NextResponse } from "next/server";

// Realistic driver data with ratings, status, and pricing
const DRIVER_DATABASE = [
  {
    _id: "1",
    name: "Ravinder Singh",
    phone: "+919876543210",
    truckType: "Mahindra Pickup (1.5 Ton)",
    vehicleNumber: "PB-01-AB-1234",
    rating: 4.8,
    reviews: 124,
    joiningYear: 2015,
    location: { lat: 30.3398, lng: 76.3869, name: "Patiala" },
    availableRoutes: ["Patiala-Chandigarh", "Patiala-Ludhiana"],
    costPerKm: 5.5,
    maxCapacity: 1.5,
    currentStatus: "available",
    lastUpdate: new Date(Date.now() - 2 * 60000).toISOString(),
    documents: { license: true, insurance: true, pollutionCert: true },
  },
  {
    _id: "2",
    name: "Sukhwinder Singh",
    phone: "+919876543211",
    truckType: "Tractor Trolley (5 Ton)",
    vehicleNumber: "PB-02-BC-5678",
    rating: 4.6,
    reviews: 89,
    joiningYear: 2012,
    location: { lat: 30.4851, lng: 76.5937, name: "Rajpura" },
    availableRoutes: ["Rajpura-Khanna", "Rajpura-Ludhiana"],
    costPerKm: 8.0,
    maxCapacity: 5.0,
    currentStatus: "available",
    lastUpdate: new Date(Date.now() - 5 * 60000).toISOString(),
    documents: { license: true, insurance: true, pollutionCert: true },
  },
  {
    _id: "3",
    name: "Gurpreet Singh",
    phone: "+919876543212",
    truckType: "Tata Ace (1 Ton)",
    vehicleNumber: "PB-03-CD-9012",
    rating: 4.9,
    reviews: 156,
    joiningYear: 2018,
    location: { lat: 30.3400, lng: 76.3900, name: "Patiala" },
    availableRoutes: ["Patiala-Sangrur", "Patiala-Ambala"],
    costPerKm: 4.5,
    maxCapacity: 1.0,
    currentStatus: "available",
    lastUpdate: new Date(Date.now() - 1 * 60000).toISOString(),
    documents: { license: true, insurance: true, pollutionCert: true },
  },
  {
    _id: "4",
    name: "Baljeet Sandhu",
    phone: "+919876543213",
    truckType: "Ashok Leyland Pro (3 Ton)",
    vehicleNumber: "PB-04-DE-3456",
    rating: 4.7,
    reviews: 98,
    joiningYear: 2016,
    location: { lat: 30.7046, lng: 76.2120, name: "Ludhiana" },
    availableRoutes: ["Ludhiana-Khanna", "Ludhiana-Jalandhar"],
    costPerKm: 6.5,
    maxCapacity: 3.0,
    currentStatus: "available",
    lastUpdate: new Date(Date.now() - 3 * 60000).toISOString(),
    documents: { license: true, insurance: true, pollutionCert: true },
  },
];

// Simple distance calculation (Haversine formula approximation)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Estimate ETA (assumes 40 km/h average speed in rural areas)
function calculateETA(distanceKm) {
  const hours = Math.ceil((distanceKm / 40) * 60) / 60; // Round up to nearest 30 min
  return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
}

// Get drivers with enriched data
function enrichDrivers(drivers, fromLocation, toLocation) {
  return drivers.map(driver => {
    const distanceFromPickup = calculateDistance(
      fromLocation.lat, fromLocation.lng,
      driver.location.lat, driver.location.lng
    );
    
    const distanceToDropoff = calculateDistance(
      driver.location.lat, driver.location.lng,
      toLocation.lat, toLocation.lng
    );
    
    const totalDistance = distanceFromPickup + distanceToDropoff;
    const estimatedCost = Math.round(totalDistance * driver.costPerKm);
    const estimatedETA = calculateETA(distanceToDropoff);
    
    return {
      ...driver,
      distanceToDriver: distanceFromPickup,
      distanceToDestination: distanceToDropoff,
      estimatedCost,
      estimatedETA,
      verified: driver.documents.license && driver.documents.insurance,
    };
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromMandi = searchParams.get("from") || "";
    const toMandi = searchParams.get("to") || "";
    const userLat = parseFloat(searchParams.get("lat")) || 30.3398;
    const userLng = parseFloat(searchParams.get("lng")) || 76.3869;

    // Mock location lookup (in production, use geocoding API)
    const locationMap = {
      patiala: { lat: 30.3398, lng: 76.3869 },
      chandigarh: { lat: 30.7333, lng: 76.7794 },
      ludhiana: { lat: 30.9046, lng: 75.8550 },
      rajpura: { lat: 30.4851, lng: 76.5937 },
      khanna: { lat: 30.7046, lng: 76.2120 },
      sangrur: { lat: 30.2669, lng: 75.5344 },
      ambala: { lat: 29.3776, lng: 77.1034 },
      jalandhar: { lat: 31.7264, lng: 75.5761 },
    };

    let fromLoc = locationMap[fromMandi.toLowerCase()] || { lat: userLat, lng: userLng };
    let toLoc = locationMap[toMandi.toLowerCase()] || { lat: userLat + 0.5, lng: userLng + 0.5 };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Filter drivers based on availability and routes
    let filtered = DRIVER_DATABASE.filter(d => d.currentStatus === "available");

    // If search filters provided, apply them
    if (fromMandi && toMandi) {
      filtered = filtered.filter(d => {
        const routeMatch = d.availableRoutes.some(route =>
          route.toLowerCase().includes(fromMandi.toLowerCase()) ||
          route.toLowerCase().includes(toMandi.toLowerCase())
        );
        return routeMatch || filtered.length === 0; // Fallback to all if no matches
      });
    }

    // If no exact route matches, return all available
    if (filtered.length === 0) {
      filtered = DRIVER_DATABASE.filter(d => d.currentStatus === "available");
    }

    // Enrich drivers with distance/cost/ETA calculations
    const enriched = enrichDrivers(filtered, fromLoc, toLoc);

    // Sort by distance to pickup location
    enriched.sort((a, b) => a.distanceToDriver - b.distanceToDriver);

    return NextResponse.json({
      success: true,
      drivers: enriched,
      fromLoc,
      toLoc,
      searchParams: {
        from: fromMandi,
        to: toMandi,
        resultCount: enriched.length,
      },
    });
  } catch (error) {
    console.error("Transport Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to find drivers. Please try again.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

