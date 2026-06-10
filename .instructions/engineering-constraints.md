# Engineering Constraints

## Design

- KISS: choose the simplest design that meets the requirement.
- YAGNI: no speculative flags, layers, parameters, or future-proofing.
- DRY knowledge, not shapes. Keep one source of truth for schemas, config, and business rules.
- Prefer composition over inheritance.
- Keep ingestion, transformation, validation, orchestration, and I/O concerns separate.
- Code that changes together lives together; unrelated modules communicate through explicit contracts.

## SOLID

- Single Responsibility: each module, function, notebook, or job owns one reason to change.
- Open/Closed: extend behavior through new strategies, config, or adapters rather than editing stable core logic.
- Liskov Substitution: implementations of the same contract must be interchangeable without caller special cases.
- Interface Segregation: expose narrow contracts; do not force callers to depend on methods or fields they do not use.
- Dependency Inversion: business logic depends on abstractions or injected dependencies, not hard-wired services, paths, clients, or connectors.

## Implementation

- Read existing patterns before creating new ones.
- Check for an equivalent module before adding a file.
- Edit source files in place. Do not create side-by-side "new", "enhanced", or "final" variants.
- Files over 200 lines are a split signal, not an automatic failure. Split only on real boundaries.
- Use descriptive names. Avoid clever code that needs a comment to be understood.
- Comments explain why, not what.
- No placeholders, stubs, TODO implementations, or fake success paths in shippable code.

## Safety

- No secrets in code, wiki pages, docs, tests, commits, or examples.
- Do not bypass failing tests or quality checks.
- Do not perform destructive filesystem, git, database, or cloud operations without explicit approval.
- Preserve user changes. Never revert unrelated edits.

## Git

- One commit = one coherent change.
- Do not include AI attribution in commit messages.
