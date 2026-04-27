import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchWithTimeout(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "KrishakVipani/1.0 (farmer marketplace app; contact via app maintainers)",
        Accept: "application/json",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
      },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ success: false, message: "Invalid coordinates" }, { status: 400 });
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ success: false, message: "Coordinates out of range" }, { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetchWithTimeout(url, 7000);
    if (!response.ok) {
      return NextResponse.json({ success: true, city: null, district: null, state: null }, { status: 200 });
    }
    const payload = await response.json();
    const address = payload?.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.hamlet ||
      null;
    const district =
      address.county ||
      address.state_district ||
      address.city_district ||
      address.region ||
      null;
    const state = address.state || null;
    return NextResponse.json({ success: true, city, district, state }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true, city: null, district: null, state: null }, { status: 200 });
  }
}
