import pandas as pd
from src.preprocessor import DataPreprocessor
from src.data_loader import load_data
from src.config import settings
import os

def run_preprocessing():
    data_path = os.path.join(settings.DATA_DIR, "raw_dataset.csv")
    df = load_data(data_path)
    
    preprocessor = DataPreprocessor()
    preprocessor.build_pipeline(df.drop(columns=[df.columns[-1]])) # Dummy target assumption for stage
    
    save_path = os.path.join(settings.MODELS_DIR, "preprocessor.joblib")
    preprocessor.save(save_path)

if __name__ == "__main__":
    run_preprocessing()
