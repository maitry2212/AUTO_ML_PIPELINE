# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    MLFLOW_TRACKING_URI=sqlite:///mlflow.db \
    MLFLOW_ARTIFACT_ROOT=/app/mlartifacts

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project structure (excluding items in .dockerignore)
COPY . .

# Create necessary directories for storage and MLflow
RUN mkdir -p artifacts models data storage/projects mlartifacts

# Expose the application port
EXPOSE ${PORT}

# Healthcheck to ensure the API is responding
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

# Start FastAPI application
# Note: We use the PORT environment variable for Render/Cloud Run compatibility
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
