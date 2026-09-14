---
name: data-quality
description: "Define and enforce data quality rules, contracts, assertions, reconciliation, quarantine, and quality gates. Use for completeness, uniqueness, validity, freshness, schema, referential integrity, SCD checks, or source-to-target validation."
---

# Data Quality

Turn the dataset contract into observable checks with an explicit response.

## Define

- Name the dataset, owner, grain, keys, required/optional fields, types, freshness window, expected volume, and business invariants.
- Select checks that match the contract: schema/evolution, completeness, uniqueness, validity, freshness, relationships, SCD/history, or reconciliation.
- For each gate, state scope, tolerance and exclusions (including delayed arrivals), severity, owner, and fail/quarantine/continue response.
- Reconcile equivalent source and target scopes; count equality is not meaningful when windows or filters differ.

Fail fast for revenue, compliance, regulatory, or irreversible outputs. Quarantine only when rejected records are isolated, observable, replayable, and do not silently disappear. Never hide bad data with casts/defaults.

## Verification

Run representative good, bad, empty, duplicate, null-heavy, delayed, and schema-change fixtures as applicable. Verify the gate outcome, persisted result/log, alert/owner path, and regression coverage for incident fixes.
