document.addEventListener('DOMContentLoaded', function () {
  const tbody = document.getElementById('universities-tbody');

  function loadUniversities() {
    fetch('/api/admin/universities')
      .then(res => res.json())
      .then(universities => {
        tbody.innerHTML = '';

        universities.forEach((university) => {
          const tr = document.createElement('tr');
          const status = university.approved === true
            ? '<span class="status published">Published</span>'
            : '<span class="status draft">Pending</span>';
          const date = university.createdAt ? new Date(university.createdAt).toISOString().slice(0, 10) : '';

          tr.innerHTML = `
            <td>${university.name}</td>
            <td>${status}</td>
            <td>${date}</td>
            <td>
              <button class="approve-btn" data-id="${university._id}">Approve</button>
              <button class="decline-btn" data-id="${university._id}">Decline</button>
            </td>
          `;

          tbody.appendChild(tr);
        });

        document.querySelectorAll('.approve-btn').forEach((btn) => {
          btn.addEventListener('click', function () {
            fetch(`/api/admin/universities/${this.dataset.id}/approve`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: true })
            }).then(loadUniversities);
          });
        });

        document.querySelectorAll('.decline-btn').forEach((btn) => {
          btn.addEventListener('click', function () {
            fetch(`/api/admin/universities/${this.dataset.id}/approve`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: false })
            }).then(loadUniversities);
          });
        });
      })
      .catch((error) => {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Failed to load universities.</td></tr>';
      });
  }

  loadUniversities();
});
