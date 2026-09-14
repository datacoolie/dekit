---
name: data-ingestion
description: "Design data ingestion into landing/bronze layers. Use for source onboarding, transfer pattern selection, full/incremental/CDC scope, change detection, landing zones, schema drift, idempotent file or batch processing, and ingestion quality gates."
---

# Data Ingestion

Choose and verify an ingestion contract; keep source-specific implementation in the project.

## Decide from the source/sink

- Identify source type and transfer mode (file, API, database, stream, connector, replication, push/drop).
- Define scope: full, append, merge, snapshot diff, or CDC. CDC is not a universal delete strategy; use it only when source capability and history needs justify it.
- Choose a change signal (watermark, sequence, source timestamp, log, manifest, or snapshot comparison) and late-arrival/delete behavior.
- Define landing/bronze preservation, metadata, quarantine, schema-drift handling, replay key, and sink idempotency. “Exactly once” is a stated source/sink contract, not an assumption.
- Add only the quality gates relevant to the contract: schema, volume/count, freshness, uniqueness, reconciliation, or completeness.

Prefer a connector when its retry, observability, and schema behavior are known; prefer independent file landing when extraction and processing need separate retries. Full refresh is reasonable for small/immutable sources or missing change signals.

## Verification

For implementation, rerun a representative window and prove dedup/idempotency; exercise late, duplicate, missing, delete, and schema-change cases. Confirm quarantine/fail-fast, audit metadata, monitoring, and source-to-target evidence. For design-only work, propose these checks rather than claiming they ran.
