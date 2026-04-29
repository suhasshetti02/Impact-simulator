"""Evaluation metrics for regression models."""
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def rmse(y_true, y_pred) -> float:
    """Root Mean Squared Error."""
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def mae(y_true, y_pred) -> float:
    """Mean Absolute Error."""
    return float(mean_absolute_error(y_true, y_pred))


def r2(y_true, y_pred) -> float:
    """R² coefficient of determination."""
    return float(r2_score(y_true, y_pred))


def all_metrics(y_true, y_pred) -> dict:
    """Return all metrics as a dict."""
    return {
        "rmse": rmse(y_true, y_pred),
        "mae": mae(y_true, y_pred),
        "r2": r2(y_true, y_pred),
    }
