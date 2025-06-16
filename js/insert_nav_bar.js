document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".header-nav-bar");

    header.innerHTML = `
    <div class="logo">
        <img src="img/static/website_logo.svg" alt="">
         <a href="index.html">Study in Busan</a>
    </div>

    <nav class="nav-container">
        <div class="nav-links">
            <a href="index.html">Home</a>
            <a href="about.html">About us</a>
            <a href="register.html" class="nav-register">Register</a>
            <a href="login.html" class="nav-login">Log In</a>
        </div>
        <div class="nav-profile-dropdown" style="display:none;">
            <img src="img/user_profiles/normal_user.png" alt="Profile" class="nav-profile-avatar" id="nav-profile-avatar">
            <div class="nav-profile-menu" style="display:none;">
                <a href="index.html" class="mobile-only">Home</a>
                <a href="about.html" class="mobile-only">About us</a>
                <a href="profile.html">Profile</a>
                <a href="favourites.html">Favourites</a>
                <a href="admin_dashboard.html" class="nav-dashboard" style="display:none;">Dashboard</a>
                <a href="register_university.html" class="nav-register-university" style="display:none;">Register a University</a>
                <a href="#" class="nav-logout">Log Out</a>
            </div>
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
        document.querySelectorAll('.nav-register, .nav-login').forEach(btn => btn.style.display = 'none');
        document.querySelector('.nav-profile-dropdown').style.display = 'flex';
        header.classList.add('logged-in'); 
        let imgSrc = "img/user_profiles/normal_user.png";
        if (data.user.user_type === "university_personnel") imgSrc = "img/user_profiles/university_personnel.png";
        if (data.user.user_type === "admin") imgSrc = "img/user_profiles/admin.png";
        profileAvatar.src = imgSrc;

        if (data.user.user_type === "admin") {
          document.querySelector('.nav-dashboard').style.display = 'block';
        }
        if (["admin", "university_personnel"].includes(data.user.user_type)) {
          document.querySelector('.nav-register-university').style.display = 'block';
        }
      } else {
        document.querySelectorAll('.nav-register, .nav-login').forEach(btn => btn.style.display = 'block');
        document.querySelector('.nav-profile-dropdown').style.display = 'none';
        header.classList.remove('logged-in');
      }
    });

    document.querySelector('.nav-logout').addEventListener('click', function(e) {
      e.preventDefault();
      fetch('/logout', { method: 'GET' })
        .then(() => {
          document.querySelectorAll('.nav-register, .nav-login').forEach(btn => btn.style.display = 'block');
          document.querySelector('.nav-profile-dropdown').style.display = 'none';
          window.location.href = 'index.html'; 
        });
    });

    const profileDropdown = document.querySelector('.nav-profile-dropdown');
    const profileAvatar = document.getElementById('nav-profile-avatar');
    const profileMenu = document.querySelector('.nav-profile-menu');

    if (profileAvatar) {
      profileAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        profileMenu.style.display = profileMenu.style.display === 'flex' ? 'none' : 'flex';
      });
      document.addEventListener('click', function() {
        profileMenu.style.display = 'none';
      });
    }
});
