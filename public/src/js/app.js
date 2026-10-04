// Church Financial Log - Core Application Script
// Implements all 19 church accounting and stewardship requirements - World Ark Missions

const STORAGE_KEY = 'WORLD_ARK_MISSIONS_LEDGER_V5';
const SESSION_KEY = 'WORLD_ARK_MISSIONS_SESSION';
let ledgerHydrated = false;
let ledgerSaveTimer = null;

// Master Initial State with comprehensive structure
const DEFAULT_STATE = {
  currentInterval: 'monthly', // 'monthly' | 'quarterly' | 'yearly'
  currentTitheMonthOffset: 0, // 0 = current month, -1 = previous, etc.
  currentUser: null,
  users: [],
  churchInfo: {
    name: 'World Ark Missions',
    address: 'Plot 12 Ark Avenue, Accra, Ghana',
    phone: '+233 24 123 4567',
    ein: 'WAM-GH-2026 (Non-Profit / NGO)'
  },
  categories: {
    INCOME: [],
    EXPENSE: []
  },
  categorySchemaVersion: 2,
  budgets: {},
  savings: {
    totalBalance: 43500.00,
    history: [
      { id: 'SAV-TX-1', date: '2026-09-01', type: 'DEPOSIT', amount: 1500.00, custody: 'Mobile Money Wallet', desc: 'Monthly savings transfer' },
      { id: 'SAV-TX-2', date: '2026-08-01', type: 'DEPOSIT', amount: 1200.00, custody: 'Mobile Money Wallet', desc: 'Savings allocation' },
      { id: 'SAV-TX-3', date: '2026-08-15', type: 'DEPOSIT', amount: 800.00, custody: 'Cash on Hand', desc: 'Emergency savings contribution' }
    ]
  },
  goals: [
    {
      id: 'GOL-01',
      title: 'New Sanctuary Audio Console',
      interval: 'Quarterly',
      target: 8500.00,
      current: 6200.00,
      spent: 4500.00,
      custody: 'Mobile Money Wallet'
    },
    {
      id: 'GOL-02',
      title: 'Annual Harvest Thanksgiving Goal',
      interval: 'Yearly',
      target: 40000.00,
      current: 28400.00,
      spent: 12000.00,
      custody: 'Mobile Money Wallet'
    },
    {
      id: 'GOL-03',
      title: 'Monthly Community Food Pantry Drive',
      interval: 'Monthly',
      target: 1200.00,
      current: 950.00,
      spent: 700.00,
      custody: 'Cash on Hand'
    }
  ],
  transactions: []
};

// Global active state
let appState = createFreshFinancialState();

// Chart.js instances
let chartIncomePieInstance = null;
let chartExpensePieInstance = null;

// Pending confirmation callback
let pendingConfirmCallback = null;

// Selected date for tithe modal
let activeTitheDayDate = null;
let pendingTitheEntries = [];

function createFreshFinancialState() {
  const freshState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  freshState.budgets = Object.fromEntries(
    Object.keys(freshState.budgets || {}).map(category => [
      category,
      { monthly: 0, quarterly: 0, yearly: 0 }
    ])
  );
  freshState.savings = { totalBalance: 0, history: [] };
  freshState.goals = [];
  freshState.transactions = [];
  freshState.currentInterval = 'monthly';
  freshState.currentTitheMonthOffset = 0;
  freshState.currentUser = null;
  freshState.users = [];
  return freshState;
}

// -------------------------------------------------------------
// APP INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadAppState();
  setupUserSession();
  setupIntervalUI();
  moveChartsToPage();
  initPieCharts();
  renderCurrentPage();
  lucide.createIcons();
});

function moveChartsToPage() {
  const chartsPanel = document.getElementById('chartsPanel');
  const chartsPage = document.getElementById('page-charts');
  if (chartsPanel && chartsPage && chartsPanel.parentElement !== chartsPage) {
    chartsPage.appendChild(chartsPanel);
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !backdrop) return;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    sidebar.classList.toggle('sidebar-open');
    backdrop.classList.toggle('hidden', !sidebar.classList.contains('sidebar-open'));
    document.body.classList.toggle('sidebar-locked', sidebar.classList.contains('sidebar-open'));
  } else {
    sidebar.classList.toggle('sidebar-collapsed');
    document.body.classList.toggle('sidebar-collapsed-page', sidebar.classList.contains('sidebar-collapsed'));
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !backdrop) return;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    sidebar.classList.remove('sidebar-open');
  } else {
    sidebar.classList.add('sidebar-collapsed');
    document.body.classList.add('sidebar-collapsed-page');
  }
  backdrop.classList.add('hidden');
  document.body.classList.remove('sidebar-locked');
}

window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (!window.matchMedia('(max-width: 767px)').matches) {
    sidebar.classList.remove('sidebar-open');
    document.getElementById('sidebarBackdrop')?.classList.add('hidden');
    document.body.classList.remove('sidebar-locked');
  }
});

function loadAppState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appState = JSON.parse(saved);
      // Authentication users are server-owned; never restore credentials from browser storage.
      appState.users = [];
      if (!appState.categories) {
        appState.categories = DEFAULT_STATE.categories;
      }
      if (!appState.goals) {
        appState.goals = DEFAULT_STATE.goals;
      }
      normalizeState();
    } catch (e) {
      console.error('Failed to parse stored state, using defaults', e);
      appState = createFreshFinancialState();
    }
  } else {
    appState = createFreshFinancialState();
    normalizeState();
    saveAppState();
  }
}

