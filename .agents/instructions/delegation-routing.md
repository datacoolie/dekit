# Delegation Routing

Read when selecting or changing a native or external executor, from any runner. Apply the [shared delegation policy](agent-operating-model.md#delegation).

- Select the route in this order: the user's current explicit request, the route already accepted for this work, then runner defaults. A selected route persists for that work until changed; a new implementation request alone does not select an external executor.
- Codex defaults to its native execution and registered roles. Other runners prefer the default external Codex route for bounded independent scout, review, scan, or test work; see [Codex delegation](codex-delegation.md#default-external-codex-route).
- An explicit request for "Codex API" selects the API route from any runner. Its home configuration takes precedence over the default external route's Luna/max restriction; see [Codex API](codex-delegation.md#codex-api).
- If an explicitly selected route cannot complete the work, report the constraint and preserve that route until fallback is authorized by an existing agreement or a new user decision. Reporting failure alone does not authorize switching. For the default external route, use a suitable native subagent for unresolved work; if none is suitable, work locally or report the constraint. Apply the shared partial-work recovery checks before retrying or switching.
- Keep executor-specific invocation rules in `<executor>-delegation.md`, regardless of the calling runner. Add an adapter when that executor is actually supported; routing does not imply availability.
