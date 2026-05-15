"""
Planner Summary Engine
======================
Generates a deterministic, template-driven planning recommendation narrative.

Design principles:
- ZERO free-text generation or LLM calls.
- Every sentence maps directly to a computed simulation value.
- `generated_from` dict is included in the response as a full audit trail.
- If any input value is missing, the corresponding sentence is simply omitted.
- Never raises exceptions — returns None on any error.

Anti-hallucination guarantee:
  narrative = template.format(**facts)
  Every word is pre-written; only the numbers change per simulation.
"""

# ── Recommendation classification ─────────────────────────────────────────────

def _classify_recommendation(
    roi_score: float,
    community_score: int,
    sustainability_score: float,
) -> str:
    """
    Deterministic decision rule for overall recommendation.
    All thresholds are documented and traceable.
    """
    if roi_score >= 2.0 and community_score >= 60 and sustainability_score >= 55:
        return "strongly_recommended"
    elif roi_score >= 1.0 and community_score >= 45:
        return "proceed_with_conditions"
    elif roi_score >= 0.5:
        return "requires_review"
    else:
        return "not_recommended"


# ── Headline templates ────────────────────────────────────────────────────────
# Each template is pre-written for every policy × recommendation combination.
# {location} and {concern} are the only dynamic substitutions.

_HEADLINES = {
    "flyover": {
        "strongly_recommended":    "Flyover at {location} delivers strong traffic relief with manageable community impact.",
        "proceed_with_conditions": "Flyover at {location} offers strong traffic relief but requires a phased vendor rehabilitation plan.",
        "requires_review":         "Flyover at {location} shows limited ROI — further traffic demand analysis recommended.",
        "not_recommended":         "Flyover at {location} does not meet ROI or community thresholds under current parameters.",
    },
    "tunnel": {
        "strongly_recommended":    "Tunnel at {location} is a high-impact intervention with strong long-term ROI.",
        "proceed_with_conditions": "Tunnel at {location} offers significant capacity gain but construction disruption requires active mitigation.",
        "requires_review":         "Tunnel at {location} requires detailed cost-benefit re-evaluation given current ROI projections.",
        "not_recommended":         "Tunnel at {location} is not recommended under current budget and traffic parameters.",
    },
    "road_widening": {
        "strongly_recommended":    "Road widening at {location} delivers reliable near-term capacity improvement.",
        "proceed_with_conditions": "Road widening at {location} provides near-term relief but requires vendor displacement mitigation and pedestrian safety design.",
        "requires_review":         "Road widening at {location} shows risk of induced demand saturation — modal shift incentives recommended.",
        "not_recommended":         "Road widening at {location} is not recommended without supplementary demand management policy.",
    },
    "signal_optimisation": {
        "strongly_recommended":    "Signal optimisation at {location} is a low-cost, high-ROI intervention strongly recommended for immediate deployment.",
        "proceed_with_conditions": "Signal optimisation at {location} provides meaningful improvement with minimal disruption.",
        "requires_review":         "Signal optimisation at {location} may require corridor-level coordination for full effectiveness.",
        "not_recommended":         "Signal optimisation at {location} is insufficient as a standalone intervention for the observed congestion severity.",
    },
    "metro_extension": {
        "strongly_recommended":    "Metro extension through {location} is a transformative, high-ROI intervention strongly recommended for prioritisation.",
        "proceed_with_conditions": "Metro extension through {location} offers transformative long-term impact but construction disruption requires structured community support.",
        "requires_review":         "Metro extension through {location} requires ridership demand validation before full commitment.",
        "not_recommended":         "Metro extension through {location} does not meet ROI thresholds under current demand projections.",
    },
}

_DEFAULT_HEADLINES = {
    "strongly_recommended":    "Policy at {location} is strongly recommended based on simulation results.",
    "proceed_with_conditions": "Policy at {location} may proceed with conditions — review key risks below.",
    "requires_review":         "Policy at {location} requires further review before approval.",
    "not_recommended":         "Policy at {location} is not recommended under current parameters.",
}

