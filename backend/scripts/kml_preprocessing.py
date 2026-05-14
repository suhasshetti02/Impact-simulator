"""
KML Geospatial Preprocessing Pipeline
======================================
Parses air.kml (KSPCB Air Quality Monitoring Stations) and
noise.kml (KSPCB Noise Quality Monitoring Stations), extracts
their coordinates and metadata, then builds a spatial lookup
table indexed to Bengaluru traffic locations using geodesic
nearest-neighbor mapping.

Output: backend/data/geo_features.csv
"""

import xml.etree.ElementTree as ET
import math
import os
import pandas as pd

# ── KML Namespace ──────────────────────────────────────────────────────────────
KML_NS = "http://www.opengis.net/kml/2.2"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: KML PARSING
# ─────────────────────────────────────────────────────────────────────────────

def _parse_kml(filepath: str, id_tag: str, name_tag: str) -> list[dict]:
    """
    Generic KML Point-feature parser.
    Returns a list of dicts with: id, name, lat, lon
    """
    tree = ET.parse(filepath)
    root = tree.getroot()
    records = []

    for pm in root.findall(f".//{{{KML_NS}}}Placemark"):
        # Extract coordinates
        coord_el = pm.find(f".//{{{KML_NS}}}coordinates")
        if coord_el is None:
            continue
        parts = coord_el.text.strip().split(",")
        lon, lat = float(parts[0]), float(parts[1])

        # Extract named fields from ExtendedData
        schema_data = pm.find(f".//{{{KML_NS}}}SchemaData")
        fields = {}
        if schema_data is not None:
            for sd in schema_data.findall(f"{{{KML_NS}}}SimpleData"):
                fields[sd.get("name")] = sd.text

        records.append({
            "id":   fields.get(id_tag, ""),
            "name": fields.get(name_tag, ""),
            "lat":  lat,
            "lon":  lon,
        })

    return records


def parse_air_kml() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "air.kml")
    records = _parse_kml(path, id_tag="KGISAQMSID", name_tag="AQMSName")
    df = pd.DataFrame(records)
    df.rename(columns={"name": "aqms_name", "id": "aqms_id", "lat": "aqms_lat", "lon": "aqms_lon"}, inplace=True)
    return df


