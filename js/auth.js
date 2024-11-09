import { base_url } from './config.js';
import { getAccessToken } from './config.js';

export function getMyInfo() {
  $.ajax({
    url: base_url + '/users/my-info',
    type: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    success: function (response) {
      if (response.code === 1000) {
        $('.user-name').empty();
        $('.user-name').html(`
        <span class="login-btn">
              <i
                class="bx bxs-user"
                style="margin-right: 16px; font-size: 24px"
              ></i>
              <span>${response.result.fullName}</span>
            </span>`);
      } else {
        $('.user-name').text('Không tìm thấy thông tin người dùng');
      }
    },
    error: function () {
      // $('.user-name').text('Có lỗi xảy ra');
    },
  });
}

export function login(e) {
  const username = $('#username').val();
  const password = $('#password').val();

  $.ajax({
    url: base_url + '/auth/login',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ userName: username, password: password }),
    success: function (response) {
      if (response.code === 1000) {
        localStorage.setItem('accessToken', response.result.accessToken);
        localStorage.setItem('user', JSON.stringify(response.result.user));
        window.location.href = '/html/index.html';
      } else {
        alert('Sai tên đăng nhập hoặc mật khẩu!');
      }
    },
    error: function (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    },
  });
}
