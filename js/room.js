import { base_url } from './config.js';
import { getAccessToken } from './config.js';

const localVideo = document.getElementById('localVideo');
const participant = document.getElementById('participant');
const localID = JSON.parse(localStorage.getItem('user')).id ?? '';
const fullName = JSON.parse(localStorage.getItem('user')).fullName ?? '';
const userName = JSON.parse(localStorage.getItem('user')).userName ?? '';
const muteButton = document.getElementById('muteButton');
const videoButton = document.getElementById('videoButton');

let isVideoMuted = false;
let isMuted = false;

let localStream,
  stompClient,
  peers = {};

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'stun:stun.relay.metered.ca:80',
    },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'a1873c7905653a9507cb5f58',
      credential: 'TnOJHOhKU/rIEfSX',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'a1873c7905653a9507cb5f58',
      credential: 'TnOJHOhKU/rIEfSX',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'a1873c7905653a9507cb5f58',
      credential: 'TnOJHOhKU/rIEfSX',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'a1873c7905653a9507cb5f58',
      credential: 'TnOJHOhKU/rIEfSX',
    },
  ],
};

// Hàm tạo phòng và lấy roomId
export function createRoom() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: base_url + '/rooms',
      type: 'POST',
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      success: function (response) {
        roomId = response.result.id; // Gán roomId từ server
        resolve(roomId); // Trả về roomId cho phần gọi hàm
      },
      error: function (xhr, status, error) {
        reject('Có lỗi xảy ra khi tạo phòng: ' + xhr.responseText);
      },
    });
  });
}

export function toggleAudio() {
  muteButton.addEventListener('click', () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

      isMuted = !isMuted;

      const icon = muteButton.querySelector('i');
      if (isMuted) {
        icon.classList.remove('bi-mic-fill');
        icon.classList.add('bi-mic-mute-fill');
      } else {
        icon.classList.remove('bi-mic-mute-fill');
        icon.classList.add('bi-mic-fill');
      }
    }
  });
}

export function toggleVideo() {
  videoButton.addEventListener('click', () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        isVideoMuted = !isVideoMuted;

        videoButton.innerHTML = isVideoMuted
          ? '<i class="bi bi-camera-video-off-fill"></i>'
          : '<i class="bi bi-camera-video-fill"></i>';
      }
    }
  });
}

const createPeerConnection = (remoteID, remoteFullName, remoteUserName) => {
  const peer = new RTCPeerConnection(iceServers);

  peer.ontrack = (event) => {
    let userDiv = document.getElementById(remoteID);
    let remoteVideo = document.getElementById(remoteID);

    if (!userDiv) {
      userDiv = document.createElement('div');
      userDiv.id = remoteID; // Đặt id để dễ dàng tham chiếu lại
      userDiv.classList.add('user');

      const thumbnail = document.createElement('i');
      thumbnail.classList.add('bi', 'bi-person-fill', 'user-thumbnail');

      const userNameP = document.createElement('p');
      userNameP.classList.add('user-name');
      userNameP.textContent = remoteFullName;

      userDiv.appendChild(thumbnail);
      userDiv.appendChild(userNameP);

      participant.appendChild(userDiv);
    }

    if (!remoteVideo) {
      remoteVideo = document.createElement('video');
      remoteVideo.classList.add('video');
      remoteVideo.id = remoteID;
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;

      userDiv.appendChild(remoteVideo);
    } else {
      remoteVideo.srcObject = event.streams[0];
    }
  };

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

// Hàm để khởi tạo localStream trước
export const initLocalStream = () => {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
        $('#localId .user-name').text(fullName);
        resolve(stream);
      })
      .catch((error) => {
        console.log('Error getting user media: ', error);
        reject(error);
      });
  });
};
// Gửi thông điệp WebSocket
const sendMessage = (destination, message) => {
  stompClient.send(destination, {}, JSON.stringify(message));
};

export async function joinRoom(roomID) {
  try {
    await connectToWebSocket();
    sendMessage('/app/join', {
      roomId: roomID,
      userId: localID,
      fullName: fullName,
      userName: userName,
    });
    // window.location.href = `/html/meeting.html?roomId=${roomID}`;
  } catch (error) {
    console.error('Failed to join room:', error);
  }
}

export const connectToWebSocket = () => {
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
          `/user/${localID}/topic/errors`,
          handleAnswerError
        );
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

const handleAnswerError = (error) => {
  const errorResponse = JSON.parse(error.body);
  console.log(errorResponse);

  document.body.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
    ">
      <div style="
        background-color: #fff;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
        width: 90%;
        transition: transform 0.3s ease;
        transform: translateY(-10px);
      ">
        <h1 style="
          font-size: 2rem;
          color: #e63946;
          margin-bottom: 20px;
          text-transform: uppercase;
        ">
          Error
        </h1>
        <p style="
          font-size: 1.2rem;
          color: #333;
          margin-bottom: 30px;
        ">
          ${errorResponse.message || 'An unexpected error occurred'}
        </p>
        <a href='/html/index.html' style="
          text-decoration: none;
          padding: 10px 20px;
          font-size: 1rem;
          background-color: #6e8efb;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        ">
          Về trang chủ
        </a>
      </div>
    </div>
  `;
};

// Xử lý cuộc gọi đến
const handleIncomingCall = (join) => {
  console.log(join);
  const remoteID = JSON.parse(join.body).userId;
  const remoteFullName = JSON.parse(join.body).fullName;
  const remoteUserName = JSON.parse(join.body).userName;

  console.log('Call from: ' + remoteFullName);
  const peer = createPeerConnection(remoteID, remoteFullName, remoteUserName);

  peer.createOffer().then((description) => {
    peer.setLocalDescription(description);
    sendMessage('/app/offer', {
      toUser: remoteID,
      fromUser: localID,
      offer: description,
      fullName: fullName,
      userName: userName,
    });
  });
};

// Xử lý offer nhận được từ server
const handleOffer = (offer) => {
  const o = JSON.parse(offer.body).offer;
  const fromUser = JSON.parse(offer.body).fromUser;
  const remoteFullName = JSON.parse(offer.body).fullName;
  const remoteUserName = JSON.parse(offer.body).userName;

  console.log('Offer from: ', remoteFullName);
  console.log(offer);

  let peer = peers[fromUser];

  if (!peer) {
    peer = createPeerConnection(fromUser, remoteFullName, remoteUserName);
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
            fullName: fullName,
            userName: userName,
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
  const remoteFullName = JSON.parse(answer.body).fullName;
  const remoteUserName = JSON.parse(answer.body).userName;

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
