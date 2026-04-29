"""
LSTM-style time-series predictor using sklearn's GradientBoostingRegressor as a
lightweight substitute (no TensorFlow dependency required for Expo/web usage).
The interface mirrors TrafficRandomForest so they are interchangeable.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "data", "models", "lstm_model.joblib"
)


class TrafficLSTMModel:
    """
    Gradient-Boosting based sequence predictor for traffic travel time.
    The 'LSTM' label here reflects the intended time-series role; the underlying
    estimator is sklearn GradientBoostingRegressor for zero-dependency overhead.
    Swap out for a real LSTM (TF/PyTorch) when GPU resources are available.
    """

    def __init__(self, n_estimators: int = 300, learning_rate: float = 0.05, max_depth: int = 5):
        self.model = GradientBoostingRegressor(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            max_depth=max_depth,
            random_state=42,
        )
        self._is_trained = False

    # ------------------------------------------------------------------
    def train(self, X: pd.DataFrame, y: pd.Series) -> dict:
        from app.ml.evaluation.metrics import rmse, mae, r2

        X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_tr, y_tr)
        self._is_trained = True

        y_pred = self.model.predict(X_val)
        return {
            "val_rmse": rmse(y_val, y_pred),
            "val_mae": mae(y_val, y_pred),
            "val_r2": r2(y_val, y_pred),
            "n_train": len(X_tr),
            "n_val": len(X_val),
        }

    # ------------------------------------------------------------------
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if not self._is_trained:
            raise RuntimeError("Model not trained. Call train() or load() first.")
        return self.model.predict(X)

    # ------------------------------------------------------------------
    def save(self, path: str | None = None) -> str:
        path = path or MODEL_PATH
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        return path

    # ------------------------------------------------------------------
    def load(self, path: str | None = None) -> "TrafficLSTMModel":
        path = path or MODEL_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"No saved model at {path}")
        self.model = joblib.load(path)
        self._is_trained = True
        return self
