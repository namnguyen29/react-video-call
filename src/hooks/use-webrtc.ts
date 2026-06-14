import { useEffect, useRef, useState } from 'react'
import type {
  DocumentData,
  DocumentReference,
  Unsubscribe,
} from 'firebase/firestore'

import { getDb } from '@/lib/firebase-client'
import { createPeerConnection } from '@/lib/webrtc/peer-connection'
import {
  collectIceCandidates,
  createRoomRef,
  deleteRoomArtifacts,
  getRoomRefById,
  getRoomSnapshot,
  saveAnswer,
  saveOffer,
  subscribeToAnswer,
  subscribeToRemoteCandidates,
} from '@/lib/webrtc/room-service'
import { useUserMedia } from '@/hooks/use-user-media'

type CallRole = 'idle' | 'caller' | 'callee'

export function useWebRTC() {
  const {
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    hasMedia,
    openUserMedia: requestUserMedia,
    resetRemoteStream,
    clearMedia,
  } = useUserMedia()

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const roomRefRef = useRef<DocumentReference<DocumentData> | null>(null)
  const unsubscribeRefs = useRef<Unsubscribe[]>([])

  const [roomId, setRoomId] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [role, setRole] = useState<CallRole>('idle')
  const [statusMessage, setStatusMessage] = useState(
    'Open your camera and microphone to start a call.',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>('new')
  const [signalingState, setSignalingState] =
    useState<RTCSignalingState>('stable')
  const [iceGatheringState, setIceGatheringState] =
    useState<RTCIceGatheringState>('new')
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>('new')

  // Removes Firestore listeners from previous rooms so stale signaling updates do not leak into the next call.
  const clearSubscriptions = () => {
    unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe())
    unsubscribeRefs.current = []
  }

  // Builds the RTCPeerConnection from the current local stream and reconnects it to a fresh remote stream for the next room session.
  const preparePeerConnection = () => {
    const localStream = localStreamRef.current

    if (!localStream) {
      throw new Error(
        'Open your camera and microphone before creating or joining a room.',
      )
    }

    const remoteStream = resetRemoteStream()
    const peerConnection = createPeerConnection({
      localStream,
      remoteStream,
      onConnectionStateChange: setConnectionState,
      onSignalingStateChange: setSignalingState,
      onIceGatheringStateChange: setIceGatheringState,
      onIceConnectionStateChange: setIceConnectionState,
    })

    peerConnectionRef.current = peerConnection

    return peerConnection
  }

  // Opens local media first because WebRTC must have tracks ready before creating an offer or answer.
  const openUserMedia = async () => {
    setIsBusy(true)
    setErrorMessage('')

    try {
      await requestUserMedia()
      setStatusMessage(
        'Local media is ready. Create a room or join an existing room.',
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not access camera and microphone.'
      setErrorMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  // Creates the caller side of the handshake: build a room, store the offer, then wait for the callee answer and ICE candidates.
  const createRoom = async () => {
    setIsBusy(true)
    setErrorMessage('')

    try {
      const db = getDb()
      const roomRef = createRoomRef(db)
      const peerConnection = preparePeerConnection()

      roomRefRef.current = roomRef
      setRole('caller')

      collectIceCandidates(peerConnection, roomRef, 'callerCandidates')

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      await saveOffer(roomRef, offer)

      setRoomId(roomRef.id)
      setStatusMessage(
        'Room created. Share the room ID with the second participant.',
      )

      unsubscribeRefs.current.push(
        subscribeToAnswer(roomRef, async (answer) => {
          if (peerConnection.currentRemoteDescription) {
            return
          }

          await peerConnection.setRemoteDescription(answer)
          setStatusMessage('Answer received. Waiting for connection.')
        }),

        subscribeToRemoteCandidates(
          roomRef,
          'calleeCandidates',
          async (candidate) => {
            await peerConnection.addIceCandidate(candidate)
          },
        ),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create the room.'
      setErrorMessage(message)
      setStatusMessage('Room creation failed.')
    } finally {
      setIsBusy(false)
    }
  }

  // Opens the join dialog because the callee needs the caller room ID before reading the stored offer from Firestore.
  const openJoinDialog = () => {
    setErrorMessage('')
    setIsJoinDialogOpen(true)
  }

  // Closes the join dialog when the user cancels instead of starting the callee signaling flow.
  const closeJoinDialog = () => {
    setIsJoinDialogOpen(false)
  }

  // Loads the caller offer from Firestore, creates the callee answer, and subscribes to incoming ICE candidates from the caller.
  const joinRoomById = async (nextRoomId: string) => {
    setIsBusy(true)
    setErrorMessage('')

    try {
      const db = getDb()
      const roomRef = getRoomRefById(db, nextRoomId)
      const roomSnapshot = await getRoomSnapshot(roomRef)

      if (!roomSnapshot.exists()) {
        throw new Error(`Room "${nextRoomId}" does not exist.`)
      }

      const roomData = roomSnapshot.data()
      const peerConnection = preparePeerConnection()

      roomRefRef.current = roomRef
      setRoomId(nextRoomId)
      setRole('callee')

      collectIceCandidates(peerConnection, roomRef, 'calleeCandidates')

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(roomData.offer),
      )

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      await saveAnswer(roomRef, answer)

      setStatusMessage('Joined room. Waiting for the caller connection.')

      unsubscribeRefs.current.push(
        subscribeToRemoteCandidates(
          roomRef,
          'callerCandidates',
          async (candidate) => {
            await peerConnection.addIceCandidate(candidate)
          },
        ),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not join the room.'
      setErrorMessage(message)
      setStatusMessage('Join failed.')
      setRole('idle')
    } finally {
      setIsBusy(false)
    }
  }

  // Validates the input room ID before starting the callee side of the WebRTC answer flow.
  const confirmJoinRoom = async () => {
    const trimmedRoomId = joinRoomId.trim()

    if (!trimmedRoomId) {
      setErrorMessage('Enter a room ID before joining.')
      return
    }

    setIsJoinDialogOpen(false)
    await joinRoomById(trimmedRoomId)
  }

  // Stops tracks, closes the peer connection, removes Firestore room artifacts, and resets UI state for the next call.
  const hangUp = async () => {
    setIsBusy(true)
    setErrorMessage('')

    try {
      clearSubscriptions()
      peerConnectionRef.current?.close()

      if (roomRefRef.current) {
        await deleteRoomArtifacts(roomRefRef.current)
      }

      clearMedia()

      peerConnectionRef.current = null
      roomRefRef.current = null

      setRoomId('')
      setJoinRoomId('')
      setRole('idle')
      setConnectionState('new')
      setSignalingState('stable')
      setIceGatheringState('new')
      setIceConnectionState('new')
      setStatusMessage(
        'Call ended. Open your camera and microphone to start again.',
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not cleanly hang up.'
      setErrorMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  // Copies the Firestore room ID because this simple two-person demo shares the session identifier out-of-band.
  const copyRoomId = async () => {
    if (!roomId) {
      return
    }

    try {
      await navigator.clipboard.writeText(roomId)
      setStatusMessage('Room ID copied. Send it to the second participant.')
    } catch {
      setErrorMessage('Could not copy the room ID.')
    }
  }

  // Cleans up media devices, peer connections, and Firestore listeners when React unmounts the screen.
  useEffect(() => {
    return () => {
      clearSubscriptions()
      peerConnectionRef.current?.close()
      clearMedia({ resetState: false })
    }
  }, [clearMedia])

  return {
    localVideoRef,
    remoteVideoRef,
    roomId,
    joinRoomId,
    role,
    statusMessage,
    errorMessage,
    isJoinDialogOpen,
    isBusy,
    hasMedia,
    connectionState,
    signalingState,
    iceGatheringState,
    iceConnectionState,
    canCreateOrJoin: hasMedia && !isBusy && role === 'idle',
    canHangUp: hasMedia && !isBusy,
    setJoinRoomId,
    openUserMedia,
    createRoom,
    openJoinDialog,
    closeJoinDialog,
    confirmJoinRoom,
    hangUp,
    copyRoomId,
  }
}
