"""Feature importance API — GET /api/feature-importance (XGBoost + Geospatial)"""
import os
import joblib
import pandas as pd
from flask import Blueprint, jsonify

feature_bp = Blueprint("feature", __name__, url_prefix="/api")

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_DIR     = os.path.join(BASE_DIR, "data", "models")

_FEATURE_LABELS = {
    "Traffic Volume":            "Traffic Volume",
    "Average Speed":             "Avg Speed",
    "Travel Time Index":         "Travel Time Index",
    "Road Capacity Utilization": "Road Capacity",
    "Incident Reports":          "Incidents",
    "Area_encoded":              "Area / Location",
    "Weather_encoded":           "Weather",
    "Roadwork_encoded":          "Roadwork Activity",
    "day_of_week":               "Day of Week",
    "month":                     "Month",
    "is_weekend":                "Weekend",
    # NEW: Geospatial features
    "aqms_dist_km":              "Air Station Distance",
    "nqms_dist_km":              "Noise Station Distance",
    "aqms_proximity_score":      "Air Proximity Score",
    "nqms_proximity_score":      "Noise Proximity Score",
    "env_risk_score":            "Env. Risk Score (KML)",
    "urban_density_index":       "Urban Density (KML)",
    "traffic_env_pressure":      "Traffic-Env Pressure",
    "speed_env_interaction":     "Speed-Env Interaction",
    "congestion_geo_score":      "Congestion-Geo Score",
}


@feature_bp.route("/feature-importance", methods=["GET"])
def feature_importance():
    # Prefer XGBoost model + SHAP importance CSV
    shap_csv = os.path.join(BASE_DIR, "data", "shap_importance.csv")
    xgb_path = os.path.join(MODEL_DIR, "xgb_model.joblib")
    xgb_feat = os.path.join(MODEL_DIR, "xgb_features.joblib")

    try:
        if os.path.exists(shap_csv):
            df = pd.read_csv(shap_csv).sort_values("mean_shap", ascending=False)
            total = df["mean_shap"].sum()
            result = [
                {
                    "name":       _FEATURE_LABELS.get(row["feature"], row["feature"]),
                    "key":        row["feature"],
                    "importance": round(float(row["mean_shap"]), 5),
                    "pct":        round(float(row["mean_shap"]) / total * 100, 2) if total > 0 else 0,
                }
                for _, row in df.iterrows()
            ]
            return jsonify({"features": result, "model": "XGBoost+Geospatial", "source": "gain_importance"}), 200

        # Fallback: use XGBoost native feature importance
        if os.path.exists(xgb_path) and os.path.exists(xgb_feat):
            model    = joblib.load(xgb_path)
            features = joblib.load(xgb_feat)
            imp_dict = model.get_booster().get_score(importance_type="gain")
            pairs    = sorted(
                [(f, imp_dict.get(f, 0.0)) for f in features],
                key=lambda x: x[1], reverse=True
            )
            total = sum(v for _, v in pairs) or 1
            result = [
                {
                    "name":       _FEATURE_LABELS.get(f, f),
                    "key":        f,
                    "importance": round(float(v), 5),
                    "pct":        round(float(v) / total * 100, 2),
                }
                for f, v in pairs
            ]
            return jsonify({"features": result, "model": "XGBoost+Geospatial", "source": "gain"}), 200

        # Final fallback: RF model
        rf_model    = joblib.load(os.path.join(MODEL_DIR, "traffic_model.joblib"))
        rf_features = joblib.load(os.path.join(MODEL_DIR, "features.joblib"))
        pairs = sorted(zip(rf_features, rf_model.feature_importances_), key=lambda x: x[1], reverse=True)
        total = sum(v for _, v in pairs) or 1
        result = [
            {"name": _FEATURE_LABELS.get(f, f), "key": f,
             "importance": round(float(v), 5), "pct": round(float(v)/total*100, 2)}
            for f, v in pairs
        ]
        return jsonify({"features": result, "model": "RandomForest"}), 200

    except Exception as exc:
        return jsonify({"error": f"Could not load model: {exc}"}), 500
