# Production Dockerfile for BhuSatya Backend (Railway Cloud Deployment)
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    STORAGE_ROOT=/data \
    DEBIAN_FRONTEND=noninteractive

# Install essential Linux system libraries required for:
# - OpenCV headless (libgl1, libglib2.0-0)
# - PyTorch & PaddlePaddle OpenMP threading (libgomp1)
# - Container healthchecks (curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first for optimal Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code, migrations, and verified YOLO model checkpoints
COPY . .

# Ensure persistent storage mount points exist
RUN mkdir -p /data/uploads /data/document_pages /data/detected_regions /data/storage && \
    mkdir -p ./uploads ./document_pages ./detected_regions ./storage

# Expose default HTTP port
EXPOSE 8000

# Healthcheck targeting the live production health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Production startup:
# 1. Apply Alembic migrations against Railway PostgreSQL
# 2. Start single-worker Uvicorn (memory-safe singleton for YOLO Model A, Model B, and PaddleOCR)
CMD ["sh", "-c", "python -m alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
