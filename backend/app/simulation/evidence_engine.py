"""
Evidence Engine
===============
Retrieves curated, pre-seeded research evidence for a given policy simulation.

Design principles:
- ZERO live network calls — all evidence is pre-seeded in evidence_store.json.
- evidence_store.json is loaded ONCE at module import into a module-level dict.
- Selection is deterministic: policy type + concern signals derived from deltas.
- Returns clean, typed JSON with confidence + source_type labels.
- Fully non-blocking — never raises exceptions.
"""

import os
import json

# ── Load evidence store once at module import ─────────────────────────────────
_STORE: dict = {}

def _load_store() -> dict:
    global _STORE
    if _STORE:
        return _STORE
    store_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "..", "data", "evidence_store.json"
    )
    store_path = os.path.normpath(store_path)
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            _STORE = json.load(f)
    except Exception:
        _STORE = {}
    return _STORE


# ── Concern detection from simulation deltas ──────────────────────────────────

_POLICY_DEFAULT_CONCERNS = {
    "flyover":             ["traffic", "vendor", "aqi"],
    "tunnel":              ["traffic", "vendor", "aqi"],
    "road_widening":       ["traffic", "vendor", "business", "pedestrian"],
    "signal_optimisation": ["traffic", "aqi", "noise"],
    "metro_extension":     ["traffic", "footfall", "accessibility", "aqi", "vendor"],
}


def _detect_concerns(policy_type: str, deltas: dict) -> list[str]:
    """
    Determine which concern categories are relevant based on delta signals.
    Falls back to default policy concern list if deltas are missing.
    """
    concerns = list(_POLICY_DEFAULT_CONCERNS.get(policy_type, ["traffic"]))

    # Boost noise concern if pollution delta is significant
    if deltas and abs(deltas.get("pollution_index", {}).get("change_pct", 0)) > 8:
        if "noise" not in concerns:
            concerns.append("noise")

    return concerns


# ── Main public function ──────────────────────────────────────────────────────

def get_evidence(
    policy_type: str,
    location: str,
    deltas: dict,
) -> dict | None:
    """
    Retrieve and rank relevant evidence sources for a policy simulation.

    Parameters
    ----------
    policy_type : e.g. "flyover", "tunnel", "metro_extension"
    location    : human-readable location (informational only, future use)
    deltas      : simulation deltas dict for concern detection

    Returns
    -------
    dict with keys: query_key, cached, sources (list), total_sources
    Returns None on any error — simulation must never fail because of this module.
    """
    try:
        store  = _load_store()
        policy_store = store.get(policy_type, {})

        if not policy_store:
            return _empty_result(policy_type, [])

        concerns = _detect_concerns(policy_type, deltas)

        # Merge sources across concern categories, deduplicate by URL
        merged  : list[dict] = []
        seen_urls: set[str]  = set()

        for concern in concerns:
            for source in policy_store.get(concern, []):
                url = source.get("url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    merged.append({**source, "concern": concern, "cached": True})

        # Sort by relevance descending, take top 5
        ranked = sorted(merged, key=lambda s: s.get("relevance", 0), reverse=True)[:5]

        query_key = f"{policy_type}_{'_'.join(concerns[:3])}"

        return {
            "query_key":     query_key,
            "cached":        True,
            "sources":       ranked,
            "total_sources": len(ranked),
        }

    except Exception:
        return None


def _empty_result(policy_type: str, concerns: list) -> dict:
    return {
        "query_key":     f"{policy_type}_general",
        "cached":        True,
        "sources":       [],
        "total_sources": 0,
    }
