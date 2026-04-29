"""Training orchestrator — loads data, preprocesses, engineers features, trains both models."""
import sys
import os

# Allow running from the backend root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))

from app.utils.db import get_db
from app.utils.data_preprocessing import clean_traffic_records
from app.utils.feature_engineering import build_feature_matrix, FEATURE_COLS, TARGET_COL
from app.ml.models.random_forest import TrafficRandomForest
from app.ml.models.lstm_model import TrafficLSTMModel


def load_data_from_db(limit: int = 10_000) -> list[dict]:
    db = get_db()
    return list(db["traffic"].find({}, {"_id": 0}).limit(limit))


def run_training(model_type: str = "rf"):
    print(f"[train] Loading data from MongoDB …")
    records = load_data_from_db()
    if not records:
        print("[train] No data found. Run scripts/generate_sample_data.py first.")
        return

    print(f"[train] {len(records)} records loaded. Preprocessing …")
    df = clean_traffic_records(records)
    df = build_feature_matrix(df)

    # Drop rows with missing target
    df = df.dropna(subset=[TARGET_COL] + FEATURE_COLS)
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    if model_type == "rf":
        print("[train] Training Random Forest …")
        model = TrafficRandomForest()
        metrics = model.train(X, y)
        saved = model.save()
    else:
        print("[train] Training Gradient Boosting (LSTM proxy) …")
        model = TrafficLSTMModel()
        metrics = model.train(X, y)
        saved = model.save()

    print(f"[train] Done. Metrics: {metrics}")
    print(f"[train] Model saved to: {saved}")


if __name__ == "__main__":
    mtype = sys.argv[1] if len(sys.argv) > 1 else "rf"
    run_training(mtype)
