document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const universityId = params.get('id');
    if (!universityId) return;
  
    // Fetch both university details and user info in parallel
    const [uniRes, userRes] = await Promise.all([
      fetch(`/api/universities/${universityId}`),
      fetch('/api/me')
    ]);
    const u = await uniRes.json();
    const userData = await userRes.json();
  
    // Render university details
    const est = u.established ? `<div class="uni-details-est">Established in ${u.established}</div>` : '';
    let campusPhotosHtml = '';
    if (u.campusPhotos && u.campusPhotos.length > 0) {
      campusPhotosHtml = `
        <div class="uni-details-section">
          <h2>Campus Photos</h2>
          <div class="uni-campus-photos">
            ${u.campusPhotos.map(photo => 
              `<img src="/uploads/${photo}" alt="Campus Photo" class="campus-photo-img">`
            ).join('')}
          </div>
        </div>
      `;
    }
  
    // Determine if this university is in user's favourites
    let starClass = "fa-regular";
    if (
      userData.loggedIn &&
      userData.user &&
      Array.isArray(userData.user.favourites) &&
      userData.user.favourites.includes(universityId)
    ) {
      starClass = "fa-solid";
    }
  
    document.getElementById('university-details').innerHTML = `
      <div class="uni-details-header">
        <div class="uni-details-image_title-group">
          <img class="uni-details-img" src="${u.logo ? '/uploads/' + u.logo : (u.image || 'default_university.png')}" alt="${u.name}">
          <div class="uni-details-title-group">
          <h1>${u.name}</h1>
          <div class="uni-details-location">${u.location || ''}</div>
          ${est}
        </div>
        </div>
        <i class="${starClass} fa-star toggle-star" id="star" title="Add to Favourites"></i>
      </div>
      <div class="uni-details-section">
        <h2>Location Map</h2>
        <iframe class="uni-details-map" allowfullscreen=""
          src="https://www.google.com/maps?q=${encodeURIComponent(u.location ? u.name + ', ' + u.location : u.name)}&output=embed"></iframe>
      </div>
      ${campusPhotosHtml}
      <div class="uni-details-section">
        <h2>Type</h2>
        <p>${u.type || ''}</p>
      </div>
      <div class="uni-details-section">
        <h2>Specialties</h2>
        <p>${Array.isArray(u.specialties) ? u.specialties.join(', ') : (u.specialties || '')}</p>
      </div>
      <div class="uni-details-section">
        <h2>Website</h2>
        <a href="${u.website}" target="_blank">${u.website}</a>
      </div>
      <div class="uni-details-section">
        <h2>Overview</h2>
        <p>${u.description || ''}</p>
      </div>
    `;
  });
