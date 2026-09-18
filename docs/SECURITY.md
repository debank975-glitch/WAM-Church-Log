# Security Notes

## Improvements made in this change

- Source files are separated into `src/js`, `src/css`, `assets`, and `docs`, reducing accidental edits to the application shell and making security-sensitive code easier to locate.
- Third-party libraries are pinned to explicit versions for more predictable builds. Unpinned `latest` URLs can silently change behavior or introduce a breaking dependency.
- The application now uses a tab-scoped session lock. A page reload or a new tab must authenticate before the ledger is displayed; signing out clears the session marker.
- The login PIN field declares `autocomplete="current-password"` so browsers and password managers can handle the credential field correctly.
- A strict referrer policy and a JavaScript-disabled fallback were added to reduce unnecessary information leakage and make failure behavior explicit.

## Important limitation

This remains a front-end-only demonstration. PINs, users, and financial records are still held in browser storage and the demo credentials are present in client code. Browser storage is not a security boundary: a user who can modify the page or storage can bypass this authentication and change records.

Do not use this version as the authoritative financial ledger. Before production use, move authentication, authorization, validation, financial calculations, audit logging, and persistence to a trusted server. Passwords/PINs must be stored only as slow, salted password hashes; permissions must be checked on every server request; and all ledger mutations must be attributable, reviewable, and backed up.
