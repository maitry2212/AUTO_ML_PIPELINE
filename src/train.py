import pandas as pd
import mlflow
import mlflow.sklearn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

def train_model(data_path):
    df = pd.read_csv(data_path)

    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)

    mlflow.set_experiment("one_click_ml")

    with mlflow.start_run():
        mlflow.log_param("model", "RandomForest")
        mlflow.log_metric("accuracy", acc)
        mlflow.sklearn.log_model(model, "model")

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/model.pkl")

    print("Training complete. Accuracy:", acc)
