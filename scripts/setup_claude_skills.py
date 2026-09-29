"""Expose canonical .agents/skills to Claude Code without copying skill files."""

import argparse
import os
import shutil
import subprocess
from pathlib import Path


def create_link(skill: Path, link: Path) -> None:
    if os.name != "nt":
        link.symlink_to(os.path.relpath(skill, link.parent), target_is_directory=True)
        return
    powershell = shutil.which("pwsh") or shutil.which("powershell")
    if not powershell:
        raise OSError("PowerShell is required to create Windows directory junctions")
    helper = Path(__file__).resolve().with_name("create_claude_junction.ps1")
    result = subprocess.run(
        [powershell, "-NoProfile", "-NonInteractive", "-File", str(helper), str(link), str(skill)],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        raise OSError((result.stderr or result.stdout).strip())


def sync_skills(root: Path, check: bool = False) -> tuple[int, list[str]]:
    root = root.resolve()
    source = root / ".agents" / "skills"
    destination = root / ".claude" / "skills"
    if not source.is_dir():
        return 0, [f"Missing canonical skills directory: {source}"]
    if destination.resolve() != destination:
        return 0, [f"Claude skills directory redirects away from its root-relative path: {destination}"]

    skills = sorted(path for path in source.iterdir() if (path / "SKILL.md").is_file())
    if not skills:
        return 0, [f"No skills found in {source}"]
    if not check:
        destination.mkdir(parents=True, exist_ok=True)

    ready = 0
    errors = []
    for skill in skills:
        link = destination / skill.name
        if os.path.lexists(link):
            if link.is_dir() and link.resolve() == skill.resolve():
                ready += 1
            else:
                errors.append(f"Conflicting Claude skill path (left unchanged): {link}")
            continue
        if check:
            errors.append(f"Missing Claude skill link: {link}")
            continue
        try:
            create_link(skill, link)
            if link.is_dir() and link.resolve() == skill.resolve():
                ready += 1
            else:
                errors.append(f"Claude skill link did not resolve to its source: {link}")
        except OSError as exc:
            errors.append(f"Could not link {link}: {exc}")
    return ready, errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify links without changing files")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    ready, errors = sync_skills(root, check=args.check)
    print(f"Claude skills ready: {ready}")
    for error in errors:
        print(error)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
