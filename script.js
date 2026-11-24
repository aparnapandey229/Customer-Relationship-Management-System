/* =========================================================
   SimpleCRM - script.js
   Handles: navigation, customer CRUD, VIP Customer Management,
   localStorage persistence, dashboard stats, search & filter,
   reports, and customer detail modal view.
   ========================================================= */

// ---------- SAMPLE / INITIAL DATA ----------
const defaultCustomers = [
  {
    id: 1,
    name: "Ravi Sharma",
    email: "ravi.sharma@email.com",
    phone: "9876543210",
    company: "Sharma Traders",
    category: "Enterprise",
    status: "Active",
    isVip: true,
    notes: "Long-term client, monthly bulk orders. Dedicated account manager assigned."
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya.verma@email.com",
    phone: "9123456780",
    company: "Verma Textiles",
    category: "Premium",
    status: "Lead",
    isVip: false,
    notes: "Interested in bulk pricing. Scheduled demo for next week."
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "9988776655",
    company: "Kumar Electronics",
    category: "Standard",
    status: "Closed",
    isVip: false,
    notes: "Deal closed last month. Renewal due in Q4."
  },
  {
    id: 4,
    name: "Sneha Gupta",
    email: "sneha.gupta@email.com",
    phone: "9090909090",
    company: "Gupta Retail",
    category: "Standard",
    status: "Lead",
    isVip: false,
    notes: "Follow up next week regarding new catalog."
  }
];

// ---------- STORAGE HELPERS ----------
function loadCustomers() {
  const data = localStorage.getItem("crm_customers");
  if (!data) {
    localStorage.setItem("crm_customers", JSON.stringify(defaultCustomers));
    return [...defaultCustomers];
  }

  try {
    let parsed = JSON.parse(data);
    let updated = false;

    // Backward compatibility: ensure every customer has isVip and category
    parsed = parsed.map(c => {
      let changed = false;
      if (typeof c.isVip === "undefined") {
        c.isVip = c.id === 1; // Ravi Sharma is VIP by default
        changed = true;
      }
      if (!c.category) {
        c.category = c.isVip ? "Enterprise" : (c.id === 2 ? "Premium" : "Standard");
        changed = true;
      }
      if (changed) updated = true;
      return c;
    });

    if (updated) {
      saveCustomers(parsed);
    }
    return parsed;
  } catch (err) {
    console.error("Error reading localStorage, resetting to default:", err);
    localStorage.setItem("crm_customers", JSON.stringify(defaultCustomers));
    return [...defaultCustomers];
  }
}

function saveCustomers(customerList) {
  localStorage.setItem("crm_customers", JSON.stringify(customerList));
}

let customers = loadCustomers();
let editingId = null;
let currentModalCustomerId = null;

// ---------- NAVIGATION ----------
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("page-title");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navigateToPage(btn.dataset.page);
  });
});

function navigateToPage(targetPageId) {
  navButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.page === targetPageId);
  });

  pages.forEach(p => {
    p.classList.toggle("active", p.id === targetPageId);
  });

  const activeBtn = document.querySelector(`.nav-btn[data-page="${targetPageId}"]`);
  if (activeBtn) {
    pageTitle.textContent = activeBtn.textContent.trim().replace(/^[^\s]+\s/, "");
  }

  if (targetPageId === "add-customer" && editingId === null) {
    resetForm();
  }
  if (targetPageId === "dashboard") renderDashboard();
  if (targetPageId === "customers") renderCustomerTable();
  if (targetPageId === "vip-customers") renderVipTable();
  if (targetPageId === "reports") renderReports();
}

// ---------- TOAST NOTIFICATION ----------
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

