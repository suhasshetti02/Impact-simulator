"""Comparison API — POST /api/compare"""
from flask import Blueprint, jsonify, request
from app.simulation.scenario_engine import run_comparison

comparison_bp = Blueprint("comparison", __name__, url_prefix="/api")


@comparison_bp.route("/compare", methods=["POST"])
def compare():
    """
    Compare multiple policy scenarios side-by-side.

    Request body (JSON):
    {
        "scenarios": [
            { "policy_type": "tunnel",  "capacity_increase_pct": 30, ... },
            { "policy_type": "flyover", "diversion_pct": 40, ... },
            ...
        ]
    }

    Response (JSON):
    {
        "count": 2,
        "results": [ { ... scenario result ... }, ... ]
    }
    """
    data = request.get_json(silent=True)
    if not data or "scenarios" not in data:
        return jsonify({"error": "Body must contain a 'scenarios' list"}), 400

    scenarios = data["scenarios"]
    if not isinstance(scenarios, list) or len(scenarios) == 0:
        return jsonify({"error": "'scenarios' must be a non-empty list"}), 400

    if len(scenarios) > 10:
        return jsonify({"error": "Maximum 10 scenarios per comparison"}), 400

    try:
        results = run_comparison(scenarios)
        return jsonify({"count": len(results), "results": results}), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422
    except Exception as exc:
        return jsonify({"error": "Comparison failed", "detail": str(exc)}), 500
