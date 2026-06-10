---
name: data-modeling
description: "Design warehouse and semantic data models. Use for grain definition, fact/dimension design, star schema, Kimball, Data Vault, SCD, bridge tables, surrogate keys, semantic metrics, and model review."
---

# Data Modeling

Use this skill when data shape, grain, history, or business meaning is the main design problem.

## Required Decisions

- Grain: one row represents exactly what.
- Model style: star schema, wide mart, Data Vault, hybrid, or operational table.
- Entity keys: natural key, surrogate key, hash key, composite key.
- Fact type: transaction, periodic snapshot, accumulating snapshot, factless.
- Dimension behavior: Type 0/1/2/3/6, role-playing, conformed, junk, mini-dimension.
- Relationship handling: one-to-many, many-to-many, bridge, hierarchy.
- Metric contract: numerator, denominator, filters, time grain, late-arriving behavior.

## Design Rules

- Define grain before columns.
- Facts contain measures and foreign keys; dimensions contain descriptive context.
- Use surrogate keys when business keys can change or SCD history matters.
- Use conformed dimensions for cross-domain analysis.
- Use bridges only when many-to-many cannot be simplified without losing meaning.
- Keep business logic centralized; duplicate metric logic is a defect.

## Anti-Patterns

- Table with no stated grain.
- Fact table that mixes grains.
- Surrogate key equals mutable business key.
- SCD2 without valid-from, valid-to, current flag, and change detection.
- Snowflaking by habit instead of measured need.
- Metrics defined only in dashboard code.

## Verification

Before finalizing a model:

- State grain for every table.
- Prove keys are unique at the declared grain.
- Check referential integrity and unknown-member behavior.
- Validate SCD history: no gaps, overlaps, or duplicate current rows.
- Reconcile core measures to source or prior layer.
- Document metric definitions and lineage.
