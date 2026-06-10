---
name: test
description: "Run and design verification for code, data pipelines, SQL, Spark, notebooks, and UI changes. Use for unit, integration, e2e, schema, row count, reconciliation, idempotency, coverage, build, and QA reports."
---

# Test

Use the smallest test set that proves the acceptance criteria. Escalate to full suite when risk requires it.

## Scope Selection

- Narrow change: run affected tests.
- Config, shared helper, dependency, infrastructure, or high fan-out change: run full suite.
- Data pipeline change: run transformation tests plus schema/quality/reconciliation checks.
- Notebook change: restart and run top-to-bottom where practical.
- UI change: check console errors, key flows, and responsive/visual behavior.

## Diff-Aware Mapping

1. Identify changed files.
2. Map to co-located tests, mirrored tests, importers, or pipeline quality checks.
3. List unmapped changed files and proposed tests.
4. Escalate to full suite if mapping covers most tests or risk is broad.

## Data Test Checklist

- Schema assertion.
- Row count range.
- Key uniqueness.
- Required field completeness.
- Freshness window.
- Source-to-target reconciliation.
- Idempotency rerun.
- SCD history integrity when relevant.
- Boundary data: empty, single row, null-heavy, duplicates.

## Standards

- Do not suppress failures.
- Tests must be deterministic and isolated.
- Integration tests should use representative data, not mocks that hide source behavior.
- Report exact commands and results.

## Output

```markdown
Scope: <affected|full|explicit>
Commands:
- <command> -> <result>
Results: <passed/failed/skipped>
Coverage or quality gaps:
- ...
Blockers:
- ...
Open questions:
- ...
```
