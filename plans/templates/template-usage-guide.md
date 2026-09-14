# Plan Template Guide

## Choose a Starting Point

Copy [`plan-template.md`](plan-template.md) for every Standard/Complex execution plan. Add only the relevant anchors from [`scenario-sections.md`](scenario-sections.md).

| Previous entry point | Use the core plus |
|---|---|
| `feature-implementation-template.md` | Data pipeline, migration, performance, security, or docs sections as applicable |
| `bug-fix-template.md` | Diagnosis/bug, incident, data repair, or security sections as applicable |
| `refactor-template.md` | Refactor, performance/cost, migration, or data pipeline sections as applicable |

The legacy paths remain selectors for compatibility. They are not independent templates.

## Adaptation Rules

- Remove irrelevant sections instead of filling them with `N/A`.
- Keep one Work Items table and one Execution State section.
- Put checked evidence and assumptions near the decision they affect.
- Mark unknowns and the check that resolves them; do not guess a root cause, filename, estimate, approval, or result.
- Add a scenario section when its concern changes correctness, recovery, rollout, or verification.
- Keep plan paths root-relative in prose as `<root>/plans/...`; resolve Markdown links relative to the file containing them.
- Use Mermaid only when a complex relationship becomes easier to understand; keep the one-sentence takeaway and validate syntax.

## Continuing Work

Read the current plan state, active amendment pointer, relevant source/diff, assumptions, and linked durable wiki artifacts before resuming. If the plan was manually deleted, continue only from the durable wiki and source evidence; do not infer the missing checklist, approvals, or next action.

- Update routine progress, evidence, blockers, and next action in the active plan.
- Create a numbered amendment or appendix only for material scope, design, acceptance, dependency, or recovery changes.
- Completed plans are disposable: retain them, archive them, or delete them manually. Their essential design, decision, architecture, and verification knowledge must already live in the owning durable artifacts. Use a linked follow-up plan for new work.

## Canonical Rules

- Plan contract and lifecycle: [`artifacts.md`](../../.agents/instructions/artifacts.md#plans)
- Triage and resume context: [`agent-operating-model.md`](../../.agents/instructions/agent-operating-model.md#task-triage)
- Data constraints and promotion gates: [`data-engineering-constraints.md`](../../.agents/instructions/data-engineering-constraints.md)
- Verification and evals: [`verification.md`](../../.agents/instructions/verification.md)
