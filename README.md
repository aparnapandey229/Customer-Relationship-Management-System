
# Customer-Relationship-Management-System

# SimpleCRM — Customer Relationship Management System

A front-end mini project that lets a business manage customer records, track leads/deals, and view quick analytics — built entirely with **HTML, CSS and vanilla JavaScript**,


## 🚀 Features (Current)

- **Dashboard** — live stats (Total, Leads, Active, Closed, VIP Customers) + status breakdown chart
- **Customer Management** — Add / Edit / Delete customers with form validation
- **Customer List** — table view of all customers with status & category badges, VIP indicators, and quick actions
- **VIP Customer Management (New ⭐)** — Dedicated VIP dashboard section, VIP customer table, customer category & VIP identification logic, dedicated multi-field search (by name, email, or ID), multi-level filtering (category & CRM status), live VIP count, and comprehensive customer detail modal
- **Customer Detail View Modal** — Inspect individual customer profiles with complete contact, company, category, status, VIP badge, and notes
- **Search & Filter** — live search by name/email/company/phone/ID, filter by status and category
- **Data Persistence** — customer data survives page refresh via `localStorage` with backward compatibility
- **Responsive Design** — clean dark-theme UI that works on desktop, tablet, and mobile

## 🧰 Tech Stack

- HTML5
- CSS3 (Flexbox/Grid, CSS variables, responsive design)
- JavaScript (ES6, vanilla — no frameworks)
- Browser `localStorage` for data persistence

## 📁 Project Structure

```
├── index.html      # Page structure & layout (Dashboard, Customers, Add/Edit, Reports)
├── style.css        # Styling, theme, responsive layout
├── script.js         # App logic — CRUD, dashboard rendering, search/filter, storage
└── README.md
```


## 👥 Team & Module Ownership

| Member | Role | Responsibility |
|--------|------|-----------------|
| Member 1 | Team Lead — Project Setup & HTML Structure | Page layout, sidebar navigation, HTML markup for all screens |
| Member 2 | UI/UX Developer — CSS Styling & Responsive Design | Colour theme, cards, tables, forms, responsive layout |
| Member 3 | Backend Logic Developer — Customer Management (CRUD) | Add/Edit/Delete/List operations, form validation |
| Member 4 | Data & Analytics Developer — Dashboard, Search & Storage | localStorage persistence, dashboard stats, search/filter |





## Branches

- [main](../../tree/main) — Main project branch
- [dev](../../tree/dev) — Team development branch
- [Lavi](../../tree/Lavi) — Lavi's work
-  [Aparna](../../tree/dev) — My work on the `dev` branch

##  APARNA My Work on dev

- Added phone number to customer search
- Added the Customer Reports page structure
- Improved responsive layout for smaller screens
- Reports counts aur dark theme.

- ## LAVI my work on dev
  - Added the initial frontend files: index.html, style.css, and script.js.
- Built the sidebar navigation, Dashboard, Customers list, and Add/Edit Customer form.
- Added customer add, edit, delete, and form validation.
- Added dashboard statistics, recent customers, and status breakdown.
- Added search by name, email, or company, plus a status filter.
- Saved customer data in browser localStorage.
- Styled the app and added a responsive layout.
- Added a Reports section placeholder.

## ANMOL My Work on dev

- Developed a dedicated VIP Customer Management section in the existing CRM dashboard.
- Implemented VIP customer identification logic using existing customer data.
- Created a separate VIP customer table displaying customer details.
- Added dedicated search functionality by Customer Name, Email Address, and Customer ID.
- Implemented multi-level filtering by Customer Category and CRM Status.
- Added dynamic VIP analytics displaying total VIP customers, active VIP customers, leads, and closed customers.
- Implemented a Customer Details Modal to view complete VIP customer profiles.
- Integrated VIP customer data with the existing localStorage system.
- Ensured VIP status persistence after browser refresh.
- Maintained the existing CRM design and responsive layout.
- Used HTML5, CSS3, and Vanilla JavaScript without any external frameworks.
