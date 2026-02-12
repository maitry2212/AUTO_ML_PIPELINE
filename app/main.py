from fastapi import FastAPI, UploadFile, File
import shutil
import joblib
import os
from src.train import train_model

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"data/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    train_model(file_path)

    return {"message": "Model trained successfully!"}


@app.get("/predict")
def predict():
    model = joblib.load("models/model.pkl")
    return {"message": "Model ready for predictions"}
