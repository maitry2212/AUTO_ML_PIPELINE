import pandas as pd
import os
from src.config import settings

def load_data(file_path: str) -> pd.DataFrame:
    """Loads CSV data into a DataFrame."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    return pd.read_csv(file_path)

def save_data(df: pd.DataFrame, filename: str) -> str:
    """Saves DataFrame to the data directory."""
    path = os.path.join(settings.DATA_DIR, filename)
    df.to_csv(path, index=False)
    return path
