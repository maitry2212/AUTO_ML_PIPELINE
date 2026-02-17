import pandas as pd
from typing import List, Dict

class ModelSuggester:
    @staticmethod
    def suggest_models(df: pd.DataFrame, task_type: str) -> List[Dict]:
        """Suggests models based on task type and dataset metrics."""
        n_samples = len(df)
        n_features = len(df.columns)
        
        suggestions = []
        
        if task_type == "classification":
            suggestions = [
                {"name": "Logistic Regression", "id": "logistic_regression", "reason": "Good baseline for classification."},
                {"name": "Random Forest", "id": "random_forest_classifier", "reason": "Handles non-linear patterns well."},
                {"name": "XGBoost", "id": "xgboost_classifier", "reason": "High performance for structured data."}
            ]
        elif task_type == "regression":
            suggestions = [
                {"name": "Linear Regression", "id": "linear_regression", "reason": "Simple baseline for regression."},
                {"name": "Random Forest Regressor", "id": "random_forest_regressor", "reason": "Robust for regression tasks."},
                {"name": "Gradient Boosting", "id": "gradient_boosting_regressor", "reason": "Effective for complex regression."}
            ]
            
        return suggestions
