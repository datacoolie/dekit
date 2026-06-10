---
name: plan
description: "Create implementation plans, architecture decisions, and phased roadmaps. Use for Standard or Complex changes, new pipelines, schema changes, migrations, multi-file features, technology choices, or when acceptance criteria and verification strategy are unclear."
---

# Planning

Use this skill to turn ambiguous work into a small, verifiable plan. Do not implement code in this skill.

## First Checks

- Read only relevant wiki pages, plans, and nearby code.
- Scan `plans/` for active or overlapping work.
- If overlap exists, record dependency direction: blocks, blockedBy, or no relationship.
- Ask only when a decision changes architecture, contract, scope, or risk.

## Plan Must Include

- Goal and non-goals.
- Scope: files, systems, data products, consumers.
- Current state and constraints.
- Proposed design with alternatives rejected.
- Phases with observable completion criteria.
- Verification strategy: tests, data checks, review gates.
- Risks, rollback, and migration path.
- Open questions.

## Data Pipeline Planning

Every pipeline plan must address:

- Source-to-target mapping.
- Load pattern: full, append, merge, CDC.
- Change detection and replay window.
- Partitioning and file format.
- Idempotency guarantee.
- Schema evolution behavior.
- Quality gates at layer boundaries.
- Runtime/freshness/cost target.
- Backfill and rollback path.

## Quality Bar

- Prefer the smallest plan that removes implementation ambiguity.
- Completion criteria must be observable, not opinion-based.
- Avoid speculative phases and future-proofing.
- Do not put large tutorials or copied references in plans; link to source material.
- If two approaches are close, choose the simpler one with easier verification.

## Plan Operations

- Create a plan when work is Standard or Complex.
- Validate a plan by challenging assumptions, acceptance criteria, gates, and verification.
- Red-team a plan by identifying failure modes, hidden coupling, breaking changes, and test gaps.
- Archive or close a plan only after summarizing outcome, evidence, and unresolved follow-up.

## Output

Return the plan path and a short summary:

```markdown
Plan: plans/<id>/plan.md
Summary: <goal, scope, risk, verification>
Open questions:
- ...
```
