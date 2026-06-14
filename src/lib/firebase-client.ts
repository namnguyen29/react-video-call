import { initializeApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

let cachedDb: Firestore | null = null

export const getDb = (): Firestore => {
  if (cachedDb) {
    return cachedDb
  }

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

  if (!projectId) {
    throw new Error('Missing VITE_FIREBASE_PROJECT_ID.')
  }

  const app = initializeApp({
    projectId,
  })
  cachedDb = getFirestore(app)

  return cachedDb
}
