def build_query(location, policy_type, concern):
    """
    Constructs a highly specific Boolean search query for Google Custom Search.
    Focuses on retrieving impact studies, traffic reports, and official documentation.
    """
    base = f'"{location}" AND "{policy_type.replace("_", " ")}"'
    
    if concern == 'traffic':
        return f'{base} AND (traffic OR congestion OR "travel time" OR "vehicle count" OR bottleneck) Bangalore'
    elif concern == 'vendor':
        return f'{base} AND ("street vendor" OR displacement OR livelihood OR hawkers OR eviction) Bangalore'
    elif concern == 'aqi' or concern == 'environment':
        return f'{base} AND (AQI OR pollution OR emissions OR "air quality" OR PM2.5 OR noise) Bangalore'
    elif concern == 'business':
        return f'{base} AND ("local business" OR commercial OR revenue OR footfall OR disruption) Bangalore'
    elif concern == 'pedestrian':
        return f'{base} AND (pedestrian OR walkability OR accessibility OR NMT OR footpaths) Bangalore'
    
    return f'{base} AND (impact OR report OR assessment) Bangalore'
