# Church Financial Log Web Application

A web-based financial ledger, bookkeeping, and stewardship tracking system designed for churches, ministries, and religious non-profits.

## Key Features

1. **Dashboard & Executive Stewardship Metrics**:
   - Month-to-date (MTD) and Year-to-date (YTD) income and expense totals.
   - Operating surplus and reserve calculation.
   - Restricted fund balances (Building Fund, Missions, Benevolence).
   - Interactive Cash Flow trend and Fund distribution charts (powered by Chart.js).
   - Sunday collection glance widget.

2. **Tithes & Offerings Log (Receivables)**:
   - Record gifts by Fund (Tithes, General Offering, Building Fund, Missions, Benevolence, Youth, Special Seed).
   - Track payment methods (Cash, Check with check #, Online/Card, Bank Wire, Mobile Giving).
   - One-click print-ready official contribution receipts with scripture quotes.
   - Filterable by fund category, payment method, service event, and donor name.

3. **Dual-Counter Sunday Collection Tally Sheet**:
   - Cash denomination counter ($100s, $50s, $20s, $10s, $5s, $1s, coins) and checks tally.
   - Enforces dual-control internal accounting requirements (requires signatures of two trustees before committing).

4. **Expenses & Disbursements Log (Payables)**:
   - Categorized by ministry department (Pastoral & Staff, Facilities & Utilities, Audio/Visual/Media, Missions & Outreach, Youth & Sunday School, etc.).
   - Approver verification & audit status (Approved vs. Pending approval).

5. **Departmental Budget vs. Actuals**:
   - Real-time percentage utilized tracking with visual warning thresholds (Green < 75%, Amber 75-95%, Red > 95%).
   - Configurable budget limits per department.

6. **Donors & IRS 501(c)(3) Giving Statements**:
   - Member roster with envelope numbers.
   - One-click generation of formal Annual Charitable Contribution Tax Statements with required non-goods/services disclosure statements ready to print or save to PDF.

7. **Reports & Audit Trail**:
   - Weekly Sunday Bulletin Financial Slip generator.
   - Monthly Board of Elders & Finance Committee Financial Statement.
   - Immutable chronological audit trail of all financial adjustments.
   - Full CSV exports for accountants and CPA audits.
   - Complete JSON database backup and restore.

## How to Run

Simply open [index.html](file:///D:/hermes/index.html) in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari). No backend server or Node.js installation is required.

All records are persisted locally in the browser's `localStorage` and can be exported as JSON or CSV at any time.

## Documentation
See [CHURCH_FINANCIAL_LOG_SPECS.md](file:///D:/hermes/CHURCH_FINANCIAL_LOG_SPECS.md) for full architectural, internal control, and functional specifications.
