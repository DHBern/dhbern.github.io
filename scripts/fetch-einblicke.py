"""Pre-render script: list the posts of the blog «Einblicke in die Digital Humanities».

Reads the blog's RSS feed and writes einblicke-posts.yml for the News & Updates
tile on the home page. The site is rendered daily by the scheduled publish
workflow, so the tile is refreshed once a day. If the feed cannot be reached,
the last written file is kept and the build goes on.
"""

import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date
from email.utils import parsedate_to_datetime
from pathlib import Path

import yaml

FEED_URL = "https://einblicke.hypotheses.org/feed"
SINCE = date(2026, 9, 1)  # first post shown: start of the autumn semester 2026
OUTPUT = Path("einblicke-posts.yml")
DATE_FORMAT = "%Y.%m.%d"  # dotted YYYY.MM.DD is the site-wide date format
MAX_PAGES = 10  # the feed serves 10 posts per page
TIMEOUT = 20

DC_CREATOR = "{http://purl.org/dc/elements/1.1/}creator"


def fetch_page(page: int) -> list[ET.Element]:
    """Return the <item> elements of one feed page (WordPress ?paged=N)."""
    url = FEED_URL if page == 1 else f"{FEED_URL}?paged={page}"
    request = urllib.request.Request(url, headers={"User-Agent": "dhbern.github.io"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            root = ET.fromstring(response.read())
    except urllib.error.HTTPError as err:
        if err.code == 404 and page > 1:
            return []  # past the last page
        raise
    return root.findall("./channel/item")


def collect_posts() -> list[dict]:
    """Walk the feed pages until a post older than SINCE appears."""
    posts: list[dict] = []
    for page in range(1, MAX_PAGES + 1):
        items = fetch_page(page)
        if not items:
            break
        reached_older = False
        for item in items:
            published = parsedate_to_datetime(item.findtext("pubDate")).date()
            if published < SINCE:
                reached_older = True
                continue
            posts.append(
                {
                    "title": (item.findtext("title") or "").strip(),
                    "author": (item.findtext(DC_CREATOR) or "").strip(),
                    "date": published.strftime(DATE_FORMAT),
                    "path": (item.findtext("link") or "").strip(),
                }
            )
        if reached_older:
            break
    return sorted(posts, key=lambda p: p["date"], reverse=True)


def main() -> None:
    try:
        posts = collect_posts()
    except (urllib.error.URLError, ET.ParseError, TimeoutError) as err:
        print(f"Einblicke feed not reachable ({err}); keeping {OUTPUT}", file=sys.stderr)
        return

    with open(OUTPUT, "w", encoding="utf-8") as f:
        yaml.dump(posts, f, default_flow_style=False, allow_unicode=True)

    print(f"Einblicke: {len(posts)} posts since {SINCE.strftime(DATE_FORMAT)}")


if __name__ == "__main__":
    main()
