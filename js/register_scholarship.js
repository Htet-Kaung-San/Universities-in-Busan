document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('scholarshipForm');
  const permissionNote = document.getElementById('scholarship-permission-note');
  const fields = form.querySelectorAll('input, select, textarea, button');

  function setDisabledState(disabled) {
    fields.forEach(field => {
      field.disabled = disabled;
    });
  }

  function showPermissionMessage(text, kind) {
    if (!permissionNote) {
      return;
    }
    permissionNote.textContent = text;
    permissionNote.className = `permission-note ${kind}`;
  }

  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (!data.loggedIn) {
      showPermissionMessage('Log in as university personnel or admin to submit a scholarship.', 'error');
      setDisabledState(true);
      return;
    }

    if (!['admin', 'university_personnel'].includes(data.user.user_type)) {
      showPermissionMessage('This form is reserved for university personnel and admin accounts.', 'warning');
      setDisabledState(true);
      return;
    }

    if (data.user.user_type === 'admin') {
      showPermissionMessage('Admin submissions publish immediately after submission.', 'allowed');
    } else {
      showPermissionMessage('Your submission will appear after admin review and approval.', 'allowed');
    }
  } catch (error) {
    console.error(error);
    showPermissionMessage('Unable to verify account permissions right now. Please refresh and try again.', 'error');
    setDisabledState(true);
    return;
  }

  form.addEventListener('submit', function (event) {
    const deadline = document.getElementById('deadline').value;
    const description = document.getElementById('description').value.trim();
    const eligibility = document.getElementById('eligibility').value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    const benefits = document.getElementById('benefits').value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (deadline) {
      const chosenDate = new Date(deadline);
      chosenDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (chosenDate < today) {
        alert('Please choose a deadline that is today or later.');
        event.preventDefault();
        return;
      }
    }

    if (description.length < 40) {
      alert('Please write a slightly longer scholarship description so applicants have enough context.');
      event.preventDefault();
      return;
    }

    if (eligibility.length < 2) {
      alert('Please include at least two eligibility lines.');
      event.preventDefault();
      return;
    }

    if (benefits.length < 2) {
      alert('Please include at least two benefit lines.');
      event.preventDefault();
      return;
    }
  });
});
