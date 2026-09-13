const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item[data-page]")];
const pageTitle = document.querySelector("#page-title");
const titleMap = { home: "Overview", budget: "Budget", tithe: "Tithe records", savings: "Savings", goals: "Goals", users: "Edit users" };

function showPage(name) {
  pages.forEach((page) => page.classList.toggle("hidden", page.id !== `page-${name}`));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.page === name));
  pageTitle.textContent = titleMap[name];
  document.querySelector(".sidebar")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach((item) => item.addEventListener("click", () => showPage(item.dataset.page)));
document.querySelectorAll("[data-page-link]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  showPage(link.dataset.pageLink);
}));
document.querySelector(".mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));

const entryModal = document.querySelector("#entry-modal");
const confirmModal = document.querySelector("#confirm-modal");
const toast = document.querySelector("#toast");
const entryForm = document.querySelector("#entry-form");
let pendingAction = null;

function openModal(modal) { modal.classList.remove("hidden"); }
function closeModals() { entryModal.classList.add("hidden"); confirmModal.classList.add("hidden"); }
document.querySelector("#open-entry").addEventListener("click", () => openModal(entryModal));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModals));
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => {
  if (event.target === backdrop) closeModals();
}));

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  pendingAction = "save";
  entryModal.classList.add("hidden");
  document.querySelector("#confirm-copy").textContent = "Your entry will be added to the general ledger.";
  document.querySelector("#confirm-action").textContent = "Confirm & save";
  openModal(confirmModal);
});

document.querySelector("#confirm-action").addEventListener("click", () => {
  if (pendingAction === "save") {
    confirmModal.classList.add("hidden");
    entryForm.reset();
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 3500);
  }
  if (pendingAction === "delete") {
    confirmModal.classList.add("hidden");
    toast.querySelector("strong").textContent = "Record deleted";
    toast.querySelector("small").textContent = "The general ledger has been updated.";
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 3500);
  }
});

document.querySelector("#print-report").addEventListener("click", () => window.print());
document.querySelector("#print-tithe").addEventListener("click", () => window.print());

const titheGrid = document.querySelector("#tithe-grid");
const monthDays = 30;
const recorded = { 2: "1,250", 5: "840", 7: "1,620", 9: "930", 12: "1,180", 13: "2,460" };
for (let day = 1; day <= monthDays; day += 1) {
  const cell = document.createElement("div");
  cell.className = `tithe-day${recorded[day] ? " recorded" : ""}`;
  cell.innerHTML = `<strong>${day}</strong><small>${new Date(2026, 8, day).toLocaleDateString("en-US", { weekday: "short" })}</small>${recorded[day] ? `<span class="day-amount">GH₵ ${recorded[day]}</span>` : "<button type='button'>＋ Add entry</button>"}`;
  cell.addEventListener("click", () => {
    if (!recorded[day]) {
      pendingAction = "tithe";
      document.querySelector("#confirm-copy").textContent = `Save a tithe entry for September ${day}, 2026?`;
      openModal(confirmModal);
    }
  });
  titheGrid.appendChild(cell);
}

document.querySelectorAll("#new-budget, #new-saving, #new-goal, #invite-user").forEach((button) => button.addEventListener("click", () => {
  pendingAction = "save";
  document.querySelector("#confirm-copy").textContent = "This change will be saved to your church workspace.";
  document.querySelector("#confirm-action").textContent = "Confirm & save";
  openModal(confirmModal);
}));

document.querySelectorAll(".delete-record").forEach((button) => button.addEventListener("click", () => {
  pendingAction = "delete";
  document.querySelector("#confirm-copy").textContent = `Delete "${button.dataset.record}" from the general ledger? This cannot be undone.`;
  document.querySelector("#confirm-action").textContent = "Confirm & delete";
  openModal(confirmModal);
}));
