document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('scholarship-detail');
  const params = new URLSearchParams(window.location.search);
  const scholarshipId = params.get('id');

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
      month: 'long',
      day: 'numeric'
    });
  }

  function renderList(items) {
    if (!Array.isArray(items) || !items.length) {
      return '<p>No details provided.</p>';
    }

    return `
      <ul class="detail-list">
        ${items.map(item => `
          <li>
            <i class="fa-solid fa-check"></i>
            <span>${item}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  if (!scholarshipId) {
    container.innerHTML = '<div class="error-state"><h1>Scholarship not found.</h1></div>';
    return;
  }

  try {
    const response = await fetch(`/api/scholarships/${scholarshipId}`);
    if (!response.ok) {
      throw new Error('Scholarship not found');
    }

    const scholarship = await response.json();
    const posterUrl = resolveAssetUrl(scholarship.poster);

    container.innerHTML = `
      <div class="detail-shell">
        <section class="detail-hero">
          <div class="detail-copy">
            <div class="detail-chip-row">
              <span class="detail-chip">${scholarship.degreeLevel || scholarship.studyLevel || 'Scholarship'}</span>
              <span class="detail-chip">${scholarship.engagementType || scholarship.category || 'Opportunity'}</span>
            </div>
            <h1>${scholarship.title}</h1>
            <p class="detail-provider">${scholarship.hostInstitution || scholarship.provider || scholarship.university || ''}</p>
            ${posterUrl ? `<img class="detail-inline-image" src="${posterUrl}" alt="${scholarship.title}">` : ''}
            <p class="detail-summary">${scholarship.description || scholarship.summary || ''}</p>
            <div class="detail-meta-block">
              <p><span>Source:</span> ${scholarship.sourceUrl ? `<a href="${scholarship.sourceUrl}" target="_blank" rel="noreferrer">${scholarship.sourceUrl}</a>` : 'To be added'}</p>
              <p><span>Host Institution:</span> ${scholarship.hostInstitution || scholarship.university || 'To be added'}</p>
              <p><span>Field of study:</span> ${scholarship.fieldOfStudy || scholarship.category || 'To be added'}</p>
              <p><span>Deadline:</span> ${formatDate(scholarship.deadline)}</p>
              <p><span>Engagement Type:</span> ${scholarship.engagementType || scholarship.degreeLevel || scholarship.studyLevel || 'To be added'}</p>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h2>Eligibility</h2>
          ${renderList(scholarship.eligibilityHighlights)}
        </section>

        <section class="detail-section">
          <h2>Benefits</h2>
          ${renderList(scholarship.benefitsHighlights)}
        </section>
      </div>
    `;
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="error-state">
        <h1>Unable to load this scholarship.</h1>
        <p>Please return to the scholarships page and try again.</p>
      </div>
    `;
  }
});
