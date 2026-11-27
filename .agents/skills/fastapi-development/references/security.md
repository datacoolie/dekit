# FastAPI HTTP security

- Authenticate callers where required. Authorize each action on the actual resource. Apply tenant or ownership restrictions in reads and writes, including job status, results, downloads, retrieval, and cache access. Test with an authenticated caller who lacks permission. Keep authorization active for those tests.
- Use the project's identity provider and maintained validation libraries. For JWTs, verify the signature with trusted keys and a configured algorithm allowlist. Require the claims needed by the trust contract, including expiry and applicable issuer and audience. Exercise rotation if you handle keys locally.
- For bearer authentication failures, use the applicable `WWW-Authenticate` challenge. Choose forbidden or concealed-not-found behavior according to the disclosure policy. For cookie-based login, check cookie attributes, expiry, and CSRF protections.
- Configure CORS for the actual origins and credentials in use. Require server-side access controls regardless of CORS or docs visibility. Apply access controls to docs themselves if the contract restricts them.
- For user-directed fetches, enforce the outbound network policy for resolved destinations and redirects. For uploads, bound encoded and decoded sizes, check actual content as needed, and control storage paths and subprocess arguments. Bound admission to sensitive or expensive operations.
- Use least-privilege credentials and redact secrets and sensitive payloads at HTTP and logging boundaries.

[JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html) · [OAuth bearer challenges](https://www.rfc-editor.org/rfc/rfc6750.html) · [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
