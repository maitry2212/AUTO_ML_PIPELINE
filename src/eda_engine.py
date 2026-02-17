import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import os
from src.config import settings

class EDAEngine:
    @staticmethod
    def generate_eda_report(df: pd.DataFrame, target: str) -> str:
        """
        Generates a series of Plotly figures and returns them as a dashboard JSON.
        """
        report = {}

        # 1. Missing Values Heatmap
        null_counts = df.isnull().sum()
        fig_nulls = px.bar(
            x=null_counts.index, 
            y=null_counts.values, 
            title="Missing Values per Column"
        )
        report["missing_values"] = json.loads(fig_nulls.to_json())

        # 2. Correlation Matrix
        numeric_df = df.select_dtypes(include=["number"])
        if not numeric_df.empty:
            corr_matrix = numeric_df.corr()
            fig_corr = px.imshow(
                corr_matrix, 
                text_auto=True, 
                title="Correlation Matrix"
            )
            report["correlation_matrix"] = json.loads(fig_corr.to_json())

        # 3. Target Distribution
        if target in df.columns:
            if df[target].nunique() < 20: # Likely categorical
                fig_target = px.histogram(df, x=target, title=f"Target Distribution: {target}")
            else: # Likely continuous
                fig_target = px.box(df, y=target, title=f"Target Distribution: {target}")
            report["target_distribution"] = json.loads(fig_target.to_json())

        # 4. Feature Distributions (Top 5 features)
        features = [col for col in numeric_df.columns if col != target][:5]
        feature_plots = {}
        for feature in features:
            fig = px.histogram(df, x=feature, title=f"Distribution of {feature}")
            feature_plots[feature] = json.loads(fig.to_json())
        report["feature_distributions"] = feature_plots

        # Save to artifacts
        report_path = os.path.join(settings.ARTIFACTS_DIR, "eda_report.json")
        with open(report_path, "w") as f:
            json.dump(report, f)

        return report_path
