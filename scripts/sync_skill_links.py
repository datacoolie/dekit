#!/usr/bin/env python3
"""Sync .claude/skills/<name> links with the canonical .agents/skills/<name> folders.

Some AI agents read project skills only from .claude/skills/. This script makes
one directory link for each canonical skill, so the skill content has one source.
Git ignores the links. Run the script after you clone or copy dekit, and after
you add, rename, or remove a skill.

Usage:
  python scripts/sync_skill_links.py          # create, repair, and prune links
  python scripts/sync_skill_links.py --check  # report only; exit 1 on drift

On Windows, the script makes a symbolic link when Developer Mode is on or the
shell runs as administrator. Otherwise it makes a directory junction, which
needs no privilege. Standard library only.
"""
import argparse
import filecmp
import os
import shutil
import stat
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / ".agents" / "skills"
LINKS = ROOT / ".claude" / "skills"


def is_link(path):
    if path.is_symlink():
        return True
    if os.name != "nt":
        return False
    try:  # directory junction
        return bool(os.lstat(path).st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT)
    except OSError:
        return False


def is_placeholder(path, name):
    """A link that Git or a copy tool wrote as a small text file."""
    if not path.is_file() or is_link(path) or path.stat().st_size > 512:
        return False
    text = path.read_bytes().decode("utf-8", "replace").strip().replace("\\", "/")
    return text == f"../../.agents/skills/{name}"


def same_tree(a, b):
    """True when directory b is an exact copy of directory a."""
    cmp = filecmp.dircmp(a, b, ignore=[])
    if cmp.left_only or cmp.right_only or cmp.funny_files:
        return False
    _, mismatch, errors = filecmp.cmpfiles(a, b, cmp.common_files, shallow=False)
    if mismatch or errors:
        return False
    return all(same_tree(os.path.join(a, d), os.path.join(b, d)) for d in cmp.common_dirs)


def remove(path):
    if is_link(path):
        if os.name == "nt":
            try:
                os.rmdir(path)  # directory link or junction; never deletes the target
            except OSError:
                os.unlink(path)
        else:
            path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()


def make_link(link, target):
    relative = os.path.join("..", "..", ".agents", "skills", target.name)
    try:
        os.symlink(relative, link, target_is_directory=True)
        return "symlink"
    except OSError:
        if os.name != "nt":
            raise
    import _winapi

    _winapi.CreateJunction(str(target), str(link))
    return "junction"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="report drift without changing files")
    args = parser.parse_args()

    if not SOURCE.is_dir():
        print(f"error: {SOURCE} not found", file=sys.stderr)
        return 2
    skills = sorted(p.parent.name for p in SOURCE.glob("*/SKILL.md"))
    if not args.check:
        LINKS.mkdir(parents=True, exist_ok=True)
    drift = skipped = 0

    for name in skills:
        link, target = LINKS / name, SOURCE / name
        if is_link(link) and link.resolve() == target.resolve():
            continue
        exists = link.exists() or is_link(link)
        replaceable = not exists or is_link(link) or is_placeholder(link, name) or (
            link.is_dir() and same_tree(target, link))
        if not replaceable:
            print(f"SKIP  {name}: .claude/skills/{name} has other content; move it, then run again")
            skipped += 1
            continue
        drift += 1
        if args.check:
            print(f"DRIFT {name}")
            continue
        if exists:
            remove(link)
        print(f"LINK  {name} ({make_link(link, target)})")

    if LINKS.is_dir():
        for entry in sorted(LINKS.iterdir()):
            if entry.name in skills or not is_link(entry) or entry.exists():
                continue
            drift += 1
            print(f"{'STALE' if args.check else 'PRUNE'} {entry.name}")
            if not args.check:
                remove(entry)

    state = "drift" if args.check else "changed"
    print(f"{len(skills)} skills; {state}={drift}; skipped={skipped}")
    return 1 if (args.check and drift) or skipped else 0


if __name__ == "__main__":
    sys.exit(main())
