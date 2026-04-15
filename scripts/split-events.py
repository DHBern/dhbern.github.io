"""Pre-render script: split events into upcoming and past YAML listing files."""

from datetime import date
from pathlib import Path

import yaml

CONTENT_DIR = Path("content")
OUTPUT_DIR = Path(".")
TODAY = date.today()


def parse_frontmatter(path: Path) -> dict | None:
    """Extract YAML frontmatter from a .qmd file."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    end = text.index("---", 3)
    return yaml.safe_load(text[3:end])


def _flatten_author(author) -> str:
    """Convert author field (string, dict, or list) to a plain string."""
    if isinstance(author, str):
        return author
    if isinstance(author, dict):
        return author.get("name", "")
    if isinstance(author, list):
        names = [a.get("name", "") if isinstance(a, dict) else str(a) for a in author]
        return ", ".join(n for n in names if n)
    return str(author)


def collect_events() -> list[tuple[date, dict]]:
    """Walk content/ for event .qmd files and return (event_date, item) tuples."""
    events: list[tuple[date, dict]] = []
    for qmd in CONTENT_DIR.rglob("*.qmd"):
        fm = parse_frontmatter(qmd)
        if fm is None:
            continue
        categories = fm.get("categories", [])
        if isinstance(categories, str):
            categories = [categories]
        if "Event" not in categories:
            continue

        event_date = fm.get("event-date") or fm.get("date")
        if event_date is None:
            continue

        # Normalize to date object
        if isinstance(event_date, str):
            event_date = date.fromisoformat(event_date)

        # Build path relative to project root (Quarto expects .html output path)
        rel_path = str(qmd).replace(".qmd", ".html")

        item = {
            "title": fm.get("title", ""),
            "event-date": event_date.isoformat(),
            "date": str(fm.get("date", event_date.isoformat())),
            "author": _flatten_author(fm.get("author", "")),
            "location": fm.get("location", ""),
            "categories": categories,
            "path": rel_path,
        }
        if fm.get("subtitle"):
            item["subtitle"] = fm["subtitle"]

        events.append((event_date, item))

    return events


def main() -> None:
    events = collect_events()

    upcoming = sorted(
        [item for d, item in events if d >= TODAY],
        key=lambda x: x["event-date"],
    )
    past = sorted(
        [item for d, item in events if d < TODAY],
        key=lambda x: x["event-date"],
        reverse=True,
    )

    with open(OUTPUT_DIR / "upcoming-events.yml", "w", encoding="utf-8") as f:
        yaml.dump(upcoming, f, default_flow_style=False, allow_unicode=True)

    with open(OUTPUT_DIR / "past-events.yml", "w", encoding="utf-8") as f:
        yaml.dump(past, f, default_flow_style=False, allow_unicode=True)

    print(f"Events split: {len(upcoming)} upcoming, {len(past)} past (as of {TODAY})")


if __name__ == "__main__":
    main()
