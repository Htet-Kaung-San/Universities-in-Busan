document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('scholarships-grid');
  const searchInput = document.getElementById('scholarship-search');
  const scholarshipCount = document.getElementById('scholarship-count');
  const urgentCount = document.getElementById('urgent-count');
  const submissionBanner = document.getElementById('submission-banner');
  let scholarships = [];

  function resolveAssetUrl(asset) {
    if (!asset) return '';
    if (/^https?:\/\//i.test(asset)) return asset;
    return `/uploads/${asset}`;
  }

  function formatDate(value) {
    if (!value) return 'Rolling deadline';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function isDeadlineSoon(value) {
    if (!value) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(value);
    deadline.setHours(0, 0, 0, 0);
    const diff = deadline.getTime() - today.getTime();
    return diff >= 0 && diff <= 14 * 24 * 60 * 60 * 1000;
  }

  function render(list) {
    grid.innerHTML = '';

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h2>No scholarships match this search.</h2>
          <p>Try a different keyword or come back after more scholarships are published.</p>
        </div>
      `;
      return;
    }

    list.forEach((scholarship) => {
      const article = document.createElement('article');
      article.className = 'scholarship-card';

      const deadlineLabel = formatDate(scholarship.deadline);
      const title = scholarship.title || 'Untitled scholarship';
      const hostInstitution = scholarship.hostInstitution || scholarship.university || 'Host institution';
      const fieldOfStudy = scholarship.fieldOfStudy || scholarship.category || 'Field of study';
      const engagementType = scholarship.engagementType || scholarship.degreeLevel || scholarship.studyLevel || 'Engagement type';
      const kickerParts = [
        'Scholarship',
        fieldOfStudy && fieldOfStudy !== 'Field of study' ? fieldOfStudy : 'Research'
      ];

      article.innerHTML = `
        <div class="scholarship-card-body">
          <div class="scholarship-card-top">
            <p class="scholarship-kicker">${kickerParts.join(', ')}</p>
            <div class="scholarship-bookmark" aria-hidden="true">
              <i class="fa-regular fa-bookmark"></i>
            </div>
          </div>

          <h2>${title}</h2>

          <div class="scholarship-meta">
            <span><i class="fa-solid fa-location-dot"></i>${hostInstitution}</span>
            <span><i class="fa-solid fa-graduation-cap"></i>${engagementType}</span>
            <span><i class="fa-regular fa-calendar-days"></i>${deadlineLabel}</span>
          </div>

          <div class="scholarship-card-actions">
            <a
              class="card-button source-button ${scholarship.sourceUrl ? '' : 'disabled'}"
              href="${scholarship.sourceUrl || '#'}"
              ${scholarship.sourceUrl ? 'target="_blank" rel="noreferrer"' : 'tabindex="-1" aria-disabled="true"'}
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              Source
            </a>
            <span class="card-button details-button">View Details</span>
          </div>
        </div>
      `;

      article.addEventListener('click', function () {
        window.location.href = `scholarship_details.html?id=${scholarship._id}`;
      });

      const sourceButton = article.querySelector('.source-button');
      if (sourceButton) {
        sourceButton.addEventListener('click', function (event) {
          if (!scholarship.sourceUrl) {
            event.preventDefault();
          }
          event.stopPropagation();
        });
      }

      grid.appendChild(article);
    });
  }

  fetch('/api/scholarships')
    .then((response) => response.json())
    .then((data) => {
      scholarships = Array.isArray(data) ? data : [];

      if (scholarshipCount) {
        scholarshipCount.textContent = scholarships.length;
      }

      if (urgentCount) {
        urgentCount.textContent = scholarships.filter(item => isDeadlineSoon(item.deadline)).length;
      }

      render(scholarships);
    })
    .catch((error) => {
      console.error(error);
      grid.innerHTML = `
        <div class="empty-state">
          <h2>Unable to load scholarships.</h2>
          <p>Please try again in a moment.</p>
        </div>
      `;
    });

  searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    const filtered = scholarships.filter((scholarship) => {
      return [
        scholarship.title,
        scholarship.degreeLevel,
        scholarship.description,
        scholarship.hostInstitution,
        scholarship.fieldOfStudy,
        scholarship.engagementType
      ].some(value => (value || '').toLowerCase().includes(query));
    });
    render(filtered);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('submitted') === '1') {
    submissionBanner.hidden = false;
  }
});
