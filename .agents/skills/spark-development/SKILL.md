---
name: spark-development
description: "Write and optimize PySpark and Spark SQL. Use for Spark DataFrames, joins, windows, UDF decisions, partitioning, caching, AQE, explain plans, OOM, shuffle, skew, Delta writes, and Spark pipeline performance."
---

# Spark Development

Use this skill for Spark implementation choices and performance risk checks.

## Rules

- Define schemas explicitly at production read boundaries.
- Prefer built-in functions over pandas UDFs; pandas UDFs over Python UDFs.
- Keep transformations set-based; avoid driver-side loops.
- Use idempotent writes: MERGE/upsert, replaceWhere, or partition overwrite.
- Partition by query/lifecycle pattern, not convenience.
- Cache only DataFrames reused across multiple actions; unpersist after use.
- Inspect plans before optimizing: `explain("formatted")` or platform equivalent.
- Tune from observed data size, skew, shuffle, and SLA, not guesses.

## Join Checklist

- Expected cardinality is known before joining.
- Join keys have compatible types and null behavior.
- Broadcast only genuinely small sides.
- No cartesian product unless deliberately bounded.
- For skew, validate key distribution before salting or repartitioning.

## Red Flags

- `collect()`, `toPandas()`, or `repartition(1)` on large data.
- `inferSchema=True` in production.
- Python UDF for simple expressions.
- Repeated `.count()` actions just for logging.
- Writes without atomicity or retry/idempotency plan.
- Partition columns missing from common filters.

## Verification

Before reporting Spark work complete:

- Run affected transformation or representative local/unit test.
- Validate output schema and row counts.
- Confirm rerun behavior is idempotent.
- Inspect explain plan for unexpected cartesian joins, excessive exchanges, or missing pruning.
- Reconcile critical measures against source or prior layer.
