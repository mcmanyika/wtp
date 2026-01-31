import { Timestamp } from 'firebase/firestore'

export type UserRole = 'supporter' | 'member' | 'moderator' | 'admin'
export type MembershipTier = 'free' | 'basic' | 'premium' | 'champion'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

export interface UserProfile {
  uid: string
  email: string
  name?: string
  membershipTier: MembershipTier
  role: UserRole
  createdAt: Timestamp | Date
  emailVerified: boolean
  stripeCustomerId?: string
  photoURL?: string
}

export interface Donation {
  id: string
  userId: string
  amount: number
  currency: string
  status: PaymentStatus
  stripePaymentIntentId: string
  createdAt: Timestamp | Date
  description?: string
}

export interface Membership {
  id: string
  userId: string
  tier: MembershipTier
  stripeSubscriptionId?: string
  status: SubscriptionStatus
  startDate: Timestamp | Date
  endDate?: Timestamp | Date
  cancelAtPeriodEnd?: boolean
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  createdAt: Timestamp | Date
  userId?: string
}

