// Church Financial Log - Core Application Script
// Implements all 19 church accounting and stewardship requirements

const STORAGE_KEY = 'CHURCH_FINANCIAL_LOG_V2';

// Master Initial State with comprehensive structure
const DEFAULT_STATE = {
  currentInterval: 'monthly', // 'monthly' | 'quarterly' | 'yearly'
  currentTitheMonthOffset: 0, // 0 = current month, -1 = previous, etc.
  currentUser: {
    id: 'USR-001',
    name: 'Pastor David Miller',
    role: 'Administrator',
    pin: '1234',
    isAdmin: true
  },
  users: [
    {
      id: 'USR-001',
      name: 'Pastor David Miller',
      role: 'Administrator',
      pin: '1234',
      isAdmin: true,
      permissions: ['Log Income', 'Disburse Expenditures', 'Print Official Reports', 'Manage Users']
    },
    {
      id: 'USR-002',
      name: 'Elder Martha Clark',
      role: 'Finance Secretary',
      pin: '2345',
      isAdmin: false,
      permissions: ['Log Income', 'Disburse Expenditures', 'Print Official Reports']
    },
    {
      id: 'USR-003',
      name: 'Deacon Robert Vance',
      role: 'Counting Trustee',
      pin: '3456',
      isAdmin: false,
      permissions: ['Log Income']
    },
    {
      id: 'USR-004',
      name: 'Sarah Taylor (CPA)',
      role: 'Internal Auditor',
      pin: '4567',
      isAdmin: false,
      permissions: ['Print Official Reports']
    }
  ],
  churchInfo: {
    name: 'Grace Community Church',
    address: '425 Cornerstone Way, Springfield, IL 62701',
    phone: '(555) 234-5678',
    ein: 'XX-XXXXXXX (501(c)(3) Non-Profit)'
  },
  categories: {
    INCOME: [
      {
        name: 'Tithes & Covenant Giving',
        variants: ['General Tithes', 'First Fruits', 'Pastor Support Tithe']
      },
      {
        name: 'Sunday Offerings',
        variants: ['Sunday 1st Service Collection', 'Sunday 2nd Service Collection', 'Midweek Service Basket']
      },
      {
        name: 'Building & Capital Campaign',
        variants: ['Sanctuary Expansion', 'Roof Replacement Fund', 'Pews & Seating']
      },
      {
        name: 'Missions & Evangelism',
        variants: ['Kenya Foreign Mission', 'Local Food Pantry Support', 'Prison Ministry Outreach']
      },
      {
        name: 'Special Thanksgiving & Seed',
        variants: ['Annual Harvest Seed', 'Child Dedication Thanksgiving', 'Wedding Thanksgiving']
      }
    ],
    EXPENSE: [
      {
        name: 'Utilities',
        variants: ['Water', 'Electricity', 'Wifi & Internet', 'Generator Fuel & Gas']
      },
      {
        name: 'Facilities & Maintenance',
        variants: ['Sanctuary Cleaning', 'HVAC Service', 'Building Repairs & Paint', 'Security System']
      },
      {
        name: 'Pastoral & Personnel',
        variants: ['Senior Pastor Stipend', 'Youth Pastor Compensation', 'Guest Preacher Honorarium', 'Staff Benefits']
      },
      {
        name: 'Audio, Visual & Media',
        variants: ['Soundboard Cables & Mics', 'Livestream Cameras & Software', 'Projector Maintenance']
      },
      {
        name: 'Worship & Music',
        variants: ['Keyboard & Instruments', 'Sheet Music Licenses (CCLI)', 'Choir Robes & Supplies']
      },
      {
        name: 'Administration & Office',
        variants: ['Sunday Bulletin Printing', 'Accounting Software', 'Bank Service Charges', 'Postage']
      },
      {
        name: 'Benevolence & Community',
        variants: ['Emergency Family Relief', 'Food Pantry Groceries', 'Shelter Assistance']
      }
    ]
  },
  budgets: {
    'Utilities': { monthly: 1500, quarterly: 4500, yearly: 18000 },
    'Facilities & Maintenance': { monthly: 1200, quarterly: 3600, yearly: 14400 },
    'Pastoral & Personnel': { monthly: 4500, quarterly: 13500, yearly: 54000 },
    'Audio, Visual & Media': { monthly: 600, quarterly: 1800, yearly: 7200 },
    'Worship & Music': { monthly: 400, quarterly: 1200, yearly: 4800 },
    'Administration & Office': { monthly: 500, quarterly: 1500, yearly: 6000 },
    'Benevolence & Community': { monthly: 800, quarterly: 2400, yearly: 9600 }
  },
  savings: {
    accounts: [
      {
        id: 'SAV-01',
        name: 'Building & Capital Reserve',
        balance: 24500.00,
        target: 50000.00,
        desc: 'Dedicated reserve for sanctuary expansion and facility upgrades'
      },
      {
        id: 'SAV-02',
        name: 'Emergency Welfare Fund',
        balance: 12800.00,
        target: 20000.00,
        desc: 'Parishioner benevolent relief and disaster assistance fund'
      },
      {
        id: 'SAV-03',
        name: 'Youth & Education Endowment',
        balance: 6200.00,
        target: 15000.00,
        desc: 'Camp scholarships and Christian education seed funding'
      }
    ],
    history: [
      { date: '2026-09-01', account: 'Building & Capital Reserve', amount: 1500.00, desc: 'Monthly surplus allocation' },
      { date: '2026-08-01', account: 'Building & Capital Reserve', amount: 1200.00, desc: 'Monthly surplus allocation' },
      { date: '2026-08-15', account: 'Emergency Welfare Fund', amount: 800.00, desc: 'Special benevolence transfer' }
    ]
  },
  goals: [
    {
      id: 'GOL-01',
      title: 'New Sanctuary Audio Console',
      interval: 'Quarterly',
      target: 8500.00,
      current: 6200.00,
      category: 'Audio, Visual & Media'
    },
    {
      id: 'GOL-02',
      title: 'Annual Harvest Thanksgiving Goal',
      interval: 'Yearly',
      target: 40000.00,
      current: 28400.00,
      category: 'Special Thanksgiving & Seed'
    },
    {
      id: 'GOL-03',
      title: 'Monthly Community Food Pantry Drive',
      interval: 'Monthly',
      target: 1200.00,
      current: 950.00,
      category: 'Benevolence & Community'
    }
  ],
  transactions: [
    // Income Transactions (Requirement 14/15: custody Bank vs Cash on Hand; Req 16: description required)
    {
      id: 'TX-INC-001',
      type: 'INCOME',
      date: '2026-09-07',
      category: 'Sunday Offerings',
      variant: 'Sunday 1st Service Collection',
      entity: 'Sunday Congregation',
      amount: 2480.00,
      custody: 'Bank', // Sent to Bank
      description: 'First service open collection baskets deposited directly to church bank account.',
      recordedBy: 'Deacon Robert Vance'
    },
    {
      id: 'TX-INC-002',
      type: 'INCOME',
      date: '2026-09-07',
      category: 'Sunday Offerings',
      variant: 'Sunday 2nd Service Collection',
      entity: 'Sunday Congregation',
      amount: 1940.00,
      custody: 'Cash on Hand', // Cash in Safe
      description: 'Second service collection retained in vault safe for weekly operational needs.',
      recordedBy: 'Deacon Robert Vance'
    },
    {
      id: 'TX-INC-003',
      type: 'INCOME',
      date: '2026-09-08',
      category: 'Building & Capital Campaign',
      variant: 'Sanctuary Expansion',
      entity: 'Elder Robert & Martha Vance',
      amount: 1500.00,
      custody: 'Bank',
      description: 'Pledge check #3021 for Phase 2 Sanctuary building wing expansion.',
      recordedBy: 'Elder Martha Clark'
    },
    {
      id: 'TX-INC-004',
      type: 'INCOME',
      date: '2026-09-09',
      category: 'Missions & Evangelism',
      variant: 'Kenya Foreign Mission',
      entity: 'Dr. Samuel & Grace Taylor',
      amount: 600.00,
      custody: 'Bank',
      description: 'Direct wire donation for rural medical outreach in Kenya.',
      recordedBy: 'Pastor David Miller'
    },

    // Tithes recorded via Tithe Page (Tithe entries update general ledger; eCash vs Physical)
    {
      id: 'TX-TITHE-20260907-1',
      type: 'INCOME',
      isTithe: true,
      date: '2026-09-07',
      category: 'Tithes & Covenant Giving',
      variant: 'General Tithes',
      entity: 'Jonathan & Sarah Edwards',
      amount: 1250.00,
      isECash: false, // Physical Cash
      custody: 'Cash on Hand',
      description: 'Tithe logged via Tithe Page [Physical Money]',
      recordedBy: 'Pastor David Miller'
    },
    {
      id: 'TX-TITHE-20260907-2',
      type: 'INCOME',
      isTithe: true,
      date: '2026-09-07',
      category: 'Tithes & Covenant Giving',
      variant: 'General Tithes',
      entity: 'Michael Chen',
      amount: 750.00,
      isECash: true, // E-Cash
      custody: 'Bank',
      description: 'Tithe logged via Tithe Page [E-Cash / Electronic]',
      recordedBy: 'Pastor David Miller'
    },
    {
      id: 'TX-TITHE-20260910-1',
      type: 'INCOME',
      isTithe: true,
      date: '2026-09-10',
      category: 'Tithes & Covenant Giving',
      variant: 'General Tithes',
      entity: 'Hannah O\'Connor',
      amount: 450.00,
      isECash: true, // E-Cash
      custody: 'Bank',
      description: 'Tithe logged via Tithe Page [E-Cash / Electronic]',
      recordedBy: 'Elder Martha Clark'
    },

    // Expenses (Req 12: Split into variants; Req 16: description required)
    {
      id: 'TX-EXP-001',
      type: 'EXPENSE',
      date: '2026-09-03',
      category: 'Utilities',
      variant: 'Electricity',
      entity: 'Midwest Electric Power Co.',
      amount: 720.00,
      custody: 'Bank',
      description: 'Monthly electric bill for the main auditorium and administrative offices.',
      recordedBy: 'Elder Martha Clark'
    },
    {
      id: 'TX-EXP-002',
      type: 'EXPENSE',
      date: '2026-09-04',
      category: 'Utilities',
      variant: 'Water',
      entity: 'Springfield Municipal Water',
      amount: 185.50,
      custody: 'Bank',
      description: 'Municipal water and sanitation utilities for facility restrooms and kitchen.',
      recordedBy: 'Elder Martha Clark'
    },
    {
      id: 'TX-EXP-003',
      type: 'EXPENSE',
      date: '2026-09-05',
      category: 'Utilities',
      variant: 'Wifi & Internet',
      entity: 'Comcast Business Fiber',
      amount: 149.99,
      custody: 'Bank',
      description: 'High-speed fiber line for livestreaming church worship services.',
      recordedBy: 'Elder Martha Clark'
    },
    {
      id: 'TX-EXP-004',
      type: 'EXPENSE',
      date: '2026-09-05',
      category: 'Pastoral & Personnel',
      variant: 'Senior Pastor Stipend',
      entity: 'Pastor David Miller',
      amount: 3200.00,
      custody: 'Bank',
      description: 'Semi-monthly pastoral payroll and ministry housing allowance.',
      recordedBy: 'Elder Martha Clark'
    },
    {
      id: 'TX-EXP-005',
      type: 'EXPENSE',
      date: '2026-09-08',
      category: 'Benevolence & Community',
      variant: 'Food Pantry Groceries',
      entity: 'Aldi Wholesale Foods',
      amount: 420.00,
      custody: 'Cash on Hand',
      description: 'Purchased dry staples, canned goods, and baby supplies for community pantry distribution.',
      recordedBy: 'Deacon Robert Vance'
    },
    {
      id: 'TX-EXP-006',
      type: 'EXPENSE',
      date: '2026-09-11',
      category: 'Audio, Visual & Media',
      variant: 'Soundboard Cables & Mics',
      entity: 'Sweetwater Sound Inc.',
      amount: 310.00,
      custody: 'Bank',
      description: 'Two Shure SM58 microphone replacements and four high-grade 50ft XLR stage cables.',
      recordedBy: 'Elder Martha Clark'
    }
  ]
};

