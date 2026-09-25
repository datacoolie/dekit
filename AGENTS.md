# AGENTS.md

## Purpose

dekit defines portable operating rules for data engineering AI runners.

It helps any compatible AI runner work on pipelines, SQL, notebooks, data models, quality checks, deployment workflows, brainstorming, debugging, review, internal wiki, user-facing docs, plans, reports, and git operations.

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

## Repository Root (`<root>`)

Determine the repository root before resolving any repository path. Use the Git top-level directory when available; otherwise use the directory containing the workspace entrypoint `AGENTS.md`.

In these instructions, `<root>` always means this repository root.

All relative paths in this file, `README.md`, `.agents/instructions/`, and project skills are relative to that root unless explicitly stated otherwise. The current working directory and nested `AGENTS.md` files do not redefine the root.

## Required Reading

Before planning or implementation:

1. `README.md`
2. The smallest relevant file from `.agents/instructions/`

Do not bulk-load all instructions by default.

## Instruction Source Of Truth

`.agents/instructions/` is canonical. Shared rules are tool-agnostic; runner-specific guidance is explicitly scoped.

| File | Use when |
|---|---|
| `.agents/instructions/agent-operating-model.md` | Any task: scope, autonomy, handoff, reporting |
| `.agents/instructions/codex-delegation.md` | Codex only: considering or performing subagent delegation |
| `.agents/instructions/engineering-constraints.md` | Code, repo, refactor, implementation |
| `.agents/instructions/data-engineering-constraints.md` | Pipelines, SQL, Spark, notebooks, data models |
| `.agents/instructions/verification.md` | Tests, evals, review, acceptance checks |
| `.agents/instructions/wiki.md` | Internal LLM wiki and project memory |
| `.agents/instructions/artifacts.md` | README, user-facing docs, plans, reports, decision records |

Platform-specific files may wrap these instructions, but must not duplicate or redefine them.

## Operating Rules

- Start with task triage: Trivial, Simple, Standard, or Complex.
- Resolve repository paths from the repository root, never from the current working directory.
- For a new session, read the root entrypoint and applicable instructions, then `wiki/index.md` and relevant current wiki pages when that project wiki exists, before opening an active plan or scouting source for drift.
- Act autonomously inside scope.
- Stop for breaking changes, irreversible operations, architecture decisions, or uncharted territory.
- Modify source files directly. No side-by-side final/enhanced copies.
- Preserve user changes. Do not revert unrelated work.
- Verify before reporting done.
- Keep durable intent, rationale, current architecture, and operational knowledge outside disposable plan directories; completed plans may be deleted manually.
- Reports must be concise.
- Assess delegation proactively under `.agents/instructions/agent-operating-model.md`; for Codex, also read `.agents/instructions/codex-delegation.md` when considering delegation.

## Skill Routing Notes

- Use `brainstorm` for ambiguous ideas, option discovery, assumption checks, and early design trade-offs before evidence is required.
- Use `research` for source-backed evaluation when current facts, external documentation, standards, benchmarks, or vendor behavior matter.
- Use `plan` after a direction is selected and implementation scope is Standard or Complex.
- Do not treat brainstorm output as evidence. Route to research when factual claims need verification.

## Repository Layout

- `<root>/AGENTS.md` - repository entrypoint for AI runners.
- `<root>/.agents/instructions/` - canonical portable instructions.
- `<root>/wiki/` - internal technical knowledge for engineers and AI runners, when present. Use a shallow `index.md` plus populated `specs/`, `research/`, `architecture/`, `decisions/`, and `runbooks/` areas as needed.
- `<root>/plans/` - disposable implementation plans and reports; do not make them the only home of durable knowledge.
- `<root>/docs/` - user-facing documentation, when present.
- `<root>/.scratch/` - temporary local workspace; can persist across work sessions; no secrets and no production imports.

Before creating one of these directories, check for the root-level directory and reuse it. Do not create duplicate repository-level directories inside the current subdirectory.

Repository-level directory invariant:

- A default repository-level directory must be created only at its exact root-relative path, for example `<root>/wiki/`, never as `./wiki/` relative to a nested working directory.
- Determine and verify the target path against `<root>` before creating it. If the resolved target is not the root-level path, do not create it.
- A nested directory with one of these names is allowed only when the repository explicitly defines it as component-scoped or the user explicitly requests it.

## Universal Conventions

- One commit should contain one coherent change.
- Files over 200 lines are a split signal; split only on meaningful boundaries.
- Check for existing modules before adding new ones.
