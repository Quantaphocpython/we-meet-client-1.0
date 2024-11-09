import { base_url } from './config.js';
import { getAccessToken } from './config.js';

export function createRoom() {
  $('#callButton').click(function () {
    $.ajax({
      url: base_url + '/rooms',
      type: 'POST',
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      xhrFields: {
        withCredentials: true,
      },
      success: function (response) {
        alert('Phòng được tạo với ID: ' + response.result.id);
      },
      error: function (xhr, status, error) {
        alert('Có lỗi xảy ra khi tạo phòng: ' + xhr.responseText);
      },
    });
  });
}

export function getUserMediaStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(function (stream) {
      var localStream = stream;
      console.log(stream);

      $('#localVideo').srcObject = stream;
    })
    .catch(function (error) {
      console.log(error);
    });
}

const localVideo = document.getElementById('localVideo');
const remoteVideos = document.getElementById('remoteVideos');
const localID = JSON.parse(localStorage.getItem('user')).id ?? '';
const connectBtn = document.getElementById('connectBtn');

let localStream,
  roomID,
  stompClient,
  peers = {};

// ICE Server Configurations
const iceServers = {
  iceServer: {
    urls: 'stun:stun.l.google.com:19302',
  },
};

// Khởi tạo và cấu hình peerConnection
const createPeerConnection = (remoteID) => {
  const peer = new RTCPeerConnection(iceServers);

  // Khi có track (video/audio) mới từ remote user
  peer.ontrack = (event) => {
    let remoteVideo = document.getElementById(remoteID);

    // Nếu chưa có video element cho remoteID, tạo mới
    if (!remoteVideo) {
      remoteVideo = document.createElement('video');
      remoteVideo.id = remoteID;
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.style.width = '200px';
      remoteVideo.style.height = '200px';
      remoteVideos.appendChild(remoteVideo);
    } else {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  // Lắng nghe và gửi ICE candidates
  peer.onicecandidate = (event) => handleIceCandidate(event, remoteID);

  // Thêm tất cả các track từ local stream vào peer connection
  localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

  // Lưu peer connection vào object peers để quản lý
  peers[remoteID] = peer;

  return peer;
};

const handleIceCandidate = (event, remoteID) => {
  if (event.candidate) {
    // Gửi ICE candidate đến remote peer
    sendMessage('/app/candidate', {
      toUser: remoteID,
      fromUser: localID,
      candidate: {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.candidate,
      },
    });
  }
};

export const initLocalStream = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      localVideo.srcObject = stream;
    })
    .catch((error) => console.log('Error getting user media: ', error));
};

// Gửi thông điệp WebSocket
const sendMessage = (destination, message) => {
  stompClient.send(destination, {}, JSON.stringify(message));
};

export async function joinRoom(roomID) {
  try {
    await connectToWebSocket();
    sendMessage('/app/join', { roomId: roomID, userId: localID });
    window.location.href = `/html/meeting.html?roomId=${roomID}`;
  } catch (error) {
    console.error('Failed to join room:', error);
  }
}

const connectToWebSocket = () => {
  return new Promise((resolve, reject) => {
    const socket = new SockJS(base_url + '/websocket', { debug: false });
    stompClient = Stomp.over(socket);
    console.log('My ID: ' + localID);

    stompClient.connect(
      {},
      () => {
        console.log('Connected to WebSocket');
        // Đăng ký các subscription sau khi kết nối thành công
        stompClient.subscribe(
          `/user/${localID}/topic/call`,
          handleIncomingCall
        );
        stompClient.subscribe(`/user/${localID}/topic/offer`, handleOffer);
        stompClient.subscribe(`/user/${localID}/topic/answer`, handleAnswer);
        stompClient.subscribe(
          `/user/${localID}/topic/candidate`,
          handleCandidateReceived
        );
        resolve();
      },
      (error) => {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    );
  });
};

// Xử lý cuộc gọi đến
const handleIncomingCall = (userId) => {
  const remoteID = userId.body;
  console.log('Call from: ' + remoteID);
  const peer = createPeerConnection(remoteID);

  peer.createOffer().then((description) => {
    peer.setLocalDescription(description);
    sendMessage('/app/offer', {
      toUser: remoteID,
      fromUser: localID,
      offer: description,
    });
  });
};

// Xử lý offer nhận được từ server
const handleOffer = (offer) => {
  const o = JSON.parse(offer.body).offer;
  const fromUser = JSON.parse(offer.body).fromUser;

  let peer = peers[fromUser];

  if (!peer) {
    peer = createPeerConnection(fromUser);
  }

  peer
    .setRemoteDescription(new RTCSessionDescription(o))
    .then(() => {
      peer.createAnswer().then((description) => {
        peer.setLocalDescription(description).then(() => {
          sendMessage('/app/answer', {
            toUser: fromUser,
            fromUser: localID,
            answer: description,
          });
        });
      });
    })
    .catch((error) => {
      console.error('Error setting remote description: ', error);
    });
};

// Xử lý answer nhận được
const handleAnswer = (answer) => {
  const o = JSON.parse(answer.body).answer;
  const fromUser = JSON.parse(answer.body).fromUser;

  // Kiểm tra xem peer connection cho từ người gửi answer đã tồn tại chưa
  const peer = peers[fromUser];

  if (peer) {
    peer.setRemoteDescription(new RTCSessionDescription(o)).catch((error) => {
      console.error('Error setting remote description: ', error);
    });
  } else {
    console.error(`Peer connection not found for user: ${fromUser}`);
  }
};

// Xử lý candidate nhận được
const handleCandidateReceived = (candidate) => {
  const o = JSON.parse(candidate.body).candidate;
  const fromUser = JSON.parse(candidate.body).fromUser;

  const peer = peers[fromUser];

  if (peer) {
    // Nếu peer connection tồn tại, thêm ICE candidate vào peer connection
    const iceCandidate = new RTCIceCandidate({
      sdpMLineIndex: o.label,
      candidate: o.id,
    });
    peer.addIceCandidate(iceCandidate).catch((error) => {
      console.error('Error adding ICE candidate: ', error);
    });
  } else {
    // Nếu không tồn tại peer connection, thông báo lỗi hoặc tạo kết nối mới nếu cần
    console.error(`Peer connection not found for user: ${fromUser}`);
  }
};
