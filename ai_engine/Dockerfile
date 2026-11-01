# Production Dockerfile for Krishak Vipani Computer Vision Inference Service
FROM python:3.11-slim

# Install system dependencies for OpenCV and image operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source tree and configs
COPY configs/ ./configs/
COPY src/ ./src/

# Expose FastAPI port
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Run production uvicorn ASGI server with 4 worker processes
CMD ["uvicorn", "src.inference.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
