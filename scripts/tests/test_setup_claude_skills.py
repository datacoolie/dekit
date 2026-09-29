"""Focused checks for generated Claude Code skill links."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from setup_claude_skills import sync_skills  # noqa: E402


class SetupClaudeSkillsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        for name in ("scout", "test"):
            skill = self.root / ".agents" / "skills" / name
            skill.mkdir(parents=True)
            (skill / "SKILL.md").write_text(f"# {name}\n", encoding="utf-8")

    def test_create_check_and_rerun(self) -> None:
        for check in (False, True, False):
            ready, errors = sync_skills(self.root, check=check)
            self.assertEqual((ready, errors), (2, []))
        self.assertTrue((self.root / ".claude" / "skills" / "scout" / "SKILL.md").is_file())

    def test_conflicting_directory_is_preserved(self) -> None:
        conflict = self.root / ".claude" / "skills" / "scout"
        conflict.mkdir(parents=True)
        marker = conflict / "user-file.txt"
        marker.write_text("keep", encoding="utf-8")
        ready, errors = sync_skills(self.root)
        self.assertEqual(ready, 1)
        self.assertEqual(len(errors), 1)
        self.assertEqual(marker.read_text(encoding="utf-8"), "keep")

    def test_check_does_not_create_links(self) -> None:
        ready, errors = sync_skills(self.root, check=True)
        self.assertEqual(ready, 0)
        self.assertEqual(len(errors), 2)
        self.assertFalse((self.root / ".claude").exists())


if __name__ == "__main__":
    unittest.main()
