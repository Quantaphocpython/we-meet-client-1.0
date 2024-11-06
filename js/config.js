export const iceServers = {
  iceServer: {
    urls: 'stun:stun.l.google.com:19302',
  },
};

export const localPeer = new RTCPeerConnection(iceServers);
