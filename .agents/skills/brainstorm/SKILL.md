---
name: brainstorm
description: "Explore ambiguous ideas and solution directions before evidence-backed research or implementation planning. Use for ideation, framing, assumption checks, option generation, product or architecture trade-offs, and deciding whether research or a plan is needed."
license: MIT
---

# Brainstorm

Use this skill to shape a fuzzy problem before committing to research, planning, or implementation.

Brainstorming is for option discovery and judgment. It is not source-backed research, implementation planning, or coding.

## Role Boundary

- Use `brainstorm` when the problem is unclear, the user wants ideas, or the solution space needs exploration.
- Use `research` when the answer depends on current facts, external sources, standards, benchmarks, vendor behavior, or source-backed recommendations.
- Use `plan` after a direction is selected and the implementation is Standard or Complex.
- Use `scout`, `debug`, or `code-review` when the answer depends primarily on existing code behavior.
- If brainstorming reveals factual uncertainty, hand off to `research` instead of presenting guesses as evidence.

## Workflow

1. Frame the problem, desired outcome, constraints, and non-goals.
2. Ask only high-value clarifying questions. If reasonable assumptions are safe, state them and continue.
3. Surface hidden constraints, failure modes, and over-engineering risks.
4. Present 2-3 viable options unless only one practical option exists.
5. Recommend a default direction and explain why it fits the user's context.
6. Identify when the next step should be `research`, `plan`, implementation, or no action.

## Evaluation Lens

Compare options by:

- User value and problem fit.
- Simplicity and reversibility.
- Implementation effort.
- Operational burden.
- Data, security, and compliance risk.
- Long-term maintainability.
- Dependencies and lock-in.

## Rules

- Be direct about weak ideas, hidden costs, and likely failure modes.
- Mark assumptions clearly.
- Do not claim external facts without evidence; route to `research` when evidence matters.
- Do not write code, scaffold files, or change the repository while brainstorming.
- Do not create a long report unless the user asks for one.

## Output

```markdown
Problem: <one sentence>
Assumptions:
- ...
Options:
| Option | Best when | Trade-offs | Risk |
|---|---|---|---|
Recommendation: <recommended option and why>
Next step: <research | plan | implement | no action>
Open questions:
- ...
```
