"""
Metro extension simulation.

Effect model:
  - New metro corridor provides modal shift — commuters switch from private vehicles.
  - Vehicle count on affected roads drops by ~25% (conservative estimate for Bengaluru).
  - Congestion relief cascades: speed improves, travel time drops.
  - Pollution drops significantly due to both fewer vehicles and cleaner transit mode.
  - Road capacity is unchanged (same physical road).
"""


def apply_metro_extension(df, params=None):
    """
    Applies metro extension effects to a DataFrame.

    Parameters
    ----------
    df     : DataFrame with baseline traffic features.
    params : dict — supports 'modal_shift_pct' override (default 25%).

    Returns
    -------
    Modified DataFrame reflecting reduced vehicle load from modal shift.
    """
    mod_df = df.copy()
    if params is None:
        params = {}

    # Modal shift: default 25% of vehicles move to metro
    modal_shift = float(params.get('modal_shift_pct', 25.0)) / 100.0
    remain = 1.0 - modal_shift

    for idx, row in mod_df.iterrows():
        vol     = row.get('Traffic Volume', 1000)
        speed   = row.get('Average Speed', 40)
        tti     = row.get('Travel Time Index', 1.2)
        util    = row.get('Road Capacity Utilization', 0.8)

        # Fewer vehicles → lower V/C ratio → use BPR to compute new speed/TTI
        cap = vol / util if util > 0 else 2000
        new_vol = vol * remain
        vc_before = vol / cap
        vc_after  = new_vol / cap

        tt_factor_before = 1 + 0.15 * (vc_before ** 4)
        tt_factor_after  = 1 + 0.15 * (vc_after ** 4)

        new_tti   = tti * (tt_factor_after / tt_factor_before)
        new_speed = speed * (tt_factor_before / tt_factor_after)
        new_util  = new_vol / cap

        if 'Traffic Volume' in mod_df.columns:
            mod_df.at[idx, 'Traffic Volume'] = round(new_vol, 1)
        if 'Average Speed' in mod_df.columns:
            mod_df.at[idx, 'Average Speed'] = round(min(new_speed, 120.0), 2)
        if 'Travel Time Index' in mod_df.columns:
            mod_df.at[idx, 'Travel Time Index'] = round(max(new_tti, 0.5), 3)
        if 'Road Capacity Utilization' in mod_df.columns:
            mod_df.at[idx, 'Road Capacity Utilization'] = round(min(new_util, 1.0), 4)

    return mod_df
