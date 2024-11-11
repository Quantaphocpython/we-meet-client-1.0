import {
  initLocalStream,
  toggleAudio,
  toggleVideo,
  joinRoom,
  leaveRoom,
} from './room.js';

$(document).ready(() => {
  initLocalStream()
    .then(() => {
      joinRoom(getRoomId());
    })
    .catch((error) => {
      console.log('Error initializing local stream:', error);
    });
  toggleAudio(getRoomId());
  toggleVideo(getRoomId());

  $('#outButton').click(() => leaveRoom(getRoomId()));

  $(window).on('beforeunload', (event) => {
    leaveRoom(getRoomId());
    event.returnValue = '';
  });

  $(window).on('unload', (event) => {
    leaveRoom(getRoomId());
    event.returnValue = '';
  });
});

function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');
  return roomId;
}
