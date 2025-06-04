document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".header-nav-bar"); // Use querySelector to get one element

    header.innerHTML = `
    <div class="logo">
        <img src="img/university.svg" alt="">
         <a href="index.html">Study in Busan</a>
    </div>

    <nav class="nav-container">
        <div class="nav-links">
            <a href="about.html">About us</a>
            <a href="register.html" class="nav-register">Register</a>
            <a href="log_in.html" class="nav-login">Log In</a>
            <a href="profile.html" class="nav-profile" style="display:none">Profile</a>
            <a href="#" class="nav-logout" style="display:none">Log Out</a>
        </div>
        <i class="fa fa-bars" id="menu-toggle"></i>
    </nav>
    `;

    const toggleBtn = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  fetch('/api/me')
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        // Hide or remove Register/Log In buttons
        document.querySelectorAll('.nav-register, .nav-login').forEach(btn => btn.style.display = 'none');
        // Optionally show profile/logout
        document.querySelector('.nav-profile').style.display = 'block';
        document.querySelector('.nav-logout').style.display = 'block';

        // Insert Dashboard for admin
        if (data.user && data.user.user_type === 'admin') {
          // Insert Dashboard after About us
          if (!document.querySelector('.nav-dashboard')) {
            const aboutLink = document.querySelector('.nav-links a[href="about.html"]');
            const dashboardLink = document.createElement('a');
            dashboardLink.href = "admin_dashboard.html";
            dashboardLink.className = "nav-dashboard";
            dashboardLink.textContent = "Dashboard";
            aboutLink.parentNode.insertBefore(dashboardLink, aboutLink.nextSibling);
          } else {
            document.querySelector('.nav-dashboard').style.display = 'block';
          }
        } else {
          const dashboard = document.querySelector('.nav-dashboard');
          if (dashboard) dashboard.style.display = 'none';
        }

        // Insert Register a University for university_personnel and admin
        if (data.user && (data.user.user_type === 'university_personnel' || data.user.user_type === 'admin')) {
          if (!document.querySelector('.nav-register-university')) {
            // Insert after About us and (if present) after Dashboard
            let insertAfter = document.querySelector('.nav-dashboard') || document.querySelector('.nav-links a[href="about.html"]');
            const regUniLink = document.createElement('a');
            regUniLink.href = "register_university.html";
            regUniLink.className = "nav-register-university";
            regUniLink.textContent = "Register a University";
            insertAfter.parentNode.insertBefore(regUniLink, insertAfter.nextSibling);
          } else {
            document.querySelector('.nav-register-university').style.display = 'block';
          }
        } else {
          const regUni = document.querySelector('.nav-register-university');
          if (regUni) regUni.style.display = 'none';
        }
      } else {
        // Show Register/Log In, hide profile/logout
        document.querySelectorAll('.nav-register, .nav-login').forEach(btn => btn.style.display = 'block');
        document.querySelector('.nav-profile').style.display = 'none';
        document.querySelector('.nav-logout').style.display = 'none';
        const regUni = document.querySelector('.nav-register-university');
        if (regUni) regUni.style.display = 'none';
        const dashboard = document.querySelector('.nav-dashboard');
        if (dashboard) dashboard.style.display = 'none';
      }
    });

    document.querySelector('.nav-logout').addEventListener('click', function(e) {
      e.preventDefault();
      fetch('/logout', { method: 'GET' })
        .then(() => {
          // After logout, show Register/Log In and hide Profile/Log Out
          document.querySelectorAll('.nav-register, .nav-login').forEach(btn => btn.style.display = 'block');
          document.querySelector('.nav-profile').style.display = 'none';
          document.querySelector('.nav-logout').style.display = 'none';
          window.location.href = 'index.html'; // Optional: redirect to home
        });
    });
});
