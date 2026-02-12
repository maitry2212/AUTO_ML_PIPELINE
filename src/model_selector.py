from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression

def get_models(task):

    if task == "classification":
        return {
            "logistic": LogisticRegression(max_iter=1000),
            "random_forest": RandomForestClassifier()
        }

    else:
        return {
            "linear": LinearRegression(),
            "random_forest": RandomForestRegressor()
        }
