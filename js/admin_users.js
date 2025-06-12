function getTimestampFromObjectId(objectId) {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

document.addEventListener("DOMContentLoaded", async function () {
  const tbody = document.getElementById("universities-tbody");
  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  const res = await fetch('/api/admin/users');
  const users = await res.json();

  if (!users.length) {
    tbody.innerHTML = "<tr><td colspan='4'>No users found.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.fullname || user.email}</td>
      <td>${user.user_type || ''}</td>
      <td>${getTimestampFromObjectId(user._id).toLocaleString()}</td>
      <td>
        <a href="profile.html?id=${user._id}" class="view-profile-btn" style="text-decoration: none; color: var(--white-color); background: var(--black-color);
border-radius: 5px;
  padding: 6px 14px;
  margin-right: 6px; ; ">View Profile</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
});