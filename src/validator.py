def detect_target(df):
    possible_targets = ["target", "label", "class", "outcome"]

    for col in df.columns:
        if col.lower() in possible_targets:
            return col

    return df.columns[-1]


def detect_task(y):
    if y.dtype == "object" or y.nunique() < 20:
        return "classification"
    return "regression"
