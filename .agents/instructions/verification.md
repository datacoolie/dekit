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
| Refactor | Relevant existing tests + behavior equivalence + evidence of the intended structural outcome |
| Security | Secret scan for touched files + threat-specific test |

## Design conformance and refactoring

For affected boundaries, compare actual callers, state/resource owners, lifecycle, orchestration, and dependency direction with the effective contract or accepted decision. Use [design readiness](artifacts.md#design-contracts-and-work-item-readiness) for unresolved choices. Apply this to modules, SQL, and notebooks as relevant; it does not require classes or interfaces.

- A defect or contract violation needs evidence and reachable impact. A structural improvement needs a concrete maintenance/change cost and trade-off; it is advisory unless it violates a requirement or acceptance gate. Label optional style preferences separately and do not treat them as defects.
- For refactoring, state the structural outcome and compare relevant before/after ownership, callers, or dependencies alongside behavior checks. Passing tests alone cannot show that duplicate ownership or misplaced orchestration was removed.
- If implementation contradicts an effective design decision, report the discrepancy. Update intent only through the [decision-reopening policy](agent-operating-model.md#decision-reopening-and-feedback), preserving rationale.

## Durable Context Checks

When a task spans sessions or updates project memory, verify the smallest relevant slice:

- A completed plan can be removed in an isolated fixture without removing essential intent, decision, current-behavior references, or verification evidence from their owning artifacts. Never delete the user's real plan as a test.
- Durable updates follow [wiki persistence scope](wiki.md#persistence-scope); standalone read-only work leaves files unchanged and a missing wiki does not trigger automatic initialization.
- Proposed intent, accepted decisions, verified behavior, and execution progress remain distinguishable. A source/spec discrepancy is reported, not silently normalized.
- Resume checks reconcile a named plan's checkpoint with relevant source/diff and the durable context needed for the next action. Consult specs/accepted decisions for contract or behavior changes, and wiki routing when the work needs orientation. Missing plans or ambiguous work must not produce invented progress or newest-file guessing.

Treat these as task-specific acceptance checks, not a reason to create a mandatory memory file or run a broad wiki audit for every change.

## Plan Review

Use an independent review before implementing work with shared-contract changes, difficult migration/recovery, correctness-sensitive sequencing, or parallel ownership conflicts. Risk determines the gate, not plan length or the Complex label alone. Ordinary plans need only proportional self-checks.

- Give a reviewer who did not author the plan a focused context: original requirements, plan, relevant contracts, and source/test paths. Have them verify material assumptions against those artifacts rather than inherit the author's full discussion.
- Check feasibility, acceptance-to-task/check coverage, dependencies, write ownership, compatibility, and realistic recovery prerequisites. Return only actionable findings with evidence, impact, and affected tasks; distinguish blocking findings from suggestions. Test expectations must follow requirements and observed contracts, not merely repeat the plan's assumptions.
- Start with one review pass. Resolve findings by correction or an evidence-backed rejection; recheck material fixes and affected dependencies. Unresolved blocking findings keep affected tasks gated even if the review budget is exhausted; avoid unbounded critique loops.
- If an independent reviewer is unavailable, disclose the gap and keep review-gated work blocked while independent authorized work proceeds. A self-check is not an independent review; any accepted exception must be explicit.

## Evals

For instruction, skill, or adapter changes, verify concrete constraints first: metadata/dependencies, relevant links, scoped fixtures, and review for conflicting policy. These checks do not prove improved agent behavior.

Use representative behavioral comparisons when cases exist or when claiming quality/cost gains. Keep task, model/settings, and outcome criteria comparable; include a no-skill baseline when evaluating a skill. Track useful outcomes and rework alongside context, tool calls, time, or cost where available.

When representative cases do not exist, record behavioral evaluation as deferred and collect cases from real work. Do not block an explicitly accepted mechanical/content improvement solely for missing live-agent evals, or claim improvement from fewer lines alone. Keep regression evidence and revisit guidance when real results contradict it.

## Review

Review for:

- Correctness bugs.
- Broken contracts.
- Missing verification.
- Security leaks.
- Data quality gaps.
- Excess context, duplication, or procedural clutter.

Findings must cite files or artifacts. Summaries come after findings.
