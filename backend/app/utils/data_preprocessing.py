"""Data preprocessing utilities for traffic records."""
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler


def clean_traffic_records(records: list[dict]) -> pd.DataFrame:
    """
    Convert raw MongoDB traffic records to a clean DataFrame.

    Steps:
      1. Drop _id (ObjectId) column if present.
      2. Parse timestamp strings to datetime.
      3. Forward-fill then backward-fill numeric nulls.
      4. Remove rows where vehicle_count <= 0.
      5. Cap speed outliers at the 99th percentile.
    """
    df = pd.DataFrame(records)

    # Drop Mongo ObjectId
    if "_id" in df.columns:
        df = df.drop(columns=["_id"])

    # Parse timestamps
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df = df.dropna(subset=["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)

    # Fill numeric nulls
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[num_cols] = df[num_cols].ffill().bfill()

    # Remove bad rows
    if "vehicle_count" in df.columns:
        df = df[df["vehicle_count"] > 0]

    # Cap speed outliers
    if "avg_speed_kmh" in df.columns:
        cap = df["avg_speed_kmh"].quantile(0.99)
        df["avg_speed_kmh"] = df["avg_speed_kmh"].clip(upper=cap)

    return df.reset_index(drop=True)


def scale_features(df: pd.DataFrame, feature_cols: list[str]) -> tuple[pd.DataFrame, MinMaxScaler]:
    """
    Min-max scale the given feature columns.

    Returns the modified DataFrame and the fitted scaler (for inverse transform later).
    """
    scaler = MinMaxScaler()
    df = df.copy()
    df[feature_cols] = scaler.fit_transform(df[feature_cols])
    return df, scaler
