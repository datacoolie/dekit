---
name: plan
description: "Create small, verifiable implementation plans for Standard or Complex work, migrations, contracts, or decisions with meaningful uncertainty or risk."
---

# Planning

Turn a selected direction into an executable, verifiable plan. Do not implement product code here.

## Route

- Plan Standard/Complex work or an explicit plan request; keep trivial/simple work direct.
- Use `scout` for local context, `research` for current external facts, and `brainstorm` while the direction is still unsettled.
- For diagnosis-only work, plan evidence collection and next checks without assuming a fix.
- If implementation is authorized, hand off after the plan is actionable; keep planning state separate from implementation.
- Move from discovery when the outcome, constraints, and selected direction are clear enough to make the scoped work actionable. Keep non-blocking unknowns with an owner and resolution check; gate dependent work on unresolved architecture, contract, security, or irreversible-behavior choices.
- Link the owning wiki spec, research, architecture, decision, or runbook. The plan is disposable execution state and must not be the only copy of durable knowledge.

## Contract

Follow the canonical lifecycle in [artifacts.md](../../instructions/artifacts.md). Include only what applies: outcome/non-goals, scope, checked context, constraints/assumptions, selected approach and consequential alternatives, work items with completion evidence, criterion-to-verification mapping, risks/recovery, current state, blockers, and next action.

Do not invent filenames, estimates, root causes, approvals, or results. For data work, read [data-engineering-constraints.md](../../instructions/data-engineering-constraints.md) and include only relevant correctness, quality, performance, backfill, and promotion gates.

## Operations

- Check `plans/` for active or overlapping work and record the relationship.
- Update routine progress in the current plan; use a numbered amendment for material scope, design, acceptance, dependency, or recovery changes.
- Validate hidden coupling, breaking changes, test gaps, and authorization before handoff.
- Close only when scoped criteria have evidence and durable outcomes are recorded in their owning artifacts. A completed plan may be retained, archived, or manually deleted; deletion never authorizes recreation or inferred progress. Plan status never authorizes deployment.
- Reuse accepted decisions. Reopen one only for new evidence, changed constraints, failed assumptions, or a user request, and record the trigger and affected scope.

Use [plan-template.md](../../../plans/templates/plan-template.md) when a template helps, and keep scenario sections conditional.

## Output

```markdown
Plan: plans/<id>/plan.md
Summary: <goal, scope, risk, verification>
Open questions:
- ...
```
