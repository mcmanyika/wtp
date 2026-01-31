import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { createDonation, createMembership } from '@/lib/firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { amount, userId, type, tier, description } = await request.json()

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Amount and type are required' },
        { status: 400 }
      )
    }

    let customerId: string | undefined
    if (userId && db) {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (userData.stripeCustomerId) {
          customerId = userData.stripeCustomerId
        } else {
          // Create Stripe customer
          const customer = await stripe.customers.create({
            email: userData.email,
            metadata: { userId },
          })
          customerId = customer.id
          await setDoc(doc(db, 'users', userId), {
            stripeCustomerId: customer.id,
          }, { merge: true })
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (type === 'donation') {
      // One-time donation
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation to Defend the Constitution Platform',
                description: description || 'Support our mission to oppose ED 2030 agenda',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        metadata: {
          userId: userId || '',
          type: 'donation',
        },
      })

      return NextResponse.json({ sessionId: session.id })
    } else if (type === 'membership') {
      // Recurring membership subscription
      if (!tier) {
        return NextResponse.json(
          { error: 'Membership tier is required' },
          { status: 400 }
        )
      }

      // Define membership prices (in dollars per month)
      const tierPrices: Record<string, number> = {
        basic: 10,
        premium: 25,
        champion: 50,
      }

      const priceId = process.env[`STRIPE_PRICE_ID_${tier.toUpperCase()}`]
      let lineItem: any

      if (priceId) {
        // Use existing price ID if configured
        lineItem = {
          price: priceId,
          quantity: 1,
        }
      } else {
        // Create price on the fly
        lineItem = {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Membership`,
              description: `Defend the Constitution Platform - ${tier} tier membership`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: Math.round(tierPrices[tier] * 100),
          },
          quantity: 1,
        }
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [lineItem],
        mode: 'subscription',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        metadata: {
          userId: userId || '',
          type: 'membership',
          tier,
        },
      })

      return NextResponse.json({ sessionId: session.id })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

