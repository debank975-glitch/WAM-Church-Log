// Church Financial Log - Core Application Logic
// Grace Community Church Accounting & Financial Stewardship System

const STORAGE_KEY = 'CHURCH_FINANCIAL_LOG_DATA_V1';

// Default Sample Seed Data
const DEFAULT_DATA = {
  settings: {
    churchName: 'Grace Community Church',
    ein: 'XX-XXXXXXX (501(c)(3) Non-Profit)',
    leadName: 'Pastor David Miller & Board of Trustees',
    address: '425 Cornerstone Way, Springfield, IL 62701',
    phone: '(555) 234-5678',
    email: 'finance@gracecommunity.example.org'
  },
  budgets: {
    'Pastoral & Staff': 85000,
    'Facilities & Utilities': 36000,
    'Audio, Visual & Media': 18000,
    'Missions & Outreach': 25000,
    'Youth & Sunday School': 12000,
    'Worship & Instruments': 9000,
    'Administration & Operations': 15000
  },
  donors: [
    {
      id: 'DNR-101',
      name: 'Jonathan & Sarah Edwards',
      envelopeNum: '101',
      phone: '(555) 301-8891',
      email: 'j.edwards@example.com',
      address: '742 Evergreen Terrace, Springfield, IL'
    },
    {
      id: 'DNR-102',
      name: 'Elder Robert & Martha Vance',
      envelopeNum: '102',
      phone: '(555) 441-2900',
      email: 'rvance@example.org',
      address: '128 Willow Creek Road, Springfield, IL'
    },
    {
      id: 'DNR-103',
      name: 'Dr. Samuel & Grace Taylor',
      envelopeNum: '103',
      phone: '(555) 892-1144',
      email: 'samuel.taylor@example.com',
      address: '55 Sycamore Lane, Springfield, IL'
    },
    {
      id: 'DNR-104',
      name: 'Michael Chen',
      envelopeNum: '104',
      phone: '(555) 670-3211',
      email: 'mchen99@example.com',
      address: '88 Heritage Drive, Springfield, IL'
    },
    {
      id: 'DNR-105',
      name: 'Hannah O\'Connor',
      envelopeNum: '105',
      phone: '(555) 912-7634',
      email: 'hannah.oc@example.com',
      address: '310 Pine Street, Springfield, IL'
    },
    {
      id: 'DNR-ANON',
      name: 'General / Anonymous Givers',
      envelopeNum: 'N/A',
      phone: 'N/A',
      email: 'office@gracecommunity.example.org',
      address: 'Sunday In-Person Congregation'
    }
  ],
  income: [
    {
      id: 'REC-20260907-001',
      date: '2026-09-07',
      donorName: 'Jonathan & Sarah Edwards',
      envelopeNum: '101',
      fund: 'Tithes',
      service: 'Sunday 1st Service',
      method: 'Check',
      reference: 'Check #2041',
      amount: 1250.00,
      notes: 'Monthly covenant tithe',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'REC-20260907-002',
      date: '2026-09-07',
      donorName: 'Elder Robert & Martha Vance',
      envelopeNum: '102',
      fund: 'Building Fund',
      service: 'Sunday 1st Service',
      method: 'Bank Transfer',
      reference: 'ACH-88901',
      amount: 800.00,
      notes: 'Sanctuary roof & annex expansion pledge',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'REC-20260907-003',
      date: '2026-09-07',
      donorName: 'General / Anonymous Givers',
      envelopeNum: 'N/A',
      fund: 'General Offering',
      service: 'Sunday 1st Service',
      method: 'Cash',
      reference: 'Count Sheet #36A',
      amount: 2480.00,
      notes: 'Sunday 1st Service basket collection (verified by 2 trustees)',
      recordedBy: 'R. Vance & M. Clark'
    },
    {
      id: 'REC-20260907-004',
      date: '2026-09-07',
      donorName: 'Dr. Samuel & Grace Taylor',
      envelopeNum: '103',
      fund: 'Missions',
      service: 'Sunday 2nd Service',
      method: 'Online / Card',
      reference: 'Tithe.ly-TX8992',
      amount: 500.00,
      notes: 'Global Medical Missions Kenya support',
      recordedBy: 'System Auto-Import'
    },
    {
      id: 'REC-20260907-005',
      date: '2026-09-07',
      donorName: 'General / Anonymous Givers',
      envelopeNum: 'N/A',
      fund: 'General Offering',
      service: 'Sunday 2nd Service',
      method: 'Cash',
      reference: 'Count Sheet #36B',
      amount: 1940.00,
      notes: 'Sunday 2nd Service cash offering',
      recordedBy: 'R. Vance & J. Edwards'
    },
    {
      id: 'REC-20260909-006',
      date: '2026-09-09',
      donorName: 'Michael Chen',
      envelopeNum: '104',
      fund: 'Tithes',
      service: 'Midweek Service',
      method: 'Online / Card',
      reference: 'Stripe-ch_88193',
      amount: 650.00,
      notes: 'Bi-weekly tithe',
      recordedBy: 'System Auto-Import'
    },
    {
      id: 'REC-20260910-007',
      date: '2026-09-10',
      donorName: 'Hannah O\'Connor',
      envelopeNum: '105',
      fund: 'Youth Ministry',
      service: 'Direct / Mail',
      method: 'Check',
      reference: 'Check #1098',
      amount: 350.00,
      notes: 'Sponsorship for youth fall retreat',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'REC-20260912-008',
      date: '2026-09-12',
      donorName: 'Jonathan & Sarah Edwards',
      envelopeNum: '101',
      fund: 'Benevolence',
      service: 'Midweek Service',
      method: 'Mobile Money',
      reference: 'Zelle Ref #0092',
      amount: 300.00,
      notes: 'Church Food Pantry & Community Welfare Fund',
      recordedBy: 'M. Vance (Treasurer)'
    }
  ],
  expenses: [
    {
      id: 'EXP-20260902-001',
      date: '2026-09-02',
      payee: 'Midwest Electric & Gas Utility',
      dept: 'Facilities & Utilities',
      method: 'Bank EFT / Wire',
      reference: 'EFT-8849',
      amount: 1420.50,
      approvedBy: 'Trustee Board',
      status: 'Approved',
      desc: 'Monthly sanctuary air conditioning and electricity',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'EXP-20260904-002',
      date: '2026-09-04',
      payee: 'Sweetwater Audio & Pro Video',
      dept: 'Audio, Visual & Media',
      method: 'Credit Card',
      reference: 'CC-9024',
      amount: 685.20,
      approvedBy: 'Elder Board',
      status: 'Approved',
      desc: 'Wireless microphone bodypacks and replacement XLR cables',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'EXP-20260905-003',
      date: '2026-09-05',
      payee: 'Pastor David Miller (Payroll)',
      dept: 'Pastoral & Staff',
      method: 'Church Check',
      reference: 'Check #5102',
      amount: 3800.00,
      approvedBy: 'Deacon Finance Chair',
      status: 'Approved',
      desc: 'September 1st-half pastoral compensation & housing allowance',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'EXP-20260908-004',
      date: '2026-09-08',
      payee: 'Springfield Community Food Bank',
      dept: 'Missions & Outreach',
      method: 'Church Check',
      reference: 'Check #5103',
      amount: 750.00,
      approvedBy: 'Benevolence Committee',
      status: 'Approved',
      desc: 'Weekly community grocery outreach & emergency relief parcels',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'EXP-20260911-005',
      date: '2026-09-11',
      payee: 'David C. Cook Publishing',
      dept: 'Youth & Sunday School',
      method: 'Credit Card',
      reference: 'CC-9024',
      amount: 412.80,
      approvedBy: 'Pastor David Miller',
      status: 'Approved',
      desc: 'Quarter 4 Sunday School study workbooks & craft supplies',
      recordedBy: 'M. Vance (Treasurer)'
    },
    {
      id: 'EXP-20260912-006',
      date: '2026-09-12',
      payee: 'Church Mutual Insurance Co.',
      dept: 'Administration & Operations',
      method: 'Bank EFT / Wire',
      reference: 'EFT-8895',
      amount: 1150.00,
      approvedBy: 'Trustee Board',
      status: 'Pending',
      desc: 'Quarterly property, liability, and sanctuary insurance premium',
      recordedBy: 'M. Vance (Treasurer)'
    }
  ],
  auditTrail: [
    {
      timestamp: '2026-09-07 13:45:00',
      operator: 'R. Vance (Trustee 1) & M. Clark (Trustee 2)',
      action: 'SUNDAY_COLLECTION_VERIFIED',
      details: 'Dual count verified Sunday 1st Service total of $2,480.00 cash'
    },
    {
      timestamp: '2026-09-07 14:15:00',
      operator: 'M. Vance (Treasurer)',
      action: 'INCOME_LOGGED',
      details: 'Logged Tithe of $1,250.00 from Jonathan & Sarah Edwards (#101)'
    },
    {
      timestamp: '2026-09-08 10:00:00',
      operator: 'Benevolence Committee',
      action: 'DISBURSEMENT_APPROVED',
      details: 'Approved $750.00 food pantry support to Springfield Food Bank'
    },
    {
      timestamp: '2026-09-12 11:30:00',
      operator: 'System Ledger',
      action: 'DATABASE_INITIALIZED',
      details: 'Financial Ledger initialized for Fiscal Year 2026'
    }
  ]
};

