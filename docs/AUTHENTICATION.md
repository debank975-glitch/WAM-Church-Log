# Server authentication

1. Copy `.env.example` to `.env` and replace `SESSION_SECRET` and `ADMIN_SETUP_CODE` with long random values. There are no default credentials.
2. Run `npm install`, then `npm start`. The existing `index.html` and frontend assets are served unchanged.
3. Create the sole administrator with `POST /api/auth/admin/setup` using `{ "username", "email", "password", "setupCode", "displayName" }`. The setup code is never persisted and registration is rejected after an admin exists. The legacy `/api/auth/admin/register` alias remains available.
4. An authenticated admin creates delegated accounts directly with `POST /api/auth/admin/users` using `{ "username", "password", "permissions", "email", "displayName" }`. The account receives the default role title `Delegated Officer`. The initial password is stored only as a salted hash and the user must choose a new password at first sign-in.
5. Users log in at `POST /api/auth/user/login`. A first-login account must complete `POST /api/auth/change-password` with a new password of at least 12 characters before ledger access is allowed.

## Frontend-friendly API

All JSON responses use `{ "user": ... }` on success and `{ "error": "..." }` on failure. Authentication sets an HttpOnly, SameSite=Lax `hermes_session` cookie.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/auth/me` | session | Return the current user |
| POST | `/api/auth/admin/setup` | none | One-time sole-admin bootstrap |
| POST | `/api/auth/admin/login` | none | Admin login |
| POST | `/api/auth/change-password` | authenticated | Replace a temporary password |
| POST | `/api/auth/user/login` | none | Regular-user login |
| POST | `/api/auth/logout` | optional | Revoke the current session |

Invalid admin or user credentials always return HTTP 401 with exactly `{ "error": "Wrong Username or Password" }`.

Passwords and session tokens are never persisted in plaintext. Sessions are signed random tokens in an HttpOnly, SameSite=Lax cookie and server-side SQLite records. Temporary passwords are never returned by the API, and ledger routes reject accounts that have not completed the required password change. Auth endpoints have an in-memory IP/path rate limit; use a shared limiter at deployment scale.

### Gmail API email delivery

The application may use the Gmail API with OAuth 2.0 for other mail features, but delegated-account creation does not depend on email delivery.

The SQLite database is created at `DATABASE_PATH` on first start. Back it up and restrict its filesystem permissions in production.
