# Artifacts

## Purpose

Artifacts are durable project outputs for humans and AI runners: README files, user-facing docs, plans, reports, and decision records.

Keep artifacts factual, compact, and tied to checked source evidence.

## README

`README.md` is the project entrypoint.

Use it for:

- Project purpose and scope.
- Installation or setup.
- Quick start.
- Navigation to deeper docs, plans, or wiki pages.

Move detail into `docs/`, `plans/`, or `wiki/` when it is too large, task-specific, internal, or audience-specific for the README.

## Mermaid Diagrams

- Wiki pages, plans, and user-facing docs may use inline Mermaid diagrams.
- Prefer Mermaid for complex workflows, decisions, architecture, data flows, or relationships when it makes them easier to explain and understand.
- Mermaid remains optional; skip it when concise prose or a table is equally clear.
- Validate Mermaid syntax when adding or materially changing a diagram.

## User-Facing Docs

Use `docs/` for material intended for users outside the engineering team:

- Product or user guides.
- Getting-started and onboarding.
- Public API, CLI, or integration docs.
- Tutorials and examples.
- User-visible release notes.

Preferred structure when a project needs public docs:

- `docs/index.md`: entrypoint, audience, and reading order.
- `docs/getting-started.md`: shortest successful path.
- `docs/configuration.md`: public configuration, environment variables, and defaults.
- `docs/concepts/`: concepts users need before operating the product.
- `docs/how-to/`: task-oriented workflows.
- `docs/reference/`: API, CLI, file format, or integration reference.
- `docs/troubleshooting.md`: known user-facing failures and fixes.
- `docs/release-notes.md`: user-visible changes.

Rules:

- Document shipped behavior, not planned behavior.
- Verify commands, paths, config keys, APIs, examples, and screenshots against source artifacts.
- State version, platform, environment, or permission assumptions when they affect the reader.
- Prefer task-oriented pages over implementation narratives.
- Keep internal design rationale in `wiki/`; move only the user-relevant outcome into `docs/`.
- Do not expose secrets, private architecture details, internal-only runbooks, or agent-specific workflow notes.
- Link to `wiki/` only when the reader has access and the detail is appropriate.
- Remove or rewrite stale docs when behavior changes. Do not leave "update later" placeholders.
- Before reporting docs done, verify links, commands, examples, and public terminology.

## Plans

Create an execution plan for Standard or Complex work, or when the user explicitly requests one. Trivial or Simple work does not need a plan unless its uncertainty, impact, dependency, or recovery risk justifies it.

An implementation plan is an execution artifact, not the long-term home of project knowledge. It may be manually deleted at any time, including immediately after completion. Do not make a wiki page, decision, architecture description, test evidence, or follow-up depend on a completed plan's existence.

Plan metadata should use YAML frontmatter when the plan is stored as Markdown. Use visible tables for reviewable content, not as the source of truth for metadata.

Every plan must contain only the sections relevant to its task:

- Outcome and non-goals.
- Scope and affected files, systems, data products, or consumers.
- Checked context, constraints, assumptions, and unresolved questions; identify which questions block which work.
- Selected approach and consequential alternatives or rejected options.
- Work items with dependencies when needed and observable completion criteria.
- Verification mapped to important outcomes.
- Risks and recovery, distinguishing code, schema, data, and operational actions when applicable.
- Current execution state: completed work, evidence, blockers, and next action.

Do not invent filenames, estimates, root causes, approvals, or test results to fill a template. Mark uncertain details and state what observation resolves them.

Plan status is execution state, not permission to deploy or perform another external action:

- `planning` / `draft`: refine the plan directly.
- `ready` / `approved`: scope is actionable; preserve any approval record and its scope.
- `in_progress` / `active` / `implementing`: update progress, evidence, blockers, and next action in the plan. Do not create an appendix for routine progress.
- `blocked`: record the cause, affected work, and unblock condition; continue only independent authorized work.
- `paused`: record the intentional pause and resume checkpoint; do not infer cancellation.
- `done` / `complete` / `completed` / `implemented`: close only with scoped evidence and durable outcomes already recorded in their owning artifacts; retain, archive, or manually delete the plan according to user preference. Use a linked follow-up plan for new work when needed.
- `cancelled` / `superseded`: preserve partial outcomes and link a replacement when one exists.

When continuing a plan, read its current state, relevant amendments, source/diff, assumptions, and linked durable artifacts before acting. If the plan is missing, use the relevant wiki pages and source evidence to determine what is known; do not recreate progress, approvals, or authorization from filenames or memory. If the next action is ambiguous or active items conflict, ask before implementing.

Create a numbered amendment or appendix only for a material change to scope, design, acceptance criteria, dependencies, or recovery strategy. It must reference the parent, affected identifiers, replacement scope, evidence needs, status, and reason. Keep a current-amendment pointer in the parent when amendments exist. Creating an amendment does not approve it.

For staged data work, plans must identify the gate after each layer or phase, for example:

- `source -> bronze`: ingestion contract and raw/bronze validation approved.
- `bronze -> silver`: schema, deduplication, business rules, and reconciliation approved.
- `silver -> gold`: metric definitions, aggregates, semantic model impact, and consumer checks approved.

Keep plan indexes short. Put detailed phase work in separate files only when needed.

### Durable knowledge and deletion independence

During discovery and delivery, update the owning wiki spec, research, architecture, decision, or runbook when a meaningful fact, rationale, decision, assumption, or verified behavior changes. Do not wait for the plan to finish and do not copy the whole plan into the wiki.

Before marking a plan complete, leave durable records for:

- accepted intent and consequential rationale;
- current behavior and relevant source/config/test references;
- decisions that were replaced or remain unresolved; and
- verification evidence that another runner can interpret (command/check, revision or environment, result, and limitation).

This is a completion-quality requirement, not a pre-delete ceremony. The user may delete the plan manually without triggering a migration, hook, backup, or plan recreation. Transient progress, task ordering, and raw tool output may disappear with the plan.

## Reports

Reports should be dense and factual:

- Task performed.
- Evidence collected.
- Decisions made.
- Risks or blockers.
- Next action.
- Unresolved questions.

Do not polish reports at the cost of signal.

## Decision Records

Record a decision when it changes:

- Architecture.
- Data contract.
- Security boundary.
- Operational ownership.
- Tooling or engine choice.

Each decision record needs context, decision, alternatives considered, consequences, and verification.

Use a small lifecycle: `proposed`, `accepted`, `rejected`, or `superseded`. Keep decision status separate from implementation status. A replacement record links to the decision it supersedes and states the trigger (new evidence, changed constraint, failed assumption, or user request). Do not edit away the old rationale.
