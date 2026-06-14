import { useCallback, useRef, useState } from 'react'

type ClearMediaOptions = Readonly<{
  resetState?: boolean
}>

export function useUserMedia() {
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const [hasMedia, setHasMedia] = useState(false)

  // Connects a MediaStream to a video element so local and remote tracks appear immediately in the React UI.
  const attachStreamToVideo = useCallback(
    (element: HTMLVideoElement | null, stream: MediaStream | null) => {
      if (element) {
        element.srcObject = stream
      }
    },
    [],
  )

  // Requests camera and microphone access, then stores the local stream so WebRTC can publish it into the peer connection.
  const openUserMedia = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    const remoteStream = new MediaStream()

    localStreamRef.current = localStream
    remoteStreamRef.current = remoteStream

    attachStreamToVideo(localVideoRef.current, localStream)
    attachStreamToVideo(remoteVideoRef.current, remoteStream)

    setHasMedia(true)
  }

  // Creates a fresh remote stream so each new room starts with an empty container for tracks arriving from the other peer.
  const resetRemoteStream = () => {
    const remoteStream = new MediaStream()

    remoteStreamRef.current = remoteStream
    attachStreamToVideo(remoteVideoRef.current, remoteStream)

    return remoteStream
  }

  // Stops all browser media tracks and clears attached video elements so a finished call leaves no active devices behind.
  const clearMedia = useCallback(
    ({ resetState = true }: ClearMediaOptions = {}) => {
      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })

      remoteStreamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })

      localStreamRef.current = null
      remoteStreamRef.current = null

      attachStreamToVideo(localVideoRef.current, null)
      attachStreamToVideo(remoteVideoRef.current, null)

      if (resetState) {
        setHasMedia(false)
      }
    },
    [attachStreamToVideo],
  )

  return {
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    remoteStreamRef,
    hasMedia,
    openUserMedia,
    resetRemoteStream,
    clearMedia,
  }
}
