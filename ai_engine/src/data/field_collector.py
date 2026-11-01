"""
Indian Field Dataset Schema & Ingestion Pipeline.
Standardizes field image collection with full agronomic context.
"""

from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List
from enum import Enum
import json


class PlantPart(str, Enum):
    LEAF_UPPER = "leaf_upper"
    LEAF_LOWER = "leaf_lower"
    STEM_COLLAR = "stem_collar"
    FRUIT_POD = "fruit_pod"
    FLOWER_INFLORESCENCE = "flower_inflorescence"
    ROOT_CROWN = "root_crown"
    WHOLE_CANOPY = "whole_canopy"


class GrowthStage(str, Enum):
    SEEDLING = "seedling"
    VEGETATIVE = "vegetative"
    FLOWERING = "flowering"
    FRUITING_GRAIN_FILL = "fruiting_grain_fill"
    MATURITY_HARVEST = "maturity_harvest"


class Season(str, Enum):
    KHARIF = "Kharif"
    RABI = "Rabi"
    ZAID = "Zaid"


class CollectionCondition(str, Enum):
    DIRECT_SUNLIGHT = "direct_sunlight"
    CANOPY_SHADE = "canopy_shade"
    DIFFUSE_CLOUDY = "diffuse_cloudy"
    MORNING_DEW = "morning_dew"
    POST_IRRIGATION = "post_irrigation"


class VerificationStatus(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    VERIFIED_BY_ICAR_PATHOLOGIST = "VERIFIED_BY_ICAR_PATHOLOGIST"
    DISPUTED = "DISPUTED"
    REJECTED = "REJECTED"


@dataclass
class IndianFieldSampleMetadata:
    """Schema for authentic field-collected crop pathology samples."""
    sample_id: str
    crop_name: str
    disease_label: str
    plant_part: PlantPart
    growth_stage: GrowthStage
    season: Season
    collection_condition: CollectionCondition
    expert_verification_status: VerificationStatus

    # Leakage Prevention Group Identifiers
    farm_id: str
    session_id: str
    plant_id: str

    # Consented Location Data
    state: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Expert Details
    expert_id: Optional[str] = None
    icar_reference_code: Optional[str] = None
    notes: Optional[str] = None

    @property
    def leakage_group_key(self) -> str:
        """Composite key to ensure no image sharing plant/farm context crosses splits."""
        return f"{self.farm_id}_{self.session_id}_{self.plant_id}"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def validate_field_sample(data: Dict[str, Any]) -> bool:
    """Validates required agronomic fields."""
    required = ["sample_id", "crop_name", "disease_label", "plant_part", "farm_id", "session_id"]
    for field in required:
        if field not in data or not data[field]:
            raise ValueError(f"Missing required agronomic metadata field: '{field}'")
    return True
