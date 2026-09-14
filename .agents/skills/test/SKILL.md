---
name: test
description: "Run and design verification for code, data pipelines, SQL, Spark, notebooks, and UI changes. Use for unit, integration, e2e, schema, row count, reconciliation, idempotency, coverage, build, and QA reports."
---

# Test

Select and report the smallest checks that prove the requested acceptance criteria. Do not fix product code under the guise of testing.

## Scope

- Map changed files to affected behavior, consumers, co-located tests, and blast radius.
- Run focused tests for narrow risk; escalate to a broader suite only for shared/high-fan-out/dependency/infrastructure or explicitly broad changes.
- For data work, add only applicable schema, grain/key, freshness, quality, reconciliation, idempotency, and boundary checks.
- Restart/run notebooks or exercise UI flows only when those paths are in scope; avoid costly/destructive blanket run-all actions.
- If the environment, credentials, service, or dataset is unavailable, report the gap and what remains unverified.
- When a plan may be deleted, verify the important outcome from source/tests/runtime evidence and record a compact receipt in the assigned durable wiki page when requested. Do not treat a plan status or an expiring report as proof.
- For a fresh-session or workflow-rule check, distinguish static walkthroughs and helper regressions from measured agent behavior; do not claim quality, token, or cost improvement without a paired evaluation.

Tests must be deterministic and isolated. Use representative fixtures for integration behavior; a mock is acceptable only when it does not replace the behavior under test.

## Output

```markdown
Scope: <affected | broad | explicit>
Commands:
- <command> -> <result>
Results: <passed/failed/skipped>
Coverage or environment gaps:
- ...
Blockers:
- ...
Open questions:
- ...
```