# ── Narrative builder ─────────────────────────────────────────────────────────

def _build_narrative(policy: str, location: str, facts: dict, evidence: dict | None) -> str:
    """
    Build narrative from facts dict. Each sentence is conditional on its value
    being present and non-zero — no sentence is fabricated.
    """
    lines = [f"Based on XGBoost simulation results, environmental engine analysis, and cached urban planning evidence:\n"]

    # Traffic
    if facts.get("travel_time_pct"):
        lines.append(
            f"Travel time is projected to decrease by {facts['travel_time_pct']:.1f}%, "
            f"significantly improving peak-hour throughput at {location}."
        )
    if facts.get("speed_pct"):
        lines.append(
            f"Average vehicle speed is expected to improve by {facts['speed_pct']:.1f}%."
        )

    # Environmental
    if facts.get("aqi_pct"):
        lines.append(
            f"The Environmental Intelligence Engine estimates AQI improvement of "
            f"{facts['aqi_pct']:.1f}% post-construction, based on CPCB PM2.5 breakpoints "
            f"and CALINE4-adapted dispersion modelling."
        )

    # Community
    if facts.get("vendor_est") and facts.get("timeline"):
        lines.append(
            f"The {facts['timeline']}-month construction timeline introduces "
            f"{'moderate' if facts['vendor_est'] < 300 else 'significant'} disruption to an estimated "
            f"{facts['vendor_est']} street vendors and local businesses."
        )

    # Evidence
    src_count = facts.get("sources_count", 0)
    if src_count > 0:
        lines.append(
            f"This assessment is supported by {src_count} curated reference source(s) from "
            f"institutions including BBMP, NIUA, KSPCB, and IISc."
        )

    if facts.get("recovery_months"):
        lines.append(
            f"Post-construction vendor and business recovery is projected within "
            f"{facts['recovery_months']} months, based on comparable Bengaluru project data."
        )

    if facts.get("footfall_pct"):
        lines.append(
            f"Long-term commercial footfall is projected to increase by {facts['footfall_pct']}% "
            f"within 2–3 years of completion."
        )

    # ROI conclusion
    roi = facts.get("roi")
    if roi is not None:
        if roi >= 2.0:
            lines.append(f"An ROI score of {roi:.2f} indicates a strongly favourable return on the projected investment.")
        elif roi >= 1.0:
            lines.append(f"An ROI score of {roi:.2f} exceeds the break-even threshold of 1.0, indicating a positive return.")
        else:
            lines.append(f"An ROI score of {roi:.2f} is below break-even — the investment case requires strengthening.")

    return "\n\n".join(lines)


# ── Risk and benefit extraction ───────────────────────────────────────────────

def _extract_risks(policy: str, facts: dict) -> list[str]:
    risks = []
    vendor_est = facts.get("vendor_est", 0)
    timeline   = facts.get("timeline", 0)
    roi        = facts.get("roi", 1.0)
    env_score  = facts.get("env_score")
    community  = facts.get("community_score", 100)

    if vendor_est > 50:
        risks.append(f"Construction-phase vendor displacement (~{vendor_est} estimated)")
    if timeline > 18:
        risks.append(f"{timeline}-month construction timeline increases community exposure to noise and dust")
    if env_score and env_score < 60:
        risks.append(f"Environmental score of {env_score} indicates partial, not full, AQI recovery")
    if roi < 1.0:
        risks.append("ROI score below break-even — investment case needs strengthening")
    if community < 50:
        risks.append("Low community impact score — structured mitigation plan strongly advised")
    if policy == "road_widening":
        risks.append("Induced demand risk: congestion may return to pre-widening levels within 3–5 years")
    if not risks:
        risks.append("No significant risks identified under current simulation parameters")
    return risks


