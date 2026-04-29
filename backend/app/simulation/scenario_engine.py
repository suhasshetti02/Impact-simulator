from app.models.traffic_model import predict
from app.simulation.flyover_sim import apply_flyover
from app.simulation.tunnel_sim import apply_tunnel


def run_simulation(input_df, policy, policy_params=None):
    if policy_params is None:
        policy_params = {}
        
    # BEFORE
    before = predict(input_df)[0]

    # APPLY POLICY
    if policy == "flyover":
        modified_df = apply_flyover(input_df, policy_params)
    elif policy == "tunnel":
        modified_df = apply_tunnel(input_df, policy_params)
    else:
        modified_df = input_df

    # AFTER
    after = predict(modified_df)[0]

    impact = before - after

    # IMPACT ENGINE
    results = {
        "before": float(before),
        "after": float(after),
        "traffic_improvement": float(impact),
        "environment": float(impact * 0.8),
        "economic": float(impact * 10),
        "policy": policy
    }

    return results

def run_comparison(scenarios):
    import pandas as pd
    results = []
    for scenario in scenarios:
        policy = scenario.get("policy_type") or scenario.get("policy")
        df = pd.DataFrame([scenario])
        # Note: run_comparison may fail if scenario doesn't have valid baseline traffic data
        res = run_simulation(df, policy, policy_params=scenario)
        if "name" in scenario:
            res["name"] = scenario["name"]
        results.append(res)
    return results