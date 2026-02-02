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
  }, [user, userProfile?.membershipTier])

  // Refresh membership when component becomes visible (e.g., after returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchMembership()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
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

  // Show membership if it exists and status is succeeded, regardless of userProfile
  if (!membership || membership.status !== 'succeeded') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 flex flex-col h-full">
        <div className="text-center flex-1 flex flex-col justify-center">
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

  const createdAt = toDate(membership.createdAt)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold capitalize">{membership.tier} Membership</h3>
          <p className="text-sm text-slate-600">
            Status: <span className="font-semibold capitalize">{membership.status}</span>
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            membership.status === 'succeeded'
              ? 'bg-green-100 text-green-700'
              : membership.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {membership.status}
        </div>
      </div>

      {createdAt && (
        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Purchased on{' '}
            <span className="font-semibold">
              {createdAt.toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        <button
          onClick={fetchMembership}
          className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors"
          title="Refresh membership status"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
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

