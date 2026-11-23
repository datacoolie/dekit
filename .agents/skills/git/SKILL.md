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

## Agent-made changes

Default: leave verified changes uncommitted and report them for review. Commit only when asked or when the user opts in to the modes below.

- Baseline: before substantial edits, check `git status --short`. Pre-existing user changes must stay separable. Ask the user to commit/stash them, or use a separate branch/worktree, rather than mixing them into agent commits.
- Isolated branch (preferred for large or risky work): on request or approval, work on `<agent>/<task>` (for example `codex/<task>`, `claude/<task>`, `grok/<task>`; `<agent>` is the running agent's lowercase name) or a `git worktree` from the current base. Never create it on your own while on a default or shared branch. The user reviews `git diff <base>...HEAD`, then merges (prefer squash) or deletes the branch.
- Checkpoint commits (opt-in, for example "commit as you go"): only on a non-default branch with a clean baseline. Commit a verified work item, not every edit, and never push. Report the hash and the base to revert to.
- Revert: prefer `git revert` or dropping the agent branch over rewriting history. `git restore`, `reset --hard`, `branch -D`, and `worktree remove` discard work and need explicit approval.

## Report

- Files staged/committed and commit hash/message.
- Push/PR/merge result.
- Checks run, skipped checks, and unresolved risks.
