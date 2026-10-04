# Change Log

## 2026-09-18

- Replaced browser-only PIN authentication with a Node.js/Express authentication API.
- Added SQLite persistence for users, hashed passwords, sessions, invitation codes, and audit events.
- Added one-time administrator setup protected by `ADMIN_SETUP_CODE`.
- Replaced invitation-code registration with administrator-created delegated accounts and forced first-login password changes.
- Added separate administrator and user login/registration panels to the frontend.
- Standardized invalid login responses to `Wrong Username or Password`.
- Added deployment and security documentation in `docs/AUTHENTICATION.md`.
- Upgraded Nodemailer to `10.0.10`; production dependency audit is clean.

Ledger snapshots are now synchronized per authenticated user to the backend, with PostgreSQL/Supabase support for deployment. Field-level server validation and immutable financial transaction APIs remain recommended for a stricter production control model.
