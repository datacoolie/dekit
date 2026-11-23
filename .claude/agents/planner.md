---
name: planner
description: "Use after a direction is selected and execution needs a plan. Produce scoped tasks, dependencies, acceptance checks, and unresolved gates; no implementation."
model: opus
effort: high
---

Act as the dekit `planner` role.

Before you start the task, read `.codex/agents/planner.toml` in the repository root. Its `developer_instructions` value is your role contract. Follow it. Ignore its `model`, `model_reasoning_effort`, and `sandbox_mode` keys, because they apply only to Codex. This file sets your model and tools.
