import mlflow.sklearn
import pandas as pd
from src.registry import ModelRegistry

class Predictor:
    def __init__(self, model_name: str):
        self.registry = ModelRegistry()
        self.model_uri = self.registry.get_production_model_uri(model_name)
        try:
            self.model = mlflow.sklearn.load_model(self.model_uri)
        except Exception:
            # Fallback to latest if Production doesn't exist yet
            self.model = None

    def predict(self, df: pd.DataFrame):
        if self.model is None:
            raise RuntimeError("No model loaded for prediction.")
        return self.model.predict(df).tolist()
