---
name: spark-development
description: "Write and optimize PySpark and Spark SQL. Use for Spark DataFrames, joins, windows, UDF decisions, partitioning, caching, AQE, explain plans, OOM, shuffle, skew, Delta writes, and Spark pipeline performance."
---

# Spark Development

Make Spark choices from workload evidence, correctness contracts, and retry behavior.

## Rules

- Use explicit schemas at production boundaries and set-based transformations; avoid driver-side collection/loops unless bounded and intentional.
- Prefer built-ins over pandas/Python UDFs when equivalent, but validate data type, serialization, and workload trade-offs.
- Choose partitioning, caching, AQE, broadcast, and salting from observed size, reuse, skew, filters, and SLA; unpersist caches whose lifetime is done.
- Before a join, check key types/nulls/cardinality; broadcast only a genuinely small side and never allow an unbounded cartesian product.
- For MERGE/overwrite/repartition writes, validate keys, affected scope, nondeterministic expressions, atomicity, and retries. The operation name alone does not prove idempotency.

## Verification

Run the affected transformation or representative local test, inspect schema/row counts and an `explain("formatted")` plan, and check skew/shuffle/pruning. Rerun a write where safe and reconcile critical measures. Treat `collect()`, `toPandas()`, `repartition(1)`, inferred production schemas, and repeated logging actions as workload-dependent risk signals, not automatic defects.
