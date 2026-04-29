"""Traffic data API — GET /api/traffic"""
from flask import Blueprint, jsonify, request
from app.utils.db import get_db

traffic_bp = Blueprint("traffic", __name__, url_prefix="/api")


@traffic_bp.route("/traffic", methods=["GET"])
def get_traffic():
    """
    Return traffic records from MongoDB.

    Query params:
        limit    int  (default 100, max 1000)
        location str  (optional filter)
    """
    try:
        db = get_db()
    except RuntimeError:
        # MongoDB not available — return sample static data
        return jsonify({"source": "sample", "records": _sample_traffic()}), 200

    limit = min(int(request.args.get("limit", 100)), 1000)
    location = request.args.get("location")
    query = {}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}

    cursor = db["traffic"].find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
    records = list(cursor)

    if not records:
        return jsonify({"source": "sample", "records": _sample_traffic()}), 200

    return jsonify({"source": "mongodb", "records": records}), 200


# ────────────────────────────────────────────────────────────────────────────
def _sample_traffic() -> list[dict]:
    """Fallback static sample data when MongoDB is unavailable."""
    import random
    from datetime import datetime, timezone, timedelta

    locations = [
        "Silk Board Junction", "Hebbal Flyover", "KR Puram", "Electronic City",
        "Marathahalli", "Whitefield", "Koramangala", "Indiranagar",
    ]
    road_types = ["arterial", "highway", "local", "expressway"]

    records = []
    base_time = datetime.now(timezone.utc)
    for i in range(50):
        ts = base_time - timedelta(hours=i)
        records.append({
            "location": random.choice(locations),
            "road_type": random.choice(road_types),
            "vehicle_count": random.randint(500, 2200),
            "avg_speed_kmh": round(random.uniform(8, 65), 1),
            "travel_time_min": round(random.uniform(5, 55), 1),
            "pollution_index": round(random.uniform(80, 280), 1),
            "timestamp": ts.isoformat(),
        })
    return records
