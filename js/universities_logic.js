document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".universities-container");
    const searchInput = document.querySelector('.search-container-box input');
    const searchButton = document.querySelector('.search-container-box button');
    let universities = [];

    function renderUniversities(list) {
      container.innerHTML = '';
      if (list.length === 0) {
        container.innerHTML = "<p style='color:red;'>No universities found.</p>";
        return;
      }
      list.forEach(university => {
        const card = document.createElement("div");
        card.classList.add("university-container");

        const img = document.createElement("img");
        img.src = university.logo ? `/uploads/${university.logo}` : (university.image || "default_university.png");
        img.alt = university.name;

        const name = document.createElement("div");
        name.textContent = university.name;

        card.appendChild(img);
        card.appendChild(name);

        // Add click event to show modal with details
        card.addEventListener('click', function() {
          window.location.href = `university_details.html?id=${university._id}`;
        });

        container.appendChild(card);
      });
    }

    fetch('/api/universities')
      .then(response => response.json())
      .then(data => {
        universities = data;
        renderUniversities(universities);
        // Update the registered universities count
        document.getElementById('registered-universities-count').textContent =
          universities.length + '+ Registered Institutions';
      })
      .catch(err => {
        container.innerHTML += "<p style='color:red;'>Failed to load universities.</p>";
        console.error(err);
      });

    searchButton.addEventListener('click', function (e) {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      const filtered = universities.filter(u =>
        u.name.toLowerCase().includes(query) ||
        (u.location && u.location.toLowerCase().includes(query)) ||
        (u.type && u.type.toLowerCase().includes(query)) ||
        (u.description && u.description.toLowerCase().includes(query))
      );
      renderUniversities(filtered);
    });

    // Optional: Enable live search as you type
    searchInput.addEventListener('input', function () {
      const query = searchInput.value.trim().toLowerCase();
      const filtered = universities.filter(u =>
        u.name.toLowerCase().includes(query) ||
        (u.location && u.location.toLowerCase().includes(query)) ||
        (u.type && u.type.toLowerCase().includes(query)) ||
        (u.description && u.description.toLowerCase().includes(query))
      );
      renderUniversities(filtered);
    });

  });