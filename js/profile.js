fetch('/api/me')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn && data.user) {
      let imgSrc = "../img/user_profiles/normal_user.png";
      if (data.user.user_type === "university_personnel") {
        imgSrc = "../img/user_profiles/university_personnel.png";
      } else if (data.user.user_type === "admin") {
        imgSrc = "../img/user_profiles/admin.png";
      }
      document.getElementById('profile-img').src = imgSrc;

      if (data.user.fullname) document.getElementById('profile-name').textContent = data.user.fullname;
      if (data.user.user_type) document.getElementById('profile-role').textContent = data.user.user_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (data.user.email) document.getElementById('profile-email').textContent = data.user.email;
    }
  });
