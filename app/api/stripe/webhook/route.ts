import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  createDonation,
  updateDonationStatus,
  createMembership,
  updateMembershipStatus,
  updateMembership,
  getMembershipBySubscriptionId,
} from '@/lib/firebase/firestore'
import { Timestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId

        if (session.mode === 'payment') {
          // One-time donation
          const donation = {
            userId: userId || '',
            amount: session.amount_total! / 100,
            currency: session.currency,
            status: 'succeeded' as const,
            stripePaymentIntentId: session.payment_intent,
            description: session.metadata?.description,
          }

          await createDonation(donation)

          // Update user's total donations if userId exists
          if (userId) {
            // This could be tracked in a separate field if needed
            console.log(`Donation recorded for user ${userId}`)
          }
        } else if (session.mode === 'subscription') {
          // Subscription membership
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const membership = {
            userId: userId || '',
            tier: (session.metadata?.tier || 'basic') as any,
            stripeSubscriptionId: subscription.id,
            status: subscription.status as any,
            startDate: new Date(subscription.current_period_start * 1000),
            endDate: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }

          await createMembership(membership)

          // Update user's membership tier
          if (userId && db) {
            await setDoc(doc(db, 'users', userId), {
              membershipTier: session.metadata?.tier || 'basic',
            }, { merge: true })
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        // Payment succeeded - donation status already updated in checkout.session.completed
        console.log(`Payment succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        // Find and update donation status
        // This would require querying donations by payment_intent_id
        console.log(`Payment failed: ${paymentIntent.id}`)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const membership = await getMembershipBySubscriptionId(subscription.id)

        if (membership) {
          await updateMembership(membership.id, {
            status: subscription.status as any,
            endDate: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : undefined,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          })

          // If subscription is canceled, update user's membership tier
          if (subscription.status === 'canceled' && membership.userId && db) {
            await setDoc(doc(db, 'users', membership.userId), {
              membershipTier: 'free',
            }, { merge: true })
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        if (invoice.subscription) {
          // Subscription payment succeeded
          const membership = await getMembershipBySubscriptionId(invoice.subscription)
          if (membership) {
            await updateMembership(membership.id, {
              status: 'active',
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        if (invoice.subscription) {
          // Subscription payment failed
          const membership = await getMembershipBySubscriptionId(invoice.subscription)
          if (membership) {
            await updateMembership(membership.id, {
              status: 'past_due',
            })
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

