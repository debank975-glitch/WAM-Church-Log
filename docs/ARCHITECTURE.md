# Application Architecture

The project is a single-page financial client backed by an Express API. Its source layout follows a production-oriented boundary:

```text
.
├── index.html              # Application shell and page markup
├── src/
│   ├── css/styles.css      # Application-specific styles
│   └── js/app.js           # Current UI and ledger behavior
├── server/
│   ├── auth/               # Password hashing and session/token services
│   ├── db.js               # SQLite/PostgreSQL provider and schema initialization
│   ├── routes/              # Authentication and delegated-account API routes
│   └── index.js            # HTTP server and static frontend hosting
├── assets/                 # Static images and other public assets
├── docs/                   # Architecture and security documentation
└── CHURCH_FINANCIAL_LOG_SPECS.md
```

The existing single-page behavior is intentionally preserved while the shared church ledger snapshot is loaded from and saved to the backend. Authentication remains account-specific, but every authenticated account reads and writes the same ledger record. The next maintainability step should be splitting `src/js/app.js` into domain modules such as authentication, ledger, budgets, savings, goals, reporting, and UI rendering.

## Authentication flow

The browser uses two distinct login paths: administrator login and user login. The first administrator must provide `ADMIN_SETUP_CODE`; the API enforces that only one administrator can ever be created. An administrator creates delegated accounts directly with a temporary password. After login, the server issues a random session token stored in an HTTP-only cookie, and the delegated user must replace the temporary password before ledger routes become available.

## Production target

The browser is now a client of a server-side application, with SQLite for local development and PostgreSQL/Supabase for deployment. A production deployment should use:

- a server-side database with migrations, constraints, and backups;
- server-enforced roles and permissions;
- authenticated sessions with secure, HTTP-only cookies;
- immutable audit events for every financial change;
- approval workflows for disbursements and period closing;
- server-generated reports and exports;
- monitoring, rate limiting, and recovery procedures.
