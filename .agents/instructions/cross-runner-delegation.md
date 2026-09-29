# Cross-Runner Delegation

Read only when running outside Codex and considering a delegated, independent subtask. Apply the shared policy in `agent-operating-model.md` first.

- Prefer a local `codex exec` session for bounded independent work (for example scout, review, scan, or test) when the CLI is available. This is a separate Codex session, not a native subagent and not a selector for `.codex/agents/` roles.
- Allow only `gpt-6-luna` with `model_reasoning_effort=max`; use `gpt-5.6-luna` with the same effort if GPT-6 Luna is unavailable. Do not silently substitute another Codex model or effort.
- Pass a focused task, affected paths, edit boundary, acceptance criteria, and required evidence. Tell the Codex session to work directly without spawning further agents to avoid bypassing the Luna-only boundary. Do not pass the full conversation, secrets, or unrelated files. Retain synthesis and consequential decisions with the parent runner.
- Set `-C <root>` explicitly. Default to `--sandbox read-only`. Use `workspace-write` only for explicitly assigned edits or generated test artifacts with clear path ownership; check the diff afterward.
- If `codex exec` is unavailable, unauthenticated, rejected by permissions, unsuitable, or returns insufficient evidence, use the runner's matching native subagent for the unresolved work. If neither is suitable, work locally or report the constraint; do not imply delegation occurred.
- Verify returned file references, findings, commands, and test results before using them. Do not claim cost savings without measured evidence.

Example (replace placeholders and select one allowed model):

```text
codex exec -C "<root>" -m gpt-6-luna -c model_reasoning_effort=max -s read-only "<bounded task and evidence contract>"
```
