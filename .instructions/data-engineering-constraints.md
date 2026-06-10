# Data Engineering Constraints

Apply to pipelines, Spark, SQL, notebooks, data models, metadata, orchestration, and quality checks.

## Correctness

- Pipelines must be idempotent: rerun without duplicate outputs or unintended side effects.
- Design for at-least-once execution; deduplicate at stable keys or watermarks.
- Use atomic writes or transactional table operations where available.
- Do not rely on "runs only once".
- Every table or dataset must have an explicit grain and ownership boundary.

## Schema

- Define explicit schemas at ingestion and contract boundaries.
- Additive schema changes are preferred.
- Renames, drops, type narrowing, or grain changes are breaking changes.
- Validate schema before writing downstream outputs.
- Track schema changes in metadata, contracts, or wiki pages when they affect consumers.

## Quality Gates

At layer boundaries, verify at minimum:

- Row count is present and within expected tolerance.
- Required columns exist with expected types.
- Primary or natural keys meet uniqueness expectations.
- Freshness is inside the expected window.
- Critical business measures reconcile to source or prior layer.

Fail fast for critical pipelines. Quarantine bad records only when the pipeline is designed to continue safely.

## Layer Promotion Gates

Stage completion does not imply approval to continue.

For staged delivery such as `source -> bronze`, `bronze -> silver`, and `silver -> gold`, define a promotion gate at each boundary when downstream work depends on correctness of the previous layer.

Each gate must state:

- Stage or layer boundary.
- Required evidence: schema check, row counts, reconciliation, freshness, and quality results relevant to that layer.
- Reviewer or approval owner when human review is required.
- Decision: approved, changes required, or blocked.
- Next stage allowed only after the gate decision is recorded.

Do not start downstream implementation when the current stage has an unresolved required gate, except for isolated scaffolding that cannot affect the gated output.

## Modeling

- Facts must state grain, keys, measures, and late-arriving behavior.
- Dimensions must state key strategy and SCD behavior.
- Bridges and many-to-many joins require explicit justification.
- Metrics must define numerator, denominator, filters, and time basis.

## Performance

- Partition by read pattern and lifecycle, not convenience.
- Avoid over-partitioning. Spark target file size is usually 128-256 MB unless local standards differ.
- Prefer set-based SQL/DataFrame operations over row-wise logic.
- Baseline runtime, volume, freshness, and cost for recurring jobs.

## Security

- Tag PII and sensitive columns.
- Use least-privilege access.
- Encrypt data at rest and in transit when the platform supports it.
- Use synthetic, masked, or anonymized data outside production.
- Store credentials in secret managers or injected environment, never in source.
