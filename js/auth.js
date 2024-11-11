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
          <div class="dropdown">
            <span class="login-btn">
              <i
                class="bx bxs-user"
                style="margin-right: 16px; font-size: 24px"
              ></i>
              <span class='user-fullname'>${response.result.fullName}</span>
              <i class="bx bx-chevron-down" style="margin: 0 0 5px 8px"></i>
            </span>
            <div class="dropdown-content">
              <a href="#" id="logout-btn">Đăng xuất</a>
            </div>
          </div>
        `);

        // Thêm sự kiện đăng xuất
        $('#logout-btn').on('click', function () {
          logout();
          location.reload();
        });
      } else {
        $('.user-name').text('Không tìm thấy thông tin người dùng');
      }
    },
    error: function () {},
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

export function register() {
  const fullName = $('#fullName').val();
  const username = $('#username').val();
  const password = $('#password').val();

  $.ajax({
    url: base_url + '/users',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      userName: username,
      password: password,
      fullName: fullName,
    }),
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

export function logout() {
  localStorage.clear();
}
