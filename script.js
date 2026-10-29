/* =========================================================
   SimpleCRM - script.js
   Handles: navigation, customer CRUD, localStorage,
   dashboard stats, search & filter
   ========================================================= */

// ---------- SAMPLE / INITIAL DATA ----------
const defaultCustomers = [
  { id: 1, name: "Ravi Sharma", email: "ravi.sharma@email.com", phone: "9876543210", company: "Sharma Traders", status: "Active", notes: "Long-term client, monthly orders." },
  { id: 2, name: "Priya Verma", email: "priya.verma@email.com", phone: "9123456780", company: "Verma Textiles", status: "Lead", notes: "Interested in bulk pricing." },
  { id: 3, name: "Amit Kumar", email: "amit.kumar@email.com", phone: "9988776655", company: "Kumar Electronics", status: "Closed", notes: "Deal closed last month." },
  { id: 4, name: "Sneha Gupta", email: "sneha.gupta@email.com", phone: "9090909090", company: "Gupta Retail", status: "Lead", notes: "Follow up next week." }
];

// ---------- STORAGE HELPERS ----------
function loadCustomers() {
  const data = localStorage.getItem("crm_customers");
  if (!data) {
    localStorage.setItem("crm_customers", JSON.stringify(defaultCustomers));
    return [...defaultCustomers];
  }
  return JSON.parse(data);
}

function saveCustomers(customers) {
  localStorage.setItem("crm_customers", JSON.stringify(customers));
}

let customers = loadCustomers();
let editingId = null;

// ---------- NAVIGATION ----------
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("page-title");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.page;
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    pageTitle.textContent = btn.textContent.trim().replace(/^[^\s]+\s/, "");

    if (target === "add-customer" && editingId === null) {
      resetForm();
    }
    if (target === "dashboard") renderDashboard();
    if (target === "customers") renderCustomerTable();
  });
});

// ---------- TOAST NOTIFICATION ----------
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- DASHBOARD RENDERING ----------
function renderDashboard() {
  document.getElementById("stat-total").textContent = customers.length;
  document.getElementById("stat-lead").textContent = customers.filter(c => c.status === "Lead").length;
  document.getElementById("stat-active").textContent = customers.filter(c => c.status === "Active").length;
  document.getElementById("stat-closed").textContent = customers.filter(c => c.status === "Closed").length;

  // recent customers (last 5 added)
  const recentBody = document.getElementById("recent-customers-body");
  recentBody.innerHTML = "";
  const recent = [...customers].slice(-5).reverse();
  recent.forEach(c => {
    recentBody.innerHTML += `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.company || "-")}</td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
      </tr>`;
  });

  // status breakdown bars
  const statuses = ["Lead", "Active", "Closed"];
  const colors = { Lead: "#f59e0b", Active: "#10b981", Closed: "#6366f1" };
  const total = customers.length || 1;
  const barsDiv = document.getElementById("status-bars");
  barsDiv.innerHTML = "";
  statuses.forEach(s => {
    const count = customers.filter(c => c.status === s).length;
    const pct = Math.round((count / total) * 100);
    barsDiv.innerHTML += `
      <div class="status-row">
        <div class="status-label"><span>${s}</span><span>${count} (${pct}%)</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%; background:${colors[s]}"></div></div>
      </div>`;
  });
}

// ---------- CUSTOMER TABLE RENDERING ----------
function renderCustomerTable(filter = "all", searchTerm = "") {
  const tbody = document.getElementById("customer-table-body");
  const emptyMsg = document.getElementById("empty-msg");
  tbody.innerHTML = "";

  let list = customers;
  if (filter !== "all") list = list.filter(c => c.status === filter);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.company || "").toLowerCase().includes(term)
    );
  }

  if (list.length === 0) {
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";
  }

  list.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone)}</td>
        <td>${escapeHtml(c.company || "-")}</td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
        <td>
          <button class="action-btn edit" onclick="editCustomer(${c.id})">✏️</button>
          <button class="action-btn delete" onclick="deleteCustomer(${c.id})">🗑️</button>
        </td>
      </tr>`;
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
  const notes = document.getElementById("notes").value.trim();

  if (!name || !email || !phone) {
    showToast("Please fill all required fields.");
    return;
  }

  if (editingId !== null) {
    // update existing
    const idx = customers.findIndex(c => c.id === editingId);
    customers[idx] = { id: editingId, name, email, phone, company, status, notes };
    showToast("Customer updated successfully!");
  } else {
    // add new
    const newId = customers.length ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    customers.push({ id: newId, name, email, phone, company, status, notes });
    showToast("Customer added successfully!");
  }

  saveCustomers(customers);
  resetForm();
  renderDashboard();
  renderCustomerTable();
});

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById("customer-id").value = "";
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
  document.getElementById("company").value = c.company;
  document.getElementById("status").value = c.status;
  document.getElementById("notes").value = c.notes;

  formHeading.textContent = "Edit Customer";
  submitBtn.textContent = "Update Customer";
  cancelBtn.style.display = "inline-block";

  // switch to add-customer page
  navButtons.forEach(b => b.classList.remove("active"));
  document.querySelector('[data-page="add-customer"]').classList.add("active");
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById("add-customer").classList.add("active");
  pageTitle.textContent = "Add Customer";
}

function deleteCustomer(id) {
  if (!confirm("Are you sure you want to delete this customer?")) return;
  customers = customers.filter(c => c.id !== id);
  saveCustomers(customers);
  renderDashboard();
  renderCustomerTable();
  showToast("Customer deleted.");
}

// ---------- SEARCH & FILTER ----------
document.getElementById("global-search").addEventListener("input", function () {
  const filterVal = document.getElementById("filter-status").value;
  renderCustomerTable(filterVal, this.value);
  // auto-switch to customers page while searching
  if (this.value.length > 0) {
    navButtons.forEach(b => b.classList.remove("active"));
    document.querySelector('[data-page="customers"]').classList.add("active");
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById("customers").classList.add("active");
    pageTitle.textContent = "Customers";
  }
});

document.getElementById("filter-status").addEventListener("change", function () {
  const searchVal = document.getElementById("global-search").value;
  renderCustomerTable(this.value, searchVal);
});

// ---------- UTIL ----------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- INITIAL RENDER ----------
renderDashboard();
renderCustomerTable();
