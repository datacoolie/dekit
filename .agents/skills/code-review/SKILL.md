---
name: code-review
description: "Review code and data pipeline changes for correctness, security, performance, maintainability, contract breaks, and missing verification. Use before merge, after implementation, for PRs, commits, pending diffs, or codebase risk scans."
---

# Code Review

Review the requested scope adversarially and read-only. Findings require evidence from the diff, code, tests, or runtime behavior.

## Scope

- PR/commit: inspect the requested diff and its relevant context.
- `--pending`: include staged and unstaged changes without altering the index.
- `codebase`: broaden only to the risk surface needed for the question.
- No target: identify the recent change or ask for scope before broad scanning.

Trace changed contracts, callers, data grain, error paths, trust boundaries, performance-sensitive paths, and verification. Do not report style preferences as defects or apply fixes unless separately authorized.

## Severity

Base severity on reachable impact, likelihood, and reversibility: critical (security/data loss/irreversible break), high (likely production failure or required gate missing), medium (plausible correctness/operation risk), low (non-blocking issue). A category alone is not severity.

## Output

```markdown
Findings:
- [severity] file:line — issue, impact, evidence, smallest safe fix

Open questions:
- ...

Summary:
- Scope and verification observed: ...
```
