---
name: sql-authoring
description: "Write and review complex SQL across dialects. Use for CTEs, windows, pivots, temporal joins, recursive queries, MERGE/upsert, SCD logic, dialect translation, query optimization, and SQL anti-pattern detection."
---

# SQL Authoring

Write SQL against an explicit dialect, contract, grain, and time/null model.

## Rules

- State engine/dialect before relying on syntax or optimizer behavior.
- Make join keys, expected cardinality, NULL semantics, time zones/boundaries, and aggregation grain explicit.
- Use CTEs, windows, correlated queries, or subqueries according to readability and engine plan—not a universal style rule.
- Use deterministic ordering for dedup; use MERGE/upsert only when keys, scope, and retry semantics make the write idempotent.
- `SELECT *` may be appropriate for raw/landing passthrough; qualify it for curated contracts and schema stability.

## Verification

Compile/dry-run where available and use representative empty, single-row, duplicate, null-heavy, late, and boundary-time data as relevant. Check key uniqueness/fan-out and critical metrics at the contract boundary; inspect the plan for expensive scans or missing pruning. Do not instrument every CTE for a narrow edit without a reason.
