# dekit

Portable instruction and skill toolkit for data engineering teams. Gives AI agents focused guidance to build, test, deploy, review, document and maintain data pipelines.

## What's Inside

### Runtime Contract

- `AGENTS.md` is the repository entrypoint.
- `.agents/instructions/` contains portable constraints and verification rules.
- `.agents/skills/` contains task-specific behavior.
- The AI agent's environment manages execution, permissions, model selection and available tools.
- Codex, Claude Code, and Google Antigravity read these files through their native discovery paths. See [Platform Support](#platform-support).

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

## Platform Support

dekit keeps one canonical copy of each instruction, skill, and role contract. Codex, Claude Code, and Google Antigravity read them through native discovery. Platform files contain only platform settings.

| Item | Codex | Claude Code | Google Antigravity |
|---|---|---|---|
| Instructions | `AGENTS.md` | `AGENTS.md` (v2.1.277 or later) | `AGENTS.md` |
| Skills | `.agents/skills/` | `.claude/skills/<name>`, a Git symlink to `../../.agents/skills/<name>` | `.agents/skills/` |
| Roles | `.codex/agents/<role>.toml` | `.claude/agents/<role>.md` | `.agents/agents/<role>.md` |
| Settings | None | `.claude/settings.json` removes commit and pull request attribution | None |

dekit does not use `CLAUDE.md`, `GEMINI.md`, `.agents/rules/`, plugins, or generators.

### Roles

The seven roles are `scout`, `researcher`, `strategist`, `planner`, `implementer`, `tester`, and `documenter`. The `developer_instructions` value in `.codex/agents/<role>.toml` is the canonical role contract. The Claude Code and Antigravity role files tell the subagent to read that contract. They do not copy it. Each role file repeats the Codex `description`, because each platform uses it to select the role.

Each platform file sets its own model, reasoning effort, and tools:

| Role | Codex | Claude Code | Antigravity |
|---|---|---|---|
| `scout` | `gpt-6-luna`, `xhigh` | `sonnet`, `xhigh`; no `Write`, `Edit`, `NotebookEdit`, `WebFetch`, or `WebSearch` | `flash`; only `view_file`, `grep_search`, `find_by_name`, and `list_dir` |
| `strategist` | `gpt-6.1-sol`, `high` | `opus`, `high`; same limits as `scout` | `pro`; same tools as `scout` |
| `researcher`, `planner` | `gpt-6.1-sol`, `high` | `opus`, `high`; all tools | `pro`; default tools |
| `implementer` | `gpt-6.1-sol`, `medium` | `opus`, `medium`; all tools | `pro`; default tools |
| `documenter`, `tester` | `gpt-6-luna`, `max` | `sonnet`, `max`; all tools | `flash`; default tools |

The model rule: a `gpt-6-luna` role uses `sonnet` and `flash`, and a `gpt-6.1-sol` role uses `opus` and `pro`. The Claude Code `effort` value is the same as the Codex `model_reasoning_effort` value. Set `effort` in each Claude Code role file. If you do not, a subagent on a model different from the main session runs at the model default (`medium` on Opus 5.5 and Sonnet 5.5). Antigravity role files have no effort setting.

The aliases `opus` and `sonnet` select the newest model for your provider. On Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry, they can select an earlier model that supports fewer effort levels. Claude Code then uses the highest supported level at or below the value. The `max` level can cost more and overthink; test it before you keep it for `documenter` and `tester`.

Antigravity role files can select only a model tier, not a model name. The documented tiers are `inherit`, `flash_lite`, `flash`, and `pro`. On 2026-11-23, `pro` selects Gemini 4 Argon and `flash` selects Gemini 3.8 Flash. Thus a role file cannot select Gemini 4 Neon, Gemini 4 Carbon, Gemini 4 Hydrogen, or the Claude models in Antigravity. Role files also have no effort setting, so roles run at the default thinking level of the tier model. This is lower than the Codex and Claude Code effort for `scout`, `tester`, and `documenter`.

- Gemini 4 Argon is not available on the Free and Google AI Plus plans. Gemini 3.8 Flash is available on all plans.
- To run a role on the model of the main conversation, set `model: inherit`. Then you can select Gemini 4 Neon or another model in the model selector.

Antigravity role files set `subagent: true` and `mainAgent: false`. Thus the roles are subagents only, as in Codex. You can change the model and tools in a platform file. Do not change the role contract there.

The read-only boundary of `scout` and `strategist` has different enforcement on each platform:

- Codex applies the parent session sandbox. The `sandbox_mode` key in a role file does not override it, so the role contract is the only limit.
- Claude Code removes the file-edit and web tools. The role keeps Bash and PowerShell for commands such as `git log`, so a shell command can still change files.
- Antigravity gives the role only file-read and search tools.

### Claude Code

- Use Claude Code v2.1.277 or later. Earlier versions do not read `AGENTS.md`.
- Do not add `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` to the repository path. If one of these files exists, Claude Code reads it instead of `AGENTS.md`. If you must use one, put `@AGENTS.md` in it, or set **Project instructions** to `claude-md-and-agents-md` in `/config`.
- Git ignores `.claude/settings.local.json` and `.claude/worktrees/`.

### Windows and Git Symlinks

The `.claude/skills/<name>` entries are Git symlinks (mode `120000`). When `core.symlinks` is `false`, Git for Windows writes each link as a plain text file. This is the default. Claude Code then does not find the skills. Codex and Antigravity are not affected.

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

If your checkout has untracked `.claude/skills` links from the retired setup script, remove them before you pull this version.

### Maintenance

- To add a skill, add `.agents/skills/<name>/SKILL.md`. Then add the Claude Code link. Run this command in Git Bash or another POSIX shell, because PowerShell adds a line break to the link target:

  ```bash
  name=<name>
  git update-index --add --cacheinfo "120000,$(printf '%s' "../../.agents/skills/$name" | git hash-object -w --stdin),.claude/skills/$name"
  git checkout -- ".claude/skills/$name"
  ```

  Codex and Antigravity find the new skill without more changes.
- To change a role contract, edit `developer_instructions` in `.codex/agents/<role>.toml` only.
- To change a role description, edit `.codex/agents/<role>.toml`. Then copy the same `description` to `.claude/agents/<role>.md` and `.agents/agents/<role>.md`.
- To change a role effort, edit `model_reasoning_effort` in `.codex/agents/<role>.toml`. Then copy the same value to `effort` in `.claude/agents/<role>.md`.
- To add a role, add one file for each platform.

### Unverified Behavior

These items were not verified on 2026-11-23:

- Claude Code: discovery was checked against the official documentation and a Linux checkout of the symlinks. It was not run in a live Claude Code session.
- Antigravity v2.34.0: the local language server discovered `AGENTS.md`, 19 skills, and the 7 roles without errors. A live subagent call was not run. The Antigravity documentation gives different tool names and different defaults for an omitted `tools` list. If `scout` or `strategist` stops responding, a name in its `tools` list is not supported by your version. Correct the name in `.agents/agents/<role>.md`.
- Commit and pull request attribution from Codex and Antigravity was not checked.

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

The toolkit ships as `AGENTS.md` and `.agents/` together; skills may reference shared instructions and own their reusable assets. Add `.codex/` and `.claude/` when you use those runners. Consumer projects maintain their own wiki and execution plans under `plans/`.

The platform files in `.codex/agents/`, `.claude/`, and `.agents/agents/` are optional adapters. See [Platform Support](#platform-support). dekit does not manage external runner sessions or provider homes.

Use [verification policy](.agents/instructions/verification.md) for task-specific checks. Helpers remain within the skills that own them; use the repository's `.venv` Python when present.

Keep guidance focused on constraints, observed gotchas, and useful decision checks. Procedures must contribute task-specific information; remove generic teaching and repeated policy. Collect behavioral comparisons from real workloads before claiming quality or cost improvements.

## Getting Started

1. Clone this repo into your workspace. On Windows, read [Windows and Git Symlinks](#windows-and-git-symlinks) if you use Claude Code.
2. Open the repo in Codex, Claude Code, or Google Antigravity. The runner reads `AGENTS.md` and discovers the skills and roles. If your runner has no skill discovery, load the relevant `.agents/skills/<name>/SKILL.md` explicitly
3. For Standard/Complex, risk-bearing Simple, or explicitly requested planning, use the `plan` skill's template and add only relevant scenario sections
