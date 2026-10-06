# Codex Delegation

Read when using native Codex subagents or calling Codex as an external executor from any runner. Apply [route selection](delegation-routing.md) and the [shared delegation policy](agent-operating-model.md#delegation).

## Native subagents

Applies when the coordinating runner is Codex.

- When delegating, prefer a matching registered custom role from `.codex/agents/`. Match the subtask against role descriptions: scout for local evidence, researcher for external evidence, strategist for solution trade-offs, planner for execution plans, implementer for changes, tester for verification, and documenter for documentation.
- Select the exact configured `name` through the spawn tool's role selector (`agent_type` in the current runtime). A `task_name`, skill invocation, or instruction to "act as scout" does not select the role.
- For independent plan critique, use a fresh strategist context with the plan-review assignment; do not reuse the plan author's context. Follow the canonical review gate in `.agents/instructions/verification.md`.
- Let the role configuration supply model and reasoning; do not copy the parent's model or duplicate model mappings in prompts. Use a focused handoff rather than a full-history fork when the runtime supports it.
- Check the runtime's registered roles before spawning. If an expected role is unavailable, report it and continue suitable work locally; do not silently replace it with a generic agent. Use a generic role only when no custom role fits, and make that choice explicit.
- Verify the selected role from actual spawn arguments. Claim the effective model/effort only when runtime metadata confirms it; a TOML file or the child's self-description alone is not execution evidence.

## External CLI sessions

- A `codex exec` session has its own context and does not select a native `.codex/agents/` role. Pass relevant plan checkpoints and accepted context using the shared handoff requirements; conversation history is not inherited.
- Set `-C <root>` explicitly. Default to `-s read-only`; use `-s workspace-write` for assigned edits or generated test artifacts. The coordinator reviews the actual diff and execution evidence and completes required verification.

### Default external Codex route

For bounded independent work delegated by a non-Codex runner, allow only `gpt-6-luna` with `model_reasoning_effort=max`; use `gpt-5.6-luna` with the same effort if GPT-6 Luna is unavailable. Do not silently substitute another model or effort.

```text
codex exec -C "<root>" -m gpt-6-luna -c model_reasoning_effort=max -s read-only "<bounded task and evidence contract>"
```

### Codex API

- Activate this route when the user requests "Codex API" or explicitly selects it.
- Run a separate `codex exec` session with `CODEX_HOME` resolved to `~/.codex-api`. Set it only for the child process or an isolated shell; restore the previous value if reusing a shell. Use that home's configured provider, model, and effort without prompt-level overrides unless requested.

Implementation example in an isolated PowerShell process (replace placeholders):

```powershell
$env:CODEX_HOME = "$HOME\.codex-api"
codex exec -C "<root>" -s workspace-write "<assigned implementation and evidence contract>"
```
