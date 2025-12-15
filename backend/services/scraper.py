import requests
from bs4 import BeautifulSoup
import re
import wikipedia

def scrape_wikipedia(topic_or_url: str) -> dict:
    url = topic_or_url
    
    # If it's not a URL, search for the page
    if "wikipedia.org/wiki/" not in topic_or_url:
        try:
            # Try to get the page directly
            page = wikipedia.page(topic_or_url, auto_suggest=True)
            url = page.url
            title_text = page.title
            content = page.content
            return {
                "title": title_text,
                "content": content[:15000], 
                "url": url
            }
        except wikipedia.exceptions.DisambiguationError as e:
            # If disambiguation, take the first option
            try:
                page = wikipedia.page(e.options[0], auto_suggest=True)
                url = page.url
                title_text = page.title
                content = page.content
                return {
                    "title": title_text,
                    "content": content[:15000],
                    "url": url
                }
            except:
                raise ValueError(f"Topic is ambiguous: {', '.join(e.options[:5])}...")
        except wikipedia.exceptions.PageError:
            raise ValueError(f"Could not find a Wikipedia page for '{topic_or_url}'")
            
    # Existing URL scraping logic
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract Title
    title = soup.find(id="firstHeading")
    title_text = title.text if title else "Unknown Title"

    # Extract Content
    # We want paragraphs from the main content
    content_div = soup.find(id="mw-content-text")
    if not content_div: # Check just in case
        raise ValueError("Could not find content on this Wikipedia page")
        
    paragraphs = content_div.find_all('p')
    
    # Combine text, limiting length to avoid token limits (arbitrary limit, say 10k chars for now)
    full_text = ""
    for p in paragraphs:
        if p.text:
            full_text += p.text + "\n"
    
    # Cleaning
    # Remove citation numbers like [1], [2]
    cleaned_text = re.sub(r'\[\d+\]', '', full_text)
    
    return {
        "title": title_text,
        "content": cleaned_text[:15000],  # Limit to 15k chars for LLM context
        "url": url
    }
