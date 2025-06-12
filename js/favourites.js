document.addEventListener("DOMContentLoaded", async function () {
  const container = document.querySelector(".universities-container");
  let universities = [];

  // Get logged-in user's favourites
  const userRes = await fetch('/api/me');
  const userData = await userRes.json();

  if (!userData.loggedIn || !userData.user || !userData.user.favourites || userData.user.favourites.length === 0) {
    container.innerHTML = "<p style='color:red;'>No favourites yet.</p>";
    return;
  }

  // Fetch details for each favourite university
  universities = await Promise.all(
    userData.user.favourites.map(id =>
      fetch(`/api/universities/${id}`).then(res => res.json())
    )
  );

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

      card.addEventListener('click', function() {
        window.location.href = `university_details.html?id=${university._id}`;
      });

      container.appendChild(card);
    });
  }

  // Initial render
  renderUniversities(universities);
});