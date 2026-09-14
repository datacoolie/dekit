---
name: research
description: "Research technical options with source-backed recommendations. Use for technology evaluation, architecture trade-offs, library/framework choices, best practices, scalability, security, maintainability, or when current external facts matter."
---

# Research

Answer external-fact and technology questions with bounded, source-backed evidence.

## Route

- Factual lookup or mechanism explanation: answer the question; alternatives and a verdict are optional.
- Comparative choice: define the decision and criteria before collecting sources, then compare viable options.
- Use `scout` for local implementation facts and `wiki` for existing project knowledge before external research when they can answer part of the question.
- A supplied report may be synthesized; only research its explicit gaps.

## Evidence

- Prefer official documentation, standards, release notes, source repositories, and dated case studies.
- Check version, publication date, provider scope, and recency needs.
- Cross-check material or high-stakes claims; label inference, disagreement, and unverified behavior.
- Bound the search and stop when the decision criteria are covered.
- Distinguish external evidence, local observations, inference, and recommendation. Do not treat an external default as the project's accepted decision.

## Recommendation

Use correctness/fit, operations, performance, security, cost, maturity, lock-in, and migration risk only when relevant. Present 2–3 options only when a choice exists; mark a provisional recommendation when evidence is incomplete. Do not present brainstorming guesses as facts.

When an explicitly assigned discovery/delivery workflow needs durable research, persist the concise conclusion and source links in the owning `wiki/research/` page or hand it to the coordinator for consolidation. Standalone research remains non-mutating unless saving is requested.

## Output

```markdown
Question/decision: <scope>
Recommendation: <answer or option and confidence>
Why: <evidence tied to the request>
Options considered: <only for a decision>
Evidence:
- <source, version/date, claim>
Implementation notes:
- ...
Open questions:
- ...
```
