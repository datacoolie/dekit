# dekit

Portable instruction and skill toolkit for data engineering teams. Gives AI agents focused guidance to build, test, deploy, review, document and maintain data pipelines.

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

## Agent Adapters

dekit keeps one canonical copy of each instruction, skill, and role contract. Adapter files only connect an AI agent to that copy.

| Path | Content |
|---|---|
| `AGENTS.md`, `.agents/instructions/`, `.agents/skills/` | Canonical instructions and skills |
| `.codex/agents/<role>.toml` | Canonical role contracts in `developer_instructions` |
| `.claude/agents/<role>.md`, `.agents/agents/<role>.md` | Role adapters |
| `.claude/skills/<name>` | Git symlinks to `../../.agents/skills/<name>` |
| `.claude/settings.json` | Removes AI attribution from commits and pull requests |

Do not add other instruction files, such as `CLAUDE.md` or `GEMINI.md`. Some AI agents read such a file instead of `AGENTS.md`.

### Roles

The seven roles are `scout`, `researcher`, `strategist`, `planner`, `implementer`, `tester`, and `documenter`. `scout` and `strategist` are read-only.

A role adapter does not copy the role contract. It tells the agent to read `developer_instructions` in `.codex/agents/<role>.toml`. The adapter sets only the model, reasoning effort, and tools that its AI agent supports. Each adapter repeats the `description` from `.codex/agents/<role>.toml`, because the AI agent uses it to select the role.

You can change the model, effort, and tools in an adapter. Do not change the role contract there.

### Windows and Git Symlinks

The `.claude/skills/<name>` entries are Git symlinks (mode `120000`). When `core.symlinks` is `false`, Git for Windows writes each link as a plain text file. This is the default. An AI agent that reads `.claude/skills/` then does not find the skills.

To get real links on Windows:

1. Turn on Developer Mode in Windows Settings, or run Git as an administrator.
2. In the repository, run these commands:

   ```powershell
   git config core.symlinks true
   Remove-Item .claude\skills\* -Force
   git checkout -- .claude/skills
   ```

3. For a new clone, run `git clone -c core.symlinks=true <url>`.

You can also use the repository from WSL.

When the links are plain text files, obey these rules:

- Do not edit or stage the files in `.claude/skills/`. If their mode changes from `120000` to `100644`, the links break on all platforms. To check the mode, run `git ls-files -s .claude/skills`.
- Do not copy dekit into another project from this checkout. The copy contains text files, not links.

### Maintenance

- To add a skill, add `.agents/skills/<name>/SKILL.md`. Then add its link. Run this command in Git Bash or another POSIX shell, because PowerShell adds a line break to the link target:

  ```bash
  name=<name>
  git update-index --add --cacheinfo "120000,$(printf '%s' "../../.agents/skills/$name" | git hash-object -w --stdin),.claude/skills/$name"
  git checkout -- ".claude/skills/$name"
  ```

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

The adapter files in `.codex/`, `.claude/`, and `.agents/agents/` are optional. See [Agent Adapters](#agent-adapters). dekit does not manage external runner sessions or provider homes.

Use [verification policy](.agents/instructions/verification.md) for task-specific checks. Helpers remain within the skills that own them; use the repository's `.venv` Python when present.

Keep guidance focused on constraints, observed gotchas, and useful decision checks. Procedures must contribute task-specific information; remove generic teaching and repeated policy. Collect behavioral comparisons from real workloads before claiming quality or cost improvements.

## Getting Started

1. Clone this repo into your workspace. On Windows, read [Windows and Git Symlinks](#windows-and-git-symlinks).
2. Open the repo in your AI agent. It reads `AGENTS.md` and discovers the skills and roles. If your AI agent has no skill discovery, load the relevant `.agents/skills/<name>/SKILL.md` explicitly
3. For Standard/Complex, risk-bearing Simple, or explicitly requested planning, use the `plan` skill's template and add only relevant scenario sections
