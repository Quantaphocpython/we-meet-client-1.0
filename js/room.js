export function createRoom() {
  $('#callButton').click(function () {
    $.ajax({
      url: 'http://localhost:8080/rooms',
      type: 'POST',
      xhrFields: {
        withCredentials: true,
      },
      success: function (response) {
        alert('Phòng được tạo với ID: ' + response.result.id);
      },
      error: function (xhr, status, error) {
        alert('Có lỗi xảy ra khi tạo phòng: ' + xhr.responseText);
      },
    });
  });
}
