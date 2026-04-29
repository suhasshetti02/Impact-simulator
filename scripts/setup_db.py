"""
Set up MongoDB indexes and seed collections.
Usage: python scripts/setup_db.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

from pymongo import ASCENDING, DESCENDING
from app.utils.db import get_db


def setup():
    db = get_db()

    # ── traffic collection ──
    traffic = db["traffic"]
    traffic.create_index([("timestamp", DESCENDING)], name="idx_timestamp_desc")
    traffic.create_index([("location", ASCENDING)], name="idx_location")
    traffic.create_index([("road_type", ASCENDING)], name="idx_road_type")
    traffic.create_index(
        [("location", ASCENDING), ("timestamp", DESCENDING)],
        name="idx_location_timestamp",
    )
    print("[setup] traffic indexes created.")

    # ── policies collection ──
    policies = db["policies"]
    policies.create_index([("created_at", DESCENDING)], name="idx_created_at")
    policies.create_index([("policy_type", ASCENDING)], name="idx_policy_type")
    print("[setup] policies indexes created.")

    print("[setup] Database setup complete.")


if __name__ == "__main__":
    setup()
