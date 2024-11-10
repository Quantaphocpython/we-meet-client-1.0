import { getMyInfo } from './auth.js';

$(document).ready(function () {
  initializeRoomPage();
});

function initializeRoomPage() {
  getMyInfo();

  const inputField = $('#meeting-code');
  const joinButton = $('#join-button');

  const codeRegex = /^[a-zA-Z]{4}-[a-zA-Z]{4}-[a-zA-Z]{4}$/;

  inputField.on('input', () => {
    const isValid = codeRegex.test(inputField.val().trim());
    joinButton.prop('disabled', !isValid);
  });

  joinButton.click(() => {
    const roomID = inputField.val().trim();
    if (!codeRegex.test(roomID)) {
      alert(
        'Room ID không hợp lệ! Vui lòng nhập đúng định dạng (xxxx-xxxx-xxxx).'
      );
      return; // Ngừng hành động nếu roomId không hợp lệ
    }
    window.location.href = `/html/meeting.html?roomId=${roomID}`;
  });
}
