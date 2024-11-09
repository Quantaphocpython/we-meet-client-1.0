import { getMyInfo } from './auth.js';
import { createRoom } from './room.js';

$(document).ready(function () {
  getMyInfo();
  createRoom();
});
