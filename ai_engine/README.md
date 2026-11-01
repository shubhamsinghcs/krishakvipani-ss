# Krishak Vipani - AI Computer Vision Engine

Production-grade, evidence-based computer vision architecture for crop identification and disease diagnosis in Indian agriculture.

---

## 1. Architectural Overview

```
                      [ Farmer Mobile App (Next.js) ]
                                    │
                                    ▼
                     [ POST /api/v1/diagnose ]
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       [ 1. Image Quality Screen ]       [ 2. OOD Detection ]
       (Resolution, Blur, Lighting)      (Entropy & Energy Threshold)
                    │
                    ▼
       [ Stage 1: Crop Classifier ]
       (10 Curated Indian Crops)
                    │
                    ▼
       [ Farmer Confirmation / Match ]
                    │
                    ▼
       [ Stage 2: Crop-Bounded Diagnosis ]
       (Restricted to confirmed crop's diseases)
                    │
                    ▼
       [ Calibrated Diagnosis + ICAR Treatments ]
```

---

## 2. Directory Structure

- `configs/`: YAML configs for base parameters, EfficientNetV2-S, MobileNetV3-Large, and ConvNeXt-Tiny.
- `src/data/`: Field data pipeline, taxonomy registry, and field augmentations (lighting, sensor blur, CutMix/MixUp).
- `src/models/`: Factory for vision backbones with custom heads, temperature scaling, and layer freezing.
- `src/training/`: Two-phase transfer learning and fine-tuning with PyTorch and MLflow.
- `src/evaluation/`: Independent field benchmark suite, Expected Calibration Error (ECE), and confusion matrix generator.
- `src/inference/`: Production FastAPI microservice (`/api/v1/diagnose`, `/api/v1/crops`, `/api/v1/benchmark`, `/api/v1/health`).
- `dvc.yaml`: DVC pipeline specification for reproducible data versioning and model lineage.

---

## 3. Quick Start

### Local Setup
```bash
cd ai_engine
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Run Benchmarks
```bash
python -m src.evaluation.benchmark
```

### Run Unit Tests
```bash
python -m unittest discover -s tests -p "test_*.py"
```

### Start FastAPI Production Inference Service
```bash
uvicorn src.inference.app:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation available at `http://localhost:8000/docs`.
