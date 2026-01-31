import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase configuration
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

// Check if config values are valid (not placeholder values)
const hasValidConfig = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId &&
  !firebaseConfig.apiKey.includes('your_') &&
  !firebaseConfig.apiKey.includes('your_firebase') &&
  !firebaseConfig.projectId.includes('your_') &&
  !firebaseConfig.projectId.includes('your_project') &&
  firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId.length > 5

// Only show error if config is actually invalid
if (!hasValidConfig && typeof window !== 'undefined') {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || 
      process.env[varName]?.includes('your_') || 
      process.env[varName]?.trim() === ''
  )
  
  if (missingVars.length > 0) {
    console.error(
      '❌ Firebase configuration is missing or incomplete.\n' +
      'Please set the following environment variables in .env.local:\n' +
      missingVars.map(v => `  - ${v}`).join('\n') +
      '\n\nGet your Firebase config from: Firebase Console → Project Settings → General → Your apps'
    )
  }
}

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    if (typeof window !== 'undefined') {
      console.log('✅ Firebase initialized successfully')
    }
  } catch (error: any) {
    console.error('❌ Error initializing Firebase:', error.message)
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
      console.error(
        '\n🔧 To fix this:\n' +
        '1. Make sure you have created a Firebase project\n' +
        '2. Enable Authentication in Firebase Console (Authentication → Get Started)\n' +
        '3. Add a Web app in Firebase Console and copy the config\n' +
        '4. Add the config to .env.local file\n' +
        '5. Restart your dev server (npm run dev)'
      )
    }
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ Firebase is not initialized. Please configure your Firebase environment variables in .env.local\n' +
      'See .env.local.example for the required variables.'
    )
  }
}

export { auth, db, storage }
export default app

