import aiohttp
import asyncio

async def check_url(session, url):
    """
    Validates a single URL by checking if it returns HTTP 200.
    """
    try:
        # Use a short timeout so one slow site doesn't hold up the demo
        timeout = aiohttp.ClientTimeout(total=2.0)
        async with session.head(url, timeout=timeout, allow_redirects=True) as response:
            if response.status == 200:
                return url
            return None
    except Exception:
        # Network error, DNS failure, timeout, etc.
        return None

async def validate_urls(urls):
    """
    Takes a list of URLs and concurrently validates them.
    Returns a list of URLs that are alive and return 200 OK.
    """
    if not urls:
        return []
        
    async with aiohttp.ClientSession() as session:
        tasks = [check_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return [url for url in results if url is not None]

def validate_urls_sync(urls):
    """
    Synchronous wrapper to call the async validate_urls function.
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(validate_urls(urls))
