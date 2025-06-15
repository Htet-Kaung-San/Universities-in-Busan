document.addEventListener('click', function(e) {
  const star = e.target.closest('.toggle-star');
  if (star) {
    const params = new URLSearchParams(window.location.search);
    const uniId = params.get('id');
    if (!uniId) return;

    star.classList.toggle('fa-regular');
    star.classList.toggle('fa-solid');
    const isUnstarred = star.classList.contains('fa-solid');
    console.log(isUnstarred);
    if (!isUnstarred) {
      fetch('/api/favourites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId: uniId })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
      });
    } else {
      fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId: uniId })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
      });
    }
  }
});