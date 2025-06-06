document.getElementById('email').addEventListener('blur', function() {
  const email = this.value.trim();
  const emailCheckDiv = document.getElementById('email-check');
  emailCheckDiv.textContent = '';
  if (!email) return;
  fetch(`/check-email?email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        emailCheckDiv.textContent = 'Email is already registered.';
      }
    });
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
  const pw = document.getElementById('password').value;
  const cpw = document.getElementById('confirm_password').value;
  const errorDiv = document.getElementById('error-message');
  const emailCheckDiv = document.getElementById('email-check');
  errorDiv.textContent = '';

  if (pw.length < 8) {
    errorDiv.textContent = 'Password must be at least 8 characters long.';
    e.preventDefault();
    return;
  }
  if (pw !== cpw) {
    errorDiv.textContent = 'Passwords do not match.';
    e.preventDefault();
    return;
  }
  if (emailCheckDiv.textContent) {
    errorDiv.textContent = 'Please use a different email address.';
    e.preventDefault();
    return;
  }
});