function normalizeState() {
  appState.currentInterval = appState.currentInterval || 'monthly';
  appState.budgets = appState.budgets || {};
  appState.categories = appState.categories || JSON.parse(JSON.stringify(DEFAULT_STATE.categories));
  if (appState.categorySchemaVersion < 2) {
    appState.categories = { INCOME: [], EXPENSE: [] };
    appState.budgets = {};
    appState.categorySchemaVersion = 2;
  }
  appState.currentUser = null;
  appState.savings = appState.savings || { totalBalance: 0, history: [] };
  if (!Array.isArray(appState.savings.history)) appState.savings.history = [];

  // Migrate the earlier account-based savings shape into the consolidated model.
  if (Array.isArray(appState.savings.accounts)) {
    appState.savings.totalBalance = appState.savings.accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
    appState.savings.history = appState.savings.history.map((record, index) => ({
      id: record.id || `SAV-MIGRATED-${index + 1}`,
      date: record.date || new Date().toISOString().split('T')[0],
      type: record.type || 'DEPOSIT',
      amount: Number(record.amount) || 0,
      custody: record.custody || 'Cash on Hand',
      desc: record.desc || record.description || 'Savings record'
    }));
    delete appState.savings.accounts;
  }

  appState.savings.totalBalance = Number(appState.savings.totalBalance) || 0;
  appState.goals = (appState.goals || []).map(goal => ({
    ...goal,
    current: Number(goal.current) || 0,
    spent: Number(goal.spent) || 0,
    custody: goal.custody || 'Mobile Money Wallet'
  }));
  appState.transactions = (appState.transactions || []).map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount) || 0,
    entity: transaction.entity || 'Unspecified',
    category: String(transaction.category || '').trim(),
    recordedBy: transaction.recordedBy || 'Unknown user',
    custody: transaction.custody === 'Bank' ? 'Mobile Money Wallet' : (transaction.custody || 'Cash on Hand')
  }));
}

function saveAppState() {
  const localState = JSON.stringify(appState);
  localStorage.setItem(STORAGE_KEY, localState);
  if (!appState.currentUser || !ledgerHydrated) return;

  window.clearTimeout(ledgerSaveTimer);
  ledgerSaveTimer = window.setTimeout(() => {
    const serverState = { ...appState, currentUser: null, users: [] };
    apiRequest('/api/ledger/state', {
      method: 'PUT',
      body: JSON.stringify({ state: serverState })
    }).catch(error => console.warn('Unable to save ledger state to the server:', error.message));
  }, 150);
}

// -------------------------------------------------------------
// AUTHENTICATION & ACCESS CONTROL (Requirement 4 & 19)
// -------------------------------------------------------------
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('hermes_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers,
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const isUserManagement = path.includes('/api/auth/users') || path.includes('/api/auth/admin/users');
    const publicAuthRoute = ['/api/auth/admin/login', '/api/auth/admin/setup', '/api/auth/user/login'].includes(path);
    if (response.status === 401 && !publicAuthRoute && !isUserManagement) {
      window.location.replace('/auth.html?reason=session-expired');
    }
    throw new Error(payload.error || 'Request failed');
  }
  return payload;
}

function showAuthMessage(message, type = 'error') {
  const element = document.getElementById('authMessage');
  if (!element) return;
  element.textContent = message;
  element.className = `mt-4 p-3 rounded-xl text-xs font-semibold ${
    type === 'success'
      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
      : 'bg-rose-50 border border-rose-200 text-rose-800'
  }`;
}

function showAuthPanel(panel) {
  const panels = {
    admin: 'adminLoginForm',
    adminSetup: 'adminSetupForm',
    user: 'userLoginForm'
  };
  Object.values(panels).forEach(id => document.getElementById(id)?.classList.add('hidden'));
  document.getElementById(panels[panel] || panels.admin)?.classList.remove('hidden');
  document.getElementById('authAdminTab')?.classList.toggle('bg-white', panel.startsWith('admin'));
  document.getElementById('authAdminTab')?.classList.toggle('text-slate-900', panel.startsWith('admin'));
  document.getElementById('authAdminTab')?.classList.toggle('shadow-sm', panel.startsWith('admin'));
  document.getElementById('authUserTab')?.classList.toggle('bg-white', panel.startsWith('user'));
  document.getElementById('authUserTab')?.classList.toggle('text-slate-900', panel.startsWith('user'));
  document.getElementById('authUserTab')?.classList.toggle('shadow-sm', panel.startsWith('user'));
  document.getElementById('authMessage')?.classList.add('hidden');
}

async function hydrateLedgerState() {
  const payload = await apiRequest('/api/ledger/state');
  if (payload.state) {
    const authenticatedUser = appState.currentUser;
    appState = payload.state;
    normalizeState();
    appState.currentUser = authenticatedUser;
  } else {
    ledgerHydrated = true;
    saveAppState();
    return;
  }
  ledgerHydrated = true;
}

async function setAuthenticatedUser(user, token) {
  if (token) localStorage.setItem('hermes_token', token);
  const isAdmin = user.role === 'admin' || user.role === 'Administrator' || user.isAdmin === true;
  appState.currentUser = {
    id: user.id,
    name: user.displayName || user.name || user.username,
    username: user.username,
    role: isAdmin ? 'Administrator' : (user.roleTitle || user.role || 'User'),
    isAdmin,
    permissions: isAdmin
      ? ['home', 'quota', 'tithe', 'savings', 'goals', 'charts', 'editUsers']
      : (user.permissions || [])
  };
  try {
    await hydrateLedgerState();
  } catch (error) {
    console.warn('Unable to restore server ledger state:', error.message);
    ledgerHydrated = true;
  }
  updateUserUI();
  if (isAdmin) {
    loadServerUsers().catch(() => {});
  }
  renderCurrentPage();
}

