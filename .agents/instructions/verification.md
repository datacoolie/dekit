# Verification

## Philosophy

Do not trust status claims. Trust checked artifacts.

Good verification is:

- Observable: command output, test result, diff, data count, screenshot, log.
- Repeatable: another runner or engineer can rerun it.
- Task-specific: validates the acceptance criteria, not only generic formatting.

## Required Checks

Choose the smallest set that proves the change:

| Change type | Minimum verification |
|---|---|
| Docs only | Link/path check and content review against source facts |
| Code only | Targeted tests or direct execution path |
| Pipeline | Unit test + schema check + row/reconciliation check where possible |
| SQL | Compile/parse check + representative result validation |
| Spark | Local/unit run where possible + partition/shuffle risk review |
| Refactor | Existing tests + behavior equivalence check |
| Security | Secret scan for touched files + threat-specific test |

## Durable Context Checks

When a task spans sessions or updates project memory, verify the smallest relevant slice:

- A completed plan can be removed in an isolated fixture without removing essential intent, decision, current-behavior references, or verification evidence from their owning artifacts. Never delete the user's real plan as a test.
- A discovery/delivery workflow updates durable wiki knowledge when a meaningful fact, rationale, decision, assumption, or verified behavior changes; standalone read-only work leaves files unchanged.
- Proposed intent, accepted decisions, verified behavior, and execution progress remain distinguishable. A source/spec discrepancy is reported, not silently normalized.
- Resume checks read the root entrypoint, wiki routing/current architecture, relevant spec and decisions, then an active plan if present and scout evidence for drift. Missing plans or multiple active work items must not produce invented progress or newest-file guessing.

Treat these as task-specific acceptance checks, not a reason to create a mandatory memory file or run a broad wiki audit for every change.

## Evals

When improving runtime behavior, prompts, adapters, or instructions:

1. Define the desired measurable behavior.
2. Establish baseline output.
3. Change one thing.
4. Re-run the same eval.
5. Keep the change only if results improve or context cost drops without regression.

Do not keep instructions because they feel useful.

## Review

Review for:

- Correctness bugs.
- Broken contracts.
- Missing verification.
- Security leaks.
- Data quality gaps.
- Excess context, duplication, or procedural clutter.

Findings must cite files or artifacts. Summaries come after findings.
