# Server authentication

1. Copy `.env.example` to `.env` and replace `SESSION_SECRET` and `ADMIN_SETUP_CODE` with long random values. There are no default credentials.
2. Run `npm install`, then `npm start`. The existing `index.html` and frontend assets are served unchanged.
3. Create the sole administrator with `POST /api/auth/admin/setup` using `{ "username", "email", "password", "setupCode", "displayName" }`. The setup code is never persisted and registration is rejected after an admin exists. The legacy `/api/auth/admin/register` alias remains available.
4. An authenticated admin can `POST /api/auth/invites` with `{ "email" }` (legacy `/api/auth/admin/invites` also works). Invite codes are hashed in SQLite/PostgreSQL, expire, and are atomically single-use. With complete Gmail API OAuth settings, the code is emailed to the configured `GMAIL_SENDER`; the invitee email is included for identification. Without Gmail API configuration it is returned only when `NODE_ENV=development`.
5. Users register at `POST /api/auth/user/register` with `{ "username", "email", "password", "inviteCode", "displayName" }` and log in at `POST /api/auth/user/login`. Plural `/users/...` aliases remain available.

## Frontend-friendly API

All JSON responses use `{ "user": ... }` on success and `{ "error": "..." }` on failure. Authentication sets an HttpOnly, SameSite=Lax `hermes_session` cookie.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/auth/me` | session | Return the current user |
| POST | `/api/auth/admin/setup` | none | One-time sole-admin bootstrap |
| POST | `/api/auth/admin/login` | none | Admin login |
| POST | `/api/auth/user/register` | invite | Create a regular user |
| POST | `/api/auth/user/login` | none | Regular-user login |
| POST | `/api/auth/invites` | admin | Generate and email an invite |
| POST | `/api/auth/logout` | optional | Revoke the current session |

Invalid admin or user credentials always return HTTP 401 with exactly `{ "error": "Wrong Username or Password" }`.

Passwords, invite codes, and session tokens are never persisted in plaintext. Sessions are signed random tokens in an HttpOnly, SameSite=Lax cookie and server-side SQLite records. Auth endpoints have an in-memory IP/path rate limit; use a shared limiter at deployment scale.

### Gmail API email delivery

The application uses the Gmail API with OAuth 2.0 and the `gmail.send` permission. Create a Google Cloud OAuth client, authorize the administrator mailbox with offline access, and store the resulting refresh token only in Render environment variables. Gmail API usage is free within Google's quotas, but no provider can guarantee inbox placement. Keep invitation messages transactional and check spam/quarantine policies if delivery is delayed.

The SQLite database is created at `DATABASE_PATH` on first start. Back it up and restrict its filesystem permissions in production.
