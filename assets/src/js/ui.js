import {
  mockLogin,
  mockRegister,
  getSession,
  clearSession,
  saveSession,
  SESSION_KEY,
} from "./auth.js";
import {
  loadTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "./ticketsStorage.js";
import {
  validateTitle,
  validateStatus,
  validateDescription,
} from "./validators.js";

// simple Notyf toast
const notyf = new Notyf({ duration: 3000 });

// Helpers
function el(id) {
  return document.getElementById(id);
}
function q(sel) {
  return document.querySelector(sel);
}
function renderHeader() {
  const headerRight = document.getElementById("header-right");
  if (!headerRight) return;
  headerRight.innerHTML = "";
  const session = getSession();
  if (session) {
    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-3";
    const initials = (session.name || session.email || "U")
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();
    wrapper.innerHTML = `<div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-full bg-[#9B8AFB] text-white font-semibold flex items-center justify-center">${initials}</div>
      <div class="text-sm font-medium text-[#111827] dark:text-white">${
        session.name || session.email
      }</div>
    </div>
    <button id="logout-btn" class="px-3 py-1 font-semibold text-[#9B8AFB]">Logout</button>`;
    headerRight.appendChild(wrapper);
    document.getElementById("logout-btn").addEventListener("click", () => {
      clearSession();
      notyf.success("Logged out successfully");
      // redirect to homepage
      location.href = "/";
    });
  } else {
    const a = document.createElement("a");
    a.href = "/auth/login";
    a.className =
      "px-3 py-1 bg-[#9B8AFB] text-white rounded text-base hover:bg-[#9B8AFB]/90";
    a.innerText = "Login";
    headerRight.appendChild(a);
  }
}

// dark mode toggle using class on documentElement
function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefers =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefers))
    document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// login form
function bindAuthForms() {
  const loginForm = el("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = el("login-email").value.trim();
      const password = el("login-password").value.trim();
      const err = el("login-error");
      err.classList.add("hidden");
      try {
        await mockLogin(email, password);
        notyf.success("Login successful");
        location.href = "/dashboard";
      } catch (ex) {
        err.innerText = ex.message || "Login failed";
        err.classList.remove("hidden");
        notyf.error("Failed to login");
      }
    });
  }

  const signupForm = el("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = el("signup-name").value.trim();
      const email = el("signup-email").value.trim();
      const password = el("signup-password").value.trim();
      const err = el("signup-error");
      err.classList.add("hidden");
      try {
        await mockRegister(email, password, name);
        notyf.success("Account created");
        location.href = "/dashboard";
      } catch (ex) {
        err.innerText = ex.message || "Signup failed";
        err.classList.remove("hidden");
        notyf.error("Signup failed");
      }
    });
  }
}

// Tickets page rendering & interactions
function renderTicketsGrid() {
  const grid = el("tickets-grid");
  if (!grid) return;
  const tickets = loadTickets();
  const search = el("ticket-search")
    ? el("ticket-search").value.toLowerCase()
    : "";
  const filtered = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(search) ||
      (t.description || "").toLowerCase().includes(search)
  );
  grid.innerHTML = "";
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
      <svg data-lucide="plus" class="text-gray-400 dark:text-gray-500 w-12 h-12"></svg>
      <p class="text-gray-500 dark:text-gray-400">You have no more tickets.</p>
      <button id="create-ticket-cta" class="bg-[#9B8AFB] text-white font-medium py-2 px-4 rounded-lg">Create New Ticket</button>
    </div>`;
    const cta = document.getElementById("create-ticket-cta");
    if (cta) cta.addEventListener("click", openCreateModal);
    return;
  }

  filtered.forEach((t) => {
    const item = document.createElement("div");
    item.className =
      "flex flex-col gap-4 bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm";
    const statusText =
      t.status === "in_progress"
        ? "In Progress"
        : t.status === "open"
        ? "Open"
        : "Closed";
    const statusClass =
      t.status === "open"
        ? "bg-green-500/10 text-green-600"
        : t.status === "in_progress"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-gray-500/20 text-gray-600";
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <p class="text-xl font-bold text-[#111827] dark:text-white">${escapeHtml(
          t.title
        )}</p>
        <div class="flex items-center gap-2">
          <button data-action="edit" data-id="${
            t.id
          }" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><svg data-lucide="edit" class="w-4 h-4"></svg></button>
          <button data-action="delete" data-id="${
            t.id
          }" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><svg data-lucide="trash-2" class="w-4 h-4"></svg></button>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-400 text-sm">${escapeHtml(
        t.description || ""
      )}</p>
      <div class="flex items-center justify-between mt-2">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}">${statusText}</span>
      </div>
    `;
    grid.appendChild(item);
  });

  // wire buttons
  grid.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      openEditModal(id);
    });
  });
  grid.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      openDeleteConfirm(id);
    });
  });

  // refresh lucide icons
  if (window.lucide) lucide.replace();
}

