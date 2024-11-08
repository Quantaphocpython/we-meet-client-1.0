var stompClient = null;
var localPeerConnections = {};
var localStream;
var localId = JSON.parse(localStorage.getItem('user'))?.userId;
var roomId = ''; // Để trống, sẽ gán sau khi tạo phòng

$(document).ready(() => {
  getLocalStream();
  connect();
});

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      document.getElementById('localVideo').srcObject = stream;
    });
}

function connect() {
  var socket = new SockJS('http://localhost:8080/websocket');
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {},
    function (frame) {
      console.log('Connected: ' + frame);

      joinRoom();
    },
    function (error) {
      console.log('Connection error: ' + error);
    }
  );
}

export function joinRoom() {
  roomId = 'room1'; // Đây là ví dụ, bạn có thể tạo một phòng mới tùy vào yêu   cầu
  stompClient.send(
    '/app/join',
    {},
    JSON.stringify({ roomId: roomId, from: localId })
  );

  // Lắng nghe tín hiệu WebRTC (offer, answer, candidate) từ các thành viên trong phòng
  stompClient.subscribe('/topic/webrtc', function (signal) {
    handleWebRTCSignal(JSON.parse(signal.body));
  });
}

function createOffer(toUser) {
  var peerConnection = new RTCPeerConnection();
  localPeerConnections[toUser] = peerConnection;

  // Thêm track vào peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Xử lý ICE candidate
  peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      var candidate = {
        to: toUser,
        from: localId, // Local ID của người gọi
        candidate: event.candidate,
      };
      stompClient.send('/app/candidate', {}, JSON.stringify(candidate));
    }
  };

  // Lắng nghe stream từ người khác
  peerConnection.ontrack = function (event) {
    var remoteVideo = document.getElementById(toUser + 'Video');

    // Nếu chưa có video của người đối diện, tạo mới
    if (!remoteVideo) {
      remoteVideo = document.createElement('video');
      remoteVideo.id = toUser + 'Video'; // Đặt ID cho video của đối phương
      remoteVideo.autoplay = true; // Đảm bảo video tự động phát
      remoteVideo.controls = true; // Thêm controls để người dùng có thể điều chỉnh video

      // Tạo phần tử user mới và chèn video vào DOM
      var userDiv = document.createElement('div');
      userDiv.className = 'user';
      userDiv.innerHTML = `
        <i class="bi bi-person-fill user-thumbnail"></i>
        <p class="user-name">User ${toUser}</p>
      `;
      userDiv.appendChild(remoteVideo);
      document.querySelector('.participant').appendChild(userDiv); // Thêm video vào DOM
    }

    // Gán stream vào video
    remoteVideo.srcObject = event.streams[0];
  };

  // Tạo offer và gửi
  peerConnection.createOffer().then((offer) => {
    peerConnection.setLocalDescription(offer);
    var offerMessage = {
      to: toUser,
      from: localId,
      offer: offer,
      roomId: roomId,
    };
    stompClient.send('/app/webrtc', {}, JSON.stringify(offerMessage));
  });
}

function handleWebRTCSignal(signal) {
  var fromUser = signal.from;
  var offer = signal.offer;
  var answer;

  // Nếu tín hiệu là offer, chúng ta cần tạo một answer
  if (offer) {
    var peerConnection = new RTCPeerConnection();
    localPeerConnections[fromUser] = peerConnection;

    // Thêm track vào peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    peerConnection.onicecandidate = function (event) {
      if (event.candidate) {
        var candidate = {
          to: fromUser,
          from: localId,
          candidate: event.candidate,
        };
        stompClient.send('/app/candidate', {}, JSON.stringify(candidate));
      }
    };

    peerConnection.ontrack = function (event) {
      var remoteVideo = document.getElementById(fromUser + 'Video');
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    // Tạo answer và gửi lại cho người gọi
    peerConnection.createAnswer().then((answer) => {
      peerConnection.setLocalDescription(answer);
      var answerMessage = {
        to: fromUser,
        from: localId,
        answer: answer,
        roomId: roomId,
      };
      stompClient.send('/app/webrtc', {}, JSON.stringify(answerMessage));
    });
  }

  // Nếu tín hiệu là answer, thiết lập remote description
  if (signal.answer) {
    var peerConnection = localPeerConnections[fromUser];
    if (peerConnection) {
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal.answer)
      );
    }
  }

  // Nếu tín hiệu là ICE candidate, thêm candidate vào peer connection
  if (signal.candidate) {
    var peerConnection = localPeerConnections[signal.from];
    if (peerConnection) {
      var candidate = new RTCIceCandidate(signal.candidate);
      peerConnection.addIceCandidate(candidate);
    }
  }
}

function sendCandidate(candidate, toUser) {
  var candidateMessage = {
    to: toUser,
    from: localId,
    candidate: candidate,
  };
  stompClient.send('/app/candidate', {}, JSON.stringify(candidateMessage));
}
