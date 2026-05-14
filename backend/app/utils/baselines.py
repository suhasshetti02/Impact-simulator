"""
Location Baseline Manager

Responsible for providing accurate, location-specific traffic baselines
for the simulation engine. It attempts to compute live averages from MongoDB,
with a robust fallback to historical dataset averages.
"""
from app.utils.db import get_db

# ── 1. Historical Dataset Averages (Fallback Layer) ────────────────────────────
# These values were extracted directly from Banglore_traffic_Dataset.csv
# and map the frontend location strings to the nearest dataset 'Area Name'.
_STATIC_BASELINES = {
    "Silk Board Junction":       {"Traffic Volume": 40832.0, "Average Speed": 36.1, "Travel Time Index": 1.47, "Road Capacity Utilization": 0.97, "Incident Reports": 1.85, "Area_encoded": 3, "pollution_proxy": 210.0},
    "Hebbal Flyover":            {"Traffic Volume": 26533.0, "Average Speed": 40.2, "Travel Time Index": 1.37, "Road Capacity Utilization": 0.93, "Incident Reports": 1.57, "Area_encoded": 6, "pollution_proxy": 175.0},
    "KR Puram Bridge":           {"Traffic Volume": 18932.0, "Average Speed": 43.5, "Travel Time Index": 1.26, "Road Capacity Utilization": 0.82, "Incident Reports": 1.08, "Area_encoded": 7, "pollution_proxy": 148.0},
    "Electronic City Phase 1":   {"Traffic Volume": 16347.0, "Average Speed": 43.7, "Travel Time Index": 1.23, "Road Capacity Utilization": 0.76, "Incident Reports": 0.78, "Area_encoded": 1, "pollution_proxy": 140.0},
    "Marathahalli Bridge":       {"Traffic Volume": 21295.0, "Average Speed": 42.1, "Travel Time Index": 1.29, "Road Capacity Utilization": 0.87, "Incident Reports": 1.28, "Area_encoded": 2, "pollution_proxy": 158.0},
    "Whitefield Main Road":      {"Traffic Volume": 21295.0, "Average Speed": 42.1, "Travel Time Index": 1.29, "Road Capacity Utilization": 0.87, "Incident Reports": 1.28, "Area_encoded": 2, "pollution_proxy": 155.0},
    "Koramangala 5th Block":     {"Traffic Volume": 40832.0, "Average Speed": 36.1, "Travel Time Index": 1.47, "Road Capacity Utilization": 0.97, "Incident Reports": 1.85, "Area_encoded": 3, "pollution_proxy": 208.0},
    "Indiranagar 100ft Road":    {"Traffic Volume": 32284.0, "Average Speed": 38.6, "Travel Time Index": 1.40, "Road Capacity Utilization": 0.96, "Incident Reports": 1.78, "Area_encoded": 0, "pollution_proxy": 192.0},
}

_GLOBAL_DEFAULT = {
    "Traffic Volume": 25000.0,
    "Average Speed": 40.0,
    "Travel Time Index": 1.35,
    "Road Capacity Utilization": 0.88,
    "Incident Reports": 1.3,
    "Area_encoded": 1,
    "pollution_proxy": 170.0,
}

# In-memory cache to avoid repeated MongoDB aggregation
_DYNAMIC_CACHE = {}


def get_location_baseline(location_name: str, force_refresh: bool = False) -> dict:
    """
    Retrieve the baseline traffic metrics for a specific location.
    
    1. Check in-memory dynamic cache.
    2. If missing or force_refresh, attempt to aggregate from MongoDB.
    3. If MongoDB fails or data is sparse (< 10 records), use static fallback.
    
    Returns a dict formatted exactly for the ML model input.
    """
    if not force_refresh and location_name in _DYNAMIC_CACHE:
        return _DYNAMIC_CACHE[location_name].copy()

    static_fallback = _STATIC_BASELINES.get(location_name, _GLOBAL_DEFAULT)
    
    try:
        db = get_db()
        
        # We look for records that loosely match the location string
        # e.g., mapping "Hebbal Flyover" to the "Hebbal" Area Name in the DB
        area_keyword = location_name.split()[0] 
        
        pipeline = [
            {"$match": {"location": {"$regex": area_keyword, "$options": "i"}}},
            {"$group": {
                "_id": None,
                "count": {"$sum": 1},
                "avg_vol": {"$avg": "$vehicle_count"},
                "avg_spd": {"$avg": "$avg_speed_kmh"},
                "avg_tti": {"$avg": "$travel_time_min"},
                "avg_util": {"$avg": "$road_capacity_util"},
                "avg_inc": {"$avg": "$incident_reports"},
                "avg_poll": {"$avg": "$pollution_index"}
            }}
        ]
        
        result = list(db.traffic.aggregate(pipeline))
        
        # Sparse data check: If we have fewer than 10 records, the average
        # is statistically unreliable. Fall back to the CSV-derived static data.
        if result and result[0]["count"] >= 10:
            agg = result[0]
            dynamic_baseline = {
                "Traffic Volume": round(agg["avg_vol"], 1),
                "Average Speed": round(agg["avg_spd"], 1),
                "Travel Time Index": round(agg["avg_tti"] / 30.0, 2), # Convert min back to Index
                "Road Capacity Utilization": round(agg["avg_util"], 3),
                "Incident Reports": round(agg["avg_inc"], 2),
                "Area_encoded": static_fallback["Area_encoded"], # keep original encoding
                "pollution_proxy": round(agg["avg_poll"], 1),
            }
            _DYNAMIC_CACHE[location_name] = dynamic_baseline
            return dynamic_baseline.copy()
            
    except Exception:
        # DB unavailable or aggregation failed
        pass

    # If dynamic generation failed or data was too sparse, use static fallback
    _DYNAMIC_CACHE[location_name] = static_fallback
    return static_fallback.copy()


def build_ml_input_vector(location_name: str) -> dict:
    """
    Returns the complete baseline dictionary ready for ML prediction,
    merging the core metrics with required time/weather encoding fields.
    """
    baseline = get_location_baseline(location_name)
    
    return {
        "Traffic Volume":            baseline["Traffic Volume"],
        "Average Speed":             baseline["Average Speed"],
        "Travel Time Index":         baseline["Travel Time Index"],
        "Road Capacity Utilization": baseline["Road Capacity Utilization"],
        "Incident Reports":          baseline["Incident Reports"],
        "Area_encoded":              baseline["Area_encoded"],
        
        # Standardized environment variables for baseline simulation
        "Weather_encoded":           1,  # Assume standard 'Clear' weather
        "Roadwork_encoded":          0,  # Assume no roadwork baseline
        "day_of_week":               2,  # Typical Wednesday
        "month":                     5,  # May
    }
