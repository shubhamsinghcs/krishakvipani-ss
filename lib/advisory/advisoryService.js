/**
 * Agricultural Advisory Service Layer
 * Enforces Institutional Agricultural Grounding:
 * - Prevents LLMs from inventing chemical treatments, pesticide dosages, or schedules.
 * - Injects ICAR / PAU / DPPQS / KVK verified protocols into scan results.
 * - Ensures every chemical recommendation includes CIBRC registered usage, exact dosage,
 *   pre-harvest interval (PHI), safety precautions, and source citations.
 */

import { ADVISORY_REGISTRY, normalizeKey } from "./advisoryRegistry.js";

export class AgronomicAdvisoryService {
  /**
   * Retrieves verified advisory record for a given crop and disease.
   */
  static getAdvisory(cropId, diseaseId) {
    const cKey = normalizeKey(cropId);
    const dKey = normalizeKey(diseaseId);

    const cropAdvisories = ADVISORY_REGISTRY[cKey];
    if (!cropAdvisories) return null;

    // Direct match
    if (cropAdvisories[dKey]) {
      return cropAdvisories[dKey];
    }

    // Fuzzy partial match on disease key (e.g. "early_blight" in "tomato_early_blight")
    for (const key of Object.keys(cropAdvisories)) {
      if (dKey.includes(key) || key.includes(dKey)) {
        return cropAdvisories[key];
      }
    }

    return null;
  }

  /**
   * Enriches a scan result with authoritative institutional advisory.
   * Strips any untrusted LLM-generated chemicals and injects CIBRC-registered protocols.
   */
  static enrichScanResult(scanResult, requestedLang = "en") {
    const lang = ["en", "hi", "pa"].includes(requestedLang) ? requestedLang : "en";
    if (!scanResult || !scanResult.crop || !scanResult.disease) {
      return scanResult;
    }

    const cropId = scanResult.crop.id || scanResult.crop.name;
    const diseaseId = scanResult.disease.id || scanResult.disease.name;

    const advisory = this.getAdvisory(cropId, diseaseId);

    // If disease is "Healthy" or unknown
    const isHealthy = Boolean(
      scanResult.disease.is_healthy ||
      String(scanResult.disease.name || "").toLowerCase().includes("healthy") ||
      String(scanResult.disease.name || "").includes("स्वस्थ") ||
      String(scanResult.disease.name || "").includes("ਤੰਦਰੁਸਤ")
    );

    if (isHealthy) {
      return {
        ...scanResult,
        advisory_layer: {
          is_verified: true,
          authority: "ICAR & PAU Extension Advisory Standards",
          cibrc_mandate: "No chemical fungicides or insecticides required for healthy crops.",
          last_reviewed: "2026-03-15",
          source_references: [
            "ICAR Good Agricultural Practices (GAP) Guidelines 2025",
            "PAU Package of Practices for Integrated Pest & Nutrient Management",
          ],
        },
      };
    }

    if (!advisory) {
      // Unvalidated or unverified disease: STRICT SAFETY GUARD
      // Suppress any invented chemical remedy to protect the farmer
      return {
        ...scanResult,
        diagnostic_status: "AMBIGUOUS",
        reliability_band: "MODERATE",
        requires_expert_confirmation: true,
        disease: {
          ...scanResult.disease,
          chemical_remedy:
            lang === "hi"
              ? "सटीक रोग पुष्टि होने तक कोई रासायनिक कीटनाशक न डालें। निकटतम कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"
              : lang === "pa"
              ? "ਪੂਰੀ ਤਸੱਲੀ ਹੋਣ ਤੱਕ ਕੋਈ ਰਸਾਇਣਕ ਦਵਾਈ ਨਾ ਛਿੜਕੋ। ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।"
              : "Do not apply chemical pesticides without physical diagnostic confirmation. Consult your local KVK agronomist.",
        },
        advisory_layer: {
          is_verified: false,
          warning: "No CIBRC / ICAR verified label protocol matched for this unvalidated condition.",
          kvk_helpline: "1800-180-1551 (Kisan Call Centre)",
          action: "PHYSICAL_EXPERT_INSPECTION_REQUIRED",
        },
      };
    }

    // Verified Advisory Match: Replace LLM text with verified institutional facts
    const chem = advisory.treatment.chemical;
    const bio = advisory.treatment.biological_organic;

    const formattedChemicalRemedy =
      lang === "hi"
        ? `[CIBRC स्वीकृत] सक्रिय घटक: ${chem.active_ingredient}। अनुमोदित मात्रा: ${chem.dosage_per_litre} (${chem.dosage_per_acre})। प्रतीक्षा अवधि (PHI): ${chem.pre_harvest_interval_days} दिन। सुरक्षा: ${chem.safety_precautions.ppe}`
        : lang === "pa"
        ? `[CIBRC ਪ੍ਰਵਾਨਿਤ] ਦਵਾਈ: ${chem.active_ingredient}। ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀ ਮਾਤਰਾ: ${chem.dosage_per_litre} (${chem.dosage_per_acre})। ਤੁੜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਦਾ ਵਕਫ਼ਾ (PHI): ${chem.pre_harvest_interval_days} ਦਿਨ। ਸੁਰੱਖਿਆ: ${chem.safety_precautions.ppe}`
        : `[CIBRC / DPPQS Approved] Active Ingredient: ${chem.active_ingredient}. Approved Dosage: ${chem.dosage_per_litre} (${chem.dosage_per_acre}). Waiting Period (PHI): ${chem.pre_harvest_interval_days} days. Safety: ${chem.safety_precautions.ppe}`;

    const formattedOrganicRemedy =
      lang === "hi"
        ? `जैव नियंत्रण: ${bio.bio_agent} @ ${bio.dosage}। वानस्पतिक विकल्प: ${bio.botanical}`
        : lang === "pa"
        ? `ਜੈਵਿਕ ਉਪਚਾਰ: ${bio.bio_agent} @ ${bio.dosage}। ਬਨਸਪਤੀ ਨਿੰਮ ਘੋਲ: ${bio.botanical}`
        : `Biological Control: ${bio.bio_agent} @ ${bio.dosage}. Botanical Option: ${bio.botanical}`;

    const enrichedResult = {
      ...scanResult,
      disease: {
        ...scanResult.disease,
        name: advisory.disease_name[lang] || advisory.disease_name.en,
        chemical_remedy: formattedChemicalRemedy,
        organic_remedy: formattedOrganicRemedy,
        prevention: advisory.prevention[lang] || advisory.prevention.en,
      },
      advisory_layer: {
        is_verified: true,
        pathogen_scientific_name: advisory.pathogen,
        visual_characteristics: advisory.visual_characteristics[lang] || advisory.visual_characteristics.en,
        similar_conditions: advisory.similar_conditions,
        ipm_recommendations: advisory.ipm[lang] || advisory.ipm.en,
        cibrc_label_approval: chem.cibrc_label,
        pre_harvest_interval_days: chem.pre_harvest_interval_days,
        toxicity_class: chem.safety_precautions.toxicity_class,
        environmental_precautions: chem.safety_precautions.environment,
        source_references: advisory.source_references,
        last_reviewed_date: advisory.last_reviewed_date,
        review_authority: advisory.review_authority,
        kvk_helpline: "1800-180-1551 (Kisan Call Centre)",
      },
    };

    return enrichedResult;
  }
}
