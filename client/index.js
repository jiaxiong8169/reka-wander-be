const passwordField = document.getElementById('password-field');
const confirmPasswordField = document.getElementById('confirm-password-field');
const showHidePassword = document.getElementById('show-hide-password');
const resetPasswordForm = document.getElementById('reset-password-form');
const alertPlaceholder = document.getElementById('alert-placeholder');
const usernamePlaceholder = document.getElementById('username-text');

const passwordFeedback = document.getElementById('password-feedback');
const confirmPasswordFeedback = document.getElementById(
  'confirm-password-feedback',
);

const searchString = window.location.search;
try {
  const tokens = searchString.split(/[?|=]/);
  const jsonText = tokens[2];
  const jsonToken = jsonText.split('.');
  const jwtPayloadObj = JSON.parse(window.atob(jsonToken[1]));
  usernamePlaceholder.innerText = jwtPayloadObj.preferred_name ?? 'my friend';
} catch (e) {
  usernamePlaceholder.innerText = 'my friend';
}

const customAlert = (message, type) => {
  var wrapper = document.createElement('div');
  wrapper.classList.add(`alert`, `alert-${type}`);
  wrapper.innerText = message;
  alertPlaceholder.innerHTML = ``;
  alertPlaceholder.appendChild(wrapper);
};

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
      console.log('submit', window.location.url);
      fetch(window.location.href, {
        method: 'POST',
        body: JSON.stringify({
          password: passwordField.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (!res.ok) {
            const err = Error('HTTP status: ' + res.status);
            err.response = res;
            err.status = res.status;
            throw err;
          }
          // show successful message
          console.log('successful');
          customAlert(
            'Your password is successfully reset. You may close this browser.',
            'success',
          );
        })
        .catch((err) => {
          // show unsuccessful message
          console.log(err);
          customAlert(
            `Password reset failed. Please try again later or request a new reset password link.`,
            'danger',
          );
        });
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
