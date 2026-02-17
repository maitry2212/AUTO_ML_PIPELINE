import pandas as pd
from typing import Tuple, List

class DataValidator:
    @staticmethod
    def validate_dataset(df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """Performs basic validation on the dataset."""
        errors = []
        if df.empty:
            errors.append("Dataset is empty.")
        
        if df.columns.duplicated().any():
            errors.append("Dataset contains duplicate columns.")
            
        return len(errors) == 0, errors

    @staticmethod
    def check_target_exists(df: pd.DataFrame, target: str) -> bool:
        """Checks if target column exists in the DataFrame."""
        return target in df.columns

    @staticmethod
    def validate_task_alignment(df: pd.DataFrame, target: str, task_type: str) -> Tuple[bool, str]:
        """Verifies if the target column data type matches the selected task type."""
        target_series = df[target].dropna()
        unique_count = target_series.nunique()
        is_numeric = pd.api.types.is_numeric_dtype(target_series)
        
        if task_type == "classification":
            # If target is numeric but has too many unique values relative to rows, it might be regression
            if is_numeric and unique_count > (len(df) * 0.2) and unique_count > 50:
                return False, f"Target column '{target}' has {unique_count} unique numeric values. Did you mean Regression? Classification usually works with discrete categories."
        
        elif task_type == "regression":
            if not is_numeric:
                return False, f"Target column '{target}' is non-numeric (object/string). Regression requires numeric target values."
            if unique_count < 10:
                # Warning rather than error, but let's return False for strictness if we want
                pass

        return True, ""