async function setupUserSession() {
  try {
    const payload = await apiRequest('/api/auth/me');
    if (payload.user) {
      await setAuthenticatedUser(payload.user, payload.token);
      return;
    }
  } catch (error) {
    // The auth page is the user-facing recovery surface for an invalid session.
  }
  window.location.replace('/auth.html');
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

async function authenticate(path, fields, form) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  try {
    const payload = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(fields)
    });
    if (!payload.user) throw new Error('Authentication response was incomplete');
    await setAuthenticatedUser(payload.user);
    form.reset();
  } catch (error) {
    showAuthMessage(error.message === 'Wrong Username or Password' ? error.message : error.message);
  } finally {
    if (submit) submit.disabled = false;
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  authenticate('/api/auth/admin/login', {
    username: document.getElementById('adminLoginUsername').value.trim(),
    password: document.getElementById('adminLoginPassword').value
  }, event.currentTarget);
}

function handleUserLogin(event) {
  event.preventDefault();
  authenticate('/api/auth/user/login', {
    username: document.getElementById('userLoginUsername').value.trim(),
    password: document.getElementById('userLoginPassword').value
  }, event.currentTarget);
}

async function handleAdminSetup(event) {
  event.preventDefault();
  try {
    const payload = await apiRequest('/api/auth/admin/setup', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('adminSetupUsername').value.trim(),
        displayName: document.getElementById('adminSetupName').value.trim(),
        email: document.getElementById('adminSetupEmail').value.trim(),
        password: document.getElementById('adminSetupPassword').value,
        setupCode: document.getElementById('adminSetupCode').value
      })
    });
    await setAuthenticatedUser(payload.user);
    event.currentTarget.reset();
  } catch (error) {
    showAuthMessage(error.message);
  }
}