// ---------- DASHBOARD RENDERING ----------
function renderDashboard() {
  const total = customers.length;
  const leads = customers.filter(c => c.status === "Lead").length;
  const active = customers.filter(c => c.status === "Active").length;
  const closed = customers.filter(c => c.status === "Closed").length;
  const vips = customers.filter(c => c.isVip).length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-lead").textContent = leads;
  document.getElementById("stat-active").textContent = active;
  document.getElementById("stat-closed").textContent = closed;

  const vipStatEl = document.getElementById("stat-vip");
  if (vipStatEl) vipStatEl.textContent = vips;

  // Recent customers (last 5 added)
  const recentBody = document.getElementById("recent-customers-body");
  if (recentBody) {
    recentBody.innerHTML = "";
    const recent = [...customers].slice(-5).reverse();
    recent.forEach(c => {
      recentBody.innerHTML += `
        <tr>
          <td>
            ${escapeHtml(c.name)}
            ${c.isVip ? '<span class="mini-vip-badge" title="VIP Customer">⭐</span>' : ''}
          </td>
          <td>${escapeHtml(c.company || "-")}</td>
          <td><span class="status-badge ${c.status}">${c.status}</span></td>
        </tr>`;
    });
  }

  // Status breakdown bars
  const statuses = ["Lead", "Active", "Closed"];
  const colors = { Lead: "#f59e0b", Active: "#10b981", Closed: "#6366f1" };
  const safeTotal = total || 1;
  const barsDiv = document.getElementById("status-bars");
  if (barsDiv) {
    barsDiv.innerHTML = "";
    statuses.forEach(s => {
      const count = customers.filter(c => c.status === s).length;
      const pct = Math.round((count / safeTotal) * 100);
      barsDiv.innerHTML += `
        <div class="status-row">
          <div class="status-label"><span>${s}</span><span>${count} (${pct}%)</span></div>
          <div class="bar-bg"><div class="bar-fill" style="width:${pct}%; background:${colors[s]}"></div></div>
        </div>`;
    });
  }

  renderReports();
}

// ---------- REPORTS RENDERING ----------
function renderReports() {
  const total = customers.length;
  const leads = customers.filter(c => c.status === "Lead").length;
  const active = customers.filter(c => c.status === "Active").length;
  const closed = customers.filter(c => c.status === "Closed").length;
  const vips = customers.filter(c => c.isVip).length;

  const repTotal = document.getElementById("report-total");
  const repLeads = document.getElementById("report-leads");
  const repActive = document.getElementById("report-active");
  const repClosed = document.getElementById("report-closed");
  const repVip = document.getElementById("report-vip");

  if (repTotal) repTotal.textContent = total;
  if (repLeads) repLeads.textContent = leads;
  if (repActive) repActive.textContent = active;
  if (repClosed) repClosed.textContent = closed;
  if (repVip) repVip.textContent = vips;

  const repLeadCount = document.getElementById("report-lead-count");
  const repActiveCount = document.getElementById("report-active-count");
  const repClosedCount = document.getElementById("report-closed-count");
  const repVipCount = document.getElementById("report-vip-count");

  if (repLeadCount) repLeadCount.textContent = leads;
  if (repActiveCount) repActiveCount.textContent = active;
  if (repClosedCount) repClosedCount.textContent = closed;
  if (repVipCount) repVipCount.textContent = vips;
}

