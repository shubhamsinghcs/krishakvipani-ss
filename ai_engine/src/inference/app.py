"""
Production FastAPI Application for Krishak Vipani Computer Vision Inference.
Exposes endpoints for:
- Quality screening & Hierarchical Disease Diagnosis (/api/v1/diagnose)
- Supported Crops Registry (/api/v1/crops)
- System Health & Model Card (/api/v1/health)
- Architecture Benchmarks (/api/v1/benchmark)
"""

from typing import Optional, List, Dict, Any
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .pipeline import HierarchicalInferencePipeline
from ..data.taxonomy import SUPPORTED_CROPS, CROP_LIST
from ..evaluation.benchmark import BENCHMARK_RESULTS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("krishak_api")

app = FastAPI(
    title="Krishak Vipani Computer Vision Inference Service",
    description="Production-grade AI vision backend for hierarchical crop identification and disease diagnosis.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance initialized with production model
pipeline = HierarchicalInferencePipeline(
    architecture="efficientnet_v2_s",
    ood_threshold=0.50,
    temperature=1.15
)


# Pydantic Response Schemas
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_architecture: str
    device: str
    supported_crops_count: int


class CropItem(BaseModel):
    id: str
    name: Dict[str, str]
    botanical_name: str
    diseases: List[Dict[str, Any]]


class DiagnoseResponse(BaseModel):
    success: bool
    architecture: str
    quality_diagnostics: Dict[str, Any]
    stage1_crop: Optional[Dict[str, Any]] = None
    stage2_disease: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    diagnostics: Optional[Dict[str, Any]] = None


@app.get("/api/v1/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Returns system status, active deep learning architecture, and device."""
    return HealthResponse(
        status="HEALTHY",
        service="KrishakVipani-VisionEngine",
        version="2.0.0",
        model_architecture="EfficientNetV2-S (Production Backing)",
        device=pipeline.device,
        supported_crops_count=len(CROP_LIST)
    )


@app.get("/api/v1/crops", tags=["Taxonomy"])
async def get_supported_crops():
    """Returns all 10 validated Indian crops and their bounded disease classes."""
    return {
        "status": "success",
        "total_crops": len(CROP_LIST),
        "crops": [
            {
                "id": crop_id,
                "name": data["name"],
                "botanical_name": data["botanical_name"],
                "disease_count": len(data["diseases"]),
                "diseases": data["diseases"]
            }
            for crop_id, data in SUPPORTED_CROPS.items()
        ]
    }


@app.get("/api/v1/benchmark", tags=["Evaluation"])
async def get_architecture_benchmarks():
    """Returns the empirical benchmark comparison between EfficientNetV2, MobileNetV3, and ConvNeXt."""
    return {
        "status": "success",
        "evaluation_standard": "ICAR-2026 Indian Field Test Suite",
        "models": BENCHMARK_RESULTS
    }


@app.post("/api/v1/diagnose", response_model=DiagnoseResponse, tags=["Inference"])
async def diagnose_crop_disease(
    image: UploadFile = File(..., description="High-resolution field photograph of affected crop foliage"),
    crop_id: Optional[str] = Form(None, description="Optional user-confirmed crop ID (e.g., 'tomato', 'wheat')")
):
    """
    Hierarchical Crop Disease Diagnosis:
    1. Validates blur, luminance, and resolution
    2. Runs Stage 1 Crop verification (or honors user-confirmed crop)
    3. Runs Stage 2 Disease diagnosis bounded strictly to the crop's pathology classes
    """
    contents = await image.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Sanity check file size (max 10MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds 10MB limit."
        )

    result = pipeline.diagnose_hierarchical(contents, confirmed_crop_id=crop_id)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
