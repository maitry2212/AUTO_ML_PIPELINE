import os
import json
import shutil
import uuid
from datetime import datetime
import pandas as pd
from typing import Dict, Any, List, Optional
from src.config import settings

class StorageManager:
    """Manages local filesystem storage for ML projects."""
    
    @staticmethod
    def create_project_structure() -> str:
        """Generates a unique project ID and creates its directory."""
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        project_path = os.path.join(settings.PROJECTS_DIR, project_id)
        os.makedirs(project_path, exist_ok=True)
        return project_id

    @staticmethod
    def get_project_path(project_id: str) -> str:
        return os.path.join(settings.PROJECTS_DIR, project_id)

    @classmethod
    def save_dataset(cls, project_id: str, df: pd.DataFrame, filename: str = "raw_data.csv"):
        path = os.path.join(cls.get_project_path(project_id), filename)
        df.to_csv(path, index=False)
        return path

    @classmethod
    def save_json(cls, project_id: str, data: Dict[str, Any], filename: str):
        path = os.path.join(cls.get_project_path(project_id), filename)
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)
        return path

    @classmethod
    def load_json(cls, project_id: str, filename: str) -> Optional[Dict[str, Any]]:
        path = os.path.join(cls.get_project_path(project_id), filename)
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
        return None

    @classmethod
    def load_dataset(cls, project_id: str, filename: str = "raw_data.csv") -> Optional[pd.DataFrame]:
        path = os.path.join(cls.get_project_path(project_id), filename)
        if os.path.exists(path):
            return pd.read_csv(path)
        return None

    @classmethod
    def delete_project(cls, project_id: str):
        path = cls.get_project_path(project_id)
        if os.path.exists(path):
            shutil.rmtree(path)
            return True
        return False
