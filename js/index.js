import { getMyInfo } from './auth.js';
import { createRoom } from './room.js';
import { joinRoom } from './room.js';

$(document).ready(function () {
  getMyInfo();
  createRoom();

  $('#join-button').click(() => {
    const roomID = $('#meeting-code').val();
    joinRoom(roomID);
  });
});

function toggleLoadingScreen() {
  $('#loading-screen').fadeToggle();
}

function handleCall() {
  $('#callButton').click(() => {
    toggleLoadingScreen();

    createRoom()
      .then(function (roomId) {
        toggleLoadingScreen();

        window.location.href = `http://localhost:3000/html/room.html?roomId=${roomId}`;
      })
      .catch(function (error) {
        console.error('Error creating room:', error);
        toggleLoadingScreen();
        alert('Có lỗi xảy ra, vui lòng thử lại!');
      });
  });
}

function join() {
  $('#join-button').click(() => {
    const meetingCode = $('#meeting-code').val().trim();

    if (meetingCode) {
      window.location.href = `/html/room.html?roomId=${meetingCode}`;
    } else {
      alert('Vui lòng nhập mã cuộc họp.');
    }
  });
}
