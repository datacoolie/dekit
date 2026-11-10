# Bug Fix Plan Selector

Use the shared [`plan-template.md`](plan-template.md) and add the relevant sections from [`scenario-sections.md`](scenario-sections.md):

- [`Diagnosis / bug`](scenario-sections.md#diagnosis--bug) for uncertain causes or regression investigation;
- [`Incident containment`](scenario-sections.md#incident-containment) when mitigation and permanent repair differ;
- [`Backfill / repair`](scenario-sections.md#backfill--data-repair) for bounded data correction or replay;
- [`Data pipeline`](scenario-sections.md#data-pipeline) for pipeline correctness or quality impact;
- [`Security`](scenario-sections.md#security) for trust-boundary or sensitive-data impact.

This file is a compatibility entry point, not a second plan contract. See [`template-usage-guide.md`](template-usage-guide.md).
