"""Policy scenario document schema helpers."""
from datetime import datetime, timezone

POLICY_TYPES = ["tunnel", "flyover", "road_widening", "signal_optimisation", "metro_extension"]


def make_policy_document(
    name: str,
    policy_type: str,
    capacity_increase_pct: float,
    budget_crore: float,
    timeline_months: int,
    target_locations: list[str],
    description: str = "",
) -> dict:
    """
    Build a validated policy scenario document for MongoDB.

    Parameters
    ----------
    name                  : Descriptive name (e.g. "Hebbal Flyover Expansion")
    policy_type           : One of the POLICY_TYPES
    capacity_increase_pct : Percentage increase in road capacity (0–200)
    budget_crore          : Budget in Indian crore rupees
    timeline_months       : Estimated construction / implementation duration
    target_locations      : List of location names affected by the policy
    description           : Optional free-text description
    """
    if policy_type not in POLICY_TYPES:
        raise ValueError(f"policy_type must be one of {POLICY_TYPES}, got '{policy_type}'")
    if not (0 <= capacity_increase_pct <= 200):
        raise ValueError("capacity_increase_pct must be between 0 and 200")
    if budget_crore < 0:
        raise ValueError("budget_crore cannot be negative")

    return {
        "name": name,
        "policy_type": policy_type,
        "capacity_increase_pct": round(float(capacity_increase_pct), 2),
        "budget_crore": round(float(budget_crore), 2),
        "timeline_months": int(timeline_months),
        "target_locations": list(target_locations),
        "description": description,
        "created_at": datetime.now(timezone.utc),
    }
