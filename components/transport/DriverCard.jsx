import React from "react";

export default function DriverCard({ driver }) {
  const { name, phone, truckType, route_from, route_to } = driver;

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-md p-4 flex flex-col gap-2 hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span>🚛</span> {truckType || "ट्रक"}
          </p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
          उपलब्ध
        </span>
      </div>
      
      {(route_from || route_to) && (
        <div className="mt-1 text-sm text-gray-500 flex items-center gap-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <span className="truncate">{route_from || "सभी मंडी"}</span>
          <span className="text-gray-300">➡️</span>
          <span className="truncate">{route_to || "सभी मंडी"}</span>
        </div>
      )}

      <a
        href={`tel:${phone}`}
        className="mt-3 w-full min-h-[44px] bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all duration-300"
      >
        <span>📞</span> कॉल करें
      </a>
    </div>
  );
}
