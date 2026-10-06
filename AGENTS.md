# AGENTS.md

dekit is a portable instruction and skill toolkit for data engineering AI runners. Keep guidance small, focused, and verifiable.

## Core constraints

- Inspect relevant evidence before editing; preserve user changes and edit source in place.
- Act within scope. Stop for unresolved breaking changes, irreversible operations, architecture choices, or meaningful risk without an established approach. Existing authorization remains valid.
- Verify the requested outcome before reporting done. Keep reports concise and end with unresolved questions, if any.
- Keep one canonical owner per rule. Prefer constraints and observed gotchas over generic teaching or fixed itineraries.
- Durable intent and rationale belong outside disposable plans. Completed plans may be deleted manually.

## Root and paths

`<root>` is the Git top-level, or the directory containing the workspace entrypoint `AGENTS.md` outside Git. The current directory and nested instructions do not redefine it.

Resolve repository-level paths from `<root>`. Reuse existing root directories; verify the target before creating one. A nested `wiki/`, `plans/`, `docs/`, or `.scratch/` is allowed only by an explicit component convention or user request.

Ordinary Markdown links resolve relative to their owning file. For linked skills, resolve resources against canonical `.agents/skills/<name>/`, not a runner adapter.

## Task-driven context

Classify work by uncertainty, impact, dependencies, and recovery risk. Local questions and small fixes need relevant files and constraints; Standard/Complex implementation or an explicit plan request needs the [planning policy](.agents/instructions/agent-operating-model.md#task-triage).

Read only what affects the next action:

- `README.md` for setup, toolkit contents, or navigation.
- A named plan's checkpoint plus relevant source/diff when resuming it; consult the [resume policy](.agents/instructions/agent-operating-model.md#durable-knowledge-and-resume).
- Owning specs and accepted decisions when changing contracts, architecture, or business behavior.
- `wiki/index.md` when project continuation needs orientation. No full-wiki or architecture preload for every session.

## Canonical routing

`.agents/instructions/` owns shared policy. Runner adapters may reference it but must not redefine it.

| File | Read when |
|---|---|
| [agent-operating-model.md](.agents/instructions/agent-operating-model.md) | Planning delivery, resuming work, evaluating autonomy/delegation, or handing off |
| [engineering-constraints.md](.agents/instructions/engineering-constraints.md) | Editing code, refactoring, or running repository tools; includes `.venv` selection |
| [data-engineering-constraints.md](.agents/instructions/data-engineering-constraints.md) | Pipelines, SQL, Spark, notebooks, models, or data contracts |
| [verification.md](.agents/instructions/verification.md) | Choosing tests, acceptance checks, evals, or review gates |
| [wiki.md](.agents/instructions/wiki.md) | Reading/updating project memory or checking wiki health |
| [artifacts.md](.agents/instructions/artifacts.md) | Creating/updating plans, reports, decisions, or user-facing docs |
| [delegation-routing.md](.agents/instructions/delegation-routing.md) | Selecting or changing a native/external executor, including a request for Codex API |
| [codex-delegation.md](.agents/instructions/codex-delegation.md) | Native Codex delegation or calling Codex as an external executor from any runner |

## Skills and artifacts

Use `brainstorm` for unsettled directions, `scout` for local evidence, `research` for external facts, and `plan` for an actionable implementation direction. Brainstorm output is not factual evidence. Select other skills by their actual scope; do not load every reference by default.

- `.agents/skills/`: canonical reusable task guidance and helpers.
- `wiki/`: optional durable internal knowledge; add only populated areas.
- `plans/`: disposable execution plans/reports and reusable `plans/templates/`.
- `docs/`: optional user-facing documentation.
- `.scratch/`: agent-created temporary work; may persist across sessions. No secrets or production imports. Tool-managed caches/build outputs keep their conventional locations; see the [scratch policy](.agents/instructions/agent-operating-model.md#scratch-workspace).
