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

## Plan Review

Use an independent review before implementing work with shared-contract changes, difficult migration/recovery, correctness-sensitive sequencing, or parallel ownership conflicts. Risk determines the gate, not plan length or the Complex label alone. Ordinary plans need only proportional self-checks.

- Give a reviewer who did not author the plan a focused context: original requirements, plan, relevant contracts, and source/test paths. Have them verify material assumptions against those artifacts rather than inherit the author's full discussion.
- Check feasibility, acceptance-to-task/check coverage, dependencies, write ownership, compatibility, and realistic recovery prerequisites. Return only actionable findings with evidence, impact, and affected tasks; distinguish blocking findings from suggestions. Test expectations must follow requirements and observed contracts, not merely repeat the plan's assumptions.
- Start with one review pass. Resolve findings by correction or an evidence-backed rejection; recheck material fixes and affected dependencies. Unresolved blocking findings keep affected tasks gated even if the review budget is exhausted; avoid unbounded critique loops.
- If an independent reviewer is unavailable, disclose the gap and keep review-gated work blocked while independent authorized work proceeds. A self-check is not an independent review; any accepted exception must be explicit.

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
