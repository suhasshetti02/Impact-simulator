"""
Generate synthetic traffic data and insert into MongoDB.
Usage: python scripts/generate_sample_data.py [--count 500]
"""
import sys
import os
import random
import argparse
from datetime import datetime, timezone, timedelta

# Allow imports from backend root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

from app.utils.db import get_db
from app.models.traffic_model import make_traffic_document, ROAD_TYPES

LOCATIONS = [
    "Silk Board Junction", "Hebbal Flyover", "KR Puram Bridge",
    "Electronic City Phase 1", "Marathahalli Bridge", "Whitefield Main Road",
    "Koramangala 5th Block", "Indiranagar 100ft Road", "Bannerghatta Road",
    "Outer Ring Road Bellandur",
]


def generate_records(count: int = 500, days_back: int = 30) -> list[dict]:
    records = []
    base_time = datetime.now(timezone.utc)

    for _ in range(count):
        location = random.choice(LOCATIONS)
        road_type = random.choice(ROAD_TYPES)
        # Peak-hour logic
        offset_hours = random.uniform(0, days_back * 24)
        ts = base_time - timedelta(hours=offset_hours)
        hour = ts.hour
        is_peak = (7 <= hour <= 10) or (17 <= hour <= 20)

        vehicle_count = random.randint(1200, 2100) if is_peak else random.randint(300, 1000)
        avg_speed = random.uniform(8, 22) if is_peak else random.uniform(35, 65)
        travel_time = random.uniform(25, 55) if is_peak else random.uniform(8, 25)
        pollution = random.uniform(180, 280) if is_peak else random.uniform(70, 140)

        records.append(make_traffic_document(
            location=location,
            road_type=road_type,
            vehicle_count=vehicle_count,
            avg_speed_kmh=round(avg_speed, 1),
            travel_time_min=round(travel_time, 1),
            pollution_index=round(pollution, 1),
            timestamp=ts,
        ))
    return records


def main():
    parser = argparse.ArgumentParser(description="Insert synthetic traffic data into MongoDB")
    parser.add_argument("--count", type=int, default=500, help="Number of records to generate")
    parser.add_argument("--clear", action="store_true", help="Clear existing data before inserting")
    args = parser.parse_args()

    db = get_db()
    col = db["traffic"]

    if args.clear:
        deleted = col.delete_many({}).deleted_count
        print(f"[setup] Cleared {deleted} existing records.")

    records = generate_records(args.count)
    result = col.insert_many(records)
    print(f"[generate] Inserted {len(result.inserted_ids)} traffic records into MongoDB.")


if __name__ == "__main__":
    main()
