import React from "react";

export default function DriverCard({ driver, onContactViaWhatsApp, onPreviewRoute }) {
  const {
    name,
    phone,
    truckType,
    vehicleNumber,
    rating = 4.5,
    reviewCount = 0,
    createdAt,
    distanceToDriver,
    distanceToDestination,
    estimatedCost,
    estimatedETA,
    capacity,
    verified,
  } = driver;

  const joiningYear = createdAt ? new Date(createdAt).getFullYear() : 2024;

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-green-100 rounded-2xl shadow-md p-4 space-y-3 hover:scale-[1.01] transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
            {verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {rating} {reviewCount > 0 && `· ${reviewCount} reviews`}
          </p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Available</span>
      </div>

      {/* Vehicle Info */}
        <div className="bg-gray-50/70 rounded-lg p-3 border border-gray-100 space-y-2">
        <p className="text-sm font-semibold text-gray-900">{truckType}</p>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Vehicle: {vehicleNumber || "N/A"}</span>
          <span>Capacity: {capacity}T</span>
        </div>
      </div>

      {/* Distance & Time */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <p className="text-xs text-gray-600">From You</p>
          <p className="font-bold text-blue-800">{distanceToDriver || 5} km</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
          <p className="text-xs text-gray-600">ETA</p>
          <p className="font-bold text-yellow-800">{estimatedETA || "1h 30m"}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 border border-green-100">
          <p className="text-xs text-gray-600">Est. Cost</p>
          <p className="font-bold text-green-800">₹{estimatedCost || 500}</p>
        </div>
      </div>

      {/* Fuel estimate */}
      <div className="text-xs text-gray-500 flex justify-between">
        <span>Fuel est.: {distanceToDestination ? `${(distanceToDestination / 4).toFixed(1)} L` : '—'}</span>
        <span>Distance to dest: {distanceToDestination || 0} km</span>
      </div>

      {/* Meta Info */}
      <div className="text-xs text-gray-500 flex justify-between">
        <span>Member since {joiningYear}</span>
        <span>Last seen: now</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => onContactViaWhatsApp(driver)}
          className="w-full min-h-[44px] bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Contact via WhatsApp
        </button>
        {onPreviewRoute && (
          <button onClick={() => onPreviewRoute(driver)} className="w-full min-h-[44px] bg-gray-100 text-gray-700 font-semibold border rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all duration-300">
            Preview Route
          </button>
        )}
        <a
          href={`tel:${phone}`}
          className="w-full min-h-[44px] bg-blue-50 text-blue-700 font-semibold border border-blue-200 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 active:scale-95 transition-all duration-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M22 16.92V21a1 1 0 0 1-1 1A19 19 0 0 1 2 3a1 1 0 0 1 1-1h3.09a1 1 0 0 1 1 .75c.12.5.38 1.74.86 2.98a1 1 0 0 1-.24 1l-1.27 1.27a16 16 0 0 0 6.58 6.58l1.27-1.27a1 1 0 0 1 1-.24c1.24.48 2.48.74 2.98.86a1 1 0 0 1 .75 1V21z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Call Driver
        </a>
      </div>
    </div>
  );
}

