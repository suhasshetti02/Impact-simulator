"""Feature engineering for traffic data."""
import pandas as pd
import numpy as np


ROAD_TYPES = ["arterial", "highway", "local", "expressway"]


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add hour-of-day, day-of-week, and peak-hour flag from the timestamp column."""
    df = df.copy()
    if "timestamp" not in df.columns:
        return df
    dt = pd.to_datetime(df["timestamp"])
    df["hour"] = dt.dt.hour
    df["day_of_week"] = dt.dt.dayofweek  # 0=Monday
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    # Peak hours: 7-10 AM and 5-8 PM
    df["is_peak"] = df["hour"].apply(lambda h: 1 if (7 <= h <= 10) or (17 <= h <= 20) else 0)
    return df


def add_congestion_index(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute a congestion index as:
        congestion_index = vehicle_count / (avg_speed_kmh + 1)

    Higher value = more congested.
    """
    df = df.copy()
    if "vehicle_count" in df.columns and "avg_speed_kmh" in df.columns:
        df["congestion_index"] = df["vehicle_count"] / (df["avg_speed_kmh"] + 1)
    return df


def add_road_type_dummies(df: pd.DataFrame) -> pd.DataFrame:
    """One-hot encode the road_type column."""
    df = df.copy()
    if "road_type" not in df.columns:
        for rt in ROAD_TYPES:
            df[f"road_{rt}"] = 0
        return df
    dummies = pd.get_dummies(df["road_type"], prefix="road")
    # Ensure all expected columns exist
    for rt in ROAD_TYPES:
        col = f"road_{rt}"
        if col not in dummies.columns:
            dummies[col] = 0
    df = pd.concat([df.drop(columns=["road_type"]), dummies[
        [f"road_{rt}" for rt in ROAD_TYPES]
    ]], axis=1)
    return df


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Apply all feature engineering steps and return the final feature DataFrame."""
    df = add_time_features(df)
    df = add_congestion_index(df)
    df = add_road_type_dummies(df)
    return df


FEATURE_COLS = [
    "vehicle_count",
    "avg_speed_kmh",
    "congestion_index",
    "hour",
    "day_of_week",
    "is_weekend",
    "is_peak",
    "road_arterial",
    "road_highway",
    "road_local",
    "road_expressway",
]

TARGET_COL = "travel_time_min"
