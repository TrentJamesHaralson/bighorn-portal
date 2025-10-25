# C:\BighornPortal_New\Scripts\Write-BighornPublicFiles.ps1

$PublicPath = "C:\BighornPortal_New\public"
$BackupPath = Join-Path $PublicPath ("BU-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

# Ensure folders
New-Item -ItemType Directory -Path $PublicPath -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path (Join-Path $PublicPath "js") -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path (Join-Path $PublicPath "images") -ErrorAction SilentlyContinue | Out-Null

# Backup existing public files
New-Item -ItemType Directory -Path $BackupPath -ErrorAction SilentlyContinue | Out-Null
Get-ChildItem -Path $PublicPath -File | Copy-Item -Destination $BackupPath -Force -ErrorAction SilentlyContinue

Write-Host "Backup created at: $BackupPath"

# ---------- Common HTML parts ----------
$Head = @'
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Site CSS -->
<link rel="stylesheet" href="/styles.css">
'@

$Foot = @'
<!-- Bootstrap JS (bundle with Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- App JS -->
<script src="/js/main.js"></script>
'@

$Navbar = @'
<nav class="navbar navbar-expand-lg bg-light border-bottom small">
  <div class="container-fluid">
    <a class="navbar-brand d-flex align-items-center gap-2" href="/dashboard">
      <img src="/images/bighorn-small.png" alt="Bighorn" class="logo-header">
      <span class="fw-semibold">Bighorn Admin Portal</span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMain">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link" href="/dashboard">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="/users">Users</a></li>
        <li class="nav-item"><a class="nav-link" href="/vouchers">Vouchers</a></li>
        <li class="nav-item"><a class="nav-link" href="/invoices">Invoices</a></li>
        <li class="nav-item"><a class="nav-link" href="/accounts">Accounts</a></li>
      </ul>
      <div class="d-flex">
        <a class="btn btn-outline-secondary btn-sm" href="/logout">Logout</a>
      </div>
    </div>
  </div>
</nav>
'@

# ---------- Pages ----------

# login.html – hero style using bighorn-portal.png, white background
$Login = @"
<!DOCTYPE html>
<html lang="en">
<head>
<title>Login | Bighorn Portal</title>
$Head
<style>
  body { background:#fff; }
  .login-hero{
    background:url('/images/bighorn-portal.png') center top / contain no-repeat;
    min-height: 68vh;
  }
</style>
</head>
<body>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10 login-hero"></div>
    </div>
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <img src="/images/bighorn-small.png" class="logo-header" alt="Bighorn">
              <h1 class="h5 m-0">Sign in</h1>
            </div>
            <form method="POST" action="/login" autocomplete="on">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input name="email" type="email" class="form-control" value="admin@bighorn.local" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input name="password" type="password" class="form-control" placeholder="Your password" required>
              </div>
              <button type="submit" class="btn btn-brand w-100">Sign In</button>
            </form>
            <p class="text-muted small mt-3">Use your admin email and password.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
$Foot
</body>
</html>
"@

# dashboard.html
$Dashboard = @"
<!DOCTYPE html>
<html lang="en">
<head>
<title>Dashboard | Bighorn Portal</title>
$Head
</head>
<body>
$Navbar
<header class="container py-4">
  <div class="d-flex align-items-center gap-3">
    <img src="/images/bighorn-logo.png" alt="Bighorn" class="logo-hero d-none d-md-block">
    <div>
      <h1 class="h3 m-0">Company Portal</h1>
      <p class="text-muted small m-0">Manage accounts, users, vouchers, and invoices.</p>
    </div>
  </div>
</header>
<main class="container pb-5">
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-3">
      <a class="card tile shadow-sm text-decoration-none" href="/accounts">
        <div class="card-body">
          <h2 class="h5">Accounts</h2>
          <p class="text-muted small">Manage company accounts and permissions.</p>
        </div>
      </a>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <a class="card tile shadow-sm text-decoration-none" href="/users">
        <div class="card-body">
          <h2 class="h5">Users</h2>
          <p class="text-muted small">View and manage employee users.</p>
        </div>
      </a>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <a class="card tile shadow-sm text-decoration-none" href="/vouchers">
        <div class="card-body">
          <h2 class="h5">Vouchers</h2>
          <p class="text-muted small">Track and issue employee vouchers.</p>
        </div>
      </a>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <a class="card tile shadow-sm text-decoration-none" href="/invoices">
        <div class="card-body">
          <h2 class="h5">Invoices</h2>
          <p class="text-muted small">Upload and review billing files.</p>
        </div>
      </a>
    </div>
  </div>
</main>
$Foot
</body>
</html>
"@

# users.html
$Users = @"
<!DOCTYPE html>
<html lang="en">
<head>
<title>Users | Bighorn Portal</title>
$Head
</head>
<body>
$Navbar
<main class="container py-4">
  <h1 class="h4 mb-3">Users</h1>
  <div class="alert alert-info small">List is loaded from /api/users.</div>
  <div class="table-responsive">
    <table class="table table-sm align-middle" id="usersTable">
      <thead class="table-light">
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Active</th>
          <th>Account ID</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
</main>
$Foot
<script>
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/users');
    const data = await res.json();
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    data.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + (u.email||'') + '</td>' +
        '<td>' + (u.role||'') + '</td>' +
        '<td>' + (u.is_active ? 'Yes' : 'No') + '</td>' +
        '<td>' + (u.account_id||'') + '</td>' +
        '<td>' + (u.created_at||'') + '</td>';
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
});
</script>
</body>
</html>
"@

# vouchers.html
$Vouchers = @"
<!DOCTYPE html>
<html lang="en">
<head>
<title>Vouchers | Bighorn Portal</title>
$Head
</head>
<body>
$Navbar
<main class="container py-4">
  <h1 class="h4 mb-3">Vouchers</h1>
  <p class="text-muted">Placeholder page. Voucher CRUD wiring will come next.</p>
</main>
$Foot
</body>
</html>
"@

# accounts.html
$Accounts = @"
<!DOCTYPE html>
<html lang="en">
<head>
<title>Accounts | Bighorn Portal</title>
$Head
</head>
<body>
$Navbar
<main class="container py-4">
  <h1 class="h4 mb-3">Accounts</h1>
  <p class="text-muted">Placeholder page. Accounts list and details will be added.</p>
</main>
$Foot
</body>
</html>
"@

# invoices.html (buttons layout)
$Invoices = @"
<!DOCTYPE html>
<html lang="en">
<head>
<title>Invoices | Bighorn Portal</title>
$Head
</head>
<body>
$Navbar
<main class="container py-4">
  <h1 class="h4 mb-3">Invoices</h1>
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="h6">Upload QuickBooks Export</h2>
          <p class="text-muted small">CSV or PDF from accounting.</p>
          <form id="invUploadForm">
            <input class="form-control form-control-sm mb-2" type="file" name="file" accept=".csv,.pdf" required>
            <button class="btn btn-brand btn-sm" type="submit">Upload</button>
          </form>
          <div id="invMsg" class="small mt-2 text-muted"></div>
        </div>
      </div>
    </div>
  </div>
</main>
$Foot
<script>
document.getElementById('invUploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('invMsg');
  msg.textContent = 'Uploading...';
  try {
    const fd = new FormData(e.target);
    const res = await fetch('/api/invoices/upload', { method:'POST', body: fd });
    const json = await res.json();
    msg.textContent = 'Server: ' + (json.message || res.statusText);
  } catch (err) {
    msg.textContent = 'Upload failed';
  }
});
</script>
</body>
</html>
"@

