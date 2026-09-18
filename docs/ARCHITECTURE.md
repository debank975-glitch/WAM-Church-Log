# Application Architecture

The project is currently a browser-based prototype, but its source layout now follows a production-oriented boundary:

```text
.
├── index.html              # Application shell and page markup
├── src/
│   ├── css/styles.css      # Application-specific styles
│   └── js/app.js           # Current UI and ledger behavior
├── assets/                 # Static images and other public assets
├── docs/                   # Architecture and security documentation
└── CHURCH_FINANCIAL_LOG_SPECS.md
```

The existing single-page behavior is intentionally preserved while the code is moved out of the repository root. The next maintainability step should be splitting `src/js/app.js` into domain modules such as authentication, ledger, budgets, savings, goals, reporting, and UI rendering. Those modules should share typed API models once a backend is introduced.

## Production target

For a large church, the browser should become a client of a server-side application rather than the system of record. A production deployment should use:

- a server-side database with migrations, constraints, and backups;
- server-enforced roles and permissions;
- authenticated sessions with secure, HTTP-only cookies;
- immutable audit events for every financial change;
- approval workflows for disbursements and period closing;
- server-generated reports and exports;
- monitoring, rate limiting, and recovery procedures.
