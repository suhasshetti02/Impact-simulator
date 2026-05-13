"""History API — GET /api/history"""
from flask import Blueprint, jsonify, request
from app.utils.db import get_db

history_bp = Blueprint("history", __name__, url_prefix="/api")


@history_bp.route("/history", methods=["GET"])
def get_history():
    """
    Return saved simulation results from MongoDB.

    Query params:
        limit    int  (default 20, max 100)
        policy   str  (optional filter by policy_type)
        location str  (optional filter by location)
    """
    try:
        db = get_db()
    except RuntimeError:
        return jsonify({"error": "Database unavailable"}), 503

    limit    = min(int(request.args.get("limit", 20)), 100)
    policy   = request.args.get("policy")
    location = request.args.get("location")

    query = {}
    if policy:
        query["policy_type"] = policy
    if location:
        query["location"] = {"$regex": location, "$options": "i"}

    cursor = (
        db["simulation_history"]
        .find(query, {"_id": 0, "_location_key": 0})
        .sort("simulated_at", -1)
        .limit(limit)
    )
    records = list(cursor)
    return jsonify({"count": len(records), "results": records}), 200


@history_bp.route("/history", methods=["DELETE"])
def clear_history():
    """Clear all saved simulation history."""
    try:
        db = get_db()
        result = db["simulation_history"].delete_many({})
        return jsonify({"deleted": result.deleted_count}), 200
    except RuntimeError:
        return jsonify({"error": "Database unavailable"}), 503
