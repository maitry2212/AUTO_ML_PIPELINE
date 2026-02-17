import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
import mlflow
import mlflow.sklearn
import os
from src.config import settings
from src.preprocessor import DataPreprocessor
from src.model_selector import ModelSelector

import time

class Trainer:
    def __init__(self, experiment_name: str = "One_Click_Experiment"):
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(experiment_name)

    def train(self, df: pd.DataFrame, target: str, task_type: str, model_id: str):
        start_time = time.time()
        X = df.drop(columns=[target])
        y = df[target]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Preprocessing
        preprocessor_obj = DataPreprocessor()
        preprocessor = preprocessor_obj.build_pipeline(X_train)
        
        # Model
        model = ModelSelector.get_model(model_id)

        # Full Pipeline
        full_pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('model', model)
        ])

        with mlflow.start_run() as run:
            # Train
            full_pipeline.fit(X_train, y_train)
            
            # Predictions
            y_pred = full_pipeline.predict(X_test)
            
            # Metrics
            metrics = {}
            if task_type == "classification":
                metrics["accuracy"] = accuracy_score(y_test, y_pred)
                metrics["f1"] = f1_score(y_test, y_pred, average='weighted')
            else:
                metrics["mse"] = mean_squared_error(y_test, y_pred)
                metrics["r2"] = r2_score(y_test, y_pred)

            duration = time.time() - start_time
            # Logging
            mlflow.log_params({"model_id": model_id, "task_type": task_type})
            mlflow.log_metrics(metrics)
            mlflow.log_metric("duration", duration)
            
            # Log Model and Register
            model_info = mlflow.sklearn.log_model(
                sk_model=full_pipeline,
                artifact_path="model",
                registered_model_name=f"Model_{model_id}"
            )

            return {
                "run_id": run.info.run_id,
                "model_id": model_id,
                "metrics": metrics,
                "duration": duration,
                "model_uri": model_info.model_uri
            }
