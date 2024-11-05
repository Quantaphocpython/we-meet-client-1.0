$(document).ready(function () {
  checkAuthentication();
});

function checkAuthentication() {
  $.ajax({
    url: 'http://localhost:8080/introspect', // URL của API introspect
    type: 'POST',
    xhrFields: {
      withCredentials: true, // Cho phép gửi cookie
    },
    success: function (response) {
      if (response.code === 1000 && response.result.isValid) {
        console.log('User is authenticated:', response.result.userName);
        $('.user-name').text(response.result.userName);
      } else {
        console.log('User is not authenticated.');
        $('.user-name').text('Please log in.');
      }
    },
    error: function (error) {
      console.log('Error occurred:', error);
      $('.username').text('Error checking authentication.');
    },
  });
}
