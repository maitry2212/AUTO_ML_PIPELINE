from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import io
import json
import os
from typing import List, Optional

from src.config import settings
from src.data_loader import save_data
from src.validator import DataValidator
from src.eda_engine import EDAEngine
from src.model_suggester import ModelSuggester
from src.trainer import Trainer
from src.registry import ModelRegistry
from src.predictor import Predictor
from src.storage_manager import StorageManager
from src.history_manager import HistoryManager

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for current session
current_session = {
    "project_id": None,
    "df": None,
    "task_type": None,
    "target": None
}

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...), 
    task_type: str = Form(...),
    target_column: str = Form(...)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Validate
    is_valid, errors = DataValidator.validate_dataset(df)
    if not is_valid:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    if not DataValidator.check_target_exists(df, target_column):
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found.")
    
    # Validate Task Alignment
    is_aligned, message = DataValidator.validate_task_alignment(df, target_column, task_type)
    if not is_aligned:
        raise HTTPException(status_code=400, detail=message)
    
    # Create project ID and storage
    project_id = StorageManager.create_project_structure()
    StorageManager.save_dataset(project_id, df, "raw_data.csv")
    
    # Save for DVC (backward compatibility)
    save_data(df, "raw_dataset.csv")
    
    # Update History index
    HistoryManager.add_project(project_id, {
        "dataset_name": file.filename,
        "task_type": task_type,
        "target": target_column,
        "score": None
    })
    
    # Store in session
    current_session["project_id"] = project_id
    current_session["df"] = df
    current_session["task_type"] = task_type
    current_session["target"] = target_column
    
    return {
        "message": "Dataset uploaded and validated successfully.",
        "project_id": project_id
    }

@app.get("/projects")
async def list_projects():
    return HistoryManager.get_all_projects()

@app.get("/project/{project_id}")
async def load_project(project_id: str):
    metadata = HistoryManager.get_project_metadata(project_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Project not found")
        
    df = StorageManager.load_dataset(project_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found in storage")
        
    eda_data = StorageManager.load_json(project_id, "eda.json")
    results = StorageManager.load_json(project_id, "results.json")
    
    # Update active session
    current_session["project_id"] = project_id
    current_session["df"] = df
    current_session["task_type"] = metadata["task_type"]
    current_session["target"] = metadata["target"]
    
    return {
        "metadata": metadata,
        "eda_data": eda_data,
        "training_results": results
    }

@app.delete("/project/{project_id}")
async def delete_project(project_id: str):
    StorageManager.delete_project(project_id)
    HistoryManager.remove_project(project_id)
    if current_session["project_id"] == project_id:
        current_session["project_id"] = None
        current_session["df"] = None
    return {"message": "Project deleted successfully"}

@app.get("/eda")
async def get_eda():
    if current_session["df"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
    
    report_path = EDAEngine.generate_eda_report(current_session["df"], current_session["target"])
    with open(report_path, "r") as f:
        report_data = json.load(f)
    
    # Persistent storage
    if current_session["project_id"]:
        StorageManager.save_json(current_session["project_id"], report_data, "eda.json")
        
    return report_data

@app.get("/model-suggestions")
async def get_suggestions():
    if current_session["df"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
    
    suggestions = ModelSuggester.suggest_models(current_session["df"], current_session["task_type"])
    return {"suggestions": suggestions}

@app.post("/train")
async def train_model(model_id: str):
    if current_session["df"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
    
    trainer = Trainer(experiment_name=settings.MLFLOW_EXPERIMENT_NAME)
    try:
        result = trainer.train(
            current_session["df"], 
            current_session["target"], 
            current_session["task_type"], 
            model_id
        )
    except ValueError as e:
        if "Unknown label type" in str(e) or "classification" in str(e).lower():
            raise HTTPException(
                status_code=400, 
                detail=f"Task mismatch error: {str(e)}. This usually happens when you try to use a Classifier on a Regression task (continuous target). Please re-upload and select the correct task type."
            )
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
    
    # Persistent storage
    if current_session["project_id"]:
        StorageManager.save_json(current_session["project_id"], result, "results.json")
        # Update index with best score
        score = list(result["metrics"].values())[0]
        metadata = HistoryManager.get_project_metadata(current_session["project_id"])
        if metadata:
            metadata["score"] = score
            HistoryManager.add_project(current_session["project_id"], metadata)
            
    return result

@app.post("/promote")
async def promote_model(model_id: str, version: int):
    registry = ModelRegistry()
    registry.promote_to_production(f"Model_{model_id}", version)
    return {"message": f"Model_{model_id} version {version} promoted to Production."}

@app.post("/predict")
async def predict(model_id: str, data: dict):
    try:
        predictor = Predictor(f"Model_{model_id}")
        input_df = pd.DataFrame([data])
        prediction = predictor.predict(input_df)
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
