"""Random Forest regressor wrapper for traffic prediction."""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "models", "rf_model.joblib")


class TrafficRandomForest:
    """
    Wraps scikit-learn RandomForestRegressor with a stable train/predict API.
    Predicts `travel_time_min` from engineered traffic features.
    """

    def __init__(self, n_estimators: int = 200, max_depth: int = 12, random_state: int = 42):
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            n_jobs=-1,
            random_state=random_state,
        )
        self._is_trained = False

    # ------------------------------------------------------------------
    def train(self, X: pd.DataFrame, y: pd.Series) -> dict:
        """
        Fit the model. Returns a dict with train/val RMSE and R².
        """
        from app.ml.evaluation.metrics import rmse, mae, r2

        X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_tr, y_tr)
        self._is_trained = True

        y_pred_val = self.model.predict(X_val)
        return {
            "val_rmse": rmse(y_val, y_pred_val),
            "val_mae": mae(y_val, y_pred_val),
            "val_r2": r2(y_val, y_pred_val),
            "n_train": len(X_tr),
            "n_val": len(X_val),
        }

    # ------------------------------------------------------------------
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if not self._is_trained:
            raise RuntimeError("Model has not been trained yet. Call train() or load() first.")
        return self.model.predict(X)

    # ------------------------------------------------------------------
    def save(self, path: str | None = None) -> str:
        path = path or MODEL_PATH
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        return path

    # ------------------------------------------------------------------
    def load(self, path: str | None = None) -> "TrafficRandomForest":
        path = path or MODEL_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"No saved model found at {path}")
        self.model = joblib.load(path)
        self._is_trained = True
        return self

    # ------------------------------------------------------------------
    def feature_importances(self, feature_names: list[str]) -> dict:
        """Return feature importance as a sorted dict."""
        if not self._is_trained:
            raise RuntimeError("Model not trained yet.")
        imps = dict(zip(feature_names, self.model.feature_importances_))
        return dict(sorted(imps.items(), key=lambda x: x[1], reverse=True))
