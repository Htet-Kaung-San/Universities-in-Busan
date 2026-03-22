document.addEventListener('DOMContentLoaded', function () {
  const tbody = document.getElementById('scholarships-tbody');

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
  }

  function loadScholarships() {
    fetch('/api/admin/scholarships')
      .then(res => res.json())
      .then(scholarships => {
        tbody.innerHTML = '';

        scholarships.forEach((scholarship) => {
          const tr = document.createElement('tr');
          const status = scholarship.approved === true
            ? '<span class="status published">Published</span>'
            : '<span class="status draft">Pending</span>';

          tr.innerHTML = `
            <td>${scholarship.title}</td>
            <td>${scholarship.hostInstitution || scholarship.provider || scholarship.university || ''}</td>
            <td>${status}</td>
            <td>${formatDate(scholarship.deadline)}</td>
            <td>
              <button class="edit-btn" data-id="${scholarship._id}">Edit</button>
              <button class="approve-btn" data-id="${scholarship._id}">Approve</button>
              <button class="decline-btn" data-id="${scholarship._id}">Decline</button>
            </td>
          `;

          tbody.appendChild(tr);
        });

        document.querySelectorAll('.edit-btn').forEach((btn) => {
          btn.addEventListener('click', function () {
            window.location.href = `edit_scholarship.html?id=${this.dataset.id}`;
          });
        });

        document.querySelectorAll('.approve-btn').forEach((btn) => {
          btn.addEventListener('click', function () {
            fetch(`/api/admin/scholarships/${this.dataset.id}/approve`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: true })
            }).then(loadScholarships);
          });
        });

        document.querySelectorAll('.decline-btn').forEach((btn) => {
          btn.addEventListener('click', function () {
            fetch(`/api/admin/scholarships/${this.dataset.id}/approve`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: false })
            }).then(loadScholarships);
          });
        });
      })
      .catch((error) => {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;">Failed to load scholarships.</td></tr>';
      });
  }

  loadScholarships();
});
