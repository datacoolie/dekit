---
name: debug
description: "Debug with root-cause analysis before fixes. Use for bugs, failing tests, CI failures, runtime errors, Spark/SQL performance, schema drift, data quality incidents, logs, metrics, and unexplained behavior."
---

# Debug

Establish what happened and why before changing code.

## Work

- Capture the exact command, error/log, failing assertion, bad-data sample, timing, and affected scope.
- Map recent code/config/data changes, callers, jobs, tables, and environment assumptions.
- Form only the hypotheses useful to distinguish causes; test them with observable checks.
- Conclude a root cause only when the evidence chain supports it. If reproduction or evidence is incomplete, report uncertainty and the next check.
- Fix only when requested/authorized, then rerun the original reproduction and add a prevention check.

Containment or manual data repair is a separate, explicitly authorized action; do not hide an unresolved cause behind retries or suppression.

For data incidents, inspect schema/contract boundaries, watermarks/replay, dedup keys/order, partition filters, join cardinality/skew, query plans, and cache/materialization only when relevant.

## Output

```markdown
Symptom/scope: ...
Root cause: <confirmed cause or unresolved>
Evidence:
- ...
Fix/containment: <only authorized action>
Verification: <original check and result, or next check>
Prevention: ...
Open questions:
- ...
```
