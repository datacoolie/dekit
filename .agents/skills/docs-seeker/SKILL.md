---
name: docs-seeker
description: Search library/framework documentation via llms.txt (context7.com). Use for API docs, GitHub repository analysis, technical documentation lookup, latest library features.
---

# Docs Seeker

Use this skill to fetch current external library or framework documentation when local code is not enough.

Prefer official docs and `llms.txt` sources. Do not rely on memory for APIs, versions, or release-sensitive behavior.

## Workflow

1. Classify the query:

```bash
node scripts/detect-topic.js "<user query>"
```

2. Fetch docs:

```bash
node scripts/fetch-docs.js "<user query>"
```

3. If multiple URLs or large `llms.txt` output appears, rank it:

```bash
cat llms.txt | node scripts/analyze-llms-txt.js -
```

4. Read only the URLs needed to answer or implement the task.

## Output

- Cite sources when answering the user.
- Prefer short implementation guidance over long documentation summaries.
- Record assumptions when docs are incomplete or version-specific.

## Environment

Scripts load environment values from `process.env`, then this skill's `.env`, then `.agents/skills/.env`.
