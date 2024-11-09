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
