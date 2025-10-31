// public/js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorDiv = document.getElementById("error");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    errorDiv.textContent = "";

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = data.redirect || "/dashboard";
      } else {
        errorDiv.textContent = data.error || "Invalid email or password.";
      }
    } catch (err) {
      errorDiv.textContent = "Server error. Try again.";
      console.error("Login failed:", err);
    }
  });
});
