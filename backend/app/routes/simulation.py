"""
POST /api/simulate — Run a single policy simulation (XGBoost + Environmental Engine).
"""
from flask import Blueprint, request, jsonify
import pandas as pd
from datetime import datetime, timezone
from app.simulation.scenario_engine import run_simulation
from app.simulation.env_engine import compute_environmental_delta
from app.utils.db import get_db
from app.utils.baselines import build_ml_input_vector, get_location_baseline

simulation_bp = Blueprint("simulation", __name__, url_prefix="/api")

_POLICY_POLLUTION_SENSITIVITY = {
    "tunnel":              0.75,
    "flyover":             0.80,
    "road_widening":       0.85,
    "signal_optimisation": 0.90,
    "metro_extension":     0.60,
}


def _compute_roi_score(deltas: dict, budget_crore: float) -> float:
    tt_pct   = abs(deltas["travel_time_min"]["change_pct"])
    poll_pct = abs(deltas["pollution_index"]["change_pct"])
    spd_pct  = abs(deltas["avg_speed_kmh"]["change_pct"])
    cap_pct  = abs(deltas["road_capacity"]["change_pct"])

    weighted = (
        tt_pct   * 0.35 +
        poll_pct * 0.25 +
        spd_pct  * 0.25 +
        cap_pct  * 0.15
    )
    budget_units = max(budget_crore / 100.0, 0.1)
    return round(weighted / budget_units, 3)


def _sdg9_kpis(deltas: dict) -> dict:
    tt_pct   = abs(deltas["travel_time_min"]["change_pct"])
    poll_pct = abs(deltas["pollution_index"]["change_pct"])
    cap_pct  = abs(deltas["road_capacity"]["change_pct"])
    spd_pct  = abs(deltas["avg_speed_kmh"]["change_pct"])

    return {
        "congestion_reduction":  {"value": round(tt_pct, 1),   "target": 30.0, "unit": "%", "label": "Urban Congestion Reduction"},
        "pollution_reduction":   {"value": round(poll_pct, 1),  "target": 20.0, "unit": "%", "label": "Pollution Index Reduction"},
        "capacity_improvement":  {"value": round(cap_pct, 1),   "target": 25.0, "unit": "%", "label": "Road Capacity Increase"},
        "speed_improvement":     {"value": round(spd_pct, 1),   "target": 20.0, "unit": "%", "label": "Average Speed Improvement"},
    }


