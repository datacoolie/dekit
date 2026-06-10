---
name: data-ingestion
description: "Design data ingestion into landing/bronze layers. Use for source onboarding, transfer pattern selection, full/incremental/CDC scope, change detection, landing zones, schema drift, idempotent file or batch processing, and ingestion quality gates."
---

# Data Ingestion

Use this skill to choose and verify an ingestion design. Keep source-specific code in the project, not in the skill.

## Required Decisions

- Source type: database, API, file drop, stream, SaaS connector, data share.
- Transfer pattern: file transfer, direct query, platform connector, streaming, replication, push/drop.
- Scope: full refresh, incremental append, incremental merge, CDC with deletes.
- Change detection: watermark, source modified timestamp, sequence, CDC log, file manifest, snapshot diff.
- Landing contract: raw preservation, bronze schema, metadata columns, quarantine path.
- Idempotency: replay key, processed-file tracking, MERGE/upsert, partition overwrite, checkpoint.
- Schema evolution: additive handling, breaking-change gate, drift alert, consumer impact.
- Quality gates: row count, schema, freshness, uniqueness/dedup, reconciliation.

## Selection Rules

- Prefer platform-native connectors only when they expose observability, retry behavior, and schema controls.
- Prefer file landing when source extraction and downstream processing need independent retries.
- Use incremental merge when source records can change after first arrival.
- Use CDC when deletes or update history matter.
- Use full refresh only for small data, immutable snapshots, or sources without reliable change signals.
- For streams, define checkpoint, watermark, late-data policy, replay window, and exactly-once sink behavior.

## Anti-Patterns

- Inferring production schemas.
- Treating ingestion success as row movement only; quality gates still required.
- Reprocessing files without a manifest or idempotent sink.
- Overwriting whole tables when partition or key-level merge is enough.
- Allowing source schema breaks to silently flow into silver/gold.
- Landing only transformed data with no raw/audit trail.

## Verification

Before marking ingestion design or code done:

- Re-run same batch/window and prove no duplicates.
- Compare source and target counts for the chosen scope.
- Validate schema at source boundary and before write.
- Simulate late, duplicate, and missing source records.
- Confirm quarantine or fail-fast behavior for bad records.
- Confirm monitoring includes freshness, volume, failures, and drift.
