---
name: sql-authoring
description: "Write and review complex SQL across dialects. Use for CTEs, windows, pivots, temporal joins, recursive queries, MERGE/upsert, SCD logic, dialect translation, query optimization, and SQL anti-pattern detection."
---

# SQL Authoring

Use this skill for SQL correctness, readability, and performance decisions.

## Rules

- State the target dialect before relying on syntax.
- Prefer clear CTE pipelines over deeply nested subqueries.
- Name each CTE by intent, not implementation detail.
- Use window functions for dedup, ranking, lag/lead, and running calculations.
- Make null behavior explicit in joins, filters, and metrics.
- Use MERGE/upsert for idempotent incremental writes when supported.
- Validate join cardinality before trusting row counts.

## Review Checklist

- Does every join have an intentional key and expected cardinality?
- Are filters applied at the right layer and before expensive joins where possible?
- Are implicit casts avoided?
- Are partition/index/filter columns used in predicates?
- Are aggregations at the intended grain?
- Are date/time zones and inclusive/exclusive ranges explicit?
- Are duplicates handled deterministically?

## Anti-Patterns

- `SELECT *` in production models.
- Correlated subqueries at scale when a join/window is clearer.
- `DISTINCT` used to hide join fan-out.
- Metrics with hidden filters or mixed grains.
- `NOT IN` with nullable subquery values.
- Non-deterministic dedup without ordering.

## Verification

Before reporting SQL done:

- Compile or dry-run the query where possible.
- Test with empty, single-row, duplicate, and null-heavy inputs.
- Compare row count and key uniqueness at each major CTE.
- Inspect explain plan for expensive scans or missing pruning.
- Reconcile critical metrics to source or prior layer.
