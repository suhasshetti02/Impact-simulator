"""
Seed MongoDB Atlas with the Bengaluru traffic dataset.

Usage (from backend/ directory with venv active):
    python scripts/seed_db.py

This script:
  1. Reads data/Banglore_traffic_Dataset.csv
  2. Normalises column names to match the API schema
  3. Encodes categorical fields
  4. Inserts all records into the 'traffic' collection
  5. Creates an index on 'timestamp' for fast queries
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

import pandas as pd
from datetime import datetime, timezone, timedelta
import random
from app.utils.db import get_db

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "Banglore_traffic_Dataset.csv")


WEATHER_MAP   = {"Clear": 0, "Overcast": 1, "Fog": 2, "Rain": 3, "Windy": 4}
ROADWORK_MAP  = {"No": 0, "Yes": 1}
AREA_MAP      = {
    "Electronic City": 0, "Whitefield": 1, "Yeshwanthpur": 2,
    "Koramangala": 3, "M.G. Road": 4, "Jayanagar": 5,
    "Hebbal": 6, "Indiranagar": 7,
}

# Pollution proxy: estimated from congestion level * area factor
def _estimate_pollution(row):
    base = row.get("Congestion Level", 50) * 2.0
    incident_boost = row.get("Incident Reports", 0) * 15
    return round(min(base + incident_boost + random.uniform(-10, 10), 400), 1)


def seed():
    print("[seed] Reading CSV...")
    df = pd.read_csv(DATA_PATH)
    print(f"[seed] {len(df)} rows loaded.")

    db = get_db()
    collection = db["traffic"]

    # Check if already seeded
    if collection.count_documents({}) > 0:
        print(f"[seed] Collection already has {collection.count_documents({})} records. Skipping.")
        print("[seed] To re-seed, drop the collection first: db.traffic.drop()")
        return

    base_time = datetime(2024, 1, 1, tzinfo=timezone.utc)
    records   = []

    for i, row in df.iterrows():
        try:
            date_str = str(row.get("Date", "2024-01-01"))
            ts       = pd.to_datetime(date_str, errors="coerce")
            if pd.isna(ts):
                ts = base_time + timedelta(hours=i)
            else:
                ts = ts.replace(tzinfo=timezone.utc) + timedelta(hours=random.randint(0, 23))

            area     = str(row.get("Area Name", "Unknown"))
            weather  = str(row.get("Weather Conditions", "Clear"))
            roadwork = str(row.get("Roadwork and Construction Activity", "No"))

            record = {
                "location":                  area,
                "road_intersection":         str(row.get("Road/Intersection Name", "")),
                "timestamp":                 ts,
                "vehicle_count":             int(row.get("Traffic Volume", 0)),
                "avg_speed_kmh":             round(float(row.get("Average Speed", 40)), 2),
                "travel_time_min":           round(float(row.get("Travel Time Index", 1.2)) * 30, 2),
                "pollution_index":           _estimate_pollution(row),
                "congestion_level":          round(float(row.get("Congestion Level", 50)), 2),
                "road_capacity_util":        round(float(row.get("Road Capacity Utilization", 70)) / 100, 4),
                "incident_reports":          int(row.get("Incident Reports", 0)),
                "public_transport_usage":    round(float(row.get("Public Transport Usage", 50)), 2),
                "weather":                   weather,
                "roadwork":                  roadwork,
                "Area_encoded":              AREA_MAP.get(area, 0),
                "Weather_encoded":           WEATHER_MAP.get(weather, 0),
                "Roadwork_encoded":          ROADWORK_MAP.get(roadwork, 0),
            }
            records.append(record)
        except Exception as e:
            print(f"[seed] Skipping row {i}: {e}")
            continue

    print(f"[seed] Inserting {len(records)} records into MongoDB Atlas...")
    result = collection.insert_many(records)
    print(f"[seed] Inserted {len(result.inserted_ids)} records.")

    print("[seed] Creating index on 'timestamp'...")
    collection.create_index("timestamp")
    collection.create_index("location")
    print("[seed] Done! MongoDB Atlas seeded successfully.")


if __name__ == "__main__":
    seed()
