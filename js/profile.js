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
      document.getElementById('profile-about').textContent = data.user.about || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';
      document.getElementById('profile-phone').textContent = data.user.phone || "+82-10-1234-5678";
      document.getElementById('profile-location').textContent = data.user.location || 'Busan, South Korea';
      document.getElementById('profile-linkedin').textContent = data.user.linkedin || 'https://www.linkedin.com/in/john-doe123/';
      document.getElementById('profile-instagram').textContent = data.user.instagram || 'https://www.instagram.com/john_doe123/';
    }
  });

function getTimestampFromObjectId(objectId) {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id');

  if (!userId) return;

  const res = await fetch(`/api/admin/user/${userId}`);
  if (!res.ok) return;
  const user = await res.json();

  document.getElementById('profile-img').src = user.profileImg
    ? `/img/user_profiles/${user.profileImg}`
    : "../img/user_profiles/default.png";
  document.getElementById('profile-name').textContent = user.fullname || user.email;
  document.getElementById('profile-role').textContent = user.user_type || '';
  document.getElementById('profile-joined').textContent = "Joined in " + getTimestampFromObjectId(user._id).getFullYear();
  document.getElementById('profile-about').textContent = user.about || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-phone').textContent = user.phone || "+82-10-1234-5678";
  document.getElementById('profile-location').textContent = user.location || 'Busan, South Korea';
  document.getElementById('profile-linkedin').textContent = user.linkedin || 'https://www.linkedin.com/in/john-doe123/';
  document.getElementById('profile-instagram').textContent = user.instagram || 'https://www.instagram.com/john_doe123/';
});
