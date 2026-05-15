import os
import requests
from urllib.parse import urlparse
from .query_builder import build_query
from .evidence_validator import validate_urls_sync
from .scoring import score_evidence
from dotenv import load_dotenv

load_dotenv()

def fetch_evidence_from_google(location, policy_type, concern):
    """
    Fetches raw search results from Google Custom Search API.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    cx = os.getenv("SEARCH_ENGINE_ID")
    
    if not api_key or not cx:
        print("[Evidence Engine] Google API credentials missing. Falling back to cache.")
        return []

    query = build_query(location, policy_type, concern)
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={api_key}&cx={cx}&num=3"
    
    try:
        response = requests.get(url, timeout=4.0)
        response.raise_for_status()
        data = response.json()
        return data.get('items', [])
    except Exception as e:
        print(f"[Evidence Engine] Google API Search failed for {concern}: {e}")
        return []

def get_live_evidence(location, policy_type):
    """
    Orchestrates the live search for multiple concerns, validates URLs, and scores them.
    """
    concerns = ['traffic', 'vendor', 'aqi']
    raw_results = []
    
    # 1. Fetch raw results from Google
    for concern in concerns:
        items = fetch_evidence_from_google(location, policy_type, concern)
        for item in items:
            # Tag the item with the concern it was found for
            item['concern'] = concern
            raw_results.append(item)
            
    if not raw_results:
        return []

    # 2. Extract URLs and validate them concurrently
    urls_to_check = [item['link'] for item in raw_results if 'link' in item]
    valid_urls = set(validate_urls_sync(urls_to_check))
    
    # 3. Filter and Format the final results
    formatted_evidence = []
    seen_urls = set()
    
    for item in raw_results:
        url = item.get('link')
        if not url or url not in valid_urls or url in seen_urls:
            continue
            
        seen_urls.add(url)
        domain = urlparse(url).netloc.replace('www.', '')
        
        # Calculate scoring
        score_data = score_evidence(domain, item.get('title', ''), item.get('snippet', ''))
        
        formatted_evidence.append({
            "title": item.get('title', 'Unknown Title'),
            "summary": item.get('snippet', 'No summary available.'),
            "url": url,
            "domain": domain,
            "concern": item.get('concern'),
            "source_type": score_data['source_type'],
            "confidence": score_data['confidence'],
            "confidence_score": score_data['confidence_score'],
            "relevance": score_data['relevance'],
            "cached": False # Initially false when just fetched
        })
        
    # Sort by relevance
    formatted_evidence.sort(key=lambda x: x['relevance'], reverse=True)
    
    # Return top 5 most relevant sources to keep the payload clean
    return formatted_evidence[:5]