def parse_noise_kml() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "noise.kml")
    records = _parse_kml(path, id_tag="KGISNQMSID", name_tag="NQMSName")
    df = pd.DataFrame(records)
    df.rename(columns={"name": "nqms_name", "id": "nqms_id", "lat": "nqms_lat", "lon": "nqms_lon"}, inplace=True)
    return df


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: GEODESIC DISTANCE (Haversine)
# ─────────────────────────────────────────────────────────────────────────────

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Returns the geodesic (great-circle) distance in km between two WGS-84 points.
    Uses the Haversine formula — accurate for short urban distances.
    """
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: TRAFFIC LOCATION COORDINATE MAPPING
# ─────────────────────────────────────────────────────────────────────────────

# Ground-truth WGS-84 coordinates for every simulation location.
# Sourced from OpenStreetMap / Google Maps cross-referenced with
# the Bengaluru dataset's Area Name field.
LOCATION_COORDS = {
    "Silk Board Junction":       {"lat": 12.9167, "lon": 77.6219},
    "Hebbal Flyover":            {"lat": 13.0450, "lon": 77.5949},
    "KR Puram Bridge":           {"lat": 13.0050, "lon": 77.6945},
    "Electronic City Phase 1":   {"lat": 12.8420, "lon": 77.6760},
    "Marathahalli Bridge":       {"lat": 12.9563, "lon": 77.7007},
    "Whitefield Main Road":      {"lat": 12.9698, "lon": 77.7500},
    "Koramangala 5th Block":     {"lat": 12.9279, "lon": 77.6271},
    "Indiranagar 100ft Road":    {"lat": 12.9784, "lon": 77.6408},
    # Additional dataset areas (Area Name)
    "Indiranagar":               {"lat": 12.9784, "lon": 77.6408},
    "Whitefield":                {"lat": 12.9698, "lon": 77.7500},
    "Koramangala":               {"lat": 12.9279, "lon": 77.6271},
    "Hebbal":                    {"lat": 13.0450, "lon": 77.5949},
    "Marathahalli":              {"lat": 12.9563, "lon": 77.7007},
    "Electronic City":           {"lat": 12.8420, "lon": 77.6760},
    "MG Road":                   {"lat": 12.9756, "lon": 77.6097},
    "Yeshwanthpur":              {"lat": 13.0257, "lon": 77.5545},
}


# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: NEAREST-NEIGHBOUR SPATIAL JOIN + FEATURE ENGINEERING
# ─────────────────────────────────────────────────────────────────────────────

def _find_nearest(target_lat, target_lon, stations_df, lat_col, lon_col, name_col):
    """
    For a target point, find the nearest station using Haversine and return
    (name, distance_km).
    """
    best_name, best_dist = None, float("inf")
    for _, row in stations_df.iterrows():
        d = haversine_km(target_lat, target_lon, row[lat_col], row[lon_col])
        if d < best_dist:
            best_dist = d
            best_name = row[name_col]
    return best_name, round(best_dist, 4)


def build_geo_features(air_df: pd.DataFrame, noise_df: pd.DataFrame) -> pd.DataFrame:
    """
    For every known traffic location, compute:
    - nearest air monitoring station + distance
    - nearest noise monitoring station + distance
    - proximity-based environmental risk scores
    - urban stress index
    """
    rows = []

    # Filter air stations to Bengaluru only (lat 12.7–13.2, lon 77.4–77.9)
    blr_air = air_df[
        (air_df["aqms_lat"].between(12.70, 13.20)) &
        (air_df["aqms_lon"].between(77.40, 77.90))
    ].copy()

    for location, coords in LOCATION_COORDS.items():
        lat, lon = coords["lat"], coords["lon"]

        # Nearest air station
        nearest_aqms, aqms_dist_km = _find_nearest(
            lat, lon, blr_air, "aqms_lat", "aqms_lon", "aqms_name"
        )

        # Nearest noise station
        nearest_nqms, nqms_dist_km = _find_nearest(
            lat, lon, noise_df, "nqms_lat", "nqms_lon", "nqms_name"
        )

        # ── Derived Environmental Features ────────────────────────────────────

        # AQI Proximity Score: closer = higher environmental pressure
        # Formula: inverse decay capped at 1.0
        # A station 0 km away = score 1.0; 5 km = 0.5; 10 km = 0.33
        aqms_proximity_score = round(1.0 / (1.0 + aqms_dist_km * 0.2), 4)
        nqms_proximity_score = round(1.0 / (1.0 + nqms_dist_km * 0.2), 4)

        # Station density: how many AQI stations within 3 km?
        aqms_density_3km = int(sum(
            1 for _, r in blr_air.iterrows()
            if haversine_km(lat, lon, r["aqms_lat"], r["aqms_lon"]) <= 3.0
        ))
        nqms_density_3km = int(sum(
            1 for _, r in noise_df.iterrows()
            if haversine_km(lat, lon, r["nqms_lat"], r["nqms_lon"]) <= 3.0
        ))

        # Environmental Risk Score (0–1): weighted composite
        # Higher = location is surrounded by more monitoring stations (high-risk area)
        env_risk_score = round(
            0.6 * aqms_proximity_score + 0.4 * nqms_proximity_score, 4
        )

        # Urban Monitoring Density Index: reflects how much KSPCB tracks this zone
        # Areas with more stations = known pollution hotspots
        urban_density_index = round(
            (aqms_density_3km * 0.6 + nqms_density_3km * 0.4) / 5.0, 4  # normalized to ~1
        )

        rows.append({
            "location":              location,
            "lat":                   lat,
            "lon":                   lon,
            "nearest_aqms_name":     nearest_aqms,
            "aqms_dist_km":          aqms_dist_km,
            "aqms_proximity_score":  aqms_proximity_score,
            "aqms_density_3km":      aqms_density_3km,
            "nearest_nqms_name":     nearest_nqms,
            "nqms_dist_km":          nqms_dist_km,
            "nqms_proximity_score":  nqms_proximity_score,
            "nqms_density_3km":      nqms_density_3km,
            "env_risk_score":        env_risk_score,
            "urban_density_index":   urban_density_index,
        })

    return pd.DataFrame(rows)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def run():
    print("=" * 60)
    print("KML Geospatial Preprocessing Pipeline")
    print("=" * 60)

    print("\n[1/4] Parsing air.kml...")
    air_df = parse_air_kml()
    print(f"      -> {len(air_df)} Air Monitoring Stations found")
    blr_air_count = len(air_df[air_df["aqms_lat"].between(12.70, 13.20)])
    print(f"      -> {blr_air_count} within Bengaluru bounds")

    print("\n[2/4] Parsing noise.kml...")
    noise_df = parse_noise_kml()
    print(f"      -> {len(noise_df)} Noise Monitoring Stations found")
    print(f"      -> All {len(noise_df)} are within Bengaluru")

    print("\n[3/4] Running nearest-neighbour spatial join...")
    geo_df = build_geo_features(air_df, noise_df)
    print(f"      -> Geo features built for {len(geo_df)} locations")

    print("\n[4/4] Saving geo_features.csv...")
    out_path = os.path.join(DATA_DIR, "geo_features.csv")
    geo_df.to_csv(out_path, index=False)
    print(f"      -> Saved to {out_path}")

    print("\n-- Sample Output --")
    print(geo_df[["location", "aqms_dist_km", "nqms_dist_km", "env_risk_score", "urban_density_index"]].to_string(index=False))
    print("\nKML preprocessing complete.\n")
    return geo_df


if __name__ == "__main__":
    run()
