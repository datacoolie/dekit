#!/usr/bin/env python3
"""Compute incremental wiki ingest delta from manifest, filesystem, and Git.

This helper is intentionally small and dependency-free. It does not update the
wiki. It only reports which sources are new, modified, touched, unchanged,
deleted, or failed so an AI runner can decide what to ingest.
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_IGNORE_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".scratch",
    ".vscode",
    ".venv",
    "__pycache__",
    ".ipynb_checkpoints",
    "node_modules",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".terraform",
    ".next",
    "build",
    "dist",
    "target",
    "wiki",
}

PROFILE_EXTENSIONS = {
    "general": {
        ".adoc",
        ".cfg",
        ".conf",
        ".ini",
        ".ipynb",
        ".json",
        ".jsonl",
        ".md",
        ".mdx",
        ".py",
        ".rst",
        ".sh",
        ".toml",
        ".txt",
        ".xml",
        ".yaml",
        ".yml",
    },
    "data-engineering": {
        ".ipynb",
        ".json",
        ".jsonl",
        ".md",
        ".mdx",
        ".py",
        ".r",
        ".scala",
        ".sql",
        ".toml",
        ".txt",
        ".yaml",
        ".yml",
    },
    "docs": {
        ".adoc",
        ".md",
        ".mdx",
        ".rst",
        ".txt",
    },
}

DEFAULT_FILENAMES = {
    "AGENTS",
    "AGENTS.md",
    "CHANGELOG",
    "CHANGELOG.md",
    "Dockerfile",
    "Makefile",
    "README",
    "README.md",
}

SECRET_NAME_PATTERNS = {
    ".env",
    ".env.*",
    "*.key",
    "*.pem",
    "*.pfx",
    "*.p12",
    "*credential*",
    "*credentials*",
    "*secret*",
    "*secrets*",
}


def utc_mtime(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return f"sha256:{digest.hexdigest()}"


def load_manifest(wiki_root: Path) -> dict[str, Any]:
    manifest_path = wiki_root / "manifest.json"
    if not manifest_path.exists():
        return {"version": 1, "sources": {}, "repos": {}}
    with manifest_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"Manifest is not a JSON object: {manifest_path}")
    data.setdefault("version", 1)
    data.setdefault("sources", {})
    data.setdefault("repos", {})
    if not isinstance(data["sources"], dict):
        raise ValueError(f"Manifest sources is not an object: {manifest_path}")
    if not isinstance(data["repos"], dict):
        raise ValueError(f"Manifest repos is not an object: {manifest_path}")
    return data


def normalize_ext(value: str) -> str:
    value = value.strip()
    if not value:
        return value
    return value if value.startswith(".") else f".{value}"


def posix_path(path: Path) -> str:
    return path.as_posix()


def rel_key(path: Path, base: Path | None) -> str:
    resolved = path.resolve()
    if base is None:
        return str(resolved)
    try:
        return posix_path(resolved.relative_to(base.resolve()))
    except ValueError:
        return str(resolved)


def match_any(value: str, patterns: list[str] | set[str]) -> bool:
    normalized = value.replace("\\", "/")
    name = normalized.rsplit("/", 1)[-1]
    return any(fnmatch.fnmatch(normalized, pattern) or fnmatch.fnmatch(name, pattern) for pattern in patterns)


def is_secret_path(path: Path | str) -> bool:
    name = Path(path).name
    return match_any(name, SECRET_NAME_PATTERNS)


def is_allowed_source(
    path: Path,
    *,
    base: Path | None,
    extensions: set[str],
    filenames: set[str],
    include_patterns: list[str],
    exclude_patterns: list[str],
    allow_secrets: bool,
) -> bool:
    key = rel_key(path, base)
    if match_any(key, exclude_patterns):
        return False
    if not allow_secrets and is_secret_path(path):
        return False
    if match_any(key, include_patterns):
        return True
    return path.name in filenames or path.suffix.lower() in extensions


def is_allowed_source_key(
    key: str,
    *,
    extensions: set[str],
    filenames: set[str],
    include_patterns: list[str],
    exclude_patterns: list[str],
    allow_secrets: bool,
) -> bool:
    path = Path(key)
    if match_any(key, exclude_patterns):
        return False
    if not allow_secrets and is_secret_path(key):
        return False
    if match_any(key, include_patterns):
        return True
    return path.name in filenames or path.suffix.lower() in extensions


def iter_sources(
    inputs: list[Path],
    *,
    base: Path | None,
    extensions: set[str],
    filenames: set[str],
    include_patterns: list[str],
    exclude_patterns: list[str],
    allow_secrets: bool,
) -> list[Path]:
    results: list[Path] = []
    for item in inputs:
        if not item.exists():
            continue
        if item.is_file():
            if is_allowed_source(
                item,
                base=base,
                extensions=extensions,
                filenames=filenames,
                include_patterns=include_patterns,
                exclude_patterns=exclude_patterns,
                allow_secrets=allow_secrets,
            ):
                results.append(item.resolve())
            continue
        for root, dirs, files in os.walk(item):
            dirs[:] = [d for d in dirs if d not in DEFAULT_IGNORE_DIRS]
            root_path = Path(root)
            for name in files:
                path = root_path / name
                if not is_allowed_source(
                    path,
                    base=base,
                    extensions=extensions,
                    filenames=filenames,
                    include_patterns=include_patterns,
                    exclude_patterns=exclude_patterns,
                    allow_secrets=allow_secrets,
                ):
                    continue
                results.append(path.resolve())
    return sorted(set(results), key=lambda p: str(p).lower())


def classify_source(path: Path, key: str, entry: dict[str, Any] | None, git_change: dict[str, Any] | None = None) -> dict[str, Any]:
    stat = path.stat()
    modified_at = utc_mtime(path)
    size_bytes = stat.st_size
    hash_checked = False
    content_hash = entry.get("content_hash") if entry else None

    if entry is None:
        content_hash = sha256_file(path)
        hash_checked = True
        status = "new"
    elif entry.get("status") == "failed":
        content_hash = sha256_file(path)
        hash_checked = True
        status = "failed"
    elif entry.get("content_hash"):
        if entry.get("modified_at") == modified_at and entry.get("size_bytes") == size_bytes:
            status = "unchanged"
        else:
            content_hash = sha256_file(path)
            hash_checked = True
            status = "touched" if entry.get("content_hash") == content_hash else "modified"
    elif entry.get("modified_at") == modified_at and entry.get("size_bytes") == size_bytes:
        status = "unchanged"
    elif entry.get("modified_at") != modified_at:
        content_hash = sha256_file(path)
        hash_checked = True
        status = "modified"
    else:
        status = "touched"

    item = {
        "status": status,
        "path": key,
        "absolute_path": str(path),
        "content_hash": content_hash,
        "hash_checked": hash_checked,
        "size_bytes": size_bytes,
        "modified_at": modified_at,
        "manifest_status": entry.get("status") if entry else None,
        "pages_created": entry.get("pages_created", []) if entry else [],
        "pages_updated": entry.get("pages_updated", []) if entry else [],
        "pages_stale": entry.get("pages_stale", []) if entry else [],
    }
    if git_change:
        item["git_change"] = git_change
    return item


def deleted_item(key: str, source_path: Path, entry: dict[str, Any] | None, git_change: dict[str, Any] | None = None) -> dict[str, Any]:
    item = {
        "status": "deleted",
        "path": key,
        "absolute_path": str(source_path),
        "content_hash": entry.get("content_hash") if entry else None,
        "hash_checked": False,
        "size_bytes": entry.get("size_bytes") if entry else None,
        "modified_at": entry.get("modified_at") if entry else None,
        "manifest_status": entry.get("status") if entry else None,
        "pages_created": entry.get("pages_created", []) if entry else [],
        "pages_updated": entry.get("pages_updated", []) if entry else [],
        "pages_stale": entry.get("pages_stale", []) if entry else [],
    }
    if git_change:
        item["git_change"] = git_change
    return item


def run_git(repo: Path, args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(repo), *args],
        check=check,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def git_output(repo: Path, args: list[str]) -> str:
    return run_git(repo, args).stdout.strip()


def git_head(repo: Path) -> str | None:
    result = run_git(repo, ["rev-parse", "HEAD"], check=False)
    return result.stdout.strip() or None if result.returncode == 0 else None


def git_branch(repo: Path) -> str | None:
    result = run_git(repo, ["branch", "--show-current"], check=False)
    return result.stdout.strip() or None if result.returncode == 0 else None


def git_commit_reachable(repo: Path, commit: str) -> bool:
    return run_git(repo, ["merge-base", "--is-ancestor", commit, "HEAD"], check=False).returncode == 0


def git_ls_files(repo: Path) -> list[dict[str, Any]]:
    output = git_output(repo, ["ls-files"])
    return [
        {"path": line.strip(), "status": "tracked"}
        for line in output.splitlines()
        if line.strip()
    ]


def git_diff_name_status(repo: Path, commit: str) -> list[dict[str, Any]]:
    output = git_output(repo, ["diff", "--name-status", "-M", f"{commit}..HEAD"])
    changes: list[dict[str, Any]] = []
    for line in output.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        code = parts[0]
        if code.startswith("R") and len(parts) >= 3:
            changes.append({"status": code, "previous_path": parts[1], "path": parts[2]})
        elif len(parts) >= 2:
            changes.append({"status": code, "path": parts[1]})
    return changes


def git_status_changes(repo: Path) -> list[dict[str, Any]]:
    # Do not pass --ignored. Gitignored untracked files are intentionally
    # outside wiki delta unless the user runs an explicit filesystem scan.
    output = run_git(repo, ["status", "--porcelain"]).stdout.rstrip("\n")
    changes: list[dict[str, Any]] = []
    for line in output.splitlines():
        if not line:
            continue
        code = line[:2]
        raw_path = line[3:].strip()
        if " -> " in raw_path:
            previous, current = raw_path.split(" -> ", 1)
            changes.append({"status": code, "previous_path": previous, "path": current, "working_tree": True})
        else:
            changes.append({"status": code, "path": raw_path, "working_tree": True})
    return changes


def repo_manifest_entry(manifest: dict[str, Any], repo: Path) -> dict[str, Any] | None:
    repos = manifest.get("repos", {})
    repo_abs = str(repo.resolve())
    repo_posix = posix_path(repo.resolve())
    for key in (repo_abs, repo_posix, str(repo), posix_path(repo)):
        entry = repos.get(key)
        if isinstance(entry, dict):
            return entry
    return None


def manifest_entry_for_path(manifest_sources: dict[str, Any], key: str, path: Path) -> dict[str, Any] | None:
    entry = manifest_sources.get(key) or manifest_sources.get(str(path)) or manifest_sources.get(posix_path(path))
    return entry if isinstance(entry, dict) else None


def compute_filesystem_delta(
    *,
    manifest: dict[str, Any],
    wiki_root: Path,
    source_paths: list[Path],
    base: Path | None,
    extensions: set[str],
    filenames: set[str],
    include_patterns: list[str],
    exclude_patterns: list[str],
    allow_secrets: bool,
) -> dict[str, Any]:
    manifest_sources: dict[str, Any] = manifest["sources"]
    current_paths = iter_sources(
        source_paths,
        base=base,
        extensions=extensions,
        filenames=filenames,
        include_patterns=include_patterns,
        exclude_patterns=exclude_patterns,
        allow_secrets=allow_secrets,
    )

    by_key: dict[str, Path] = {}
    for path in current_paths:
        key = rel_key(path, base)
        by_key[key] = path

    items: list[dict[str, Any]] = []
    for key, path in by_key.items():
        entry = manifest_entry_for_path(manifest_sources, key, path)
        items.append(classify_source(path, key, entry))

    for key, entry in manifest_sources.items():
        if key in by_key or not isinstance(entry, dict):
            continue
        source_path = Path(entry.get("path") or key)
        if base and not source_path.is_absolute():
            source_path = base / source_path
        if not source_path.exists():
            if not is_allowed_source_key(
                key,
                extensions=extensions,
                filenames=filenames,
                include_patterns=include_patterns,
                exclude_patterns=exclude_patterns,
                allow_secrets=allow_secrets,
            ):
                continue
            items.append(deleted_item(key, source_path, entry))

    return build_delta_result(wiki_root=wiki_root, base=base, items=items, mode="filesystem", git_info=None)


def compute_git_delta(
    *,
    manifest: dict[str, Any],
    wiki_root: Path,
    repo: Path,
    base: Path | None,
    last_commit: str | None,
    include_worktree: bool,
    extensions: set[str],
    filenames: set[str],
    include_patterns: list[str],
    exclude_patterns: list[str],
    allow_secrets: bool,
) -> dict[str, Any]:
    repo = repo.resolve()
    base = base or repo
    manifest_sources: dict[str, Any] = manifest["sources"]
    repo_entry = repo_manifest_entry(manifest, repo)
    last_commit = last_commit or (repo_entry or {}).get("last_commit_synced")
    head = git_head(repo)
    branch = git_branch(repo)

    reachable = bool(last_commit and git_commit_reachable(repo, last_commit))
    if last_commit and reachable:
        mode = "git-range"
        changes = git_diff_name_status(repo, last_commit)
    else:
        mode = "git-full" if not last_commit else "git-fallback-full"
        changes = git_ls_files(repo)

    if include_worktree:
        changes.extend(git_status_changes(repo))

    seen_current: set[str] = set()
    items: list[dict[str, Any]] = []
    for change in changes:
        rel = change["path"].replace("\\", "/")
        status_code = change["status"]
        current_path = repo / rel

        allowed = is_allowed_source_key(
            rel,
            extensions=extensions,
            filenames=filenames,
            include_patterns=include_patterns,
            exclude_patterns=exclude_patterns,
            allow_secrets=allow_secrets,
        )
        if not allowed:
            continue

        git_change = {
            "status": status_code,
            "repo": str(repo),
            "working_tree": bool(change.get("working_tree")),
        }
        if change.get("previous_path"):
            git_change["previous_path"] = change["previous_path"]

        key = rel_key(current_path, base)
        if "D" in status_code and not current_path.exists():
            previous_key = change.get("previous_path") or rel
            entry = manifest_sources.get(previous_key) or manifest_sources.get(key)
            source_path = repo / previous_key
            items.append(deleted_item(previous_key, source_path, entry if isinstance(entry, dict) else None, git_change))
            continue

        if not current_path.exists():
            continue
        seen_current.add(key)
        entry = manifest_entry_for_path(manifest_sources, key, current_path)
        items.append(classify_source(current_path, key, entry, git_change))

    # In fallback/full mode, also report manifest entries that no longer exist.
    if mode in {"git-full", "git-fallback-full"}:
        for key, entry in manifest_sources.items():
            if key in seen_current or not isinstance(entry, dict):
                continue
            source_path = Path(entry.get("path") or key)
            if not source_path.is_absolute():
                source_path = repo / source_path
            if not source_path.exists() and is_allowed_source_key(
                key,
                extensions=extensions,
                filenames=filenames,
                include_patterns=include_patterns,
                exclude_patterns=exclude_patterns,
                allow_secrets=allow_secrets,
            ):
                items.append(deleted_item(key, source_path, entry))

    git_info = {
        "enabled": True,
        "repo": str(repo),
        "branch": branch,
        "head": head,
        "last_commit_synced": last_commit,
        "last_commit_reachable": reachable if last_commit else None,
        "mode": mode,
        "worktree_included": include_worktree,
        "gitignore_respected": True,
    }
    return build_delta_result(wiki_root=wiki_root, base=base, items=items, mode=mode, git_info=git_info)


def build_delta_result(
    *,
    wiki_root: Path,
    base: Path | None,
    items: list[dict[str, Any]],
    mode: str,
    git_info: dict[str, Any] | None,
) -> dict[str, Any]:
    counts: dict[str, int] = {}
    for item in items:
        counts[item["status"]] = counts.get(item["status"], 0) + 1

    result = {
        "wiki_root": str(wiki_root.resolve()),
        "manifest": str((wiki_root / "manifest.json").resolve()),
        "base": str(base.resolve()) if base else None,
        "mode": mode,
        "counts": dict(sorted(counts.items())),
        "items": sorted(items, key=lambda item: (item["status"], item["path"])),
    }
    if git_info:
        result["git"] = git_info
    return result


def render_text(delta: dict[str, Any]) -> str:
    lines = [
        "Wiki Delta",
        f"wiki_root: {delta['wiki_root']}",
        f"manifest: {delta['manifest']}",
        f"mode: {delta['mode']}",
    ]
    if delta.get("git"):
        git = delta["git"]
        lines.extend(
            [
                f"git_repo: {git['repo']}",
                f"git_branch: {git.get('branch') or ''}",
                f"git_head: {git.get('head') or ''}",
                f"last_commit_synced: {git.get('last_commit_synced') or ''}",
                f"last_commit_reachable: {git.get('last_commit_reachable')}",
                f"gitignore_respected: {git.get('gitignore_respected')}",
            ]
        )
    lines.extend(["", "Counts:"])
    for status, count in delta["counts"].items():
        lines.append(f"- {status}: {count}")
    lines.append("")
    lines.append("Items:")
    for item in delta["items"]:
        pages = len(item.get("pages_created", [])) + len(item.get("pages_updated", [])) + len(item.get("pages_stale", []))
        git_change = item.get("git_change", {})
        suffix = f" git={git_change.get('status')}" if git_change else ""
        lines.append(f"- {item['status']}: {item['path']} pages={pages}{suffix}")
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compute wiki ingest delta.")
    parser.add_argument("--wiki-root", default="wiki", help="Wiki root directory containing manifest.json.")
    parser.add_argument("--source", action="append", default=[], help="Source file or directory. Can be repeated.")
    parser.add_argument("--base", default=None, help="Base path used to normalize source keys.")
    parser.add_argument("--git-repo", default=None, help="Git repository to use as the candidate selector.")
    parser.add_argument("--last-commit", default=None, help="Override manifest repos[].last_commit_synced.")
    parser.add_argument("--no-worktree", action="store_true", help="Ignore uncommitted git working tree changes.")
    parser.add_argument(
        "--profile",
        choices=sorted(PROFILE_EXTENSIONS),
        default="data-engineering",
        help="Default source extension profile.",
    )
    parser.add_argument("--ext", action="append", default=[], help="Allowed extension such as .md. Repeatable. Overrides profile extensions.")
    parser.add_argument("--include", action="append", default=[], help="Glob to include even if extension is not in profile. Repeatable.")
    parser.add_argument("--exclude", action="append", default=[], help="Glob to exclude. Repeatable.")
    parser.add_argument("--allow-secrets", action="store_true", help="Allow secret-looking files. Off by default.")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    wiki_root = Path(args.wiki_root)
    base = Path(args.base) if args.base else None
    extensions = {normalize_ext(ext).lower() for ext in args.ext} if args.ext else set(PROFILE_EXTENSIONS[args.profile])
    filenames = set(DEFAULT_FILENAMES)
    manifest = load_manifest(wiki_root)

    if args.git_repo:
        delta = compute_git_delta(
            manifest=manifest,
            wiki_root=wiki_root,
            repo=Path(args.git_repo),
            base=base,
            last_commit=args.last_commit,
            include_worktree=not args.no_worktree,
            extensions=extensions,
            filenames=filenames,
            include_patterns=args.include,
            exclude_patterns=args.exclude,
            allow_secrets=args.allow_secrets,
        )
    else:
        source_paths = [Path(p) for p in args.source] or [Path.cwd()]
        delta = compute_filesystem_delta(
            manifest=manifest,
            wiki_root=wiki_root,
            source_paths=source_paths,
            base=base,
            extensions=extensions,
            filenames=filenames,
            include_patterns=args.include,
            exclude_patterns=args.exclude,
            allow_secrets=args.allow_secrets,
        )

    if args.json:
        print(json.dumps(delta, indent=2, ensure_ascii=False))
    else:
        print(render_text(delta))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
