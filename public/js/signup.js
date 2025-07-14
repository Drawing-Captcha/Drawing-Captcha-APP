document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.getElementById('password-strength');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClose = document.getElementById('eye-close');

    function checkPasswordStrength(password) {
      const minLength = 8;
      const veryStrongLength = 12;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      let strength = 0;
      if (password.length >= minLength) strength += 1;
      if (hasUpperCase) strength += 1;
      if (hasLowerCase) strength += 1;
      if (hasNumbers) strength += 1;
      if (hasSpecialChars) strength += 1;

      if (strength === 5) {
        if (password.length >= veryStrongLength && /[!@#$%^&*(),.?":{}|<>]{2,}/.test(password)) {
          return 'Very Strong';
        }
        return 'Strong';
      }

      switch (strength) {
        case 4:
          return 'Medium';
        case 3:
          return 'Weak';
        default:
          return 'Very Weak';
      }
    }

    function updatePasswordStrengthDisplay(strength) {
      passwordStrength.textContent = `Password Strength: ${strength}`;
      switch (strength) {
        case 'Very Strong':
          passwordStrength.style.color = 'green';
          break;
        case 'Strong':
          passwordStrength.style.color = 'lightblue';
          break;
        case 'Medium':
          passwordStrength.style.color = 'orange';
          break;
        case 'Weak':
          passwordStrength.style.color = 'red';
          break;
        default:
          passwordStrength.style.color = 'darkred';
          break;
      }
    }

    passwordInput.addEventListener('input', function() {
      const strength = checkPasswordStrength(passwordInput.value);
      updatePasswordStrengthDisplay(strength);
    });

    function togglePasswordVisibility() {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClose.style.display = 'block';
      } else {
        passwordInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClose.style.display = 'none';
      }
    }

    eyeOpen.addEventListener('click', togglePasswordVisibility);
    eyeClose.addEventListener('click', togglePasswordVisibility);
  });