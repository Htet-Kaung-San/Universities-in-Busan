document.addEventListener('click', function(e) {
  if (e.target.classList.contains('toggle-star')) {
    const star = e.target;
    // Only update the UI, no fetch or backend call
    star.classList.toggle('fa-regular');
    star.classList.toggle('fa-solid');
  }
});