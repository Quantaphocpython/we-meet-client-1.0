import { localPeer } from './config';

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

export function getUserMediaStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(function (stream) {
      var localStream = stream;

      // Gán stream vào thẻ video để hiển thị
      $('#localVideo').srcObject = stream; // #localVideo là id của video element
    })
    .catch(function (error) {
      console.log(error);
    });
}
