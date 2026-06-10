---
name: debug
description: "Debug with root-cause analysis before fixes. Use for bugs, failing tests, CI failures, runtime errors, Spark/SQL performance, schema drift, data quality incidents, logs, metrics, and unexplained behavior."
---

# Debug

Root cause first. No speculative fixes.

## Process

1. Capture the exact symptom: command, error, logs, failing assertion, bad data sample.
2. Map affected scope: files, jobs, tables, configs, recent changes.
3. Form 2-3 plausible hypotheses.
4. Test each hypothesis with observable evidence.
5. Fix the confirmed root cause, not the symptom.
6. Re-run the original failing check.
7. Add prevention: regression test, validation, monitor, guardrail, or contract.

## Evidence Checklist

- Raw error output or failing data captured.
- Timeline connects trigger, symptom, and impact.
- Recent code/config/source data changes checked.
- Alternatives ruled out are named.
- Root cause has an evidence chain.
- Fix is verified by the original reproduction path.

## Data Pipeline Debugging

- Schema drift: compare actual vs expected schema at ingestion.
- Missing data: check source freshness, file manifest, watermark, partition filters.
- Duplicates: inspect replay behavior, merge keys, dedup ordering.
- Stale data: check cache/materialization refresh and orchestration.
- Spark OOM/skew: inspect collect/toPandas, partition sizes, join strategy, explain plan.
- SQL slowness: inspect plan, predicates, implicit casts, partition/index pruning.

## Red Flags

- "Probably", "seems fixed", or "tests pass" without original reproduction rerun.
- Fixing production data manually instead of replaying pipeline.
- Adding retries for deterministic data failures.
- Suppressing failing tests or quality gates.

## Output

```markdown
Root cause: <one sentence>
Evidence:
- ...
Fix:
- ...
Verification:
- <command/check/result>
Prevention:
- ...
Open questions:
- ...
```
