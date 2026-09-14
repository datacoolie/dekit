---
name: data-modeling
description: "Design warehouse and semantic data models. Use for grain definition, fact/dimension design, star schema, Kimball, Data Vault, SCD, bridge tables, surrogate keys, semantic metrics, and model review."
---

# Data Modeling

Make grain, history, relationships, and metric meaning explicit.

## Decide

- State what one row represents before choosing columns or model style.
- Select dimensional, Data Vault, wide-mart, operational, or hybrid design from query/workload and history needs; do not force a star schema.
- Choose natural, surrogate, hash, or composite keys and unknown-member behavior from mutability and integration needs.
- For facts, distinguish transaction, periodic/accumulating snapshot, and factless facts. Add measures only when the grain has them.
- Define dimension history (0/1/2/3/6), relationship/bridge rules, and metric numerator, denominator, filters, time grain, and late-arrival behavior only where applicable.

Centralize business logic and lineage. Use bridges when many-to-many meaning cannot be preserved more simply.

## Verification

Validate declared grain, key uniqueness, intended referential integrity, and metric reconciliation. For SCD/history designs, check valid intervals, current-row rules, change detection, and continuity when the business contract requires it; do not impose SCD checks on non-history models.
