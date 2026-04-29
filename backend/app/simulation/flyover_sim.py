"""
Flyover construction simulation.

Effect model:
  - Traffic redistributes across primary + alternate routes.
  - The flyover carries `diversion_pct` of total volume, relieving the surface road.
  - Speed on the surface road improves; flyover runs at near-free-flow speed.
  - Weighted average metrics are returned as a single combined after-state.
"""
from dataclasses import dataclass
from app.simulation.tunnel_sim import TrafficState


FREE_FLOW_SPEED = 80.0  # km/h — flyover design speed


def simulate_flyover(
    before: TrafficState,
    diversion_pct: float = 40.0,
) -> dict:
    """
    Apply flyover-construction effects.

    Parameters
    ----------
    before         : Current traffic state on the affected surface road.
    diversion_pct  : Percentage of vehicles diverted to the flyover (default 40 %).

    Returns
    -------
    dict with keys:
        surface_after  : TrafficState on the surface road post-flyover.
        flyover        : TrafficState on the new flyover.
        combined       : Weighted combined metrics.
    """
    if not (0 < diversion_pct < 100):
        raise ValueError("diversion_pct must be in (0, 100)")

    divert = diversion_pct / 100.0
    remain = 1 - divert

    # Surface road — reduced volume
    surface_vehicles = before.vehicle_count * remain
    vc_before = before.vehicle_count / before.road_capacity
    vc_surface = surface_vehicles / before.road_capacity
    tt_factor_before = 1 + 0.15 * (vc_before ** 4)
    tt_factor_surface = 1 + 0.15 * (vc_surface ** 4)
    surface_travel = before.travel_time_min * (tt_factor_surface / tt_factor_before)
    surface_speed = before.avg_speed_kmh * (tt_factor_before / tt_factor_surface)
    surface_pollution = before.pollution_index * (surface_speed / max(before.avg_speed_kmh, 1)) ** -1

    surface_after = TrafficState(
        vehicle_count=round(surface_vehicles, 1),
        avg_speed_kmh=round(min(surface_speed, 100.0), 2),
        travel_time_min=round(max(surface_travel, 1.0), 2),
        pollution_index=round(max(surface_pollution, 0.0), 2),
        road_capacity=before.road_capacity,
    )

    # Flyover — elevated at free-flow speed
    flyover_vehicles = before.vehicle_count * divert
    flyover_capacity = flyover_vehicles * 1.5  # over-built slightly
    flyover_travel = before.travel_time_min * 0.45  # faster route
    flyover_pollution = before.pollution_index * 0.6  # cleaner, faster

    flyover = TrafficState(
        vehicle_count=round(flyover_vehicles, 1),
        avg_speed_kmh=FREE_FLOW_SPEED,
        travel_time_min=round(max(flyover_travel, 1.0), 2),
        pollution_index=round(flyover_pollution, 2),
        road_capacity=round(flyover_capacity, 1),
    )

    # Weighted combined
    total = before.vehicle_count or 1
    combined = TrafficState(
        vehicle_count=round(before.vehicle_count, 1),
        avg_speed_kmh=round(
            (surface_after.avg_speed_kmh * remain + flyover.avg_speed_kmh * divert), 2
        ),
        travel_time_min=round(
            (surface_after.travel_time_min * remain + flyover.travel_time_min * divert), 2
        ),
        pollution_index=round(
            (surface_after.pollution_index * remain + flyover.pollution_index * divert), 2
        ),
        road_capacity=round(surface_after.road_capacity + flyover.road_capacity, 1),
    )

    def to_dict(ts: TrafficState) -> dict:
        return {
            "vehicle_count": ts.vehicle_count,
            "avg_speed_kmh": ts.avg_speed_kmh,
            "travel_time_min": ts.travel_time_min,
            "pollution_index": ts.pollution_index,
            "road_capacity": ts.road_capacity,
        }

    return {
        "surface_after": to_dict(surface_after),
        "flyover": to_dict(flyover),
        "combined": to_dict(combined),
    }

def apply_flyover(df, params=None):
    """
    Applies flyover simulation to a DataFrame containing traffic data.
    """
    mod_df = df.copy()
    if params is None:
        params = {}
    
    div_pct = float(params.get('diversion_pct', 40.0))
    
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
        
        res = simulate_flyover(state, diversion_pct=div_pct)
        comb = res['combined']
        
        if 'Traffic Volume' in mod_df.columns:
            mod_df.at[idx, 'Traffic Volume'] = comb['vehicle_count']
        if 'Average Speed' in mod_df.columns:
            mod_df.at[idx, 'Average Speed'] = comb['avg_speed_kmh']
        if 'Travel Time Index' in mod_df.columns:
            mod_df.at[idx, 'Travel Time Index'] = comb['travel_time_min']
        if 'Road Capacity Utilization' in mod_df.columns:
            mod_df.at[idx, 'Road Capacity Utilization'] = comb['vehicle_count'] / max(comb['road_capacity'], 1)
            
    return mod_df
