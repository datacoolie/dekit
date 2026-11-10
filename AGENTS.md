# AGENTS.md

dekit is a portable instruction and skill toolkit for data engineering AI agents. Keep guidance small, focused, and verifiable.

## Core constraints

- Inspect relevant evidence before editing; preserve user changes and edit source in place.
- Act within scope. Stop for unresolved breaking changes, irreversible operations, architecture choices, or meaningful risk without an established approach. Existing authorization remains valid.
- Verify the requested outcome before reporting done. Keep reports concise and end with unresolved questions, if any.
- Keep one canonical owner per rule. Prefer constraints and observed gotchas over generic teaching or fixed itineraries.
- Durable intent and rationale belong outside disposable plans. Completed plans may be deleted manually.

## Root and paths

`<root>` is the Git top-level, or the directory containing the workspace entrypoint `AGENTS.md` outside Git. The current directory and nested instructions do not redefine it.

Resolve repository-level paths from `<root>`. Reuse existing root directories; verify the target before creating one. A nested `wiki/`, `docs/`, or `.scratch/` is allowed only by an explicit component convention or user request. Execution-plan locations follow the [plan policy](.agents/instructions/artifacts.md#plans).

Ordinary Markdown links resolve relative to their owning file. Resolve skill resources against `.agents/skills/<name>/`.

## Task-driven context

Classify work by uncertainty, impact, dependencies, and recovery risk. Local questions and small fixes need relevant files and constraints; Standard/Complex implementation or an explicit plan request needs the [planning policy](.agents/instructions/agent-operating-model.md#task-triage).

Before substantial or unfamiliar feature work, follow the [solution discovery policy](.agents/instructions/agent-operating-model.md#discovery-readiness).

Read only what affects the next action:

- `README.md`, when present, for the current project's purpose, setup, usage, or navigation.
- A named plan's checkpoint plus relevant source/diff when resuming it; consult the [resume policy](.agents/instructions/agent-operating-model.md#durable-knowledge-and-resume).
- Owning specs and accepted decisions when changing contracts, architecture, or business behavior.
- `wiki/index.md` when project continuation needs orientation. No full-wiki or architecture preload for every session.

## Canonical routing

`.agents/instructions/` owns shared policy; skills reference it rather than redefining it.

| File | Read when |
|---|---|
| [agent-operating-model.md](.agents/instructions/agent-operating-model.md) | Planning delivery, resuming work, evaluating autonomy/delegation, or handing off |
| [engineering-constraints.md](.agents/instructions/engineering-constraints.md) | Editing code, refactoring, or running repository tools; includes `.venv` selection |
| [data-engineering-constraints.md](.agents/instructions/data-engineering-constraints.md) | Pipelines, SQL, Spark, notebooks, models, or data contracts |
| [verification.md](.agents/instructions/verification.md) | Choosing tests, acceptance checks, evals, or review gates |
| [wiki.md](.agents/instructions/wiki.md) | Reading/updating project memory or checking wiki health |
| [artifacts.md](.agents/instructions/artifacts.md) | Creating/updating plans, reports, decisions, or user-facing docs |

## Skills and artifacts

Use `brainstorm` for unsettled directions, `scout` for local evidence, `research` for external facts, and `plan` for an actionable implementation direction. Brainstorm output is not factual evidence. Select other skills by their actual scope; do not load every reference by default.

- `.agents/skills/`: canonical reusable task guidance and helpers.
- `wiki/`: optional durable internal knowledge; add only populated areas.
- `plans/`: disposable execution plans/reports; reusable templates belong to `.agents/skills/plan/assets/templates/`.
- `docs/`: optional user-facing documentation.
- `.scratch/`: agent-created temporary work; may persist across sessions. No secrets or production imports. Tool-managed caches/build outputs keep their conventional locations; see the [scratch policy](.agents/instructions/agent-operating-model.md#scratch-workspace).
