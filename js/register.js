document.getElementById('email').addEventListener('blur', function() {
  const email = this.value.trim();
  const emailCheckDiv = document.getElementById('email-check');
  emailCheckDiv.textContent = '';
  if (!email) return;
  fetch(`/check-email?email=${encodeURIComponent(email)}`) // js var = user+test@example.com -> user%2Btest%40example.com
    .then(res => res.json()) // then is promise chain, takes HTTP response from fetch and parses as JSON.
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
    e.preventDefault(); // keep the user on the same page and show error messages instead of submitting invalid data
    return;
  }
  if (pw !== cpw) {
    e.preventDefault(); // if error happens for sure, order don't matter since individual actions
    errorDiv.textContent = 'Passwords do not match.';
    return;
  }
  if (emailCheckDiv.textContent) {
    // errorDiv.textContent = 'Please use a different email address.';
    e.preventDefault();
    return;
  }
});
