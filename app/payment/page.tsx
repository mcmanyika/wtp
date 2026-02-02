'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe/config'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { getProductById, createPurchase, decrementProductStock } from '@/lib/firebase/firestore'
import type { Product } from '@/types'
import Link from 'next/link'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(true)
  const [cartItems, setCartItems] = useState<Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    image: string
  }>>([])
  const clientSecret = searchParams.get('client_secret')
  const productName = searchParams.get('product') || 'Purchase'
  const productId = searchParams.get('productId')

  useEffect(() => {
    if (!clientSecret) {
      router.push('/')
    }
  }, [clientSecret, router])

  // Load cart items or product details
  useEffect(() => {
    const loadData = async () => {
      // Check sessionStorage for cart items first
      if (typeof window !== 'undefined') {
        try {
          const storedCartItems = sessionStorage.getItem('checkout_cart_items')
          if (storedCartItems) {
            setProductLoading(true)
            const parsedItems = JSON.parse(storedCartItems)
            // Ensure all items have image property
            const itemsWithImages = parsedItems.map((item: any) => ({
              ...item,
              image: item.image || '/images/placeholder.png',
            }))
            setCartItems(itemsWithImages)
            setProductLoading(false)
            return
          }
        } catch (err) {
          console.error('Error loading cart items from sessionStorage:', err)
        }
      }

      // Fallback to productId if no cart items
      if (productId) {
        try {
          setProductLoading(true)
          const productData = await getProductById(productId)
          setProduct(productData)
        } catch (err) {
          console.error('Error loading product:', err)
        } finally {
          setProductLoading(false)
        }
      } else {
        setProductLoading(false)
      }
    }
    loadData()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready')
      setLoading(false)
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      setLoading(false)
      return
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.displayName || undefined,
              email: user?.email || undefined,
            },
          },
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create purchase records in Firestore
        try {
          if (cartItems.length > 0) {
            // Handle multiple items from cart
            for (const item of cartItems) {
              const purchase = {
                userId: user?.uid || '',
                productId: item.productId,
                productName: item.productName,
                amount: item.price * item.quantity,
                currency: 'usd',
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
          } else if (product) {
            // Handle single item purchase
            const purchase = {
              userId: user?.uid || '',
              productId: product.id,
              productName: product.name,
              amount: product.price,
              currency: 'usd',
              status: 'succeeded' as const,
              stripePaymentIntentId: paymentIntent.id,
              description: `Purchase: ${product.name}`,
            }

            await createPurchase(purchase)
            console.log(`Purchase recorded: ${paymentIntent.id}`)

            // Decrement product stock
            try {
              await decrementProductStock(product.id, 1)
              console.log(`Stock decremented for product ${product.id}: -1`)
            } catch (stockError: any) {
              console.error(`Error decrementing stock for product ${product.id}:`, stockError)
            }
          }
        } catch (purchaseError: any) {
          console.error('Error creating purchase record:', purchaseError)
          console.error('Error details:', {
            code: purchaseError?.code,
            message: purchaseError?.message,
            userId: user?.uid,
            paymentIntentId: paymentIntent.id,
          })
          // Show error to user but continue - webhook will handle it as backup
          alert('Payment succeeded, but there was an error saving the transaction. It will be saved automatically via webhook.')
        }

        // Clear cart if this was a cart checkout
        if (cartItems.length > 0) {
          clearCart()
        }
        router.push(`/success?payment_intent=${paymentIntent.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
      setLoading(false)
    }
  }

  if (!clientSecret) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <Link
            href={cartItems.length > 0 ? "/cart" : "/shop"}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {cartItems.length > 0 ? "Cart" : "Shop"}
          </Link>
        </div>
        <div className="mb-4 text-center">
          <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Complete Payment</h1>
          <p className="text-sm text-slate-500">
            {cartItems.length > 0
              ? `Pay for ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`
              : `Pay for ${productName}`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product/Cart Details */}
          {(product || cartItems.length > 0 || productLoading) && (
            <div className="rounded-lg border bg-white p-6">
              {productLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
                    <p className="text-slate-600">Loading details...</p>
                  </div>
                </div>
              ) : cartItems.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-4 mb-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = '<div class="h-full w-full flex items-center justify-center text-xs text-slate-400">No Image</div>'
                                }
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.productName}</h3>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-slate-900 mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : product ? (
                <>
                  <div className="mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                  <p className="text-3xl font-bold text-slate-900 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Description
                    </h3>
                    <p className="text-base text-slate-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Payment Form */}
          <div className="rounded-lg border bg-white p-4">
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-900">
                  Card Details
                </label>
                <div className="rounded-md border border-slate-300 p-3">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '14px',
                          color: '#1e293b',
                          '::placeholder': {
                            color: '#94a3b8',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>

              <Link
                href="/shop"
                className="block w-full text-center text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <Elements stripe={stripePromise}>
        <PaymentContent />
      </Elements>
    </Suspense>
  )
}