// Global active state
let appState = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Chart.js instances
let chartIncomePieInstance = null;
let chartExpensePieInstance = null;

// Pending confirmation callback
let pendingConfirmCallback = null;

// Selected date for tithe modal
let activeTitheDayDate = null;

// -------------------------------------------------------------
// APP INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadAppState();
  setupUserSession();
  setupIntervalUI();
  initPieCharts();
  renderCurrentPage();
  lucide.createIcons();
});

function loadAppState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appState = JSON.parse(saved);
      // Ensure users exist
      if (!appState.users || appState.users.length === 0) {
        appState.users = DEFAULT_STATE.users;
      }
      if (!appState.categories) {
        appState.categories = DEFAULT_STATE.categories;
      }
    } catch (e) {
      console.error('Failed to parse stored state, using defaults', e);
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveAppState();
  }
}

function saveAppState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

// -------------------------------------------------------------
// AUTHENTICATION & ACCESS CONTROL (Requirement 4 & 19)
// -------------------------------------------------------------
function setupUserSession() {
  updateUserUI();
  populateLoginUserDropdown();
}

function updateUserUI() {
  const user = appState.currentUser;
  if (!user) return;

  const initialEl = document.getElementById('userInitial');
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');

  if (initialEl) initialEl.innerText = user.name.charAt(0).toUpperCase();
  if (nameEl) nameEl.innerText = user.name;
  if (roleEl) roleEl.innerText = user.role;
}

function populateLoginUserDropdown() {
  const select = document.getElementById('loginUserSelect');
  if (!select) return;
  select.innerHTML = '';
  appState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = `${u.name} (${u.role})`;
    select.appendChild(opt);
  });
}

function handleLogin() {
  const select = document.getElementById('loginUserSelect');
  const pinInput = document.getElementById('loginPin');
  const selectedUser = appState.users.find(u => u.id === select.value);

  if (!selectedUser) {
    alert('User not found.');
    return;
  }

  if (pinInput.value !== selectedUser.pin) {
    alert('Incorrect PIN. For demo admin, enter 1234.');
    return;
  }

  appState.currentUser = selectedUser;
  document.getElementById('authOverlay').classList.add('hidden');
  pinInput.value = '';
  updateUserUI();
  saveAppState();
  renderCurrentPage();
  alert(`Welcome back, ${selectedUser.name}!`);
}

function handleSignOut() {
  showConfirmation(
    'Sign Out',
    'Are you sure you want to sign out and lock the financial ledger?',
    () => {
      document.getElementById('authOverlay').classList.remove('hidden');
      populateLoginUserDropdown();
    },
    'rose'
  );
}