@simulation_bp.route("/simulate", methods=["POST"])
def simulate():
    """Run a single policy simulation and return a full result payload."""

    # ── 1. Parse and validate request body ──────────────────────────────────
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    required = ["policy_type"]
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 400

    policy   = data.get("policy_type", "tunnel")
    location = data.get("location", "Silk Board Junction")
    budget   = float(data.get("budget_crore", 250))
    timeline = int(data.get("timeline_months", 24))
    cap_pct  = float(data.get("capacity_increase_pct", 30))
    div_pct  = float(data.get("diversion_pct", 40))

    # ── 2. Build location-aware baseline ────────────────────────────────────
    baseline = build_ml_input_vector(location)
    b_poll   = get_location_baseline(location).get("pollution_proxy", 170.0)

    # ── 3. Run simulation (XGBoost model via scenario_engine) ───────────────
    try:
        df  = pd.DataFrame([baseline])
        raw = run_simulation(df, policy, policy_params=data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Simulation failed", "detail": str(exc)}), 500

    # ── 4. Derive before/after traffic metrics ───────────────────────────────
    b_tti = raw["before"]
    a_tti = raw["after"]

    b_vol = baseline["Traffic Volume"]
    a_vol = round(b_vol * (a_tti / b_tti), 1) if b_tti > 0 else b_vol

    b_spd = baseline["Average Speed"]
    a_spd = round(min(b_spd * (b_tti / a_tti), 120.0), 1) if a_tti > 0 else b_spd

    b_tt  = round(b_tti * 30, 1)
    a_tt  = round(a_tti * 30, 1)

    poll_sensitivity = _POLICY_POLLUTION_SENSITIVITY.get(policy, 0.85)
    a_poll = round(b_poll * max(poll_sensitivity * (a_tti / b_tti), 0.3), 1) if b_tti > 0 else b_poll

    b_cap = round(b_vol / max(baseline["Road Capacity Utilization"], 0.01))
    if policy in ("tunnel", "road_widening"):
        a_cap = round(b_cap * (1 + cap_pct / 100))
    elif policy == "flyover":
        a_cap = round(b_cap * (1 + div_pct / 200))
    else:
        a_cap = b_cap

    def delta(bv, av):
        chg = round(av - bv, 2)
        pct = round((chg / bv) * 100, 1) if bv else 0
        return {"before": bv, "after": av, "change": chg, "change_pct": pct}

    deltas = {
        "vehicle_count":    delta(b_vol,  a_vol),
        "avg_speed_kmh":    delta(b_spd,  a_spd),
        "travel_time_min":  delta(b_tt,   a_tt),
        "pollution_index":  delta(b_poll, a_poll),
        "road_capacity":    delta(b_cap,  a_cap),
    }

    roi_score = _compute_roi_score(deltas, budget)
    sdg_kpis  = _sdg9_kpis(deltas)

    # ── 5. Sustainability & Economic Impact ──────────────────────────────────
    time_saved_min_per_vehicle = max(b_tt - a_tt, 0)
    time_saved_hours_per_day   = (time_saved_min_per_vehicle / 60.0) * a_vol
    fuel_saved_liters_per_day  = time_saved_hours_per_day * 0.5
    if policy == 'metro_extension':
        cars_removed = max(b_vol - a_vol, 0)
        fuel_saved_liters_per_day += (cars_removed * (b_tt / 60.0) * 0.5)

    val_time = time_saved_hours_per_day * 150.0
    val_fuel = fuel_saved_liters_per_day * 100.0
    economic_impact_inr_per_day = val_time + val_fuel

    poll_drop_pct = min(abs(deltas["pollution_index"]["change_pct"]), 100)
    vol_drop_pct  = min(abs(deltas["vehicle_count"]["change_pct"]), 100)
    sus_score = min(50 + (poll_drop_pct * 1.5) + (vol_drop_pct * 1.2), 99.9)
    if policy == "metro_extension":
        sus_score = min(sus_score + 15, 99.9)
    elif policy in ["tunnel", "road_widening"]:
        sus_score = max(sus_score - 10, 20.0)

    # ── 6. Environmental Intelligence Engine ─────────────────────────────────
    try:
        env_impact = compute_environmental_delta(
            location     = location,
            before_state = {"vehicle_count": b_vol, "avg_speed_kmh": b_spd, "road_capacity": b_cap},
            after_state  = {"vehicle_count": a_vol, "avg_speed_kmh": a_spd, "road_capacity": a_cap},
        )
    except Exception:
        env_impact = None  # Non-blocking: env engine failure must not crash the API

    # ── 7. Assemble result payload ───────────────────────────────────────────
    result = {
        "policy_type":      policy,
        "location":         location,
        "budget_crore":     budget,
        "timeline_months":  timeline,
        "before": {
            "vehicle_count":   b_vol,
            "avg_speed_kmh":   b_spd,
            "travel_time_min": b_tt,
            "pollution_index": b_poll,
            "road_capacity":   b_cap,
        },
        "after": {
            "vehicle_count":   a_vol,
            "avg_speed_kmh":   a_spd,
            "travel_time_min": a_tt,
            "pollution_index": a_poll,
            "road_capacity":   a_cap,
        },
        "deltas":              deltas,
        "roi_score":           roi_score,
        "sdg_kpis":            sdg_kpis,
        "impact": {
            "time_saved_hours_day":      round(time_saved_hours_per_day),
            "fuel_saved_liters_day":     round(fuel_saved_liters_per_day),
            "economic_value_inr_day":    round(economic_impact_inr_per_day),
            "sustainability_score":      round(sus_score, 1),
        },
        "environmental":       env_impact,   # NEW: full env intelligence block
        "traffic_improvement": raw["traffic_improvement"],
        "simulated_at":        datetime.now(timezone.utc).isoformat(),
    }

    # ── 8. Persist to MongoDB (best-effort) ──────────────────────────────────
    try:
        db = get_db()
        db["simulation_history"].insert_one({**result, "_location_key": location})
    except Exception:
        pass

    return jsonify(result), 200