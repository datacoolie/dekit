# dekit

Portable instruction and skill toolkit for data engineering teams. Gives AI agents focused guidance for data pipelines, Python packages and applications, and FastAPI services.

## What's Inside

### Runtime Contract

- `AGENTS.md` is the repository entrypoint.
- `.agents/instructions/` contains portable constraints and verification rules.
- `.agents/skills/` contains task-specific behavior.
- The AI agent's environment manages execution, permissions, model selection and available tools.
- Adapter files connect each AI agent to these files. See [Agent Adapters](#agent-adapters).

### Data Engineering Foundation

Relevant skills reference the universal data engineering constraints in `.agents/instructions/data-engineering-constraints.md`; they do not implicitly load every domain rule. Verification rules live in `.agents/instructions/verification.md`.

### Bundled Skills by Workflow Mode

These are the baseline skills shipped with dekit. They are not an allowlist.

Additional skills can be added by users or installers. They can still work and auto-load when the active AI runner supports skill discovery for their location. List a skill here only when dekit owns and maintains it as part of the baseline toolkit.

**Build & Scaffold** — creating new things:

| Skill | Purpose |
|---|---|
| `plan` | Implementation planning, architecture decisions, phased roadmaps |
| [`python-development`](.agents/skills/python-development/SKILL.md) | Python packages, imports, tooling, runtime compatibility, and application design |
| [`fastapi-development`](.agents/skills/fastapi-development/SKILL.md) | FastAPI routing, HTTP contracts, persistence, execution, and service operations |
| `spark-development` | PySpark patterns, joins, optimization, UDFs, debugging |
| `sql-authoring` | Window functions, CTEs, pivots, dialect differences |
| `data-modeling` | Grain-first dimensional or non-dimensional modeling, SCD, Data Vault, keys, metrics |
| `data-ingestion` | Ingestion patterns, transfer methods, change detection, landing zones, platform mapping |
| `notebook-development` | Cell organization, parameterization, Fabric/Databricks/Jupyter patterns |

**Debug & Operate** — diagnosing and fixing:

| Skill | Purpose |
|---|---|
| `debug` | General debugging + Spark OOM/shuffle/skew, SQL explain plans, schema drift |
| `dataops` | CI/CD, infrastructure provisioning, monitoring, rollback, cost controls |

**Govern & Quality** — enforcing standards:

| Skill | Purpose |
|---|---|
| `security` | STRIDE + OWASP security audit |
| `data-quality` | Quality dimensions, assertions, contracts, quarantine patterns |
| `code-review` | Plan critique and code review, including SQL/Spark, notebooks, and metadata |
| `test` | General testing + row count validation, schema assertions, reconciliation, SCD correctness |

**Analyze & Research** — understanding and exploring:

| Skill | Purpose |
|---|---|
| `brainstorm` | Open-ended ideation, option framing, assumption checks before research or planning |
| `research` | Source-backed technology evaluation, best practices, and recommendations |
| `scout` | Fast codebase exploration |
| `docs-seeker` | Current external docs via explicit Context7/llms.txt inputs with guarded query fallback |
| `wiki` | Internal LLM wiki and project memory with selective, read-only query/status helpers |

**Utility** — supporting workflows:

| Skill | Purpose |
|---|---|
| `git` | Git operations, conventional commits |
| `docs` | End-user and public documentation |

Use the Python and FastAPI skills through the [toolkit clone or copy workflow](#copy-dekit-to-another-project). Load the relevant `SKILL.md` explicitly when the runner needs manual routing. Official library documentation and skills remain external and can supplement DEKit's guidance for the versions in use. Standalone installation of these two skills is outside the supported workflow.

## Agent Adapters

dekit keeps one canonical copy of each instruction, skill, and role contract. Adapter files only connect an AI agent to that copy.

| Path | Content |
|---|---|
| `AGENTS.md`, `.agents/instructions/`, `.agents/skills/` | Canonical instructions and skills |
| `.codex/agents/<role>.toml` | Canonical role contracts in `developer_instructions` |
| `.claude/agents/<role>.md`, `.agents/agents/<role>.md` | Role adapters |
| `.claude/skills/<name>` | Local directory links to `.agents/skills/<name>`. `scripts/sync_skill_links.py` makes them. Git ignores them. |
| `.claude/settings.json` | Removes AI attribution from commits and pull requests |

Do not add other instruction files, such as `CLAUDE.md` or `GEMINI.md`. Some AI agents read such a file instead of `AGENTS.md`.

### Roles

The seven roles are `scout`, `researcher`, `strategist`, `planner`, `implementer`, `tester`, and `documenter`. `scout` and `strategist` are read-only.

A role adapter does not copy the role contract. It tells the agent to read `developer_instructions` in `.codex/agents/<role>.toml`. The adapter sets only the model, reasoning effort, and tools that its AI agent supports. Each adapter repeats the `description` from `.codex/agents/<role>.toml`, because the AI agent uses it to select the role.

You can change the model, effort, and tools in an adapter. Do not change the role contract there.

### Skill Links

Some AI agents read project skills only from `.claude/skills/`. To give them the canonical skills, run this command from the repository root:

```bash
python scripts/sync_skill_links.py
```

Run it again after you clone or copy dekit, and after you add, rename, or remove a skill. To report drift without changes, add `--check`. The command then exits with code 1 if a link is missing, wrong, or stale.

The script:

- Makes one relative symbolic link for each `.agents/skills/<name>/SKILL.md`.
- On Windows, makes a directory junction when it cannot make a symbolic link. A symbolic link needs Developer Mode or an administrator shell. A junction needs no privilege, but it contains an absolute path. Thus, run the script again after you move the project.
- Replaces text files and exact copies that a copy tool or Git wrote in place of a link.
- Removes links to skills that no longer exist.
- Does not change other content in `.claude/skills/`. If an entry has the name of a canonical skill but different content, the script reports `SKIP` and exits with code 1. Move that entry, then run the script again.

The script needs Python 3 and uses only the standard library.

### Copy dekit to Another Project

1. Copy `AGENTS.md`, `.agents/`, `.codex/`, `.claude/`, and `scripts/` to the project root. You can omit `.claude/skills/`.
2. Add `.claude/skills/` to the `.gitignore` file of the project.
3. In the project root, run `python scripts/sync_skill_links.py`.

### Maintenance

- To add, rename, or remove a skill, change `.agents/skills/<name>/`. Then run `python scripts/sync_skill_links.py`.
- To change a role contract, edit `developer_instructions` in `.codex/agents/<role>.toml` only.
- To change a role description, edit `.codex/agents/<role>.toml`. Then copy the same `description` to each role adapter.
- To add a role, add `.codex/agents/<role>.toml` and one adapter in each adapter directory.

## Plans & Templates

Reusable plan templates for data engineering work live in `.agents/skills/plan/assets/templates/`:

| Template | Use when |
|---|---|
| `plan-template.md` | Shared core for implementation plans |
| `scenario-sections.md` | Optional sections for bugs, incidents, pipelines, migrations, repairs, refactors, performance, tooling, and security |
| `template-usage-guide.md` | Choosing and adapting the core template |
| `feature-implementation-template.md` | Compatibility selector for feature-specific sections |
| `bug-fix-template.md` | Compatibility selector for diagnosis and repair sections |
| `refactor-template.md` | Compatibility selector for refactor and performance sections |

Copy `.agents/skills/plan/assets/templates/plan-template.md` to `<root>/plans/<plan_id>/plan.md` under the canonical [plan policy](.agents/instructions/artifacts.md#plans), then add only relevant scenario sections and rebase local links to the destination. Plans hold disposable execution state; link durable knowledge in `wiki/` rather than making a plan its only copy.

## Wiki & Session Continuity

When a project needs persistent internal knowledge, initialize `<root>/wiki/index.md` on request and add only populated areas: `specs/`, `research/`, `architecture/`, `decisions/`, and `runbooks/`. When present, this dekit checkout's `wiki/index.md` records the toolkit's own knowledge; consumer projects maintain their own wiki and do not copy this instance. Assigned updates follow [wiki persistence scope](.agents/instructions/wiki.md#persistence-scope).

Read context by task: local work uses relevant files/constraints, a named-plan continuation starts from its checkpoint and source/diff, contract or business-behavior changes consult owning specs/accepted decisions, and ambiguous project continuation uses the wiki index for orientation. Completed plans may be deleted manually; they are not the long-term memory store. See [wiki instructions](.agents/instructions/wiki.md) and [artifact rules](.agents/instructions/artifacts.md).

## Toolkit Packaging and Verification

The toolkit ships as `AGENTS.md` and `.agents/` together; skills may reference shared instructions and own their reusable assets. Consumer projects maintain their own wiki and execution plans under `plans/`.

The adapter files in `.codex/`, `.claude/`, and `.agents/agents/` are optional. `scripts/sync_skill_links.py` is the only toolkit script; it creates local links and no committed content. See [Agent Adapters](#agent-adapters). dekit does not manage external runner sessions or provider homes.

Use [verification policy](.agents/instructions/verification.md) for task-specific checks. Helpers remain within the skills that own them; use the repository's `.venv` Python when present.

Keep guidance focused on constraints, observed gotchas, and useful decision checks. Procedures must contribute task-specific information; remove generic teaching and repeated policy. Collect behavioral comparisons from real workloads before claiming quality or cost improvements.

## Getting Started

1. Clone this repo into your workspace. Then run `python scripts/sync_skill_links.py` from the repository root. See [Skill Links](#skill-links).
2. Open the repo in your AI agent. It reads `AGENTS.md` and discovers the skills and roles. If your AI agent has no skill discovery, load the relevant `.agents/skills/<name>/SKILL.md` explicitly
3. For Standard/Complex, risk-bearing Simple, or explicitly requested planning, use the `plan` skill's template and add only relevant scenario sections
