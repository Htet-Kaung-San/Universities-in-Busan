document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('editScholarshipForm');
  const params = new URLSearchParams(window.location.search);
  const scholarshipId = params.get('id');

  if (!scholarshipId) {
    alert('Missing scholarship id.');
    window.location.href = 'admin_scholarships.html';
    return;
  }

  function splitLines(value) {
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    return value || '';
  }

  async function loadScholarshipForEditing(id) {
    const directResponse = await fetch(`/api/admin/scholarships/${id}`);
    if (directResponse.ok) {
      return directResponse.json();
    }

    const listResponse = await fetch('/api/admin/scholarships');
    if (!listResponse.ok) {
      throw new Error('Scholarship not found');
    }

    const scholarships = await listResponse.json();
    const scholarship = scholarships.find((item) => String(item._id) === String(id));
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }

    return scholarship;
  }

  try {
    const scholarship = await loadScholarshipForEditing(scholarshipId);
    document.getElementById('title').value = scholarship.title || '';
    document.getElementById('degreeLevel').value = scholarship.degreeLevel || '';
    document.getElementById('description').value = scholarship.description || '';
    document.getElementById('sourceUrl').value = scholarship.sourceUrl || '';
    document.getElementById('hostInstitution').value = scholarship.hostInstitution || '';
    document.getElementById('fieldOfStudy').value = scholarship.fieldOfStudy || '';
    document.getElementById('deadline').value = scholarship.deadline || '';
    document.getElementById('engagementType').value = scholarship.engagementType || '';
    document.getElementById('eligibility').value = splitLines(scholarship.eligibilityHighlights || scholarship.eligibility);
    document.getElementById('benefits').value = splitLines(scholarship.benefitsHighlights || scholarship.benefits);
  } catch (error) {
    console.error(error);
    alert('Unable to load scholarship details for editing.');
    window.location.href = 'admin_scholarships.html';
    return;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

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
        return;
      }
    }

    if (description.length < 40) {
      alert('Please write a slightly longer scholarship description so applicants have enough context.');
      return;
    }

    if (eligibility.length < 2) {
      alert('Please include at least two eligibility lines.');
      return;
    }

    if (benefits.length < 2) {
      alert('Please include at least two benefit lines.');
      return;
    }

    const payload = {
      title: document.getElementById('title').value.trim(),
      degreeLevel: document.getElementById('degreeLevel').value,
      description: document.getElementById('description').value.trim(),
      sourceUrl: document.getElementById('sourceUrl').value.trim(),
      hostInstitution: document.getElementById('hostInstitution').value.trim(),
      fieldOfStudy: document.getElementById('fieldOfStudy').value.trim(),
      deadline,
      engagementType: document.getElementById('engagementType').value.trim(),
      eligibility: document.getElementById('eligibility').value.trim(),
      benefits: document.getElementById('benefits').value.trim()
    };

    try {
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      window.location.href = 'admin_scholarships.html';
    } catch (error) {
      console.error(error);
      alert('Unable to save scholarship changes right now.');
    }
  });
});
