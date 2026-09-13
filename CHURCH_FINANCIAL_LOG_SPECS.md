# Church Financial Log System Specification

## 1. Overview & Objectives
The **Church Financial Log System** is a financial management, bookkeeping, and stewardship tracking application designed specifically for churches, ministries, and non-profit religious organizations.

The system ensures:
- **Financial Transparency & Stewardship**: Accurate recording of tithes, offerings, donations, and ministry expenditures.
- **Dual-Control Accounting & Internal Controls**: Verification of cash counting sheets, two-party approval for disbursements, and audit trails.
- **Donor Care & Compliance**: Generating annual tax-deductible contribution statements for church members.
- **Budgetary Discipline**: Departmental budget allocation vs. actual spending analysis.

---

## 2. Core Functional Modules

### Module A: Dashboard & Executive Summary
- **Key Financial Indicators**:
  - Total Income (Month-to-Date, Year-to-Date, Week-to-Date)
  - Total Disbursements / Expenses (MTD, YTD)
  - Net Operating Surplus / Deficit
  - Dedicated Restricted Funds Balance (e.g. Building Fund, Missions)
- **Visual Analytics**:
  - Income by Fund/Category distribution (Pie/Doughnut Chart)
  - Monthly Cash Flow (Income vs. Expense Trend Line/Bar Chart)
  - Budget Utilization Gauges per department
- **Quick Logging Actions**: Fast triggers for standard Sunday collection or petty cash expense.

### Module B: Income & Contribution Log (Receivables)
- **Transaction Fields**:
  - `Transaction ID` (Auto-generated UUID/Formatted sequence: `REC-YYYYMMDD-XXXX`)
  - `Date & Service/Event` (e.g., Sunday 1st Service, Sunday 2nd Service, Midweek Bible Study, Special Revival)
  - `Donor Identification` (Member Name, Envelope Number, or Anonymous)
  - `Fund Category`:
    - Tithes (10% covenant giving)
    - General Offering
    - Building & Capital Campaign
    - Missions & Evangelism
    - Benevolence & Welfare (Restricted Fund)
    - Youth & Children's Ministry
    - Special Seed / Thanksgiving
  - `Payment Channel`: Cash, Check (with check number), Bank Wire, Online/Card, Mobile Giving (Zelle, CashApp, MoMo)
  - `Amount ($)`
  - `Two-Counter Verification`: Names of counting committee members present
  - `Notes / Purpose`
- **Batch Entry Mode**:
  - Post-service collection summary to enter cash envelope bundles quickly without losing donor attribution.

### Module C: Expense & Disbursement Log (Payables)
- **Transaction Fields**:
  - `Voucher ID` (e.g., `EXP-YYYYMMDD-XXXX`)
  - `Date`
  - `Payee / Vendor Name`
  - `Ministry Department`:
    - Pastoral & Staff Compensation
    - Church Facility & Utilities (Power, Water, Gas, Internet)
    - Audio, Visual & Media Production
    - Worship Ministry & Instruments
    - Missions, Outreach & Benevolence
    - Christian Education / Sunday School
    - Administration, Printing & Legal
  - `Payment Method`: Church Check, Electronic Funds Transfer, Credit Card, Petty Cash
  - `Approved By`: Elder / Finance Committee Chair / Senior Pastor
  - `Status`: Approved, Pending Approval, Reconciled
  - `Receipt / Invoice Reference`

### Module D: Budget Planning & Departmental Tracking
- Configurable annual/monthly target budgets per department.
- Real-time calculation of:
  - Budget Allocated
  - Total Spent
  - Remaining Variance ($ and %)
  - Alert flags when department reaches >85% or >100% of threshold.

### Module E: Donor & Contribution Statements
- Member database with:
  - Full Name, Phone, Email, Mailing Address, Envelope Number
- One-click Annual Charitable Contribution Statement generation:
  - Official church letterhead format
  - Tax ID / EIN notation
  - Summary of eligible tax-deductible gifts vs non-deductible goods/services
  - PDF/Print-ready formatting

### Module F: Reporting, Audit & Data Portability
- **Standard Reports**:
  - Weekly Service Offering Summary (Printable for bulletin / announcements)
  - Monthly Financial Statement (Balance Sheet & Income Statement)
  - Detailed Audit Log with chronological transaction records
- **Data Export & Backup**:
  - CSV export for Excel, QuickBooks, or external CPA audits
  - Full JSON database backup and restore capability
  - Local browser persistence (LocalStorage) with instant zero-install functionality

---

## 3. Internal Controls & Security Guidelines
1. **Separation of Duties**: Cash counting records require two verifier signatures/entries.
2. **Restricted Fund Protection**: Designated gifts (Building Fund, Benevolence) are separated from the General Operating Fund to avoid misappropriation.
3. **Audit Immutability**: Voided or corrected transactions must retain original record references and reasons for adjustment.

---

## 4. UI/UX Specifications
- **Theme**: Reverent, professional financial palette (Navy `#0f172a`, Slate `#334155`, Emerald `#059669` for revenue, Rose `#e11d48` for expenses, Gold `#d97706` for highlights).
- **Responsive Layout**: Works seamlessly on Church Office Desktops, Treasurer Tablets, and Mobile Devices.
- **Accessibility**: High-contrast indicators, clear tabular grids, accessible modals, and print-optimized CSS (`@media print`).
