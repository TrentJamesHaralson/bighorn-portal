// public/js/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const userName = document.getElementById("userName");
  const voucherBalance = document.getElementById("voucherBalance");
  const invoiceRows = document.getElementById("invoiceRows");
  const systemStatus = document.getElementById("systemStatus");
  const nav = document.getElementById("nav");

  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  });

  // whoami for role and nav
  let who;
  try {
    const r = await fetch("/whoami");
    if (!r.ok) throw new Error("Auth");
    who = await r.json();
    userName.textContent = who.user?.email || "User";
  } catch {
    window.location.href = "/login";
    return;
  }

  // build nav per role
  const role = who.user?.role || "USER";
  const linksByRole = {
    USER: [
      [" /dashboard", "Dashboard"],
      ["/vouchers", "My Vouchers"],
      ["/invoices", "My Orders"]
    ],
    ADMIN: [
      ["/dashboard", "Dashboard"],
      ["/users", "Employees"],
      ["/vouchers", "Vouchers"],
      ["/invoices", "Orders"],
      ["/reports/summary", "Reports"]
    ],
    SYSTEM_ADMIN: [
      ["/dashboard", "Dashboard"],
      ["/accounts", "Accounts"],
      ["/users", "Users"],
      ["/vouchers", "Vouchers"],
      ["/invoices", "Invoices"],
      ["/reports/summary", "Reports"],
      ["/system/settings", "System Settings"]
    ]
  };
  nav.innerHTML = (linksByRole[role] || linksByRole.USER)
    .map(([href, text]) => `<a href="${href}">${text}</a>`)
    .join("");

  // vouchers
  try {
    const vr = await fetch("/vouchers");
    if (vr.ok) {
      const vouchers = await vr.json();
      const balance = vouchers.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
      voucherBalance.textContent = `$${balance.toFixed(2)}`;
    } else {
      voucherBalance.textContent = "Unavailable";
    }
  } catch { voucherBalance.textContent = "Error"; }

  // invoices
  try {
    const ir = await fetch("/invoices");
    if (ir.ok) {
      const invoices = await ir.json();
      invoiceRows.innerHTML = invoices.slice(0, 5)
        .map(inv => `<tr><td>${inv.id}</td><td>${inv.status}</td><td>$${Number(inv.total).toFixed(2)}</td></tr>`)
        .join("");
    } else {
      invoiceRows.innerHTML = "<tr><td colspan='3'>Unavailable</td></tr>";
    }
  } catch {
    invoiceRows.innerHTML = "<tr><td colspan='3'>Error</td></tr>";
  }

  // health
  try {
    const hr = await fetch("/health"); const h = await hr.json();
    systemStatus.innerHTML = `
      <li>Database: <span class="${h.db_connected ? "ok" : "err"}">${h.db_connected ? "Connected" : "Error"}</span></li>
      <li>Session: <span class="${h.session ? "ok" : "err"}">${h.session ? "Active" : "Error"}</span></li>
    `;
  } catch {
    systemStatus.innerHTML = `<li class="err">System check failed</li>`;
  }
});
