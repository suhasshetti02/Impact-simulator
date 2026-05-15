import json
import os
import hashlib
from datetime import datetime

CACHE_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'evidence_cache.json')

def get_cache_key(location, policy_type):
    # Create a unique hash for the specific location and policy
    key_string = f"{location.lower().strip()}_{policy_type.lower().strip()}"
    return hashlib.md5(key_string.encode('utf-8')).hexdigest()

def load_cache():
    if not os.path.exists(CACHE_FILE):
        return {}
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def save_cache(cache_data):
    # Ensure directory exists
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, indent=2)
    except Exception as e:
        print(f"[Evidence Cache] Failed to save cache: {e}")

def get_cached_evidence(location, policy_type):
    """
    Returns cached evidence for the specific scenario if it exists.
    """
    cache = load_cache()
    key = get_cache_key(location, policy_type)
    return cache.get(key)

def set_cached_evidence(location, policy_type, evidence_data):
    """
    Saves new evidence to the cache.
    """
    cache = load_cache()
    key = get_cache_key(location, policy_type)
    
    cache[key] = {
        "timestamp": datetime.now().isoformat(),
        "location": location,
        "policy": policy_type,
        "sources": evidence_data
    }
    
    save_cache(cache)
