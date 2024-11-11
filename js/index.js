import { getMyInfo } from './auth.js';
import { createRoom } from './room.js';

$(document).ready(function () {
  initializeRoomPage();
});

function initializeRoomPage() {
  getMyInfo();

  const inputField = $('#meeting-code');
  const joinButton = $('#join-button');
  const callButton = $('#callButton');

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
      return;
    }

    const user = localStorage.getItem('user');

    if (!user) {
      alert('Bạn chưa đăng nhập');
      return;
    }
    window.location.href = `/html/meeting.html?roomId=${roomID}`;
  });

  // Xử lý khi nhấn callButton
  callButton.click(async () => {
    $('.loading-screen').addClass('visible');
    try {
      const roomId = await createRoom();
      window.location.href = `/html/meeting.html?roomId=${roomId}`;
    } catch (error) {
      alert(error);
    }
    $('.loading-screen').removeClass('visible');
  });
}
