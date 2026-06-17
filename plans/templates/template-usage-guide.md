# Plan Template Usage Guide

## Template Selection

### Feature Implementation Template
**Use when**: Adding new functionality — ingestion pipelines, silver transformations, gold aggregates, new data models, or platform integrations
**File**: `feature-implementation-template.md`
**Size**: Medium to large scope changes

### Bug Fix Template  
**Use when**: Fixing data issues — row count mismatches, schema-breaking source changes, data drift incidents, quality gate failures, or pipeline errors
**File**: `bug-fix-template.md`
**Size**: Small to medium scope changes

### Refactoring Template
**Use when**: Improving pipeline structure without changing outputs — partition redesign, query optimization, notebook modularization, or medallion layer consolidation
**File**: `refactor-template.md` 
**Size**: Medium to large scope changes

## Context Management Best Practices

### Keep Plans Focused
- **Executive Summary**: Max 3 sentences
- **Context Links**: Reference files, don't include full content
- **Tasks**: Max 10 per phase
- **Context budget**: Target <200 words for summaries

### Template Adaptation
1. Copy the appropriate template to `plans/YYMMDD-feature-name/plan.md`
2. Fill YAML frontmatter first: title, description, status, priority, effort, branch, tags, blockedBy, blocks, and creation date
3. Remove sections not relevant to your specific use case
4. Keep the core structure intact for consistency

### Continuing Existing Plans
- If a plan is still `planning` or `draft`, update the plan directly.
- If a plan is `in_progress`, `active`, `implementing`, `done`, `complete`, `completed`, or `implemented`, do not edit the parent plan directly.
- Add the next numbered appendix in the same folder, such as `appendix-1.md`, `appendix-2.md`, or `appendix-3.md`.
- The appendix should reference the parent plan and state status, reason, scope delta, affected files or systems, acceptance criteria, verification, gates, and open questions.
- Implementation should follow the active plan or appendix by status. If status is unclear or multiple appendices conflict, ask before implementing.

### Cross-References Instead of Duplication
- Link to existing internal wiki pages in `./wiki/`
- Link to user-facing documentation in `./docs/` only when relevant
- Reference other plans without copying content
- Use file paths instead of code blocks where possible
- Focus on "what" and "why", not detailed "how"

## Quality Checklist

Before finalizing any plan:
- [ ] Executive summary is clear and concise
- [ ] YAML frontmatter is complete and matches the plan content
- [ ] Tasks are specific and actionable
- [ ] File paths are included for implementation tasks
- [ ] Success criteria are measurable
- [ ] Context links are used instead of full content
- [ ] Data flow documented (source → target, with layer boundaries)
- [ ] Idempotency and quality gates addressed per `.instructions/data-engineering-constraints.md`
- [ ] Required promotion / approval gates are listed for each staged layer or cutover
- [ ] TODO checklist is complete and realistic

## Context Refresh Triggers

Use these templates when:
- Starting a new development phase
- Switching between different types of work (feature → bugfix)
- Switching between pipeline layers (bronze ↔ silver ↔ gold)
- After major context accumulation (>8000 tokens)
- When agent handoffs occur

This ensures each plan starts with fresh, focused context optimized for the specific task type.
