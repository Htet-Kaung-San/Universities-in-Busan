document.addEventListener("DOMContentLoaded", async function () {
  const universitiesCountEl = document.getElementById('total-universities-count');
  const scholarshipsCountEl = document.getElementById('total-scholarships-count');
  const usersCountEl = document.getElementById('total-users-count');
  const tbody = document.querySelector('.recent-activity table tbody');

  if (universitiesCountEl) {
    const uniRes = await fetch('/api/admin/universities/count');
    const uniData = await uniRes.json();
    universitiesCountEl.textContent = uniData.count;
  }

  if (scholarshipsCountEl) {
    const scholarshipRes = await fetch('/api/admin/scholarships/count');
    const scholarshipData = await scholarshipRes.json();
    scholarshipsCountEl.textContent = scholarshipData.count;
  }

  if (usersCountEl) {
    const userRes = await fetch('/api/admin/users/count');
    const userData = await userRes.json();
    usersCountEl.textContent = userData.count;
  }

  if (!tbody) {
    return;
  }

  const res = await fetch('/api/admin/activities');
  const activities = await res.json();
  tbody.innerHTML = "";

  activities.forEach(act => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${act.activity}</td>
      <td>
        ${act.performedBy || ''}
        ${act.userType ? ` <span style="color:gray;font-size:0.95em;">(${act.userType.replace('_', ' ')})</span>` : ''}
      </td>
      <td>${act.ip || ''}</td>
      <td>${new Date(act.datetime).toLocaleString()}</td>
      <td>${act.actionType}</td>
    `;
    tbody.appendChild(tr);
  });
});
