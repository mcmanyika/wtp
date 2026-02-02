'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const paymentIntentId = searchParams.get('payment_intent')

    if (!sessionId && !paymentIntentId) {
      router.push('/')
      return
    }

    // Fetch payment details
    if (paymentIntentId) {
      fetch(`/api/stripe/payment-intent?payment_intent=${paymentIntentId}`)
        .then((res) => res.json())
        .then((data) => {
          setSessionData(data)
          setLoading(false)
          
          // If this is a membership payment, refresh user profile after a delay
          // to allow webhook to process
          if (data.metadata?.type === 'membership') {
            setTimeout(() => {
              refreshUserProfile()
            }, 2000)
          }
        })
        .catch(() => {
          setLoading(false)
        })
    } else if (sessionId) {
      fetch(`/api/stripe/session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSessionData(data)
          setLoading(false)
          
          // If this is a membership payment, refresh user profile after a delay
          // to allow webhook to process
          if (data.metadata?.type === 'membership') {
            setTimeout(() => {
              refreshUserProfile()
            }, 2000)
          }
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [searchParams, router, refreshUserProfile])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Processing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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
          </div>
          <h1 className="mb-2 text-3xl font-bold">Payment Successful!</h1>
          <p className="text-slate-600">
            Thank you for your support. Your payment has been processed successfully.
          </p>
        </div>

        {sessionData && (
          <div className="mb-6 rounded-lg border bg-white p-6 text-left">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-semibold">
                  ${((sessionData.amount_total || sessionData.amount) / 100).toFixed(2)}
                </span>
              </div>
              {sessionData.metadata?.type === 'membership' && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Membership:</span>
                  <span className="font-semibold capitalize">
                    {sessionData.metadata.tier}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border-2 border-slate-300 px-6 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
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
      <SuccessContent />
    </Suspense>
  )
}

