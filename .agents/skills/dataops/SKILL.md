---
name: dataops
description: "Design, implement, and review DataOps workflows for data platforms. Use for CI/CD for data pipelines, infrastructure as code, deployment automation, monitoring, alerting, rollback plans, cost controls, secrets management, and platform reliability."
---

# DataOps

## Overview

Build reliable, repeatable, observable data platform operations. Automate what humans forget.

## Core Checklist

Before marking DataOps work complete, verify:

- Infrastructure is declarative or scriptable and safe to re-run.
- Secrets are referenced through vaults, environment injection, or platform secret stores.
- CI/CD has build, test, deploy, and rollback gates appropriate to risk.
- Rollback or recovery path is explicit and avoids data loss.
- Monitoring covers job success/failure, freshness, SLA, cost, and resource utilization.
- Alerts are actionable: owner, threshold, impact, and first response are clear.
- Cost controls exist: scaling limits, idle shutdown, lifecycle policies, or budgets.
- Security baseline covers least privilege, network boundary, encryption, and audit logs.
- Runbooks or internal wiki pages are updated when behavior changes.

## Patterns

### CI/CD For Data

- Validate metadata, schemas, SQL, notebooks, and pipeline configs before deploy.
- Promote environments explicitly: dev -> staging -> prod.
- Require approval for production deploys and breaking data contract changes.
- Package artifacts reproducibly: wheels, jars, SQL bundles, notebooks, or deployment manifests.

### Infrastructure Provisioning

- Prefer IaC or checked-in deployment definitions over manual console changes.
- Keep environment parity: prod-like topology, scaled down where needed.
- Make provisioning idempotent; repeated runs must converge, not duplicate resources.
- Treat destructive changes as irreversible operations requiring explicit approval.

### Operations

- Define runtime, freshness, and cost baselines for recurring jobs.
- Capture structured logs with job id, run id, source, target, row counts, and quality results.
- Alert before SLA breach where possible.
- Make failed run recovery deterministic: replay window, checkpoint reset, or rollback.

### Cost And Capacity

- Size compute from observed data volume and SLA.
- Use autoscaling carefully; cap runaway scale.
- Compact small files and apply lifecycle policies for cold data.
- Track cost per pipeline, domain, or product where the platform supports it.
