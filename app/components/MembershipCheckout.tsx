'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const membershipTiers = [
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    features: [
      'Access to community forums',
      'Monthly newsletter',
      'Basic resources',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 25,
    features: [
      'Everything in Basic',
      'Exclusive webinars',
      'Advanced resources',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'champion',
    name: 'Champion',
    price: 50,
    features: [
      'Everything in Premium',
      'VIP events access',
      'Direct communication with leadership',
      'Early access to campaigns',
    ],
  },
]

export default function MembershipCheckout() {
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!selectedTier) {
      setError('Please select a membership tier')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: membershipTiers.find((t) => t.id === selectedTier)?.price || 0,
          userId: user?.uid || null,
          type: 'membership',
          tier: selectedTier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then((mod) => mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!))
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process membership')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {membershipTiers.map((tier) => (
          <div
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
              selectedTier === tier.id
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-400'
            } ${tier.popular ? 'ring-2 ring-slate-900' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                Popular
              </div>
            )}
            <div className="text-center">
              <h3 className="mb-2 text-lg font-bold">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="mb-4 space-y-2 text-left text-sm text-slate-600">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div
                className={`inline-block rounded-lg px-4 py-2 text-sm font-semibold ${
                  selectedTier === tier.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-900'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !selectedTier}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  )
}

