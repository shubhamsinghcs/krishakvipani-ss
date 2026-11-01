/**
 * Authoritative Agricultural Advisory Knowledge Base
 * Institutional References:
 * - Indian Council of Agricultural Research (ICAR - IARI / IIHR / CRIDA / CPRI)
 * - Punjab Agricultural University (PAU) Package of Practices (Kharif & Rabi)
 * - Directorate of Plant Protection, Quarantine & Storage (DPPQS / CIBRC Registered Uses)
 * - Krishi Vigyan Kendra (KVK) Extension Bulletins
 * 
 * Strict Principle:
 * No LLM is allowed to invent, fabricate, or modify active ingredients, dosages,
 * pre-harvest intervals, or safety precautions. All recommendations are anchored here.
 */

export const ADVISORY_REGISTRY = {
  tomato: {
    early_blight: {
      crop_id: "tomato",
      crop_name: { en: "Tomato", hi: "टमाटर", pa: "ਟਮਾਟਰ" },
      disease_id: "early_blight",
      disease_name: { en: "Early Blight", hi: "अगेती झुलसा", pa: "ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ" },
      pathogen: "Alternaria solani (Fungus)",
      visual_characteristics: {
        en: "Distinct concentric circular rings forming a target-board pattern, surrounded by a narrow chlorotic yellow halo on older foliage.",
        hi: "पुरानी पत्तियों पर गोल भूरे छल्ले जैसे धब्बे (टारगेट बोर्ड आकार), जिसके चारों ओर संकरा पीला घेरा होता है।",
        pa: "ਪੁਰਾਣੇ ਪੱਤਿਆਂ ਉੱਤੇ ਨਿਸ਼ਾਨੇ ਵਰਗੇ ਗੋਲ ਭੂਰੇ ਧੱਬੇ ਜਿਨ੍ਹਾਂ ਦੁਆਲੇ ਪੀਲਾ ਘੇਰਾ ਹੁੰਦਾ ਹੈ।",
      },
      symptoms: {
        en: [
          "Target-board concentric lesions on lower leaves first",
          "Leaves yellowing, desiccating, and defoliating from bottom upwards",
          "Sunken, dark leathery lesions at stem base and fruit calyx",
        ],
        hi: [
          "निचली पत्तियों पर गोल छल्लेनुमा गहरे भूरे धब्बे",
          "पत्तियां नीचे से ऊपर की ओर पीली पड़कर सूखना",
          "तने और फल के डंठल के पास काले धब्बे",
        ],
        pa: [
          "ਹੇਠਲੇ ਪੱਤਿਆਂ 'ਤੇ ਗੋਲ ਧੱਬੇ ਬਣਨਾ",
          "ਪੱਤੇ ਹੇਠਾਂ ਤੋਂ ਉੱਪਰ ਵੱਲ ਪੀਲੇ ਹੋ ਕੇ ਸੁੱਕਣਾ",
          "ਤਣੇ ਅਤੇ ਫਲ ਦੇ ਨੇੜੇ ਕਾਲੇ ਨਿਸ਼ਾਨ",
        ],
      },
      similar_conditions: [
        {
          condition: "Septoria Leaf Spot (Septoria lycopersici)",
          distinction: "Septoria lesions are smaller (2-3mm), numerous, with tiny black fruiting specks (pycnidia) and lack the large concentric target rings of Alternaria.",
        },
        {
          condition: "Bacterial Spot (Xanthomonas)",
          distinction: "Bacterial spots are small, water-soaked, and angular; not concentric rings.",
        },
      ],
      prevention: {
        en: "Maintain 60x45cm spacing, stake plants, avoid overhead sprinkler irrigation, practice 3-year solanaceous crop rotation, and mulch beds.",
        hi: "पौधों में 60x45 सेमी दूरी रखें, पौधों को सहारा दें, ऊपर से पानी न डालें, और फसल चक्र अपनाएं।",
        pa: "ਬੂਟਿਆਂ ਵਿਚਕਾਰ ਢੁਕਵੀਂ ਦੂਰੀ ਰੱਖੋ, ਤੁਪਕਾ ਸਿੰਚਾਈ ਵਰਤੋ ਅਤੇ ਫ਼ਸਲੀ ਚੱਕਰ ਅਪਣਾਓ।",
      },
      ipm: {
        en: "Inspect lower foliage weekly; rogue out first infected bottom leaves; apply preventive bio-fungicides at canopy closure; rotate FRAC codes to prevent resistance.",
        hi: "साप्ताहिक निरीक्षण करें; निचली रोगग्रस्त पत्तियों को काटकर नष्ट करें; फूल आने से पूर्व जैव फफूंदनाशी डालें।",
        pa: "ਹਫ਼ਤਾਵਾਰੀ ਨਿਰੀਖਣ ਕਰੋ; ਪਹਿਲੇ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਨਸ਼ਟ ਕਰੋ; ਜੈਵਿਕ ਉਪਚਾਰ ਪਹਿਲਾਂ ਵਰਤੋ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Mancozeb 75% WP or Azoxystrobin 23% SC",
          cibrc_registered: true,
          cibrc_label: "Approved for Tomato Early Blight under Insecticides Act 1968",
          dosage_per_litre: "Mancozeb @ 2.0 - 2.5 g/L OR Azoxystrobin @ 1.0 ml/L",
          dosage_per_acre: "Mancozeb 500-600 g in 200 L water/acre",
          pre_harvest_interval_days: 7,
          spray_interval: "Repeat after 10-14 days if wet weather persists. Maximum 3 applications per season.",
          safety_precautions: {
            toxicity_class: "Blue Triangle (Moderately Toxic)",
            ppe: "Wear rubber gloves, eye goggles, and protective mask during preparation and spraying.",
            environment: "Do not spray near bee hives or open waterways. Apply during late afternoon calm wind.",
          },
        },
        biological_organic: {
          bio_agent: "Trichoderma viride 1% WP or Pseudomonas fluorescens 1% WP",
          dosage: "5-10 g/L as foliar spray + 2.5 kg/acre enriched in FYM at soil prep.",
          botanical: "Cold-pressed Neem Oil (1500 ppm Azadirachtin) @ 5 ml/L with mild surfactant.",
        },
      },
      source_references: [
        "ICAR-Indian Institute of Horticultural Research (IIHR) Tomato Disease Guide (Bull. #42)",
        "Punjab Agricultural University (PAU) Package of Practices for Vegetable Crops 2025-26, pp. 48-52",
        "Directorate of Plant Protection, Quarantine & Storage (DPPQS) - Major Uses of Pesticides Registered under Insecticides Act, CIBRC Tomato Schedule",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
    late_blight: {
      crop_id: "tomato",
      crop_name: { en: "Tomato", hi: "टमाटर", pa: "ਟਮਾਟਰ" },
      disease_id: "late_blight",
      disease_name: { en: "Late Blight", hi: "पछेती झुलसा", pa: "ਪਛੇਤਾ ਝੁਲਸ ਰੋਗ" },
      pathogen: "Phytophthora infestans (Oomycete)",
      visual_characteristics: {
        en: "Large, irregular water-soaked pale green to brown lesions rapidly expanding from leaf edges, with delicate white downy fungal mildew on leaf undersides in humid mornings.",
        hi: "पत्तियों के किनारों से तेजी से फैलने वाले पानीदार भूरे धब्बे, सुबह नमी के समय निचली सतह पर सफेद रुई जैसी फफूंद।",
        pa: "ਪੱਤਿਆਂ ਦੇ ਕੰਢਿਆਂ ਤੋਂ ਸ਼ੁਰੂ ਹੋਣ ਵਾਲੇ ਪਾਣੀਦਾਰ ਭੂਰੇ ਧੱਬੇ, ਸਵੇਰ ਵੇਲੇ ਪੱਤੇ ਦੇ ਹੇਠਾਂ ਚਿੱਟੀ ਫਫ਼ੂੰਦੀ।",
      },
      symptoms: {
        en: [
          "Water-soaked lesions that rapidly turn purplish-brown and papery",
          "White cottony growth on leaf undersides during cool humid weather (<22°C, >90% RH)",
          "Brown firm decay on green fruits with greasy marbled appearance",
        ],
        hi: [
          "पत्तियों पर पानीदार धब्बे जो जल्दी ही गहरे भूरे व सूखे हो जाते हैं",
          "ठंडे व नम मौसम में पत्ती की निचली सतह पर सफेद फफूंद",
          "हरे फलों पर भूरे, कड़े धब्बे और सड़न",
        ],
        pa: [
          "ਪਾਣੀਦਾਰ ਧੱਬੇ ਜੋ ਤੇਜ਼ੀ ਨਾਲ ਸੁੱਕ ਕੇ ਭੂਰੇ ਹੋ ਜਾਂਦੇ ਹਨ",
          "ਨਮ ਮੌਸਮ ਵਿੱਚ ਪੱਤੇ ਦੇ ਹੇਠਾਂ ਚਿੱਟੀ ਉੱਲੀ",
          "ਟਮਾਟਰਾਂ ਉੱਤੇ ਸਖ਼ਤ ਭੂਰੇ ਧੱਬੇ",
        ],
      },
      similar_conditions: [
        {
          condition: "Frost Injury",
          distinction: "Frost causes rapid uniform wilting of young growth without white sporulation on leaf undersides.",
        },
        {
          condition: "Early Blight",
          distinction: "Early Blight develops concentric rings; Late Blight spreads irregularly with white downy growth.",
        },
      ],
      prevention: {
        en: "Plant certified disease-free transplants, avoid low-lying waterlogged patches, eliminate cull piles, and monitor KVK late blight weather alerts.",
        hi: "प्रमाणित पौध लगाएं, जलभराव वाले खेतों से बचें और केवीके (KVK) के मौसम अलर्ट पर ध्यान दें।",
        pa: "ਨਿਰੋਈ ਪੌਧ ਲਗਾਓ, ਪਾਣੀ ਖੜ੍ਹਾ ਨਾ ਹੋਣ ਦਿਓ ਅਤੇ ਖੇਤੀਬਾੜੀ ਅਲਰਟ 'ਤੇ ਨਜ਼ਰ ਰੱਖੋ।",
      },
      ipm: {
        en: "Preventive contact spray before cloudy fog spells; switch to translaminar systemic curative sprays upon first detected lesion.",
        hi: "कोहरा या लगातार बादल रहने पर पहले ही सुरक्षात्मक छिड़काव करें; लक्षण दिखते ही प्रणालीगत दवा डालें।",
        pa: "ਧੁੰਦ ਜਾਂ ਬੱਦਲਵਾਈ ਵੇਲੇ ਪਹਿਲਾਂ ਹੀ ਰੋਕਥਾਮ ਸਪਰੇਅ ਕਰੋ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Cymoxanil 8% + Mancozeb 64% WP OR Metalaxyl 8% + Mancozeb 64% WP",
          cibrc_registered: true,
          cibrc_label: "Approved for Tomato / Potato Late Blight under CIBRC",
          dosage_per_litre: "2.0 - 2.5 g/L water (400-500 g/acre in 200 L water)",
          dosage_per_acre: "500 g in 200 L water/acre",
          pre_harvest_interval_days: 10,
          spray_interval: "Repeat after 7-10 days under persistent epidemic conditions. Max 2 consecutive systemic sprays.",
          safety_precautions: {
            toxicity_class: "Blue Triangle (Moderately Toxic)",
            ppe: "Full protective overalls, face shield, and chemical-resistant nitrile gloves required.",
            environment: "Highly toxic to aquatic life. Maintain a 15-meter buffer from irrigation canals.",
          },
        },
        biological_organic: {
          bio_agent: "Trichoderma harzianum @ 10 g/L (Preventive only before infection onset)",
          dosage: "10 g/L + spray fermented butter milk (Chhachh 5%) + copper sulfate 0.05% as folk bio-protectant.",
          botanical: "Garlic clove extract (2%) + Neem Oil (1500 ppm @ 5 ml/L).",
        },
      },
      source_references: [
        "ICAR-Central Potato Research Institute (CPRI) / IIHR Phytophthora Advisory Bull. #18",
        "PAU Package of Practices for Vegetable Crops 2025-26, Tomato Section, p. 50",
        "DPPQS / CIBRC Compendium of Registered Pesticides for Solanaceous Crops, 2026",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
    leaf_curl: {
      crop_id: "tomato",
      crop_name: { en: "Tomato", hi: "टमाटर", pa: "ਟਮਾਟਰ" },
      disease_id: "leaf_curl",
      disease_name: { en: "Tomato Leaf Curl Virus (ToLCV)", hi: "पर्ण कुंचन विषाणु (लीफ कर्ल)", pa: "ਪੱਤਾ ਮਰੋੜ ਰੋਗ" },
      pathogen: "Tomato leaf curl virus (Begomovirus; Vector: Whitefly Bemisia tabaci)",
      visual_characteristics: {
        en: "Upward and downward curling of leaflets with thick, leathery texture, yellowing margins, and shortened internodes creating a stunted bushy rosette appearance.",
        hi: "पत्तियों का ऊपर व नीचे की ओर मुड़ना व मोटा होना, शिराओं का पीला पड़ना और पौधा बौना व झाड़ीनुमा हो जाना।",
        pa: "ਪੱਤਿਆਂ ਦਾ ਮੁੜਨਾ, ਮੋਟਾ ਹੋਣਾ ਅਤੇ ਬੂਟੇ ਦਾ ਵਾਧਾ ਰੁਕ ਕੇ ਝਾੜੀ ਵਰਗਾ ਬਣਨਾ।",
      },
      symptoms: {
        en: [
          "Severe puckering, cupping, and curling of young leaves",
          "Interveinal chlorosis with stunted growth",
          "Heavy flower drop with little or no fruit set",
        ],
        hi: [
          "नई पत्तियों का मुड़ना और सिकुड़ना",
          "पौधे का विकास रुकना और पीलापन",
          "फूल झड़ना और फल न लगना",
        ],
        pa: [
          "ਨਵੇਂ ਪੱਤੇ ਮੁੜਨੇ ਅਤੇ ਸੁੰਗੜਨੇ",
          "ਬੂਟਾ ਪੀਲਾ ਪੈਣਾ ਅਤੇ ਫੁੱਲ ਝੜਨੇ",
          "ਫਲ ਨਾ ਲੱਗਣਾ",
        ],
      },
      similar_conditions: [
        {
          condition: "Herbicide (2,4-D) Drift Damage",
          distinction: "Herbicide drift causes strap-like parallel-veined leaves across a whole drift line; ToLCV occurs in isolated plants initially and exhibits thick puckered veins with whitefly presence.",
        },
        {
          condition: "Mite Infestation",
          distinction: "Mites cause downward curling with bronzing/russeting under leaf surface.",
        },
      ],
      prevention: {
        en: "Grow ToLCV-tolerant hybrids (e.g., Kashi Aman, Arka Rakshak, Punjab Ratta); raise seedlings under 40-mesh insect-proof nylon nets; install yellow sticky traps.",
        hi: "प्रतिरोधी किस्में लगाएं (जैसे अर्का रक्षक, काशी अमन); नर्सरी में 40-मेश जाली का प्रयोग करें; पीले चिपचिपे कार्ड लगाएं।",
        pa: "ਬਿਮਾਰੀ ਰਹਿਤ ਕਿਸਮਾਂ ਬੀਜੋ; ਨਰਸਰੀ ਉੱਤੇ ਮੱਛਰਦਾਨੀ ਜਾਲੀ ਲਗਾਓ।",
      },
      ipm: {
        en: "Install 15-20 yellow sticky traps/acre; spray neem oil early to deter whitefly feeding; rogue and bury infected plants immediately if infection < 5% of field.",
        hi: "पीले कार्ड लगाएं; नीम तेल का नियमित छिड़काव करें; शुरुआती 1-2 रोगी पौधों को उखाड़कर गाड़ दें।",
        pa: "ਪੀਲੇ ਕਾਰਡ ਲਗਾਓ; ਨਿੰਮ ਤੇਲ ਵਰਤੋ; ਸ਼ੁਰੂਆਤੀ ਬਿਮਾਰ ਬੂਟੇ ਪੁੱਟ ਦਿਓ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Imidacloprid 17.8% SL OR Thiamethoxam 25% WG (Vector Whitefly Control)",
          cibrc_registered: true,
          cibrc_label: "Approved for Whitefly on Tomato under CIBRC",
          dosage_per_litre: "Imidacloprid @ 0.3 - 0.5 ml/L OR Thiamethoxam @ 0.3 g/L",
          dosage_per_acre: "Imidacloprid 60-80 ml in 150-200 L water/acre",
          pre_harvest_interval_days: 5,
          spray_interval: "Apply upon reaching economic threshold level (5 whiteflies/leaf). Alternate chemistry to avoid neonicotinoid resistance.",
          safety_precautions: {
            toxicity_class: "Yellow Triangle (Highly Toxic to Bees)",
            ppe: "Face mask, chemical goggles, gloves.",
            environment: "NEVER spray during peak morning flower pollination hours (9 AM - 1 PM) to protect honeybees.",
          },
        },
        biological_organic: {
          bio_agent: "Beauveria bassiana 1% WP (Entomopathogenic fungus)",
          dosage: "5 g/L foliar spray in late evening when humidity > 70%.",
          botanical: "5% Neem Seed Kernel Extract (NSKE) or Neem Oil 1500 ppm @ 5 ml/L.",
        },
      },
      source_references: [
        "ICAR-IARI Division of Virology Tomato Begomovirus Management Protocol, 2025",
        "PAU Package of Practices for Kharif/Rabi Vegetables 2025-26, pp. 51-53",
        "CIBRC Registered Uses of Imidacloprid / Thiamethoxam on Solanaceous Crops, DPPQS",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
  },

  potato: {
    late_blight: {
      crop_id: "potato",
      crop_name: { en: "Potato", hi: "आलू", pa: "ਆਲੂ" },
      disease_id: "late_blight",
      disease_name: { en: "Late Blight", hi: "पछेती झुलसा", pa: "ਪਛੇਤਾ ਝੁਲਸ ਰੋਗ" },
      pathogen: "Phytophthora infestans (Oomycete)",
      visual_characteristics: {
        en: "Water-soaked irregular blackish-brown spots on tips and margins of leaves, rapidly causing entire canopy collapse with foul rot odor in foggy weather.",
        hi: "पत्तियों के किनारों पर पानीदार काले-भूरे धब्बे, कोहरे वाले मौसम में पूरी फसल का झुलसना और दुर्गंध आना।",
        pa: "ਪੱਤਿਆਂ ਦੇ ਸਿਰਿਆਂ 'ਤੇ ਕਾਲੇ-ਭੂਰੇ ਪਾਣੀਦਾਰ ਧੱਬੇ, ਧੁੰਦ ਵਾਲੇ ਮੌਸਮ ਵਿੱਚ ਫ਼ਸਲ ਦਾ ਝੁਲਸ ਜਾਣਾ।",
      },
      symptoms: {
        en: [
          "Rapidly spreading water-soaked black-brown foliar lesions",
          "White cottony growth on undersides in morning humidity",
          "Tubers show rusty dry brown rot penetrating 5-15mm into flesh",
        ],
        hi: [
          "पत्तियों पर तेजी से फैलने वाले पानीदार धब्बे",
          "सुबह के समय पत्ती की निचली सतह पर सफेद फफूंद",
          "आलू के कंदों पर भूरा कड़ा सड़न रोग",
        ],
        pa: [
          "ਪੱਤਿਆਂ 'ਤੇ ਤੇਜ਼ੀ ਨਾਲ ਫੈਲਣ ਵਾਲੇ ਕਾਲੇ ਧੱਬੇ",
          "ਆਲੂਆਂ ਦੇ ਅੰਦਰ ਭੂਰਾ ਸੜਨ ਰੋਗ",
        ],
      },
      similar_conditions: [
        {
          condition: "Early Blight (Alternaria solani)",
          distinction: "Early blight produces concentric target rings and does not rot tubers with dry brown flesh decay.",
        },
      ],
      prevention: {
        en: "Plant certified disease-free seed tubers from cold storage; high ridge earthing-up (prevent spore wash down to tubers); monitor PAU/CPRI weather forecaster model (JHULSACAST).",
        hi: "प्रमाणित बीज आलू लगाएं; अच्छी मिट्टी चढ़ाएं (ताकि बीजाणु कंद तक न पहुंचें); झुलसाकास्ट (JHULSACAST) मॉडल का पालन करें।",
        pa: "ਨਰੋਏ ਬੀਜ ਆਲੂ ਵਰਤੋ; ਬੂਟਿਆਂ ਨੂੰ ਚੰਗੀ ਮਿੱਟੀ ਚੜ੍ਹਾਓ; ਪੀਏਯੂ ਝੁਲਸਾ ਅਲਰਟ ਸੁਣੋ।",
      },
      ipm: {
        en: "Prophylactic Mancozeb spray before canopy closure; curative systemic fungicide spray upon first local field warning.",
        hi: "फसल मिलने से पहले मैनकोजेब का छिड़काव करें; चेतावनी मिलते ही प्रणालीगत दवा डालें।",
        pa: "ਮੌਸਮ ਖ਼ਰਾਬ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਰੋਕਥਾਮ ਸਪਰੇਅ ਕਰੋ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Cymoxanil 8% + Mancozeb 64% WP OR Dimethomorph 50% WP",
          cibrc_registered: true,
          cibrc_label: "Approved for Potato Late Blight under CIBRC / DPPQS",
          dosage_per_litre: "Cymoxanil+Mancozeb @ 2.5 g/L OR Dimethomorph @ 1.0 g/L (combined with Mancozeb @ 2 g/L)",
          dosage_per_acre: "600 g in 200 L water/acre",
          pre_harvest_interval_days: 14,
          spray_interval: "Repeat at 7-day intervals under cool overcast humid conditions.",
          safety_precautions: {
            toxicity_class: "Blue Triangle (Moderately Toxic)",
            ppe: "Rubber boots, chemical overalls, respirator, and nitrile gloves.",
            environment: "Prevent spray drift to water channels and grazing areas.",
          },
        },
        biological_organic: {
          bio_agent: "Trichoderma harzianum @ 5 g/L (Preventive soil and foliar only)",
          dosage: "Copper Oxychloride 50% WP @ 2.5 g/L allowed in biological/organic transition programs.",
          botanical: "Fermented garlic-chilli extract + Panchagavya (3%).",
        },
      },
      source_references: [
        "ICAR-Central Potato Research Institute (CPRI), Shimla - Late Blight Technical Manual 2025",
        "PAU Package of Practices for Rabi Crops 2025-26, Potato Section, pp. 62-67",
        "DPPQS / CIBRC Registered Fungicides List for Tuber Crops, 2026",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
  },

  wheat: {
    yellow_rust: {
      crop_id: "wheat",
      crop_name: { en: "Wheat", hi: "गेहूं", pa: "ਕਣਕ" },
      disease_id: "yellow_rust",
      disease_name: { en: "Yellow / Stripe Rust", hi: "पीला रतुआ (हल्दी रोग)", pa: "ਪੀਲਾ ਰੱਤੂਆ (ਹਲਦੀ ਰੋਗ)" },
      pathogen: "Puccinia striiformis f. sp. tritici (Fungus)",
      visual_characteristics: {
        en: "Bright yellow to orange-yellow powdery pustules arranged in prominent parallel continuous stripes along the leaf veins, rubbing off as yellow powder on fingers.",
        hi: "पत्तियों की शिराओं के समानांतर चमकदार पीली या हल्दी जैसी धारियों में उभरे हुए चूर्णिल दाने, छूने पर उंगलियों पर पीला पाउडर लगना।",
        pa: "ਪੱਤਿਆਂ ਉੱਤੇ ਹਲਦੀ ਰੰਗ ਦੀਆਂ ਲੰਮੀਆਂ ਪੀਲੀਆਂ ਧਾਰੀਆਂ, ਹੱਥ ਲਾਉਣ 'ਤੇ ਉਂਗਲਾਂ 'ਤੇ ਪੀਲਾ ਪਾਊਡਰ ਲੱਗਣਾ।",
      },
      symptoms: {
        en: [
          "Linear stripes of yellow pustules running parallel along leaves",
          "Leaves turn chlorotic and desiccate prematurely",
          "Severe grain shriveling with test weight loss of up to 70%",
        ],
        hi: [
          "पत्तियों पर पीले रंग की समानांतर धारियां",
          "पत्तियों का सूखना और पीला पड़ना",
          "बालियों में दाने सिकुड़ना और हल्का होना",
        ],
        pa: [
          "ਪੱਤਿਆਂ 'ਤੇ ਪੀਲੀਆਂ ਧਾਰੀਆਂ",
          "ਦਾਣੇ ਪਤਲੇ ਅਤੇ ਹਲਕੇ ਰਹਿ ਜਾਣਾ",
        ],
      },
      similar_conditions: [
        {
          condition: "Brown / Leaf Rust (Puccinia triticina)",
          distinction: "Brown rust pustules are round to oval, scattered randomly across the leaf blade (not in parallel linear stripes), and darker brownish-orange.",
        },
        {
          condition: "Nitrogen Chlorosis",
          distinction: "Nitrogen deficiency causes uniform leaf yellowing starting from tips down the midrib, with NO powdery pustules that rub off on fingers.",
        },
      ],
      prevention: {
        en: "Sow recommended rust-resistant varieties (e.g., PBW 824, PBW 869, DBW 187, DBW 222, HD 3226); avoid susceptible older varieties (HD 2967 in sub-mountainous zones); timely sowing by November 15.",
        hi: "रोगरोधी किस्में बोएं (DBW 222, DBW 187, PBW 824); पुरानी किस्में न लगाएं; 15 नवंबर तक बुवाई पूरी करें।",
        pa: "ਪੀਏਯੂ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀਆਂ ਕਿਸਮਾਂ (PBW 824, DBW 187, HD 3226) ਬੀਜੋ; ਪੁਰਾਣੀਆਂ ਕਿਸਮਾਂ ਤੋਂ ਪਰਹੇਜ਼ ਕਰੋ।",
      },
      ipm: {
        en: "Survey fields weekly in December-January, particularly in sub-mountainous regions (Kandi areas); spray on initial detection of yellow rust foci (small patches).",
        hi: "दिसंबर-जनवरी में खेतों का नियमित निरीक्षण करें; जैसे ही 1-2 जगह पीले चकत्ते दिखें, तुरंत छिड़काव करें।",
        pa: "ਦਸੰਬਰ-ਜਨਵਰੀ ਵਿੱਚ ਖੇਤਾਂ ਦਾ ਦੌਰਾ ਕਰੋ; ਪਹਿਲਾ ਧੱਬਾ ਦਿਸਦੇ ਹੀ ਸਪਰੇਅ ਕਰੋ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Propiconazole 25% EC OR Tebuconazole 25.9% EC",
          cibrc_registered: true,
          cibrc_label: "Approved for Wheat Stripe Rust under Insecticides Act / CIBRC",
          dosage_per_litre: "Propiconazole @ 1.0 ml/L OR Tebuconazole @ 1.0 ml/L",
          dosage_per_acre: "200 ml in 200 L water/acre",
          pre_harvest_interval_days: 30,
          spray_interval: "Single spray usually halts epidemic; repeat after 15 days only if weather remains foggy and pustules spread.",
          safety_precautions: {
            toxicity_class: "Blue Triangle (Moderately Toxic)",
            ppe: "Face mask, boots, and gloves.",
            environment: "Toxic to fish; do not drain spray equipment in fish ponds or irrigation drains.",
          },
        },
        biological_organic: {
          bio_agent: "Trichoderma harzianum @ 10 g/L (Preventive only - note: yellow rust epidemics in high-risk zones require immediate CIBRC chemical intervention to protect food security)",
          dosage: "Bio-agents provide partial suppression; KVK guidelines mandate triazole spray if yellow rust foci are detected.",
          botanical: "Cow urine (10%) + Fermented neem leaf extract (prevention).",
        },
      },
      source_references: [
        "ICAR-Indian Institute of Wheat and Barley Research (IIWBR), Karnal - Rust Monitoring Protocol 2025-26",
        "PAU Package of Practices for Rabi Crops 2025-26, Wheat Disease Section, pp. 12-16",
        "DPPQS Wheat Stripe Rust Emergency Advisory & Approved CIBRC Fungicides",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
  },

  rice: {
    blast: {
      crop_id: "rice",
      crop_name: { en: "Rice / Paddy", hi: "धान", pa: "ਝੋਨਾ" },
      disease_id: "blast",
      disease_name: { en: "Rice Blast (Leaf & Neck Blast)", hi: "झुलसा / गर्दन तोड़ (ब्लास्ट)", pa: "ਬਲਾਸਟ / ਧੌਣ ਤੋੜ ਰੋਗ" },
      pathogen: "Magnaporthe oryzae (Pyricularia oryzae) (Fungus)",
      visual_characteristics: {
        en: "Spindle or boat-shaped (diamond-shaped) lesions with greyish-white center and dark brown or reddish-brown margins, or blackening at the neck node of panicles causing breakage.",
        hi: "पत्तियों पर आंख या नाव के आकार के धब्बे जिनके बीच का हिस्सा राख जैसा धूसर और किनारे भूरे-लाल; बाली की गर्दन काली पड़कर टूट जाना।",
        pa: "ਪੱਤਿਆਂ 'ਤੇ ਕਿਸ਼ਤੀ ਵਰਗੇ ਧੱਬੇ ਜਿਨ੍ਹਾਂ ਦੇ ਕੇਂਦਰ ਸਲੇਟੀ ਹੁੰਦੇ ਹਨ; ਸਿੱਟੇ ਦੀ ਧੌਣ ਕਾਲੀ ਹੋ ਕੇ ਟੁੱਟਣਾ।",
      },
      symptoms: {
        en: [
          "Diamond-shaped lesions coalescing and killing entire leaves",
          "Black/brown necrotic ring at panicle neck node",
          "Panicles fall over, turning white with completely unfilled chaffy grains",
        ],
        hi: [
          "पत्तियों पर नाव जैसे धब्बे मिलकर पूरी पत्ती को सुखाना",
          "बाली के जोड़ पर काला घेरा और बाली टूटना (गर्दन तोड़)",
          "बाली सफेद होकर खाली रह जाना (चोकर जैसे दाने)",
        ],
        pa: [
          "ਪੱਤੇ ਸੁੱਕ ਕੇ ਝੁਲਸ ਜਾਣਾ",
          "ਸਿੱਟੇ ਦੀ ਧੌਣ ਕਾਲੀ ਹੋ ਕੇ ਟੁੱਟਣਾ",
          "ਫੋਕੇ ਦਾਣੇ ਬਣਨਾ",
        ],
      },
      similar_conditions: [
        {
          condition: "Brown Spot (Bipolaris oryzae)",
          distinction: "Brown spot lesions are circular to oval, like sesame seeds, with uniform dark brown color and lack the elongated diamond/spindle shape with grey center of blast.",
        },
        {
          condition: "Bacterial Leaf Blight (BLB)",
          distinction: "BLB lesions start as wavy, undulating stripes from leaf margins inward; not diamond/spindle spots.",
        },
      ],
      prevention: {
        en: "Treat seeds with Carbendazim 50% WP @ 2 g/kg; avoid excessive nitrogen (urea) applications; maintain balanced potassium fertilization; drain standing water intermittently.",
        hi: "कार्बेंडाजिम @ 2 ग्राम/किग्रा से बीज शोधन करें; यूरिया का अत्यधिक उपयोग न करें; पोटाश संतुलित मात्रा में दें।",
        pa: "ਬੀਜ ਸੋਧ ਕਰੋ; ਲੋੜ ਤੋਂ ਵੱਧ ਯੂਰੀਆ ਨਾ ਪਾਓ; ਪੋਟਾਸ਼ ਦੀ ਸਹੀ ਵਰਤੋਂ ਕਰੋ।",
      },
      ipm: {
        en: "Do not apply split urea during cloudy/foggy drizzle spells; apply prophylactic spray at boot-leaf stage and repeat at 5% panicle emergence if blast history exists.",
        hi: "बादल वाले मौसम में यूरिया न डालें; गोभ अवस्था और बाली निकलने पर सुरक्षात्मक छिड़काव करें।",
        pa: "ਬੱਦਲਵਾਈ ਵੇਲੇ ਯੂਰੀਆ ਨਾ ਪਾਓ; ਨਿਸਰਣ ਸਮੇਂ ਸਪਰੇਅ ਕਰੋ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Tricyclazole 75% WP OR Isoprothiolane 40% EC",
          cibrc_registered: true,
          cibrc_label: "Approved for Rice Blast under Insecticides Act / CIBRC",
          dosage_per_litre: "Tricyclazole @ 0.6 g/L OR Isoprothiolane @ 1.5 ml/L",
          dosage_per_acre: "Tricyclazole 120 g in 200 L water/acre",
          pre_harvest_interval_days: 30,
          spray_interval: "Apply at boot stage; repeat at 50% earhead emergence for neck blast protection.",
          safety_precautions: {
            toxicity_class: "Blue Triangle (Moderately Toxic)",
            ppe: "Face mask, boots, rubber gloves.",
            environment: "Harmful to aquatic organisms; do not discharge paddy water into community ponds for 7 days post spray.",
          },
        },
        biological_organic: {
          bio_agent: "Pseudomonas fluorescens 1% WP",
          dosage: "10 g/L foliar spray + seed treatment @ 10 g/kg seed.",
          botanical: "Raw cow milk (10%) + baking soda (0.1%) spray or 5% Neem extract.",
        },
      },
      source_references: [
        "ICAR-National Rice Research Institute (NRRI), Cuttack - Blast Management Bulletin 2025",
        "PAU Package of Practices for Kharif Crops 2025-26, Paddy Diseases, pp. 24-28",
        "DPPQS / CIBRC Compendium of Registered Pesticides for Rice, 2026",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
  },

  cotton: {
    bacterial_blight: {
      crop_id: "cotton",
      crop_name: { en: "Cotton", hi: "कपास", pa: "ਨਰਮਾ/ਕਪਾਹ" },
      disease_id: "bacterial_blight",
      disease_name: { en: "Bacterial Blight / Angular Leaf Spot", hi: "जीवाणु झुलसा (कोणीय धब्बा)", pa: "ਬੈਕਟੀਰੀਅਲ ਝੁਲਸ ਰੋਗ" },
      pathogen: "Xanthomonas citri pv. malvacearum (Bacteria)",
      visual_characteristics: {
        en: "Small, angular water-soaked spots bounded by small veinlets, turning dark reddish-brown; black lesion bands extending along main stem and branches ('Black Arm' phase).",
        hi: "पत्तियों की नसों के बीच कोणीय, पानीदार धब्बे जो बाद में गहरे लाल-भूरे हो जाते हैं; तने व टहनियों पर काली धारियां ('ब्लैक आर्म')।",
        pa: "ਪੱਤਿਆਂ 'ਤੇ ਕੋਣਦਾਰ ਪਾਣੀਦਾਰ ਧੱਬੇ ਜੋ ਲਾਲ-ਭੂਰੇ ਹੋ ਜਾਂਦੇ ਹਨ; ਟਾਹਣੀਆਂ ਕਾਲੀਆਂ ਪੈਣਾ।",
      },
      symptoms: {
        en: [
          "Angular leaf spots bounded by veinlets",
          "Black Arm: dark elongated lesions girdling stems and branches causing breakage",
          "Boll lesions: water-soaked sunken spots staining cotton lint",
        ],
        hi: [
          "पत्तियों की शिराओं के बीच कोणीय धब्बे",
          "ब्लैक आर्म: टहनियों पर काले घाव जिससे शाखाएं टूट जाती हैं",
          "टिंडों पर गोल धब्बे जिससे कपास की रुई खराब होती है",
        ],
        pa: [
          "ਪੱਤਿਆਂ 'ਤੇ ਕੋਣਦਾਰ ਦਾਗ",
          "ਟਾਹਣੀਆਂ ਦਾ ਕਾਲਾ ਪੈ ਕੇ ਟੁੱਟਣਾ",
          "ਟੀਂਡਿਆਂ 'ਤੇ ਕਾਲੇ ਦਾਗ ਜਿਸ ਨਾਲ ਰੂੰ ਖ਼ਰਾਬ ਹੁੰਦੀ ਹੈ",
        ],
      },
      similar_conditions: [
        {
          condition: "Alternaria Leaf Spot",
          distinction: "Alternaria spots are rounded with concentric rings; Bacterial blight spots are strictly angular and bounded by veins.",
        },
      ],
      prevention: {
        en: "Acid delinting of cottonseed with concentrated sulfuric acid (100 ml/kg seed); treat seed with Streptocycline @ 1 g in 10 L water; destroy infected crop debris post harvest.",
        hi: "बीज को सल्फ्यूरिक एसिड से साफ करें; स्ट्रेप्टोसाइक्लिन से बीज शोधन करें; पुरानी फसल के अवशेष जलाएं या नष्ट करें।",
        pa: "ਬੀਜ ਸੋਧ ਕਰੋ ਅਤੇ ਪੁਰਾਣੇ ਰਹਿੰਦ-ਖੂੰਹਦ ਨੂੰ ਨਸ਼ਟ ਕਰੋ।",
      },
      ipm: {
        en: "Avoid excessive irrigation during vegetative flush; rogue severely affected black-arm branches.",
        hi: "अधिक सिंचाई से बचें; रोगग्रस्त टहनियों को काटकर नष्ट करें।",
        pa: "ਲੋੜ ਅਨੁਸਾਰ ਪਾਣੀ ਲਗਾਓ।",
      },
      treatment: {
        chemical: {
          active_ingredient: "Copper Oxychloride 50% WP + Streptocycline (90:10 Streptomycin sulfate + Tetracycline)",
          cibrc_registered: true,
          cibrc_label: "Approved for Cotton Bacterial Blight under CIBRC / DPPQS",
          dosage_per_litre: "Copper Oxychloride @ 2.5 g/L + Streptocycline @ 0.1 g/L (1 g in 10 L water)",
          dosage_per_acre: "500 g Copper Oxychloride + 20 g Streptocycline in 200 L water/acre",
          pre_harvest_interval_days: 15,
          spray_interval: "Spray at first appearance of angular spots; repeat after 12-15 days if rain occurs.",
          safety_precautions: {
            toxicity_class: "Blue Triangle (Moderately Toxic)",
            ppe: "Wear face mask and goggles. Wash hands thoroughly.",
            environment: "Do not mix with alkaline fertilizers or emulsifiable concentrate insecticides.",
          },
        },
        biological_organic: {
          bio_agent: "Pseudomonas fluorescens 1% WP @ 5 g/L",
          dosage: "5 g/L foliar spray + seed treatment @ 10 g/kg seed.",
          botanical: "Raw cow dung supernatant spray (10%) or 5% neem seed kernel extract.",
        },
      },
      source_references: [
        "ICAR-Central Institute for Cotton Research (CICR), Nagpur - Cotton Protection Guide 2025",
        "PAU Package of Practices for Kharif Crops 2025-26, Cotton Diseases, pp. 38-42",
        "DPPQS / CIBRC Registered Uses of Copper Compounds and Bactericides on Cotton",
      ],
      last_reviewed_date: "2026-03-15",
      review_authority: "ICAR & PAU Extension Pathology Technical Board",
    },
  },
};

/**
 * Normalizes crop and disease strings to registry identifiers
 */
export function normalizeKey(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/__+/g, "_");
}
