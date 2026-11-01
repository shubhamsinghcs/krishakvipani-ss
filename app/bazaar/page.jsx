"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import {
  IconStore,
  IconSprout,
  IconTractor,
  IconSearch,
  IconPhone,
  IconShieldCheck,
  IconCheckCircle,
  IconMapPin,
  IconFileText,
  IconX,
} from "@/components/ui/Icons";

const MOCK_INPUTS = [
  {
    id: 1,
    name: "Pusa 44 Certified Paddy Seeds",
    category: "Seeds",
    price: 1200,
    unit: "10 kg bag",
    badge: "Govt Certified",
    rating: 4.8,
    stock: "In Stock",
  },
  {
    id: 2,
    name: "HD-3226 Rust-Resistant Wheat Seeds",
    category: "Seeds",
    price: 950,
    unit: "10 kg bag",
    badge: "PAU Recommended",
    rating: 4.9,
    stock: "In Stock",
  },
  {
    id: 3,
    name: "IFFCO Nano Urea & DAP Liquid Combo",
    category: "Fertilizer",
    price: 850,
    unit: "500 ml x 2",
    badge: "Subsidized",
    rating: 4.7,
    stock: "Available",
  },
  {
    id: 4,
    name: "Organic Cold-Pressed Neem Oil (1500 ppm)",
    category: "Bio-Pesticide",
    price: 420,
    unit: "1 Litre",
    badge: "CIBRC Approved",
    rating: 4.9,
    stock: "In Stock",
  },
  {
    id: 5,
    name: "Trichoderma viride Bio-Fungicide",
    category: "Bio-Pesticide",
    price: 280,
    unit: "1 kg pack",
    badge: "Organic Certified",
    rating: 4.8,
    stock: "In Stock",
  },
];

const MOCK_RENTALS = [
  {
    id: 1,
    name: "Mahindra 575 DI Tractor with Rotavator",
    provider: "Gurpreet Farm Custom Hiring",
    rate: "₹800 / hr",
    location: "Ludhiana (Within 15 km)",
    phone: "+91-9876543210",
    status: "Available Today",
  },
  {
    id: 2,
    name: "Precision Agricultural Drone Spray (10L)",
    provider: "Kisan Drone Hub Services",
    rate: "₹450 / acre",
    location: "Patiala (Within 25 km)",
    phone: "+91-9876543212",
    status: "Pre-Booking Open",
  },
  {
    id: 3,
    name: "Laser Land Leveler with Certified Operator",
    provider: "Malwa Custom Hiring Centre",
    rate: "₹950 / hr",
    location: "Bathinda (Within 20 km)",
    phone: "+91-9876543213",
    status: "Available",
  },
];

const CROPS_LIST = [
  "Wheat",
  "Paddy / Rice",
  "Cotton",
  "Mustard",
  "Maize",
  "Soybean",
  "Gram / Chana",
  "Tomato",
  "Potato",
  "Onion",
];

