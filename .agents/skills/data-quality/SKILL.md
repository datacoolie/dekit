---
name: data-quality
description: "Define and enforce data quality rules, contracts, assertions, reconciliation, quarantine, and quality gates. Use for completeness, uniqueness, validity, freshness, schema, referential integrity, SCD checks, or source-to-target validation."
---

# Data Quality

Use this skill to define quality rules that are executable, observable, and tied to data contracts.

## Quality Dimensions

- Schema: required columns, types, nullability, allowed evolution.
- Completeness: required fields populated; expected entities present.
- Uniqueness: primary/natural keys have no unexpected duplicates.
- Validity: values are in accepted ranges, domains, formats, and enums.
- Freshness: latest data falls within SLA/window.
- Consistency: relationships and business rules hold across tables.
- Reconciliation: source and target counts, sums, hashes, or balances agree.

## Gate Policy

- Fail fast for revenue, compliance, regulatory, and irreversible downstream outputs.
- Quarantine and continue only when bad records are isolated, monitored, and replayable.
- Thresholds must be explicit: tolerance, severity, owner, and response.
- Quality results must be logged even when they pass.
- Every quality failure needs a reproducible query or assertion.

## Contract Checklist

- Dataset/table name and owner.
- Grain and primary/natural keys.
- Required and optional columns with types.
- Freshness SLA and expected volume range.
- Accepted values and business invariants.
- Breaking-change rules.
- Quality checks and failure behavior.

## Anti-Patterns

- Tests that only check "query ran successfully".
- Silent casts, dropped bad records, or hidden default values.
- Quality checks only in gold; validate at layer boundaries.
- Tolerances without rationale.
- Mocks that hide source integration issues.

## Verification

Before marking quality work done:

- Run checks against representative good and bad data.
- Prove failures block or quarantine as designed.
- Reconcile source-to-target for critical measures.
- Verify quality results are observable in logs/tables.
- Add regression coverage for the defect class if fixing an incident.