// -------------------------------------------------------------
// NAVIGATION (Requirement 18 & 19)
// Pages: home, budget, tithe, savings, goals, editUsers
// -------------------------------------------------------------
let activePage = 'home';

function navigateTo(pageId) {
  // Check admin permission for editUsers
  if (pageId === 'editUsers' && !appState.currentUser.isAdmin) {
    alert('Access Restricted: Only the Lead Administrator can view and edit user accounts.');
    return;
  }

  activePage = pageId;

  // Toggle page visibility
  document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.remove('hidden');

  // Update sidebar active styling
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active', 'bg-church-900', 'text-white');
    btn.classList.add('text-slate-300');
  });
  const activeBtn = document.getElementById(`nav-${pageId}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.classList.remove('text-slate-300');
  }

  renderCurrentPage();
  lucide.createIcons();
}

function renderCurrentPage() {
  updateQuotaBadge();

  if (activePage === 'home') {
    renderHomeMetrics();
    renderLedgerTable();
    updatePieCharts();
  } else if (activePage === 'budget') {
    renderBudgetPage();
  } else if (activePage === 'tithe') {
    renderTitheCalendar();
  } else if (activePage === 'savings') {
    renderSavingsPage();
  } else if (activePage === 'goals') {
    renderGoalsPage();
  } else if (activePage === 'editUsers') {
    renderUsersTable();
  }
}

// -------------------------------------------------------------
// INTERVAL SWITCHER (Requirement 1: Monthly, Quarterly, Yearly)
// -------------------------------------------------------------
function setTimeInterval(interval) {
  appState.currentInterval = interval;
  saveAppState();
  setupIntervalUI();
  renderCurrentPage();
}

function setupIntervalUI() {
  const current = appState.currentInterval;
  ['monthly', 'quarterly', 'yearly'].forEach(int => {
    const btn = document.getElementById(`btn-interval-${int}`);
    if (btn) {
      if (int === current) {
        btn.classList.add('active', 'bg-white', 'text-slate-900', 'shadow-sm');
        btn.classList.remove('text-slate-600');
      } else {
        btn.classList.remove('active', 'bg-white', 'text-slate-900', 'shadow-sm');
        btn.classList.add('text-slate-600');
      }
    }
  });

  const labelEl = document.getElementById('activeIntervalLabel');
  if (labelEl) {
    if (current === 'monthly') labelEl.innerText = 'September 2026';
    else if (current === 'quarterly') labelEl.innerText = 'Q3 2026 (Jul - Sep)';
    else labelEl.innerText = 'Fiscal Year 2026';
  }
}

// Helper: check if a transaction date matches the current active interval
function matchesActiveInterval(dateStr) {
  if (!dateStr) return false;
  const current = appState.currentInterval;
  
  if (current === 'monthly') {
    return dateStr.startsWith('2026-09');
  } else if (current === 'quarterly') {
    // Q3: 07, 08, 09
    return dateStr.startsWith('2026-07') || dateStr.startsWith('2026-08') || dateStr.startsWith('2026-09');
  } else {
    // Yearly
    return dateStr.startsWith('2026');
  }
}

// -------------------------------------------------------------
// QUOTA REMINDER & ALERT (Requirement 2 & 3)
// -------------------------------------------------------------
function updateQuotaBadge() {
  const interval = appState.currentInterval;
  
  // Calculate total budget for this interval
  let totalBudget = 0;
  Object.keys(appState.budgets).forEach(cat => {
    totalBudget += appState.budgets[cat][interval] || 0;
  });

  // Calculate total expenses for this interval
  let totalExpenses = 0;
  appState.transactions.filter(tx => tx.type === 'EXPENSE' && matchesActiveInterval(tx.date)).forEach(tx => {
    totalExpenses += tx.amount;
  });

  const pct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

  // Sidebar badge elements
  const sidePct = document.getElementById('sidebarQuotaPct');
  const sideBar = document.getElementById('sidebarQuotaBar');
  const sideStatus = document.getElementById('sidebarQuotaStatus');

  if (sidePct) sidePct.innerText = `${pct}%`;
  if (sideBar) {
    sideBar.style.width = `${Math.min(pct, 100)}%`;
    sideBar.className = pct > 100 ? 'bg-rose-500 h-full rounded-full' : (pct >= 80 ? 'bg-amber-500 h-full rounded-full' : 'bg-emerald-500 h-full rounded-full');
  }
  if (sideStatus) {
    if (pct > 100) {
      sideStatus.innerText = 'OVER QUOTA! Exceeded limit';
      sideStatus.className = 'text-[10px] text-rose-400 font-bold';
    } else if (pct >= 80) {
      sideStatus.innerText = 'Caution: Approaching limit';
      sideStatus.className = 'text-[10px] text-amber-300 font-medium';
    } else {
      sideStatus.innerText = 'Within Budget Quota';
      sideStatus.className = 'text-[10px] text-emerald-300 font-medium';
    }
  }

  // Home Page Banner elements
  const banner = document.getElementById('quotaBanner');
  const bannerIcon = document.getElementById('quotaBannerIcon');
  const bannerTitle = document.getElementById('quotaBannerTitle');
  const bannerSub = document.getElementById('quotaBannerSubtitle');
  const bannerPct = document.getElementById('quotaBannerPct');

  if (banner) {
    if (pct > 100) {
      banner.className = 'p-4 rounded-2xl border flex items-center justify-between shadow-sm bg-rose-50 border-rose-200 text-rose-900';
      bannerIcon.className = 'w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600';
      bannerTitle.innerText = 'OVER QUOTA ALERT!';
      bannerSub.innerText = `Expenses (${formatUSD(totalExpenses)}) have EXCEEDED the approved ${interval} quota of ${formatUSD(totalBudget)}!`;
      bannerPct.className = 'text-xl font-black font-mono text-rose-600';
    } else if (pct >= 80) {
      banner.className = 'p-4 rounded-2xl border flex items-center justify-between shadow-sm bg-amber-50 border-amber-200 text-amber-900';
      bannerIcon.className = 'w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600';
      bannerTitle.innerText = 'Quota Warning: Nearing Budget Limit';
      bannerSub.innerText = `${pct}% of the ${interval} budget limit (${formatUSD(totalBudget)}) has been disbursed.`;
      bannerPct.className = 'text-xl font-black font-mono text-amber-600';
    } else {
      banner.className = 'p-4 rounded-2xl border flex items-center justify-between shadow-sm bg-emerald-50 border-emerald-200 text-emerald-900';
      bannerIcon.className = 'w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600';
      bannerTitle.innerText = 'Within Budget Quota';
      bannerSub.innerText = `Healthy stewardship: ${pct}% utilized of the ${formatUSD(totalBudget)} ${interval} allocation.`;
      bannerPct.className = 'text-xl font-black font-mono text-emerald-600';
    }
    bannerPct.innerText = `${pct}%`;
  }
}

// -------------------------------------------------------------
// HOME PAGE METRICS & CUSTODY (Requirements 3 & 15)
// -------------------------------------------------------------
function renderHomeMetrics() {
  const currentTxs = appState.transactions.filter(tx => matchesActiveInterval(tx.date));

  let totalIncome = 0;
  let totalExpenses = 0;
  let bankIncome = 0;
  let bankExpense = 0;
  let cashIncome = 0;
  let cashExpense = 0;

  currentTxs.forEach(tx => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
      if (tx.custody === 'Bank') bankIncome += tx.amount;
      else cashIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (tx.custody === 'Bank') bankExpense += tx.amount;
      else cashExpense += tx.amount;
    }
  });

  const netBalance = totalIncome - totalExpenses;
  const netBank = bankIncome - bankExpense;
  const netCash = cashIncome - cashExpense;

  document.getElementById('cardTotalIncome').innerText = formatUSD(totalIncome);
  document.getElementById('cardTotalExpenses').innerText = formatUSD(totalExpenses);
  document.getElementById('cardNetBalance').innerText = formatUSD(netBalance);

  document.getElementById('cardBankTotal').innerText = formatUSD(netBank);
  document.getElementById('cardCashOnHand').innerText = formatUSD(netCash);

  const subtextInterval = appState.currentInterval.toUpperCase();
  document.getElementById('cardIncomeSubtext').innerText = `${subtextInterval} total receipts`;
  document.getElementById('cardExpenseSubtext').innerText = `${subtextInterval} disbursements`;
  document.getElementById('cardBalanceSubtext').innerText = `${subtextInterval} operating reserve`;
}

// -------------------------------------------------------------
// VISUAL PIE CHARTS (Requirement 6)
// -------------------------------------------------------------
function initPieCharts() {
  const ctxIncome = document.getElementById('chartIncomePie');
  const ctxExpense = document.getElementById('chartExpensePie');

  if (ctxIncome) {
    chartIncomePieInstance = new Chart(ctxIncome, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  if (ctxExpense) {
    chartExpensePieInstance = new Chart(ctxExpense, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#f43f5e', '#f97316', '#eab308', '#6366f1', '#14b8a6', '#a855f7', '#64748b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function updatePieCharts() {
  if (!chartIncomePieInstance || !chartExpensePieInstance) return;

  const currentTxs = appState.transactions.filter(tx => matchesActiveInterval(tx.date));

  // Tally Income Categories
  const incomeCatMap = {};
  currentTxs.filter(t => t.type === 'INCOME').forEach(t => {
    incomeCatMap[t.category] = (incomeCatMap[t.category] || 0) + t.amount;
  });

  const incLabels = Object.keys(incomeCatMap);
  const incValues = Object.values(incomeCatMap);

  chartIncomePieInstance.data.labels = incLabels.length > 0 ? incLabels : ['No data'];
  chartIncomePieInstance.data.datasets[0].data = incValues.length > 0 ? incValues : [1];
  chartIncomePieInstance.update();

  // Populate Income Legend
  const incLegend = document.getElementById('legendIncomePie');
  if (incLegend) {
    incLegend.innerHTML = '';
    const colors = chartIncomePieInstance.data.datasets[0].backgroundColor;
    incLabels.forEach((lbl, i) => {
      const el = document.createElement('div');
      el.className = 'flex items-center space-x-1.5 truncate';
      el.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${colors[i % colors.length]}"></span>
        <span class="truncate text-[11px]">${lbl}: <strong>${formatUSD(incValues[i])}</strong></span>
      `;
      incLegend.appendChild(el);
    });
  }

  // Tally Expense Categories
  const expenseCatMap = {};
  currentTxs.filter(t => t.type === 'EXPENSE').forEach(t => {
    expenseCatMap[t.category] = (expenseCatMap[t.category] || 0) + t.amount;
  });

  const expLabels = Object.keys(expenseCatMap);
  const expValues = Object.values(expenseCatMap);

  chartExpensePieInstance.data.labels = expLabels.length > 0 ? expLabels : ['No data'];
  chartExpensePieInstance.data.datasets[0].data = expValues.length > 0 ? expValues : [1];
  chartExpensePieInstance.update();

  // Populate Expense Legend
  const expLegend = document.getElementById('legendExpensePie');
  if (expLegend) {
    expLegend.innerHTML = '';
    const colors = chartExpensePieInstance.data.datasets[0].backgroundColor;
    expLabels.forEach((lbl, i) => {
      const el = document.createElement('div');
      el.className = 'flex items-center space-x-1.5 truncate';
      el.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${colors[i % colors.length]}"></span>
        <span class="truncate text-[11px]">${lbl}: <strong>${formatUSD(expValues[i])}</strong></span>
      `;
      expLegend.appendChild(el);
    });
  }
}

// -------------------------------------------------------------
// GENERAL LEDGER TABLE (Requirements 8, 9, 12, 14, 15, 16)
// -------------------------------------------------------------
function renderLedgerTable() {
  const tbody = document.getElementById('ledgerTableBody');
  if (!tbody) return;

  const search = (document.getElementById('ledgerSearch')?.value || '').toLowerCase();
  const filterType = document.getElementById('ledgerFilterType')?.value || 'ALL';

  const filtered = appState.transactions.filter(tx => {
    const matchInterval = matchesActiveInterval(tx.date);
    const matchType = filterType === 'ALL' || tx.type === filterType;
    const matchSearch = tx.id.toLowerCase().includes(search) ||
                        tx.entity.toLowerCase().includes(search) ||
                        tx.category.toLowerCase().includes(search) ||
                        (tx.description && tx.description.toLowerCase().includes(search));
    return matchInterval && matchType && matchSearch;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400 text-xs">
          No transactions found for the selected ${appState.currentInterval} period.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(tx => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    const isInc = tx.type === 'INCOME';
    const typeBadge = isInc
      ? '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Income</span>'
      : '<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">Disbursement</span>';

    const custodyBadge = tx.custody === 'Bank'
      ? '<span class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">Bank</span>'
      : '<span class="text-[10px] bg-accent-50 text-accent-700 px-2 py-0.5 rounded font-mono font-bold">Cash on Hand</span>';

    const amountFormatted = isInc ? `+${formatUSD(tx.amount)}` : `-${formatUSD(tx.amount)}`;
    const amountClass = isInc ? 'text-emerald-600 font-black' : 'text-rose-600 font-black';

    tr.innerHTML = `
      <td class="py-3 px-4 font-mono text-slate-500">${tx.date}</td>
      <td class="py-3 px-4">${typeBadge}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-800">${tx.category}</div>
        <div class="text-[10px] text-slate-500 flex items-center space-x-1">
          <span class="text-slate-400">&bull;</span>
          <span>Variant: <strong>${tx.variant || 'General'}</strong></span>
        </div>
      </td>
      <td class="py-3 px-4 text-slate-900 font-semibold">${tx.entity}</td>
      <td class="py-3 px-4 text-slate-600 max-w-xs truncate" title="${tx.description || ''}">${tx.description || '-'}</td>
      <td class="py-3 px-4">${custodyBadge}</td>
      <td class="py-3 px-4 text-right font-mono text-sm ${amountClass}">${amountFormatted}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="confirmDeleteTransaction('${tx.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Record">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function confirmDeleteTransaction(id) {
  const tx = appState.transactions.find(t => t.id === id);
  if (!tx) return;

  showConfirmation(
    'Delete Financial Record',
    `Are you sure you want to permanently delete ${tx.type} entry ${tx.id} for ${formatUSD(tx.amount)}? This will update the balance immediately.`,
    () => {
      appState.transactions = appState.transactions.filter(t => t.id !== id);
      saveAppState();
      renderCurrentPage();
    },
    'rose'
  );
}

// -------------------------------------------------------------
// USER CONFIRMATION PROMPT MODAL (Requirement 8 & 9)
// -------------------------------------------------------------
function showConfirmation(title, message, onConfirm, theme = 'amber') {
  const modal = document.getElementById('modalConfirm');
  const titleEl = document.getElementById('confirmTitle');
  const msgEl = document.getElementById('confirmMessage');
  const acceptBtn = document.getElementById('confirmAcceptBtn');
  const iconContainer = document.getElementById('confirmIconContainer');

  if (titleEl) titleEl.innerText = title;
  if (msgEl) msgEl.innerText = message;

  if (theme === 'rose') {
    iconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-rose-50 text-rose-600 border border-rose-200';
    acceptBtn.className = 'flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition';
  } else {
    iconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-amber-50 text-amber-600 border border-amber-200';
    acceptBtn.className = 'flex-1 py-2.5 bg-church-900 hover:bg-church-800 text-white font-bold rounded-xl text-xs shadow transition';
  }

  pendingConfirmCallback = onConfirm;
  modal.classList.remove('hidden');

  acceptBtn.onclick = () => {
    modal.classList.add('hidden');
    if (pendingConfirmCallback) {
      pendingConfirmCallback();
      pendingConfirmCallback = null;
    }
  };
}

function closeConfirmModal() {
  document.getElementById('modalConfirm').classList.add('hidden');
  pendingConfirmCallback = null;
}

// -------------------------------------------------------------
// INCOME & EXPENDITURE FORM HANDLERS (Req 7, 8, 12, 15, 16)
// -------------------------------------------------------------
function handleIncomeFormSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('incDate').value;
  const custody = document.getElementById('incCustody').value;
  const category = document.getElementById('incCategory').value;
  const variant = document.getElementById('incVariant').value;
  const entity = document.getElementById('incDonor').value.trim();
  const amount = parseFloat(document.getElementById('incAmount').value);
  const description = document.getElementById('incDesc').value.trim();

  if (!date || isNaN(amount) || amount <= 0 || !entity || !description) {
    alert('Please fill out all required fields including the description.');
    return;
  }

  showConfirmation(
    'Commit Income Entry',
    `Record income of ${formatUSD(amount)} under ${category} (${variant}) and update ledger balances?`,
    () => {
      const id = `TX-INC-${Date.now()}`;
      appState.transactions.unshift({
        id,
        type: 'INCOME',
        date,
        custody,
        category,
        variant,
        entity,
        amount,
        description,
        recordedBy: appState.currentUser.name
      });

      saveAppState();
      renderCurrentPage();
      closeModal('modalIncome');
      e.target.reset();
    }
  );
}

function handleExpenseFormSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('expDate').value;
  const custody = document.getElementById('expCustody').value;
  const category = document.getElementById('expCategory').value;
  const variant = document.getElementById('expVariant').value;
  const entity = document.getElementById('expPayee').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const description = document.getElementById('expDesc').value.trim();

  if (!date || isNaN(amount) || amount <= 0 || !entity || !description) {
    alert('Please fill out all required fields including the description.');
    return;
  }

  showConfirmation(
    'Commit Expense Disbursement',
    `Disburse ${formatUSD(amount)} for ${entity} under ${category} (${variant})?`,
    () => {
      const id = `TX-EXP-${Date.now()}`;
      appState.transactions.unshift({
        id,
        type: 'EXPENSE',
        date,
        custody,
        category,
        variant,
        entity,
        amount,
        description,
        recordedBy: appState.currentUser.name
      });

      saveAppState();
      renderCurrentPage();
      closeModal('modalExpense');
      e.target.reset();
    }
  );
}

// Populate Subcategory Variants dynamically (Requirement 12)
function populateSubcategories(categorySelectId, variantSelectId) {
  const catSelect = document.getElementById(categorySelectId);
  const varSelect = document.getElementById(variantSelectId);
  if (!catSelect || !varSelect) return;

  const isIncome = categorySelectId.startsWith('inc');
  const catList = isIncome ? appState.categories.INCOME : appState.categories.EXPENSE;
  const selectedCatObj = catList.find(c => c.name === catSelect.value);

  varSelect.innerHTML = '';
  if (selectedCatObj && selectedCatObj.variants) {
    selectedCatObj.variants.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.innerText = v;
      varSelect.appendChild(opt);
    });
  } else {
    const opt = document.createElement('option');
    opt.value = 'General';
    opt.innerText = 'General';
    varSelect.appendChild(opt);
  }
}

