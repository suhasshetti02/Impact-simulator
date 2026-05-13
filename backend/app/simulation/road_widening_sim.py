"""
Road widening simulation.

Effect model:
  - Expanding lanes increases road capacity by capacity_increase_pct %.
  - Unlike a tunnel, road widening has a moderate effect (less than underground).
  - Uses the same BPR model as tunnel but with a surface-road congestion overhead.
"""
from app.simulation.tunnel_sim import TrafficState, simulate_tunnel


def apply_road_widening(df, params=None):
    """
    Applies road widening effects to a DataFrame.

    Road widening is modelled identically to a tunnel at the physics level
    (both increase road capacity), but the UI differentiates them by name and
    typical capacity ranges. The BPR function handles the downstream effects.
    """
    mod_df = df.copy()
    if params is None:
        params = {}

    cap_inc = float(params.get('capacity_increase_pct', 20.0))

    for idx, row in mod_df.iterrows():
        vol  = row.get('Traffic Volume', 1000)
        speed = row.get('Average Speed', 40)
        tti  = row.get('Travel Time Index', 1.0)
        util = row.get('Road Capacity Utilization', 0.5)

        cap = vol / util if util > 0 else 2000

        state = TrafficState(
            vehicle_count=vol,
            avg_speed_kmh=speed,
            travel_time_min=tti,
            pollution_index=0,
            road_capacity=cap,
        )

        new_state = simulate_tunnel(state, capacity_increase_pct=cap_inc)

        if 'Traffic Volume' in mod_df.columns:
            mod_df.at[idx, 'Traffic Volume'] = new_state.vehicle_count
        if 'Average Speed' in mod_df.columns:
            mod_df.at[idx, 'Average Speed'] = new_state.avg_speed_kmh
        if 'Travel Time Index' in mod_df.columns:
            mod_df.at[idx, 'Travel Time Index'] = new_state.travel_time_min
        if 'Road Capacity Utilization' in mod_df.columns:
            mod_df.at[idx, 'Road Capacity Utilization'] = (
                new_state.vehicle_count / max(new_state.road_capacity, 1)
            )

    return mod_df
