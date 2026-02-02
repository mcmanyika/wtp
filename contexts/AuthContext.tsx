'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Fetch user profile from Firestore
        if (!db) {
          setLoading(false)
          return
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserProfile({
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as UserProfile)
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              name: user.displayName || undefined,
              membershipTier: 'free',
              role: 'supporter',
              createdAt: new Date(),
              emailVerified: user.emailVerified,
              photoURL: user.photoURL || undefined,
            }
            try {
              await setDoc(doc(db, 'users', user.uid), {
                ...newProfile,
                createdAt: new Date(),
              })
              setUserProfile(newProfile)
            } catch (createError) {
              console.error('Error creating user profile:', createError)
              // Still set the profile in state even if Firestore write fails
              setUserProfile(newProfile)
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Set a minimal profile if fetch fails
          setUserProfile({
            uid: user.uid,
            email: user.email!,
            name: user.displayName || undefined,
            membershipTier: 'free',
            role: 'supporter',
            createdAt: new Date(),
            emailVerified: user.emailVerified,
            photoURL: user.photoURL || undefined,
          })
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !db) {
      throw new Error('Firebase is not initialized. Please configure your environment variables.')
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send verification email
    await sendEmailVerification(user)

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name,
      membershipTier: 'free',
      role: 'supporter',
      createdAt: new Date(),
      emailVerified: false,
    }

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: new Date(),
    })
    setUserProfile(userProfile)
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not initialized. Please configure your environment variables.')
    }
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    if (!auth || !db) {
      throw new Error('Firebase is not initialized. Please configure your environment variables.')
    }
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      // Create new user profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name: user.displayName || undefined,
        membershipTier: 'free',
        role: 'supporter',
        createdAt: new Date(),
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || undefined,
      }
      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: new Date(),
      })
    }
  }

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase is not initialized. Please configure your environment variables.')
    }
    await signOut(auth)
    setUserProfile(null)
  }

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase is not initialized. Please configure your environment variables.')
    }
    await sendPasswordResetEmail(auth, email)
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    if (!db) {
      throw new Error('Firebase is not initialized. Please configure your environment variables.')
    }
    await setDoc(doc(db, 'users', user.uid), data, { merge: true })
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null))
  }

  const refreshUserProfile = async () => {
    if (!user || !db) return
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserProfile({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserProfile)
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        resetPassword,
        updateProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

