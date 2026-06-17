# dekit

Portable instruction and skill toolkit for data engineering teams. Helps AI runners build, test, deploy, review, document, and maintain data pipelines without depending on platform-specific wrappers.

## What's Inside

### Runtime Contract

- `AGENTS.md` is the repository entrypoint.
- `.instructions/` contains portable constraints and verification rules.
- `.agents/skills/` contains task-specific behavior.
- Platform adapters are optional and must not become a second source of truth.

### Data Engineering Foundation

All skills inherit universal data engineering constraints defined in `.instructions/data-engineering-constraints.md`:
idempotency, schema evolution, data contracts, partitioning strategy, quality gates, modeling rules, performance, and security. Verification rules live in `.instructions/verification.md`.

### Bundled Skills by Workflow Mode

These are the baseline skills shipped with dekit. They are not an allowlist.

Additional skills can be added by users or installers. They can still work and auto-load when the active AI runner supports skill discovery for their location. List a skill here only when dekit owns and maintains it as part of the baseline toolkit.

**Build & Scaffold** — creating new things:

| Skill | Purpose |
|---|---|
| `plan` | Implementation planning, architecture decisions, phased roadmaps |
| `spark-development` | PySpark patterns, joins, optimization, UDFs, debugging |
| `sql-authoring` | Window functions, CTEs, pivots, dialect differences |
| `data-modeling` | Kimball dimensional modeling, star schema, SCD, Data Vault |
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
| `code-review` | General review + SQL/Spark anti-patterns, notebook hygiene, metadata validation |
| `test` | General testing + row count validation, schema assertions, reconciliation, SCD correctness |

**Analyze & Research** — understanding and exploring:

| Skill | Purpose |
|---|---|
| `research` | Technology evaluation, best practices |
| `scout` | Fast codebase exploration |
| `docs-seeker` | External library/framework docs lookup |
| `wiki` | Internal LLM wiki and project memory |

**Utility** — supporting workflows:

| Skill | Purpose |
|---|---|
| `git` | Git operations, conventional commits |
| `docs` | End-user and public documentation |

### ETL Skills (from datacoolie)

The `datacoolie-*` skills cover the full ETL lifecycle: `discover -> architect -> init -> metadata -> provision -> deploy`.

They are not installed by reading this README. Install them when they are not already available:

```bash
npx skills add datacoolie/datacoolie
```

For a new datacoolie project, create the workspace `AGENTS.md` before doing any project work:

```bash
project_name="sales_analytics"
workspace_name="${project_name}_dcws"
curl --create-dirs -o "${workspace_name}/AGENTS.md" https://raw.githubusercontent.com/datacoolie/datacoolie/main/ai/AGENTS.md
```

By convention, `{workspace_name}` is `{project_name}_dcws`. Preserve an existing workspace `AGENTS.md` unless the user explicitly asks to replace it.

## Plans & Templates

Reusable plan templates for data engineering work live in `plans/templates/`:

| Template | Use when |
|---|---|
| `feature-implementation-template.md` | New ingestion pipelines, silver transforms, gold aggregates, data models |
| `bug-fix-template.md` | Row count mismatches, schema drift, quality gate failures, pipeline errors |
| `refactor-template.md` | Partition redesign, notebook modularization, query optimization, layer consolidation |
| `template-usage-guide.md` | Selecting the right template and quality checklist |

Convention: copy the template to `plans/YYMMDD-feature-name/plan.md`.

## Relationship to datacoolie

**datacoolie** is a pip-installable Python library that runs ETL pipelines.

**dekit** wraps datacoolie with everything else a data engineering team needs: Spark development patterns, SQL authoring, data modeling, data quality, notebook best practices, internal wiki maintenance, end-user docs, plus general engineering workflows (git, debugging, testing, planning, code review).

## Getting Started

1. Clone this repo into your workspace
2. Read `AGENTS.md`
3. Configure your AI runner to load the relevant adapters
4. For new Standard or Complex work, copy a template from `plans/templates/` to `plans/YYMMDD-feature-name/plan.md`
