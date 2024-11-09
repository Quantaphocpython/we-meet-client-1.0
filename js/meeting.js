import { initLocalStream, connectToWebSocket, joinRoom } from './room.js';

$(document).ready(() => {
  initLocalStream()
    .then(() => {
      joinRoom(getRoomId());
    })
    .catch((error) => {
      console.log('Error initializing local stream:', error);
    });
});

function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');
  return roomId;
}
