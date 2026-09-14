---
name: security
description: "Run security review for code, data pipelines, infrastructure, notebooks, and configs. Use for STRIDE/OWASP checks, secrets, auth/authz, PII exposure, injection, supply chain, IAM, encryption, audit logging, and security remediation planning."
---

# Security

Find and prioritize plausible security risk in the requested scope. This is a security review, not an automatic release or generic style pass.

## Scope

Start with assets, actors, trust boundaries, data sensitivity, exposure, and the requested operation. Inspect identity/token validation, authorization/IAM, input/deserialization/SQL/command boundaries, secrets/PII/logging, network/encryption/audit controls, resource exhaustion/retry limits, and dependency/script supply chain only where reachable.

For data systems, check synthetic/minimized test data, least-privilege table/column/path/job identity, and platform-supported encryption/audit controls. An unpinned dependency is a review signal; call it a vulnerability only with an exploit or policy context.

## Boundary and remediation

- Default to review-only: do not patch, rotate secrets, deploy, or accept risk unless separately requested and authorized.
- A critical reachable exposure or data-loss path is a release blocker to report, not permission to release or rollback.
- If remediation is requested, fix the root cause, add a threat-specific regression/policy/scan, and rerun it.
- Record accepted risk only when an authorized owner, rationale, and expiry are supplied; never invent approval.

## Output

```markdown
Findings:
- [severity] file:line — asset/trust boundary, exploit path, impact, evidence, smallest fix

Verification:
- <checks and results>
Accepted risk:
- <owner/expiry or none supplied>
Open questions:
- ...
```
