import { login } from './auth.js';

$(document).ready(() => {
  $('#loginForm').on('submit', function (e) {
    console.log(e.target);
    e.preventDefault();
    login();
  });
});