function handleSignOut() {
  showConfirmation(
    'Sign Out',
    'Are you sure you want to sign out and lock the financial ledger?',
    () => {
      localStorage.removeItem('hermes_token');
      apiRequest('/api/auth/logout', { method: 'POST' })
        .catch(error => console.warn('Sign out request failed:', error.message))
        .finally(() => {
          appState.currentUser = null;
          window.location.replace('/auth.html');
        });
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
  // Edit Users is restricted to the administrator; admins have access to every page.
  if (pageId === 'editUsers' && !appState.currentUser?.isAdmin) {
    alert('Access Restricted: Only the Lead Administrator can view and edit user accounts.');
    return;
  }

  activePage = pageId;
  if (window.matchMedia('(max-width: 767px)').matches) closeSidebar();
  if (pageId === 'editUsers') {
    loadServerUsers().catch(() => {});
  }

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
  } else if (activePage === 'charts') {
    updatePieCharts();
  } else if (activePage === 'quota') {
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
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    if (current === 'monthly') labelEl.innerText = `${month} ${year}`;
    else if (current === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const startMonth = new Date(year, (quarter - 1) * 3, 1).toLocaleString('en-US', { month: 'short' });
      const endMonth = new Date(year, quarter * 3 - 1, 1).toLocaleString('en-US', { month: 'short' });
      labelEl.innerText = `Q${quarter} ${year} (${startMonth} - ${endMonth})`;
    } else labelEl.innerText = `Fiscal Year ${year}`;
  }
}

// Helper: check if a transaction date matches the current active interval
function matchesActiveInterval(dateStr) {
  if (!dateStr) return false;
  const current = appState.currentInterval;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (current === 'monthly') {
    return dateStr.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
  } else if (current === 'quarterly') {
    const quarterStart = Math.floor(month / 3) * 3;
    const date = new Date(`${dateStr}T00:00:00`);
    return date.getFullYear() === year && date.getMonth() >= quarterStart && date.getMonth() < quarterStart + 3;
  } else {
    return dateStr.startsWith(`${year}`);
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
    totalBudget += Number(appState.budgets[cat]?.[interval]) || 0;
  });

  // Calculate total expenses for this interval
  let totalExpenses = 0;
  appState.transactions.filter(tx => tx.type === 'EXPENSE' && matchesActiveInterval(tx.date)).forEach(tx => {
    totalExpenses += Number(tx.amount) || 0;
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
      bannerSub.innerText = `Expenditure (${formatUSD(totalExpenses)}) has EXCEEDED the approved ${interval} quota of ${formatUSD(totalBudget)}!`;
      bannerPct.className = 'text-xl font-black font-mono text-rose-600';
    } else if (pct >= 80) {
      banner.className = 'p-4 rounded-2xl border flex items-center justify-between shadow-sm bg-amber-50 border-amber-200 text-amber-900';
      bannerIcon.className = 'w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600';
      bannerTitle.innerText = 'Quota Warning: Nearing Budget Limit';
      bannerSub.innerText = `${pct}% of the ${interval} budget limit (${formatUSD(totalBudget)}) has been used.`;
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
      if (tx.custody === 'Mobile Money Wallet') bankIncome += tx.amount;
      else cashIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (tx.custody === 'Mobile Money Wallet') bankExpense += tx.amount;
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
  document.getElementById('cardIncomeSubtext').innerText = `${subtextInterval} total income`;
  document.getElementById('cardExpenseSubtext').innerText = `${subtextInterval} total expenditure`;
  document.getElementById('cardBalanceSubtext').innerText = `${subtextInterval} savings`;
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
  const incomeTotal = incValues.reduce((sum, value) => sum + value, 0);

  chartIncomePieInstance.data.labels = incLabels.length > 0 ? incLabels : ['No data'];
  chartIncomePieInstance.data.datasets[0].data = incValues.length > 0 ? incValues : [1];
  chartIncomePieInstance.update();
  const incomeTotalText = formatUSD(incomeTotal);
  document.getElementById('chartIncomeTotalBadge').innerText = incomeTotalText;
  document.getElementById('chartIncomeCenterValue').innerText = incomeTotalText;

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
  const expenseTotal = expValues.reduce((sum, value) => sum + value, 0);

  chartExpensePieInstance.data.labels = expLabels.length > 0 ? expLabels : ['No data'];
  chartExpensePieInstance.data.datasets[0].data = expValues.length > 0 ? expValues : [1];
  chartExpensePieInstance.update();
  const expenseTotalText = formatUSD(expenseTotal);
  document.getElementById('chartExpenseTotalBadge').innerText = expenseTotalText;
  document.getElementById('chartExpenseCenterValue').innerText = expenseTotalText;

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
    tr.title = `Recorded by: ${tx.recordedBy || 'Unknown user'}`;

    const isInc = tx.type === 'INCOME';
    const typeBadge = isInc
      ? '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Income</span>'
      : '<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">Expenditure</span>';

    const custodyBadge = tx.custody === 'Mobile Money Wallet'
      ? '<span class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">Mobile Money</span>'
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
      registerCategory('INCOME', category, variant);

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
    'Commit Expenditure Entry',
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
      registerCategory('EXPENSE', category, variant);

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

  function registerCategory(type, name, variant) {
    const categoryName = String(name || '').trim();
    const variantName = String(variant || '').trim();
    if (!categoryName) return;

    const categories = appState.categories[type];
    let category = categories.find(item => item.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) {
      category = { name: categoryName, variants: [] };
      categories.push(category);
    }
    if (variantName && !category.variants.some(item => item.toLowerCase() === variantName.toLowerCase())) {
      category.variants.push(variantName);
    }
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
    dayTithes.forEach(t => { dayTotal += t.amount; });

    const isToday = (day === now.getDate() && month === now.getMonth() && year === now.getFullYear());

    // Rounded box with date under it (Requirement 17)
    const card = document.createElement('div');
    card.className = `tithe-day-card p-3 rounded-2xl border text-center transition flex flex-col justify-between h-28 ${
      dayTithes.length > 0 ? 'has-tithes bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'
    } ${isToday ? 'ring-2 ring-blue-500' : ''}`;

    card.onclick = () => openTitheDayModal(dayStr);

    card.innerHTML = `
      <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span>Day</span>
        ${isToday ? '<span class="text-[10px] text-blue-600 font-bold">Today</span>' : ''}
      </div>
      
      <div class="my-auto">
        <div class="text-xl font-black text-slate-800">${day}</div>
        ${dayTotal > 0 ? `<div class="text-xs font-black text-emerald-700 font-mono">${formatUSD(dayTotal)}</div>` : '<div class="text-[10px] text-slate-400">No Tithes</div>'}
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
  pendingTitheEntries = [];
  document.getElementById('titheModalDayTitle').innerText = `Tithes for ${dayDateStr}`;
  
  // Render existing tithes for this day
  const listContainer = document.getElementById('titheDayExistingList');
  const dayTithes = appState.transactions.filter(t => t.isTithe && t.date === dayDateStr);
  const dayTotalBadge = document.getElementById('titheDayTotalBadge');
  if (dayTotalBadge) {
    dayTotalBadge.innerText = formatUSD(dayTithes.reduce((sum, entry) => sum + entry.amount, 0));
  }

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
  document.getElementById('titheCategory').value = '';
  document.getElementById('titheSubcategory').value = '';
  document.getElementById('titheIsTithe').checked = true;
  document.getElementById('titheIsECash').checked = false;
  renderPendingTitheEntries();

  openModal('modalTitheDay');
  lucide.createIcons();
}

function queueDayTitheEntry() {
  const donor = document.getElementById('titheDonorName').value.trim();
  const amount = parseFloat(document.getElementById('titheAmount').value);
  const category = document.getElementById('titheCategory').value.trim();
  const variant = document.getElementById('titheSubcategory').value.trim();
  const isECash = document.getElementById('titheIsECash').checked;

  if (!donor || !category || !variant || isNaN(amount) || amount <= 0) {
    alert('Please enter the donor/entity, category, subcategory, and amount.');
    return;
  }

  pendingTitheEntries.push({ donor, amount, category, variant, isECash });
  document.getElementById('titheDonorName').value = '';
  document.getElementById('titheAmount').value = '';
  document.getElementById('titheCategory').value = '';
  document.getElementById('titheSubcategory').value = '';
  document.getElementById('titheIsECash').checked = false;
  renderPendingTitheEntries();
}

function renderPendingTitheEntries() {
  const container = document.getElementById('tithePendingList');
  if (!container) return;
  if (!pendingTitheEntries.length) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  container.classList.remove('hidden');
  container.innerHTML = `<div class="font-bold text-amber-900">Pending entries (${pendingTitheEntries.length})</div>` +
    pendingTitheEntries.map((entry, index) => `
      <div class="flex items-center justify-between text-[11px]">
        <span>${entry.donor} - ${formatUSD(entry.amount)} (${entry.isECash ? 'E-Cash' : 'Physical Money'})</span>
        <button type="button" onclick="removePendingTitheEntry(${index})" class="text-rose-600 font-bold">Remove</button>
      </div>
    `).join('');
}

function removePendingTitheEntry(index) {
  pendingTitheEntries.splice(index, 1);
  renderPendingTitheEntries();
}

function saveDayTitheEntries() {
  if (!pendingTitheEntries.length) {
    queueDayTitheEntry();
    if (!pendingTitheEntries.length) return;
  }
  const entries = [...pendingTitheEntries];
  showConfirmation(
    'Save Tithe Entries',
    `Save ${entries.length} tithe entr${entries.length === 1 ? 'y' : 'ies'} for ${activeTitheDayDate} to the general ledger?`,
    () => {
      entries.forEach((entry, index) => {
        appState.transactions.unshift({
          id: `TX-TITHE-${activeTitheDayDate.replace(/-/g, '')}-${Date.now()}-${index}`,
          type: 'INCOME',
          isTithe: true,
          date: activeTitheDayDate,
          category: entry.category,
          variant: entry.variant,
          entity: entry.donor,
          amount: entry.amount,
          isECash: entry.isECash,
          custody: entry.isECash ? 'Mobile Money Wallet' : 'Cash on Hand',
          description: `Tithe logged for ${activeTitheDayDate} [${entry.isECash ? 'E-Cash' : 'Physical Money'}]`,
          recordedBy: appState.currentUser.name
        });
        registerCategory('INCOME', entry.category, entry.variant);
      });
      pendingTitheEntries = [];
      saveAppState();
      renderCurrentPage();
      closeModal('modalTitheDay');
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
    const quotaObj = appState.budgets[cat.name] || { monthly: 0, quarterly: 0, yearly: 0 };
    const quotaAmount = Number(quotaObj[interval]) || 0;

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
            <span>Actual Expenditure:</span>
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
  const savings = appState.savings;
  const history = savings.history;
  const totalEl = document.getElementById('savingsGrandTotal');
  const countEl = document.getElementById('savingsRecordCount');
  const tbody = document.getElementById('savingsHistoryTableBody');
  if (!totalEl || !tbody) return;

  totalEl.innerText = formatUSD(savings.totalBalance);
  if (countEl) countEl.innerText = `${history.length} record${history.length === 1 ? '' : 's'}`;
  const availableEl = document.getElementById('savingsWithdrawAvailable');
  if (availableEl) availableEl.innerText = formatUSD(savings.totalBalance);

  tbody.innerHTML = history.length ? history.map(record => {
    const isDeposit = record.type === 'DEPOSIT';
    const isAdjustment = record.type === 'ADJUSTMENT';
    return `
      <tr>
        <td class="py-3 px-4 font-mono text-slate-500">${record.date}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isDeposit ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
            ${isAdjustment ? 'Adjustment' : (isDeposit ? 'Deposit' : 'Withdrawal')}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-700">${record.desc || '-'}</td>
        <td class="py-3 px-4 text-slate-600">${record.custody || 'Cash on Hand'}</td>
        <td class="py-3 px-4 text-right font-mono font-bold ${isDeposit ? 'text-emerald-600' : 'text-amber-600'}">
          ${isAdjustment ? '' : (isDeposit ? '+' : '-')}${formatUSD(record.amount)}
        </td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <button onclick="openEditSavingsRecordModal('${record.id}')" class="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg" title="Edit record">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteSavingsRecord('${record.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg" title="Delete record">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('') : `
    <tr><td colspan="6" class="py-8 text-center text-slate-400">No savings records yet.</td></tr>
  `;
  lucide.createIcons();
}

function handleSavingsDepositSubmit(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('savingsDepositAmount').value);
  const custody = document.getElementById('savingsDepositCustody').value;
  const desc = document.getElementById('savingsDepositDesc').value.trim() || 'Savings deposit';

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter valid amount.');
    return;
  }

  showConfirmation(
    'Confirm Savings Deposit',
    `Transfer ${formatUSD(amount)} into consolidated church savings?`,
    () => {
      appState.savings.totalBalance += amount;
      appState.savings.history.unshift({
        id: `SAV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'DEPOSIT',
        amount,
        custody,
        desc
      });
      saveAppState();
      renderCurrentPage();
      closeModal('modalAddSavingsDeposit');
    }
  );
}

