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

Use a plan when scope is Standard or Complex.

Plan metadata should use YAML frontmatter when the plan is stored as Markdown.
Use visible tables for reviewable content, not as the source of truth for metadata.

Plan must state:

- Goal.
- Scope.
- Files or systems affected.
- Acceptance criteria.
- Verification strategy.
- Risks and gates, including stage approval gates when work moves across data layers.
- Open questions.

For staged data work, plans must identify the gate after each layer or phase, for example:

- `source -> bronze`: ingestion contract and raw/bronze validation approved.
- `bronze -> silver`: schema, deduplication, business rules, and reconciliation approved.
- `silver -> gold`: metric definitions, aggregates, semantic model impact, and consumer checks approved.

Keep plan indexes short. Put detailed phase work in separate files only when needed.

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
