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
import type { UserProfile, Donation, Membership, ContactSubmission, Purchase, Product, UserRole, News, CartItem } from '@/types'

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

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(requireDb(), 'users'))
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return { ...data, uid: doc.id, createdAt: toDate(data.createdAt) } as UserProfile
  })
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await setDoc(doc(requireDb(), 'users', userId), { role }, { merge: true })
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
    // Convert createdAt to Timestamp if it's a Date object
    const membershipData = {
      ...membership,
      id: membershipRef.id,
      createdAt: membership.createdAt instanceof Date
        ? Timestamp.fromDate(membership.createdAt)
        : membership.createdAt instanceof Timestamp
          ? membership.createdAt
          : Timestamp.now(),
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
      orderBy('createdAt', 'desc'),
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
      createdAt: toDate(data.createdAt),
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
          createdAt: toDate(doc.data().createdAt),
        })) as Membership[]

        docs.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime()
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime()
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

export async function getMembershipByPaymentIntentId(
  paymentIntentId: string
): Promise<Membership | null> {
  if (!db) return null

  const q = query(
    collection(db, 'memberships'),
    where('stripePaymentIntentId', '==', paymentIntentId),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const data = snapshot.docs[0].data()
  return {
    ...data,
    createdAt: toDate(data.createdAt),
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
  paymentIntentId: string,
  status: Membership['status']
): Promise<void> {
  const membership = await getMembershipByPaymentIntentId(paymentIntentId)
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

// Purchase operations
export async function createPurchase(purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<string> {
  const db = requireDb()
  const purchaseRef = doc(collection(db, 'purchases'))
  try {
    const purchaseData = {
      userId: purchase.userId || '',
      productId: purchase.productId,
      productName: purchase.productName,
      amount: purchase.amount,
      currency: purchase.currency || 'usd',
      status: purchase.status,
      stripePaymentIntentId: purchase.stripePaymentIntentId,
      description: purchase.description || null,
      id: purchaseRef.id,
      createdAt: Timestamp.now(),
    }

    await setDoc(purchaseRef, purchaseData)
    console.log('Purchase created successfully:', purchaseRef.id, purchaseData)
    return purchaseRef.id
  } catch (error: any) {
    console.error('Error in createPurchase:', {
      error,
      code: error?.code,
      message: error?.message,
      purchase,
      firestoreError: error?.code === 'permission-denied' ? 'Check Firestore rules' : undefined,
    })
    throw error
  }
}

export async function getPurchasesByUser(userId: string): Promise<Purchase[]> {
  if (!db) {
    console.warn('Firestore not initialized')
    return []
  }

  try {
    // Try composite index query first
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        createdAt: toDate(data.createdAt),
      } as Purchase
    })
  } catch (error: any) {
    // Fallback if composite index is not ready
    if (error?.code === 'failed-precondition') {
      console.warn('Composite index not ready, using fallback query')
      try {
        const q = query(
          collection(db, 'purchases'),
          where('userId', '==', userId)
        )
        const snapshot = await getDocs(q)
        const purchases = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...data,
            createdAt: toDate(data.createdAt),
          } as Purchase
        })
        // Sort in memory
        return purchases.sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
          const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
          return bDate - aDate
        })
      } catch (fallbackError: any) {
        console.error('Error in fallback query:', fallbackError)
        throw fallbackError
      }
    }

    console.error('Error in getPurchasesByUser:', {
      error,
      code: error?.code,
      message: error?.message,
      userId,
    })
    throw error
  }
}

export async function getPurchaseById(purchaseId: string): Promise<Purchase | null> {
  const purchaseDoc = await getDoc(doc(requireDb(), 'purchases', purchaseId))
  if (!purchaseDoc.exists()) return null

  const data = purchaseDoc.data()
  return { ...data, createdAt: toDate(data.createdAt) } as Purchase
}

export async function updatePurchaseStatus(
  purchaseId: string,
  status: Purchase['status']
): Promise<void> {
  await updateDoc(doc(requireDb(), 'purchases', purchaseId), { status })
}

