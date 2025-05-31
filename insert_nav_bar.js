document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".header-nav-bar"); // Use querySelector to get one element

    header.innerHTML = `
    <div class="logo">
        <svg viewBox="0 0 48 48"><path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"/></svg>
         <a href="index.html">Busan Universities</a>
    </div>

    <nav class="nav-container">
        <div class="nav-links">
            <a href="about.html">About us</a>
            <a href="#">Resources</a>
            <a href="register.html">Register</a>
            <a href="log_in.html">Log In</a>
        </div>
        <i class="fa fa-bars" id="menu-toggle"></i>
    </nav>
    `;

    const toggleBtn = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
});