export default function KrishiBazaarPage() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("produce"); // "produce" | "inputs" | "rentals"
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [showAddProduceModal, setShowAddProduceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCropFilter, setSelectedCropFilter] = useState("All");
  const [orderSuccess, setOrderSuccess] = useState("");

  const [form, setForm] = useState({
    farmerName: "",
    crop: "Wheat",
    variety: "",
    quantity: "",
    unit: "Quintals",
    grade: "Grade A (Clean & Graded)",
    price: "",
    location: "",
    phone: "",
    availability: "Ready for Delivery",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/marketplace");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setListings(json.data);
      }
    } catch {
      /* fallback */
    } finally {
      setLoadingListings(false);
    }
  };

  const handlePostListing = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setListings([json.data, ...listings]);
        setShowAddProduceModal(false);
        setShowPreviewModal(false);
        setOrderSuccess(
          lang === "hi"
            ? "आपकी फसल लिस्टिंग सफलतापूर्वक प्रकाशित हो गई है!"
            : "Your produce listing has been published successfully!"
        );
        setForm({
          farmerName: "",
          crop: "Wheat",
          variety: "",
          quantity: "",
          unit: "Quintals",
          grade: "Grade A (Clean & Graded)",
          price: "",
          location: "",
          phone: "",
          availability: "Ready for Delivery",
        });
      } else {
        alert(json.error || "Failed to post produce listing");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProduce = listings.filter((item) => {
    const matchesSearch =
      item.crop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop =
      selectedCropFilter === "All" ||
      item.crop?.toLowerCase().includes(selectedCropFilter.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <IconStore className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-950 md:text-3xl">
                {lang === "hi"
                  ? "कृषि बाज़ार (Krishi Bazaar)"
                  : lang === "pa"
                  ? "ਖੇਤੀ ਬਾਜ਼ਾਰ"
                  : "Krishi Bazaar"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {lang === "hi"
                  ? "सीधे फसल बेचें, प्रमाणित बीज व उर्वरक खरीदें और कृषि मशीनरी किराए पर लें"
                  : "Direct farm trading, certified agricultural inputs, and verified machinery rentals"}
              </p>
            </div>
          </div>
        </div>

        {activeTab === "produce" && (
          <button
            type="button"
            onClick={() => setShowAddProduceModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95 transition-all shrink-0"
          >
            <span>+</span>
            <span>
              {lang === "hi"
                ? "अपनी फसल लिस्ट करें"
                : lang === "pa"
                ? "ਫ਼ਸਲ ਵੇਚਣ ਲਈ ਪਾਓ"
                : "List Your Produce"}
            </span>
          </button>
        )}
      </div>

      {/* Unified 3-Tab Navigator */}
      <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab("produce")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "produce"
              ? "bg-white text-emerald-950 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <IconSprout className="w-4 h-4 text-emerald-700" />
          <span>{lang === "hi" ? "फसल बिक्री" : "Sell Produce"}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("inputs")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "inputs"
              ? "bg-white text-emerald-950 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <IconShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{lang === "hi" ? "बीज व खाद" : "Farm Inputs"}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rentals")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "rentals"
              ? "bg-white text-emerald-950 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <IconTractor className="w-4 h-4 text-emerald-700" />
          <span>{lang === "hi" ? "यंत्र किराया" : "Machinery Rentals"}</span>
        </button>
      </div>

      {orderSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <IconCheckCircle className="w-4 h-4 text-emerald-700" />
            {orderSuccess}
          </span>
          <button
            type="button"
            onClick={() => setOrderSuccess("")}
            className="text-gray-500 hover:text-gray-700"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: SELL & BUY PRODUCE */}
      {activeTab === "produce" && (
        <div className="space-y-4">
          {/* Search & Commodity Filter Chips */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  lang === "hi"
                    ? "फसल, किस्म या जिले के नाम से खोजें..."
                    : "Search by crop, variety, or district..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["All", "Wheat", "Paddy", "Cotton", "Mustard", "Soybean", "Tomato"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setSelectedCropFilter(chip)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCropFilter === chip
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-gray-100 animate-pulse border border-gray-200"
                />
              ))}
            </div>
          ) : filteredProduce.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProduce.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-950">{item.crop}</h3>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.variety || "Standard Variety"}
                        </span>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                        ₹{item.price} / {item.unit || "Quintal"}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900">
                          {item.quantity} {item.unit || "Quintals"}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-emerald-700 font-medium">
                          {item.grade || "Grade A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <IconMapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.location}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Farmer: {item.farmerName || "Verified Producer"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <a
                      href={`tel:${item.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50/70 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all"
                    >
                      <IconPhone className="w-3.5 h-3.5" />
                      <span>{lang === "hi" ? "कॉल करें" : "Call Farmer"}</span>
                    </a>
                    <a
                      href={`https://wa.me/${(item.phone || "").replace(
                        /[^0-9]/g,
                        ""
                      )}?text=Hi,%20I%20am%20interested%20in%20your%20${encodeURIComponent(
                        item.crop
                      )}%20listing%20on%20KrishakVipani`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 active:scale-95 transition-all"
                      title="Enquire on WhatsApp"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 space-y-2">
              <IconSprout className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-medium">
                {lang === "hi"
                  ? "कोई फसल लिस्टिंग नहीं मिली। आप सबसे पहले अपनी उपज लिस्ट कर सकते हैं!"
                  : "No produce listings match your criteria. Be the first to list your harvest!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUY QUALITY CERTIFIED FARM INPUTS */}
      {activeTab === "inputs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_INPUTS.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                    {prod.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">★ {prod.rating}</span>
                </div>
                <h3 className="text-base font-bold text-gray-950">{prod.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-emerald-800">₹{prod.price}</span>
                  <span className="text-xs text-gray-500">/ {prod.unit}</span>
                </div>
                <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ✓ {prod.badge}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">{prod.stock}</span>
                <button
                  type="button"
                  onClick={() =>
                    setOrderSuccess(
                      `Inquiry registered for ${prod.name}. The authorized dealer will reach out via SMS/call.`
                    )
                  }
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold transition-all active:scale-95"
                >
                  {lang === "hi" ? "ऑर्डर बुक करें" : "Book Order"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MACHINERY RENTALS */}
      {activeTab === "rentals" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_RENTALS.map((rent) => (
            <div
              key={rent.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    Farm Machinery
                  </span>
                  <span className="text-xs font-bold text-emerald-700">✓ {rent.status}</span>
                </div>
                <h3 className="text-base font-bold text-gray-950">{rent.name}</h3>
                <div className="text-lg font-black text-gray-900">{rent.rate}</div>
                <div className="text-xs text-gray-600">
                  <p className="font-medium text-gray-800">{rent.provider}</p>
                  <p className="text-gray-500">{rent.location}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <a
                  href={`tel:${rent.phone}`}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all"
                >
                  <IconPhone className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "किराए के लिए कॉल करें" : "Call to Rent"}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCE LISTING FORM MODAL */}
      {showAddProduceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  {lang === "hi" ? "फसल बिक्री लिस्टिंग" : "List Farm Produce for Sale"}
                </h3>
                <p className="text-xs text-gray-500">
                  Direct sale to registered buyers with zero broker fee
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProduceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowPreviewModal(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === "hi" ? "किसान का नाम" : "Farmer Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={form.farmerName}
                  onChange={(e) => setForm({ ...form, farmerName: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "फसल" : "Crop"}
                  </label>
                  <select
                    value={form.crop}
                    onChange={(e) => setForm({ ...form, crop: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CROPS_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "किस्म (वैरायटी)" : "Variety"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HD-3226 / Sharbati"
                    value={form.variety}
                    onChange={(e) => setForm({ ...form, variety: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "मात्रा" : "Quantity"}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "इकाई" : "Unit"}
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Quintals">Quintals (क्विंटल)</option>
                    <option value="Tons">Tons (टन)</option>
                    <option value="Kg">Kg (किलोग्राम)</option>
                    <option value="Crates">Crates (क्रेट)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "अपेक्षित मूल्य (₹/इकाई)" : "Expected Price (₹/Unit)"}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2350"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "फ़ोन नंबर" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "गुणवत्ता ग्रेड" : "Quality Grade"}
                  </label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Grade A (Clean & Graded)">Grade A (Clean & Graded)</option>
                    <option value="Grade B (Standard Harvest)">Grade B (Standard Harvest)</option>
                    <option value="Grade C (Processing Quality)">Grade C (Processing Quality)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "hi" ? "स्थान / जिला" : "Location / District"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samana, Patiala"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProduceModal(false)}
                  className="flex-1 rounded-xl border border-gray-300 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95"
                >
                  {lang === "hi" ? "पूर्वावलोकन देखें (Preview)" : "Review Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL BEFORE FINAL POST */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <IconFileText className="w-5 h-5 text-emerald-700" />
              <span>Listing Preview</span>
            </h3>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-sm text-gray-900">
                <span>{form.crop} ({form.variety || "Standard"})</span>
                <span className="text-emerald-700">₹{form.price} / {form.unit}</span>
              </div>
              <p className="text-gray-600">Quantity: <strong>{form.quantity} {form.unit}</strong></p>
              <p className="text-gray-600">Grade: <strong>{form.grade}</strong></p>
              <p className="text-gray-600">Location: <strong>{form.location}</strong></p>
              <p className="text-gray-600">Farmer: <strong>{form.farmerName} ({form.phone})</strong></p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handlePostListing}
                className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800 active:scale-95 shadow-xs"
              >
                {submitting ? "Publishing..." : "Confirm & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
