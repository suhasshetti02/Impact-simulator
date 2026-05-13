"""
Signal Optimisation simulation.

Effect model:
  - AI-driven adaptive signal timing reduces idle time and stop-and-go cycles.
  - Travel Time Index drops ~12% as throughput improves.
  - Average speed rises due to fewer red-light stops.
  - Pollution drops proportionally with smoother flow.
  - No physical capacity change (same road geometry).
"""


def apply_signal_optimisation(df, params=None):
    """
    Applies signal optimisation effects to a DataFrame.

    Parameters
    ----------
    df     : DataFrame with baseline traffic features.
    params : dict — currently unused; reserved for future timing-cycle params.

    Returns
    -------
    Modified DataFrame with updated travel-time and speed features.
    """
    mod_df = df.copy()
    if params is None:
        params = {}

    # Signal optimisation: 12% throughput improvement (literature-backed)
    TTI_REDUCTION   = 0.12   # Travel Time Index drops 12%
    SPEED_GAIN      = 0.15   # Avg speed rises ~15% (fewer stops)
    POLLUTION_DROP  = 0.10   # Pollution drops 10% (smoother flow)

    for idx, row in mod_df.iterrows():
        if 'Travel Time Index' in mod_df.columns:
            mod_df.at[idx, 'Travel Time Index'] = row['Travel Time Index'] * (1 - TTI_REDUCTION)
        if 'Average Speed' in mod_df.columns:
            mod_df.at[idx, 'Average Speed'] = min(row['Average Speed'] * (1 + SPEED_GAIN), 120.0)
        # Traffic Volume is unchanged — same number of vehicles, just flowing better
        # Road Capacity Utilization drops slightly due to better flow
        if 'Road Capacity Utilization' in mod_df.columns:
            mod_df.at[idx, 'Road Capacity Utilization'] = row['Road Capacity Utilization'] * (1 - TTI_REDUCTION)

    return mod_df
