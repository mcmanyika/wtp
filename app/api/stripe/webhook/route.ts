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
  getMembershipByPaymentIntentId,
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
          const type = session.metadata?.type
          
          if (type === 'donation') {
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
          } else if (type === 'membership') {
            // One-time membership payment
            console.log(`Processing membership payment for user ${userId}`)

            if (!session.payment_intent) {
              console.error('❌ No payment intent ID in checkout session')
              break
            }

            try {
              const membership = {
                userId: userId || '',
                tier: (session.metadata?.tier || 'basic') as any,
                stripePaymentIntentId: session.payment_intent,
                status: 'succeeded' as const,
              }

              console.log(`Attempting to create membership with data:`, membership)

              // Use createMembership function (consistent with donations approach)
              try {
                const membershipId = await createMembership(membership)
                console.log(`✅ Membership created via createMembership: ${membershipId} for payment intent ${session.payment_intent}`)
              } catch (createError: any) {
                console.error('❌ Error creating membership via createMembership:', {
                  code: createError?.code,
                  message: createError?.message,
                  error: createError,
                })
                // Fallback to direct write if createMembership fails
                if (db) {
                  try {
                    const membershipRef = doc(collection(db, 'memberships'))
                    await setDoc(membershipRef, {
                      userId: userId || '',
                      tier: session.metadata?.tier || 'basic',
                      stripePaymentIntentId: session.payment_intent,
                      status: 'succeeded',
                      id: membershipRef.id,
                      createdAt: Timestamp.now(),
                    })
                    console.log(`✅ Membership created directly in Firestore: ${membershipRef.id}`)
                  } catch (directError: any) {
                    console.error('❌ Error creating membership directly:', {
                      code: directError?.code,
                      message: directError?.message,
                      error: directError,
                    })
                    throw createError // Throw original error
                  }
                } else {
                  throw createError
                }
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
                paymentIntentId: session.payment_intent,
              })
              // Re-throw to ensure webhook returns error status
              throw membershipError
            }
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        const userId = paymentIntent.metadata?.userId
        const type = paymentIntent.metadata?.type

        if (type === 'membership') {
          // Membership payment (backup handler in case checkout.session.completed fails)
          try {
            console.log(`Processing membership payment intent: ${paymentIntent.id} for user ${userId}`)

            // Check if membership already exists
            const existingMembership = await getMembershipByPaymentIntentId(paymentIntent.id)
            if (existingMembership) {
              console.log(`⚠️ Membership already exists for payment intent ${paymentIntent.id}, skipping creation`)
              // Still update user tier
              if (userId && db) {
                try {
                  await setDoc(doc(db, 'users', userId), {
                    membershipTier: paymentIntent.metadata?.tier || 'basic',
                  }, { merge: true })
                  console.log(`✅ Updated user membership tier: ${userId}`)
                } catch (userUpdateError: any) {
                  console.error('⚠️ Error updating user membership tier (non-critical):', userUpdateError)
                }
              }
              break
            }

            const membership = {
              userId: userId || '',
              tier: (paymentIntent.metadata?.tier || 'basic') as any,
              stripePaymentIntentId: paymentIntent.id,
              status: 'succeeded' as const,
            }

            await createMembership(membership)
            console.log(`✅ Membership created from payment_intent.succeeded: ${paymentIntent.id}`)

            // Update user's membership tier
            if (userId && db) {
              try {
                await setDoc(doc(db, 'users', userId), {
                  membershipTier: paymentIntent.metadata?.tier || 'basic',
                }, { merge: true })
                console.log(`✅ Updated user membership tier: ${userId}`)
              } catch (userUpdateError: any) {
                console.error('⚠️ Error updating user membership tier:', userUpdateError)
              }
            }
          } catch (error: any) {
            console.error('❌ Error creating membership from payment_intent.succeeded:', {
              code: error?.code,
              message: error?.message,
              error,
            })
            // Don't throw - this is a backup handler
          }
        } else if (type === 'donation') {
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
            // Check if this is a cart purchase (multiple items)
            const cartItemsStr = paymentIntent.metadata?.cartItems
            if (cartItemsStr) {
              // Handle multiple items from cart
              const cartItems = JSON.parse(cartItemsStr)

              for (const item of cartItems) {
                // Create purchase record for each item
                const purchase = {
                  userId: userId || '',
                  productId: item.productId,
                  productName: item.productName,
                  amount: item.price * item.quantity,
                  currency: paymentIntent.currency,
                  status: 'succeeded' as const,
                  stripePaymentIntentId: paymentIntent.id,
                  description: `${item.productName} x${item.quantity}`,
                }

                await createPurchase(purchase)
                console.log(`Purchase recorded for ${item.productName}: ${paymentIntent.id}`)

                // Decrement product stock for each item
                try {
                  await decrementProductStock(item.productId, item.quantity)
                  console.log(`Stock decremented for product ${item.productId}: -${item.quantity}`)
                } catch (stockError: any) {
                  console.error(`Error decrementing stock for product ${item.productId}:`, stockError)
                }
              }
            } else {
              // Handle single item purchase (backward compatibility)
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

