#!/usr/bin/env python3
"""Rank wiki pages for an AI runner using metadata-first search.

The script is intentionally dependency-free and read-only. It helps an agent
choose which wiki pages to open; it does not answer questions or modify files.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROUTING_FILES = {"purpose.md", "overview.md", "index.md"}
DEFAULT_EXCLUDE_PARTS = {"exports", "staging", "inbox"}
STATUS_SCORE = {
    "active": 2.0,
    "draft": -1.0,
    "stale": -4.0,
    "contradicted": -6.0,
    "archived": -10.0,
}
STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "the",
    "to",
    "what",
    "when",
    "where",
    "which",
    "why",
    "with",
}


@dataclass
class Page:
    path: Path
    rel_path: str
    frontmatter: dict[str, Any]
    body: str


def tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[\w.-]+", text.lower(), flags=re.UNICODE)
    return [token for token in tokens if len(token) > 1 and token not in STOPWORDS]


def strip_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def parse_scalar(value: str) -> Any:
    value = strip_quotes(value.strip())
    if not value:
        return ""
    if value in {"[]", "{}"}:
        return [] if value == "[]" else {}
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [strip_quotes(part.strip()) for part in inner.split(",")]
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    try:
        if "." in value:
            return float(value)
        return int(value)
    except ValueError:
        return value


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---"):
        return {}, text
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, re.S)
    if not match:
        return {}, text

    frontmatter_text = match.group(1)
    body = text[match.end() :]
    data: dict[str, Any] = {}
    current_key: str | None = None
    current_list_item: dict[str, Any] | None = None
    block_key: str | None = None
    block_lines: list[str] = []

    def flush_block() -> None:
        nonlocal block_key, block_lines
        if block_key is not None:
            data[block_key] = " ".join(line.strip() for line in block_lines if line.strip())
            block_key = None
            block_lines = []

    for raw_line in frontmatter_text.splitlines():
        if block_key is not None:
            indent = len(raw_line) - len(raw_line.lstrip(" "))
            if indent > 0 or not raw_line.strip():
                block_lines.append(raw_line.strip())
                continue
            flush_block()

        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        line = raw_line.strip()

        if indent == 0 and ":" in line:
            key, value = line.split(":", 1)
            current_key = key.strip()
            current_list_item = None
            value = value.strip()
            if value:
                if value in {">", ">-", "|", "|-"}:
                    data[current_key] = ""
                    block_key = current_key
                else:
                    data[current_key] = parse_scalar(value)
            else:
                data[current_key] = []
            continue

        if current_key is None:
            continue

        if line.startswith("- "):
            item_text = line[2:].strip()
            if ":" in item_text:
                key, value = item_text.split(":", 1)
                current_list_item = {key.strip(): parse_scalar(value.strip())}
                if not isinstance(data.get(current_key), list):
                    data[current_key] = []
                data[current_key].append(current_list_item)
            else:
                current_list_item = None
                if not isinstance(data.get(current_key), list):
                    data[current_key] = []
                data[current_key].append(parse_scalar(item_text))
            continue

        if current_list_item is not None and ":" in line:
            key, value = line.split(":", 1)
            current_list_item[key.strip()] = parse_scalar(value.strip())
            continue

        if isinstance(data.get(current_key), list):
            data[current_key].append(parse_scalar(line))

    flush_block()
    return data, body


def page_text_field(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (str, int, float, bool)):
        return str(value)
    if isinstance(value, list):
        return " ".join(page_text_field(item) for item in value)
    if isinstance(value, dict):
        return " ".join(f"{key} {page_text_field(val)}" for key, val in value.items())
    return str(value)


def read_page(path: Path, root: Path) -> Page:
    text = path.read_text(encoding="utf-8", errors="replace")
    frontmatter, body = parse_frontmatter(text)
    return Page(path=path, rel_path=path.relative_to(root).as_posix(), frontmatter=frontmatter, body=body)


def should_skip(path: Path, root: Path, include_generated: bool) -> bool:
    rel_parts = path.relative_to(root).parts
    if not include_generated and any(part in DEFAULT_EXCLUDE_PARTS for part in rel_parts):
        return True
    if path.name == "search-index.json":
        return True
    return False


def load_pages(root: Path, include_generated: bool) -> list[Page]:
    if not root.exists():
        return []
    pages = []
    for path in sorted(root.rglob("*.md")):
        if should_skip(path, root, include_generated):
            continue
        pages.append(read_page(path, root))
    return pages


def contains_phrase(text: str, phrase: str) -> bool:
    return phrase and phrase.lower() in text.lower()


def count_token_hits(text: str, tokens: list[str]) -> int:
    lowered = text.lower()
    return sum(1 for token in tokens if token in lowered)


def as_list(value: Any) -> list[Any]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return value
    return [value]


def score_page(page: Page, query: str, tokens: list[str], mode: str, include_body: bool = False) -> tuple[float, list[str]]:
    fm = page.frontmatter
    title = page_text_field(fm.get("title"))
    summary = page_text_field(fm.get("summary"))
    page_type = page_text_field(fm.get("type") or fm.get("category"))
    status = page_text_field(fm.get("status")).lower()
    tags = page_text_field(fm.get("tags"))
    relationships = page_text_field(fm.get("relationships"))
    sources = page_text_field(fm.get("sources"))
    updated = page_text_field(fm.get("updated"))
    rel_path = page.rel_path

    score = 0.0
    reasons: list[str] = []

    weighted_fields = [
        ("title", title, 7.0),
        ("path", rel_path, 5.0),
        ("tags", tags, 5.0),
        ("type", page_type, 4.0),
        ("summary", summary, 3.0),
        ("relationships", relationships, 2.5),
        ("sources", sources, 1.5),
    ]

    for name, value, weight in weighted_fields:
        if contains_phrase(value, query):
            score += weight * 2
            reasons.append(f"phrase:{name}")
        hits = count_token_hits(value, tokens)
        if hits:
            score += hits * weight
            reasons.append(f"{name}:{hits}")

    if include_body:
        body_hits = min(count_token_hits(page.body, tokens), 8)
        if body_hits:
            score += body_hits
            reasons.append(f"body:{body_hits}")

    if status:
        score += STATUS_SCORE.get(status, 0.0)
        if status in STATUS_SCORE:
            reasons.append(f"status:{status}")

    provenance = fm.get("provenance")
    ambiguous = 0.0
    if isinstance(provenance, dict):
        try:
            ambiguous = float(provenance.get("ambiguous", 0.0))
        except (TypeError, ValueError):
            ambiguous = 0.0
    if ambiguous > 0:
        penalty = min(ambiguous * 4, 4)
        score -= penalty
        reasons.append(f"ambiguous:{ambiguous:g}")

    if mode == "verified":
        if as_list(fm.get("sources")):
            score += 2
            reasons.append("has-sources")
        else:
            score -= 3
            reasons.append("missing-sources")

    if page.path.name in ROUTING_FILES:
        score += 1
        reasons.append("routing")

    if updated:
        reasons.append(f"updated:{updated}")

    return score, reasons


def search(root: Path, query: str, mode: str, limit: int, include_generated: bool) -> dict[str, Any]:
    pages = load_pages(root, include_generated=include_generated)
    tokens = tokenize(query)
    preliminary = []

    for page in pages:
        score, reasons = score_page(page, query=query, tokens=tokens, mode=mode, include_body=False)
        if score > 0 or page.path.name in ROUTING_FILES:
            preliminary.append((page, score, reasons))

    preliminary.sort(key=lambda item: (-item[1], item[0].rel_path))
    body_scored_paths: set[str] = set()
    if mode in {"focused", "verified"}:
        body_scored_paths = {page.rel_path for page, score, _ in preliminary[: max(limit * 3, 20)] if score > 0}
    elif mode == "exploratory":
        body_scored_paths = {page.rel_path for page in pages}

    results = []

    for page in pages:
        include_body = page.rel_path in body_scored_paths
        score, reasons = score_page(page, query=query, tokens=tokens, mode=mode, include_body=include_body)
        if score <= 0 and page.path.name not in ROUTING_FILES:
            continue
        fm = page.frontmatter
        results.append(
            {
                "path": page.rel_path,
                "title": fm.get("title") or page.path.stem,
                "type": fm.get("type") or fm.get("category") or "",
                "status": fm.get("status") or "",
                "summary": fm.get("summary") or "",
                "tags": as_list(fm.get("tags")),
                "updated": fm.get("updated") or "",
                "score": round(score, 2),
                "reasons": reasons,
                "sources_count": len(as_list(fm.get("sources"))),
                "relationships_count": len(as_list(fm.get("relationships"))),
            }
        )

    results.sort(key=lambda item: (-item["score"], item["path"]))
    return {
        "query": query,
        "mode": mode,
        "wiki_root": str(root.resolve()),
        "tokens": tokens,
        "pages_scanned": len(pages),
        "candidates": results[:limit],
    }


def render_text(result: dict[str, Any]) -> str:
    lines = [
        "Wiki Search",
        f"query: {result['query']}",
        f"mode: {result['mode']}",
        f"pages_scanned: {result['pages_scanned']}",
        "",
        "Candidates:",
    ]
    for item in result["candidates"]:
        title = item["title"]
        summary = item["summary"]
        lines.append(f"- {item['score']:>5} {item['path']} ({item['status'] or 'unknown'})")
        if title:
            lines.append(f"  title: {title}")
        if summary:
            lines.append(f"  summary: {summary}")
        if item["reasons"]:
            lines.append(f"  reasons: {', '.join(item['reasons'])}")
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Rank wiki pages for selective AI reads.")
    parser.add_argument("query", help="Search query or task context.")
    parser.add_argument("--wiki-root", default="wiki", help="Wiki root directory.")
    parser.add_argument("--mode", choices=["fast", "focused", "verified", "exploratory"], default="focused")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--include-generated", action="store_true", help="Include staging, exports, and inbox pages.")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = search(
        root=Path(args.wiki_root),
        query=args.query,
        mode=args.mode,
        limit=args.limit,
        include_generated=args.include_generated,
    )
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(render_text(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