// ---------- CUSTOMER TABLE RENDERING (ALL CUSTOMERS) ----------
function renderCustomerTable(filter = "all", searchTerm = "") {
  const tbody = document.getElementById("customer-table-body");
  const emptyMsg = document.getElementById("empty-msg");
  if (!tbody) return;
  tbody.innerHTML = "";

  let list = customers;
  if (filter !== "all") list = list.filter(c => c.status === filter);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.company || "").toLowerCase().includes(term) ||
      String(c.id).includes(term)
    );
  }

  if (list.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
  } else {
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  list.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td><span class="id-tag">#${c.id}</span></td>
        <td>
          <div class="name-cell">
            <strong>${escapeHtml(c.name)}</strong>
            ${c.isVip ? '<span class="vip-tag" title="VIP Customer">⭐ VIP</span>' : ''}
          </div>
        </td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone)}</td>
        <td>${escapeHtml(c.company || "-")}</td>
        <td><span class="category-badge ${c.category || 'Standard'}">${escapeHtml(c.category || "Standard")}</span></td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
        <td class="actions-cell">
          <button class="action-btn view" onclick="viewCustomerDetails(${c.id})" title="View Details">👁️</button>
          <button class="action-btn vip-star ${c.isVip ? 'active' : ''}" onclick="toggleVipStatus(${c.id})" title="${c.isVip ? 'Remove VIP Status' : 'Mark as VIP'}">⭐</button>
          <button class="action-btn edit" onclick="editCustomer(${c.id})" title="Edit Customer">✏️</button>
          <button class="action-btn delete" onclick="deleteCustomer(${c.id})" title="Delete Customer">🗑️</button>
        </td>
      </tr>`;
  });
}

// ---------- VIP CUSTOMER TABLE RENDERING ----------
function renderVipTable(categoryFilter = "all", statusFilter = "all", searchTerm = "") {
  const tbody = document.getElementById("vip-customer-table-body");
  const emptyMsg = document.getElementById("vip-empty-msg");
  const vipCountEl = document.getElementById("vip-total-count");

  // Filter ONLY VIP customers from the customer store
  const allVips = customers.filter(c => Boolean(c.isVip));

  // Update total VIP count display
  if (vipCountEl) {
    vipCountEl.textContent = allVips.length;
  }

  if (!tbody) return;
  tbody.innerHTML = "";

  let list = allVips;

  // Filter by category
  if (categoryFilter !== "all") {
    list = list.filter(c => (c.category || "Standard").toLowerCase() === categoryFilter.toLowerCase());
  }

  // Filter by status
  if (statusFilter !== "all") {
    list = list.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
  }

  // Search by name, email, or ID
  if (searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    list = list.filter(c => {
      const idStr = String(c.id);
      const vipFormattedId = `vip-${String(c.id).padStart(3, '0')}`.toLowerCase();
      const vipPlainId = `vip${c.id}`.toLowerCase();
      const name = c.name.toLowerCase();
      const email = c.email.toLowerCase();
      const company = (c.company || "").toLowerCase();

      return (
        name.includes(term) ||
        email.includes(term) ||
        company.includes(term) ||
        idStr === term ||
        idStr.includes(term) ||
        vipFormattedId.includes(term) ||
        vipPlainId.includes(term)
      );
    });
  }

  // Handle empty state
  if (list.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
  } else {
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  // Render VIP table rows
  list.forEach(c => {
    const formattedId = `VIP-${String(c.id).padStart(3, '0')}`;
    tbody.innerHTML += `
      <tr class="vip-row">
        <td><span class="vip-id-badge">${formattedId}</span></td>
        <td>
          <div class="name-cell">
            <span class="vip-crown">⭐</span>
            <strong>${escapeHtml(c.name)}</strong>
          </div>
        </td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone)}</td>
        <td>${escapeHtml(c.company || "-")}</td>
        <td><span class="category-badge ${c.category || 'Standard'}">${escapeHtml(c.category || "Standard")}</span></td>
        <td><span class="status-badge vip">⭐ Active VIP</span></td>
        <td class="actions-cell">
          <button class="btn-action-view" onclick="viewCustomerDetails(${c.id})" title="View Details">👁️ View</button>
          <button class="action-btn edit" onclick="editCustomer(${c.id})" title="Edit Customer">✏️</button>
          <button class="action-btn vip-remove" onclick="toggleVipStatus(${c.id})" title="Remove from VIP">⭐❌</button>
        </td>
      </tr>`;
  });
}

// ---------- VIP TOGGLE LOGIC ----------
function toggleVipStatus(id) {
  const customer = customers.find(c => c.id === id);
  if (!customer) return;

  customer.isVip = !customer.isVip;

  // If newly promoted to VIP and category is Standard, auto-suggest Enterprise/Premium
  if (customer.isVip && (!customer.category || customer.category === "Standard")) {
    customer.category = "Enterprise";
  }

  saveCustomers(customers);

  showToast(
    customer.isVip
      ? `⭐ ${customer.name} marked as VIP Customer!`
      : `${customer.name} removed from VIP status.`
  );

  // Refresh all relevant views
  renderDashboard();
  renderCustomerTable(
    document.getElementById("filter-status") ? document.getElementById("filter-status").value : "all",
    document.getElementById("global-search") ? document.getElementById("global-search").value : ""
  );

  const vipCategory = document.getElementById("vip-filter-category") ? document.getElementById("vip-filter-category").value : "all";
  const vipStatus = document.getElementById("vip-filter-status") ? document.getElementById("vip-filter-status").value : "all";
  const vipSearch = document.getElementById("vip-search") ? document.getElementById("vip-search").value : "";
  renderVipTable(vipCategory, vipStatus, vipSearch);

  // If modal is open for this customer, update modal content live
  if (currentModalCustomerId === id) {
    viewCustomerDetails(id);
  }
}

// ---------- CUSTOMER DETAILS MODAL ----------
const customerModal = document.getElementById("customer-modal");
const modalCloseX = document.getElementById("modal-close-x");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalVipToggleBtn = document.getElementById("modal-vip-toggle-btn");
const modalEditBtn = document.getElementById("modal-edit-btn");

function viewCustomerDetails(id) {
  const c = customers.find(item => item.id === id);
  if (!c) return;

  currentModalCustomerId = id;

  const formattedId = `ID: #${c.id} (VIP-${String(c.id).padStart(3, '0')})`;
  document.getElementById("modal-name").textContent = c.name;
  document.getElementById("modal-id-tag").textContent = c.isVip ? formattedId : `ID: #${c.id}`;
  document.getElementById("modal-badge-icon").textContent = c.isVip ? "⭐" : "👤";
  document.getElementById("modal-email").textContent = c.email;
  document.getElementById("modal-phone").textContent = c.phone;
  document.getElementById("modal-company").textContent = c.company || "Not Specified";
  document.getElementById("modal-category").innerHTML = `<span class="category-badge ${c.category || 'Standard'}">${escapeHtml(c.category || "Standard")}</span>`;
  document.getElementById("modal-status").innerHTML = `<span class="status-badge ${c.status}">${c.status}</span>`;
  document.getElementById("modal-vip-status").innerHTML = c.isVip
    ? `<span class="status-badge vip">⭐ Active VIP Customer</span>`
    : `<span class="status-badge standard-badge">Standard Customer</span>`;
  document.getElementById("modal-notes").textContent = c.notes ? c.notes : "No notes recorded.";

  // Setup modal toggle VIP button
  modalVipToggleBtn.textContent = c.isVip ? "⭐ Remove VIP Status" : "⭐ Mark as VIP";
  modalVipToggleBtn.className = c.isVip ? "btn-vip-toggle remove" : "btn-vip-toggle add";

  customerModal.style.display = "flex";
}