function handleSavingsWithdrawSubmit(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('savingsWithdrawAmount').value);
  const custody = document.getElementById('savingsWithdrawCustody').value;
  const desc = document.getElementById('savingsWithdrawDesc').value.trim();

  if (isNaN(amount) || amount <= 0 || !desc) {
    alert('Please enter a valid withdrawal amount and reason.');
    return;
  }
  if (amount > appState.savings.totalBalance) {
    alert('Withdrawal cannot exceed the available savings balance.');
    return;
  }

  showConfirmation('Confirm Savings Withdrawal', `Withdraw ${formatUSD(amount)} into operating income?`, () => {
    appState.savings.totalBalance -= amount;
    const savingsRecordId = `SAV-${Date.now()}`;
    appState.savings.history.unshift({
      id: savingsRecordId,
      date: new Date().toISOString().split('T')[0],
      type: 'WITHDRAWAL',
      amount,
      custody,
      desc
    });
    appState.transactions.unshift({
      id: `TX-SAV-${Date.now()}`,
      savingsRecordId,
      type: 'INCOME',
      date: new Date().toISOString().split('T')[0],
      category: '',
      variant: '',
      entity: 'Church Savings Account',
      amount,
      custody,
      description: desc,
      recordedBy: appState.currentUser.name
    });
    saveAppState();
    renderCurrentPage();
    closeModal('modalWithdrawSavings');
    e.target.reset();
  });
}

function openEditSavingsRecordModal(recordId) {
  const record = appState.savings.history.find(item => item.id === recordId);
  if (!record) return;
  document.getElementById('editSavingsRecId').value = record.id;
  document.getElementById('editSavingsRecDate').value = record.date;
  document.getElementById('editSavingsRecType').value = record.type;
  document.getElementById('editSavingsRecAmount').value = record.amount;
  document.getElementById('editSavingsRecCustody').value = record.custody;
  document.getElementById('editSavingsRecDesc').value = record.desc || '';
  openModal('modalEditSavingsRecord');
}

function handleEditSavingsRecordSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('editSavingsRecId').value;
  const index = appState.savings.history.findIndex(item => item.id === id);
  if (index < 0) return;
  const updated = {
    id,
    date: document.getElementById('editSavingsRecDate').value,
    type: document.getElementById('editSavingsRecType').value,
    amount: parseFloat(document.getElementById('editSavingsRecAmount').value),
    custody: document.getElementById('editSavingsRecCustody').value,
    desc: document.getElementById('editSavingsRecDesc').value.trim() || 'Savings record'
  };
  if (!updated.date || isNaN(updated.amount) || updated.amount <= 0) {
    alert('Please enter valid savings record details.');
    return;
  }

  showConfirmation('Update Savings Record', 'Save these changes to the savings activity history?', () => {
    const old = appState.savings.history[index];
    if (old.type === 'ADJUSTMENT' || updated.type === 'ADJUSTMENT') {
      alert('Adjustment records are not editable. Use the balance adjustment action instead.');
      return;
    }
    appState.savings.totalBalance += (updated.type === 'DEPOSIT' ? updated.amount : -updated.amount)
      - (old.type === 'DEPOSIT' ? old.amount : -old.amount);
    if (appState.savings.totalBalance < 0) {
      alert('This update would make the savings balance negative.');
      return;
    }
    appState.savings.history[index] = updated;
    const linkedIndex = appState.transactions.findIndex(transaction => transaction.savingsRecordId === id);
    if (updated.type === 'WITHDRAWAL') {
      const linkedTransaction = {
        id: `TX-SAV-${id}`,
        savingsRecordId: id,
        type: 'INCOME',
        date: updated.date,
        category: '',
        variant: '',
        entity: 'Church Savings Account',
        amount: updated.amount,
        custody: updated.custody,
        description: updated.desc,
        recordedBy: appState.currentUser.name
      };
      if (linkedIndex >= 0) appState.transactions[linkedIndex] = linkedTransaction;
      else appState.transactions.unshift(linkedTransaction);
    } else if (linkedIndex >= 0) {
      appState.transactions.splice(linkedIndex, 1);
    }
    saveAppState();
    renderSavingsPage();
    closeModal('modalEditSavingsRecord');
  });
}

function deleteSavingsRecord(recordId) {
  const index = appState.savings.history.findIndex(item => item.id === recordId);
  if (index < 0) return;
  const record = appState.savings.history[index];
  showConfirmation('Delete Savings Record', `Delete this ${record.type.toLowerCase()} record for ${formatUSD(record.amount)}?`, () => {
    if (record.type === 'ADJUSTMENT') {
      alert('Adjustment records cannot be deleted because they establish the reconciled balance.');
      return;
    }
    appState.savings.totalBalance -= record.type === 'DEPOSIT' ? record.amount : -record.amount;
    appState.savings.history.splice(index, 1);
    if (record.type === 'WITHDRAWAL') {
      appState.transactions = appState.transactions.filter(transaction => transaction.savingsRecordId !== recordId);
    }
    saveAppState();
    renderSavingsPage();
  }, 'rose');
}

function openEditSavingsBalanceModal() {
  document.getElementById('directSavingsBalanceInput').value = appState.savings.totalBalance.toFixed(2);
  document.getElementById('directSavingsBalanceNote').value = '';
  openModal('modalEditSavingsBalance');
}

