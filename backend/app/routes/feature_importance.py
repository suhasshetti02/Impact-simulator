"""Feature importance API — GET /api/feature-importance"""
import os
import joblib
from flask import Blueprint, jsonify

feature_bp = Blueprint("feature", __name__, url_prefix="/api")

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH    = os.path.join(BASE_DIR, "data", "models", "traffic_model.joblib")
FEATURES_PATH = os.path.join(BASE_DIR, "data", "models", "features.joblib")

# Human-readable labels for the feature columns
_FEATURE_LABELS = {
    "Traffic Volume":            "Traffic Volume",
    "Average Speed":             "Average Speed",
    "Travel Time Index":         "Travel Time Index",
    "Road Capacity Utilization": "Road Capacity Utilization",
    "Incident Reports":          "Incident Reports",
    "Area_encoded":              "Area / Location",
    "Weather_encoded":           "Weather Conditions",
    "Roadwork_encoded":          "Roadwork Activity",
    "day_of_week":               "Day of Week",
    "month":                     "Month",
}


@feature_bp.route("/feature-importance", methods=["GET"])
def feature_importance():
    """
    Return the trained model's feature importances as a sorted list.

    Response:
    {
        "features": [
            { "name": "Traffic Volume", "importance": 0.312, "pct": 31.2 },
            ...
        ]
    }
    """
    try:
        model    = joblib.load(MODEL_PATH)
        features = joblib.load(FEATURES_PATH)
        imps     = model.feature_importances_
    except Exception as exc:
        return jsonify({"error": f"Could not load model: {exc}"}), 500

    pairs = sorted(
        zip(features, imps),
        key=lambda x: x[1],
        reverse=True,
    )

    result = [
        {
            "name":       _FEATURE_LABELS.get(f, f),
            "key":        f,
            "importance": round(float(imp), 5),
            "pct":        round(float(imp) * 100, 2),
        }
        for f, imp in pairs
    ]

    return jsonify({"features": result, "model": "RandomForest"}), 200
