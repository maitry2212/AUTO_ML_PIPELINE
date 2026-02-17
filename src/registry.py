import mlflow
from mlflow.tracking import MlflowClient
from src.config import settings

class ModelRegistry:
    def __init__(self):
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        self.client = MlflowClient()

    def promote_to_production(self, model_name: str, version: int):
        """Promotes a specific model version to Production stage."""
        self.client.transition_model_version_stage(
            name=model_name,
            version=version,
            stage="Production",
            archive_existing_versions=True
        )

    def get_production_model_uri(self, model_name: str) -> str:
        """Returns the URI of the model currently in Production."""
        return f"models:/{model_name}/Production"

    def get_latest_version(self, model_name: str) -> int:
        """Returns the latest version of a registered model."""
        versions = self.client.get_latest_versions(model_name, stages=["None"])
        if not versions:
            return 1
        return int(versions[0].version)
