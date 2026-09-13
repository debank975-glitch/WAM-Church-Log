# Church Financial Stewardship & General Ledger

A web-based Church Financial Log and accounting portal designed for transparency, budget discipline, and dual-control stewardship.

## Core Features & 19 Specifications Implemented

1. **Multi-Interval Tracking**: Seamlessly switch between **Monthly**, **Quarterly**, and **Yearly** views from the top navigation bar.
2. **Budget Quota Alert**: Live visual quota indicator and warning banner alerting you whether church spending is **Within Budget**, **Approaching Limit**, or **OVER QUOTA**.
3. **Master Financial Balance**: Immediate tracking of **Total Income**, **Total Expenses**, and **Net Reserve Balance**.
4. **Restricted Access & Delegated Accounts**: PIN-protected authentication. The Lead Administrator can create delegated user accounts (e.g. Finance Secretary, Counting Trustee, Auditor) with specific permissions.
   - *Default Admin PIN*: `1234`
5. **Printable Report Sheet**: One-click official statement for the month, quarter, or year with church letterhead, custody reconciliation, category tables, and trustee sign-off lines.
6. **Pie Charts**: Visual representation of income sources and expenditure departments using interactive Pie Charts.
7. **Custom Category Management**: Add custom major income and expense categories at any time.
8. **Confirmation Prompts**: Mandatory confirmation dialog before committing transactions or saving entries to the general ledger.
9. **Delete Records with Confirmation**: Void and delete ledger entries with instant confirmation and balance re-calculation.
10. **Time-Based Budgets**: Set spending allocations for Monthly, Quarterly, and Yearly goals per department.
11. **Savings Tracking**: Dedicated Savings page tracking designated reserve accounts (Building Fund, Emergency Welfare, Youth Endowment) and progress towards financial goals.
12. **Category Variants (Sub-categories)**: Split major categories into clearly visible variants (e.g., `Utilities` &rarr; `Water`, `Electricity`, `Wifi & Internet`, `Generator Fuel & Gas`).
13. **Dedicated Tithe Page**: Separate section for tithes, indicating whether giving was in physical cash or electronic money.
14. & 15. **Bank vs. Cash on Hand**: Custody tracking showing the exact amount deposited into the bank vs. physical cash held in the church safe/vault.
16. **Detailed Descriptions**: Required description field on income and expenditure entries (does not apply to the tithe page).
17. **Calendar-Style Tithe Grid**: Rounded date boxes with the dates of the current month displayed under them. Tapping any box opens that day's entry modal with Tithe and E-Cash checkboxes; saving commits to the general ledger immediately.
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

Simply open [index.html](file:///D:/hermes/index.html) in any modern web browser (Chrome, Microsoft Edge, Safari, Firefox). All data is saved automatically in your browser's local storage.
