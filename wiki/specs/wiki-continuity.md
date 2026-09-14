---
title: "Durable knowledge and disposable plans"
type: spec
status: active
summary: "Requirements for preserving project understanding across sessions while allowing completed plans to be deleted."
tags: [workflow, continuity, plans, wiki]
sources:
  - ../architecture/overview.md
  - ../../AGENTS.md
  - ../../.agents/instructions/agent-operating-model.md
  - ../../.agents/instructions/artifacts.md
updated: 2026-09-14
design_status: accepted
implementation_status: verified
---

# Durable knowledge and disposable plans

## Problem

Work commonly moves through brainstorm, local scouting, external research, design discussion, planning, implementation, testing, and validation across multiple sessions. A completed plan may be deleted manually, so essential understanding cannot live only in the plan directory.

## Requirements

- Capture meaningful durable facts, constraints, rationale, decisions, changed assumptions, and verified behavior while an assigned discovery or delivery workflow is in progress.
- Keep execution progress in the active plan; do not duplicate its task checklist in the wiki.
- Allow non-blocking unknowns to remain with an owner and resolution check. Gate dependent work on unresolved architecture, contract, security, or irreversible-behavior choices.
- Reuse accepted decisions. Reopen them only for new evidence, changed constraints, failed assumptions, or an explicit user request, preserving the old rationale and approval scope.
- Keep standalone questions, lookups, reviews, and wiki status/query operations read-only unless saving is requested.
- Make a new session read the root routing rules, wiki map/current architecture, relevant spec and decisions, then an active plan if present and scout evidence for source drift.
- Completed plans may be manually deleted at any time. Durable pages must not depend on them, `.scratch/`, or an expiring report.

## Ownership

| Information | Owner |
|---|---|
| Agent behavior and safety rules | `AGENTS.md` and `.agents/instructions/` |
| Requirements and proposed/accepted design | `wiki/specs/` |
| Local/external evidence and experiments | `wiki/research/` |
| Verified current implementation shape | `wiki/architecture/`, source, config, and tests |
| Consequential rationale and supersession | `wiki/decisions/` |
| Execution progress | active `plans/<plan-id>/` |

## State distinction

Use separate fields or clear headings for proposal/acceptance and implementation verification. An accepted design is not proof that the code has shipped. A recommendation is not an accepted decision.

## Prior work disposition

The 2026-09-13 planning and skills-improvement work remains historical. Its useful lifecycle, concise-skill, helper-compatibility, and evaluation-boundary decisions are represented by the current canonical instructions, skills, and tests; the old plan folders are not required for this page to be understood. Historical reports are not reused as current test results. The earlier broad behavioral evaluation deferral remains an explicit limitation until representative workloads and a comparable runner are available.

## Acceptance evidence

The continuity rules and wiki layout are implemented in the canonical instructions, selected skills, role adapters, templates, and helper tests. Checked on 2026-09-14 against the uncommitted working tree at `HEAD=5f158046` with system Python 3.11.9; `<root>/.venv` was absent.

- Wiki helper regression suite: `python -m unittest discover -s .agents/skills/wiki/tests -p "test_*.py" -v` — 10/10 passed, including minimal purpose folders, URL frontmatter, and disposable-plan removal fixture.
- Docs-seeker suite: `npm test` from `.agents/skills/docs-seeker` — 4/4 test files passed.
- Static checks: 19/19 skill validators, 9/9 JavaScript syntax checks, 3/3 Python compile checks, and 7/7 Codex adapter TOML parses passed.
- Markdown link/path check covered 41 files with 0 errors; `git diff --check` passed. Wiki search and delta helpers remained read-only on the populated wiki.

The plan-removal test uses an isolated fixture; no user plan was deleted. A broad fresh-session with-skill/no-skill behavioral comparison remains unmeasured because representative workloads and a comparable runner are unavailable. These checks establish artifact and helper behavior, not model-quality, token, cost, latency, or general resume-performance improvement.
