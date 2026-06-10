---
title: "[Feature Name] Implementation Plan"
description: "Brief 1-2 sentence description of the feature and its business value."
status: planning
priority: P2
effort: TBD
branch: TBD
tags: [feature, data-engineering]
blockedBy: []
blocks: []
created: YYYY-MM-DD
---

# [Feature Name] Implementation Plan

## Executive Summary
Brief 2-3 sentence description of the feature and its business value.

## Context Links
- **Related Plans**: [List other plan files - no full content]
- **Dependencies**: [External systems, APIs, existing features]
- **Reference Wiki**: [Link to internal wiki pages in ./wiki]
- **User Docs**: [Link to user-facing docs in ./docs, if relevant]

## Requirements
- [ ] Functional: Requirement 1
- [ ] Functional: Requirement 2
- [ ] Performance target
- [ ] Security requirement

## Architecture Overview
```mermaid
[Simple component diagram]
```

### Key Components
- **Component 1**: Brief description
- **Component 2**: Brief description

### Data Models / Schema
- **Source**: [source system, table/API, key columns]
- **Target**: [layer_domain_entity, grain, partition key]
- **SCD Strategy**: [Type 1 / Type 2 / Append-only / N/A]

## Data Flow
- **Source → Bronze**: [transfer pattern, scope, frequency]
- **Bronze → Silver**: [transformation logic summary]
- **Silver → Gold**: [aggregation / business rules summary]

## Implementation Phases

### Phase 1: [Name] (Est: X days)
**Scope**: Specific boundaries
**Tasks**:
1. [ ] Task 1 - file: `pipelines/bronze/ingest_orders.py`
2. [ ] Task 2 - file: `pipelines/silver/transform_orders.py`

**Acceptance Criteria**:
- [ ] Criteria 1
- [ ] Criteria 2

### Phase 2: [Name] (Est: X days)
[Repeat structure]

## Testing Strategy
- **Unit Tests**: Transformation logic (pure functions)
- **Integration Tests**: Schema validation, row count reconciliation
- **E2E Tests**: End-to-end pipeline run, idempotency verification

## Quality Gates
Per `.instructions/data-engineering-constraints.md`: row count, schema, uniqueness, freshness, and reconciliation checks at each layer boundary.

## Promotion / Approval Gates
| Boundary | Evidence Required | Reviewer / Owner | Decision |
|---|---|---|---|
| Source → Bronze | Ingestion contract, schema, row count, freshness, reconciliation | [owner] | [pending/approved/blocked] |
| Bronze → Silver | Deduplication, business rules, schema, reconciliation | [owner] | [pending/approved/blocked] |
| Silver → Gold | Metric definitions, aggregates, consumer checks | [owner] | [pending/approved/blocked] |

Do not begin downstream implementation when the prior boundary has an unresolved required gate, except isolated scaffolding.

## Security Considerations
- [ ] PII columns identified and tagged
- [ ] No credentials in code — secrets manager only
- [ ] Column-level access control for sensitive data

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk 1 | High | Mitigation strategy |

## TODO Checklist
- [ ] Phase 1 Task 1
- [ ] Phase 1 Task 2
- [ ] Phase 2 Task 1
- [ ] Testing complete
- [ ] User-facing docs updated, if relevant
- [ ] Wiki updated when technical knowledge changed
- [ ] Code review passed
