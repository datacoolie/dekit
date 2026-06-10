---
name: docs
description: Create and maintain end-user or public-facing documentation. Use for user guides, product docs, API consumer docs, onboarding docs, tutorials, release notes for users, and documentation meant to be read outside the engineering team.
---

# Docs

Use this skill for user-facing documentation.

Do not use this skill for internal technical memory, architecture notes, contracts, runbooks, or agent-facing project context. Use the `wiki` skill for those.

## Intent Routing

- Create docs when users need to understand, install, configure, operate, or consume the product.
- Update docs when shipped behavior, UI, APIs, configuration, or public workflows change.
- Review docs when wording, accuracy, completeness, examples, or user flow may be unclear.
- If the audience is engineers or AI runners maintaining the project, use `wiki` instead.

## Layout

Use `docs/` unless the project already has a public documentation convention.

`README.md` is the project entrypoint. Keep installation, quick start, and navigation there. Move deeper or audience-specific material into `docs/`.

Common pages:

- `docs/index.md`: entrypoint and reading order.
- `docs/getting-started.md`: first successful user path.
- `docs/configuration.md`: public configuration and environment options.
- `docs/api.md`: public API, CLI, or integration contract.
- `docs/concepts/`: concepts users need before operating the product.
- `docs/how-to/`: task-oriented workflows.
- `docs/reference/`: API, CLI, file format, or integration reference.
- `docs/tutorials/`: task-oriented guides.
- `docs/troubleshooting.md`: known user-facing failures and fixes.
- `docs/release-notes.md`: user-visible changes.

## Accuracy Rules

- Document shipped behavior, not planned behavior.
- Verify paths, commands, config keys, screenshots, examples, and API shapes against source artifacts.
- State version, platform, environment, or permission assumptions when they affect the reader.
- Prefer task-oriented pages over implementation narratives.
- Keep internal implementation details out unless users need them.
- Link to internal wiki only when the target audience can access it and the detail is appropriate.
- Remove stale docs instead of marking them "update later".
- Verify links, examples, commands, and public terminology before reporting done.

## Report

- Docs created or updated.
- Source artifacts checked.
- User-facing behavior covered.
- Remaining gaps or unresolved questions.
