# Church Financial Log & Stewardship System Specification

## 1. Executive Summary & Compliance
The Church Financial Log is a specialized, secure financial stewardship web application designed for churches, ministries, and religious non-profit organizations. It complies with non-profit dual-control internal checks, tracks custody segregation (Bank deposits vs. Cash on Hand), and manages time-based budgets (Monthly, Quarterly, Yearly).

---

## 2. Fulfillment of Core System Requirements

| # | Specification Requirement | Architectural Implementation |
|---|---|---|
| **1** | **Track monthly, quarterly, yearly** | Header interval switcher dynamically filters all transactions, KPIs, pie charts, and quotas into Monthly, Quarterly (Q1–Q4), or Fiscal Year views. |
| **2** | **Quota Reminder / Budget Alert** | Prominent status banner and sidebar gauge alerting the user whether expenditures are **Within Budget Quota**, **Approaching Quota**, or **OVER QUOTA** (exceeded limit). |
| **3** | **Income, Expenses, Balance** | Three master real-time cards detailing Total Receipts, Total Disbursements, and Net Operating Reserve Balance. |
| **4** | **Restricted Access & Delegated Accounts** | Role-based authentication modal. The Lead Administrator can create delegated accounts (Finance Secretary, Counting Trustee, Auditor) with specific permissions. |
| **5** | **Printable Report Sheets** | Dedicated print-ready financial statement with official letterhead, custody breakdown, category tables, and dual-trustee signature sign-off lines. |
| **6** | **Pie Charts for Visual Representation** | Chart.js visual pie charts representing Income distribution and Expense category allocations. |
| **7** | **Dynamic Category Management** | Category Manager to add custom major income and expense categories. |
| **8** | **Confirmation Before Committing Changes** | Confirmation modal intercepts every transaction save, budget change, and user creation before updating the general ledger. |
| **9** | **Delete Records with Confirmation** | Records can be deleted with a confirmation prompt that recalculates running balances immediately upon deletion. |
| **10** | **Budgets for Goals (Yearly, Quarterly, Monthly)** | Budget page and Goals page allow setting financial targets per category for Monthly, Quarterly, and Yearly intervals. Goals can also be edited and removed with confirmation. |
| **11** | **Savings Aspects & Balance Tracking** | Dedicated Savings page tracking designated reserve funds (Building Reserve, Emergency Welfare, Youth Endowment) with progress bars and deposit history. |
| **12** | **Split Major Categories into Variants** | Clear hierarchy splitting categories into sub-variants (e.g. `Utilities` &rarr; `Water`, `Electricity`, `Wifi & Internet`, `Generator Fuel & Gas`). |
| **13** | **Dedicated Tithe Page (Physical vs. E-Cash)** | Dedicated Tithe page tracks member tithes and indicates whether contributions were made via Physical Money or E-Cash. |
| **14 & 15** | **Mobile Money Wallet vs. Cash on Hand Custody** | Transactions require custody destination (`Mobile Money Wallet` vs `Cash on Hand`), with live custody balance cards and report sheet breakdown. |
| **16** | **Description for Income & Expenditure** | Income and expenditure entries require detailed descriptions. Per specifications, **this description option does not apply to the Tithe page**. |
| **17** | **Monthly Tithe Rounded Date Boxes UX** | Tithe page features rounded date boxes for every day of the current month with dates displayed under them. Tapping any box opens that day's payer list and permits multiple new entries to be queued before one save action commits them to the general ledger. |
| **18** | **Sidebar Navigation** | Responsive sidebar navigation layout on the left with live user profile, quota indicator, and sign-out action. |
| **19** | **Specific Required Pages** | Sidebar navigation includes: `Home Page`, `Budget Page`, `Tithe Page`, `Savings Page`, `Goals Page`, `Edit Users`, and `Sign Out`. |
