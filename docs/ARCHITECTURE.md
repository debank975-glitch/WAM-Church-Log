# Application Architecture

The project is currently a browser-based prototype, but its source layout now follows a production-oriented boundary:

```text
.
├── index.html              # Application shell and page markup
├── src/
│   ├── css/styles.css      # Application-specific styles
│   └── js/app.js           # Current UI and ledger behavior
├── server/
│   ├── auth/               # Password hashing and session/token services
│   ├── db/                 # SQLite connection, schema, and migrations
│   ├── routes/              # Authentication and invitation API routes
│   └── index.js            # HTTP server and static frontend hosting
├── assets/                 # Static images and other public assets
├── docs/                   # Architecture and security documentation
└── CHURCH_FINANCIAL_LOG_SPECS.md
```

The existing single-page behavior is intentionally preserved while the code is moved out of the repository root. The next maintainability step should be splitting `src/js/app.js` into domain modules such as authentication, ledger, budgets, savings, goals, reporting, and UI rendering. Those modules should share typed API models once a backend is introduced.

## Authentication flow

The browser uses two distinct login paths: administrator login and user login. The first administrator must provide `ADMIN_SETUP_CODE`; the API enforces that only one administrator can ever be created. After login, the server issues a random session token stored in an HTTP-only cookie. The administrator can generate a one-time, expiring invitation code for a user; invitation codes and passwords are stored only as salted, slow hashes. SMTP settings are optional in development, but production deployments should configure them so invitation codes are delivered by email instead of returned by the API.

## Production target

For a large church, the browser should become a client of a server-side application rather than the system of record. A production deployment should use:

- a server-side database with migrations, constraints, and backups;
- server-enforced roles and permissions;
- authenticated sessions with secure, HTTP-only cookies;
- immutable audit events for every financial change;
- approval workflows for disbursements and period closing;
- server-generated reports and exports;
- monitoring, rate limiting, and recovery procedures.
