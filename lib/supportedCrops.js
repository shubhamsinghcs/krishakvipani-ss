/**
 * Configurable Supported Crops Registry & Disease Taxonomy
 * Curated for Indian Agriculture (ICAR, KVK, and State Agricultural Universities).
 * Only crops with validated computer vision and agronomic treatment pipelines are listed.
 */

export const SUPPORTED_CROPS = [
  {
    id: "tomato",
    name: { en: "Tomato", hi: "टमाटर", pa: "ਟਮਾਟਰ" },
    botanicalName: "Solanum lycopersicum",
    icon: "🍅",
    season: "All seasons (Kharif / Rabi / Zaid)",
    diseaseClasses: [
      { id: "early_blight", name: { en: "Early Blight (Alternaria solani)", hi: "अगेती झुलसा", pa: "ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ" } },
      { id: "late_blight", name: { en: "Late Blight (Phytophthora infestans)", hi: "पछेती झुलसा", pa: "ਪਛੇਤਾ ਝੁਲਸ ਰੋਗ" } },
      { id: "leaf_curl", name: { en: "Tomato Leaf Curl Virus (ToLCV)", hi: "पर्ण कुंचन विषाणु (लीफ कर्ल)", pa: "ਪੱਤਾ ਮਰੋੜ ਰੋਗ" } },
      { id: "septoria_leaf_spot", name: { en: "Septoria Leaf Spot", hi: "सेप्टोरिया पत्ती धब्बा", pa: "ਸੈਪਟੋਰੀਆ ਪੱਤਾ ਦਾਗ" } },
      { id: "bacterial_wilt", name: { en: "Bacterial Wilt / Canker", hi: "जीवाणु उकठा रोग", pa: "ਬੈਕਟੀਰੀਅਲ ਉਖੜਾ ਰੋਗ" } },
      { id: "calcium_deficiency", name: { en: "Blossom End Rot (Calcium Deficiency)", hi: "ब्लॉसम एंड रॉट (कैल्शियम कमी)", pa: "ਕੈਲਸ਼ੀਅਮ ਦੀ ਘਾਟ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "potato",
    name: { en: "Potato", hi: "आलू", pa: "ਆਲੂ" },
    botanicalName: "Solanum tuberosum",
    icon: "🥔",
    season: "Rabi",
    diseaseClasses: [
      { id: "late_blight", name: { en: "Late Blight (Phytophthora infestans)", hi: "पछेती झुलसा", pa: "ਪਛੇਤਾ ਝੁਲਸ ਰੋਗ" } },
      { id: "early_blight", name: { en: "Early Blight (Alternaria solani)", hi: "अगेती झुलसा", pa: "ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ" } },
      { id: "black_scurf", name: { en: "Black Scurf (Rhizoctonia solani)", hi: "काली पपड़ी (ब्लैक स्कर्फ)", pa: "ਕਾਲੀ ਪਪੜੀ ਰੋਗ" } },
      { id: "common_scab", name: { en: "Common Scab (Streptomyces scabies)", hi: "साधारण स्केब", pa: "ਸਕੈਬ ਰੋਗ" } },
      { id: "potato_virus_y", name: { en: "Potato Virus Y (PVY Mosaic)", hi: "मोज़ेक वायरस", pa: "ਮੋਜ਼ੇਕ ਵਿਸ਼ਾਣੂ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "wheat",
    name: { en: "Wheat", hi: "गेहूं", pa: "ਕਣਕ" },
    botanicalName: "Triticum aestivum",
    icon: "🌾",
    season: "Rabi",
    diseaseClasses: [
      { id: "yellow_rust", name: { en: "Yellow / Stripe Rust (Puccinia striiformis)", hi: "पीला रतुआ (हल्दी रोग)", pa: "ਪੀਲਾ ਰੱਤੂਆ (ਹਲਦੀ ਰੋਗ)" } },
      { id: "brown_rust", name: { en: "Brown / Leaf Rust (Puccinia triticina)", hi: "भूरा रतुआ", pa: "ਭੂਰਾ ਰੱਤੂਆ" } },
      { id: "powdery_mildew", name: { en: "Powdery Mildew (Blumeria graminis)", hi: "चूर्णिल आसिता (सफेद फफूंद)", pa: "ਚਿੱਟਾ ਧੂੜ ਰੋਗ" } },
      { id: "karnal_bunt", name: { en: "Karnal Bunt (Tilletia indica)", hi: "करनाल बंट", pa: "ਕਰਨਾਲ ਬੰਟ" } },
      { id: "loose_smut", name: { en: "Loose Smut (Ustilago tritici)", hi: "कंडुआ रोग", pa: "ਕੰਗਿਆਰੀ ਰੋਗ" } },
      { id: "nitrogen_deficiency", name: { en: "Nitrogen Chlorosis / Deficiency", hi: "नाइट्रोजन की कमी (पीलापन)", pa: "ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਘਾਟ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "rice",
    name: { en: "Rice / Paddy", hi: "धान", pa: "ਝੋਨਾ" },
    botanicalName: "Oryza sativa",
    icon: "🌾",
    season: "Kharif",
    diseaseClasses: [
      { id: "blast", name: { en: "Rice Blast (Magnaporthe oryzae)", hi: "झुलसा / गर्दन तोड़ (ब्लास्ट)", pa: "ਬਲਾਸਟ / ਧੌਣ ਤੋੜ ਰੋਗ" } },
      { id: "bacterial_leaf_blight", name: { en: "Bacterial Leaf Blight (Xanthomonas oryzae)", hi: "जीवाणु पत्ती झुलसा (BLB)", pa: "ਬੈਕਟੀਰੀਅਲ ਝੁਲਸ ਰੋਗ" } },
      { id: "sheath_blight", name: { en: "Sheath Blight (Rhizoctonia solani)", hi: "शीथ ब्लाइट", pa: "ਸ਼ੀਥ ਬਲਾਇਟ" } },
      { id: "brown_spot", name: { en: "Brown Spot (Bipolaris oryzae)", hi: "भूरा धब्बा रोग", pa: "ਭੂਰਾ ਧੱਬਾ ਰੋਗ" } },
      { id: "zinc_deficiency", name: { en: "Khaira Disease (Zinc Deficiency)", hi: "खैरा रोग (जिंक की कमी)", pa: "ਖਹਿਰਾ ਰੋਗ (ਜ਼ਿੰਕ ਘਾਟ)" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "cotton",
    name: { en: "Cotton", hi: "कपास", pa: "ਨਰਮਾ/ਕਪਾਹ" },
    botanicalName: "Gossypium hirsutum",
    icon: "☁️",
    season: "Kharif",
    diseaseClasses: [
      { id: "bacterial_blight", name: { en: "Bacterial Blight / Angular Leaf Spot", hi: "जीवाणु झुलसा (कोणीय धब्बा)", pa: "ਬੈਕਟੀਰੀਅਲ ਝੁਲਸ ਰੋਗ" } },
      { id: "leaf_curl", name: { en: "Cotton Leaf Curl Virus (CLCuD)", hi: "पत्ता मरोड़ वायरस", pa: "ਪੱਤਾ ਮਰੋੜ ਵਿਸ਼ਾਣੂ (ਚਿੱਟੀ ਮੱਖੀ)" } },
      { id: "alternaria_leaf_spot", name: { en: "Alternaria Leaf Spot", hi: "अल्टरनेरिया पत्ती धब्बा", pa: "ਅਲਟਰਨੇਰੀਆ ਦਾਗ" } },
      { id: "grey_mildew", name: { en: "Grey Mildew (Dahiya Disease)", hi: "दहिया रोग (ग्रे फफूंद)", pa: "ਦਹੀਆ ਰੋਗ" } },
      { id: "magnesium_deficiency", name: { en: "Lal Patti (Magnesium Deficiency)", hi: "लाल पत्ती (मैग्नीशियम कमी)", pa: "ਲਾਲ ਪੱਤੀ ਰੋਗ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "chilli",
    name: { en: "Chilli / Pepper", hi: "मिर्च", pa: "ਮਿਰਚ" },
    botanicalName: "Capsicum annuum",
    icon: "🌶️",
    season: "Kharif / Rabi",
    diseaseClasses: [
      { id: "chilli_leaf_curl", name: { en: "Chilli Leaf Curl (Murdda Disease)", hi: "मुर्रड़ा रोग (पर्ण कुंचन)", pa: "ਮੁਰੜਾ ਰੋਗ" } },
      { id: "anthracnose", name: { en: "Anthracnose / Fruit Rot (Dieback)", hi: "फल सड़न (एंथ्रेक्नोज)", pa: "ਫਲ ਗਲਣ ਰੋਗ" } },
      { id: "powdery_mildew", name: { en: "Powdery Mildew (Leveillula taurica)", hi: "सफेद चूर्ण फफूंद", pa: "ਚਿੱਟਾ ਧੂੜ ਰੋਗ" } },
      { id: "thrips_damage", name: { en: "Thrips / Mite Upward Curling", hi: "थ्रिप्स व माइट का प्रकोप", pa: "ਥ੍ਰਿਪਸ ਦਾ ਹਮਲਾ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "onion",
    name: { en: "Onion", hi: "प्याज", pa: "ਪਿਆਜ਼" },
    botanicalName: "Allium cepa",
    icon: "🧅",
    season: "Rabi / Kharif",
    diseaseClasses: [
      { id: "purple_blotch", name: { en: "Purple Blotch (Alternaria porri)", hi: "बैंगनी धब्बा रोग (पर्पल ब्लॉच)", pa: "ਜਾਮਣੀ ਧੱਬਾ ਰੋਗ" } },
      { id: "stemplylium_blight", name: { en: "Stemphylium Leaf Blight", hi: "स्टेमफिलियम झुलसा", pa: "ਸਟੈਮਫਿਲੀਅਮ ਝੁਲਸ" } },
      { id: "downy_mildew", name: { en: "Downy Mildew (Peronospora destructor)", hi: "मृदुरोमिल आसिता", pa: "ਡਾਊਨੀ ਮਿਲਡਿਊ" } },
      { id: "basal_rot", name: { en: "Basal Rot / Damping Off (Fusarium)", hi: "जड़ व कंद सड़न", pa: "ਗੰਢ ਗਲਣ ਰੋਗ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "mustard",
    name: { en: "Mustard / Rapeseed", hi: "सरसों / राई", pa: "ਸਰ੍ਹੋਂ / ਰਾਇਆ" },
    botanicalName: "Brassica juncea",
    icon: "🌼",
    season: "Rabi",
    diseaseClasses: [
      { id: "white_rust", name: { en: "White Rust (Albugo candida)", hi: "सफेद रतुआ (सफेद फफोले)", pa: "ਚਿੱਟਾ ਰੱਤੂਆ" } },
      { id: "alternaria_blight", name: { en: "Alternaria Black Spot / Blight", hi: "काला धब्बा / झुलसा", pa: "ਕਾਲਾ ਧੱਬਾ ਰੋਗ" } },
      { id: "aphid_infestation", name: { en: "Mustard Aphid (Chetpa / Mahu)", hi: "माहू / चेपा कीट प्रकोप", pa: "ਤੇਲਾ / ਚੇਪਾ ਕੀਟ" } },
      { id: "sclerotinia_rot", name: { en: "Stem Rot (Sclerotinia sclerotiorum)", hi: "तना सड़न रोग", pa: "ਤਣਾ ਗਲਣ ਰੋਗ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "soybean",
    name: { en: "Soybean", hi: "सोयाबीन", pa: "ਸੋਇਆਬੀਨ" },
    botanicalName: "Glycine max",
    icon: "🌱",
    season: "Kharif",
    diseaseClasses: [
      { id: "yellow_mosaic", name: { en: "Yellow Mosaic Virus (YMV)", hi: "पीला मोज़ेक वायरस", pa: "ਪੀਲਾ ਮੋਜ਼ੇਕ ਵਿਸ਼ਾਣੂ" } },
      { id: "rust", name: { en: "Soybean Rust (Phakopsora pachyrhizi)", hi: "सोयाबीन रतुआ", pa: "ਸੋਇਆਬੀਨ ਰੱਤੂਆ" } },
      { id: "anthracnose", name: { en: "Anthracnose / Pod Blight", hi: "एंथ्रेक्नोज व फली झुलसा", pa: "ਫਲੀ ਝੁਲਸ ਰੋਗ" } },
      { id: "collar_rot", name: { en: "Collar Rot (Sclerotium rolfsii)", hi: "कॉलर रॉट (तना गलन)", pa: "ਕਾਲਰ ਗਲਣ ਰੋਗ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
  {
    id: "maize",
    name: { en: "Maize / Corn", hi: "मक्का", pa: "ਮੱਕੀ" },
    botanicalName: "Zea mays",
    icon: "🌽",
    season: "Kharif / Rabi",
    diseaseClasses: [
      { id: "fall_armyworm", name: { en: "Fall Armyworm (Spodoptera frugiperda)", hi: "फॉल आर्मीवर्म कीट प्रकोप", pa: "ਫਾਲ ਆਰਮੀਵਰਮ ਕੀੜਾ" } },
      { id: "turcicum_blight", name: { en: "Turcicum Leaf Blight (Exserohilum turcicum)", hi: "टर्सिकम पत्ती झुलसा", pa: "ਟਰਸਿਕਮ ਝੁਲਸ ਰੋਗ" } },
      { id: "maydis_blight", name: { en: "Maydis Leaf Blight (Bipolaris maydis)", hi: "मायडिस झुलसा", pa: "ਮਾਇਡਿਸ ਝੁਲਸ" } },
      { id: "common_rust", name: { en: "Common Rust (Puccinia sorghi)", hi: "मक्का रतुआ", pa: "ਮੱਕੀ ਰੱਤੂਆ" } },
      { id: "healthy", name: { en: "Healthy Plant", hi: "स्वस्थ पौधा", pa: "ਤੰਦਰੁਸਤ ਬੂਟਾ" } },
    ],
  },
];

export function getCropById(cropId) {
  if (!cropId) return null;
  const cleanId = String(cropId).toLowerCase().trim();
  return SUPPORTED_CROPS.find((c) => c.id === cleanId) || null;
}

export function getCropByFuzzyName(name) {
  if (!name || typeof name !== "string") return null;
  const lower = name.toLowerCase().trim();
  return (
    SUPPORTED_CROPS.find(
      (c) =>
        c.id === lower ||
        c.name.en.toLowerCase().includes(lower) ||
        lower.includes(c.name.en.toLowerCase()) ||
        c.name.hi.includes(name) ||
        c.name.pa.includes(name)
    ) || null
  );
}

export function formatCropLabel(crop, lang = "en") {
  if (!crop) return "";
  return crop.name[lang] || crop.name.en || crop.id;
}
