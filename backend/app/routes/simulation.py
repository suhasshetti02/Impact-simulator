from flask import Blueprint, request, jsonify
import pandas as pd
from app.simulation.scenario_engine import run_simulation

simulation_bp = Blueprint('simulation', __name__, url_prefix="/api")

@simulation_bp.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    policy    = data.get("policy_type", "tunnel")
    location  = data.get("location", "Silk Board Junction")
    budget    = data.get("budget_crore", 250)
    timeline  = data.get("timeline_months", 24)
    cap_pct   = float(data.get("capacity_increase_pct", 30))
    div_pct   = float(data.get("diversion_pct", 40))

    # Baseline traffic record with the features the ML model expects
    baseline = {
        "location":               location,
        "Traffic Volume":         1500.0,
        "Average Speed":          40.0,
        "Travel Time Index":      1.2,
        "Road Capacity Utilization": 0.8,
        "Incident Reports":       0,
        "Area_encoded":           1,
        "Weather_encoded":        1,
        "Roadwork_encoded":       0,
        "day_of_week":            2,
        "month":                  5,
    }

    df = pd.DataFrame([baseline])
    raw = run_simulation(df, policy, policy_params=data)

    # --- Build the rich nested response the frontend expects ---
    # Derive realistic before/after metric values from the model scalars
    b_tti  = raw["before"]          # Travel Time Index (model output)
    a_tti  = raw["after"]

    b_vol  = baseline["Traffic Volume"]
    a_vol  = round(b_vol * (a_tti / b_tti), 1) if b_tti else b_vol

    b_spd  = baseline["Average Speed"]
    a_spd  = round(b_spd * (b_tti / a_tti), 1) if a_tti else b_spd

    b_tt   = round(b_tti * 30, 1)   # proxy travel time in minutes
    a_tt   = round(a_tti * 30, 1)

    b_poll = 180.0
    a_poll = round(b_poll * (a_tti / b_tti), 1) if b_tti else b_poll

    b_cap  = 2000
    a_cap  = round(b_cap * (1 + cap_pct / 100)) if policy in ("tunnel", "road_widening") else b_cap

    def delta(bv, av):
        chg = round(av - bv, 2)
        pct = round((chg / bv) * 100, 1) if bv else 0
        return {"before": bv, "after": av, "change": chg, "change_pct": pct}

    result = {
        "policy_type":      policy,
        "location":         location,
        "budget_crore":     budget,
        "timeline_months":  timeline,
        "before": {
            "vehicle_count":    b_vol,
            "avg_speed_kmh":    b_spd,
            "travel_time_min":  b_tt,
            "pollution_index":  b_poll,
            "road_capacity":    b_cap,
        },
        "after": {
            "vehicle_count":    a_vol,
            "avg_speed_kmh":    a_spd,
            "travel_time_min":  a_tt,
            "pollution_index":  a_poll,
            "road_capacity":    a_cap,
        },
        "deltas": {
            "vehicle_count":    delta(b_vol,  a_vol),
            "avg_speed_kmh":    delta(b_spd,  a_spd),
            "travel_time_min":  delta(b_tt,   a_tt),
            "pollution_index":  delta(b_poll, a_poll),
            "road_capacity":    delta(b_cap,  a_cap),
        },
        # Extra raw ML outputs
        "traffic_improvement": raw["traffic_improvement"],
        "economic":            raw["economic"],
        "environment":         raw["environment"],
    }

    return jsonify(result)