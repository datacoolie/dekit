---
name: dataops
description: "Design, implement, and review DataOps workflows for data platforms. Use for CI/CD for data pipelines, infrastructure as code, deployment automation, monitoring, alerting, rollback plans, cost controls, secrets management, and platform reliability."
---

# DataOps

Make deployment and recurring operations repeatable, observable, and recoverable.

## Route by mode

- Deploy/CI: validate the affected metadata, schema, SQL, notebook, or config; package artifacts reproducibly; promote environments and approvals according to risk.
- Provision: use declarative, idempotent definitions with environment parity and explicit destructive-change approval.
- Operate: capture run/source/target/volume/quality context; alert on actionable impact, owner, threshold, and first response.
- Cost/capacity: use observed volume/SLA to set bounds, autoscaling limits, lifecycle/compaction, and cost attribution where supported.

Keep secrets in approved stores/injection, least privilege, network/encryption/audit controls, and a rollback/recovery path. A checkpoint reset, replay, or rollback must be justified by source/sink state and evidence, not a generic recipe.

Wiki updates remain user-directed unless the canonical [wiki policy](../../instructions/wiki.md) threshold is met; a behavior change alone does not mandate a page.

## Verification

Rerun the relevant deployment/provision/operation in a safe environment, exercise failure and recovery paths, and verify logs, alerts, freshness/SLA, quality, resource, and cost signals. Report unavailable services or approvals as gaps.
