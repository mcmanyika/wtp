import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentIntentId = searchParams.get('payment_intent')

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return NextResponse.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      amount_total: paymentIntent.amount, // For compatibility
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      status: paymentIntent.status,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}

