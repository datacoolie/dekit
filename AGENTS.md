# AGENTS.md

## Purpose

dekit defines portable operating rules for data engineering AI runners.

It helps any compatible AI runner work on pipelines, SQL, notebooks, data models, quality checks, deployment workflows, debugging, review, internal wiki, user-facing docs, plans, reports, and git operations.

## Philosophy

Runtime instructions must be small, focused, and verifiable.

Core rules:

- Load the smallest useful context.
- Prefer constraints and acceptance criteria over long procedures.
- Keep runtime instructions small. Remove rules that do not improve outcomes.
- Verify artifacts instead of trusting status claims.
- Keep one source of truth.
- Do not maintain parallel copies of the same rule.
- Reports must list unresolved questions at the end.

## Required Reading

Before planning or implementation:

1. `README.md`
2. The smallest relevant file from `.instructions/`

Do not bulk-load all instructions by default.

## Instruction Source Of Truth

`.instructions/` is canonical and tool-agnostic.

| File | Use when |
|---|---|
| `.instructions/agent-operating-model.md` | Any task: scope, autonomy, handoff, reporting |
| `.instructions/engineering-constraints.md` | Code, repo, refactor, implementation |
| `.instructions/data-engineering-constraints.md` | Pipelines, SQL, Spark, notebooks, data models |
| `.instructions/verification.md` | Tests, evals, review, acceptance checks |
| `.instructions/wiki.md` | Internal LLM wiki and project memory |
| `.instructions/artifacts.md` | README, user-facing docs, plans, reports, decision records |

Platform-specific files may wrap these instructions, but must not duplicate or redefine them.

## Operating Rules

- Start with task triage: Trivial, Simple, Standard, or Complex.
- Act autonomously inside scope.
- Stop for breaking changes, irreversible operations, architecture decisions, or uncharted territory.
- Modify source files directly. No side-by-side final/enhanced copies.
- Preserve user changes. Do not revert unrelated work.
- Verify before reporting done.
- Reports must be concise.

## Repository Layout

- `AGENTS.md` - repository entrypoint for AI runners.
- `.instructions/` - canonical portable instructions.
- `wiki/` - internal technical knowledge for engineers and AI runners, when present.
- `plans/` - implementation plans and reports.
- `docs/` - user-facing documentation, when present.
- `.scratch/` - temporary local workspace; can persist across work sessions; no secrets and no production imports.

## Universal Conventions

- One commit should contain one coherent change.
- Files over 200 lines are a split signal; split only on meaningful boundaries.
- Check for existing modules before adding new ones.
