---
title: "dekit architecture overview"
type: architecture
status: active
summary: "Current repository layers and authority boundaries for portable AI-runner instructions."
tags: [architecture, dekit]
sources:
  - ../../AGENTS.md
  - ../../README.md
  - ../../.agents/instructions/agent-operating-model.md
  - ../../.agents/instructions/artifacts.md
  - ../../.agents/skills/
  - ../../.codex/agents/
updated: 2026-09-14
implementation_status: verified
---

# dekit architecture overview

## Verified repository layers

- `AGENTS.md` is the repository entrypoint and resolves `<root>`.
- `.agents/instructions/` holds portable, canonical operating, engineering, data, verification, wiki, and artifact rules.
- `.agents/skills/` holds focused task behavior such as scout, brainstorm, research, plan, test, docs, and wiki.
- `.codex/agents/` contains optional role adapters that select a model, sandbox, and delegated boundary; adapters must not redefine canonical rules.
- `plans/` contains active execution plans and reports. It is disposable execution state, not the long-term knowledge store.
- `wiki/` contains source-linked internal knowledge. This page and the linked pages are being aligned with the continuity specification.

## Current authority flow

User intent and repository rules constrain work. Scout establishes local behavior, research establishes external evidence, and brainstorm compares directions. A selected direction becomes a plan for implementation. Source/config/tests and checked runs establish actual behavior; wiki pages preserve intent, rationale, current architecture, and operational guidance.

## Verified continuity behavior

The durable-knowledge policy is implemented under [`specs/wiki-continuity.md`](../specs/wiki-continuity.md). Assigned discovery/delivery workflows update the owning wiki page at meaningful knowledge changes; standalone read-only work remains non-mutating. Completed plans are disposable, and new sessions use the index, current architecture, relevant spec/decisions, active plan when present, and scout evidence for drift.

Source/config/tests remain the authority for implementation and verification. This page preserves the system map and boundaries; it does not replace those artifacts.

## Reading boundary

New sessions should start with `AGENTS.md`, `README.md`, applicable instructions, this overview and the wiki index, then load only the relevant spec/decisions, active plan, and source/config/tests needed for the next action.
