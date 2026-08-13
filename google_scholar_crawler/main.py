"""Fetch citation statistics from Google Scholar and write them as JSON.

Run by .github/workflows/google-scholar-stats.yml; the result is published to
the google-scholar-stats branch, which index.html reads at page load.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

from scholarly import scholarly

AUTHOR_ID = os.environ.get("GOOGLE_SCHOLAR_ID", "h1I6LJcAAAAJ")
OUT_DIR = Path("results")


def main() -> None:
    author = scholarly.search_author_id(AUTHOR_ID)
    author = scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])

    publications = {}
    for pub in author.get("publications", []):
        pub_id = pub.get("author_pub_id")
        if not pub_id:
            continue
        publications[pub_id] = {
            "title": pub.get("bib", {}).get("title"),
            "year": pub.get("bib", {}).get("pub_year"),
            "citations": pub.get("num_citations", 0),
        }

    data = {
        "name": author.get("name"),
        "citedby": author.get("citedby", 0),
        "citedby5y": author.get("citedby5y", 0),
        "hindex": author.get("hindex", 0),
        "i10index": author.get("i10index", 0),
        "publications": publications,
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }

    OUT_DIR.mkdir(exist_ok=True)
    (OUT_DIR / "gs_data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8"
    )

    # shields.io endpoint format, in case a badge is wanted somewhere
    (OUT_DIR / "gs_data_shieldsio.json").write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "label": "citations",
                "message": str(data["citedby"]),
                "color": "9cf",
            }
        ),
        encoding="utf-8",
    )

    print("citations:", data["citedby"], "h-index:", data["hindex"])


if __name__ == "__main__":
    main()
