  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    fetch(`/api/universities/${id}`)
      .then(res => res.json())
      .then(u => {
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
        document.getElementById('university-details').innerHTML = `
          <div class="uni-details-header">
            <img class="uni-details-img" src="${u.logo ? '/uploads/' + u.logo : (u.image || 'default_university.png')}" alt="${u.name}">
            <div class="uni-details-title-group">
              <h1>${u.name}</h1>
              <div class="uni-details-location">${u.location || ''}</div>
              ${est}
            </div>
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
  } else {
    document.getElementById('university-details').textContent = "No university selected.";
  }
