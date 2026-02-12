import joblib

def load_model():
    return joblib.load("models/model.pkl")


def predict(data):
    model = load_model()
    return model.predict(data)
