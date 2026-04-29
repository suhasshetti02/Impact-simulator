"""
Tunnel construction simulation.

Effect model:
  - Road capacity increases by `capacity_increase_pct` %.
  - Vehicle count on the segment drops proportionally (traffic redistributes).
  - Average speed increases (BPR function approximation).
  - Travel time decreases.
  - Pollution index improves due to smoother flow.
"""
from dataclasses import dataclass


@dataclass
class TrafficState:
    vehicle_count: float
    avg_speed_kmh: float
    travel_time_min: float
    pollution_index: float
    road_capacity: float = 2000.0  # vehicles / hour baseline


def simulate_tunnel(before: TrafficState, capacity_increase_pct: float) -> TrafficState:
    """
    Apply tunnel-construction effects to a TrafficState.

    Parameters
    ----------
    before                : Current traffic state on the affected segment.
    capacity_increase_pct : Percentage increase in road capacity (e.g. 30 → +30%).

    Returns
    -------
    TrafficState : Predicted post-construction traffic state.
    """
    if not (0 < capacity_increase_pct <= 200):
        raise ValueError("capacity_increase_pct must be in (0, 200]")

    cap_factor = 1 + capacity_increase_pct / 100.0
    new_capacity = before.road_capacity * cap_factor

    # Volume/capacity ratio (BPR model approximation)
    vc_before = before.vehicle_count / before.road_capacity
    vc_after = vc_before / cap_factor  # redistributed

    # BPR travel time factor: t = t0 * (1 + 0.15 * (v/c)^4)
    tt_before_factor = 1 + 0.15 * (vc_before ** 4)
    tt_after_factor = 1 + 0.15 * (vc_after ** 4)

    new_travel_time = before.travel_time_min * (tt_after_factor / tt_before_factor)
    new_speed = before.avg_speed_kmh * (tt_before_factor / tt_after_factor)
    new_vehicles = before.vehicle_count * (vc_after / vc_before) if vc_before > 0 else before.vehicle_count

    # Pollution drops roughly linearly with speed improvement
    speed_ratio = new_speed / max(before.avg_speed_kmh, 1)
    new_pollution = before.pollution_index / max(speed_ratio, 0.5)

    return TrafficState(
        vehicle_count=round(new_vehicles, 1),
        avg_speed_kmh=round(min(new_speed, 120.0), 2),
        travel_time_min=round(max(new_travel_time, 1.0), 2),
        pollution_index=round(max(new_pollution, 0.0), 2),
        road_capacity=round(new_capacity, 1),
    )

def apply_tunnel(df, params=None):
    """
    Applies tunnel simulation to a DataFrame containing traffic data.
    """
    mod_df = df.copy()
    if params is None:
        params = {}
    
    cap_inc = float(params.get('capacity_increase_pct', 30.0))
    
    for idx, row in mod_df.iterrows():
        vol = row.get('Traffic Volume', 1000)
        speed = row.get('Average Speed', 40)
        tti = row.get('Travel Time Index', 1.0)
        util = row.get('Road Capacity Utilization', 0.5)
        
        cap = vol / util if util > 0 else 2000
        
        state = TrafficState(
            vehicle_count=vol,
            avg_speed_kmh=speed,
            travel_time_min=tti,
            pollution_index=0,
            road_capacity=cap
        )
        
        new_state = simulate_tunnel(state, capacity_increase_pct=cap_inc)
        
        if 'Traffic Volume' in mod_df.columns:
            mod_df.at[idx, 'Traffic Volume'] = new_state.vehicle_count
        if 'Average Speed' in mod_df.columns:
            mod_df.at[idx, 'Average Speed'] = new_state.avg_speed_kmh
        if 'Travel Time Index' in mod_df.columns:
            mod_df.at[idx, 'Travel Time Index'] = new_state.travel_time_min
        if 'Road Capacity Utilization' in mod_df.columns:
            mod_df.at[idx, 'Road Capacity Utilization'] = new_state.vehicle_count / max(new_state.road_capacity, 1)
            
    return mod_df
