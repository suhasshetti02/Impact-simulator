"""
Scenario engine — orchestrates all policy simulations.

Supported policies:
  - tunnel             : Underground road, increases capacity
  - flyover            : Elevated road, diverts traffic
  - road_widening      : Lane expansion, moderate capacity boost
  - signal_optimisation: AI signal timing, improves flow (no physical change)
  - metro_extension    : Modal shift, removes vehicles from road
"""
import pandas as pd
from app.models.traffic_model import predict
from app.simulation.flyover_sim       import apply_flyover
from app.simulation.tunnel_sim        import apply_tunnel
from app.simulation.road_widening_sim import apply_road_widening
from app.simulation.signal_sim        import apply_signal_optimisation
from app.simulation.metro_sim         import apply_metro_extension


_POLICY_MAP = {
    "tunnel":              apply_tunnel,
    "flyover":             apply_flyover,
    "road_widening":       apply_road_widening,
    "signal_optimisation": apply_signal_optimisation,
    "metro_extension":     apply_metro_extension,
}


def run_simulation(input_df: pd.DataFrame, policy: str, policy_params: dict | None = None) -> dict:
    """
    Run a single policy simulation.

    Steps:
      1. Predict BEFORE Travel Time Index using the trained ML model.
      2. Apply the selected policy physics to the input DataFrame.
      3. Predict AFTER Travel Time Index on the modified DataFrame.
      4. Compute impact scalars and return a structured result dict.

    Parameters
    ----------
    input_df      : DataFrame with one baseline traffic row.
    policy        : One of the keys in _POLICY_MAP.
    policy_params : Additional parameters forwarded to the policy engine.

    Returns
    -------
    dict with keys: before, after, traffic_improvement, environment, economic, policy
    """
    if policy_params is None:
        policy_params = {}

    # Predict BEFORE
    before = float(predict(input_df)[0])

    # Apply selected policy
    apply_fn = _POLICY_MAP.get(policy)
    if apply_fn is None:
        raise ValueError(
            f"Unknown policy '{policy}'. "
            f"Supported: {list(_POLICY_MAP.keys())}"
        )
    modified_df = apply_fn(input_df, policy_params)

    # Predict AFTER
    after = float(predict(modified_df)[0])

    impact = before - after

    return {
        "before":               before,
        "after":                after,
        "traffic_improvement":  impact,
        "environment":          impact * 0.8,
        "economic":             impact * 10,
        "policy":               policy,
    }


def run_comparison(scenarios: list[dict]) -> list[dict]:
    """
    Run multiple policy scenarios and return a list of result dicts.

    Each scenario dict must contain at minimum 'policy_type' (or 'policy') and
    the baseline traffic features. Missing numeric features are filled with
    dataset-average defaults.
    """
    results = []
    for scenario in scenarios:
        policy = scenario.get("policy_type") or scenario.get("policy")
        if not policy:
            raise ValueError("Each scenario must include a 'policy_type' field.")

        df = pd.DataFrame([scenario])
        res = run_simulation(df, policy, policy_params=scenario)

        if "name" in scenario:
            res["name"] = scenario["name"]
        if "location" in scenario:
            res["location"] = scenario["location"]

        results.append(res)

    return results