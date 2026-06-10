---
name: scout
description: Fast codebase scouting for file discovery, task context gathering, and quick searches across directories.
---

# Scout

Use this skill to find relevant files, symbols, dependencies, and project structure before planning or editing.

## Workflow

1. Extract search targets from the user request: feature names, symbols, file types, domains, error text, or commands.
2. Start broad with fast file and text search.
3. Read only the highest-signal files.
4. Expand to nearby tests, configs, wiki pages, plans, or callers when needed.
5. Return a concise map of findings.

## Search Defaults

- Prefer `rg --files` for file discovery.
- Prefer `rg` for text search.
- Use language-aware tools when the repo already has them.
- Parallelize independent reads when available.
- Avoid loading whole directories when a few files answer the question.

## External Tools

Use external codebase tools only when they are already available and materially reduce work. Do not require a specific AI platform.

## Report

- `path/to/file` - why it matters.
- Key patterns discovered.
- Files intentionally ignored.
- Unresolved questions.
