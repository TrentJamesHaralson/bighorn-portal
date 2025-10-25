// Shared helpers for all pages

async function apiGet(path) {
  const res = await fetch(path, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("GET " + path + " failed with " + res.status);
  return res.json();
}

function filterTableRows(tableSelector, query) {
  const q = (query || "").toLowerCase();
  const rows = document.querySelectorAll(tableSelector + " tbody tr");
  rows.forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(q) ? "" : "none";
  });
}

function safe(val) {
  if (val === null || val === undefined) return "";
  return String(val);
}

/* Renderers */

function renderUsersTable(rows, tbody) {
  tbody.innerHTML = "";
  rows.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = [
      "<td>" + safe(u.email) + "</td>",
      "<td>" + safe(u.role) + "</td>",
      "<td>" + safe(u.account_id) + "</td>",
      "<td>" + (u.active === true || u.is_active === 1 ? "Yes" : "No") + "</td>",
      "<td>" + safe(u.created_at) + "</td>"
    ].join("");
    tbody.appendChild(tr);
  });
}

function renderAccountsTable(rows, tbody) {
  tbody.innerHTML = "";
  rows.forEach((a) => {
    const tr = document.createElement("tr");
    tr.innerHTML = [
      "<td>" + safe(a.name) + "</td>",
      "<td>" + safe(a.contact_email) + "</td>",
      "<td>" + safe(a.created_at) + "</td>"
    ].join("");
    tbody.appendChild(tr);
  });
}

function renderInvoicesTable(rows, tbody) {
  tbody.innerHTML = "";
  rows.forEach((inv) => {
    const tr = document.createElement("tr");
    tr.innerHTML = [
      "<td>" + safe(inv.id) + "</td>",
      "<td>" + safe(inv.account_id) + "</td>",
      "<td>" + safe(inv.status) + "</td>",
      "<td>" + safe(inv.total) + "</td>",
      "<td>" + safe(inv.created_at) + "</td>"
    ].join("");
    tbody.appendChild(tr);
  });
}
