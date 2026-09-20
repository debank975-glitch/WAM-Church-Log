# Church Financial Stewardship & General Ledger

A web-based Church Financial Log and accounting portal designed for transparency, budget discipline, and dual-control stewardship.

## Core Features & 19 Specifications Implemented

1. **Multi-Interval Tracking**: Seamlessly switch between **Monthly**, **Quarterly**, and **Yearly** views from the top navigation bar.
2. **Budget Quota Alert**: Live visual quota indicator and warning banner alerting you whether church spending is **Within Budget**, **Approaching Limit**, or **OVER QUOTA**.
3. **Master Financial Balance**: Immediate tracking of **Total Income**, **Total Expenses**, and **Net Reserve Balance**.
4. **Restricted Access & Delegated Accounts**: Server-backed administrator and user authentication. The single administrator is bootstrapped with a one-time setup code, and user accounts are created with one-time invitation codes issued by the administrator.
5. **Printable Report Sheet**: One-click official statement for the month, quarter, or year with church letterhead, custody reconciliation, category tables, and trustee sign-off lines.
6. **Pie Charts**: Visual representation of income sources and expenditure departments using interactive Pie Charts.
7. **Custom Category Management**: Add custom major income and expense categories at any time.
8. **Confirmation Prompts**: Mandatory confirmation dialog before committing transactions or saving entries to the general ledger.
9. **Delete Records with Confirmation**: Void and delete ledger entries with instant confirmation and balance re-calculation.
10. **Time-Based Budgets**: Set spending allocations for Monthly, Quarterly, and Yearly goals per department.
11. **Savings Tracking**: Dedicated Savings page tracking designated reserve accounts (Building Fund, Emergency Welfare, Youth Endowment) and progress towards financial goals.
12. **Category Variants (Sub-categories)**: Split major categories into clearly visible variants (e.g., `Utilities` &rarr; `Water`, `Electricity`, `Wifi & Internet`, `Generator Fuel & Gas`).
13. **Dedicated Tithe Page**: Separate section for tithes, indicating whether giving was in physical cash or electronic money.
14. & 15. **Mobile Money Wallet vs. Cash on Hand**: Custody tracking showing the exact amount held in the Mobile Money Wallet vs. physical cash held in the church safe/vault.
16. **Detailed Descriptions**: Required description field on income and expenditure entries (does not apply to the tithe page).
17. **Calendar-Style Tithe Grid**: Rounded date boxes with the dates of the current month displayed under them. Tapping any box opens that day's payer list and allows multiple tithe entries to be added before saving them to the general ledger.
18. **Sidebar Navigation**: Responsive left sidebar containing user status, quota gauge, and quick navigation.
19. **All Required Pages**:
    - **Home Page**
    - **Budget Page**
    - **Tithe Page**
    - **Savings Page**
    - **Goals Page**
    - **Edit Users**
    - **Sign Out**

## How to Run

Run the application through the Node server. Opening `index.html` directly bypasses the secure API and is not supported for authenticated use:

```powershell
npm install
Copy-Item .env.example .env
# Set ADMIN_SETUP_CODE and SESSION_SECRET in .env
npm start
```

Then open `http://localhost:3000/auth.html`. Authentication is intentionally hosted on its own standalone page; successful sign-in redirects to the financial dashboard at `/`, while unauthenticated dashboard visits redirect back to `/auth.html`. Authentication and each user's financial ledger are stored on the configured backend.

## Database provider

The application supports both SQLite and PostgreSQL at runtime:

- `DATABASE_PROVIDER=sqlite` keeps the local development default and uses the file at `DATABASE_PATH`.
- `DATABASE_PROVIDER=postgres` connects to Supabase/PostgreSQL using `DATABASE_URL`. This is the deployment path for Render + Supabase.

Existing local SQLite data is not automatically migrated to PostgreSQL. Export or recreate any data you want in the hosted environment before switching users to the production URL.

## Free Render + Supabase deployment

1. Create a free Supabase project and copy its PostgreSQL connection string.
2. Create a free Render Web Service from this repository. Render can use the included `render.yaml`.
3. Set `DATABASE_URL` to the Supabase connection string and keep `DATABASE_PROVIDER=postgres`.
4. Add strong random values for `SESSION_SECRET` and `ADMIN_SETUP_CODE`.
5. Add the Gmail API OAuth variables if invitation email delivery is required.
6. Deploy and open the Render-provided `https://*.onrender.com/auth.html` URL.

The free Render service may sleep when idle, and Supabase free projects have usage and inactivity limits. Keep regular database backups before using the site for official financial records.

## Project Structure

The prototype is organized so the current browser client can grow into a maintainable production application:

- `index.html` - application shell and page markup
- `auth.html` - standalone sign-up and login page
- `src/js/app.js` - current application behavior and state transitions
- `src/js/auth.js` - standalone authentication page behavior
- `src/css/styles.css` - custom application styles
- `src/css/auth.css` - standalone authentication page styles
- `server/` - auth API, persistence abstraction, sessions, email delivery, and audit logging
- `supabase/schema.sql` - PostgreSQL schema for deployment-ready auth/session/audit/ledger tables
- `assets/` - static images and other public assets
- `docs/ARCHITECTURE.md` - target architecture and production boundaries
- `docs/SECURITY.md` - security improvements and prototype limitations

See `docs/SECURITY.md` before using it with real financial data.
