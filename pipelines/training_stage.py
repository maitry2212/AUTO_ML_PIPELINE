from src.trainer import Trainer
from src.data_loader import load_data
from src.config import settings
import os
import yaml

def run_training():
    data_path = os.path.join(settings.DATA_DIR, "raw_dataset.csv")
    df = load_data(data_path)
    
    # Load params (simplified for DVC example)
    target = df.columns[-1]
    task_type = "classification" # Default
    model_id = "logistic_regression" # Default
    
    trainer = Trainer(experiment_name=settings.MLFLOW_EXPERIMENT_NAME)
    trainer.train(df, target, task_type, model_id)

if __name__ == "__main__":
    run_training()
