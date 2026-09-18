# Security Notes

## Improvements made in this change

- Source files are separated into `src/js`, `src/css`, `assets`, and `docs`, reducing accidental edits to the application shell and making security-sensitive code easier to locate.
- Third-party libraries are pinned to explicit versions for more predictable builds. Unpinned `latest` URLs can silently change behavior or introduce a breaking dependency.
- Authentication now runs on the server, with separate admin and user login flows, a single-admin invariant, one-time setup/invitation codes, server-side sessions, and audit events.
- Passwords and invitation/setup codes are stored only as salted `scrypt` hashes. Raw credentials are never written to browser storage or SQLite.
- The browser sends only an HTTP-only session cookie; it does not select users or validate credentials locally.
- A strict referrer policy and a JavaScript-disabled fallback were added to reduce unnecessary information leakage and make failure behavior explicit.

## Important limitation

The financial ledger itself is still a client-side prototype and remains in browser storage. That storage is not authoritative and must not be treated as a secure system of record. The authentication API protects account access, but production use still requires moving ledger persistence and authorization checks for every financial mutation to the server.

Set a strong random `SESSION_SECRET`, a private `ADMIN_SETUP_CODE`, and SMTP credentials in the deployment environment. Never commit `.env` or expose setup/invitation codes in production API responses. Passwords must be at least 12 characters, and rate limiting should remain enabled on all authentication endpoints.
