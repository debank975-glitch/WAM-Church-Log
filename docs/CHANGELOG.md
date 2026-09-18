# Change Log

## 2026-09-18

- Replaced browser-only PIN authentication with a Node.js/Express authentication API.
- Added SQLite persistence for users, hashed passwords, sessions, invitation codes, and audit events.
- Added one-time administrator setup protected by `ADMIN_SETUP_CODE`.
- Added administrator-generated, expiring, single-use user invitation codes with optional SMTP delivery.
- Added separate administrator and user login/registration panels to the frontend.
- Standardized invalid login responses to `Wrong Username or Password`.
- Added deployment and security documentation in `docs/AUTHENTICATION.md`.
- Upgraded Nodemailer to `10.0.10`; production dependency audit is clean.

The financial ledger records remain browser-local in this increment. Moving ledger mutations and reporting to the server is required before production use.
