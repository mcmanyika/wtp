import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { UserProfile, Donation, Membership, ContactSubmission } from '@/types'

// Helper functions
function requireDb() {
  if (!db) throw new Error('Firebase Firestore is not initialized')
  return db
}

function toDate(timestamp: any): Date {
  return timestamp?.toDate?.() || new Date()
}

// User operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(requireDb(), 'users', userId))
  if (!userDoc.exists()) return null

  const data = userDoc.data()
  return { ...data, createdAt: toDate(data.createdAt) } as UserProfile
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  await setDoc(doc(requireDb(), 'users', userId), data, { merge: true })
}

export async function createStripeCustomerId(
  userId: string,
  customerId: string
): Promise<void> {
  await setDoc(doc(requireDb(), 'users', userId), { stripeCustomerId: customerId }, { merge: true })
}

// Donation operations
export async function createDonation(donation: Omit<Donation, 'id' | 'createdAt'>): Promise<string> {
  const donationRef = doc(collection(requireDb(), 'donations'))
  await setDoc(donationRef, {
    ...donation,
    id: donationRef.id,
    createdAt: Timestamp.now(),
  })
  return donationRef.id
}

export async function getDonationsByUser(userId: string): Promise<Donation[]> {
  if (!db) return []

  const q = query(
    collection(db, 'donations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: toDate(doc.data().createdAt),
  })) as Donation[]
}

export async function getDonationById(donationId: string): Promise<Donation | null> {
  const donationDoc = await getDoc(doc(requireDb(), 'donations', donationId))
  if (!donationDoc.exists()) return null

  const data = donationDoc.data()
  return { ...data, createdAt: toDate(data.createdAt) } as Donation
}

export async function updateDonationStatus(
  donationId: string,
  status: Donation['status']
): Promise<void> {
  await updateDoc(doc(requireDb(), 'donations', donationId), { status })
}

// Membership operations
export async function createMembership(
  membership: Omit<Membership, 'id'>
): Promise<string> {
  const membershipRef = doc(collection(requireDb(), 'memberships'))
  await setDoc(membershipRef, {
    ...membership,
    id: membershipRef.id,
    startDate: Timestamp.now(),
  })
  return membershipRef.id
}

export async function getMembershipByUser(userId: string): Promise<Membership | null> {
  if (!db) return null

  const q = query(
    collection(db, 'memberships'),
    where('userId', '==', userId),
    orderBy('startDate', 'desc'),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const data = snapshot.docs[0].data()
  return {
    ...data,
    startDate: toDate(data.startDate),
    endDate: data.endDate ? toDate(data.endDate) : undefined,
  } as Membership
}

export async function getMembershipBySubscriptionId(
  subscriptionId: string
): Promise<Membership | null> {
  if (!db) return null

  const q = query(
    collection(db, 'memberships'),
    where('stripeSubscriptionId', '==', subscriptionId),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const data = snapshot.docs[0].data()
  return {
    ...data,
    startDate: toDate(data.startDate),
    endDate: data.endDate ? toDate(data.endDate) : undefined,
  } as Membership
}

export async function updateMembership(
  membershipId: string,
  data: Partial<Membership>
): Promise<void> {
  const updateData: any = { ...data }
  if (data.endDate) {
    const endDate = data.endDate instanceof Date
      ? data.endDate
      : typeof data.endDate === 'string'
        ? new Date(data.endDate)
        : toDate(data.endDate)
    updateData.endDate = Timestamp.fromDate(endDate)
  }
  await updateDoc(doc(requireDb(), 'memberships', membershipId), updateData)
}

export async function updateMembershipStatus(
  subscriptionId: string,
  status: Membership['status']
): Promise<void> {
  const membership = await getMembershipBySubscriptionId(subscriptionId)
  if (membership) {
    await updateMembership(membership.id, { status })
  }
}

// Contact operations
export async function createContactSubmission(
  submission: Omit<ContactSubmission, 'id' | 'createdAt'>
): Promise<string> {
  const contactRef = doc(collection(requireDb(), 'contacts'))
  await setDoc(contactRef, {
    ...submission,
    id: contactRef.id,
    createdAt: Timestamp.now(),
  })
  return contactRef.id
}