// Global App State
let state = {
  settings: {},
  budgets: {},
  donors: [],
  income: [],
  expenses: [],
  auditTrail: []
};

// Charts instances
let chartCashFlowInstance = null;
let chartFundDistInstance = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupDefaults();
  initCharts();
  renderAllViews();
  lucide.createIcons();
});

// Load Data from LocalStorage or seed defaults
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      state = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored church data, falling back to defaults', e);
      state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } else {
    state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setupDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = ['incDate', 'expDate', 'tallyDate'];
  dateInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = today;
  });

  if (document.getElementById('headerChurchName')) {
    document.getElementById('headerChurchName').innerText = state.settings.churchName || 'Grace Community Church';
  }
  if (document.getElementById('settingChurchName')) {
    document.getElementById('settingChurchName').value = state.settings.churchName || '';
    document.getElementById('settingTaxId').value = state.settings.ein || '';
    document.getElementById('settingLeadName').value = state.settings.leadName || '';
  }
}

// Tab Switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active', 'border-gold-400', 'text-gold-400');
    btn.classList.add('border-transparent', 'text-church-300');
  });

  const targetSection = document.getElementById(`section-${tabName}`);
  const targetBtn = document.getElementById(`tabBtn-${tabName}`);
  if (targetSection) targetSection.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('active', 'border-gold-400', 'text-gold-400');
    targetBtn.classList.remove('border-transparent', 'text-church-300');
  }

  // Refresh icons and charts if dashboard becomes visible
  lucide.createIcons();
  if (tabName === 'dashboard') {
    updateCharts();
  }
}

// Currency Formatter Helper
function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

// Master Render Function
function renderAllViews() {
  renderDashboardKPIs();
  renderRecentDashboardTransactions();
  renderIncomeTable();
  renderExpenseTable();
  renderBudgetCards();
  renderDonorsTable();
  renderAuditTrailTable();
  updateCharts();
  lucide.createIcons();
}

// -------------------------------------------------------------
// DASHBOARD LOGIC
// -------------------------------------------------------------
function renderDashboardKPIs() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

  // Income YTD & MTD
  let incomeYTD = 0;
  let incomeMTD = 0;
  let restrictedFunds = 0;

  state.income.forEach(item => {
    const amt = parseFloat(item.amount) || 0;
    incomeYTD += amt;
    if (item.date && item.date.startsWith(`${currentYear}-${currentMonth}`)) {
      incomeMTD += amt;
    }
    if (['Building Fund', 'Missions', 'Benevolence'].includes(item.fund)) {
      restrictedFunds += amt;
    }
  });

  // Expenses YTD & MTD
  let expenseYTD = 0;
  let expenseMTD = 0;
  state.expenses.forEach(item => {
    const amt = parseFloat(item.amount) || 0;
    if (item.status === 'Approved') {
      expenseYTD += amt;
      if (item.date && item.date.startsWith(`${currentYear}-${currentMonth}`)) {
        expenseMTD += amt;
      }
    }
  });

  const netOperating = incomeYTD - expenseYTD;
  const marginPct = incomeYTD > 0 ? Math.round((netOperating / incomeYTD) * 100) : 0;

  document.getElementById('cardIncomeYTD').innerText = formatUSD(incomeYTD);
  document.getElementById('cardIncomeMTD').innerText = `+${formatUSD(incomeMTD)}`;
  document.getElementById('cardExpenseYTD').innerText = formatUSD(expenseYTD);
  document.getElementById('cardExpenseMTD').innerText = `-${formatUSD(expenseMTD)}`;
  document.getElementById('cardNetOperating').innerText = formatUSD(netOperating);
  document.getElementById('cardOperatingMargin').innerText = `${marginPct}%`;
  document.getElementById('cardRestrictedFunds').innerText = formatUSD(restrictedFunds);

  // Sunday Tally Widget
  let sun1st = 0;
  let sun2nd = 0;
  let online = 0;

  state.income.forEach(item => {
    const amt = parseFloat(item.amount) || 0;
    if (item.service === 'Sunday 1st Service') sun1st += amt;
    else if (item.service === 'Sunday 2nd Service') sun2nd += amt;
    else if (item.method === 'Online / Card' || item.service === 'Direct / Mail') online += amt;
  });

  document.getElementById('widgetSunday1st').innerText = formatUSD(sun1st);
  document.getElementById('widgetSunday2nd').innerText = formatUSD(sun2nd);
  document.getElementById('widgetOnlineGiving').innerText = formatUSD(online);
  document.getElementById('widgetWeeklyTotal').innerText = formatUSD(sun1st + sun2nd + online);
}