function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

// modal controls & form handling
let editingId = null;
function openCreateModal() {
  editingId = null;
  el("ticket-modal").classList.remove("hidden");
  el("ticket-modal").classList.add("flex");
  el("ticket-modal-title").innerText = "Create New Ticket";
  el("ticket-title").value = "";
  el("ticket-desc").value = "";
  el("ticket-status").value = "open";
}
function openEditModal(id) {
  const tickets = loadTickets();
  const t = tickets.find((x) => x.id === id);
  if (!t) return;
  editingId = id;
  el("ticket-modal").classList.remove("hidden");
  el("ticket-modal").classList.add("flex");
  el("ticket-modal-title").innerText = `Edit Ticket #${id
    .slice(0, 8)
    .toUpperCase()}`;
  el("ticket-title").value = t.title;
  el("ticket-desc").value = t.description || "";
  el("ticket-status").value = t.status;
  el("ticket-submit").innerText = "Save Changes";
}
function closeTicketModal() {
  el("ticket-modal").classList.add("hidden");
  el("ticket-modal").classList.remove("flex");
  el("ticket-submit").innerText = "Create Ticket";
}
function openDeleteConfirm(id) {
  el("delete-modal").classList.remove("hidden");
  el("delete-modal").classList.add("flex");
  el("confirm-delete-btn").dataset.id = id;
}
function closeDeleteConfirm() {
  el("delete-modal").classList.add("hidden");
  el("delete-modal").classList.remove("flex");
}

function bindTicketModal() {
  if (el("create-ticket-btn"))
    el("create-ticket-btn").addEventListener("click", openCreateModal);
  if (el("create-ticket-cta"))
    el("create-ticket-cta").addEventListener("click", openCreateModal);

  if (el("ticket-cancel"))
    el("ticket-cancel").addEventListener("click", (e) => {
      e.preventDefault();
      closeTicketModal();
    });
  if (el("ticket-form")) {
    el("ticket-form").addEventListener("submit", (e) => {
      e.preventDefault();
      // read
      const title = el("ticket-title").value.trim();
      const desc = el("ticket-desc").value.trim();
      const status = el("ticket-status").value;
      const errs = {
        title: validateTitle(title),
        status: validateStatus(status),
        desc: validateDescription(desc),
      };
      el("ticket-title-error").innerText = errs.title || "";
      el("ticket-status-error").innerText = errs.status || "";
      el("ticket-desc-error").innerText = errs.desc || "";
      if (errs.title || errs.status || errs.desc) {
        notyf.error("Please enter the required fields correctly.");
        return;
      }

      try {
        if (editingId) {
          const updated = {
            id: editingId,
            title,
            description: desc,
            status,
            priority: 3,
            createdAt: new Date().toISOString(),
          };
          updateTicket(updated);
          notyf.success("Ticket updated");
        } else {
          createTicket({ title, description: desc, status, priority: 3 });
          notyf.success("Ticket created");
        }
        closeTicketModal();
        renderTicketsGrid();
        updateDashboardStats();
      } catch (ex) {
        notyf.error("Failed to save ticket");
      }
    });
  }

  if (el("confirm-delete-btn"))
    el("confirm-delete-btn").addEventListener("click", () => {
      const id = el("confirm-delete-btn").dataset.id;
      try {
        deleteTicket(id);
        notyf.success("Ticket deleted");
        renderTicketsGrid();
        updateDashboardStats();
      } catch {
        notyf.error("Failed to delete ticket");
      }
      closeDeleteConfirm();
    });
  if (el("cancel-delete-btn"))
    el("cancel-delete-btn").addEventListener("click", closeDeleteConfirm);
}