// Product operations
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = requireDb()
  const productRef = doc(collection(db, 'products'))
  try {
    const productData = {
      ...product,
      id: productRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await setDoc(productRef, productData)
    console.log('Product created successfully:', productRef.id)
    return productRef.id
  } catch (error: any) {
    console.error('Error in createProduct:', {
      error,
      code: error?.code,
      message: error?.message,
      product,
    })
    throw error
  }
}

export async function getProducts(activeOnly: boolean = false): Promise<Product[]> {
  if (!db) {
    console.warn('Firestore not initialized')
    return []
  }

  try {
    let q
    if (activeOnly) {
      q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      )
    } else {
      q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      )
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as Product
    })
  } catch (error: any) {
    // Fallback if composite index is not ready
    if (error?.code === 'failed-precondition') {
      console.warn('Composite index not ready, using fallback query')
      try {
        const q = query(collection(db, 'products'))
        const snapshot = await getDocs(q)
        const products = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          } as Product
        })
        // Filter and sort in memory
        const filtered = activeOnly ? products.filter(p => p.isActive) : products
        return filtered.sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
          const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
          return bDate - aDate
        })
      } catch (fallbackError: any) {
        console.error('Error in fallback query:', fallbackError)
        throw fallbackError
      }
    }

    console.error('Error in getProducts:', {
      error,
      code: error?.code,
      message: error?.message,
    })
    throw error
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  const productDoc = await getDoc(doc(requireDb(), 'products', productId))
  if (!productDoc.exists()) return null

  const data = productDoc.data()
  return {
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as Product
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  const updateData: any = { ...data, updatedAt: Timestamp.now() }
  await updateDoc(doc(requireDb(), 'products', productId), updateData)
}

export async function updateProductStock(productId: string, quantity: number): Promise<void> {
  await updateDoc(doc(requireDb(), 'products', productId), {
    stock: quantity,
    updatedAt: Timestamp.now(),
  })
}

export async function decrementProductStock(productId: string, amount: number = 1): Promise<void> {
  const productRef = doc(requireDb(), 'products', productId)
  const productDoc = await getDoc(productRef)
  
  if (!productDoc.exists()) {
    throw new Error(`Product ${productId} not found`)
  }

  const currentStock = productDoc.data().stock || 0
  const newStock = Math.max(0, currentStock - amount)

  await updateDoc(productRef, {
    stock: newStock,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteProduct(productId: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'products', productId), {
    isActive: false,
    updatedAt: Timestamp.now(),
  })
}

export async function getLowStockProducts(threshold?: number): Promise<Product[]> {
  if (!db) {
    console.warn('Firestore not initialized')
    return []
  }

  try {
    const products = await getProducts(false)
    const defaultThreshold = threshold || 10
    return products.filter(
      (product) => product.isActive && product.stock <= defaultThreshold && product.stock > 0
    )
  } catch (error: any) {
    console.error('Error in getLowStockProducts:', error)
    return []
  }
}

// News functions
export async function createNews(news: Omit<News, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const newsRef = doc(collection(requireDb(), 'news'))
  
  // Remove undefined fields to avoid Firestore errors
  const cleanNews: any = {}
  if (news.title !== undefined) cleanNews.title = news.title
  if (news.description !== undefined) cleanNews.description = news.description
  if (news.content !== undefined && news.content !== '') cleanNews.content = news.content
  if (news.image !== undefined && news.image !== '') cleanNews.image = news.image
  if (news.author !== undefined && news.author !== '') cleanNews.author = news.author
  if (news.category !== undefined) cleanNews.category = news.category
  if (news.isPublished !== undefined) cleanNews.isPublished = news.isPublished
  
  const newsData = {
    ...cleanNews,
    id: newsRef.id,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    publishedAt: news.isPublished ? Timestamp.now() : null,
  }
  await setDoc(newsRef, newsData)
  return newsRef.id
}

export async function getNews(publishedOnly: boolean = true): Promise<News[]> {
  if (!db) {
    console.warn('Firestore not initialized')
    return []
  }

  try {
    let q = query(collection(requireDb(), 'news'), orderBy('createdAt', 'desc'))
    
    if (publishedOnly) {
      q = query(q, where('isPublished', '==', true))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        publishedAt: data.publishedAt ? toDate(data.publishedAt) : undefined,
      } as News
    })
  } catch (error: any) {
    console.error('Error fetching news:', error)
    // Fallback: try without published filter if composite index not ready
    if (publishedOnly && error.code === 'failed-precondition') {
      try {
        const snapshot = await getDocs(query(collection(requireDb(), 'news'), orderBy('createdAt', 'desc')))
        return snapshot.docs
          .map((doc) => {
            const data = doc.data()
            return {
              ...data,
              id: doc.id,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
              publishedAt: data.publishedAt ? toDate(data.publishedAt) : undefined,
            } as News
          })
          .filter((news) => news.isPublished)
      } catch (fallbackError: any) {
        console.error('Error in fallback news query:', fallbackError)
        return []
      }
    }
    return []
  }
}

