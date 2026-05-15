from .search_engine import get_live_evidence
from .cache_manager import get_cached_evidence, set_cached_evidence
import os
import json

def get_evidence_for_simulation(location, policy_type, force_refresh=False):
    """
    Hybrid Evidence Engine Entrypoint.
    Checks cache first, falls back to live search, and falls back to curated database if live fails.
    """
    
    # 1. Check local cache
    if not force_refresh:
        cached = get_cached_evidence(location, policy_type)
        if cached and 'sources' in cached and len(cached['sources']) > 0:
            print(f"[Evidence Engine] Cache HIT for {location} + {policy_type}")
            # Mark them as cached for UI telemetry
            for s in cached['sources']:
                s['cached'] = True
            return cached['sources']
            
    # 2. Perform Live Search
    print(f"[Evidence Engine] Performing LIVE SEARCH for {location} + {policy_type}")
    try:
        live_sources = get_live_evidence(location, policy_type)
        if live_sources and len(live_sources) > 0:
            print(f"[Evidence Engine] Found {len(live_sources)} valid live sources.")
            # Cache the successful results
            set_cached_evidence(location, policy_type, live_sources)
            return live_sources
    except Exception as e:
        print(f"[Evidence Engine] Live search encountered an error: {e}")
        
    # 3. Ultimate Fallback to curated library if live search completely fails or returns empty
    print("[Evidence Engine] Falling back to curated evidence library.")
    return get_fallback_evidence(policy_type)

def get_fallback_evidence(policy_type):
    # Try to load the old evidence_store.json which we recently updated with real data
    try:
        store_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'evidence_store.json')
        with open(store_path, 'r', encoding='utf-8') as f:
            library = json.load(f)
            
        # Get matching policy type, or just return flyover as generic fallback
        policy_key = policy_type.lower()
        if policy_key not in library:
            policy_key = 'flyover'
            
        fallback_sources = []
        for concern, sources in library.get(policy_key, {}).items():
            for source in sources:
                source['cached'] = True
                source['concern'] = concern
                # Add mock confidence scores if missing
                if 'confidence_score' not in source:
                    source['confidence_score'] = 90 if source.get('domain', '').endswith('.in') else 80
                fallback_sources.append(source)
                
        return fallback_sources[:5]
    except Exception as e:
        print(f"[Evidence Engine] Critical failure reading fallback library: {e}")
        return []
