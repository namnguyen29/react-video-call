import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'

export type CandidateCollectionName = 'callerCandidates' | 'calleeCandidates'

// Creates a new Firestore room document that will hold the offer, answer, and ICE subcollections for one call session.
export const createRoomRef = (db: Firestore) => doc(collection(db, 'rooms'))

// Resolves an existing room document so the callee can load the caller's offer from Firestore.
export const getRoomRefById = (db: Firestore, roomId: string) =>
  doc(db, 'rooms', roomId)

// Reads the room document so the callee can check whether the room exists and fetch the caller's SDP offer.
export const getRoomSnapshot = (roomRef: DocumentReference<DocumentData>) =>
  getDoc(roomRef)

// Stores the caller SDP offer inside the room document so the second peer can create an answer.
export const saveOffer = async (
  roomRef: DocumentReference<DocumentData>,
  offer: RTCSessionDescriptionInit,
) => {
  await setDoc(roomRef, {
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
  })
}

// Stores the callee SDP answer back into the same room document so the caller can finish the handshake.
export const saveAnswer = async (
  roomRef: DocumentReference<DocumentData>,
  answer: RTCSessionDescriptionInit,
) => {
  await updateDoc(roomRef, {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  })
}

// Publishes local ICE candidates into a Firestore subcollection so the remote peer can discover valid network routes.
export const collectIceCandidates = (
  peerConnection: RTCPeerConnection,
  roomRef: DocumentReference<DocumentData>,
  candidateCollectionName: CandidateCollectionName,
) => {
  const candidateCollection = collection(roomRef, candidateCollectionName)

  peerConnection.addEventListener('icecandidate', (event) => {
    if (!event.candidate) {
      return
    }

    void setDoc(doc(candidateCollection), event.candidate.toJSON())
  })
}

// Watches the room document for the callee answer so the caller can set the remote SDP description once it arrives.
export const subscribeToAnswer = (
  roomRef: DocumentReference<DocumentData>,
  onAnswer: (answer: RTCSessionDescription) => Promise<void> | void,
): Unsubscribe =>
  onSnapshot(roomRef, (snapshot) => {
    const data = snapshot.data()

    if (!data?.answer) {
      return
    }

    void onAnswer(new RTCSessionDescription(data.answer))
  })

// Watches the selected ICE subcollection so each new candidate from the remote peer can be applied to the local connection.
export const subscribeToRemoteCandidates = (
  roomRef: DocumentReference<DocumentData>,
  candidateCollectionName: CandidateCollectionName,
  onCandidate: (candidate: RTCIceCandidate) => Promise<void> | void,
): Unsubscribe =>
  onSnapshot(collection(roomRef, candidateCollectionName), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type !== 'added') {
        return
      }

      void onCandidate(new RTCIceCandidate(change.doc.data()))
    })
  })

// Deletes the room document and both candidate collections so a finished call does not leave stale signaling data behind.
export const deleteRoomArtifacts = async (
  roomRef: DocumentReference<DocumentData>,
) => {
  const [callerCandidates, calleeCandidates] = await Promise.all([
    getDocs(collection(roomRef, 'callerCandidates')),
    getDocs(collection(roomRef, 'calleeCandidates')),
  ])

  await Promise.all([
    ...callerCandidates.docs.map((candidate) => deleteDoc(candidate.ref)),
    ...calleeCandidates.docs.map((candidate) => deleteDoc(candidate.ref)),
  ])

  await deleteDoc(roomRef)
}
