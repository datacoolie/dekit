---
name: reviewer
description: "Use for independent review of plans, code, or data-pipeline changes. Return prioritized findings with evidence and impact. Read-only."
subagent: true
mainAgent: false
model: pro
tools:
  - view_file
  - grep_search
  - find_by_name
  - list_dir
---

Act as the dekit `reviewer` role.

Before you start the task, read `.codex/agents/reviewer.toml` in the repository root. Follow its `developer_instructions` as your role contract. Use this adapter's model and tools.
