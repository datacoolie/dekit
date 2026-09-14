---
name: notebook-development
description: "Write and organize production-grade notebooks across Fabric, Databricks, and Jupyter. Use for notebook cell structure, parameters, idempotency, platform utilities, validation cells, notebook-to-production conversion, and notebook hygiene."
---

# Notebook Development

Keep notebooks reproducible and fit for their actual role.

## Route

- Exploratory notebook: make inputs, assumptions, filters, and outputs visible; do not add scheduler/write ceremony that is not needed.
- Scheduled/production notebook: use injected parameters, explicit schemas, deterministic transforms, validation before writes, idempotent outputs, and scheduler/session parity.
- Keep platform utilities at I/O/orchestration boundaries and extract shared business logic into modules when reuse or testing warrants it.
- Never commit credentials, personal paths, hidden kernel state, or accidental display-only filters.

Do not run every costly or destructive cell merely to satisfy a blanket run-all rule; run the relevant path and state what remains unverified.

## Verification

For production scope, restart the kernel/session, inject a representative parameter set, run the relevant path in order, inspect validation/output, and rerun to prove idempotency. For exploration, verify the stated analysis path and assumptions instead.