export async function getNewsById(newsId: string): Promise<News | null> {
  const newsDoc = await getDoc(doc(requireDb(), 'news', newsId))
  if (!newsDoc.exists()) return null

  const data = newsDoc.data()
  return {
    ...data,
    id: newsDoc.id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    publishedAt: data.publishedAt ? toDate(data.publishedAt) : undefined,
  } as News
}

export async function updateNews(newsId: string, data: Partial<News>): Promise<void> {
  // Remove undefined fields to avoid Firestore errors
  const updateData: any = { updatedAt: Timestamp.now() }
  
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.content !== undefined) {
    // Only include content if it's not empty, or explicitly set to empty string to clear it
    if (data.content !== '') {
      updateData.content = data.content
    } else {
      // To remove a field, we need to use deleteField() or set to null
      updateData.content = null
    }
  }
  if (data.image !== undefined) {
    if (data.image !== '') {
      updateData.image = data.image
    } else {
      updateData.image = null
    }
  }
  if (data.author !== undefined) {
    if (data.author !== '') {
      updateData.author = data.author
    } else {
      updateData.author = null
    }
  }
  if (data.category !== undefined) updateData.category = data.category
  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished
    
    // If publishing for the first time, set publishedAt
    if (data.isPublished === true) {
      const existingNews = await getNewsById(newsId)
      if (existingNews && !existingNews.isPublished) {
        updateData.publishedAt = Timestamp.now()
      }
    }
  }
  
  await updateDoc(doc(requireDb(), 'news', newsId), updateData)
}

export async function deleteNews(newsId: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'news', newsId), { isPublished: false })
  // Or use deleteDoc if you want to permanently delete:
  // await deleteDoc(doc(requireDb(), 'news', newsId))
}

// Cart operations
export async function saveUserCart(userId: string, cartItems: CartItem[]): Promise<void> {
  const cartData = {
    items: cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      // Store minimal product data for reference
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        description: item.product.description,
        stock: item.product.stock,
        lowStockThreshold: item.product.lowStockThreshold,
        isActive: item.product.isActive,
      },
    })),
    updatedAt: Timestamp.now(),
  }
  
  await setDoc(doc(requireDb(), 'carts', userId), cartData, { merge: true })
}

export async function getUserCart(userId: string): Promise<CartItem[]> {
  try {
    const cartDoc = await getDoc(doc(requireDb(), 'carts', userId))
    if (!cartDoc.exists()) return []
    
    const cartData = cartDoc.data()
    const items = cartData.items || []
    
    // Fetch full product data for each cart item
    const cartItems: CartItem[] = []
    for (const item of items) {
      try {
        const productDoc = await getDoc(doc(requireDb(), 'products', item.productId))
        if (productDoc.exists()) {
          const productData = productDoc.data()
          cartItems.push({
            productId: item.productId,
            product: {
              id: productData.id || productDoc.id,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              image: productData.image,
              stock: productData.stock,
              lowStockThreshold: productData.lowStockThreshold,
              isActive: productData.isActive,
              createdAt: toDate(productData.createdAt),
              updatedAt: toDate(productData.updatedAt),
            },
            quantity: item.quantity,
          })
        }
      } catch (error) {
        console.error(`Error loading product ${item.productId}:`, error)
      }
    }
    
    return cartItems
  } catch (error) {
    console.error('Error loading user cart:', error)
    return []
  }
}

export async function clearUserCart(userId: string): Promise<void> {
  await setDoc(doc(requireDb(), 'carts', userId), { items: [], updatedAt: Timestamp.now() }, { merge: true })
}

