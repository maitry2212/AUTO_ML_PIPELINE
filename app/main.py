from fastapi import FastAPI, UploadFile, File
import shutil
import os
from src.data_loader import load_data
from src.validator import detect_target, detect_task
from src.train import train

app = FastAPI()

@app.post("/upload")
async def upload(file: UploadFile = File(...)):

    os.makedirs("data", exist_ok=True)
    path = f"data/{file.filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    df = load_data(path)

    target = detect_target(df)
    task = detect_task(df[target])

    score = train(df, target, task)

    return {
        "message": "Training complete",
        "task": task,
        "score": score
    }