function closeCustomerModal() {
  if (customerModal) {
    customerModal.style.display = "none";
    currentModalCustomerId = null;
  }
}

if (modalCloseX) modalCloseX.addEventListener("click", closeCustomerModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeCustomerModal);

if (customerModal) {
  customerModal.addEventListener("click", function (e) {
    if (e.target === customerModal) {
      closeCustomerModal();
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && customerModal && customerModal.style.display === "flex") {
    closeCustomerModal();
  }
});

if (modalVipToggleBtn) {
  modalVipToggleBtn.addEventListener("click", function () {
    if (currentModalCustomerId !== null) {
      toggleVipStatus(currentModalCustomerId);
    }
  });
}

if (modalEditBtn) {
  modalEditBtn.addEventListener("click", function () {
    if (currentModalCustomerId !== null) {
      const idToEdit = currentModalCustomerId;
      closeCustomerModal();
      editCustomer(idToEdit);
    }
  });
}

// ---------- FORM HANDLING (ADD / EDIT) ----------
const form = document.getElementById("customer-form");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-edit-btn");
const formHeading = document.getElementById("form-heading");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const company = document.getElementById("company").value.trim();
  const status = document.getElementById("status").value;
  const category = document.getElementById("category").value;
  const isVip = document.getElementById("is-vip").checked;
  const notes = document.getElementById("notes").value.trim();

  if (!name || !email || !phone) {
    showToast("Please fill all required fields.");
    return;
  }

  if (editingId !== null) {
    // Update existing customer
    const idx = customers.findIndex(c => c.id === editingId);
    if (idx !== -1) {
      customers[idx] = {
        id: editingId,
        name,
        email,
        phone,
        company,
        status,
        category,
        isVip,
        notes
      };
      showToast("Customer updated successfully!");
    }
  } else {
    // Add new customer
    const newId = customers.length ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    customers.push({
      id: newId,
      name,
      email,
      phone,
      company,
      status,
      category,
      isVip,
      notes
    });
    showToast(isVip ? "VIP Customer added successfully! ⭐" : "Customer added successfully!");
  }

  saveCustomers(customers);
  resetForm();
  renderDashboard();
  renderCustomerTable();
  renderVipTable();
});

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById("customer-id").value = "";
  document.getElementById("is-vip").checked = false;
  document.getElementById("category").value = "Standard";
  formHeading.textContent = "Add New Customer";
  submitBtn.textContent = "Save Customer";
  cancelBtn.style.display = "none";
}

