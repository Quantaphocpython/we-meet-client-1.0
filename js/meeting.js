import { initLocalStream, toggleAudio, toggleVideo, joinRoom } from './room.js';

$(document).ready(() => {
  initLocalStream()
    .then(() => {
      joinRoom(getRoomId());
    })
    .catch((error) => {
      console.log('Error initializing local stream:', error);
    });
  toggleAudio();
  toggleVideo();
});

function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');
  return roomId;
}