# ---------- Write files ----------
Set-Content -Path (Join-Path $PublicPath "login.html")      -Value $Login      -Encoding UTF8
Set-Content -Path (Join-Path $PublicPath "dashboard.html")  -Value $Dashboard  -Encoding UTF8
Set-Content -Path (Join-Path $PublicPath "users.html")      -Value $Users      -Encoding UTF8
Set-Content -Path (Join-Path $PublicPath "vouchers.html")   -Value $Vouchers   -Encoding UTF8
Set-Content -Path (Join-Path $PublicPath "accounts.html")   -Value $Accounts   -Encoding UTF8
Set-Content -Path (Join-Path $PublicPath "invoices.html")   -Value $Invoices   -Encoding UTF8

# ---------- styles.css ----------
$Styles = @'
:root{
  --brand:#1f3344; /* deep navy */
  --brand-acc:#caa04a; /* gold accent */
}
*{box-sizing:border-box}
body{font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif}
.logo-header{height:28px;width:auto}
.logo-hero{max-height:120px;width:auto}
.btn-brand{
  background:var(--brand-acc);
  color:#111;
  border:1px solid rgba(0,0,0,.1);
}
.btn-brand:hover{opacity:.95}

.tile{transition:transform .08s ease}
.tile:hover{transform:translateY(-2px)}
'@
Set-Content -Path (Join-Path $PublicPath "styles.css") -Value $Styles -Encoding UTF8

# ---------- js/main.js ----------
$MainJs = @'
// Placeholder app JS
console.debug("Bighorn portal assets loaded");
'@
Set-Content -Path (Join-Path $PublicPath "js\main.js") -Value $MainJs -Encoding UTF8

Write-Host "Public pages regenerated successfully."
