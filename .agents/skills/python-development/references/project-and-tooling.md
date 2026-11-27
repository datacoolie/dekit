# Python project and tooling

## Layout and execution

- Preserve the installed import names and documented entrypoints. For a new distributable package, prefer a configured `src/<package>/` layout to catch accidental imports from the checkout. A flat package can suit a standalone app. Import the declared package name and check for local modules that shadow dependencies or the standard library.
- Test the documented script, console command, or module invocation in its intended environment. For a CLI, preserve its exit codes and stdout/stderr contract. When introducing or repairing an entrypoint, test it without incidental working-directory behavior or ad hoc path injection. Keep established supported launch commands while fixing imports.
- Keep external connections, file writes, and job startup out of incidental imports. Put initialization behind the entrypoint or resource lifecycle that owns it.
- If the project loads runtime settings, give required values a validation boundary and make source precedence explicit.

[PyPA layout guidance](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/) · [PyPA entry points](https://packaging.python.org/en/latest/specifications/entry-points/)

## Environments, dependencies, and artifacts

- Distinguish the interpreter used for development from the supported range in `requires-python`. Pick syntax, standard-library APIs, and dependency versions that work on the supported runtimes. Verify the affected advertised versions and platforms before claiming compatibility.
- Use the project's dependency workflow. For a new managed app, `pyproject.toml` with uv is an option when it fits the deployment environment. If the project uses uv and commits `uv.lock`, use `--locked` where CI must fail on lock drift. Regenerate the lock with uv when changing dependencies. A library's downstream resolver uses its published dependency metadata.
- For a packaging change, build the actual distribution artifact. Check the wheel's `Requires-Python`, `Requires-Dist`, compatibility tags, and included data as applicable. Install it into a clean environment and verify imports and entrypoints from outside the checkout. Exercise source builds too when consumers use the source distribution.

[PyPA core metadata](https://packaging.python.org/en/latest/specifications/core-metadata/) · [Wheel format](https://packaging.python.org/en/latest/specifications/binary-distribution-format/) · [uv locking and syncing](https://docs.astral.sh/uv/concepts/projects/sync/)

## Diagnostics

- Use the project's configured formatter, linter, type checker, and CI commands. For a wemake-python-styleguide diagnostic, check the installed version, enabled rule, and configuration read by the actual Flake8 invocation. If settings appear only under `[tool.flake8]`, check which integration reads that table.
- Preserve behavior and public signatures while fixing diagnostics. If a rule warrants an exception, keep the suppression narrow and explain the reason. Use the interpreter and test matrix relevant to the affected contract.

[Flake8 configuration](https://flake8.pycqa.org/en/latest/user/configuration.html)
