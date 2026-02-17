from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBClassifier
from typing import Any

class ModelSelector:
    @staticmethod
    def get_model(model_id: str) -> Any:
        """Returns an uninitialized scikit-learn or XGBoost model."""
        models = {
            # Classification
            "logistic_regression": LogisticRegression(max_iter=1000),
            "random_forest_classifier": RandomForestClassifier(n_estimators=100),
            "xgboost_classifier": XGBClassifier(use_label_encoder=False, eval_metric='logloss'),
            
            # Regression
            "linear_regression": LinearRegression(),
            "random_forest_regressor": RandomForestRegressor(n_estimators=100),
            "gradient_boosting_regressor": GradientBoostingRegressor()
        }
        
        if model_id not in models:
            raise ValueError(f"Model ID '{model_id}' is not supported.")
            
        return models[model_id]
