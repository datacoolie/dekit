# Codex Delegation

Read only when running Codex and considering delegation. Apply the delegation policy in `.agents/instructions/agent-operating-model.md`.

- When delegating, prefer a matching registered custom role from `.codex/agents/`. Match the subtask against role descriptions: scout for local evidence, researcher for external evidence, strategist for solution trade-offs, planner for execution plans, implementer for changes, tester for verification, and documenter for documentation.
- Select the exact configured `name` through the spawn tool's role selector (`agent_type` in the current runtime). A `task_name`, skill invocation, or instruction to "act as scout" does not select the role.
- Let the role configuration supply model and reasoning; do not copy the parent's model or duplicate model mappings in prompts. Use a focused handoff rather than a full-history fork when the runtime supports it.
- Check the runtime's registered roles before spawning. If an expected role is unavailable, report it and continue suitable work locally; do not silently replace it with a generic agent. Use a generic role only when no custom role fits, and make that choice explicit.
- Verify the selected role from actual spawn arguments. Claim the effective model/effort only when runtime metadata confirms it; a TOML file or the child's self-description alone is not execution evidence.
