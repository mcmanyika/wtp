'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe/config'
import { createMembership } from '@/lib/firebase/firestore'

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

interface MembershipCheckoutContentProps {
  onSuccess?: () => void
}

function MembershipCheckoutContent({ onSuccess }: MembershipCheckoutContentProps) {
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const { user } = useAuth()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    // Create payment intent when tier is selected
    if (selectedTier) {
      const tier = membershipTiers.find((t) => t.id === selectedTier)
      if (tier) {
        const createPaymentIntent = async () => {
          try {
            setError('')
            const response = await fetch('/api/stripe/create-payment-intent', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: tier.price,
                userId: user?.uid || null,
                userEmail: user?.email || null,
                userName: user?.displayName || null,
                type: 'membership',
                description: `${tier.name} Membership`,
                tier: selectedTier,
              }),
            })

            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Failed to create payment intent')
            }

            setClientSecret(data.clientSecret)
          } catch (err: any) {
            console.error('Error creating payment intent:', err)
            setError(err.message || 'Failed to initialize payment')
            setClientSecret('')
          }
        }
        
        createPaymentIntent()
      }
    } else {
      setClientSecret('')
    }
  }, [selectedTier, user?.uid, user?.email, user?.displayName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!selectedTier) {
      setError('Please select a membership tier')
      return
    }

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      return
    }

    setLoading(true)

    try {
      const tier = membershipTiers.find((t) => t.id === selectedTier)
      
      // Confirm payment with auto-captured user info
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
        // Create membership record in Firestore
        try {
          const membership = {
            userId: user?.uid || '',
            tier: selectedTier as any,
            stripePaymentIntentId: paymentIntent.id,
            status: 'succeeded' as const,
          }
          const membershipId = await createMembership(membership)
          console.log('Membership record created in Firestore:', membershipId)
        } catch (membershipError: any) {
          console.error('Error creating membership record:', membershipError)
          console.error('Error details:', {
            code: membershipError?.code,
            message: membershipError?.message,
            userId: user?.uid,
            paymentIntentId: paymentIntent.id,
          })
          // Show error to user but continue - webhook will handle it as backup
          alert('Payment succeeded, but there was an error saving the membership. It will be saved automatically via webhook.')
        }

        // Refresh user profile to update membership tier
        if (window.location.pathname.includes('/dashboard')) {
          // Wait a moment for webhook to process, then refresh
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          if (onSuccess) {
            onSuccess()
          }
          router.push(`/success?payment_intent=${paymentIntent.id}`)
        }
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

      {clientSecret && (
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
      )}

      <button
        type="submit"
        disabled={loading || !selectedTier || !clientSecret}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {loading ? 'Processing...' : 'Purchase Membership'}
      </button>
    </form>
  )
}

interface MembershipCheckoutProps {
  onSuccess?: () => void
}

export default function MembershipCheckout({ onSuccess }: MembershipCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <MembershipCheckoutContent onSuccess={onSuccess} />
    </Elements>
  )
}

