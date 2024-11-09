import { getMyInfo } from './auth.js';
import { createRoom } from './room.js';
import { joinRoom } from './room.js';

$(document).ready(function () {
  getMyInfo();
  // createRoom();

  // $('#loading-screen').fadeOut();

  $('#join-button').click(() => {
    const roomID = $('#meeting-code').val();
    window.location.href = '/html/meeting.html?roomId=' + roomID;
  });
});
