from src.eda_engine import EDAEngine
from src.data_loader import load_data
from src.config import settings
import os

def run_eda():
    data_path = os.path.join(settings.DATA_DIR, "raw_dataset.csv")
    df = load_data(data_path)
    
    # Assuming target is the last column if not specified elsewhere
    target = df.columns[-1]
    EDAEngine.generate_eda_report(df, target)

if __name__ == "__main__":
    run_eda()
