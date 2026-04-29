import joblib
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, 'data/models/traffic_model.joblib')
FEATURES_PATH = os.path.join(BASE_DIR, 'data/models/features.joblib')

# Load model + features
model = joblib.load(MODEL_PATH)
features = joblib.load(FEATURES_PATH)


def predict(data_df):
    """
    Takes a DataFrame and returns predictions
    """
    data_df = data_df[features]
    return model.predict(data_df)