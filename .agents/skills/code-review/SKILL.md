---
name: code-review
description: "Review implementation plans, code, and data pipeline changes for correctness, feasibility, security, contract breaks, and missing verification. Use for plan critique before implementation, PRs, pending diffs, or codebase risk scans."
---

# Code Review

Review the requested scope adversarially and read-only. Findings require evidence from requirements, contracts, plans, diffs, code, tests, or runtime behavior.

## Scope

- Plan critique: follow [plan-review criteria](../../instructions/verification.md#plan-review). Check the original requirements and relevant source evidence; report affected task IDs and blocking findings separately from suggestions. Do not rewrite the plan or treat review as approval.
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