function renderRecentDashboardTransactions() {
  const tbody = document.getElementById('dashboardRecentRows');
  if (!tbody) return;

  // Combine income and expenses, sort by date descending
  const combined = [
    ...state.income.map(i => ({ ...i, txType: 'INCOME' })),
    ...state.expenses.map(e => ({ ...e, txType: 'EXPENSE' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  tbody.innerHTML = '';
  combined.forEach(tx => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition';
    
    const isIncome = tx.txType === 'INCOME';
    const badgeType = isIncome 
      ? '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Income</span>'
      : '<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">Disbursement</span>';

    const entityName = isIncome ? (tx.donorName || 'Anonymous') : (tx.payee || 'Vendor');
    const categoryName = isIncome ? tx.fund : tx.dept;
    const amountFormatted = isIncome ? `+${formatUSD(tx.amount)}` : `-${formatUSD(tx.amount)}`;
    const amountColor = isIncome ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold';

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-slate-500 font-mono">${tx.date}</td>
      <td class="py-2.5 px-3">${badgeType}</td>
      <td class="py-2.5 px-3 text-slate-900 font-medium">${entityName}</td>
      <td class="py-2.5 px-3 text-slate-600">${categoryName}</td>
      <td class="py-2.5 px-3 text-slate-500">${tx.method}</td>
      <td class="py-2.5 px-3 text-right font-mono ${amountColor}">${amountFormatted}</td>
    `;
    tbody.appendChild(tr);
  });
}

// -------------------------------------------------------------
// CHARTS LOGIC (Chart.js)
// -------------------------------------------------------------
function initCharts() {
  const ctxCashFlow = document.getElementById('chartCashFlow');
  const ctxFundDist = document.getElementById('chartFundDistribution');

  if (ctxCashFlow) {
    chartCashFlowInstance = new Chart(ctxCashFlow, {
      type: 'bar',
      data: {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Income Received',
            backgroundColor: '#10b981',
            borderRadius: 6,
            data: [6200, 7100, 6800, 7400, 8100, 7770]
          },
          {
            label: 'Expenses Disbursed',
            backgroundColor: '#f43f5e',
            borderRadius: 6,
            data: [5100, 5400, 5600, 5900, 6200, 8218]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: value => `$${value}`
            }
          }
        }
      }
    });
  }

  if (ctxFundDist) {
    chartFundDistInstance = new Chart(ctxFundDist, {
      type: 'doughnut',
      data: {
        labels: ['Tithes', 'General Offering', 'Building Fund', 'Missions', 'Youth', 'Benevolence'],
        datasets: [{
          data: [1900, 4420, 800, 500, 350, 300],
          backgroundColor: [
            '#059669', // Emerald (Tithes)
            '#3b82f6', // Blue (General)
            '#d97706', // Gold (Building)
            '#8b5cf6', // Violet (Missions)
            '#ec4899', // Pink (Youth)
            '#06b6d4'  // Cyan (Benevolence)
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function updateCharts() {
  if (!chartFundDistInstance) return;

  // Aggregate income by fund
  const fundTotals = {
    'Tithes': 0,
    'General Offering': 0,
    'Building Fund': 0,
    'Missions': 0,
    'Youth Ministry': 0,
    'Benevolence': 0
  };

  state.income.forEach(item => {
    const amt = parseFloat(item.amount) || 0;
    if (fundTotals[item.fund] !== undefined) {
      fundTotals[item.fund] += amt;
    } else {
      fundTotals['General Offering'] += amt;
    }
  });

  const labels = Object.keys(fundTotals);
  const data = Object.values(fundTotals);

  chartFundDistInstance.data.labels = labels;
  chartFundDistInstance.data.datasets[0].data = data;
  chartFundDistInstance.update();

  // Populate compact legend
  const legendContainer = document.getElementById('fundLegendCompact');
  if (legendContainer) {
    const colors = chartFundDistInstance.data.datasets[0].backgroundColor;
    legendContainer.innerHTML = '';
    labels.forEach((label, i) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex items-center space-x-1.5';
      itemDiv.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${colors[i % colors.length]}"></span>
        <span class="truncate">${label}: <strong>${formatUSD(data[i])}</strong></span>
      `;
      legendContainer.appendChild(itemDiv);
    });
  }
}

// -------------------------------------------------------------
// INCOME & CONTRIBUTIONS MODULE
// -------------------------------------------------------------
function renderIncomeTable() {
  const tbody = document.getElementById('incomeTableBody');
  const emptyState = document.getElementById('incomeEmptyState');
  const countSummary = document.getElementById('incomeCountSummary');
  const filteredTotal = document.getElementById('incomeFilteredTotal');
  if (!tbody) return;

  const search = (document.getElementById('filterIncomeSearch')?.value || '').toLowerCase();
  const fundFilter = document.getElementById('filterIncomeFund')?.value || 'ALL';
  const methodFilter = document.getElementById('filterIncomeMethod')?.value || 'ALL';
  const serviceFilter = document.getElementById('filterIncomeService')?.value || 'ALL';

  const filtered = state.income.filter(item => {
    const matchSearch = item.donorName.toLowerCase().includes(search) || 
                        item.id.toLowerCase().includes(search) ||
                        (item.envelopeNum && item.envelopeNum.toLowerCase().includes(search));
    const matchFund = fundFilter === 'ALL' || item.fund === fundFilter;
    const matchMethod = methodFilter === 'ALL' || item.method === methodFilter;
    const matchService = serviceFilter === 'ALL' || item.service === serviceFilter;
    return matchSearch && matchFund && matchMethod && matchService;
  });

  tbody.innerHTML = '';
  let sum = 0;

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(item => {
      const amt = parseFloat(item.amount) || 0;
      sum += amt;

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono text-slate-500 font-semibold">${item.id}</td>
        <td class="py-3 px-4 text-slate-600 font-mono">${item.date}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${item.donorName}</div>
          <div class="text-[11px] text-slate-500">Env #${item.envelopeNum || 'None'}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${getFundBadgeColor(item.fund)}">
            ${item.fund}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-600">${item.service}</td>
        <td class="py-3 px-4">
          <div class="text-slate-800 font-medium">${item.method}</div>
          <div class="text-[10px] text-slate-400 font-mono">${item.reference || '-'}</div>
        </td>
        <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
          ${formatUSD(amt)}
        </td>
        <td class="py-3 px-4 text-center">
          <button onclick="viewReceipt('${item.id}')" class="p-1.5 text-church-600 hover:text-church-900 hover:bg-church-50 rounded transition" title="Print Official Church Receipt">
            <i data-lucide="receipt" class="w-4 h-4"></i>
          </button>
        </td>
        <td class="py-3 px-4 text-center">
          <button onclick="deleteIncomeRecord('${item.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Void / Remove Record">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  countSummary.innerText = `Showing ${filtered.length} of ${state.income.length} records`;
  filteredTotal.innerText = formatUSD(sum);
  lucide.createIcons();
}

function getFundBadgeColor(fund) {
  switch (fund) {
    case 'Tithes': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'General Offering': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'Building Fund': return 'bg-amber-50 text-amber-800 border border-amber-200';
    case 'Missions': return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'Benevolence': return 'bg-teal-50 text-teal-700 border border-teal-200';
    case 'Youth Ministry': return 'bg-pink-50 text-pink-700 border border-pink-200';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function handleIncomeSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('incDate').value;
  const service = document.getElementById('incService').value;
  const donorName = document.getElementById('incDonorName').value.trim();
  const envelopeNum = document.getElementById('incEnvNum').value.trim() || 'N/A';
  const fund = document.getElementById('incFund').value;
  const amount = parseFloat(document.getElementById('incAmount').value);
  const method = document.getElementById('incMethod').value;
  const reference = document.getElementById('incRef').value.trim();
  const notes = document.getElementById('incNotes').value.trim();

  if (!date || isNaN(amount) || amount <= 0 || !donorName) {
    alert('Please complete all required fields.');
    return;
  }

  // Generate unique receipt ID: REC-YYYYMMDD-XXX
  const dateClean = date.replace(/-/g, '');
  const randomSeq = Math.floor(100 + Math.random() * 900);
  const id = `REC-${dateClean}-${randomSeq}`;

  const newRecord = {
    id,
    date,
    service,
    donorName,
    envelopeNum,
    fund,
    amount,
    method,
    reference,
    notes,
    recordedBy: 'Admin Treasurer'
  };

  state.income.unshift(newRecord);

  // Auto-register donor if new
  if (envelopeNum !== 'N/A' && !state.donors.some(d => d.envelopeNum === envelopeNum)) {
    state.donors.push({
      id: `DNR-${envelopeNum}`,
      name: donorName,
      envelopeNum,
      phone: 'Unlisted',
      email: 'Unlisted',
      address: 'Member File'
    });
  }

  // Audit log entry
  addAuditEntry('INCOME_RECORDED', `Recorded ${formatUSD(amount)} ${fund} from ${donorName} (${id})`);

  saveData();
  renderAllViews();
  closeModal('modalIncome');
  e.target.reset();
  setupDefaults();
}

function deleteIncomeRecord(id) {
  if (!confirm(`Are you sure you wish to void contribution record ${id}? This action will be logged in the system audit trail.`)) return;

  const item = state.income.find(i => i.id === id);
  if (item) {
    addAuditEntry('INCOME_VOIDED', `Voided receipt ${id} of ${formatUSD(item.amount)} (${item.donorName})`);
  }
  state.income = state.income.filter(i => i.id !== id);
  saveData();
  renderAllViews();
}

// -------------------------------------------------------------
// EXPENSES & DISBURSEMENTS MODULE
// -------------------------------------------------------------
function renderExpenseTable() {
  const tbody = document.getElementById('expenseTableBody');
  const emptyState = document.getElementById('expenseEmptyState');
  const countSummary = document.getElementById('expenseCountSummary');
  const filteredTotal = document.getElementById('expenseFilteredTotal');
  if (!tbody) return;

  const search = (document.getElementById('filterExpenseSearch')?.value || '').toLowerCase();
  const deptFilter = document.getElementById('filterExpenseDept')?.value || 'ALL';
  const statusFilter = document.getElementById('filterExpenseStatus')?.value || 'ALL';

  const filtered = state.expenses.filter(item => {
    const matchSearch = item.payee.toLowerCase().includes(search) || 
                        item.id.toLowerCase().includes(search) ||
                        item.desc.toLowerCase().includes(search);
    const matchDept = deptFilter === 'ALL' || item.dept === deptFilter;
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  tbody.innerHTML = '';
  let sum = 0;

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(item => {
      const amt = parseFloat(item.amount) || 0;
      sum += amt;

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

      const statusBadge = item.status === 'Approved'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>';

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono text-slate-500 font-semibold">${item.id}</td>
        <td class="py-3 px-4 text-slate-600 font-mono">${item.date}</td>
        <td class="py-3 px-4 font-bold text-slate-900">${item.payee}</td>
        <td class="py-3 px-4 text-slate-700">${item.dept}</td>
        <td class="py-3 px-4 text-slate-500 max-w-xs truncate" title="${item.desc}">${item.desc}</td>
        <td class="py-3 px-4">
          <div class="text-slate-800 font-medium">${item.method}</div>
          <div class="text-[10px] text-slate-400 font-mono">${item.reference || '-'}</div>
        </td>
        <td class="py-3 px-4 text-slate-600">${item.approvedBy}</td>
        <td class="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
          ${formatUSD(amt)}
        </td>
        <td class="py-3 px-4 text-center">${statusBadge}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="deleteExpenseRecord('${item.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Void / Remove Voucher">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  countSummary.innerText = `Showing ${filtered.length} of ${state.expenses.length} records`;
  filteredTotal.innerText = formatUSD(sum);
  lucide.createIcons();
}

function handleExpenseSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('expDate').value;
  const dept = document.getElementById('expDept').value;
  const payee = document.getElementById('expPayee').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const method = document.getElementById('expMethod').value;
  const reference = document.getElementById('expRef').value.trim();
  const approvedBy = document.getElementById('expApprovedBy').value.trim();
  const status = document.getElementById('expStatus').value;
  const desc = document.getElementById('expDesc').value.trim();

  if (!date || isNaN(amount) || amount <= 0 || !payee || !approvedBy) {
    alert('Please fill in all required fields.');
    return;
  }

  const dateClean = date.replace(/-/g, '');
  const randomSeq = Math.floor(100 + Math.random() * 900);
  const id = `EXP-${dateClean}-${randomSeq}`;

  const newVoucher = {
    id,
    date,
    dept,
    payee,
    amount,
    method,
    reference,
    approvedBy,
    status,
    desc,
    recordedBy: 'Trustee Board'
  };

  state.expenses.unshift(newVoucher);
  addAuditEntry('EXPENSE_POSTED', `Posted disbursement voucher ${id} for ${formatUSD(amount)} to ${payee} (${dept})`);

  saveData();
  renderAllViews();
  closeModal('modalExpense');
  e.target.reset();
  setupDefaults();
}

function deleteExpenseRecord(id) {
  if (!confirm(`Are you sure you want to void disbursement voucher ${id}? This action will be audited.`)) return;

  const item = state.expenses.find(e => e.id === id);
  if (item) {
    addAuditEntry('EXPENSE_VOIDED', `Voided voucher ${id} of ${formatUSD(item.amount)} to ${item.payee}`);
  }
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveData();
  renderAllViews();
}

// -------------------------------------------------------------
// SUNDAY COLLECTION TALLY SHEET (DUAL COUNT VERIFICATION)
// -------------------------------------------------------------
function calculateTallySheet() {
  const b100 = (parseInt(document.getElementById('bill100')?.value) || 0) * 100;
  const b50 = (parseInt(document.getElementById('bill50')?.value) || 0) * 50;
  const b20 = (parseInt(document.getElementById('bill20')?.value) || 0) * 20;
  const b10 = (parseInt(document.getElementById('bill10')?.value) || 0) * 10;
  const b5 = (parseInt(document.getElementById('bill5')?.value) || 0) * 5;
  const b1 = (parseInt(document.getElementById('bill1')?.value) || 0) * 1;
  const coins = parseFloat(document.getElementById('coinTotal')?.value) || 0;
  const checks = parseFloat(document.getElementById('checksTotal')?.value) || 0;

  const cashTotal = b100 + b50 + b20 + b10 + b5 + b1 + coins;
  const grandTotal = cashTotal + checks;

  document.getElementById('tallyCashTotalDisplay').innerText = `Cash Total: ${formatUSD(cashTotal)}`;
  document.getElementById('tallyGrandTotal').innerText = formatUSD(grandTotal);

  return { cashTotal, checks, grandTotal };
}

function commitSundayTallySheet() {
  const { cashTotal, checks, grandTotal } = calculateTallySheet();
  const counter1 = document.getElementById('tallyCounter1').value.trim();
  const counter2 = document.getElementById('tallyCounter2').value.trim();
  const date = document.getElementById('tallyDate').value;
  const service = document.getElementById('tallyService').value;
  const fund = document.getElementById('tallyFund').value;

  if (grandTotal <= 0) {
    alert('Please enter cash and/or check counts before committing.');
    return;
  }
  if (!counter1 || !counter2) {
    alert('Dual-Control Requirement: Please enter names of both Counter 1 and Counter 2 to verify physical count.');
    return;
  }

  const dateClean = date.replace(/-/g, '');
  const randomSeq = Math.floor(100 + Math.random() * 900);
  const id = `REC-${dateClean}-${randomSeq}`;

  const notesText = `Verified Sunday Tally Sheet (${service}): Cash ${formatUSD(cashTotal)} + Checks ${formatUSD(checks)}. Counters: ${counter1}, ${counter2}.`;

  const newRecord = {
    id,
    date,
    service,
    donorName: 'General Congregation Offering',
    envelopeNum: 'N/A',
    fund,
    amount: grandTotal,
    method: checks > 0 ? (cashTotal > 0 ? 'Cash & Checks Batch' : 'Check') : 'Cash',
    reference: `Count Sheet verified by ${counter1} & ${counter2}`,
    notes: notesText,
    recordedBy: `${counter1} & ${counter2}`
  };

  state.income.unshift(newRecord);
  addAuditEntry('SUNDAY_TALLY_COMMITTED', `Dual-counter sheet logged: ${formatUSD(grandTotal)} (${service}) verified by ${counter1} & ${counter2}`);

  saveData();
  renderAllViews();
  closeModal('modalBatchCount');
  alert(`Sunday Collection Tally of ${formatUSD(grandTotal)} successfully recorded under Receipt #${id}!`);
}

// -------------------------------------------------------------
// DEPARTMENT BUDGETS MODULE
// -------------------------------------------------------------
function renderBudgetCards() {
  const grid = document.getElementById('budgetCardsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const departments = Object.keys(state.budgets);

  departments.forEach(dept => {
    const allocated = state.budgets[dept] || 0;
    
    // Calculate spent
    let spent = 0;
    state.expenses.forEach(e => {
      if (e.dept === dept && e.status === 'Approved') {
        spent += parseFloat(e.amount) || 0;
      }
    });

    const remaining = allocated - spent;
    const pctUsed = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;

    let barColor = 'bg-emerald-500';
    let statusText = 'On Track';
    let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    if (pctUsed >= 95) {
      barColor = 'bg-rose-500';
      statusText = 'Budget Critical';
      statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (pctUsed >= 75) {
      barColor = 'bg-amber-500';
      statusText = 'Near Limit';
      statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
    }

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow transition';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-sm">${dept}</h3>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}">${statusText}</span>
        </div>

        <div class="mt-4 space-y-2 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Annual Allocation:</span>
            <span class="font-bold text-slate-800 font-mono">${formatUSD(allocated)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Actual Disbursed:</span>
            <span class="font-bold text-rose-600 font-mono">${formatUSD(spent)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Remaining Variance:</span>
            <span class="font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-mono">${formatUSD(remaining)}</span>
          </div>
        </div>

        <div class="mt-4">
          <div class="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Utilization</span>
            <span class="font-bold text-slate-700 font-mono">${pctUsed}%</span>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${pctUsed}%"></div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');

  if (id === 'modalEditBudgets') {
    populateEditBudgetsForm();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function populateEditBudgetsForm() {
  const form = document.getElementById('formEditBudgets');
  if (!form) return;

  form.innerHTML = '';
  Object.keys(state.budgets).forEach(dept => {
    const val = state.budgets[dept];
    const div = document.createElement('div');
    div.innerHTML = `
      <label class="block font-semibold text-slate-700 mb-1">${dept} ($)</label>
      <input type="number" step="100" min="0" data-dept="${dept}" value="${val}" class="budget-input w-full px-3 py-2 border border-slate-300 rounded-lg">
    `;
    form.appendChild(div);
  });

  const btnContainer = document.createElement('div');
  btnContainer.className = 'pt-2 flex justify-end space-x-2 sticky bottom-0 bg-white py-2 border-t border-slate-200';
  btnContainer.innerHTML = `
    <button type="button" onclick="closeModal('modalEditBudgets')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold">Cancel</button>
    <button type="submit" class="px-5 py-2 bg-church-900 hover:bg-church-800 text-white font-bold rounded-lg">Save Changes</button>
  `;
  form.appendChild(btnContainer);
}

function saveDepartmentBudgets(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll('.budget-input');
  inputs.forEach(input => {
    const dept = input.getAttribute('data-dept');
    const val = parseFloat(input.value) || 0;
    state.budgets[dept] = val;
  });

  addAuditEntry('BUDGETS_UPDATED', 'Updated departmental budget allocations.');
  saveData();
  renderAllViews();
  closeModal('modalEditBudgets');
  alert('Department budgets updated successfully.');
}

// -------------------------------------------------------------
// DONORS & IRS-COMPLIANT GIVING STATEMENTS MODULE
// -------------------------------------------------------------
function renderDonorsTable() {
  const tbody = document.getElementById('donorsTableBody');
  const countBadge = document.getElementById('donorCountBadge');
  if (!tbody) return;

  const search = (document.getElementById('filterDonorSearch')?.value || '').toLowerCase();

  const filtered = state.donors.filter(d => 
    d.name.toLowerCase().includes(search) ||
    d.envelopeNum.toLowerCase().includes(search) ||
    (d.email && d.email.toLowerCase().includes(search))
  );

  tbody.innerHTML = '';
  filtered.forEach(donor => {
    // Calculate total gifts by donor
    let totalGiven = 0;
    let tithesGiven = 0;
    let specialGiven = 0;

    state.income.forEach(item => {
      const matchEnv = donor.envelopeNum !== 'N/A' && item.envelopeNum === donor.envelopeNum;
      const matchName = item.donorName.toLowerCase() === donor.name.toLowerCase();
      if (matchEnv || matchName) {
        const amt = parseFloat(item.amount) || 0;
        totalGiven += amt;
        if (item.fund === 'Tithes') tithesGiven += amt;
        else specialGiven += amt;
      }
    });

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    tr.innerHTML = `
      <td class="py-3 px-4 font-mono font-bold text-church-800">#${donor.envelopeNum}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${donor.name}</div>
        <div class="text-[11px] text-slate-400 truncate max-w-xs">${donor.address || 'Address unlisted'}</div>
      </td>
      <td class="py-3 px-4 text-slate-500">
        <div>${donor.email || '-'}</div>
        <div class="text-[11px] text-slate-400 font-mono">${donor.phone || '-'}</div>
      </td>
      <td class="py-3 px-4 text-right font-mono font-semibold text-emerald-700">${formatUSD(tithesGiven)}</td>
      <td class="py-3 px-4 text-right font-mono text-slate-600">${formatUSD(specialGiven)}</td>
      <td class="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">${formatUSD(totalGiven)}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="generateDonorStatement('${donor.id}')" class="px-2.5 py-1 bg-church-50 hover:bg-church-100 text-church-800 rounded font-semibold text-xs border border-church-200 flex items-center space-x-1 mx-auto transition">
          <i data-lucide="file-text" class="w-3.5 h-3.5 text-gold-500"></i>
          <span>Statement</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (countBadge) {
    countBadge.innerText = `${filtered.length} member profiles`;
  }
  lucide.createIcons();
}

function handleAddDonorSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('donorNewName').value.trim();
  const envelopeNum = document.getElementById('donorNewEnv').value.trim() || `${state.donors.length + 101}`;
  const phone = document.getElementById('donorNewPhone').value.trim() || 'Unlisted';
  const email = document.getElementById('donorNewEmail').value.trim() || 'Unlisted';
  const address = document.getElementById('donorNewAddress').value.trim() || 'Unlisted';

  if (!name) {
    alert('Please enter member name.');
    return;
  }

  const id = `DNR-${Date.now()}`;
  state.donors.push({ id, name, envelopeNum, phone, email, address });
  addAuditEntry('DONOR_ADDED', `Registered member ${name} (Envelope #${envelopeNum})`);

  saveData();
  renderAllViews();
  closeModal('modalAddDonor');
  e.target.reset();
}

function generateDonorStatement(donorId) {
  const donor = state.donors.find(d => d.id === donorId);
  if (!donor) return;

  const contributions = state.income.filter(item => {
    const matchEnv = donor.envelopeNum !== 'N/A' && item.envelopeNum === donor.envelopeNum;
    const matchName = item.donorName.toLowerCase() === donor.name.toLowerCase();
    return matchEnv || matchName;
  });

  const container = document.getElementById('statementPrintableArea');
  if (!container) return;

  let grandTotal = 0;
  const rowsHtml = contributions.map(item => {
    const amt = parseFloat(item.amount) || 0;
    grandTotal += amt;
    return `
      <tr class="border-b border-slate-200">
        <td class="py-2 px-3 font-mono">${item.date}</td>
        <td class="py-2 px-3">${item.fund}</td>
        <td class="py-2 px-3 text-slate-600">${item.method} (${item.reference || '-'})</td>
        <td class="py-2 px-3 text-slate-500">${item.notes || '-'}</td>
        <td class="py-2 px-3 text-right font-mono font-bold">${formatUSD(amt)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Statement Header -->
    <div class="border-b-2 border-slate-800 pb-5">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-wide">${state.settings.churchName}</h2>
          <p class="text-xs text-slate-500">${state.settings.address} &bull; ${state.settings.phone}</p>
          <p class="text-xs text-slate-500 font-mono mt-0.5">Federal Tax ID / EIN: ${state.settings.ein}</p>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Official Tax Document</span>
          <span class="text-lg font-bold text-slate-900">Annual Giving Statement</span>
          <p class="text-xs text-slate-500">Tax Year 2026</p>
        </div>
      </div>
    </div>

    <!-- Recipient / Donor Details -->
    <div class="grid grid-cols-2 gap-6 pt-2">
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <span class="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Donor Name & Address:</span>
        <div class="font-bold text-slate-900 text-sm">${donor.name}</div>
        <div class="text-slate-600 mt-1">${donor.address || 'Address on file'}</div>
        <div class="text-slate-500 mt-1">Envelope #: <strong>#${donor.envelopeNum}</strong></div>
      </div>

      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
        <div>
          <span class="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Statement Summary:</span>
          <div class="flex justify-between py-0.5">
            <span class="text-slate-600">Total Eligible Tax-Deductible Gifts:</span>
            <span class="font-bold text-emerald-700 text-sm font-mono">${formatUSD(grandTotal)}</span>
          </div>
          <div class="flex justify-between py-0.5">
            <span class="text-slate-600">Non-Deductible Goods Provided:</span>
            <span class="font-bold text-slate-800 font-mono">$0.00</span>
          </div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2">Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>

    <!-- Itemized Giving Table -->
    <div>
      <h3 class="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wide">Itemized Contribution Record</h3>
      <table class="w-full text-left text-xs border border-slate-200">
        <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
          <tr>
            <th class="py-2 px-3">Date</th>
            <th class="py-2 px-3">Fund Category</th>
            <th class="py-2 px-3">Payment Method</th>
            <th class="py-2 px-3">Designation / Notes</th>
            <th class="py-2 px-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="5" class="py-4 text-center text-slate-400">No contributions recorded for this donor in 2026.</td></tr>'}
        </tbody>
        <tfoot class="bg-slate-50 border-t-2 border-slate-300 font-bold">
          <tr>
            <td colspan="4" class="py-2.5 px-3 text-right text-slate-700">Total Tax-Deductible Contributions:</td>
            <td class="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">${formatUSD(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- IRS Compliance Declaration Statement -->
    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2">
      <div class="font-bold text-slate-800">IRS Charitable Contribution Disclosure:</div>
      <p class="leading-relaxed">
        Thank you for your faithful stewardship and support of the mission and ministry of ${state.settings.churchName}.
        In accordance with Internal Revenue Code regulations, no goods or services were provided in whole or in partial exchange for any of the contributions recorded on this statement.
        Please keep this statement for your income tax preparation records.
      </p>
      <div class="pt-4 flex justify-between items-end">
        <div>
          <div class="border-b border-slate-400 w-48 mb-1"></div>
          <p class="text-[10px] text-slate-500">Authorized Signature &bull; Church Treasurer / Finance Trustee</p>
        </div>
        <div class="text-right text-[10px] text-slate-400 font-mono">
          Document Ref: STMT-2026-${donor.envelopeNum}
        </div>
      </div>
    </div>
  `;

  openModal('modalStatement');
  lucide.createIcons();
}

function printStatement() {
  window.print();
}

// -------------------------------------------------------------
// RECEIPT VIEWER LOGIC
// -------------------------------------------------------------
function viewReceipt(receiptId) {
  const item = state.income.find(i => i.id === receiptId);
  if (!item) return;

  const content = document.getElementById('receiptContent');
  if (!content) return;

  content.innerHTML = `
    <div class="text-center pb-4 border-b border-slate-200">
      <div class="w-10 h-10 rounded-xl bg-church-900 text-gold-400 flex items-center justify-center mx-auto mb-2 font-bold">
        <i data-lucide="cross" class="w-5 h-5"></i>
      </div>
      <h2 class="font-bold text-base text-slate-900">${state.settings.churchName}</h2>
      <p class="text-[11px] text-slate-500">${state.settings.address}</p>
      <p class="text-[11px] text-slate-500 font-mono">EIN: ${state.settings.ein}</p>
      <div class="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
        Official Contribution Receipt
      </div>
    </div>

    <div class="py-4 space-y-3 text-xs">
      <div class="flex justify-between">
        <span class="text-slate-500">Receipt Number:</span>
        <span class="font-mono font-bold text-slate-800">${item.id}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Date Received:</span>
        <span class="font-mono text-slate-800">${item.date}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Donor Name:</span>
        <span class="font-bold text-slate-900">${item.donorName}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Envelope #:</span>
        <span class="font-mono text-slate-800">#${item.envelopeNum || 'N/A'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Fund Category:</span>
        <span class="font-semibold text-slate-800">${item.fund}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Service:</span>
        <span class="text-slate-800">${item.service}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Payment Method:</span>
        <span class="text-slate-800">${item.method} (${item.reference || 'None'})</span>
      </div>
      <div class="flex justify-between py-2 border-t border-b border-slate-200 bg-slate-50 px-2 rounded-lg">
        <span class="font-bold text-slate-800 text-sm">Amount Received:</span>
        <span class="font-mono font-black text-emerald-600 text-base">${formatUSD(item.amount)}</span>
      </div>
      ${item.notes ? `<div class="text-[11px] text-slate-500 italic">Note: ${item.notes}</div>` : ''}
    </div>

    <div class="pt-2 text-[10px] text-slate-400 text-center leading-relaxed">
      "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." &mdash; 2 Corinthians 9:7
    </div>
  `;

  openModal('modalReceipt');
  lucide.createIcons();
}

function printReceipt() {
  window.print();
}

// -------------------------------------------------------------
// REPORTS MODULE
// -------------------------------------------------------------
function generateBulletinReport() {
  let sun1st = 0;
  let sun2nd = 0;
  let midweek = 0;
  let online = 0;
  let tithes = 0;
  let missions = 0;
  let building = 0;

  state.income.forEach(item => {
    const amt = parseFloat(item.amount) || 0;
    if (item.service === 'Sunday 1st Service') sun1st += amt;
    else if (item.service === 'Sunday 2nd Service') sun2nd += amt;
    else if (item.service === 'Midweek Service') midweek += amt;
    else online += amt;

    if (item.fund === 'Tithes') tithes += amt;
    else if (item.fund === 'Missions') missions += amt;
    else if (item.fund === 'Building Fund') building += amt;
  });

  const total = sun1st + sun2nd + midweek + online;

  const container = document.getElementById('statementPrintableArea');
  container.innerHTML = `
    <div class="border-2 border-slate-800 p-6 rounded-2xl max-w-lg mx-auto bg-white space-y-4">
      <div class="text-center border-b pb-3">
        <h3 class="font-bold text-base text-slate-900 uppercase">${state.settings.churchName}</h3>
        <p class="text-xs font-semibold text-gold-600">Weekly Stewardship & Financial Transparency Report</p>
        <p class="text-[11px] text-slate-500">For insertion into the Sunday Morning Worship Bulletin</p>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between py-1 border-b border-slate-100">
          <span class="text-slate-600">Sunday 1st Service:</span>
          <span class="font-mono font-bold text-slate-800">${formatUSD(sun1st)}</span>
        </div>
        <div class="flex justify-between py-1 border-b border-slate-100">
          <span class="text-slate-600">Sunday 2nd Service:</span>
          <span class="font-mono font-bold text-slate-800">${formatUSD(sun2nd)}</span>
        </div>
        <div class="flex justify-between py-1 border-b border-slate-100">
          <span class="text-slate-600">Midweek / Online Giving:</span>
          <span class="font-mono font-bold text-slate-800">${formatUSD(midweek + online)}</span>
        </div>
        <div class="flex justify-between py-2 bg-emerald-50 px-2 rounded-lg font-bold">
          <span class="text-emerald-900">Total Weekly Offerings:</span>
          <span class="font-mono text-emerald-700 text-sm">${formatUSD(total)}</span>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <span class="font-bold block text-slate-700 mb-1">Fund Allocation Highlights:</span>
        <div class="grid grid-cols-3 gap-2 text-center font-mono">
          <div class="bg-slate-50 p-2 rounded">
            <span class="block text-[10px] text-slate-400">Tithes</span>
            <span class="font-bold text-slate-800">${formatUSD(tithes)}</span>
          </div>
          <div class="bg-slate-50 p-2 rounded">
            <span class="block text-[10px] text-slate-400">Building</span>
            <span class="font-bold text-slate-800">${formatUSD(building)}</span>
          </div>
          <div class="bg-slate-50 p-2 rounded">
            <span class="block text-[10px] text-slate-400">Missions</span>
            <span class="font-bold text-slate-800">${formatUSD(missions)}</span>
          </div>
        </div>
      </div>

      <p class="text-[10px] text-center text-slate-400 italic pt-2">
        "May the Lord bless and multiply our gifts for His Kingdom work."
      </p>
    </div>
  `;

  openModal('modalStatement');
  lucide.createIcons();
}

function generateBoardReport() {
  let totalIncome = 0;
  state.income.forEach(i => totalIncome += parseFloat(i.amount) || 0);

  let totalExpenses = 0;
  state.expenses.forEach(e => {
    if (e.status === 'Approved') totalExpenses += parseFloat(e.amount) || 0;
  });

  const net = totalIncome - totalExpenses;

  const container = document.getElementById('statementPrintableArea');
  container.innerHTML = `
    <div class="p-4 space-y-6">
      <div class="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
        <div>
          <h2 class="text-xl font-black text-slate-900">${state.settings.churchName}</h2>
          <p class="text-xs text-slate-600">Executive Board of Elders & Finance Committee</p>
          <p class="text-xs text-slate-500">Fiscal Year 2026 - Monthly Financial Overview</p>
        </div>
        <div class="text-right">
          <span class="text-xs bg-church-800 text-gold-400 px-3 py-1 rounded-full font-bold">Confidential / Board Level</span>
          <p class="text-xs text-slate-500 mt-2">Prepared: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-500 font-semibold block uppercase">Total Revenue (YTD)</span>
          <span class="text-xl font-bold text-emerald-700 font-mono">${formatUSD(totalIncome)}</span>
        </div>
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-500 font-semibold block uppercase">Total Expenses (YTD)</span>
          <span class="text-xl font-bold text-rose-700 font-mono">${formatUSD(totalExpenses)}</span>
        </div>
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-500 font-semibold block uppercase">Operating Surplus</span>
          <span class="text-xl font-bold ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-mono">${formatUSD(net)}</span>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-slate-800 text-sm mb-2">Departmental Spending Summary</h3>
        <table class="w-full text-xs text-left border border-slate-200">
          <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th class="py-2 px-3">Department</th>
              <th class="py-2 px-3 text-right">Annual Budget</th>
              <th class="py-2 px-3 text-right">Disbursed</th>
              <th class="py-2 px-3 text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(state.budgets).map(dept => {
              const allocated = state.budgets[dept];
              let spent = 0;
              state.expenses.filter(e => e.dept === dept && e.status === 'Approved').forEach(e => spent += parseFloat(e.amount) || 0);
              const variance = allocated - spent;
              return `
                <tr class="border-b border-slate-100">
                  <td class="py-2 px-3 font-semibold text-slate-800">${dept}</td>
                  <td class="py-2 px-3 text-right font-mono">${formatUSD(allocated)}</td>
                  <td class="py-2 px-3 text-right font-mono text-rose-600">${formatUSD(spent)}</td>
                  <td class="py-2 px-3 text-right font-mono ${variance >= 0 ? 'text-emerald-700' : 'text-rose-600 font-bold'}">${formatUSD(variance)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
        <div>
          <div class="border-b border-slate-400 w-44 mb-1"></div>
          <span>Board Treasurer Signature</span>
        </div>
        <div>
          <div class="border-b border-slate-400 w-44 mb-1"></div>
          <span>Senior Pastor Signature</span>
        </div>
      </div>
    </div>
  `;

  openModal('modalStatement');
  lucide.createIcons();
}

// -------------------------------------------------------------
// AUDIT TRAIL & LOGGING
// -------------------------------------------------------------
function addAuditEntry(action, details) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const operator = state.settings.leadName || 'Church Financial Officer';
  
  state.auditTrail.unshift({
    timestamp,
    operator,
    action,
    details
  });

  // Limit audit trail memory to last 200 items
  if (state.auditTrail.length > 200) {
    state.auditTrail.pop();
  }
}

function renderAuditTrailTable() {
  const tbody = document.getElementById('auditTrailBody');
  const countBadge = document.getElementById('auditLogCount');
  if (!tbody) return;

  tbody.innerHTML = '';
  state.auditTrail.forEach(log => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    let actionColor = 'text-blue-600';
    if (log.action.includes('VOID') || log.action.includes('DELETE')) actionColor = 'text-rose-600';
    else if (log.action.includes('APPROVED') || log.action.includes('COMMITTED')) actionColor = 'text-emerald-600';

    tr.innerHTML = `
      <td class="py-2 px-4 text-slate-500">${log.timestamp}</td>
      <td class="py-2 px-4 text-slate-700 font-medium">${log.operator}</td>
      <td class="py-2 px-4 font-bold ${actionColor}">${log.action}</td>
      <td class="py-2 px-4 text-slate-600">${log.details}</td>
    `;
    tbody.appendChild(tr);
  });

  if (countBadge) {
    countBadge.innerText = `${state.auditTrail.length} verified actions`;
  }
}

// -------------------------------------------------------------
// DATA EXPORT & BACKUP
// -------------------------------------------------------------
function exportToCSV(type) {
  let csvContent = '';
  let filename = '';

  if (type === 'income') {
    filename = `Church_Income_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    const headers = ['ReceiptID', 'Date', 'DonorName', 'EnvelopeNumber', 'FundCategory', 'Service', 'PaymentMethod', 'Reference', 'Amount', 'Notes'];
    const rows = state.income.map(i => [
      `"${i.id}"`,
      `"${i.date}"`,
      `"${i.donorName.replace(/"/g, '""')}"`,
      `"${i.envelopeNum || ''}"`,
      `"${i.fund}"`,
      `"${i.service}"`,
      `"${i.method}"`,
      `"${i.reference || ''}"`,
      i.amount,
      `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);
    csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  } else {
    filename = `Church_Expense_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    const headers = ['VoucherID', 'Date', 'Payee', 'Department', 'Amount', 'PaymentMethod', 'Reference', 'ApprovedBy', 'Status', 'Description'];
    const rows = state.expenses.map(e => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.payee.replace(/"/g, '""')}"`,
      `"${e.dept}"`,
      e.amount,
      `"${e.method}"`,
      `"${e.reference || ''}"`,
      `"${e.approvedBy}"`,
      `"${e.status}"`,
      `"${(e.desc || '').replace(/"/g, '""')}"`
    ]);
    csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadJsonBackup() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Church_Financial_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function restoreJsonBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.income && parsed.expenses) {
        state = parsed;
        saveData();
        renderAllViews();
        closeModal('modalSettings');
        alert('Church financial backup restored successfully!');
      } else {
        alert('Invalid church database format.');
      }
    } catch (err) {
      alert('Error reading JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetToSampleData() {
  if (!confirm('Reload default sample data? Any unbacked modifications will be overwritten.')) return;
  state = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData();
  renderAllViews();
  closeModal('modalSettings');
  alert('Sample records restored.');
}

function clearAllData() {
  if (!confirm('DANGER: Wipe all income, expenses, and donor logs? This cannot be undone unless you have a JSON backup.')) return;
  state.income = [];
  state.expenses = [];
  state.auditTrail = [];
  addAuditEntry('DATABASE_WIPED', 'Ledger was purged by authorized user.');
  saveData();
  renderAllViews();
  closeModal('modalSettings');
  alert('Ledger cleared.');
}

function saveChurchSettings() {
  const name = document.getElementById('settingChurchName').value.trim();
  const ein = document.getElementById('settingTaxId').value.trim();
  const lead = document.getElementById('settingLeadName').value.trim();

  if (name) state.settings.churchName = name;
  if (ein) state.settings.ein = ein;
  if (lead) state.settings.leadName = lead;

  saveData();
  setupDefaults();
  renderAllViews();
  closeModal('modalSettings');
  alert('Church organization settings updated.');
}
