import { loginUser, registerUser } from './api.js';

function setupAuth() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorAlert = document.getElementById('errorAlert');
      const submitBtn = document.getElementById('submitBtn');

      try {
        if (submitBtn) submitBtn.disabled = true;
        await loginUser(email, password);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (userInfo.role === 'admin') {
          window.location.href = 'admin/dashboard.html';
        } else {
          window.location.href = '../index.html';
        }
      } catch (err) {
        if (errorAlert) {
          errorAlert.textContent = err.message;
          errorAlert.classList.add('show');
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lastName = document.getElementById('lastName').value.trim();
      const firstName = document.getElementById('firstName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const dob = document.getElementById('dob').value.trim();
      const gender = document.getElementById('gender').value;
      const fullAddress = document.getElementById('address').value.trim();

      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const errorAlert = document.getElementById('errorAlert');
      const submitBtn = document.getElementById('submitBtn');

      if (password !== confirmPassword) {
        if (errorAlert) {
          errorAlert.textContent = 'Mật khẩu xác nhận không khớp';
          errorAlert.classList.add('show');
        }
        return;
      }

      try {
        if (submitBtn) submitBtn.disabled = true;
        await registerUser(
            `${lastName} ${firstName}`.trim(), 
            email, 
            password, 
            phone, 
            fullAddress,
            dob,
            gender
        ); 
        window.location.href = '../index.html';
      } catch (err) {
        if (errorAlert) {
          errorAlert.textContent = err.message;
          errorAlert.classList.add('show');
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', setupAuth);
