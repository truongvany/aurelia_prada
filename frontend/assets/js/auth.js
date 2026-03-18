function bindAuthForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const notice = form.querySelector('[data-notice]');

    if (formId === 'register-form') {
      const pwd = document.getElementById('reg-password')?.value || '';
      const confirm = document.getElementById('reg-confirm-password')?.value || '';
      if (pwd.length < 6) {
        if (notice) notice.textContent = 'Password must have at least 6 characters.';
        return;
      }
      if (pwd !== confirm) {
        if (notice) notice.textContent = 'Confirm password does not match.';
        return;
      }
    }

    if (notice) notice.textContent = 'Form is valid. This static demo has no backend auth yet.';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindAuthForm('login-form');
  bindAuthForm('register-form');
});
