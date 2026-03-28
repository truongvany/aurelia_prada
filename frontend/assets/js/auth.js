import { loginUser, registerUser } from './api.js';

function bindAuthForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const notice = form.querySelector('[data-notice]');
    if (notice) notice.textContent = 'Processing...';

    if (formId === 'register-form') {
      const name = document.getElementById('reg-name')?.value || '';
      const email = document.getElementById('reg-email')?.value || '';
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

      try {
        await registerUser(name, email, pwd, '', {}); // default empty phone/address
        if (notice) notice.textContent = 'Registration successful! Redirecting...';
        setTimeout(() => window.location.href = '/', 1500);
      } catch (err) {
        if (notice) notice.textContent = err.message;
      }
    }

    if (formId === 'login-form') {
      const email = document.getElementById('log-email')?.value || '';
      const pwd = document.getElementById('log-password')?.value || '';

      try {
        await loginUser(email, pwd);
        if (notice) notice.textContent = 'Login successful! Redirecting...';
        setTimeout(() => window.location.href = '/', 1500);
      } catch (err) {
        if (notice) notice.textContent = err.message;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindAuthForm('login-form');
  bindAuthForm('register-form');
});
