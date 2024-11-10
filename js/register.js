import { register } from './auth.js';

$(document).ready(() => {
  $('#registerForm').submit((e) => {
    e.preventDefault();
    register();
  });
});
