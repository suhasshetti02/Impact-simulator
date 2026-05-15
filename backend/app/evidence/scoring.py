def score_evidence(domain, title, summary):
    """
    Scores the relevance and confidence of an evidence source based on its domain 
    and the presence of keywords in the title/summary.
    """
    domain = domain.lower()
    title = title.lower()
    summary = summary.lower()
    
    confidence_score = 0
    confidence_label = "low"
    source_type = "article"
    
    # Domain Authority
    if ".gov.in" in domain or ".nic.in" in domain:
        confidence_score = 95
        source_type = "government_report"
    elif ".ac.in" in domain or ".edu" in domain or "iisc" in domain or "iit" in domain:
        confidence_score = 92
        source_type = "research_paper"
    elif "worldbank.org" in domain or "un.org" in domain or "wri.org" in domain:
        confidence_score = 90
        source_type = "official_report"
    elif "researchgate.net" in domain or "springer.com" in domain or "sciencedirect.com" in domain:
        confidence_score = 85
        source_type = "research_paper"
    elif "citizenmatters.in" in domain or "orfonline.org" in domain:
        confidence_score = 80
        source_type = "case_study"
    else:
        # Reputable news sources as fallback
        confidence_score = 70
        source_type = "news_report"

    # Assign label
    if confidence_score >= 90:
        confidence_label = "very_high"
    elif confidence_score >= 80:
        confidence_label = "high"
    elif confidence_score >= 70:
        confidence_label = "medium"
        
    # Calculate keyword relevance
    # A simple heuristic based on the length of title and presence of strong keywords
    relevance_base = 0.75
    
    keywords = ["impact", "study", "analysis", "report", "reduction", "increase", "assessment", "data"]
    keyword_hits = sum(1 for kw in keywords if kw in title or kw in summary)
    
    relevance = min(0.99, relevance_base + (keyword_hits * 0.04))
    
    return {
        "confidence": confidence_label,
        "confidence_score": confidence_score,
        "relevance": relevance,
        "source_type": source_type
    }
