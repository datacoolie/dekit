---
name: security
description: "Run security review for code, data pipelines, infrastructure, notebooks, and configs. Use for STRIDE/OWASP checks, secrets, auth/authz, PII exposure, injection, supply chain, IAM, encryption, audit logging, and security remediation planning."
---

# Security

Use this skill to find and prioritize real security risk. Do not turn it into a generic code review.

## Scope

- Code paths handling identity, permissions, secrets, PII, money, compliance, external input, or production data.
- Config and infrastructure that define network, IAM, encryption, logging, or deployment boundaries.
- Data pipelines that move sensitive data across trust boundaries.

## Checklist

- Spoofing: identity checks, session handling, service principals, token validation.
- Tampering: input validation, SQL/command injection, unsafe deserialization, mutable artifacts.
- Repudiation: audit logs, run ids, user/action attribution.
- Information disclosure: secrets, PII, stack traces, over-broad data access.
- Denial of service: unbounded queries, file reads, retries, resource exhaustion.
- Elevation of privilege: missing authz, broad IAM, insecure defaults.
- Supply chain: unpinned deps, unsafe scripts, untrusted downloads.

## Data Security

- PII is tagged and masked where required.
- Dev/test data is synthetic, anonymized, or minimized.
- Secrets are injected from secret stores, never committed.
- Access is least privilege by table, column, storage path, and job identity.
- Encryption and audit logging are enabled where platform supports them.

## Remediation Rules

- Critical findings block release.
- Fix root causes, not only the reported sink.
- Add regression tests, policy checks, or secret scans for fixed classes.
- Re-run security checks after remediation.
- Document accepted risk explicitly with owner and expiry.

## Output

```markdown
Findings:
- [Critical|High|Medium|Low] file:line - issue, exploit path, impact, fix

Verification:
- <checks run and result>

Accepted risk:
- ...

Open questions:
- ...
```