function bindSearch() {
  const input = el("ticket-search");
  if (!input) return;
  input.addEventListener("input", () => {
    renderTicketsGrid();
  });
}

function updateDashboardStats() {
  if (!el("stat-total")) return;
  const tickets = loadTickets();
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "open").length;
  const inProg = tickets.filter((t) => t.status === "in_progress").length;
  const closed = tickets.filter((t) => t.status === "closed").length;
  el("stat-total").innerText = total;
  el("stat-open").innerText = open;
  el("stat-inprog").innerText = inProg;
  el("stat-closed").innerText = closed;
  const session = getSession();
  if (session && el("dashboard-user"))
    el("dashboard-user").innerText = session.name || session.email || "User";
}

// CountUp for challenges when in view
function initChallengeCounters() {
  const cards = document.querySelectorAll(".challenge-card");
  if (!cards.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const elTarget = card.querySelector(".count-target");
        const num = parseInt(card.dataset.number || "0", 10);
        const suffix = card.dataset.suffix || "";
        if (elTarget) {
          const c = new CountUp(elTarget, num, { duration: 1.2, suffix });
          if (!c.error) c.start();
        }
        observer.unobserve(card);
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((c) => observer.observe(c));
}

// small in-view animation for elements with 'animate-on-view'
function initInViewAnimations() {
  const els = document.querySelectorAll("[data-animate-on-view]");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) en.target.classList.add("animate-fade-in-scale");
      });
    },
    { threshold: 0.2 }
  );
  els.forEach((e) => obs.observe(e));
}

// wire header login button on landing to show proper CTA when logged in
function wireHeroButtons() {
  const session = getSession();
  if (session) {
    const go = document.createElement("a");
    go.href = "/dashboard";
    go.className =
      "flex items-center justify-center rounded-full h-12 px-8 bg-[#9B8AFB] text-white font-semibold shadow-lg shadow-[#9B8AFB]/30 hover:bg-[#9B8AFB]/90 transition-all";
    go.innerText = "Go to Dashboard";
    const c = document.getElementById("hero-cta");
    if (c) {
      c.innerHTML = "";
      c.appendChild(go);
    }
  }
}

// mobile drawer (simple)
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // create drawer if missing
    let drawer = document.getElementById("mobile-drawer");
    if (!drawer) {
      drawer = document.createElement("nav");
      drawer.id = "mobile-drawer";
      drawer.className =
        "fixed right-0 top-0 h-full w-72 bg-white dark:bg-[#111827] border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 p-6";
      drawer.innerHTML = `
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-base font-semibold text-[#111827] dark:text-white">TicketApp</h2>
          <button id="drawer-close" class="p-2 rounded-lg hover:bg-[#9B8AFB]/10">Close</button>
        </div>
        <div class="flex flex-col gap-5">
          <a href="/" class="text-base text-[#111827] dark:text-white hover:text-[#9B8AFB]">Home</a>
          <a href="/tickets" class="text-base text-[#111827] dark:text-white hover:text-[#9B8AFB]">Tickets</a>
          <a href="/dashboard" class="text-base text-[#111827] dark:text-white hover:text-[#9B8AFB]">Dashboard</a>
        </div>
      `;
      document.body.appendChild(drawer);
      document
        .getElementById("drawer-close")
        .addEventListener("click", () => drawer.remove());
    } else {
      drawer.remove();
    }
  });
}

// initialize page based on path
function init() {
  initTheme();
  renderHeader();
  bindAuthForms();
  bindTicketModal();
  bindSearch();
  initMobileMenu();
  wireHeroButtons();
  initChallengeCounters();
  initInViewAnimations();

  // run page-specific initializers
  if (document.querySelector("#tickets-grid")) renderTicketsGrid();
  if (document.querySelector("#stat-total")) updateDashboardStats();

  // doc-level listeners
  document.addEventListener("click", (e) => {
    if (
      e.target &&
      (e.target.id === "create-ticket-btn" ||
        e.target.closest("#create-ticket-btn"))
    )
      openCreateModal();
  });

  // lucide icons
  if (window.lucide) lucide.replace();
}

document.addEventListener("DOMContentLoaded", init);
