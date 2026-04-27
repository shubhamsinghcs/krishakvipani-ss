"use client";

import { useLoadScript, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback, useMemo } from "react";
import { safeEnv } from "@/lib/env";

const mapContainerStyle = { w: "100%", h: "100%" };
const defaultCenter = { lat: 30.3398, lng: 76.3869 }; // Patiala fallback

export default function MapView({ drivers, userLocation }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || safeEnv("NEXT_PUBLIC_GOOGLE_MAPS_KEY"),
  });

  const [selectedDriver, setSelectedDriver] = useState(null);

  const center = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) return userLocation;
    return defaultCenter;
  }, [userLocation]);

  const onMapLoad = useCallback((map) => {
    // Optionally auto-fit bounds based on markers
  }, []);

  if (loadError) return <div className="p-4 text-center text-red-500 font-semibold bg-red-50 rounded-xl">मैप लोड नहीं हो पाया</div>;
  if (!isLoaded) return <div className="p-4 text-center text-brand-textMid">नक्शा लोड हो रहा है...</div>;

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden border border-green-200 shadow-inner">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={10}
        center={center}
        options={{ disableDefaultUI: true, zoomControl: true }}
        onLoad={onMapLoad}
      >
        {/* User Location Marker */}
        <Marker
          position={center}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
          title="Your Location"
        />

        {/* Drivers Markers */}
        {drivers.map((driver) => {
          const lat = driver.location?.coordinates?.[1];
          const lng = driver.location?.coordinates?.[0];
          
          if (!lat || !lng) return null;
          
          return (
            <Marker
              key={driver._id}
              position={{ lat, lng }}
              icon={{
                 url: "http://maps.google.com/mapfiles/ms/icons/truck.png",
              }}
              onClick={() => setSelectedDriver(driver)}
            />
          );
        })}

        {/* Info Window for Drivers */}
        {selectedDriver && (
          <InfoWindow
            position={{
              lat: selectedDriver.location.coordinates[1],
              lng: selectedDriver.location.coordinates[0],
            }}
            onCloseClick={() => setSelectedDriver(null)}
          >
            <div className="p-2 space-y-1">
              <h3 className="font-bold text-gray-800">{selectedDriver.name}</h3>
              <p className="text-sm text-gray-600">Truck: {selectedDriver.truckType}</p>
              <a 
                href={`tel:${selectedDriver.phone}`} 
                className="mt-2 text-sm font-semibold text-white bg-green-600 px-3 py-1.5 rounded inline-block w-full text-center hover:bg-green-700 active:scale-95 transition-all"
              >
                📞 कॉल करें ({selectedDriver.phone})
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
