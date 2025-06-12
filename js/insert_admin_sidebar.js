document.addEventListener("DOMContentLoaded", function () {
  fetch("/admin_sidebar_partial.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("admin-sidebar").innerHTML = html;

      // Highlight the active sidebar link
      const path = window.location.pathname;
      const sidebarLinks = document.querySelectorAll("#admin-sidebar a[href]");
      sidebarLinks.forEach(link => {
        if (link.getAttribute("href") && path.endsWith(link.getAttribute("href"))) {
          link.classList.add("active");
        }
      });

      // Add logout handler
      const logoutBtn = document.getElementById("admin-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          fetch("/logout")
            .then(() => {
              window.location.href = "/index.html";
            });
        });
      }
    });
});