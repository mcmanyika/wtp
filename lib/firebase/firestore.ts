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
  const db = requireDb()
  const donationRef = doc(collection(db, 'donations'))
  try {
    // Ensure all required fields are present and valid
    const donationData = {
      userId: donation.userId || '',
      amount: donation.amount,
      currency: donation.currency || 'usd',
      status: donation.status,
      stripePaymentIntentId: donation.stripePaymentIntentId,
      description: donation.description || null, // Use null instead of undefined for Firestore
      id: donationRef.id,
      createdAt: Timestamp.now(),
    }

    await setDoc(donationRef, donationData)
    console.log('Donation created successfully:', donationRef.id, donationData)
    return donationRef.id
  } catch (error: any) {
    console.error('Error in createDonation:', {
      error,
      code: error?.code,
      message: error?.message,
      donation,
      firestoreError: error?.code === 'permission-denied' ? 'Check Firestore rules' : undefined,
    })
    throw error
  }
}

export async function getDonationsByUser(userId: string): Promise<Donation[]> {
  if (!db) {
    console.warn('Firestore not initialized')
    return []
  }

  try {
    // Try query with orderBy first (requires composite index)
    const q = query(
      collection(db, 'donations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    const snapshot = await getDocs(q)
    const donations = snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
    })) as Donation[]

    // Sort by createdAt in case index isn't ready (fallback)
    donations.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime()
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime()
      return dateB - dateA // Descending order
    })

    console.log(`Found ${donations.length} donations for user ${userId}`)
    return donations
  } catch (error: any) {
    // If index error, try without orderBy
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn('Composite index not ready, trying query without orderBy:', error)
      try {
        const q = query(
          collection(db, 'donations'),
          where('userId', '==', userId),
          limit(50)
        )
        const snapshot = await getDocs(q)
        const donations = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt),
        })) as Donation[]

        // Sort manually
        donations.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime()
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime()
          return dateB - dateA // Descending order
        })

        console.log(`Found ${donations.length} donations for user ${userId} (without index)`)
        return donations
      } catch (fallbackError: any) {
        console.error('Error in fallback query:', fallbackError)
        throw fallbackError
      }
    }

    console.error('Error in getDonationsByUser:', {
      error,
      code: error?.code,
      message: error?.message,
      userId,
    })
    throw error
  }
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
  const db = requireDb()
  const membershipRef = doc(collection(db, 'memberships'))

  try {
    // Convert startDate and endDate to Timestamp if they're Date objects
    const membershipData = {
      ...membership,
      id: membershipRef.id,
      startDate: membership.startDate instanceof Date
        ? Timestamp.fromDate(membership.startDate)
        : membership.startDate instanceof Timestamp
          ? membership.startDate
          : Timestamp.now(),
      endDate: membership.endDate instanceof Date
        ? Timestamp.fromDate(membership.endDate)
        : membership.endDate instanceof Timestamp
          ? membership.endDate
          : undefined,
    }

    await setDoc(membershipRef, membershipData)
    console.log('Membership created successfully:', membershipRef.id, membershipData)
    return membershipRef.id
  } catch (error: any) {
    console.error('Error in createMembership:', {
      error,
      code: error?.code,
      message: error?.message,
      membership,
      firestoreError: error?.code === 'permission-denied' ? 'Check Firestore rules' : undefined,
    })
    throw error
  }
}

export async function getMembershipByUser(userId: string): Promise<Membership | null> {
  if (!db) {
    console.warn('Firestore not initialized')
    return null
  }

  try {
    // Try query with orderBy first (requires composite index)
    const q = query(
      collection(db, 'memberships'),
      where('userId', '==', userId),
      orderBy('startDate', 'desc'),
      limit(1)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      console.log(`No membership found for user ${userId}`)
      return null
    }

    const data = snapshot.docs[0].data()
    const membership = {
      ...data,
      startDate: toDate(data.startDate),
      endDate: data.endDate ? toDate(data.endDate) : undefined,
    } as Membership
    console.log(`Found membership for user ${userId}:`, membership)
    return membership
  } catch (error: any) {
    // If index error, try without orderBy
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn('Composite index not ready, trying query without orderBy:', error)
      try {
        const q = query(
          collection(db, 'memberships'),
          where('userId', '==', userId),
          limit(1)
        )
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          console.log(`No membership found for user ${userId} (without index)`)
          return null
        }

        // Sort manually
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          startDate: toDate(doc.data().startDate),
          endDate: doc.data().endDate ? toDate(doc.data().endDate) : undefined,
        })) as Membership[]

        docs.sort((a, b) => {
          const dateA = a.startDate instanceof Date ? a.startDate.getTime() : new Date(a.startDate as any).getTime()
          const dateB = b.startDate instanceof Date ? b.startDate.getTime() : new Date(b.startDate as any).getTime()
          return dateB - dateA // Descending order
        })

        const membership = docs[0]
        console.log(`Found membership for user ${userId} (without index):`, membership)
        return membership
      } catch (fallbackError: any) {
        console.error('Error in fallback membership query:', fallbackError)
        throw fallbackError
      }
    }

    console.error('Error in getMembershipByUser:', {
      error,
      code: error?.code,
      message: error?.message,
      userId,
    })
    throw error
  }
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

