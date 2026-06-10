---
name: git
description: Git operations with conventional commits. Use for staging, committing, pushing, PRs, and merges.
---

# Git

Use this skill for staging, committing, pushing, pull requests, and merges.

Do not run destructive git commands unless the user explicitly asks.

## Intent Routing

- Commit when the user asks to save a coherent change.
- Push when the user asks to publish local commits.
- Open or prepare a pull request when the user asks for review or PR creation.
- Merge only when the user explicitly asks to merge branches.
- If the intended git operation is unclear, ask before changing repository state.

## Commit Workflow

1. Inspect state:

```bash
git status --short
git diff --stat
```

2. Stage only files that belong to the requested change.

```bash
git diff --cached --stat
git diff --cached --name-only
```

3. Scan staged diff for secrets before committing.

```bash
git diff --cached | grep -iE "(api[_-]?key|token|password|secret|credential)"
```

If secrets are found, stop and report the affected files.

4. Split commits when staged changes contain unrelated types, scopes, generated artifacts, or dependency/config changes mixed with source changes.

5. Use Conventional Commits:

```text
type(scope): short imperative summary
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.

## Push And PR

- Before pushing, check the branch and remote.
- If push is rejected, suggest `git pull --rebase` only after inspecting the branch state.
- For PRs, summarize changed behavior, tests run, and unresolved risks.

## Merge

- Inspect both source and target branches first.
- Stop on conflicts and report files requiring manual resolution.
- Do not force push or rewrite shared history without explicit approval.

## Report

- Files staged or committed.
- Commit hash and message.
- Push or PR result.
- Skipped checks or unresolved issues.