// -------------------------------------------------------------
// DEDICATED TITHE PAGE LOGIC (Requirements 13, 16, 17)
// Rounded boxes with dates of current month under them;
// Tapping opens day entry; tithe and e-cash checkboxes; updates general ledger;
// Description does NOT apply to tithe page.
// -------------------------------------------------------------
function changeTitheMonth(direction) {
  appState.currentTitheMonthOffset += direction;
  renderTitheCalendar();
}

function renderTitheCalendar() {
  const container = document.getElementById('titheCalendarGrid');
  const monthYearLabel = document.getElementById('titheCalendarMonthYear');
  if (!container) return;

  // Calculate target month and year
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + appState.currentTitheMonthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (monthYearLabel) {
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;
  }

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = `${year}-${(month + 1).toString().padStart(2, '0')}`;

  // Tally for Month
  let monthPhysical = 0;
  let monthECash = 0;

  appState.transactions.filter(t => t.isTithe && t.date.startsWith(monthStr)).forEach(t => {
    if (t.isECash) monthECash += t.amount;
    else monthPhysical += t.amount;
  });

  document.getElementById('titheMonthPhysical').innerText = formatUSD(monthPhysical);
  document.getElementById('titheMonthECash').innerText = formatUSD(monthECash);
  document.getElementById('titheMonthTotal').innerText = formatUSD(monthPhysical + monthECash);

  container.innerHTML = '';

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${monthStr}-${day.toString().padStart(2, '0')}`;
    const dayTithes = appState.transactions.filter(t => t.isTithe && t.date === dayStr);
    
    let dayTotal = 0;
    let dayHasECash = false;
    let dayHasPhysical = false;

    dayTithes.forEach(t => {
      dayTotal += t.amount;
      if (t.isECash) dayHasECash = true;
      else dayHasPhysical = true;
    });

    const isToday = (day === now.getDate() && month === now.getMonth() && year === now.getFullYear());

    // Rounded box with date under it (Requirement 17)
    const card = document.createElement('div');
    card.className = `tithe-day-card p-3 rounded-2xl border text-center transition flex flex-col justify-between h-28 ${
      dayTithes.length > 0 ? 'has-tithes bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'
    } ${isToday ? 'ring-2 ring-blue-500' : ''}`;

    card.onclick = () => openTitheDayModal(dayStr);

    let badgeHtml = '';
    if (dayTithes.length > 0) {
      badgeHtml = `
        <div class="mt-1 flex items-center justify-center space-x-1">
          ${dayHasPhysical ? '<span class="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Cash</span>' : ''}
          ${dayHasECash ? '<span class="text-[9px] bg-accent-200 text-accent-900 px-1.5 py-0.5 rounded font-bold">E-Cash</span>' : ''}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span>Day</span>
        ${isToday ? '<span class="text-[10px] text-blue-600 font-bold">Today</span>' : ''}
      </div>
      
      <div class="my-auto">
        <div class="text-xl font-black text-slate-800">${day}</div>
        ${dayTotal > 0 ? `<div class="text-xs font-black text-emerald-700 font-mono">${formatUSD(dayTotal)}</div>` : '<div class="text-[10px] text-slate-400">No Tithes</div>'}
        ${badgeHtml}
      </div>

      <!-- Date of current month under the box (Requirement 17) -->
      <div class="pt-1 border-t border-slate-200/60 text-[10px] font-semibold text-slate-500">
        ${monthNames[month].substring(0, 3)} ${day}, ${year}
      </div>
    `;

    container.appendChild(card);
  }
}

function openTitheDayModal(dayDateStr) {
  activeTitheDayDate = dayDateStr;
  document.getElementById('titheModalDayTitle').innerText = `Tithes for ${dayDateStr}`;
  
  // Render existing tithes for this day
  const listContainer = document.getElementById('titheDayExistingList');
  const dayTithes = appState.transactions.filter(t => t.isTithe && t.date === dayDateStr);

  listContainer.innerHTML = '';
  if (dayTithes.length === 0) {
    listContainer.innerHTML = '<div class="text-slate-400 text-center py-2">No tithes logged yet for this date.</div>';
  } else {
    dayTithes.forEach(t => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200';
      item.innerHTML = `
        <div>
          <span class="font-bold text-slate-800">${t.entity}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded ml-1 font-bold ${t.isECash ? 'bg-accent-100 text-accent-800' : 'bg-emerald-100 text-emerald-800'}">
            ${t.isECash ? 'E-Cash' : 'Physical Money'}
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="font-bold font-mono text-emerald-700">${formatUSD(t.amount)}</span>
          <button onclick="confirmDeleteTransaction('${t.id}')" class="text-slate-400 hover:text-rose-600">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  // Reset inputs (Requirement 16: description does not apply to tithe page)
  document.getElementById('titheDonorName').value = '';
  document.getElementById('titheAmount').value = '';
  document.getElementById('titheIsTithe').checked = true;
  document.getElementById('titheIsECash').checked = false;

  openModal('modalTitheDay');
  lucide.createIcons();
}

