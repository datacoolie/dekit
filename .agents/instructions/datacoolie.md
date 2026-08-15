# Datacoolie Projects

Use for any datacoolie project lifecycle task.

## Skills

Lifecycle: `discover -> design -> build -> provision -> release`.

If the `datacoolie-*` skills are unavailable:

```bash
npx skills add datacoolie/datacoolie
```

## Workspace First

Before running a lifecycle skill for a new project:

1. Resolve the workspace as `<project_name>_dcws` unless the user provides another path.
2. Create the workspace and download its datacoolie `AGENTS.md`.
3. Enter the workspace and keep all lifecycle work scoped to it.

```bash
project_name="sales_analytics"
workspace_name="${project_name}_dcws"
mkdir -p "${workspace_name}"
curl -o "${workspace_name}/AGENTS.md" https://raw.githubusercontent.com/datacoolie/datacoolie/main/ai/AGENTS.md
cd "${workspace_name}"
```

Take note:

- Preserve an existing workspace and its `AGENTS.md` unless the user requests replacement.