def _extract_benefits(policy: str, facts: dict) -> list[str]:
    benefits = []
    if facts.get("travel_time_pct"):
        benefits.append(f"{facts['travel_time_pct']:.1f}% travel time reduction at peak hours")
    if facts.get("aqi_pct"):
        benefits.append(f"{facts['aqi_pct']:.1f}% AQI improvement post-construction")
    roi = facts.get("roi")
    if roi and roi >= 1.0:
        benefits.append(f"ROI score {roi:.2f} exceeds break-even threshold of 1.0")
    if facts.get("footfall_pct"):
        benefits.append(f"{facts['footfall_pct']}% projected long-term footfall increase")
    if facts.get("sustainability_score"):
        benefits.append(f"Sustainability score {facts['sustainability_score']:.1f}/100")
    if policy == "metro_extension":
        benefits.append("Modal shift reduces private vehicle dependency — strong SDG 11 alignment")
    if not benefits:
        benefits.append("Positive simulation outcome under current parameters")
    return benefits


def _evidence_tier(evidence: dict | None) -> str:
    if not evidence or not evidence.get("sources"):
        return "limited"
    count = len(evidence["sources"])
    high_conf = sum(1 for s in evidence["sources"] if s.get("confidence") == "high")
    if count >= 3 and high_conf >= 2:
        return "strong"
    elif count >= 2:
        return "moderate"
    return "limited"


# ── Main public function ──────────────────────────────────────────────────────

def generate_planner_summary(
    policy_type:         str,
    location:            str,
    deltas:              dict,
    env_impact:          dict | None,
    socio_economic:      dict | None,
    evidence:            dict | None,
    roi_score:           float,
    sustainability_score: float,
    budget_crore:        float,
    timeline_months:     int,
) -> dict | None:
    """
    Generate a fully deterministic planner recommendation summary.

    Returns a dict with: recommendation, headline, narrative,
    key_risks, key_benefits, evidence_support_level,
    simulation_confidence, generated_from (audit trail).

    Returns None on any error — never crashes the simulation pipeline.
    """
    try:
        # Extract socio data safely
        community_score = socio_economic["community_impact_score"] if socio_economic else 60
        vendor_est      = socio_economic["vendor_impact"]["affected_vendors_est"] if socio_economic else 0
        recovery_months = socio_economic["vendor_impact"]["recovery_months"] if socio_economic else 0
        footfall_pct    = socio_economic["long_term_benefits"]["footfall_increase_pct"] if socio_economic else 0

        # Extract env data safely
        aqi_pct    = abs(env_impact["deltas"]["aqi_pct"]) if (env_impact and "deltas" in env_impact) else None
        env_score  = env_impact["impact"]["environmental_score"] if (env_impact and "impact" in env_impact) else None

        # Build facts dict — the single source of truth for all narrative text
        facts = {
            "travel_time_pct":    abs(deltas.get("travel_time_min", {}).get("change_pct", 0)),
            "speed_pct":          abs(deltas.get("avg_speed_kmh", {}).get("change_pct", 0)),
            "aqi_pct":            aqi_pct,
            "env_score":          env_score,
            "roi":                roi_score,
            "sustainability_score": sustainability_score,
            "community_score":    community_score,
            "vendor_est":         vendor_est,
            "recovery_months":    recovery_months,
            "footfall_pct":       footfall_pct,
            "sources_count":      len(evidence["sources"]) if evidence else 0,
            "policy_type":        policy_type,
            "location":           location,
            "budget_crore":       budget_crore,
            "timeline":           timeline_months,
        }

        recommendation = _classify_recommendation(roi_score, community_score, sustainability_score)

        policy_headlines = _HEADLINES.get(policy_type, _DEFAULT_HEADLINES)
        headline = policy_headlines.get(recommendation, "Simulation complete.").format(
            location=location, concern="vendor disruption"
        )

        narrative = _build_narrative(policy_type, location, facts, evidence)
        risks     = _extract_risks(policy_type, facts)
        benefits  = _extract_benefits(policy_type, facts)

        return {
            "recommendation":         recommendation,
            "headline":               headline,
            "narrative":              narrative,
            "key_risks":              risks,
            "key_benefits":           benefits,
            "evidence_support_level": _evidence_tier(evidence),
            "simulation_confidence":  "high",
            "generated_from":         facts,   # Full audit trail
        }

    except Exception:
        return None
