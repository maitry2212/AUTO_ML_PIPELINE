import os
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
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "One_Click_ML_Experiment"
    
    # DVC
    DVC_PATH: str = os.path.join(BASE_DIR, "dvc.yaml")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
for path in [settings.DATA_DIR, settings.MODELS_DIR, settings.ARTIFACTS_DIR, settings.STORAGE_DIR, settings.PROJECTS_DIR]:
    os.makedirs(path, exist_ok=True)
