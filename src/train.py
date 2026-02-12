import os
import joblib
import mlflow
import mlflow.sklearn
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score
from sklearn.pipeline import Pipeline
from src.config import Config
from src.model_selector import get_models
from src.preprocessor import build_preprocessor

def train(df, target_col, task):

    X = df.drop(columns=[target_col])
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=Config.TEST_SIZE,
        random_state=Config.RANDOM_STATE
    )

    models = get_models(task)
    best_score = -1
    best_pipeline = None

    for name, model in models.items():

        preprocessor = build_preprocessor(X)

        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model)
        ])

        pipeline.fit(X_train, y_train)

        preds = pipeline.predict(X_test)

        if task == "classification":
            score = accuracy_score(y_test, preds)
        else:
            score = r2_score(y_test, preds)

        if score > best_score:
            best_score = score
            best_pipeline = pipeline

    os.makedirs(Config.MODEL_DIR, exist_ok=True)
    joblib.dump(best_pipeline, f"{Config.MODEL_DIR}/model.pkl")

    mlflow.set_experiment(Config.EXPERIMENT_NAME)
    with mlflow.start_run():
        mlflow.log_metric("best_score", best_score)
        mlflow.sklearn.log_model(best_pipeline, "model")

    return best_score
