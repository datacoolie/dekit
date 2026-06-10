---
name: notebook-development
description: "Write and organize production-grade notebooks across Fabric, Databricks, and Jupyter. Use for notebook cell structure, parameters, idempotency, platform utilities, validation cells, notebook-to-production conversion, and notebook hygiene."
---

# Notebook Development

Use this skill when notebooks are the execution or exploration surface.

## Structure

- Title/purpose cell: what this notebook does and expected inputs/outputs.
- Setup cell: imports, session config, helpers.
- Parameters cell: environment, date/window, source/target names.
- Load cells: read inputs with explicit schema/contract.
- Transform cells: deterministic logic with no hidden UI state.
- Validate cells: row counts, schema, quality checks, reconciliation.
- Write cells: idempotent output behavior.

## Rules

- Notebook must run top-to-bottom after kernel restart.
- Parameters must be injected, not edited inline for each run.
- No credentials, secrets, or personal paths in cells.
- Avoid global mutable state across cells.
- Keep display/debug cells separate from production write path.
- Extract reusable logic into modules when notebooks become production dependencies.

## Platform Notes

- Fabric/Databricks utilities are allowed at orchestration/I/O boundaries only.
- Keep core transform logic portable where practical.
- Use widgets/parameters for scheduled jobs.
- Persist only intentional outputs; temporary views/tables need lifecycle cleanup.

## Anti-Patterns

- Out-of-order cell dependency.
- Manual rerun instructions as operational process.
- Hidden filters in exploratory cells reused for production.
- Writing outputs before validation.
- Notebook-only business logic used by multiple pipelines.

## Verification

Before finishing notebook work:

- Restart kernel/session and run all cells in order.
- Verify parameters work for at least one representative run.
- Confirm output idempotency.
- Run validation cells and inspect failures.
- Confirm scheduled/orchestrated execution path matches interactive path.
