---
name: git
description: Git operations with conventional commits. Use for staging, committing, pushing, PRs, and merges.
---

# Git

Perform only the Git operation the user requested. Destructive commands, force pushes, and merges require explicit approval.

## Before changing state

- Inspect `git status --short`, branch/remote, and the relevant diff.
- Preserve unrelated edits and existing staging; stage only files in scope.
- Before commit, inspect the actual staged patch (`git diff --cached --stat`, names, and content).
- Scan touched/staged content with available secret tooling or scoped patterns including private-key blocks. Keyword matches are candidates, not proof; stop and report plausible secrets.

## Operation rules

- One coherent change per commit; do not split solely by file type.
- Use `type(scope): imperative summary` for commits.
- Push, PR creation, and merge happen only when requested; inspect branch state and conflicts first.
- Never rewrite or discard user work to make a clean diff.

## Report

- Files staged/committed and commit hash/message.
- Push/PR/merge result.
- Checks run, skipped checks, and unresolved risks.
