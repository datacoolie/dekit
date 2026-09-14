#!/usr/bin/env python3
"""Focused, dependency-free regressions for the read-only wiki helpers."""

from __future__ import annotations

import subprocess
import json
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

import wiki_delta  # noqa: E402
import wiki_search  # noqa: E402


class WikiHelperTests(unittest.TestCase):
    def test_source_urls_remain_scalar_frontmatter_values(self) -> None:
        text = """---
sources:
  - https://example.invalid/docs
  - path: src/example.py
---
"""
        parsed, _ = wiki_search.parse_frontmatter(text)
        self.assertEqual(parsed["sources"][0], "https://example.invalid/docs")
        self.assertEqual(parsed["sources"][1], {"path": "src/example.py"})

    def test_purpose_layout_and_minimal_pages_are_searchable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "wiki"
            for folder, name in (
                ("", "index.md"),
                ("specs", "requirements.md"),
                ("research", "evidence.md"),
                ("architecture", "overview.md"),
                ("decisions", "001-choice.md"),
                ("runbooks", "check.md"),
            ):
                target = root / folder
                target.mkdir(parents=True, exist_ok=True)
                (target / name).write_text(f"# {name}\ncontinuity topic", encoding="utf-8")

            result = wiki_search.search(root, "continuity", "exploratory", 20, False)
            self.assertEqual(result["pages_scanned"], 6)
            self.assertEqual(
                {item["path"] for item in result["candidates"]},
                {
                    "index.md",
                    "specs/requirements.md",
                    "research/evidence.md",
                    "architecture/overview.md",
                    "decisions/001-choice.md",
                    "runbooks/check.md",
                },
            )

    def test_durable_page_survives_disposable_plan_removal(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            wiki = root / "wiki"
            plan = root / "plans" / "temporary"
            wiki.mkdir()
            plan.mkdir(parents=True)
            durable = wiki / "specs" / "topic.md"
            durable.parent.mkdir()
            durable.write_text("# Topic\naccepted decision and verified behavior", encoding="utf-8")
            (plan / "plan.md").write_text("# Disposable plan", encoding="utf-8")

            before = wiki_search.search(wiki, "accepted decision", "exploratory", 10, False)
            (root / "plans" / "temporary" / "plan.md").unlink()
            (root / "plans" / "temporary").rmdir()
            after = wiki_search.search(wiki, "accepted decision", "exploratory", 10, False)

            self.assertEqual(before["pages_scanned"], after["pages_scanned"])
            self.assertEqual(after["candidates"][0]["path"], "specs/topic.md")

    def test_nested_provenance_is_scored(self) -> None:
        frontmatter = """---
title: Example
status: active
provenance:
  extracted: 0.7
  inferred: 0.2
  ambiguous: 0.8
sources:
  - path: src/example.py
---
"""
        parsed, body = wiki_search.parse_frontmatter(frontmatter + "Body")
        self.assertEqual(parsed["provenance"]["ambiguous"], 0.8)
        page = wiki_search.Page(Path("example.md"), "example.md", parsed, body)
        score, reasons = wiki_search.score_page(page, "example", wiki_search.tokenize("example"), "focused")
        no_ambiguity = wiki_search.Page(page.path, page.rel_path, {**parsed, "provenance": {"ambiguous": 0}}, body)
        clear_score, _ = wiki_search.score_page(no_ambiguity, "example", wiki_search.tokenize("example"), "focused")
        self.assertAlmostEqual(clear_score - score, 3.2)
        self.assertIn("ambiguous:0.8", reasons)
        inline, _ = wiki_search.parse_frontmatter("---\nprovenance: {ambiguous: 0.4}\n---\n")
        self.assertEqual(inline["provenance"]["ambiguous"], 0.4)

    def test_missing_optional_metadata_still_searches(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "index.md").write_text("# Index", encoding="utf-8")
            (root / "plain.md").write_text("# Plain\nuseful topic", encoding="utf-8")
            result = wiki_search.search(root, "plain", "focused", 5, False)
            self.assertEqual(result["pages_scanned"], 2)
            self.assertTrue(any(item["path"] == "plain.md" for item in result["candidates"]))

    def test_git_rename_reconciles_old_manifest_pages(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            wiki = Path(tmp) / "wiki"
            repo.mkdir()
            wiki.mkdir()
            self._git(repo, "init")
            self._git(repo, "config", "user.email", "test@example.invalid")
            self._git(repo, "config", "user.name", "Wiki Test")
            (repo / "old.md").write_text("same content", encoding="utf-8")
            self._git(repo, "add", "old.md")
            self._git(repo, "commit", "-m", "initial")
            base_commit = self._git(repo, "rev-parse", "HEAD").stdout.strip()
            self._git(repo, "mv", "old.md", "new.md")
            self._git(repo, "commit", "-m", "rename")

            manifest = {
                "version": 1,
                "sources": {
                    "old.md": {
                        "path": "old.md",
                        "content_hash": "sha256:old",
                        "pages_created": ["sources/old.md.md"],
                    }
                },
                "repos": {},
            }
            delta = wiki_delta.compute_git_delta(
                manifest=manifest,
                wiki_root=wiki,
                repo=repo,
                base=repo,
                last_commit=base_commit,
                include_worktree=False,
                extensions={".md"},
                filenames=set(),
                include_patterns=[],
                exclude_patterns=[],
                allow_secrets=False,
            )
            old_items = [item for item in delta["items"] if item["path"] == "old.md"]
            new_items = [item for item in delta["items"] if item["path"] == "new.md"]
            self.assertEqual(len(old_items), 1)
            self.assertEqual(old_items[0]["status"], "deleted")
            self.assertEqual(old_items[0]["git_change"]["lifecycle"], "renamed")
            self.assertEqual(len(new_items), 1)

    def test_git_quoted_paths_are_preserved(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            repo.mkdir()
            self._git(repo, "init")
            self._git(repo, "config", "user.email", "test@example.invalid")
            self._git(repo, "config", "user.name", "Wiki Test")
            path = repo / "資料 with spaces.md"
            path.write_text("content", encoding="utf-8")
            self._git(repo, "add", ".")
            self._git(repo, "commit", "-m", "unicode")
            self.assertEqual(wiki_delta.git_ls_files(repo)[0]["path"], "資料 with spaces.md")
            (repo / "new with spaces.md").write_text("untracked", encoding="utf-8")
            self.assertEqual(wiki_delta.git_status_changes(repo)[0]["path"], "new with spaces.md")

    def test_rename_to_excluded_extension_keeps_old_association(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            wiki = Path(tmp) / "wiki"
            repo.mkdir()
            wiki.mkdir()
            self._git(repo, "init")
            self._git(repo, "config", "user.email", "test@example.invalid")
            self._git(repo, "config", "user.name", "Wiki Test")
            (repo / "old.md").write_text("same content", encoding="utf-8")
            self._git(repo, "add", "old.md")
            self._git(repo, "commit", "-m", "initial")
            base_commit = self._git(repo, "rev-parse", "HEAD").stdout.strip()
            self._git(repo, "mv", "old.md", "new.bin")
            self._git(repo, "commit", "-m", "rename excluded")
            manifest = {
                "version": 1,
                "sources": {"old.md": {"path": "old.md", "pages_stale": ["sources/old.md.md"]}},
                "repos": {},
            }
            delta = wiki_delta.compute_git_delta(
                manifest=manifest,
                wiki_root=wiki,
                repo=repo,
                base=repo,
                last_commit=base_commit,
                include_worktree=False,
                extensions={".md"},
                filenames=set(),
                include_patterns=[],
                exclude_patterns=[],
                allow_secrets=False,
            )
            self.assertEqual([item["path"] for item in delta["items"]], ["old.md"])
            self.assertEqual(delta["items"][0]["status"], "deleted")

    def test_committed_and_worktree_changes_are_one_candidate(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            wiki = Path(tmp) / "wiki"
            repo.mkdir()
            wiki.mkdir()
            self._git(repo, "init")
            self._git(repo, "config", "user.email", "test@example.invalid")
            self._git(repo, "config", "user.name", "Wiki Test")
            source = repo / "source.md"
            source.write_text("a", encoding="utf-8")
            self._git(repo, "add", "source.md")
            self._git(repo, "commit", "-m", "initial")
            base_commit = self._git(repo, "rev-parse", "HEAD").stdout.strip()
            source.write_text("b", encoding="utf-8")
            self._git(repo, "add", "source.md")
            self._git(repo, "commit", "-m", "committed change")
            source.write_text("c", encoding="utf-8")
            delta = wiki_delta.compute_git_delta(
                manifest={"version": 1, "sources": {}, "repos": {}},
                wiki_root=wiki,
                repo=repo,
                base=repo,
                last_commit=base_commit,
                include_worktree=True,
                extensions={".md"},
                filenames=set(),
                include_patterns=[],
                exclude_patterns=[],
                allow_secrets=False,
            )
            candidates = [item for item in delta["items"] if item["path"] == "source.md"]
            self.assertEqual(len(candidates), 1)
            self.assertTrue(candidates[0]["git_change"]["working_tree"])
            self.assertGreaterEqual(len(candidates[0]["git_change"]["statuses"]), 2)

    def test_cli_relative_paths_use_git_root_from_nested_cwd(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            wiki = repo / "wiki"
            nested = repo / "service" / "nested"
            nested.mkdir(parents=True)
            wiki.mkdir()
            (wiki / "index.md").write_text("# Project index", encoding="utf-8")
            self._git(repo, "init")
            result = subprocess.run(
                [sys.executable, str(SCRIPTS / "wiki_search.py"), "index", "--wiki-root", "wiki", "--json"],
                cwd=nested,
                check=True,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            payload = json.loads(result.stdout)
            self.assertEqual(payload["pages_scanned"], 1)
            self.assertEqual(Path(payload["wiki_root"]), wiki.resolve())

    @staticmethod
    def _git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["git", "-C", str(repo), *args],
            check=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )


if __name__ == "__main__":
    unittest.main()
