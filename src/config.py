import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "One-Click ML Pipeline"
    API_V1_STR: str = "/api/v1"

    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "artifacts")
    STORAGE_DIR: str = os.path.join(BASE_DIR, "storage")
    PROJECTS_DIR: str = os.path.join(STORAGE_DIR, "projects")

    # MLflow
    # IMPORTANT: In production (Docker), set MLFLOW_TRACKING_URI via environment
    # variable to sqlite:////app/mlflow_data/mlflow.db (note the 4 slashes for
    # absolute path). Defaults to a local sqlite file for dev.
    MLFLOW_TRACKING_URI: str = "sqlite:///mlflow.db"
    MLFLOW_EXPERIMENT_NAME: str = "One_Click_ML_Experiment"

    # DVC
    DVC_PATH: str = os.path.join(BASE_DIR, "dvc.yaml")

    # CORS
    # In production, set this via env var to your actual frontend domain(s).
    # Example: ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
    # For local dev the wildcard is fine, but in production restrict it!
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure directories exist
for path in [
    settings.DATA_DIR,
    settings.MODELS_DIR,
    settings.ARTIFACTS_DIR,
    settings.STORAGE_DIR,
    settings.PROJECTS_DIR,
]:
    os.makedirs(path, exist_ok=True)
