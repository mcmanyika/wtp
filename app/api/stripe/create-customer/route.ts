import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Firebase is not initialized' },
        { status: 500 }
      )
    }

    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()

    // Check if customer already exists
    if (userData.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(userData.stripeCustomerId)
      return NextResponse.json({ customerId: customer.id })
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userData.email,
      name: userData.name,
      metadata: { userId },
    })

    // Save customer ID to Firestore
    await setDoc(doc(db, 'users', userId), {
      stripeCustomerId: customer.id,
    }, { merge: true })

    return NextResponse.json({ customerId: customer.id })
  } catch (error: any) {
    console.error('Error creating Stripe customer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    )
  }
}

