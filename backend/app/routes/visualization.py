"""Visualization API — GET /api/visualize"""
from flask import Blueprint, jsonify, request
from app.utils.db import get_db
import random
from datetime import datetime, timezone, timedelta

visualization_bp = Blueprint("visualization", __name__, url_prefix="/api")


@visualization_bp.route("/visualize", methods=["GET"])
def visualize():
    """
    Return aggregated, chart-ready data.

    Query params:
        metric   : "traffic" | "pollution" | "speed" (default "traffic")
        hours    : int number of hours to look back (default 24, max 168)
        location : optional location filter

    Response:
    {
        "metric": "traffic",
        "labels": [...],
        "series": [{ "name": "Silk Board", "data": [...] }]
    }
    """
    metric = request.args.get("metric", "traffic")
    hours = min(int(request.args.get("hours", 24)), 168)
    location_filter = request.args.get("location")

    valid_metrics = ["traffic", "pollution", "speed"]
    if metric not in valid_metrics:
        return jsonify({"error": f"metric must be one of {valid_metrics}"}), 400

    try:
        db = get_db()
        since = datetime.now(timezone.utc) - timedelta(hours=hours)
        query = {"timestamp": {"$gte": since}}
        if location_filter:
            query["location"] = {"$regex": location_filter, "$options": "i"}

        records = list(db["traffic"].find(query, {"_id": 0}).sort("timestamp", 1))
        if records:
            return jsonify(_aggregate_chart_data(records, metric, hours)), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        pass  # MongoDB unavailable or other error — fall through to generated data

    return jsonify(_generate_chart_data(metric, hours)), 200


# ────────────────────────────────────────────────────────────────────────────
def _aggregate_chart_data(records: list, metric: str, hours: int) -> dict:
    """Aggregate DB records into chart series."""
    from collections import defaultdict

    metric_map = {
        "traffic": "vehicle_count",
        "pollution": "pollution_index",
        "speed": "avg_speed_kmh",
    }
    field = metric_map[metric]

    # Group by location and hour
    loc_hourly: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    for rec in records:
        ts = rec.get("timestamp", "")
        hour_label = str(ts)[:13] if ts else "unknown"
        loc_hourly[rec.get("location", "Unknown")][hour_label].append(rec.get(field, 0))

    labels = sorted({h for loc in loc_hourly.values() for h in loc})
    series = []
    for loc, hour_data in loc_hourly.items():
        data = [
            round(sum(hour_data.get(label, [0])) / max(len(hour_data.get(label, [1])), 1), 2)
            for label in labels
        ]
        series.append({"name": loc, "data": data})

    return {"metric": metric, "labels": labels, "series": series}


def _generate_chart_data(metric: str, hours: int) -> dict:
    """Return synthetic chart data when MongoDB is unavailable."""
    locations = ["Silk Board", "Hebbal", "Whitefield", "Electronic City"]
    base_time = datetime.now(timezone.utc)
    labels = [
        (base_time - timedelta(hours=hours - i)).strftime("%H:%M")
        for i in range(min(hours, 48))
    ]

    metric_ranges = {
        "traffic": (600, 2100),
        "pollution": (90, 280),
        "speed": (10, 65),
    }
    lo, hi = metric_ranges[metric]

    series = []
    for loc in locations:
        data = [round(random.uniform(lo, hi), 1) for _ in labels]
        series.append({"name": loc, "data": data})

    return {"metric": metric, "labels": labels, "series": series, "source": "sample"}
