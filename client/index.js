const passwordField = document.getElementById('password-field');
const confirmPasswordField = document.getElementById('confirm-password-field');
const showHidePassword = document.getElementById('show-hide-password');
const resetPasswordForm = document.getElementById('reset-password-form');

const passwordFeedback = document.getElementById('password-feedback');
const confirmPasswordFeedback = document.getElementById(
  'confirm-password-feedback',
);

resetPasswordForm.onsubmit = (e) => {
  e.preventDefault();
  resetPasswordForm.classList = 'was-validated';
  let equal = confirmPasswordField.value === passwordField.value;
  if (!equal) {
    console.log('not the same');
    confirmPasswordFeedback.innerText =
      'The passwords in both field do not match.';
    confirmPasswordField.setCustomValidity('should match');
  } else {
    confirmPasswordField.setCustomValidity(''); // reset the validity state
    if (!resetPasswordForm.checkValidity()) {
      if (passwordField.validity.patternMismatch) {
        passwordFeedback.innerText =
          'Your password should contain at least 1 upper case letter, 1 lower case letter and 1 number or special character';
      } else if (passwordField.validity.valueMissing) {
        passwordFeedback.innerText = 'This field should not be left empty.';
        console.log('run');
      }

      if (confirmPasswordField.validity.valueMissing) {
        confirmPasswordFeedback.innerText =
          'This field should not be left empty.';
      }
    } else {
      // submit form here
      console.log('submit');
      resetPasswordForm.submit();
    }
  }
};

showHidePassword.onclick = (e) => {
  e.preventDefault();
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    showHidePassword.innerHTML = `Hide password`;
  } else {
    passwordField.type = 'password';
    showHidePassword.innerHTML = `Show password`;
  }
};
