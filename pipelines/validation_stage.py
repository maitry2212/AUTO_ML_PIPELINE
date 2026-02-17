import pandas as pd
from src.validator import DataValidator
from src.data_loader import load_data
from src.config import settings
import os

def run_validation():
    data_path = os.path.join(settings.DATA_DIR, "raw_dataset.csv")
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}")
        return

    df = load_data(data_path)
    is_valid, errors = DataValidator.validate_dataset(df)
    
    status_path = os.path.join(settings.ARTIFACTS_DIR, "val_status.txt")
    with open(status_path, "w") as f:
        if is_valid:
            f.write("VALID")
        else:
            f.write(f"INVALID: {', '.join(errors)}")

if __name__ == "__main__":
    run_validation()
