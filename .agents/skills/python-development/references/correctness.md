# Python correctness

- Preserve distinct meanings for omitted values, `None`, and valid falsey values. Use an explicit sentinel when omission differs from `None`. Check defaults and truthiness fallbacks on update paths.
- Give mutable defaults, arguments, and nested collections the ownership their callers expect. Use factories for independent defaults. Check shallow copies for retained aliases and keep values that determine hashing stable.
- Check closures created in loops for late binding. Check whether an iterable is single-use before consuming it for logging, validation, or a second pass.
- Annotate interfaces where types clarify the contract. Validate untrusted data at the boundary. Preserve callable signatures and metadata when decorators are used for introspection.
- Release owned resources even on exceptions or cancellation. Scope files, connections, and executors with context managers or explicit cleanup. Make ownership explicit when returning an iterator or a callback that outlives its caller.
- Catch errors where code can handle or translate them. Preserve the cause when translating a lower-level error. Let the application configure logging so a reusable module can be imported without installing handlers or logging duplicate failures.
- Name domain values and side effects clearly. Document non-obvious contracts and preserve docstrings used by callers or tooling. Prefer readable control flow and review semantics when a lint fix changes evaluation order.

[Python programming FAQ](https://docs.python.org/3/faq/programming.html) · [Context managers](https://docs.python.org/3/library/contextlib.html) · [Function wrapper metadata](https://docs.python.org/3/library/functools.html#functools.wraps)
