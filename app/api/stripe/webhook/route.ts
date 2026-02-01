import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { doc, setDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  createDonation,
  updateDonationStatus,
  createMembership,
  updateMembershipStatus,
  updateMembership,
  getMembershipBySubscriptionId,
  createPurchase,
  updatePurchaseStatus,
  decrementProductStock,
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
    console.log(`Webhook received: ${event.type}`)
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        
        console.log(`Checkout session completed: mode=${session.mode}, userId=${userId}`)

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
          console.log(`Processing subscription membership for user ${userId}`)
          
          try {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )
            
            console.log(`Retrieved subscription: ${subscription.id}, status: ${subscription.status}`)

            const membership = {
              userId: userId || '',
              tier: (session.metadata?.tier || 'basic') as any,
              stripeSubscriptionId: subscription.id,
              status: subscription.status as any,
              startDate: new Date(subscription.current_period_start * 1000),
              endDate: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }

            console.log(`Attempting to create membership with data:`, membership)
            
            // Try direct write first (works with unauthenticated rules)
            if (db) {
              try {
                const membershipRef = doc(collection(db, 'memberships'))
                await setDoc(membershipRef, {
                  userId: userId || '',
                  tier: session.metadata?.tier || 'basic',
                  stripeSubscriptionId: subscription.id,
                  status: subscription.status,
                  startDate: Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
                  endDate: Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                  id: membershipRef.id,
                })
                console.log(`✅ Membership created directly in Firestore: ${membershipRef.id}`)
              } catch (directError: any) {
                console.error('❌ Error creating membership directly:', {
                  code: directError?.code,
                  message: directError?.message,
                  error: directError,
                })
                // Fallback to createMembership function
                try {
                  await createMembership(membership)
                  console.log(`✅ Membership created via createMembership: ${subscription.id}`)
                } catch (createError: any) {
                  console.error('❌ Error creating membership via createMembership:', {
                    code: createError?.code,
                    message: createError?.message,
                    error: createError,
                  })
                  throw createError
                }
              }
            } else {
              console.warn('⚠️ Firestore db is not initialized, trying createMembership')
              await createMembership(membership)
              console.log(`✅ Membership created via createMembership: ${subscription.id}`)
            }

            // Update user's membership tier
            if (userId && db) {
              try {
                await setDoc(doc(db, 'users', userId), {
                  membershipTier: session.metadata?.tier || 'basic',
                }, { merge: true })
                console.log(`✅ Updated user membership tier: ${userId}`)
              } catch (userUpdateError: any) {
                console.error('⚠️ Error updating user membership tier (non-critical):', userUpdateError)
                // Continue even if user update fails
              }
            }
          } catch (membershipError: any) {
            console.error('❌ Fatal error creating membership:', {
              code: membershipError?.code,
              message: membershipError?.message,
              error: membershipError,
              userId,
              subscriptionId: session.subscription,
            })
            // Re-throw to ensure webhook returns error status
            throw membershipError
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        const userId = paymentIntent.metadata?.userId
        const type = paymentIntent.metadata?.type

        if (type === 'donation') {
          try {
            const donation = {
              userId: userId || '',
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'succeeded' as const,
              stripePaymentIntentId: paymentIntent.id,
              description: paymentIntent.metadata?.description,
            }

            await createDonation(donation)
            console.log(`Donation recorded: ${paymentIntent.id}`)
          } catch (error: any) {
            console.error('Error creating donation in webhook:', error)
            // Try to create directly if createDonation fails
            if (db) {
              try {
                const donationRef = doc(collection(db, 'donations'))
                await setDoc(donationRef, {
                  userId: userId || '',
                  amount: paymentIntent.amount / 100,
                  currency: paymentIntent.currency,
                  status: 'succeeded',
                  stripePaymentIntentId: paymentIntent.id,
                  description: paymentIntent.metadata?.description || '',
                  id: donationRef.id,
                  createdAt: Timestamp.now(),
                })
                console.log(`Donation created directly: ${donationRef.id}`)
              } catch (directError: any) {
                console.error('Error creating donation directly:', directError)
              }
            }
          }
        } else if (type === 'purchase') {
          try {
            const purchase = {
              userId: userId || '',
              productId: paymentIntent.metadata?.productId || '',
              productName: paymentIntent.metadata?.productName || paymentIntent.metadata?.description?.replace('Purchase: ', '') || '',
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'succeeded' as const,
              stripePaymentIntentId: paymentIntent.id,
              description: paymentIntent.metadata?.description,
            }

            await createPurchase(purchase)
            console.log(`Purchase recorded: ${paymentIntent.id}`)

            // Decrement product stock
            const productId = paymentIntent.metadata?.productId
            if (productId) {
              try {
                await decrementProductStock(productId, 1)
                console.log(`Stock decremented for product: ${productId}`)
              } catch (stockError: any) {
                console.error('Error decrementing product stock:', stockError)
                // Don't fail the webhook if stock decrement fails - log it for manual review
              }
            }
          } catch (error: any) {
            console.error('Error creating purchase in webhook:', error)
            // Try to create directly if createPurchase fails
            if (db) {
              try {
                const purchaseRef = doc(collection(db, 'purchases'))
                await setDoc(purchaseRef, {
                  userId: userId || '',
                  productId: paymentIntent.metadata?.productId || '',
                  productName: paymentIntent.metadata?.productName || paymentIntent.metadata?.description?.replace('Purchase: ', '') || '',
                  amount: paymentIntent.amount / 100,
                  currency: paymentIntent.currency,
                  status: 'succeeded',
                  stripePaymentIntentId: paymentIntent.id,
                  description: paymentIntent.metadata?.description || '',
                  id: purchaseRef.id,
                  createdAt: Timestamp.now(),
                })
                console.log(`Purchase created directly: ${purchaseRef.id}`)

                // Try to decrement stock even if purchase creation had issues
                const productId = paymentIntent.metadata?.productId
                if (productId) {
                  try {
                    await decrementProductStock(productId, 1)
                    console.log(`Stock decremented for product: ${productId}`)
                  } catch (stockError: any) {
                    console.error('Error decrementing product stock:', stockError)
                  }
                }
              } catch (directError: any) {
                console.error('Error creating purchase directly:', directError)
              }
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        const userId = paymentIntent.metadata?.userId
        const type = paymentIntent.metadata?.type

        if (type === 'donation') {
          // Create donation record with failed status
          const donation = {
            userId: userId || '',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'failed' as const,
            stripePaymentIntentId: paymentIntent.id,
            description: paymentIntent.metadata?.description,
          }

          await createDonation(donation)
          console.log(`Donation failed: ${paymentIntent.id}`)
        } else if (type === 'purchase') {
          // Create purchase record with failed status
          const purchase = {
            userId: userId || '',
            productId: paymentIntent.metadata?.productId || '',
            productName: paymentIntent.metadata?.productName || paymentIntent.metadata?.description?.replace('Purchase: ', '') || '',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'failed' as const,
            stripePaymentIntentId: paymentIntent.id,
            description: paymentIntent.metadata?.description,
          }

          await createPurchase(purchase)
          console.log(`Purchase failed: ${paymentIntent.id}`)
        }
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

