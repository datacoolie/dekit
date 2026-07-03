---
name: research
description: "Research technical options with source-backed recommendations. Use for technology evaluation, architecture trade-offs, library/framework choices, best practices, scalability, security, maintainability, or when current external facts matter."
---

# Research

Use this skill to answer technical questions with evidence and a ranked recommendation.

Research is convergent and source-backed. It is not for open-ended ideation.

## Role Boundary

- Use `research` when the answer depends on current facts, external sources, standards, benchmarks, vendor behavior, or source-backed recommendations.
- Use `brainstorm` first when the user is still exploring ideas, framing the problem, or comparing unsourced solution directions.
- Use `plan` after a recommendation is selected and the implementation is Standard or Complex.
- If the question can be answered from local code or project memory, use `scout`, `wiki`, or the relevant implementation skill before external research.

## Scope

- Define the decision being made.
- State recency needs.
- Choose evaluation criteria before collecting sources.
- Bound the research depth; do not collect sources indefinitely.

## Source Rules

- Prefer official docs, standards, release notes, source repositories, and production case studies.
- Use tutorials/blogs only as supporting context.
- Cross-check important claims against independent sources when possible.
- Note publication dates and version applicability.
- Call out uncertainty and unverified claims.

## Analysis

Compare options on criteria relevant to the task:

- Correctness and fit.
- Operational complexity.
- Performance and scale.
- Security and compliance.
- Cost.
- Maturity and community health.
- Migration and lock-in risk.
- Team familiarity.

When giving suggestions or proposals, present 2-3 viable options unless there is only one safe or practical choice. Mark one option as recommended and explain why it is the best default for the user's context.

## Output

```markdown
Recommendation: <recommended option and reason>
Why:
- ...
Options considered:
| Option | Pros | Cons | Risk |
Evidence:
- <source/link/date>
Implementation notes:
- ...
Open questions:
- ...
```

Do not produce a long reading list without a decision.
