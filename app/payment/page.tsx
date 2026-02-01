'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe/config'
import { useAuth } from '@/contexts/AuthContext'
import { getProductById } from '@/lib/firebase/firestore'
import type { Product } from '@/types'
import Link from 'next/link'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(true)
  const clientSecret = searchParams.get('client_secret')
  const productName = searchParams.get('product') || 'Purchase'
  const productId = searchParams.get('productId')

  useEffect(() => {
    if (!clientSecret) {
      router.push('/')
    }
  }, [clientSecret, router])

  // Load product details if productId is available
  useEffect(() => {
    const loadProduct = async () => {
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
    loadProduct()
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold">Complete Payment</h1>
          <p className="text-slate-600">Pay for {productName}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Details */}
          {(product || productLoading) && (
            <div className="rounded-lg border bg-white p-6">
              {productLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
                    <p className="text-slate-600">Loading product details...</p>
                  </div>
                </div>
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
          <div className="rounded-lg border bg-white p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Card Details
              </label>
              <div className="rounded-lg border border-slate-300 p-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
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
              className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>

            <Link
              href="/shop"
              className="block w-full text-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
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

