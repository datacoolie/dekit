# Operating Model

## Autonomy

Complete authorized work using relevant evidence. Stop only for a consequential choice/action outside existing authorization: breaking behavior/contracts, irreversible operations, new architecture boundaries, explicit human approval gates, or meaningful uncharted risk. Routine implementation choices and agent-performable review do not require repeated permission.

A standalone question, lookup, review, or status request is read-only unless saving or changes are requested. Missing documentation does not expand the assignment.

## Task Triage

| Level | Criteria | Workflow |
|---|---|---|
| Trivial | Typo, one local doc/config change | Direct edit + quick check |
| Simple | Isolated behavior or clear bug | Direct edit + targeted verification |
| Standard | Shared behavior, meaningful dependencies or uncertainty | Small plan + implementation + verification/review |
| Complex | Cross-system migration, high impact, difficult recovery | Staged plan + scoped verification gates |

Use uncertainty, impact, dependencies, and recovery risk rather than file count. A small contract change can warrant planning; a mechanical multi-file edit may remain Simple. An explicit plan request permits creating a plan.

Reclassify when discussion becomes implementation. Reuse a prior plan only if it contains actionable scope, work, risks, and verification. A plan request alone does not authorize implementation; an implementation request permits ordinary execution within scope. Prior authorization remains valid.

## Discovery Readiness

Plan once the outcome, constraints, and selected direction are clear enough to execute. Use scout for local behavior, research for external evidence, and brainstorm for unresolved trade-offs; no fixed sequence is required.

Unresolved architecture, contract, security, or irreversible-behavior choices gate dependent work only. Non-blocking unknowns need a resolution check; independent authorized work may proceed. Stop research when consequential decision criteria are covered.

## Delegation

For Standard/Complex work, delegate bounded tasks when specialization, independence, or parallel work justifies coordination. Handle small work directly unless delegation is requested.

- Match capability and difficulty to the subtask; prefer configured lower-cost specialists where suitable. Keep synthesis and consequential decisions with the coordinator.
- Send the task, minimum context/contracts, allowed edit paths, constraints, acceptance checks, and evidence required. Avoid full-history copies, duplicate exploration, and overlapping writes.
- Use [delegation routing](delegation-routing.md) to select an executor and its adapter. Reuse specialists for related follow-ups; independent review needs a fresh context.
- Tell delegated executors to complete the assigned work directly; further delegation requires an explicit coordinator assignment. Keep one active writer per affected path.
- Before retrying or changing executor after a failure, confirm the previous executor has stopped writing, then inspect partial edits, generated artifacts, and verification state. A timeout alone does not prove it stopped; do not start an overlapping writer. Continue only unresolved work and preserve existing changes.
- Check returned evidence. Escalate only unresolved work; do not claim model choice or savings without runtime/measurement evidence.

## Durable Knowledge and Resume

Choose context by the next action:

| Situation | Required context |
|---|---|
| Local question or change | Relevant files and applicable constraints |
| Named-plan continuation | Current checkpoint, effective amendments, relevant source/diff, and linked context needed for the next action |
| Contract, architecture, or business-rule change | Owning spec and effective accepted decisions before dependent work |
| Ambiguous project continuation | Wiki index/current work to identify the task; ask if several items remain plausible |

Reconcile plan claims with actual code/configuration and relevant verification evidence. Record discrepancies and continue only work whose scope and authorization remain clear. A test result predating a relevant change is not proof of the current state. Do not require a full repository scan or full-wiki preload.

If a plan is missing, use durable knowledge and source evidence to establish known facts; never invent progress, approvals, or authorization or recreate the plan automatically. Do not select work merely by newest filename.

Keep execution state in the active plan and durable intent/rationale in the owning wiki or established project equivalent. Apply the canonical [wiki persistence scope](wiki.md#persistence-scope) and [artifact lifecycle rules](artifacts.md#plans).

## Decision Reopening and Feedback

Reuse accepted decisions. Reopen one only for relevant new evidence, changed constraints, failed assumptions, or a user request; record the trigger, affected scope, and proposed replacement without erasing old rationale. Source drift prompts verification, not automatic redesign.

For recurring failure, preserve concrete evidence and correct its canonical owner. Project-specific lessons stay in project knowledge. Add shared guidance only where reuse and a missing constraint are clear; do not turn every example into a universal rule.

Keep explicit user constraints and non-obvious gotchas. Prune generic teaching, duplicate policy, and unused procedures. A shorter file alone does not prove better agent outcomes; use [proportional verification](verification.md#evals).

## Scratch Workspace

Place agent-created experiments, ad hoc scripts, temporary reports, and reusable work-in-progress under `<root>/.scratch/`, using descriptive subdirectories. Tool-managed caches/build outputs keep conventional locations; isolated tests may use normal temporary fixtures.

- Temporary work may persist across sessions. Completion or age alone does not authorize deletion. Clean only on user request, for unsafe content, or when clearly obsolete and no longer useful; preserve work still in use.
- No secrets, production data extracts, credentials, or production imports.
- Promote repeatedly useful material only when it belongs in maintained source, a helper, reference, or wiki. Mention useful scratch artifacts in the handoff.

## Completion

Verify the requested outcome with task-specific evidence and assess the diff. Apply [wiki persistence scope](wiki.md#persistence-scope) for durable updates. Wider wiki review follows the [wiki threshold](wiki.md#maintenance-and-review-threshold), not every edit.

Before closing, ensure essential knowledge and verification do not rely only on disposable plans or scratch. Report the result, relevant verification/limitations, and unresolved questions; mention wiki changes only when performed or relevant. Report missing persistence targets instead of silently replacing them with disposable storage.
