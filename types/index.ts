import { Timestamp } from 'firebase/firestore'

export type UserRole = 'supporter' | 'member' | 'moderator' | 'admin'
export type MembershipTier = 'free' | 'basic' | 'premium' | 'champion'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

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
  stripePaymentIntentId: string
  status: PaymentStatus
  createdAt: Timestamp | Date
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  createdAt: Timestamp | Date
  userId?: string
}

export interface Purchase {
  id: string
  userId: string
  productId: string
  productName: string
  amount: number
  currency: string
  status: PaymentStatus
  shipmentStatus?: ShipmentStatus
  trackingNumber?: string
  stripePaymentIntentId: string
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
  description?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  lowStockThreshold: number
  isActive: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export type NewsCategory = 'announcement' | 'event' | 'update' | 'general'

export interface News {
  id: string
  title: string
  description: string
  content?: string
  image?: string
  author?: string
  category?: NewsCategory
  isPublished: boolean
  publishedAt?: Timestamp | Date
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
}

export type VolunteerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface VolunteerApplication {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  dateOfBirth?: string
  gender?: string
  availability: string
  skills: string[]
  experience: string
  motivation: string
  references?: string
  status: VolunteerApplicationStatus
  notes?: string
  reviewedBy?: string
  reviewedAt?: Timestamp | Date
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface PetitionSignature {
  userId?: string
  name: string
  email: string
  signedAt: Timestamp | Date
  anonymous?: boolean
}

export interface Petition {
  id: string
  title: string
  description: string
  content?: string
  image?: string
  goal: number
  currentSignatures: number
  signatures: PetitionSignature[]
  isActive: boolean
  isPublished: boolean
  createdBy: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  publishedAt?: Timestamp | Date
  expiresAt?: Timestamp | Date
}

export interface NewsletterSubscription {
  id: string
  email: string
  userId?: string
  subscribed: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface Banner {
  id: string
  imageUrl: string
  title?: string
  isActive: boolean
  order: number
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

// Ensure this file is treated as a module
export { }

