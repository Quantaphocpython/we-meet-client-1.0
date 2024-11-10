import { login } from './auth.js';

$(document).ready(() => {
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    login();
  });
});
