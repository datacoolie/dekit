# Subagent Model Routing

Use `.codex/agents/` defaults when `gpt-5.6-sol` is available.

## Terra And Luna Fallback

Use this matrix only when Sol is unavailable:

| Agent | Model | Effort |
|---|---|---|
| scout | gpt-5.6-terra | medium |
| researcher | gpt-5.6-terra | high |
| strategist | gpt-5.6-terra | xhigh |
| planner | gpt-5.6-terra | xhigh |
| implementer | gpt-5.6-terra | high |
| tester | gpt-5.6-terra | high |
| documenter | gpt-5.6-luna | high |

Escalate only when needed:

- Researcher: Terra xhigh for conflicting sources or high-stakes research.
- Strategist: Terra max for hard-to-reverse architecture.
- Planner: Terra max for migrations or cross-system work.
- Implementer: Terra xhigh for complex work or a failed first attempt.
- Tester: remain on Terra high.

This is an orchestration policy; custom-agent TOMLs do not switch models automatically. Do not create duplicate fallback agent files. If a custom agent is pinned to unavailable Sol, delegate through an available Terra/Luna agent and include the original role boundary and required skill.
