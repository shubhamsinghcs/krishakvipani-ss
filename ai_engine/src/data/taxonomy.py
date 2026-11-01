"""
Taxonomy Registry for Krishak Vipani Computer Vision Engine.
Curated for Indian Agriculture (ICAR, KVK, State Agricultural Universities).
Provides strict mapping between Crop classes (Stage 1) and Crop-bounded Disease classes (Stage 2).
"""

from typing import Dict, List, Any, Optional

SUPPORTED_CROPS: Dict[str, Dict[str, Any]] = {
    "tomato": {
        "id": "tomato",
        "botanical_name": "Solanum lycopersicum",
        "name": {"en": "Tomato", "hi": "टमाटर", "pa": "ਟਮਾਟਰ"},
        "diseases": [
            {"id": "early_blight", "name": "Early Blight (Alternaria solani)", "icar_code": "TOM-EB-01"},
            {"id": "late_blight", "name": "Late Blight (Phytophthora infestans)", "icar_code": "TOM-LB-02"},
            {"id": "leaf_curl", "name": "Tomato Leaf Curl Virus (ToLCV)", "icar_code": "TOM-LC-03"},
            {"id": "septoria_leaf_spot", "name": "Septoria Leaf Spot", "icar_code": "TOM-SS-04"},
            {"id": "bacterial_wilt", "name": "Bacterial Wilt / Canker", "icar_code": "TOM-BW-05"},
            {"id": "calcium_deficiency", "name": "Blossom End Rot (Calcium Deficiency)", "icar_code": "TOM-CD-06"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "TOM-HL-00"},
        ],
    },
    "potato": {
        "id": "potato",
        "botanical_name": "Solanum tuberosum",
        "name": {"en": "Potato", "hi": "आलू", "pa": "ਆਲੂ"},
        "diseases": [
            {"id": "late_blight", "name": "Late Blight (Phytophthora infestans)", "icar_code": "POT-LB-01"},
            {"id": "early_blight", "name": "Early Blight (Alternaria solani)", "icar_code": "POT-EB-02"},
            {"id": "black_scurf", "name": "Black Scurf (Rhizoctonia solani)", "icar_code": "POT-BS-03"},
            {"id": "common_scab", "name": "Common Scab (Streptomyces scabies)", "icar_code": "POT-CS-04"},
            {"id": "potato_virus_y", "name": "Potato Virus Y (PVY Mosaic)", "icar_code": "POT-PV-05"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "POT-HL-00"},
        ],
    },
    "wheat": {
        "id": "wheat",
        "botanical_name": "Triticum aestivum",
        "name": {"en": "Wheat", "hi": "गेहूं", "pa": "ਕਣਕ"},
        "diseases": [
            {"id": "yellow_rust", "name": "Yellow / Stripe Rust (Puccinia striiformis)", "icar_code": "WHT-YR-01"},
            {"id": "brown_rust", "name": "Brown / Leaf Rust (Puccinia triticina)", "icar_code": "WHT-BR-02"},
            {"id": "powdery_mildew", "name": "Powdery Mildew (Blumeria graminis)", "icar_code": "WHT-PM-03"},
            {"id": "karnal_bunt", "name": "Karnal Bunt (Tilletia indica)", "icar_code": "WHT-KB-04"},
            {"id": "loose_smut", "name": "Loose Smut (Ustilago tritici)", "icar_code": "WHT-LS-05"},
            {"id": "nitrogen_deficiency", "name": "Nitrogen Chlorosis / Deficiency", "icar_code": "WHT-ND-06"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "WHT-HL-00"},
        ],
    },
    "rice": {
        "id": "rice",
        "botanical_name": "Oryza sativa",
        "name": {"en": "Rice / Paddy", "hi": "धान", "pa": "ਝੋਨਾ"},
        "diseases": [
            {"id": "blast", "name": "Rice Blast (Magnaporthe oryzae)", "icar_code": "RIC-BL-01"},
            {"id": "bacterial_leaf_blight", "name": "Bacterial Leaf Blight (Xanthomonas oryzae)", "icar_code": "RIC-BB-02"},
            {"id": "sheath_blight", "name": "Sheath Blight (Rhizoctonia solani)", "icar_code": "RIC-SB-03"},
            {"id": "brown_spot", "name": "Brown Spot (Bipolaris oryzae)", "icar_code": "RIC-BS-04"},
            {"id": "zinc_deficiency", "name": "Khaira Disease (Zinc Deficiency)", "icar_code": "RIC-ZD-05"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "RIC-HL-00"},
        ],
    },
    "cotton": {
        "id": "cotton",
        "botanical_name": "Gossypium hirsutum",
        "name": {"en": "Cotton", "hi": "कपास", "pa": "ਨਰਮਾ/ਕਪਾਹ"},
        "diseases": [
            {"id": "bacterial_blight", "name": "Bacterial Blight / Angular Leaf Spot", "icar_code": "COT-BB-01"},
            {"id": "leaf_curl", "name": "Cotton Leaf Curl Virus (CLCuD)", "icar_code": "COT-LC-02"},
            {"id": "alternaria_leaf_spot", "name": "Alternaria Leaf Spot", "icar_code": "COT-AL-03"},
            {"id": "grey_mildew", "name": "Grey Mildew (Dahiya Disease)", "icar_code": "COT-GM-04"},
            {"id": "magnesium_deficiency", "name": "Lal Patti (Magnesium Deficiency)", "icar_code": "COT-MD-05"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "COT-HL-00"},
        ],
    },
    "chilli": {
        "id": "chilli",
        "botanical_name": "Capsicum annuum",
        "name": {"en": "Chilli / Pepper", "hi": "मिर्च", "pa": "ਮਿਰਚ"},
        "diseases": [
            {"id": "chilli_leaf_curl", "name": "Chilli Leaf Curl (Murdda Disease)", "icar_code": "CHL-LC-01"},
            {"id": "anthracnose", "name": "Anthracnose / Fruit Rot (Dieback)", "icar_code": "CHL-AN-02"},
            {"id": "powdery_mildew", "name": "Powdery Mildew (Leveillula taurica)", "icar_code": "CHL-PM-03"},
            {"id": "thrips_damage", "name": "Thrips / Mite Upward Curling", "icar_code": "CHL-TD-04"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "CHL-HL-00"},
        ],
    },
    "onion": {
        "id": "onion",
        "botanical_name": "Allium cepa",
        "name": {"en": "Onion", "hi": "प्याज", "pa": "ਪਿਆਜ਼"},
        "diseases": [
            {"id": "purple_blotch", "name": "Purple Blotch (Alternaria porri)", "icar_code": "ONI-PB-01"},
            {"id": "stem_phylium_blight", "name": "Stemphylium Leaf Blight", "icar_code": "ONI-SB-02"},
            {"id": "basal_rot", "name": "Basal Rot (Fusarium oxysporum)", "icar_code": "ONI-BR-03"},
            {"id": "downy_mildew", "name": "Downy Mildew (Peronospora destructor)", "icar_code": "ONI-DM-04"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "ONI-HL-00"},
        ],
    },
    "mustard": {
        "id": "mustard",
        "botanical_name": "Brassica juncea",
        "name": {"en": "Mustard / Sarson", "hi": "सरसों", "pa": "ਸਰ੍ਹੋਂ"},
        "diseases": [
            {"id": "white_rust", "name": "White Rust / Blister (Albugo candida)", "icar_code": "MUS-WR-01"},
            {"id": "alternaria_blight", "name": "Alternaria Blight (Black Spot)", "icar_code": "MUS-AB-02"},
            {"id": "downy_mildew", "name": "Downy Mildew (Hyaloperonospora brassicae)", "icar_code": "MUS-DM-03"},
            {"id": "sclerotinia_rot", "name": "Sclerotinia Stem Rot", "icar_code": "MUS-SR-04"},
            {"id": "aphid_infestation", "name": "Mustard Aphid Damage (Lipaphis erysimi)", "icar_code": "MUS-AP-05"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "MUS-HL-00"},
        ],
    },
    "soybean": {
        "id": "soybean",
        "botanical_name": "Glycine max",
        "name": {"en": "Soybean", "hi": "सोयाबीन", "pa": "ਸੋਇਆਬੀਨ"},
        "diseases": [
            {"id": "yellow_mosaic", "name": "Soybean Yellow Mosaic Virus (YMV)", "icar_code": "SOY-YM-01"},
            {"id": "rust", "name": "Asian Soybean Rust (Phakopsora pachyrhizi)", "icar_code": "SOY-RS-02"},
            {"id": "collar_rot", "name": "Collar Rot (Sclerotium rolfsii)", "icar_code": "SOY-CR-03"},
            {"id": "anthracnose", "name": "Anthracnose / Pod Blight", "icar_code": "SOY-AN-04"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "SOY-HL-00"},
        ],
    },
    "maize": {
        "id": "maize",
        "botanical_name": "Zea mays",
        "name": {"en": "Maize / Corn", "hi": "मक्का", "pa": "ਮੱਕੀ"},
        "diseases": [
            {"id": "fall_armyworm", "name": "Fall Armyworm Damage (Spodoptera frugiperda)", "icar_code": "MAI-FA-01"},
            {"id": "maydis_leaf_blight", "name": "Maydis Leaf Blight (Bipolaris maydis)", "icar_code": "MAI-MB-02"},
            {"id": "turcicum_leaf_blight", "name": "Turcicum Leaf Blight (Exserohilum turcicum)", "icar_code": "MAI-TB-03"},
            {"id": "common_rust", "name": "Common Rust (Puccinia sorghi)", "icar_code": "MAI-CR-04"},
            {"id": "healthy", "name": "Healthy Plant", "icar_code": "MAI-HL-00"},
        ],
    },
}

CROP_LIST = list(SUPPORTED_CROPS.keys())
CROP_TO_IDX = {crop: idx for idx, crop in enumerate(CROP_LIST)}
IDX_TO_CROP = {idx: crop for idx, crop in enumerate(CROP_LIST)}


def get_disease_classes_for_crop(crop_id: str) -> List[Dict[str, Any]]:
    """Returns validated disease classes for a confirmed crop."""
    crop_info = SUPPORTED_CROPS.get(crop_id.lower())
    if not crop_info:
        return []
    return crop_info["diseases"]


def get_crop_info(crop_id: str) -> Optional[Dict[str, Any]]:
    """Returns metadata for a supported crop."""
    return SUPPORTED_CROPS.get(crop_id.lower())
