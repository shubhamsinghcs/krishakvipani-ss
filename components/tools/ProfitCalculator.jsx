"use client";

import { useState } from "react";

export default function ProfitCalculator() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [cost, setCost] = useState("");
  const [result, setResult] = useState(null);

  const calculateProfit = () => {
    if (!crop || !area || !cost) {
      alert("कृपया सभी विवरण दर्ज करें।");
      return;
    }
    
    // Mock calculation logic
    const baseYieldPerAcre = {
      "गेहूं": 20, // Quintals
      "धान": 25,
      "कपास": 8,
      "गन्ना": 300,
    };
    
    const basePricePerQuintal = {
      "गेहूं": 2275,
      "धान": 2183,
      "कपास": 6620,
      "गन्ना": 340,
    };

    const c = crop;
    const y = baseYieldPerAcre[c] || 15;
    const p = basePricePerQuintal[c] || 2000;
    
    const totalYield = y * Number(area);
    const totalRevenue = totalYield * p;
    const estimatedProfit = totalRevenue - Number(cost);

    setResult({
      estimatedProfit: estimatedProfit > 0 ? estimatedProfit : 0,
      totalRevenue,
      mandi: ["खन्ना मंडी", "राजपुरा मंडी", "पटियाला मंडी"][Math.floor(Math.random() * 3)]
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>💰</span> मुनाफ़ा कैलकुलेटर
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">फसल</label>
          <select 
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- चुनें --</option>
            <option value="गेहूं">गेहूं</option>
            <option value="धान">धान</option>
            <option value="कपास">कपास</option>
            <option value="गन्ना">गन्ना</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">क्षेत्रफल (एकड़ में)</label>
          <input 
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="जैसे: 5"
            className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">कुल लागत (₹)</label>
          <input 
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="बीज, खाद, पानी आदि का खर्च"
            className="w-full min-h-[44px] rounded-xl border border-green-200 px-3 bg-white/50 backdrop-blur-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button 
          onClick={calculateProfit}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all mt-2"
        >
          कैलकुलेट करें
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 animate-fade-in">
            <h3 className="font-bold text-green-800 mb-2">अनुमानित रिपोर्ट:</h3>
            <p className="text-sm text-gray-700 flex justify-between">
              <span>कुल आमदनी:</span> 
              <span className="font-semibold">₹{result.totalRevenue.toLocaleString("en-IN")}</span>
            </p>
            <p className="text-sm text-gray-700 flex justify-between mt-1">
              <span>अनुमानित मुनाफ़ा:</span> 
              <span className="font-bold text-green-700 text-lg">₹{result.estimatedProfit.toLocaleString("en-IN")}</span>
            </p>
            <hr className="my-2 border-green-200" />
            <p className="text-sm text-gray-700">
              💡 सबसे अच्छा भाव <span className="font-bold text-green-800">{result.mandi}</span> में मिल सकता है।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
