# Python application design

## Choose a boundary for a concrete need

- Start from the actual variation. Use a callable or dispatch table for interchangeable algorithms. Use explicit transitions for state-dependent behavior. Use a factory when construction varies or an adapter when an external interface needs translation. Let the consumer's contract shape a protocol when implementations really need to be interchangeable.
- Keep business rules where use cases can share them across entrypoints. Add a service when workflow coordination needs an owner. Add a repository when persistence has a meaningful contract or a real substitution point. For a domain with interacting invariants, choose which state must remain consistent together before defining an aggregate.
- Wire concrete dependencies at an entrypoint. For shared state, identify its owner, synchronization, and cleanup. A module global or singleton still needs those decisions. Give caches an invalidation policy and a lifetime.
- Test the shared contract across implementations, including relevant failure behavior. Use focused tests for state transitions and test the real adapter when persistence or concurrency semantics matter.

## Transactions

- Assign one owner to begin, commit, and roll back each atomic use case. Data access inside that boundary must participate in the same transaction. A direct transaction context may be sufficient.
- Scope mutable transaction state to the operation that owns it. Release it on failure and materialize results before that scope ends if callers need them afterward. Verify consistency under concurrent writes using the relevant constraints, conditional updates, locking, or isolation.

## Delivery and read models

- If the application dispatches commands or events, define who handles them, in what order when order matters, and how failures are surfaced. Keep public event schemas compatible with their consumers.
- Define what acknowledgement means and how retries and duplicate delivery affect state. When a database write and publication must survive a crash together, consider a transactional outbox. Database rollback cannot retract external effects.
- Consider a separate read projection when query needs diverge from the write model. Define acceptable lag and how to rebuild it.
