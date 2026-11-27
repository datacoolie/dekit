# FastAPI HTTP contracts

## Versioning and compatibility

- Default new client-facing business APIs to `/api/v1/<resource>`. Preserve existing routes and deliberate project versioning schemes. Give operational endpoints their own paths as required by deployment.
- Version the HTTP contract independently of application releases. Compare affected consumers, OpenAPI, and runtime behavior before changing published paths, fields, status codes, permissions, or semantics. Additive fields and enum values can still break strict clients. For an incompatible change, follow the project's approved versioning and deprecation path and preserve active contracts.
- Keep version-specific schemas and mappings at the HTTP boundary. Reuse the application operation where business behavior is the same. Represent intentional changes in business behavior explicitly.
- Keep route order unambiguous when static and parameterized routes overlap. When paginating, bound page size and define stable ordering and tie breaks.

[FastAPI route priority](https://fastapi.tiangolo.com/tutorial/path-params/#order-matters)

## Schemas, updates, and failures

- Use version-matched Pydantic APIs and model request constraints before adding custom validators. Keep database lookups and other external I/O outside schema validation. Choose the policy for unknown fields, coercion, time zones, precision, and aliases as part of the public contract.
- For partial updates, distinguish omitted fields from explicit null and falsey values. With Pydantic v2, `model_dump(exclude_unset=True)` yields supplied fields. Apply only fields the caller may change. Validate the merged state when invariants span fields because `model_copy(update=...)` does not validate the update.
- Declare the output contract with a return model or `response_model`. Use separate input and output fields when their contracts differ. Returning a raw `Response` bypasses normal response-model validation and filtering, so explicitly shape it for public consumption.
- Translate expected domain failures into the documented status and error shape. Return a sanitized failure for unexpected errors. Consider RFC 9457 when designing a new interoperable error format.
- For an asynchronous job API, document what acceptance means, how the caller finds status and results, and the terminal, retry, expiry, or cancellation behavior you actually support. A `202 Accepted` response can acknowledge admission while work remains pending.

[FastAPI body updates](https://fastapi.tiangolo.com/tutorial/body-updates/) · [Pydantic model API](https://pydantic.dev/docs/validation/latest/api/base_model/#pydantic.BaseModel.model_copy) · [Response models](https://fastapi.tiangolo.com/tutorial/response-model/) · [Problem details](https://www.rfc-editor.org/rfc/rfc9457.html)

## Verify the public contract

- Compare the affected OpenAPI operations with actual requests and responses, including errors and auth where applicable. Preserve operation IDs relied on by generated clients. Exercise unintended prefixes when changing router composition.
- For changed update or output schemas, test omitted, null, falsey, and invalid values as applicable. Check that responses withhold private fields and that update permissions apply to supplied fields.
