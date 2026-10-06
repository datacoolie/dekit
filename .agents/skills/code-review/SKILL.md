---
name: code-review
description: "Review plans, code, and data-pipeline changes for correctness, design conformance, maintainability, security, contract breaks, and missing verification; use for read-only findings, not implementation."
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

For affected design boundaries or structural review, apply [design-conformance criteria](../../instructions/verification.md#design-conformance-and-refactoring). Consult [paired cases](references/design-integrity-cases.md) only when calibrating an ambiguous design or wiki discrepancy finding.

## Severity

Base severity on reachable impact, likelihood, and reversibility: critical (security/data loss/irreversible break), high (likely production failure or required gate missing), medium (plausible correctness/operation risk), low (non-blocking issue). A category alone is not severity.

## Output

```markdown
Findings:
- [severity] file:line — issue, impact, evidence, smallest safe fix

Suggestions (if any):
- file:line — structural improvement, concrete benefit/cost, trade-off

Summary:
- Scope and verification observed: ...

Open questions:
- ...
```
