# Engineering Constraints

## Design

- Add a boundary, abstraction, or configuration only when the requested behavior needs it.
- Keep shared schemas, configuration, and business invariants canonical. Similar-looking code need not share an abstraction.
- Keep ingestion, transformation, validation, orchestration, and I/O responsibilities distinct where their contracts differ.
- Implementations of the same public contract must preserve equivalent semantics; verify allowed variation explicitly.
- Do not hide a required initialization or invariant failure behind an optional lookup/default. Getters, lazy access, and compatibility fallbacks are valid when their contract calls for them.
- Reuse the authoritative owner of state and business rules. Derived/cached state needs explicit derivation and lifecycle/invalidation; separate consumers need not share an abstraction merely because code looks similar.
- Respect component contracts rather than reaching into another component's private state. A wrapper or extension point needs a concrete role, such as invariant protection, adaptation, or a supported variation.

## Implementation

- Check existing patterns and equivalent modules before adding a file.
- Edit source in place; no side-by-side final/enhanced copies.
- Files over 200 lines signal a possible split, not an automatic failure. Split on meaningful boundaries.
- No placeholders, stub implementations, or fake success paths in shippable code.
- Keep task-related cleanup within authorized scope and verify it. For consequential changes to ownership, contracts, inheritance, or dependency direction, establish the structural outcome and approach before dependent edits; apply existing [authorization and decision-reopening rules](agent-operating-model.md#autonomy).

## Execution

When `<root>/.venv` exists, use it for Python commands and tools it provides. Do not substitute a global Python or another environment.

## Safety

- No secrets in source, artifacts, commits, or examples.
- Preserve user changes; never revert unrelated edits or bypass failing checks.
- Destructive filesystem, Git, database, or cloud operations require explicit authorization.

## Git

One commit contains one coherent change. Do not add AI attribution to commit messages.
