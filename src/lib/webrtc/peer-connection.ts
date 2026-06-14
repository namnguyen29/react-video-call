import { iceServers } from "@/constants/ice-servers.const";

type CreatePeerConnectionParams = Readonly<{
  localStream: MediaStream;
  remoteStream: MediaStream;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onSignalingStateChange: (state: RTCSignalingState) => void;
  onIceGatheringStateChange: (state: RTCIceGatheringState) => void;
  onIceConnectionStateChange: (state: RTCIceConnectionState) => void;
}>;

const peerConfiguration: RTCConfiguration = {
  iceServers,
  iceCandidatePoolSize: 10,
};

// Wires browser WebRTC state changes back to React so the UI can reflect signaling and transport progress.
const registerPeerConnectionListeners = (
  peerConnection: RTCPeerConnection,
  {
    onConnectionStateChange,
    onSignalingStateChange,
    onIceGatheringStateChange,
    onIceConnectionStateChange,
  }: Omit<CreatePeerConnectionParams, "localStream" | "remoteStream">,
) => {
  peerConnection.addEventListener("connectionstatechange", () => {
    onConnectionStateChange(peerConnection.connectionState);
  });

  peerConnection.addEventListener("signalingstatechange", () => {
    onSignalingStateChange(peerConnection.signalingState);
  });

  peerConnection.addEventListener("icegatheringstatechange", () => {
    onIceGatheringStateChange(peerConnection.iceGatheringState);
  });

  peerConnection.addEventListener("iceconnectionstatechange", () => {
    onIceConnectionStateChange(peerConnection.iceConnectionState);
  });
};

// Creates one RTCPeerConnection, publishes local tracks into it, and collects incoming remote tracks into the provided MediaStream.
export const createPeerConnection = ({
  localStream,
  remoteStream,
  onConnectionStateChange,
  onSignalingStateChange,
  onIceGatheringStateChange,
  onIceConnectionStateChange,
}: CreatePeerConnectionParams) => {
  const peerConnection = new RTCPeerConnection(peerConfiguration);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.addEventListener("track", (event) => {
    event.streams[0]?.getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  });

  registerPeerConnectionListeners(peerConnection, {
    onConnectionStateChange,
    onSignalingStateChange,
    onIceGatheringStateChange,
    onIceConnectionStateChange,
  });

  return peerConnection;
};
