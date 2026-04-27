"use client";

import { useState, useEffect } from "react";
import { PUNJAB_DISTRICTS } from "@/lib/constants";

export function useSmartLocation() {
  const [location, setLocation] = useState({
    district: "Patiala", // Fallback
    lat: 30.3398,
    lng: 76.3869,
    loading: true,
  });

  useEffect(() => {
    // Try to load from cache first for fast display
    if (typeof window !== "undefined") {
      const cachedLoc = localStorage.getItem("user_district");
      if (cachedLoc) {
        setLocation(prev => ({ ...prev, district: cachedLoc, loading: false }));
      }
    }

    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        try {
          const res = await fetch(`/api/location?lat=${lat}&lon=${lng}`);
          const data = await res.json();
          
          let foundDistrict = "Patiala"; // fallback
          if (data && data.district) {
            const raw = `${data.district} ${data.city || ""}`.toLowerCase();
            const match = PUNJAB_DISTRICTS.find((d) => raw.includes(d.toLowerCase()));
            if (match) foundDistrict = match;
          }
          
          setLocation({
            district: foundDistrict,
            lat,
            lng,
            loading: false,
          });
          
          if (typeof window !== "undefined") {
            localStorage.setItem("user_district", foundDistrict);
          }
        } catch (err) {
          setLocation(prev => ({ ...prev, lat, lng, loading: false }));
        }
      },
      () => {
        setLocation(prev => ({ ...prev, loading: false }));
      },
      { timeout: 8000 }
    );
  }, []);

  return location;
}
