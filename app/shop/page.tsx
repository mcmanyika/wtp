'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const products = [
  {
    id: 'tshirt',
    name: 'DCP T-Shirt',
    price: 25,
    description: 'Show your support with our official platform t-shirt',
    image: '/images/products/tshirt.jpg',
  },
  {
    id: 'sticker',
    name: 'DCP Sticker Pack',
    price: 5,
    description: 'Set of 5 high-quality vinyl stickers',
    image: '/images/products/sticker.jpg',
  },
  {
    id: 'flag',
    name: 'DCP Flag',
    price: 35,
    description: '3x5 foot flag for rallies and events',
    image: '/images/products/flag.jpg',
  },
  {
    id: 'book',
    name: 'Constitutional Guide',
    price: 15,
    description: 'Educational guide on constitutional principles',
    image: '/images/products/book.jpg',
  },
]

export default function ShopPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handlePurchase = async (product: typeof products[0]) => {
    setError('')
    setLoading(product.id)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: product.price,
          userId: user?.uid || null,
          type: 'donation',
          description: `Purchase: ${product.name}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      )
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process purchase')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Shop
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">Support the Movement</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Purchase merchandise and educational materials to support our mission
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-4xl rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:border-slate-900 hover:shadow-lg"
            >
              <div className="aspect-square bg-slate-100 flex items-center justify-center">
                <div className="h-20 w-20 rounded-lg bg-slate-300"></div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold">{product.name}</h3>
                <p className="mb-4 text-sm text-slate-600">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price}</span>
                  <button
                    onClick={() => handlePurchase(product)}
                    disabled={loading === product.id}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === product.id ? 'Processing...' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

