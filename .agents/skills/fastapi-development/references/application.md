# FastAPI application

## Composition

- For a new standalone app, default to `app/main.py` exporting `app`. Preserve established import packages and launch targets. Make the actual ASGI target, such as `app.main:app`, agree across local commands, tests, and deployment. Use an app factory when composition or test isolation needs it. If the project uses a compatible FastAPI CLI, it can record the target in `[tool.fastapi]`.
- A tiny app can register routes directly. When splitting routes, include an `APIRouter` for the [business API prefix](http-contracts.md#versioning-and-compatibility). Give each prefix segment one owner in the router chain. Organize code by version or domain as the project needs. Keep HTTP parsing, serialization, and error mapping at the HTTP boundary so reusable application code can run without HTTP objects.

[FastAPI router composition](https://fastapi.tiangolo.com/tutorial/bigger-applications/) · [FastAPI CLI entrypoints](https://fastapi.tiangolo.com/fastapi-cli/)

## Settings and dependencies

- Validate settings required to serve traffic before accepting it. For a Pydantic v2 stack, `pydantic-settings` is an option. If using local env files, make their path and precedence explicit and provide only non-secret examples.
- Prefer `Annotated[T, Depends(...)]` in new code where supported. FastAPI can reuse a dependency result within a request. Check the dependency graph, scope, and `use_cache` where reuse affects behavior. Keep business writes at an explicit operation boundary.
- Prefer lifespan for new apps to acquire and release shared resources such as clients and model handles. Before adding lifespan to an existing app, account for legacy startup and shutdown handlers. Passing lifespan replaces those handlers. Acquire resources inside their owning process or event loop and clean up after partial startup failure.
- Give acquired request resources a cleanup path with a context manager or `yield` dependency. Teardown timing changed across FastAPI releases. On releases supporting `Depends(scope=...)`, function scope exits before sending the response and request scope exits after it. Check the pinned release and actual resource lifetime before using a dependency in a streaming response.

[Pydantic settings](https://pydantic.dev/docs/validation/latest/concepts/pydantic_settings/) · [FastAPI lifespan](https://fastapi.tiangolo.com/advanced/events/) · [Dependency scopes](https://fastapi.tiangolo.com/advanced/advanced-dependencies/#dependencies-with-yield-and-scope)

## Verify wiring

- Use `TestClient` as a context manager for synchronous tests that rely on lifespan. When using an async client with ASGI transport to share loop-bound resources, start and stop lifespan explicitly.
- Use test-only configuration and data. Restore dependency overrides after each test, including failure paths. Exercise the actual startup and shutdown path when the change affects resource ownership.

[FastAPI async tests](https://fastapi.tiangolo.com/advanced/async-tests/) · [Dependency overrides](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
