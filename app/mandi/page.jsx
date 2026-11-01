"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import MandiFilters from "@/components/mandi/MandiFilters";
import MandiTable from "@/components/mandi/MandiTable";
import WhatsAppShare from "@/components/mandi/WhatsAppShare";
import { useLang } from "@/lib/LanguageContext";
import { useSmartLocation } from "@/lib/hooks/useSmartLocation";

const MapView = dynamic(() => import("@/components/transport/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-green-50 animate-pulse rounded-2xl flex items-center justify-center text-sm font-semibold text-emerald-800">
      Loading map...
    </div>
  ),
});

export default function MandiPage() {
  const { lang, t } = useLang();
  const { district: smartDistrict, lat, lng } = useSmartLocation();
  const [crop, setCrop] = useState("Wheat");
  const [district, setDistrict] = useState("Patiala");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // Sync smart location district initially
  useEffect(() => {
    if (smartDistrict && district === "Patiala" && smartDistrict !== "Patiala") {
      setDistrict(smartDistrict);
    }
  }, [smartDistrict, district]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/prices?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}`
      );
      const json = await res.json();
      setData(json.data || []);
      if (json?.fetchedAt) {
        const locale = lang === "en" ? "en-IN" : lang === "pa" ? "pa-IN" : "hi-IN";
        setLastUpdated(new Date(json.fetchedAt).toLocaleString(locale));
      }
    } catch (_error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [crop, district, lang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stable deterministic pins for Mandi locations so MapView renders steadily without jitter
  const mandiPins = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / Math.max(data.length, 1);
    const radius = 0.05 + (index % 3) * 0.02;
    return {
      _id: `mandi-${index}`,
      name: item.market,
      truckType: `₹${item.modalPrice}/Q`, // Reusing field for price display
      phone: "N/A",
      location: {
        type: "Point",
        coordinates: [
          Number((lng + Math.cos(angle) * radius).toFixed(5)),
          Number((lat + Math.sin(angle) * radius).toFixed(5)),
        ],
      },
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6 py-6 overflow-x-hidden">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-950 md:text-3xl">
          {t.mandi.title} <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          {t.mandi.lastUpdated}: {lastUpdated || "--"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <MandiFilters
              crop={crop}
              district={district}
              onCropChange={setCrop}
              onDistrictChange={setDistrict}
              onSearch={fetchData}
            />
          </div>

          <div className="h-[400px] border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <MapView drivers={mandiPins} userLocation={{ lat, lng }} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200">
              <LoadingSpinner size="lg" />
            </div>
          ) : data.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-1">
              <MandiTable data={data} crop={crop} district={district} />
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <WhatsAppShare crop={crop} district={district} data={data} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <EmptyState title={t.mandi.noDataTitle} description={t.mandi.noDataDesc} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
