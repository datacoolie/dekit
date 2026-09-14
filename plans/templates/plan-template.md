---
title: "[Plan title]"
description: "Outcome this plan will make verifiable."
status: draft
created: YYYY-MM-DD
---

# [Plan title]

Use this core with only the scenario sections that apply. Follow the canonical plan contract in [`artifacts.md`](../../.agents/instructions/artifacts.md#plans).

This plan is disposable execution state. Link the owning wiki spec, research, architecture, decision, or runbook for knowledge that must survive manual plan deletion; do not make this file their only copy.

## Outcome

What will be true when this work is complete?

### Non-goals

- What is explicitly outside this plan?

## Scope

| Area | In scope | Out of scope or unchanged |
|---|---|---|
| Files / systems | [paths or systems] | [boundaries] |
| Data / consumers | [products, contracts, consumers] | [unaffected areas] |

## Context and Decisions

### Checked evidence

- [path, symbol, query, test, report, or external source]

### Constraints and assumptions

- `[A1]` [constraint or temporary assumption]

### Open questions

| ID | Question | Blocks | Resolution check | Status |
|---|---|---|---|---|
| Q1 | [question] | [task or none] | [observation needed] | open |

### Durable context links

- Spec / requirements: [optional wiki path]
- Research / scout evidence: [optional wiki path]
- Architecture / decisions / runbook: [optional wiki paths]

## Approach

Selected approach: [short description]

Rationale: [why this fits the scope, constraints, and recovery needs]

Consequential alternatives:

| Option | Why not selected |
|---|---|
| [option] | [evidence or trade-off] |

## Work Items

| ID | Task | Depends on | Completion evidence | Status |
|---|---|---|---|---|
| T1 | [action and affected path] | — | [observable result] | pending |

## Acceptance and Verification

| ID | Acceptance criterion | Verification check | Evidence / result |
|---|---|---|---|
| AC1 | [observable outcome] | [command, test, review, or data check] | [link or result] |

Add only relevant [scenario sections](scenario-sections.md).

## Risks and Recovery

| Risk | Trigger / impact | Mitigation | Recovery type and prerequisite |
|---|---|---|---|
| [risk] | [condition] | [prevention] | code / schema / data / operations: [bounded action and prerequisite] |

## Execution State

- Status: `draft`
- Completed: [none or task IDs with evidence]
- Evidence: [links or commands]
- Blockers: [none or Q/task IDs and unblock condition]
- Current amendment: [none or link to the effective amendment]
- Next action: [one actionable task]

## Notes

- Optional Mermaid: use only when a complex relationship is easier to understand visually; explain the intended takeaway in one sentence and validate syntax.
- Add rollout, security, performance, data quality, approval, or documentation detail only when the selected scenario requires it.
- Keep this plan focused on decisions and evidence; link to source material instead of copying it.
