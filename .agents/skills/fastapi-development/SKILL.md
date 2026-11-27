---
name: fastapi-development
description: "Build, change, or review FastAPI applications. Use for HTTP routing and contracts, dependencies and lifespan, persistence, streaming or compute jobs, API authorization, testing, and serving."
---

# FastAPI Development

Check the deployed ASGI import path, client contract, and installed framework versions before changing the application. If a framework API or lifecycle behavior is uncertain, use the documentation or official library skill for that version.

Read only the references relevant to the change:

- [Application](references/application.md) for the standalone app default, router composition, settings, lifespan, and dependency tests.
- [HTTP contracts](references/http-contracts.md) for the `/api/v1` default, compatibility, schemas, errors, and contract tests.
- [Database](references/database.md) for SQLAlchemy sessions, transactions, dialects, and migrations.
- [Execution](references/execution.md) for blocking work, streaming, jobs, and CPU/GPU ownership.
- [Security](references/security.md) for HTTP trust boundaries and resource authorization.
- [Deployment](references/deployment.md) for serving processes, health probes, observability, and rollout.
