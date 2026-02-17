import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from src.config import settings

class HistoryManager:
    """Manages the index.json file for tracking past projects."""
    
    INDEX_FILE = os.path.join(settings.STORAGE_DIR, "index.json")

    @classmethod
    def _load_index(cls) -> List[Dict[str, Any]]:
        if not os.path.exists(cls.INDEX_FILE):
            return []
        try:
            with open(cls.INDEX_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    @classmethod
    def _save_index(cls, index_data: List[Dict[str, Any]]):
        with open(cls.INDEX_FILE, 'w') as f:
            json.dump(index_data, f, indent=4)

    @classmethod
    def add_project(cls, project_id: str, metadata: Dict[str, Any]):
        index = cls._load_index()
        
        # Check if project already exists, if so update it
        existing_idx = next((i for i, p in enumerate(index) if p['project_id'] == project_id), -1)
        
        project_entry = {
            "project_id": project_id,
            "timestamp": datetime.now().isoformat(),
            **metadata
        }
        
        if existing_idx > -1:
            index[existing_idx] = project_entry
        else:
            index.insert(0, project_entry) # Add to top like ChatGPT
            
        cls._save_index(index)

    @classmethod
    def get_all_projects(cls) -> List[Dict[str, Any]]:
        # Filter out projects that might have been deleted from disk but are still in index
        index = cls._load_index()
        valid_projects = []
        changed = False
        
        for p in index:
            proj_path = os.path.join(settings.PROJECTS_DIR, p['project_id'])
            if os.path.exists(proj_path):
                valid_projects.append(p)
            else:
                changed = True
        
        if changed:
            cls._save_index(valid_projects)
            
        return valid_projects

    @classmethod
    def get_project_metadata(cls, project_id: str) -> Optional[Dict[str, Any]]:
        index = cls._load_index()
        return next((p for p in index if p['project_id'] == project_id), None)

    @classmethod
    def remove_project(cls, project_id: str):
        index = cls._load_index()
        new_index = [p for p in index if p['project_id'] != project_id]
        cls._save_index(new_index)