function saveDayTitheEntry() {
  const donor = document.getElementById('titheDonorName').value.trim();
  const amount = parseFloat(document.getElementById('titheAmount').value);
  const isECash = document.getElementById('titheIsECash').checked;

  if (!donor || isNaN(amount) || amount <= 0) {
    alert('Please enter member name and tithe amount.');
    return;
  }

  showConfirmation(
    'Save Tithe Entry',
    `Record tithe of ${formatUSD(amount)} from ${donor} on ${activeTitheDayDate} (${isECash ? 'E-Cash' : 'Physical Money'})? This will immediately update the general ledger.`,
    () => {
      const id = `TX-TITHE-${activeTitheDayDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      
      // Update general ledger immediately (Requirement 17)
      appState.transactions.unshift({
        id,
        type: 'INCOME',
        isTithe: true,
        date: activeTitheDayDate,
        category: 'Tithes & Covenant Giving',
        variant: 'General Tithes',
        entity: donor,
        amount,
        isECash,
        custody: isECash ? 'Bank' : 'Cash on Hand',
        description: `Tithe logged for ${activeTitheDayDate} [${isECash ? 'E-Cash' : 'Physical Money'}]`,
        recordedBy: appState.currentUser.name
      });

      saveAppState();
      renderCurrentPage();
      closeModal('modalTitheDay');
      alert(`Tithe of ${formatUSD(amount)} saved and General Ledger updated!`);
    }
  );
}

// -------------------------------------------------------------
// BUDGET & CATEGORY VARIANTS (Requirements 10 & 12)
// -------------------------------------------------------------
function renderBudgetPage() {
  const grid = document.getElementById('budgetHierarchyGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const interval = appState.currentInterval;
  const expenseCats = appState.categories.EXPENSE;

  expenseCats.forEach(cat => {
    const quotaObj = appState.budgets[cat.name] || { monthly: 1000, quarterly: 3000, yearly: 12000 };
    const quotaAmount = quotaObj[interval] || 1000;

    // Calculate actual spent for this category during interval
    let spent = 0;
    appState.transactions.filter(t => t.type === 'EXPENSE' && t.category === cat.name && matchesActiveInterval(t.date)).forEach(t => {
      spent += t.amount;
    });

    const variance = quotaAmount - spent;
    const pct = quotaAmount > 0 ? Math.min(Math.round((spent / quotaAmount) * 100), 100) : 0;

    let barClass = 'bg-emerald-500';
    let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let statusText = 'Within Budget';

    if (spent > quotaAmount) {
      barClass = 'bg-rose-500';
      statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
      statusText = 'OVER QUOTA!';
    } else if (pct >= 80) {
      barClass = 'bg-amber-500';
      statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
      statusText = 'Warning: Near Quota';
    }

    // Split major category into variants (Requirement 12)
    const variantsHtml = (cat.variants || []).map(v => {
      // Calculate spent under specific variant
      let varSpent = 0;
      appState.transactions.filter(t => t.type === 'EXPENSE' && t.category === cat.name && t.variant === v && matchesActiveInterval(t.date)).forEach(t => {
        varSpent += t.amount;
      });
      return `
        <div class="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
          <span class="text-slate-600 flex items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
            ${v}
          </span>
          <span class="font-mono text-slate-800 font-semibold">${formatUSD(varSpent)}</span>
        </div>
      `;
    }).join('');

    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow transition';

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-bold text-slate-900 text-sm">${cat.name}</h3>
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Major Expense Category</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}">${statusText}</span>
        </div>

        <div class="mt-4 space-y-2 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Approved ${interval.toUpperCase()} Quota:</span>
            <span class="font-bold text-slate-900 font-mono">${formatUSD(quotaAmount)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Actual Disbursed:</span>
            <span class="font-bold text-rose-600 font-mono">${formatUSD(spent)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Remaining Variance:</span>
            <span class="font-bold ${variance >= 0 ? 'text-emerald-700' : 'text-rose-600'} font-mono">${formatUSD(variance)}</span>
          </div>
        </div>

        <div class="mt-4">
          <div class="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Quota Progress</span>
            <span class="font-bold font-mono text-slate-700">${pct}%</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="${barClass} h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>

        <!-- Subcategory Variants List (Requirement 12) -->
        <div class="mt-5 pt-3 border-t border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Category Variants:</span>
          <div class="space-y-1">
            ${variantsHtml || '<div class="text-slate-400 text-[11px]">No sub-variants configured.</div>'}
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  const cat = document.getElementById('budgetCategorySelect').value;
  const m = parseFloat(document.getElementById('budgetMonthlyGoal').value) || 0;
  const q = parseFloat(document.getElementById('budgetQuarterlyGoal').value) || 0;
  const y = parseFloat(document.getElementById('budgetYearlyGoal').value) || 0;

  showConfirmation(
    'Update Category Quotas',
    `Set budget limits for ${cat} to Monthly: ${formatUSD(m)}, Quarterly: ${formatUSD(q)}, Yearly: ${formatUSD(y)}?`,
    () => {
      appState.budgets[cat] = { monthly: m, quarterly: q, yearly: y };
      saveAppState();
      renderCurrentPage();
      closeModal('modalAddBudget');
    }
  );
}

// -------------------------------------------------------------
// SAVINGS MODULE (Requirement 11)
// -------------------------------------------------------------
function renderSavingsPage() {
  const accountsContainer = document.getElementById('savingsAccountsList');
  if (!accountsContainer) return;

  let grandTotal = 0;
  let buildingTotal = 0;
  let emergencyTotal = 0;

  appState.savings.accounts.forEach(acc => {
    grandTotal += acc.balance;
    if (acc.name.includes('Building')) buildingTotal += acc.balance;
    if (acc.name.includes('Emergency') || acc.name.includes('Welfare')) emergencyTotal += acc.balance;
  });

  document.getElementById('savingsGrandTotal').innerText = formatUSD(grandTotal);
  document.getElementById('savingsBuildingTotal').innerText = formatUSD(buildingTotal);
  document.getElementById('savingsEmergencyTotal').innerText = formatUSD(emergencyTotal);

  accountsContainer.innerHTML = '';
  appState.savings.accounts.forEach(acc => {
    const pct = acc.target > 0 ? Math.min(Math.round((acc.balance / acc.target) * 100), 100) : 0;
    const card = document.createElement('div');
    card.className = 'bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3';
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-bold text-slate-900 text-sm">${acc.name}</h4>
          <p class="text-[11px] text-slate-500">${acc.desc}</p>
        </div>
        <div class="text-right">
          <span class="font-black text-teal-800 font-mono text-base">${formatUSD(acc.balance)}</span>
          <span class="text-[10px] text-slate-400 block">Target: ${formatUSD(acc.target)}</span>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Fund Target Completion</span>
          <span class="font-bold text-teal-700 font-mono">${pct}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div class="bg-teal-600 h-full rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
    accountsContainer.appendChild(card);
  });
}

function handleSavingsDepositSubmit(e) {
  e.preventDefault();
  const accName = document.getElementById('savingsTargetAccount').value;
  const amount = parseFloat(document.getElementById('savingsDepositAmount').value);
  const desc = document.getElementById('savingsDepositDesc').value.trim() || 'Savings deposit';

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter valid amount.');
    return;
  }

  showConfirmation(
    'Confirm Savings Deposit',
    `Transfer ${formatUSD(amount)} into ${accName}?`,
    () => {
      const targetAcc = appState.savings.accounts.find(a => a.name === accName);
      if (targetAcc) {
        targetAcc.balance += amount;
      }
      appState.savings.history.unshift({
        date: new Date().toISOString().split('T')[0],
        account: accName,
        amount,
        desc
      });
      saveAppState();
      renderCurrentPage();
      closeModal('modalAddSavingsDeposit');
    }
  );
}

// -------------------------------------------------------------
// GOALS PAGE (Requirement 10 & 19)
// -------------------------------------------------------------
function renderGoalsPage() {
  const grid = document.getElementById('goalsListGrid');
  if (!grid) return;
  grid.innerHTML = '';

  appState.goals.forEach(goal => {
    const pct = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
            ${goal.interval} Goal
          </span>
          <span class="text-xs font-mono font-bold text-slate-700">${pct}%</span>
        </div>
        <h3 class="font-bold text-slate-900 text-sm">${goal.title}</h3>
        
        <div class="mt-4 space-y-1.5 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Target Goal:</span>
            <span class="font-bold text-slate-900 font-mono">${formatUSD(goal.target)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Amount Raised:</span>
            <span class="font-bold text-emerald-600 font-mono">${formatUSD(goal.current)}</span>
          </div>
        </div>

        <div class="mt-4">
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-amber-500 h-full rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleGoalSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('goalTitle').value.trim();
  const interval = document.getElementById('goalInterval').value;
  const target = parseFloat(document.getElementById('goalTargetAmount').value);
  const current = parseFloat(document.getElementById('goalCurrentAmount').value) || 0;

  if (!title || isNaN(target) || target <= 0) {
    alert('Please enter valid goal details.');
    return;
  }

  showConfirmation(
    'Create Financial Goal',
    `Set stewardship goal "${title}" with target of ${formatUSD(target)}?`,
    () => {
      appState.goals.push({
        id: `GOL-${Date.now()}`,
        title,
        interval,
        target,
        current
      });
      saveAppState();
      renderCurrentPage();
      closeModal('modalAddGoal');
      e.target.reset();
    }
  );
}

// -------------------------------------------------------------
// USER ROLES & DELEGATED ACCOUNTS (Requirement 4 & 19)
// -------------------------------------------------------------
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  appState.users.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100';

    const permissionsBadges = (u.permissions || []).map(p => 
      `<span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">${p}</span>`
    ).join(' ');

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900">${u.name}</td>
      <td class="py-3 px-4 text-slate-700 font-semibold">${u.role}</td>
      <td class="py-3 px-4 space-x-1">${permissionsBadges || '-'}</td>
      <td class="py-3 px-4 font-mono text-slate-500">••••</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
          ${u.isAdmin ? 'Lead Admin' : 'Delegated'}
        </span>
      </td>
      <td class="py-3 px-4 text-center">
        ${u.isAdmin ? '<span class="text-[10px] text-slate-400">Master</span>' : `
          <button onclick="deleteUserAccount('${u.id}')" class="p-1 text-slate-400 hover:text-rose-600">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function handleCreateUserSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('userNewName').value.trim();
  const role = document.getElementById('userNewRole').value;
  const pin = document.getElementById('userNewPin').value.trim();

  const permissions = [];
  if (document.getElementById('permLogIncome').checked) permissions.push('Log Income');
  if (document.getElementById('permLogExpense').checked) permissions.push('Disburse Expenditures');
  if (document.getElementById('permPrintReports').checked) permissions.push('Print Official Reports');

  if (!name || !pin) {
    alert('Please enter name and PIN.');
    return;
  }

  showConfirmation(
    'Create Delegated Account',
    `Authorize ${name} as a ${role} with delegated access?`,
    () => {
      appState.users.push({
        id: `USR-${Date.now()}`,
        name,
        role,
        pin,
        isAdmin: false,
        permissions
      });
      saveAppState();
      renderUsersTable();
      populateLoginUserDropdown();
      closeModal('modalCreateUser');
      e.target.reset();
    }
  );
}

function deleteUserAccount(userId) {
  const u = appState.users.find(user => user.id === userId);
  if (!u) return;

  showConfirmation(
    'Revoke Delegated Account',
    `Revoke access credentials for ${u.name}?`,
    () => {
      appState.users = appState.users.filter(user => user.id !== userId);
      saveAppState();
      renderUsersTable();
      populateLoginUserDropdown();
    },
    'rose'
  );
}

// -------------------------------------------------------------
// PRINTABLE REPORT SHEET (Requirement 5)
// -------------------------------------------------------------
function renderPrintableReport() {
  const container = document.getElementById('printableReportSheet');
  if (!container) return;

  const interval = appState.currentInterval.toUpperCase();
  const currentTxs = appState.transactions.filter(t => matchesActiveInterval(t.date));

  let totalIncome = 0;
  let totalExpenses = 0;
  let bankIncome = 0;
  let cashIncome = 0;
  let bankExpense = 0;
  let cashExpense = 0;

  currentTxs.forEach(t => {
    if (t.type === 'INCOME') {
      totalIncome += t.amount;
      if (t.custody === 'Bank') bankIncome += t.amount;
      else cashIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      if (t.custody === 'Bank') bankExpense += t.amount;
      else cashExpense += t.amount;
    }
  });

  const netBalance = totalIncome - totalExpenses;
  const netBank = bankIncome - bankExpense;
  const netCash = cashIncome - cashExpense;

  // Render Category breakdown rows
  const incCats = {};
  currentTxs.filter(t => t.type === 'INCOME').forEach(t => {
    incCats[t.category] = (incCats[t.category] || 0) + t.amount;
  });

  const expCats = {};
  currentTxs.filter(t => t.type === 'EXPENSE').forEach(t => {
    expCats[t.category] = (expCats[t.category] || 0) + t.amount;
  });

  container.innerHTML = `
    <!-- Letterhead -->
    <div class="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
      <div>
        <h2 class="text-2xl font-black text-slate-900">${appState.churchInfo.name}</h2>
        <p class="text-xs text-slate-600">${appState.churchInfo.address} &bull; ${appState.churchInfo.phone}</p>
        <p class="text-xs font-mono text-slate-500">Tax ID / EIN: ${appState.churchInfo.ein}</p>
      </div>
      <div class="text-right">
        <span class="text-xs uppercase font-bold tracking-wider text-slate-500">Financial Audit Document</span>
        <h3 class="text-lg font-black text-slate-900">${interval} FINANCIAL STATEMENT</h3>
        <p class="text-xs text-slate-500 font-mono">Date Generated: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>

    <!-- Executive Summary Numbers -->
    <div class="grid grid-cols-3 gap-4 pt-2">
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span class="text-xs text-slate-500 uppercase font-bold block">Total Receipts</span>
        <span class="text-xl font-black text-emerald-700 font-mono">${formatUSD(totalIncome)}</span>
      </div>
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span class="text-xs text-slate-500 uppercase font-bold block">Total Disbursements</span>
        <span class="text-xl font-black text-rose-700 font-mono">${formatUSD(totalExpenses)}</span>
      </div>
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span class="text-xs text-slate-500 uppercase font-bold block">Net Operating Reserve</span>
        <span class="text-xl font-black ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-mono">${formatUSD(netBalance)}</span>
      </div>
    </div>

    <!-- Custody Verification (Requirement 15: Bank vs Cash on Hand) -->
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Custody & Physical Fund Reconciliation:</span>
      <div class="grid grid-cols-2 gap-4 text-xs font-mono">
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600 font-sans">Bank Account Operating Balance:</span>
          <span class="font-bold text-slate-900">${formatUSD(netBank)}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600 font-sans">Cash on Hand (Vault / Safe):</span>
          <span class="font-bold text-slate-900">${formatUSD(netCash)}</span>
        </div>
      </div>
    </div>

    <!-- Category Tables -->
    <div class="grid grid-cols-2 gap-6 text-xs">
      <div>
        <h4 class="font-bold text-slate-800 uppercase tracking-wide mb-2">Income By Category</h4>
        <table class="w-full border border-slate-200 text-left">
          <thead class="bg-slate-100 font-bold border-b">
            <tr>
              <th class="p-2">Category</th>
              <th class="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(incCats).map(c => `
              <tr class="border-b">
                <td class="p-2 text-slate-700">${c}</td>
                <td class="p-2 text-right font-mono font-semibold">${formatUSD(incCats[c])}</td>
              </tr>
            `).join('') || '<tr><td colspan="2" class="p-2 text-slate-400">No income records</td></tr>'}
          </tbody>
        </table>
      </div>

      <div>
        <h4 class="font-bold text-slate-800 uppercase tracking-wide mb-2">Disbursements By Category</h4>
        <table class="w-full border border-slate-200 text-left">
          <thead class="bg-slate-100 font-bold border-b">
            <tr>
              <th class="p-2">Category</th>
              <th class="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(expCats).map(c => `
              <tr class="border-b">
                <td class="p-2 text-slate-700">${c}</td>
                <td class="p-2 text-right font-mono font-semibold">${formatUSD(expCats[c])}</td>
              </tr>
            `).join('') || '<tr><td colspan="2" class="p-2 text-slate-400">No expense records</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sign-off & Dual Approval Verification -->
    <div class="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
      <div>
        <div class="border-b border-slate-400 w-56 mb-1"></div>
        <p class="font-bold text-slate-800">Finance Committee Chair / Trustee</p>
        <p class="text-[11px] text-slate-400">Date: ________________________</p>
      </div>
      <div>
        <div class="border-b border-slate-400 w-56 mb-1"></div>
        <p class="font-bold text-slate-800">Senior Pastor / Lead Administrator</p>
        <p class="text-[11px] text-slate-400">Date: ________________________</p>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODAL HELPERS & CATEGORY INITIALIZERS
// -------------------------------------------------------------
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  if (id === 'modalIncome') {
    populateCategorySelect('incCategory', 'INCOME');
    populateSubcategories('incCategory', 'incVariant');
    document.getElementById('incDate').value = new Date().toISOString().split('T')[0];
  } else if (id === 'modalExpense') {
    populateCategorySelect('expCategory', 'EXPENSE');
    populateSubcategories('expCategory', 'expVariant');
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
  } else if (id === 'modalAddBudget') {
    populateCategorySelect('budgetCategorySelect', 'EXPENSE');
  } else if (id === 'modalManageCategories') {
    renderCategoryManager();
  } else if (id === 'modalPrintReport') {
    renderPrintableReport();
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function populateCategorySelect(selectId, type) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '';
  const list = type === 'INCOME' ? appState.categories.INCOME : appState.categories.EXPENSE;
  list.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.innerText = c.name;
    select.appendChild(opt);
  });
}

function renderCategoryManager() {
  const parentSelect = document.getElementById('catManagerParent');
  const listContainer = document.getElementById('catManagerHierarchyList');
  if (!parentSelect || !listContainer) return;

  parentSelect.innerHTML = '';
  const allCats = [...appState.categories.EXPENSE, ...appState.categories.INCOME];
  allCats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.innerText = `${c.name}`;
    parentSelect.appendChild(opt);
  });

  listContainer.innerHTML = '';
  allCats.forEach(c => {
    const card = document.createElement('div');
    card.className = 'bg-white p-3 rounded-xl border border-slate-200 text-xs';
    card.innerHTML = `
      <div class="font-bold text-slate-900">${c.name}</div>
      <div class="mt-1 flex flex-wrap gap-1">
        ${(c.variants || []).map(v => `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">${v}</span>`).join('')}
      </div>
    `;
    listContainer.appendChild(card);
  });
}

function handleAddCategoryVariant() {
  const parentName = document.getElementById('catManagerParent').value;
  const newVar = document.getElementById('catManagerVariantName').value.trim();

  if (!newVar) {
    alert('Please enter variant name.');
    return;
  }

  showConfirmation(
    'Add Variant',
    `Add subcategory variant "${newVar}" under "${parentName}"?`,
    () => {
      const all = [...appState.categories.EXPENSE, ...appState.categories.INCOME];
      const target = all.find(c => c.name === parentName);
      if (target) {
        if (!target.variants) target.variants = [];
        target.variants.push(newVar);
        saveAppState();
        renderCategoryManager();
        document.getElementById('catManagerVariantName').value = '';
      }
    }
  );
}

function handleCreateMajorCategory() {
  const type = document.getElementById('catManagerNewType').value;
  const name = document.getElementById('catManagerNewName').value.trim();

  if (!name) {
    alert('Please enter category name.');
    return;
  }

  showConfirmation(
    'Create Major Category',
    `Create new ${type} category "${name}"?`,
    () => {
      appState.categories[type].push({
        name,
        variants: ['General']
      });
      if (type === 'EXPENSE' && !appState.budgets[name]) {
        appState.budgets[name] = { monthly: 1000, quarterly: 3000, yearly: 12000 };
      }
      saveAppState();
      renderCategoryManager();
      document.getElementById('catManagerNewName').value = '';
    }
  );
}

// Utility currency formatter
function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}
