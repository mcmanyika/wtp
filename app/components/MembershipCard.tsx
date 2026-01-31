'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getMembershipByUser } from '@/lib/firebase/firestore'
import type { Membership } from '@/types'

function toDate(date: Date | any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  // Handle Firestore Timestamp
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as any).toDate()
  }
  // Fallback for string or number
  return new Date(date as string | number)
}

export default function MembershipCard() {
  const { user, userProfile } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchMembership = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const data = await getMembershipByUser(user.uid)
      console.log('Fetched membership:', data)
      setMembership(data)
    } catch (err: any) {
      console.error('Error fetching membership:', err)
      setError(err.message || 'Failed to load membership')
      setMembership(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembership()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading membership...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading membership: {error}</p>
          <button
            onClick={fetchMembership}
            className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const currentTier = userProfile?.membershipTier || 'free'

  if (!membership || currentTier === 'free') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="text-center">
          <h3 className="mb-2 text-xl font-bold">No Active Membership</h3>
          <p className="mb-6 text-slate-600">
            Upgrade to a membership tier to unlock exclusive benefits
          </p>
          <a
            href="/dashboard/membership"
            className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            View Membership Options
          </a>
        </div>
      </div>
    )
  }

  const endDate = toDate(membership.endDate)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold capitalize">{membership.tier} Membership</h3>
          <p className="text-sm text-slate-600">
            Status: <span className="font-semibold capitalize">{membership.status}</span>
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            membership.status === 'active'
              ? 'bg-green-100 text-green-700'
              : membership.status === 'past_due'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {membership.status}
        </div>
      </div>

      {endDate && (
        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            {membership.cancelAtPeriodEnd
              ? 'Cancels on'
              : 'Renews on'}{' '}
            <span className="font-semibold">
              {endDate.toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <a
          href="/dashboard/membership"
          className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Manage
        </a>
      </div>
    </div>
  )
}

