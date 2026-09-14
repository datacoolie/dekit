---
title: "Context continuity research"
type: research
status: active
summary: "Local and external evidence supporting selective durable notes and plan-independent session resume."
tags: [context, research, resume]
sources:
  - https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
  - https://docs.arc42.org/section-9/
  - https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
updated: 2026-09-14
evidence_scope: "dekit instructions, skills, adapters, templates, and helper tests inspected on 2026-09-14"
---

# Context continuity research

## Local findings before this implementation

- The operating model had a major-change threshold for wiki comparison and prohibited reading the wiki during the initial completion assessment; this did not cover small durable updates during discovery or delivery.
- The artifact contract and template guide treated completed plans as historical artifacts, which conflicted with the user's requirement that plans may be deleted manually at any time.
- Scout already reports local files, symbols, callers, tests, configuration, generated paths, and search blind spots as read-only evidence. Research handles external facts; brainstorm handles framing and trade-offs.
- Wiki helpers recursively search Markdown and preserve optional/legacy metadata; their rankings are not verification.

## External evidence

- Anthropic's context-engineering guidance describes finite attention, just-in-time retrieval, structured note-taking, and compact handoffs for long-horizon work. It supports keeping small durable identifiers and loading relevant context on demand rather than replaying complete histories. [Source](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Anthropic's long-running-agent guidance describes initializer/progress artifacts, incremental work, clean handoffs, and explicit testing because a fresh session otherwise guesses state or declares completion early. [Source](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- arc42 recommends documenting important decisions with context, status, consequences, alternatives, and rationale while avoiding redundant text. [Source](https://docs.arc42.org/section-9/)
- Nygard's ADR pattern preserves why a consequential choice was made so later changes do not discard motivation. [Source](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

## Synthesis for dekit

Use a shallow wiki with purpose-based areas, capture meaningful knowledge at decision and verification boundaries, and keep execution state in disposable plans. Source/config/tests establish what is implemented; wiki preserves intent, rationale, and routing. This is a design inference for dekit, not a measured claim about model quality or token cost.

## Limits

No representative fresh-session benchmark or with/without-wiki comparison is available. Resume accuracy, context cost, and model-quality effects remain unmeasured.

## Post-implementation check

The dekit implementation now follows the synthesis above. The 2026-09-14 helper and static checks passed as recorded in [`../specs/wiki-continuity.md`](../specs/wiki-continuity.md); this confirms artifact compatibility, not a behavioral quality or cost improvement.
