---
title: "ADR 001: Store durable knowledge outside plans"
type: decision
status: active
summary: "Keep project intent, rationale, and verified knowledge in a shallow wiki so completed plans can be deleted manually."
tags: [decision, continuity, plans, wiki]
sources:
  - ../specs/wiki-continuity.md
  - ../research/context-continuity.md
  - ../../AGENTS.md
updated: 2026-09-14
decision_status: accepted
implementation_status: verified
---

# ADR 001: Store durable knowledge outside plans

## Context

The workflow spans several sessions and roles. Plans are useful for execution but the user wants to delete completed plan directories manually at any time. The project also needs a clear boundary between requirements, external/local evidence, current architecture, rationale, and progress.

## Decision

Use a shallow wiki with `specs/`, `research/`, `architecture/`, `decisions/`, and optional `runbooks/` areas. Capture meaningful durable knowledge during assigned discovery and delivery work. Keep task progress in the active plan; completed plans are disposable. Source/config/tests remain authoritative for implementation and verification.

## Consequences

- A new session can resume from a small index, current architecture, relevant spec/decisions, and source checks without replaying chat or a deleted plan.
- Agents must distinguish proposed intent, accepted decisions, verified behavior, and execution progress.
- Wiki pages require links to evidence and occasional updates as knowledge changes, while standalone read-only requests remain non-mutating.
- Exact task ordering and raw tool output may disappear with a deleted plan; they are not copied into the wiki.

## Reopening

Revisit this decision only for relevant new evidence, a changed constraint, a failed assumption, or an explicit user request. A replacement decision must link this record, state the trigger and affected scope, and preserve this rationale.

## Verification status

The decision is accepted and implemented. Canonical rules, adapters, skills, templates, wiki helpers, and isolated plan-removal checks passed; the durable receipt and limitations are recorded in [`../specs/wiki-continuity.md`](../specs/wiki-continuity.md).