function handleDirectSavingsBalanceSubmit(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('directSavingsBalanceInput').value);
  const note = document.getElementById('directSavingsBalanceNote').value.trim();
  if (isNaN(amount) || amount < 0 || !note) {
    alert('Enter a valid balance and audit note.');
    return;
  }
  showConfirmation('Adjust Savings Balance', `Set total church savings to ${formatUSD(amount)}?`, () => {
    appState.savings.totalBalance = amount;
    appState.savings.history.unshift({
      id: `SAV-ADJ-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'ADJUSTMENT',
      amount: amount,
      custody: 'Reconciliation',
      desc: note
    });
    saveAppState();
    renderSavingsPage();
    closeModal('modalEditSavingsBalance');
  });
}

// -------------------------------------------------------------
// GOALS PAGE (Requirement 10 & 19 - Add, Edit, and Remove Goals)
// -------------------------------------------------------------
function renderGoalsPage() {
  const grid = document.getElementById('goalsListGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!appState.goals || appState.goals.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
        <i data-lucide="target" class="w-10 h-10 mx-auto mb-2 text-slate-300"></i>
        <p class="font-bold text-slate-700">No stewardship goals defined</p>
        <p class="text-xs text-slate-400 mt-1">Click "Add Stewardship Goal" to create your first goal.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  appState.goals.forEach(goal => {
    const pct = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
            ${goal.interval} Goal
          </span>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono font-bold text-slate-700">${pct}%</span>
            <div class="flex items-center space-x-1 pl-1.5 border-l border-slate-200">
              <button onclick="openEditGoalModal('${goal.id}')" title="Edit Goal" class="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="deleteGoal('${goal.id}')" title="Remove Goal" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
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
          <div class="flex justify-between text-slate-500">
            <span>Amount Used:</span>
            <span class="font-bold text-rose-600 font-mono">${formatUSD(goal.spent)}</span>
          </div>
        </div>

        <div class="mt-4">
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-amber-500 h-full rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span class="text-[10px] font-mono text-slate-400">${goal.id}</span>
        <div class="flex items-center space-x-2">
          <button onclick="openEditGoalModal('${goal.id}')" class="text-[11px] font-bold text-amber-600 hover:text-amber-700 transition flex items-center space-x-1">
            <i data-lucide="edit-2" class="w-3 h-3"></i>
            <span>Edit</span>
          </button>
          <button onclick="deleteGoal('${goal.id}')" class="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition flex items-center space-x-1">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
            <span>Remove</span>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  lucide.createIcons();
}

function openAddGoalModal() {
  const form = document.getElementById('formGoal');
  if (form) form.reset();
  const editIdEl = document.getElementById('goalEditId');
  if (editIdEl) editIdEl.value = '';
  const headingEl = document.getElementById('modalGoalHeading');
  if (headingEl) headingEl.innerText = 'Create Stewardship Goal';
  const submitBtn = document.getElementById('btnGoalSubmit');
  if (submitBtn) submitBtn.innerText = 'Save Goal';
  const currentAmtEl = document.getElementById('goalCurrentAmount');
  if (currentAmtEl) currentAmtEl.value = '0';
  openModal('modalAddGoal');
}

function openEditGoalModal(goalId) {
  const goal = appState.goals.find(g => g.id === goalId);
  if (!goal) return;

  const form = document.getElementById('formGoal');
  if (form) form.reset();

  const editIdEl = document.getElementById('goalEditId');
  if (editIdEl) editIdEl.value = goal.id;

  const headingEl = document.getElementById('modalGoalHeading');
  if (headingEl) headingEl.innerText = 'Edit Stewardship Goal';

  const titleEl = document.getElementById('goalTitle');
  if (titleEl) titleEl.value = goal.title;

  const intervalEl = document.getElementById('goalInterval');
  if (intervalEl) intervalEl.value = goal.interval;

  const targetEl = document.getElementById('goalTargetAmount');
  if (targetEl) targetEl.value = goal.target;

  const currentEl = document.getElementById('goalCurrentAmount');
  if (currentEl) currentEl.value = goal.current || 0;
  const spentEl = document.getElementById('goalSpentAmount');
  if (spentEl) spentEl.value = goal.spent || 0;
  const custodyEl = document.getElementById('goalCustody');
  if (custodyEl) custodyEl.value = goal.custody || 'Mobile Money Wallet';

  const submitBtn = document.getElementById('btnGoalSubmit');
  if (submitBtn) submitBtn.innerText = 'Update Goal';

  openModal('modalAddGoal');
}

function deleteGoal(goalId) {
  const goal = appState.goals.find(g => g.id === goalId);
  if (!goal) return;

  showConfirmation(
    'Delete Stewardship Goal',
    `Are you sure you want to permanently remove the goal "${goal.title}"?`,
    () => {
      appState.goals = appState.goals.filter(g => g.id !== goalId);
      appState.transactions = appState.transactions.filter(transaction => transaction.goalId !== goalId);
      saveAppState();
      renderGoalsPage();
    },
    'rose'
  );
}

function syncGoalTransactions(goal) {
  appState.transactions = appState.transactions.filter(transaction => transaction.goalId !== goal.id);
  const date = new Date().toISOString().split('T')[0];
  const base = {
    goalId: goal.id,
    date,
    category: '',
    entity: `Stewardship Goal: ${goal.title}`,
    custody: goal.custody,
    recordedBy: appState.currentUser.name,
    isGoalSync: true
  };
  if (goal.current > 0) {
    appState.transactions.unshift({
      ...base,
      id: `TX-GOAL-INC-${goal.id}`,
      type: 'INCOME',
      variant: goal.title,
      amount: goal.current,
      description: `Stewardship goal funds raised for ${goal.title}`
    });
  }
  if (goal.spent > 0) {
    appState.transactions.unshift({
      ...base,
      id: `TX-GOAL-EXP-${goal.id}`,
      type: 'EXPENSE',
      variant: goal.title,
      amount: goal.spent,
      description: `Expenditure spent towards ${goal.title}`
    });
  }
}

function handleGoalSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('goalEditId')?.value;
  const title = document.getElementById('goalTitle').value.trim();
  const interval = document.getElementById('goalInterval').value;
  const target = parseFloat(document.getElementById('goalTargetAmount').value);
  const current = parseFloat(document.getElementById('goalCurrentAmount').value) || 0;
  const spent = parseFloat(document.getElementById('goalSpentAmount').value) || 0;
  const custody = document.getElementById('goalCustody').value;

  if (!title || isNaN(target) || target <= 0 || isNaN(current) || current < 0 || isNaN(spent) || spent < 0) {
    alert('Please enter valid goal details.');
    return;
  }

  if (editId) {
    // Edit existing goal
    const goalIndex = appState.goals.findIndex(g => g.id === editId);
    if (goalIndex === -1) {
      alert('Goal not found.');
      return;
    }

    showConfirmation(
      'Update Stewardship Goal',
      `Save updates to stewardship goal "${title}"?`,
      () => {
        appState.goals[goalIndex] = {
          ...appState.goals[goalIndex],
          title,
          interval,
          target,
          current,
          spent,
          custody
        };
        syncGoalTransactions(appState.goals[goalIndex]);
        saveAppState();
        renderGoalsPage();
        closeModal('modalAddGoal');
        e.target.reset();
        const editIdEl = document.getElementById('goalEditId');
        if (editIdEl) editIdEl.value = '';
      }
    );
  } else {
    // Create new goal
    showConfirmation(
      'Create Financial Goal',
      `Set stewardship goal "${title}" with target of ${formatUSD(target)}?`,
      () => {
        appState.goals.push({
          id: `GOL-${Date.now()}`,
          title,
          interval,
          target,
          current,
          spent,
          custody
        });
        syncGoalTransactions(appState.goals[appState.goals.length - 1]);
        saveAppState();
        renderGoalsPage();
        closeModal('modalAddGoal');
        e.target.reset();
      }
    );
  }
}

// -------------------------------------------------------------
// USER ROLES & DELEGATED ACCOUNTS (Requirement 4 & 19)
// -------------------------------------------------------------
async function loadServerUsers() {
  if (!appState.currentUser?.isAdmin) return;
  try {
    const payload = await apiRequest('/api/auth/admin/users');
    if (Array.isArray(payload.users)) {
      appState.users = payload.users.map(u => ({
        id: u.id,
        name: u.displayName || u.username,
        username: u.username,
        role: u.roleTitle || (u.role === 'admin' ? 'Lead Admin' : 'Delegated'),
        isAdmin: u.role === 'admin',
        permissions: u.permissions || [],
        email: u.email || ''
      }));
      renderUsersTable();
    }
  } catch (err) {
    console.warn('Unable to load server users:', err.message);
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!appState.users || appState.users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">No delegated accounts registered yet. Use "Create Delegated Account" above.</td></tr>`;
    return;
  }

  appState.users.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100';

    const permissionsBadges = (u.permissions || []).map(p => 
      `<span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">${p}</span>`
    ).join(' ');

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900">
        <div>${u.name}</div>
        <div class="text-[11px] text-slate-400 font-normal font-mono">@${u.username}${u.email ? ` • ${u.email}` : ''}</div>
      </td>
      <td class="py-3 px-4 text-slate-700 font-semibold">${u.role}</td>
      <td class="py-3 px-4 space-x-1">${permissionsBadges || '<span class="text-slate-400 text-[10px]">Standard Ledger Access</span>'}</td>
      <td class="py-3 px-4 font-mono text-slate-500">••••</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
          ${u.isAdmin ? 'Lead Admin' : 'Active Delegated'}
        </span>
      </td>
      <td class="py-3 px-4 text-center">
        ${u.isAdmin ? '<span class="text-[10px] text-slate-400">Master</span>' : `
          <button onclick="deleteUserAccount('${u.id}')" title="Revoke account access" class="p-1 text-slate-400 hover:text-rose-600 transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

async function handleCreateUserSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('userCreateAlert');
  if (alertEl) alertEl.classList.add('hidden');

  const name = document.getElementById('userNewName')?.value.trim();
  const username = document.getElementById('userNewUsername')?.value.trim();
  const pin = document.getElementById('userNewPin')?.value;
  const email = document.getElementById('userNewEmail')?.value.trim();

  if (!name || !username || !pin || pin.length < 8) {
    if (alertEl) {
      alertEl.textContent = 'Please fill in Officer Name, Username / Login ID, and a temporary password of at least 8 characters.';
      alertEl.classList.remove('hidden');
    } else {
      alert('Please fill in Officer Name, Username / Login ID, and a temporary password of at least 8 characters.');
    }
    return;
  }

  const permissions = [];
  if (document.getElementById('permLogIncome')?.checked) permissions.push('Log Income & Tithes');
  if (document.getElementById('permLogExpense')?.checked) permissions.push('Log Expenditure');
  if (document.getElementById('permPrintReports')?.checked) permissions.push('Print Official Reports');

  const btn = document.getElementById('btnSubmitUser');
  if (btn) btn.disabled = true;

  try {
    const payload = await apiRequest('/api/auth/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        displayName: name,
        username,
        password: pin,
        email: email || null,
        permissions
      })
    });

    closeModal('modalCreateUser');
    e.target.reset();
    await loadServerUsers();
    alert(`Delegated account created successfully for ${payload.user?.displayName || name}.`);
  } catch (error) {
    // Show error directly in modal without logging the admin out of the homepage
    if (alertEl) {
      alertEl.textContent = `Could not create account: ${error.message}`;
      alertEl.classList.remove('hidden');
    } else {
      alert(`Could not create account: ${error.message}`);
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function deleteUserAccount(userId) {
  const u = appState.users.find(user => String(user.id) === String(userId));
  if (!u) return;

  showConfirmation(
    'Revoke Delegated Account',
    `Revoke access credentials for ${u.name} (${u.role})?`,
    async () => {
      try {
        await apiRequest(`/api/auth/admin/users/${userId}`, { method: 'DELETE' });
        await loadServerUsers();
        alert(`Account for ${u.name} has been revoked.`);
      } catch (error) {
        alert(`Failed to revoke account: ${error.message}`);
      }
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
      if (t.custody === 'Mobile Money Wallet') bankIncome += t.amount;
      else cashIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      if (t.custody === 'Mobile Money Wallet') bankExpense += t.amount;
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
        <span class="text-xs text-slate-500 uppercase font-bold block">Total Income</span>
        <span class="text-xl font-black text-emerald-700 font-mono">${formatUSD(totalIncome)}</span>
      </div>
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span class="text-xs text-slate-500 uppercase font-bold block">Total Expenditure</span>
        <span class="text-xl font-black text-rose-700 font-mono">${formatUSD(totalExpenses)}</span>
      </div>
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span class="text-xs text-slate-500 uppercase font-bold block">Net Savings</span>
        <span class="text-xl font-black ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-mono">${formatUSD(netBalance)}</span>
      </div>
    </div>

    <!-- Custody Verification (Requirement 15: Mobile Money vs Cash on Hand) -->
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Custody & Physical Fund Reconciliation:</span>
      <div class="grid grid-cols-2 gap-4 text-xs font-mono">
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600 font-sans">Mobile Money Wallet Balance:</span>
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
        <h4 class="font-bold text-slate-800 uppercase tracking-wide mb-2">Expenditure By Category</h4>
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
            `).join('') || '<tr><td colspan="2" class="p-2 text-slate-400">No expenditure records</td></tr>'}
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
    document.getElementById('incDate').value = new Date().toISOString().split('T')[0];
  } else if (id === 'modalExpense') {
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
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
  if (!modal) return;
  modal.querySelectorAll('form').forEach(form => form.reset());
  modal.querySelectorAll('input[type="hidden"]').forEach(input => {
    input.value = '';
  });
  modal.classList.add('hidden');
  if (id === 'modalTitheDay') {
    pendingTitheEntries = [];
    renderPendingTitheEntries();
  }
  if (id === 'modalAddGoal') {
    const editIdEl = document.getElementById('goalEditId');
    if (editIdEl) editIdEl.value = '';
  }
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
        variants: []
      });
      if (type === 'EXPENSE' && !appState.budgets[name]) {
        appState.budgets[name] = { monthly: 0, quarterly: 0, yearly: 0 };
      }
      saveAppState();
      renderCategoryManager();
      document.getElementById('catManagerNewName').value = '';
    }
  );
}

// Utility currency formatter
function formatUSD(amount) {
  return `GH₵ ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0)}`;
}
