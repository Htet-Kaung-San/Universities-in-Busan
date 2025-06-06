document.getElementById('registerForm').addEventListener('submit', function(e) {
  const campusPhotos = document.getElementById('campus_photos');
  if (!campusPhotos.files || campusPhotos.files.length < 4) {
    alert('Please upload at least 4 campus photos.');
    e.preventDefault();
    return false;
  }
});