function editCustomer(id) {
  const c = customers.find(c => c.id === id);
  if (!c) return;
  editingId = id;
  document.getElementById("customer-id").value = c.id;
  document.getElementById("name").value = c.name;
  document.getElementById("email").value = c.email;
  document.getElementById("phone").value = c.phone;
  document.getElementById("company").value = c.company || "";
  document.getElementById("status").value = c.status;
  document.getElementById("category").value = c.category || (c.isVip ? "Enterprise" : "Standard");
  document.getElementById("is-vip").checked = Boolean(c.isVip);
  document.getElementById("notes").value = c.notes || "";

  formHeading.textContent = c.isVip ? "Edit VIP Customer ⭐" : "Edit Customer";
  submitBtn.textContent = "Update Customer";
  cancelBtn.style.display = "inline-block";

  // Switch to add-customer page
  navigateToPage("add-customer");
}

function deleteCustomer(id) {
  const customer = customers.find(c => c.id === id);
  const name = customer ? customer.name : "this customer";
  if (!confirm(`Are you sure you want to delete ${name}?`)) return;

  customers = customers.filter(c => c.id !== id);
  saveCustomers(customers);
  renderDashboard();
  renderCustomerTable();
  renderVipTable();
  showToast("Customer deleted.");
}

// ---------- SEARCH & FILTER EVENT LISTENERS ----------

// 1. Global Search (in topbar)
const globalSearch = document.getElementById("global-search");
if (globalSearch) {
  globalSearch.addEventListener("input", function () {
    const filterVal = document.getElementById("filter-status") ? document.getElementById("filter-status").value : "all";
    renderCustomerTable(filterVal, this.value);

    // Auto-switch to customers page while searching from topbar if not already on customers or VIP page
    const activePage = document.querySelector(".page.active");
    if (this.value.length > 0 && activePage && activePage.id !== "customers" && activePage.id !== "vip-customers") {
      navigateToPage("customers");
    }
  });
}

// 2. Customers List Status Filter
const filterStatus = document.getElementById("filter-status");
if (filterStatus) {
  filterStatus.addEventListener("change", function () {
    const searchVal = globalSearch ? globalSearch.value : "";
    renderCustomerTable(this.value, searchVal);
  });
}

// 3. VIP Search Input (dedicated VIP search bar)
const vipSearchInput = document.getElementById("vip-search");
if (vipSearchInput) {
  vipSearchInput.addEventListener("input", function () {
    const catVal = document.getElementById("vip-filter-category") ? document.getElementById("vip-filter-category").value : "all";
    const statusVal = document.getElementById("vip-filter-status") ? document.getElementById("vip-filter-status").value : "all";
    renderVipTable(catVal, statusVal, this.value);
  });
}

// 4. VIP Category Filter
const vipFilterCategory = document.getElementById("vip-filter-category");
if (vipFilterCategory) {
  vipFilterCategory.addEventListener("change", function () {
    const statusVal = document.getElementById("vip-filter-status") ? document.getElementById("vip-filter-status").value : "all";
    const searchVal = vipSearchInput ? vipSearchInput.value : "";
    renderVipTable(this.value, statusVal, searchVal);
  });
}

// 5. VIP Status Filter
const vipFilterStatus = document.getElementById("vip-filter-status");
if (vipFilterStatus) {
  vipFilterStatus.addEventListener("change", function () {
    const catVal = document.getElementById("vip-filter-category") ? document.getElementById("vip-filter-category").value : "all";
    const searchVal = vipSearchInput ? vipSearchInput.value : "";
    renderVipTable(catVal, this.value, searchVal);
  });
}

// 6. VIP Add Shortcut Button
const addVipShortcutBtn = document.getElementById("btn-add-vip-shortcut");
if (addVipShortcutBtn) {
  addVipShortcutBtn.addEventListener("click", function () {
    resetForm();
    document.getElementById("is-vip").checked = true;
    document.getElementById("category").value = "Enterprise";
    formHeading.textContent = "Add New VIP Customer ⭐";
    navigateToPage("add-customer");
  });
}

// 7. Stat Card VIP Click Shortcut
const statVipCard = document.querySelector(".stat-card.vip");
if (statVipCard) {
  statVipCard.style.cursor = "pointer";
  statVipCard.title = "Click to view VIP Customers";
  statVipCard.addEventListener("click", () => navigateToPage("vip-customers"));
}

// ---------- UTIL ----------
function escapeHtml(str) {
  if (typeof str !== "string") return str || "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- INITIAL RENDER ----------
renderDashboard();
renderCustomerTable();
renderVipTable();
