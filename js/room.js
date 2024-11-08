// room.js

// Hàm tạo phòng và lấy roomId
export function createRoom() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: 'http://localhost:8080/rooms',
      type: 'POST',
      xhrFields: {
        withCredentials: true,
      },
      success: function (response) {
        roomId = response.result.id; // Gán roomId từ server
        resolve(roomId); // Trả về roomId cho phần gọi hàm
      },
      error: function (xhr, status, error) {
        reject('Có lỗi xảy ra khi tạo phòng: ' + xhr.responseText);
      },
    });
  });
}

// Hàm lấy stream từ camera và microphone
export function getUserMediaStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(function (stream) {
      localStream = stream;
      $('#localVideo')[0].srcObject = stream;
    })
    .catch(function (error) {
      console.error('Lỗi khi truy cập thiết bị media: ', error);
    });
}

// Kết nối WebSocket và đăng ký nhận tín hiệu WebRTC từ server
