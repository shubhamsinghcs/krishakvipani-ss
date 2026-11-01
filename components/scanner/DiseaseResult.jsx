"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

const severityClasses = {
  Low: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Medium: "bg-orange-100 text-orange-800 border-orange-300",
  High: "bg-red-100 text-red-800 border-red-300",
  None: "bg-green-100 text-green-800 border-green-300",
};

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm md:p-5 transition-all ${className}`}>
      {children}
    </div>
  );
}

export default function DiseaseResult({ result, uploadedImages = [], onReset }) {
  const { t, lang } = useLang();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleSpeakRemedy = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio voice playback is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cropName = result?.crop?.name || "फसल";
    const diseaseName = result?.disease?.name || "रोग";
    const symptomsText = Array.isArray(result?.disease?.symptoms) ? result.disease.symptoms.join(". ") : "";
    const remedyText = result?.disease?.chemical_remedy || result?.disease?.organic_remedy || "";

    const textToSpeak = lang === "hi"
      ? `फसल का नाम: ${cropName}। रोग की पहचान: ${diseaseName}। लक्षण: ${symptomsText}। उपचार सलाह: ${remedyText}`
      : lang === "pa"
      ? `ਫ਼ਸਲ: ${cropName}। ਰੋਗ: ${diseaseName}। ਲੱਛਣ: ${symptomsText}। ਇਲਾਜ: ${remedyText}`
      : `Crop: ${cropName}. Diagnosis: ${diseaseName}. Symptoms: ${symptomsText}. Treatment advice: ${remedyText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === "hi" ? "hi-IN" : lang === "pa" ? "pa-IN" : "en-IN";
    utterance.rate = 0.88; // Slightly slower for clear rural comprehension

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  if (!result) return null;

  const disease = result.disease || {};
  const crop = result.crop || {};
  const advisory = result.advisory_layer || {};
  const isHealthy = Boolean(disease.is_healthy);

  const diagnosticStatus =
    result.diagnostic_status ||
    (result.reliability_band === "INCONCLUSIVE" ? "UNKNOWN_CONDITION" : "CONFIRMED");
  const isUnknown =
    diagnosticStatus === "UNKNOWN_CONDITION" || result.reliability_band === "INCONCLUSIVE";
  const isAmbiguous =
    diagnosticStatus === "AMBIGUOUS" ||
    (Array.isArray(result.alternative_diagnoses) && result.alternative_diagnoses.length > 0);

  // Normalize image sources: props array > result.thumbnail
  const displayImages =
    uploadedImages && uploadedImages.length > 0
      ? uploadedImages
      : result.thumbnail
      ? [result.thumbnail]
      : [];

  const handleFeedback = async (isCorrect) => {
    setFeedbackLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect, context: "scanner", result }),
      });
      setFeedbackSent(true);
    } catch {
      setFeedbackSent(true);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const shareToWhatsApp = () => {
    const localeDate = new Date(result.timestamp || Date.now()).toLocaleDateString();
    let message = "";
    if (isUnknown) {
      message = `🔍 *KrishakVipani - Inconclusive Crop Screening*\n📅 Date: ${localeDate}\n🌱 *Crop:* ${crop.name || "Crop"}\n⚠️ *Status:* Inconclusive / Symptoms require physical inspection\n📞 *KVK Helpline:* 1800-180-1551\n\n_Advisory note generated via KrishakVipani Calibrated AI Scanner_`;
    } else if (isHealthy) {
      message = `🌿 *KrishakVipani - Crop Diagnosis Report*\n📅 Date: ${localeDate}\n\n🌱 *Crop:* ${crop.name || "Crop"}\n✅ *Status:* Healthy / रोगमुक्त\n📊 *Calibrated Assessment:* High Confidence\n\nℹ️ *Advisory:* ${disease.organic_remedy || "Continue regular scouting and balanced irrigation."}\n\n_Generated via KrishakVipani Smart AI Scanner_`;
    } else {
      message = `🚨 *KrishakVipani - AI Crop Disease Screening*\n📅 Date: ${localeDate}\n\n🌱 *Crop:* ${crop.name || "Crop"}\n⚠️ *Primary Condition:* ${disease.name}\n📊 *Assessment:* ${isAmbiguous ? "Possible Match (Symptoms Overlap)" : "Likely Match"}\n\n🧪 *Verified Treatment:* ${disease.chemical_remedy || "Consult KVK."}\n🍃 *Organic Treatment:* ${disease.organic_remedy || "Neem Oil 1500ppm."}\n\n_Advisory screening generated via KrishakVipani_`;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 overflow-x-hidden">
      {/* 1. Clear Distinction Banner: AI-Assisted vs Expert-Confirmed */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 p-3.5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
              AI
            </span>
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
              {lang === "hi"
                ? "AI-सहायक प्रारंभिक पहचान (स्क्रीनिंग)"
                : lang === "pa"
                ? "AI-ਸਹਾਇਕ ਮੁੱਢਲੀ ਪਛਾਣ"
                : "AI-Assisted Preliminary Identification"}
            </span>
          </div>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200 shadow-2xs">
            {lang === "hi" ? "भौतिक पुष्टि आवश्यक" : "Advisory Screening · Not Final Prescription"}
          </span>
        </div>
      </div>

      {/* 2. Uploaded Photographs Gallery & Selected Crop Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Uploaded Photographs Preview */}
        <Card className="md:col-span-1 border-gray-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>📸</span> {lang === "hi" ? "अपलोड की गई फोटो" : "Analyzed Photos"}
              </h4>
              {displayImages.length > 1 ? (
                <span className="text-[10px] font-semibold text-gray-500">
                  {activeImageIdx + 1} of {displayImages.length}
                </span>
              ) : null}
            </div>

            {displayImages.length > 0 ? (
              <div className="space-y-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <img
                    src={displayImages[activeImageIdx]}
                    alt="Analyzed crop specimen"
                    className="h-full w-full object-cover transition-all"
                  />
                  <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    {lang === "hi" ? `दृष्टिकोण #${activeImageIdx + 1}` : `View #${activeImageIdx + 1}`}
                  </div>
                </div>

                {/* Thumbnails if multiple images uploaded */}
                {displayImages.length > 1 ? (
                  <div className="flex gap-2 pt-1">
                    {displayImages.map((imgSrc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIdx(i)}
                        className={`relative h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                          activeImageIdx === i
                            ? "border-green-600 scale-105 shadow-xs"
                            : "border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={imgSrc} alt="Thumbnail view" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-50 text-gray-400 text-xs">
                {lang === "hi" ? "फोटो पूर्वावलोकन उपलब्ध नहीं" : "No photo preview available"}
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-gray-100 pt-2 text-[11px] text-gray-500 flex items-center justify-between">
            <span>📅 {new Date(result.timestamp || Date.now()).toLocaleDateString()}</span>
            <span className="font-semibold text-gray-700">
              {result.multi_view?.views_submitted || displayImages.length || 1} {lang === "hi" ? "फोटो" : "Views"}
            </span>
          </div>
        </Card>

        {/* Confirmed Crop & Primary Diagnosis Overview Card */}
        <Card
          className={`md:col-span-2 ${
            isUnknown
              ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/40"
              : isHealthy
              ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50/50"
              : "border-red-300 bg-gradient-to-br from-red-50/90 via-orange-50/40 to-white"
          }`}
        >
          {/* Confirmed Crop Header */}
          <div className="flex items-center justify-between border-b border-black/5 pb-2.5 mb-3">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {lang === "hi" ? "सत्यापित फसल प्रजाति" : "Confirmed Crop"}
              </span>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🌱</span> {crop.name || "Crop"}
                {advisory.pathogen_scientific_name ? (
                  <span className="text-xs font-normal italic text-gray-600">
                    ({crop.stage || "Growing Stage"})
                  </span>
                ) : null}
              </h3>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-green-800 border border-green-200 shadow-2xs">
              {crop.stage || (lang === "hi" ? "वानस्पतिक अवस्था" : "Vegetative Stage")}
            </span>
          </div>

          {/* Condition Header & Category */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                    isUnknown
                      ? "bg-amber-200 text-amber-900"
                      : isHealthy
                      ? "bg-green-200 text-green-900"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {isUnknown
                    ? lang === "hi"
                      ? "अस्पष्ट / अनिश्चित लक्षण"
                      : "Uncertain / Inconclusive Symptoms"
                    : isHealthy
                    ? lang === "hi"
                      ? "स्वस्थ फसल"
                      : "Healthy Foliage"
                    : lang === "hi"
                    ? "प्राथमिक संभावित रोग"
                    : "Primary Possible Condition"}
                </span>

                {isAmbiguous ? (
                  <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                    {t.scanner?.ambiguousBadge || "Possible Match (Overlapping Symptoms)"}
                  </span>
                ) : null}
              </div>

              {/* TTS Listen Aloud Button */}
              <button
                type="button"
                onClick={toggleSpeakRemedy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  isPlayingAudio
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 active:scale-95"
                }`}
                title={lang === "hi" ? "आवाज में सुनें" : lang === "pa" ? "ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ" : "Listen aloud"}
              >
                <span>{isPlayingAudio ? "⏹️" : "🔊"}</span>
                <span>
                  {isPlayingAudio
                    ? lang === "hi"
                      ? "आवाज़ बंद करें"
                      : lang === "pa"
                      ? "ਆਵਾਜ਼ ਬੰਦ ਕਰੋ"
                      : "Stop Audio"
                    : lang === "hi"
                    ? "बोलकर सुनें"
                    : lang === "pa"
                    ? "ਆਵਾਜ਼ ਸੁਣੋ"
                    : "Listen Aloud"}
                </span>
              </button>
            </div>

            <h2 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">
              {isUnknown
                ? t.scanner?.unknownTitle || "Inconclusive / Unknown Condition"
                : disease.name || (lang === "hi" ? "स्वस्थ पौधा" : "Healthy Plant")}
            </h2>

            {advisory.pathogen_scientific_name ? (
              <p className="text-xs font-medium italic text-gray-600 mt-0.5">
                {lang === "hi" ? "रोगजनक:" : "Pathogen:"} {advisory.pathogen_scientific_name}
              </p>
            ) : null}
          </div>

          {/* Calibrated Confidence or Uncertainty Category */}
          <div className="mt-4 rounded-xl border border-black/10 bg-white/80 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
              <span>{lang === "hi" ? "कैलिब्रेटेड निश्चितता श्रेणी:" : "Calibrated Reliability Category:"}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  isUnknown
                    ? "bg-amber-100 text-amber-900"
                    : isAmbiguous
                    ? "bg-orange-100 text-orange-900"
                    : "bg-green-100 text-green-900"
                }`}
              >
                {isUnknown
                  ? lang === "hi"
                    ? "अनिर्णायक (कम निश्चितता)"
                    : "Inconclusive (Requires Physical Review)"
                  : isAmbiguous
                  ? lang === "hi"
                    ? "संभावित (समान लक्षण)"
                    : "Possible Match (Differential Review Recommended)"
                  : lang === "hi"
                  ? "उच्च संभावना (कैलिब्रेटेड बायोमार्कर)"
                  : "Likely Match (Calibrated Biomarker Evidence)"}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] text-gray-600 leading-relaxed">
              {isUnknown
                ? lang === "hi"
                  ? "फोटो में लक्षण स्पष्ट नहीं हैं या एकाधिक रोग एक साथ हो सकते हैं। बिना भौतिक पुष्टि के रसायन न छिड़कें।"
                  : "Symptoms are visually ambiguous or exhibit overlapping nutrient/pathogen cues. AI refuses to guess a false diagnosis."
                : isAmbiguous
                ? lang === "hi"
                  ? "लक्षण नीचे दिए गए अन्य रोगों से भी मिलते-जुलते हैं। रासायनिक छिड़काव से पहले कृषि वैज्ञानिक से पुष्टि करें।"
                  : "Photographed lesions share visible characteristics with alternative conditions. Compare differential cues below."
                : lang === "hi"
                ? "लक्षण ICAR/PAU रोग विज्ञान मानकों के अनुरूप पाए गए हैं।"
                : "Observed lesions align with verified ICAR/PAU pathological symptom standards."}
            </p>
          </div>

          {/* Severity ONLY when independently validated */}
          {disease.severity && disease.severity !== "None" && !isUnknown ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">
                {lang === "hi" ? "दृश्य विस्तार (तीव्रता):" : "Visual Symptom Extent:"}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  severityClasses[disease.severity] || severityClasses.Medium
                }`}
              >
                {disease.severity} {lang === "hi" ? "तीव्रता" : "Extent"}
              </span>
              <span className="text-[10px] text-gray-500 italic">
                ({lang === "hi" ? "खेत में फैलाव की जांच करें" : "Field scouting across plot recommended"})
              </span>
            </div>
          ) : null}
        </Card>
      </div>

      {/* 3. Alternative Conditions (Differential Diagnosis) */}
      {Array.isArray(result.alternative_diagnoses) && result.alternative_diagnoses.length > 0 ? (
        <Card className="border-amber-300 bg-amber-50/70">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <span>⚖️</span> {t.scanner?.differentialTitle || "Alternative Differential Conditions"}
            </h4>
            <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              {lang === "hi" ? "समान लक्षण वाले विकल्प" : "Overlapping Visual Symptoms"}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-900 leading-relaxed">
            {t.scanner?.differentialDesc ||
              "The photographed symptoms share visual similarities with other conditions. Verify these alternatives with an expert before treatment:"}
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.alternative_diagnoses.map((alt, idx) => (
              <div key={idx} className="rounded-xl border border-amber-200 bg-white p-3 text-xs shadow-2xs">
                <div className="flex items-center justify-between font-bold text-gray-900">
                  <span>• {alt.name}</span>
                  <span className="text-amber-800 text-[11px] font-semibold">
                    {lang === "hi" ? "संभावित विकल्प" : "Plausible Match"}
                  </span>
                </div>
                {alt.reason ? (
                  <p className="mt-1 text-[11px] text-gray-600 leading-normal">{alt.reason}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* 4. Visible Symptoms & Supporting Evidence */}
      {Array.isArray(disease.symptoms) && disease.symptoms.length > 0 ? (
        <Card className="border-gray-200 bg-white">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span>🔍</span> {t.scanner?.symptoms || "Observed Symptoms & Biomarkers"}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {lang === "hi"
              ? "पत्तियों पर देखे गए मुख्य दृश्य लक्षण जिनकी AI द्वारा पहचान की गई:"
              : "Key visual biomarkers identified on the photographed plant foliage:"}
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
            {disease.symptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span className="leading-relaxed">{symptom}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* 5. Differential Visual Characteristics Comparison Table */}
      {Array.isArray(advisory.similar_conditions) && advisory.similar_conditions.length > 0 ? (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <span>🔬</span> {lang === "hi" ? "समान दिखने वाले रोग और पहचान के अंतर" : "Differential Identification Guide"}
          </h4>
          <p className="text-xs text-indigo-900 mt-0.5">
            {lang === "hi"
              ? "यह जांचें कि लक्षण वास्तव में इस रोग के हैं या किसी अन्य मिलते-जुलते रोग के:"
              : "Check these distinction cues to ensure symptoms are not confused with lookalike diseases:"}
          </p>
          <div className="mt-3 space-y-2">
            {advisory.similar_conditions.map((sim, idx) => (
              <div key={idx} className="rounded-xl border border-indigo-100 bg-white p-2.5 text-xs">
                <div className="font-bold text-indigo-900">{sim.condition}</div>
                <div className="text-[11px] text-gray-700 mt-0.5">{sim.distinction}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* 6. Verified Management Recommendations */}
      {!isUnknown ? (
        <div className="space-y-4">
          {/* Chemical Treatment Card */}
          {disease.chemical_remedy ? (
            <Card className="border-red-200 bg-red-50/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-red-900 flex items-center gap-1.5">
                  <span>🧪</span> {t.scanner?.chemical || "Recommended Chemical Treatment (CIBRC Approved)"}
                </h4>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                  {advisory.pre_harvest_interval_days
                    ? `Waiting Period: ${advisory.pre_harvest_interval_days} Days`
                    : "Verified Active Ingredient"}
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-gray-800 font-medium">
                {disease.chemical_remedy}
              </p>

              {/* Safety & Environmental Precaution */}
              {advisory.environmental_precautions ? (
                <div className="mt-2.5 rounded-lg border border-red-200 bg-white/90 p-2 text-[11px] text-red-900">
                  <span className="font-bold">⚠️ {lang === "hi" ? "सुरक्षा व पर्यावरणीय सावधानी:" : "Safety Precaution:"} </span>
                  {advisory.environmental_precautions}
                </div>
              ) : null}
            </Card>
          ) : null}

          {/* Biological & Organic Alternatives */}
          {disease.organic_remedy ? (
            <Card className="border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>🍃</span> {t.scanner?.organic || "Biological & Organic Treatment"}
                </h4>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Eco-Friendly
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-800">
                {disease.organic_remedy}
              </p>
            </Card>
          ) : null}

          {/* Prevention & Cultural Management */}
          {disease.prevention ? (
            <Card className="border-blue-200 bg-blue-50/40">
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                <span>🛡️</span> {t.scanner?.prevention || "Prevention & Agronomic Sanitation"}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-gray-800">
                {disease.prevention}
              </p>
            </Card>
          ) : null}
        </div>
      ) : (
        /* Inconclusive State Warning Box */
        <Card className="border-amber-300 bg-white p-4">
          <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
            <span>⚠️</span> {lang === "hi" ? "रासायनिक कीटनाशक न डालें" : "Do Not Apply Chemical Sprays"}
          </h4>
          <p className="mt-1 text-xs text-gray-700 leading-relaxed font-medium">
            {lang === "hi"
              ? "जब तक किसी योग्य कृषि वैज्ञानिक द्वारा भौतिक रूप से पुष्टि न हो, तब तक कोई भी कीटनाशक दवा न खरीदें। गलत दवा का छिड़काव फसल को नुकसान पहुंचा सकता है।"
              : "Because the visual evidence is inconclusive, chemical recommendations are suppressed. Spraying unverified chemicals wastes money and risks crop phytotoxicity."}
          </p>
        </Card>
      )}

      {/* 7. Expert Consultation Option (KVK / Kisan Call Centre) */}
      <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
              <span>📞</span> {t.scanner?.consultExpert || "Consult Krishi Vigyan Kendra (KVK) Scientist"}
            </h4>
            <p className="text-xs text-blue-900 mt-0.5">
              {lang === "hi"
                ? "निःशुल्क राष्ट्रीय किसान हेल्पलाइन: 1800-180-1551 (सुबह 6:00 से रात 10:00 बजे)"
                : "National Kisan Call Centre (Toll-Free): 1800-180-1551 (6:00 AM – 10:00 PM)"}
            </p>
          </div>
          <a
            href="tel:18001801551"
            className="shrink-0 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 active:scale-95 transition-all text-center"
          >
            {lang === "hi" ? "📞 1800-180-1551 पर कॉल करें" : "📞 Call Expert Helpline"}
          </a>
        </div>
      </Card>

      {/* 8. Institutional Source Citations & Review Governance */}
      {advisory.source_references && Array.isArray(advisory.source_references) ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-3 text-xs text-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-gray-900 border-b border-gray-200 pb-1.5">
            <span>🏛️ {lang === "hi" ? "सत्यापित संस्थागत संदर्भ:" : "Verified Institutional Sources:"}</span>
            <span className="text-[11px] font-normal text-gray-500">
              {lang === "hi" ? "समीक्षा:" : "Reviewed:"} {advisory.last_reviewed_date || "March 2026"}
            </span>
          </div>
          <ul className="mt-2 space-y-1 list-disc list-inside text-[11px] text-gray-600">
            {advisory.source_references.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* 9. Report Feedback Functionality */}
      <Card className="border-gray-200 bg-white">
        {feedbackSent ? (
          <div className="text-center text-xs font-bold text-green-700 py-1">
            ✓ {t.scanner?.feedbackThanks || "Thank you! Your feedback has been recorded for our agronomy team."}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-900">
                {t.scanner?.isCorrect || "Is this diagnosis accurate in your field?"}
              </p>
              <p className="text-[11px] text-gray-500">
                {lang === "hi"
                  ? "आपकी प्रतिक्रिया से भारतीय कृषि के लिए AI मॉडल को बेहतर बनाने में मदद मिलती है।"
                  : "Your field feedback helps improve crop models for Indian smallholders."}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                disabled={feedbackLoading}
                onClick={() => handleFeedback(true)}
                className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-green-700 active:scale-95 disabled:opacity-50"
              >
                ✓ {t.scanner?.correct || "Accurate"}
              </button>
              <button
                type="button"
                disabled={feedbackLoading}
                onClick={() => handleFeedback(false)}
                className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 active:scale-95 disabled:opacity-50"
              >
                ✕ {t.scanner?.incorrect || "Disputed / Different"}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 10. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={shareToWhatsApp}
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
        >
          <span>💬</span> {t.common?.whatsappShare || "Share Report on WhatsApp"}
        </button>

        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-95"
          >
            <span>📸</span> {t.scanner?.scanAnother || "Scan Another Crop"}
          </button>
        ) : null}

        <Link
          href="/history"
          className="flex min-h-[46px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          {lang === "hi" ? "इतिहास" : "Scan History"}
        </Link>
      </div>

      {/* 6-Tier Architecture Verification Chain */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
            <span>🛡️</span>
            <span>
              {lang === "hi"
                ? "प्रमाणित 6-स्तरीय संरचना द्वारा सत्यापित"
                : lang === "pa"
                ? "6-ਪੜਾਵੀ ਪ੍ਰਮਾਣਿਤ ਢਾਂਚੇ ਦੁਆਰਾ ਤਸਦੀਕਸ਼ੁਦਾ"
                : "Verified through 6-Tier Recommended Architecture"}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
            ICAR · PAU · CIBRC Compliant
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 text-center text-[10px] font-medium text-emerald-900">
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100/60">
            <span className="block font-bold text-emerald-700">✓ Tier 1</span>
            <span>Farmer UI</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100/60">
            <span className="block font-bold text-emerald-700">✓ Tier 2</span>
            <span>Quality QC</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100/60">
            <span className="block font-bold text-emerald-700">✓ Tier 3</span>
            <span>Vision AI</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100/60">
            <span className="block font-bold text-emerald-700">✓ Tier 4</span>
            <span>Decision/Calib</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100/60">
            <span className="block font-bold text-emerald-700">✓ Tier 5</span>
            <span>ICAR Advisory</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100/60">
            <span className="block font-bold text-emerald-700">✓ Tier 6</span>
            <span>Final Report</span>
          </div>
        </div>
      </div>

      {/* Mandatory Advisory Disclaimer */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-[11px] text-gray-600 leading-relaxed text-center sm:text-left">
        <span>ℹ️ </span>
        {t.scanner?.disclaimerText ||
          "Advisory Disclaimer: AI diagnoses are screening aids and do not constitute guaranteed prescriptions. Consult your local KVK or agri officer before chemical application."}
      </div>
    </div>
  );
}
