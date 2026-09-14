# Scenario Sections

Add only the sections that match the task. These prompts extend [`plan-template.md`](plan-template.md); they do not replace its core contract.

## Selection Map

| Scenario | Add when |
|---|---|
| [Diagnosis / bug](#diagnosis--bug) | Cause or fix is uncertain, or a regression needs a bounded investigation |
| [Incident](#incident-containment) | Immediate mitigation and later repair have different urgency or owners |
| [Data pipeline](#data-pipeline) | Source, target, transformations, or data quality are in scope |
| [Migration / cutover](#migration--cutover) | Consumers, contracts, versions, or rollout order change |
| [Backfill / repair](#backfill--data-repair) | Existing data is recomputed, corrected, or replayed |
| [Refactor](#refactor) | Structure changes while behavior should remain equivalent |
| [Performance / cost](#performance--cost) | Runtime, volume, latency, or spend is a target |
| [Tooling / instructions / docs](#tooling--instructions--docs) | Developer workflow, agent guidance, or documentation changes |
| [Security](#security) | Trust boundary, secrets, access, privacy, or threat exposure changes |

## Diagnosis / Bug

- Reproduction: [input, environment, observed result, expected result]
- Hypotheses: [H1, H2, …]
- Distinguishing checks: [what would confirm or reject each hypothesis]
- Transition to implementation: [evidence required; root cause may remain unknown if diagnosis is the requested outcome]
- Regression check: [behavior that must remain unchanged]

## Incident Containment

- Immediate mitigation: [bounded authorized action]
- Impact and time window: [affected users/data/systems]
- Evidence needed before recovery or rollout: [checks]
- Permanent repair: [separate follow-up or later phase]
- Follow-up owner and deadline: [if applicable]

## Data Pipeline

Read [`data-engineering-constraints.md`](../../.agents/instructions/data-engineering-constraints.md) and fill only applicable fields:

- Source → target and grain: [mapping and ownership]
- Load/change pattern: [full / append / merge / CDC; detection and replay window]
- Schema evolution: [additive handling or breaking-change gate]
- Idempotency and quality: [stable key/watermark; required checks]
- Partition/file format: [only when relevant]
- Runtime/freshness/cost target: [baseline and target when recurring]
- Layer promotion: [boundary, evidence, owner, decision]

## Migration / Cutover

- Compatibility contract and consumers: [versions, readers, writers]
- Rollout order: [sequence and dependency]
- Cutover criteria: [observable checks]
- Point of no return: [condition]
- Rollback or roll-forward: [what remains possible, prerequisites, and owner]
- Deprecation/communication: [if applicable]

## Backfill / Data Repair

- Bounded scope: [dataset, partitions, keys, and time range]
- Dry run: [preview and expected impact]
- Replay/checkpoint: [resume marker and rerun safety]
- Reconciliation: [counts, keys, measures, schema]
- Recovery: [restore or roll-forward path; permissions and backup/checkpoint prerequisite]
- Resource guardrails: [rate, window, concurrency, cost]

## Refactor

- Invariants: [outputs, contracts, side effects, ordering, idempotency]
- Current baseline: [representative behavior and performance]
- Structural changes: [modules, interfaces, dependencies]
- Equivalence checks: [tests and representative results]
- Compatibility/deprecation: [if applicable]

## Performance / Cost

- Representative workload: [volume, distribution, concurrency, environment]
- Baseline: [latency, throughput, freshness, resource/cost measure]
- Target and guardrails: [improvement plus correctness limits]
- Benchmark method: [repeat count and comparison]
- Regression threshold: [when to stop or revert]

## Tooling / Instructions / Docs

- Before/after behavior: [what users or agents do differently]
- Affected consumers: [commands, runners, skills, docs, teams]
- Verification: [link/path checks, fixture, eval, or rendered output]
- Compatibility: [legacy path or terminology retained, redirected, or deprecated]
- Publication/release: [only if in scope]

## Security

- Trust boundary and assets: [what changed]
- Threats and sensitive data: [relevant risks]
- Controls: [least privilege, secrets, validation, logging, encryption]
- Verification: [threat-specific check or review]
- Residual risk and owner: [if applicable]
