import { checkAuthentication } from './auth.js';
import { createRoom } from './room.js';
import { getUserMediaStream } from './room.js';

$(document).ready(function () {
  checkAuthentication();
  createRoom();
});
