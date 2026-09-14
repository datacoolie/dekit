---
name: docs
description: Create and maintain end-user or public-facing documentation. Use for user guides, product docs, API consumer docs, onboarding docs, tutorials, release notes for users, and documentation meant to be read outside the engineering team.
---

# Docs

Write documentation for people who use, install, configure, operate, or consume the product. Internal architecture memory and agent-facing context belong to `wiki`.

## Route

- Keep README installation/quick-start/navigation concise; place deeper task/reference material under the established `docs/` convention.
- Route by audience and artifact purpose, not simply by whether the reader is an engineer.
- Document shipped behavior only. Verify commands, paths, config keys, API shapes, versions, permissions, examples, and links against source artifacts.
- Remove stale instructions instead of leaving “update later” notes.
- Use Mermaid when a complex flow, decision, or architecture becomes materially easier to understand; add a short explanation and keep it optional. See [artifacts.md](../../instructions/artifacts.md).

Keep internal implementation details out unless the user needs them to complete the task. Do not duplicate wiki knowledge; link across boundaries only when the audience can access it.

## Report

- Docs created or updated and intended audience.
- Source artifacts and user-visible behavior checked.
- Links/examples verified.
- Remaining gaps or unresolved questions.
