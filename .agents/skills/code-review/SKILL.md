---
name: code-review
description: "Review code and data pipeline changes for correctness, security, performance, maintainability, contract breaks, and missing verification. Use before merge, after implementation, for PRs, commits, pending diffs, or codebase risk scans."
---

# Code Review

Review adversarially. Findings require evidence from code, diff, tests, or runtime behavior.

## Scope Resolution

- PR or URL: review PR diff.
- Commit hash: review that commit.
- `--pending`: review staged and unstaged changes.
- `codebase`: scan broader architecture/risk surface.
- No explicit target: review recent changes in context or ask for target.

## Review Order

1. Establish scope and changed files.
2. Check requirement/spec compliance.
3. Scout affected dependents and edge cases.
4. Review correctness, contracts, security, performance, tests.
5. Separate blocking findings from non-blocking observations.

## Checklist

- Contract breaks: API, schema, grain, metric, config, behavior.
- Error handling: no silent swallowing or hidden partial failure.
- Validation: inputs checked at trust and data boundaries.
- Security: no secrets, PII leaks, injection, auth/authz gaps.
- Data correctness: idempotency, schema evolution, quality gates, reconciliation.
- Performance: query fan-out, Spark collect/cartesian/skew, unbounded loops.
- Maintainability: clear ownership, no duplicated business logic, no speculative abstraction.
- Verification: tests or direct checks prove the changed behavior.

## Severity

- Critical: security exposure, data loss, breaking contract, irreversible damage.
- High: likely production failure, wrong results, missing required verification.
- Medium: maintainability or performance risk with plausible impact.
- Low: style or cleanup that does not block.

## Output

Lead with findings:

```markdown
Findings:
- [Critical|High|Medium|Low] file:line - issue, impact, evidence, fix

Open questions:
- ...

Summary:
- Reviewed: <scope>
- Verification observed: <commands/results or missing>
```
