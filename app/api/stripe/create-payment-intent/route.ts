import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, userId, userEmail, userName, type, description } = await request.json()

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Amount and type are required' },
        { status: 400 }
      )
    }

    let customerId: string | undefined
    let customerEmail: string | undefined = userEmail
    let customerName: string | undefined = userName

    // Auto-capture user information - create Stripe customer
    // Note: We use userEmail/userName from client since API routes don't have Firebase auth context
    // We don't try to read/write Firestore here since API routes don't have auth context
    // The customer will be created in Stripe and can be linked to Firestore later via webhook or client-side
    if (userId && customerEmail) {
      // Always create a new Stripe customer (Stripe handles duplicates by email)
      // This ensures we have customer info for the payment intent
      try {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: { userId },
        })
        customerId = customer.id
      } catch (error: any) {
        // If customer creation fails (e.g., duplicate), try to retrieve existing
        if (error.code === 'resource_already_exists') {
          // Try to find existing customer by email
          const customers = await stripe.customers.list({
            email: customerEmail,
            limit: 1,
          })
          if (customers.data.length > 0) {
            customerId = customers.data[0].id
          }
        } else {
          console.warn('Could not create/retrieve Stripe customer:', error)
        }
      }
    }

    // Create Payment Intent with auto-captured customer info
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId || '',
        type: type,
        description: description || '',
      },
      receipt_email: customerEmail,
      description: description || `Payment for ${type}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

