---
name: brainstorm
description: "Frame ambiguous product, architecture, or workflow choices before research or implementation; use for assumptions, options, and trade-offs, not settled factual lookup or execution."
license: MIT
---

# Brainstorm

Shape an uncertain problem before committing to research, a plan, or code.

## Route

- Use for framing, assumptions, option discovery, and consequential trade-offs.
- Reuse supplied codebase or research context; do not redo work without a gap.
- Hand local behavior questions to `scout` and external factual uncertainty to `research`; combine their findings with the user's goals and constraints.
- Once a direction is accepted, continue to `plan` or implementation instead of reopening the choice.

## Work

- State the outcome, constraints, non-goals, and assumptions.
- Surface failure modes, reversibility, and over-engineering risk.
- For uncertain component boundaries, use the relevant [design-contract questions](../../instructions/artifacts.md#design-contracts-and-work-item-readiness) to expose ownership and responsibility choices.
- Present options or a comparison only when the user must choose; do not force a fixed count.
- Recommend a direction when evidence is sufficient; otherwise name the missing evidence and next check.
- Reopen an accepted direction only for new evidence, changed constraints, a failed assumption, or a user request.

Default output is analysis only: do not edit product code, scaffold code, or present unsourced external facts as settled.

## Output

```markdown
Problem: <one sentence>
Assumptions:
- ...
Options: <only when a choice exists>
Recommendation: <direction, evidence gap, or no action>
Next step: <research | scout | plan | implement | no action>
Open questions:
- ...
```
