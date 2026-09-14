---
title: "dekit technical wiki"
type: topic
status: active
summary: "Routing map for durable dekit knowledge and current system behavior."
tags: [dekit, routing]
updated: 2026-09-14
---

# dekit technical wiki

This is the durable internal knowledge map for dekit itself. Repository instructions define portable agent behavior; source files, configuration, tests, and checked runs remain authoritative for implementation. Pages here preserve intent, rationale, verified architecture, and operational knowledge that should survive a disposable plan. Projects consuming dekit keep their own optional `<root>/wiki/`; this directory is not required to use the toolkit.

## Start here

1. Read [`architecture/overview.md`](architecture/overview.md) for the current system map.
2. Read the relevant page under [`specs/`](specs/) for intent and requirements.
3. Read effective records under [`decisions/`](decisions/) before revisiting a consequential choice.
4. Open [`research/`](research/) only when evidence or prior exploration affects the next action.

## Areas

- [`specs/`](specs/) — requirements, constraints, proposed or accepted designs.
- [`research/`](research/) — reusable local scouting, external evidence, experiments, and comparisons.
- [`architecture/`](architecture/) — verified current boundaries, components, flows, and deployment.
- [`decisions/`](decisions/) — consequential choices and supersession history.
- `runbooks/` — create when an operational procedure needs an independent page.

Keep the layout shallow and add a page only when it owns useful knowledge. Do not duplicate plan checklists, chat transcripts, README content, or Git history.

## Authority and lifecycle

Proposed intent, accepted decisions, verified behavior, and execution progress have separate statuses. A completed `<root>/plans/<plan-id>` directory is disposable; no page in this wiki should require it to explain the project.
