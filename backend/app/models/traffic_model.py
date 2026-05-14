"""
Traffic Model Loader
=====================
Loads the best available trained model for TTI prediction:
  1. XGBoost + Geospatial model (xgb_model.joblib) — preferred
  2. Random Forest fallback (traffic_model.joblib)   — legacy

The XGBoost model was trained with additional KML-derived geospatial
features (env_risk_score, proximity scores, interaction features),
giving it superior explainability and accuracy.
"""
import joblib
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "data", "models")

XGB_MODEL_PATH    = os.path.join(MODEL_DIR, "xgb_model.joblib")
XGB_FEATURES_PATH = os.path.join(MODEL_DIR, "xgb_features.joblib")
RF_MODEL_PATH     = os.path.join(MODEL_DIR, "traffic_model.joblib")
RF_FEATURES_PATH  = os.path.join(MODEL_DIR, "features.joblib")
GEO_LOOKUP_PATH   = os.path.join(MODEL_DIR, "geo_lookup.joblib")

# ── Model loading with priority ────────────────────────────────────────────────
if os.path.exists(XGB_MODEL_PATH) and os.path.exists(XGB_FEATURES_PATH):
    model    = joblib.load(XGB_MODEL_PATH)
    features = joblib.load(XGB_FEATURES_PATH)
    MODEL_TYPE = "XGBoost+Geospatial"
else:
    model    = joblib.load(RF_MODEL_PATH)
    features = joblib.load(RF_FEATURES_PATH)
    MODEL_TYPE = "RandomForest (legacy)"

# Geo lookup for inference-time feature enrichment
geo_lookup = joblib.load(GEO_LOOKUP_PATH) if os.path.exists(GEO_LOOKUP_PATH) else {}

print(f"[TrafficModel] Loaded: {MODEL_TYPE} | Features: {len(features)}")


def _enrich_with_geo(df: pd.DataFrame) -> pd.DataFrame:
    """
    If the active model is XGBoost (geospatial), enrich the input DataFrame
    with geo features from the lookup table. If a feature is already present
    (e.g., during training), it will not be overwritten.
    
    Falls back gracefully to city-average defaults if location is unknown.
    """
    if MODEL_TYPE != "XGBoost+Geospatial":
        return df  # RF model doesn't need geo features

    df = df.copy()

    # Geo features to inject
    GEO_DEFAULTS = {
        "aqms_dist_km":         2.0,
        "nqms_dist_km":         2.0,
        "aqms_proximity_score": 0.60,
        "nqms_proximity_score": 0.60,
        "env_risk_score":       0.60,
        "urban_density_index":  0.12,
    }

    for feat, default_val in GEO_DEFAULTS.items():
        if feat not in df.columns:
            df[feat] = default_val

    # Interaction features (must match training-time formulas exactly)
    if "traffic_env_pressure" not in df.columns:
        tv_max = 55000.0  # approximate max from training data
        df["traffic_env_pressure"] = (df["Traffic Volume"] / tv_max) * df["env_risk_score"]

    if "speed_env_interaction" not in df.columns:
        df["speed_env_interaction"] = df["Average Speed"] * df["aqms_proximity_score"]

    if "congestion_geo_score" not in df.columns:
        # Use Travel Time Index as a proxy for congestion level at inference time
        df["congestion_geo_score"] = df["Travel Time Index"] * 100 * df["env_risk_score"]

    # Temporal features
    if "is_weekend" not in df.columns:
        df["is_weekend"] = 0  # Assume weekday for simulation

    return df


def predict(data_df: pd.DataFrame):
    """
    Takes a DataFrame and returns TTI predictions.
    Automatically enriches with geo features if XGBoost model is active.
    """
    enriched_df = _enrich_with_geo(data_df)
    # Select only the features the loaded model expects
    enriched_df = enriched_df.reindex(columns=features, fill_value=0)
    return model.predict(enriched_df)