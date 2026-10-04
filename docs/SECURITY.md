# Security Notes

## Improvements made in this change

- Source files are separated into `src/js`, `src/css`, `assets`, and `docs`, reducing accidental edits to the application shell and making security-sensitive code easier to locate.
- Third-party libraries are pinned to explicit versions for more predictable builds. Unpinned `latest` URLs can silently change behavior or introduce a breaking dependency.
- Authentication now runs on the server, with separate admin and user login flows, a single-admin invariant, a one-time administrator setup code, server-side sessions, forced first-login password changes, and audit events.
- Passwords and setup codes are stored only as salted `scrypt` hashes. Raw credentials are never written to browser storage or SQLite.
- The browser sends only an HTTP-only session cookie; it does not select users or validate credentials locally.
- A strict referrer policy and a JavaScript-disabled fallback were added to reduce unnecessary information leakage and make failure behavior explicit.

## Important limitation

Authenticated ledger state is stored as one shared church ledger on the configured backend and synchronized from the browser. Browser storage remains only as a local fallback/cache. The current API accepts a complete shared ledger snapshot from an authenticated session; production financial controls should still add server-side field-level validation, immutable transaction records, approval workflows, and authorization checks for each mutation.

Set a strong random `SESSION_SECRET` and a private `ADMIN_SETUP_CODE` in the deployment environment. Never commit `.env` or expose temporary passwords in API responses. Final passwords must be at least 12 characters, and rate limiting should remain enabled on all authentication endpoints.
