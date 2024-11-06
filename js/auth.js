export function checkAuthentication() {
  alert('Hello');
  $.ajax({
    url: 'http://localhost:8080/introspect', // URL của API introspect
    type: 'POST',
    xhrFields: {
      withCredentials: true, // Cho phép gửi cookie
    },
    success: function (response) {
      if (response.code === 1000 && response.result.isValid) {
        $('.user-name').text(response.result.userName);
      } else {
        $('.user-name').text('Vui lòng đăng nhập');
      }
    },
    error: function (error) {
      $('.username').text('Có lỗi xảy ra');
    },
  });
}
