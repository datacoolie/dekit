# dekit

Portable instruction and skill toolkit for data engineering teams. Helps AI runners build, test, deploy, review, document, and maintain data pipelines without depending on platform-specific wrappers.

## What's Inside

### Runtime Contract

- `AGENTS.md` is the repository entrypoint.
- `.agents/instructions/` contains portable constraints and verification rules.
- `.agents/skills/` contains task-specific behavior.
- Platform adapters are optional and must not become a second source of truth.

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
| `code-review` | General review + SQL/Spark anti-patterns, notebook hygiene, metadata validation |
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

## Plans & Templates

Reusable plan templates for data engineering work live in `plans/templates/`:

| Template | Use when |
|---|---|
| `plan-template.md` | Shared core for implementation plans |
| `scenario-sections.md` | Optional sections for bugs, incidents, pipelines, migrations, repairs, refactors, performance, tooling, and security |
| `template-usage-guide.md` | Choosing and adapting the core template |
| `feature-implementation-template.md` | Compatibility selector for feature-specific sections |
| `bug-fix-template.md` | Compatibility selector for diagnosis and repair sections |
| `refactor-template.md` | Compatibility selector for refactor and performance sections |

Convention: copy `plans/templates/plan-template.md` to `<root>/plans/YYMMDD-feature-name/plan.md`, then add only relevant scenario sections. Plans hold disposable execution state; link durable knowledge in `wiki/` rather than making a plan its only copy.

## Wiki & Session Continuity

When a project needs persistent internal knowledge, initialize `<root>/wiki/index.md` and add only populated areas: `specs/`, `research/`, `architecture/`, `decisions/`, and `runbooks/`. The dekit repository's own routing map is [`wiki/index.md`](wiki/index.md); it is this repository's knowledge instance, not a runtime dependency for projects that consume dekit. Update the owning page during an assigned discovery or delivery workflow when a meaningful fact, decision, rationale, or verified behavior changes.

At a new session, read `AGENTS.md`, this README, applicable instructions, the wiki index/current architecture, the relevant spec and decisions, then the active plan (if present) and scout the affected source/config/tests. Completed plans may be deleted manually; they are not the long-term memory store. See [wiki instructions](.agents/instructions/wiki.md) and [artifact rules](.agents/instructions/artifacts.md).

## Getting Started

1. Clone this repo into your workspace
2. Read `AGENTS.md`
3. Configure your AI runner to load the relevant adapters
4. For Standard/Complex, risk-bearing Simple, or explicitly requested planning, copy `plans/templates/plan-template.md` to `plans/YYMMDD-feature-name/plan.md` and add only relevant scenario sections
