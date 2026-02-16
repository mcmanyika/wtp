'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getAllReferrals, getAllUsers } from '@/lib/firebase/firestore'
import DashboardNav from '@/app/components/DashboardNav'
import AdminRoute from '@/app/components/AdminRoute'
import type { Referral, UserProfile, ReferralStatus } from '@/types'

function ReferralStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    signed_up: { label: 'Signed Up', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    applied: { label: 'Applied', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    paid: { label: 'Paid ✓', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }
  const c = config[status] || { label: status, classes: 'bg-slate-50 text-slate-700 border-slate-200' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  )
}

function AdminReferralsContent() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all')

  useEffect(() => {
    async function load() {
      try {
        const [refData, userData] = await Promise.all([getAllReferrals(), getAllUsers()])
        setReferrals(refData)
        setUsers(userData)
      } catch (e) {
        console.error('Error loading referrals:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const userMap = useMemo(() => {
    const map: Record<string, UserProfile> = {}
    users.forEach((u) => { map[u.uid] = u })
    return map
  }, [users])

  const filtered = useMemo(() => {
    let result = referrals
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((r) => {
        const referrerName = userMap[r.referrerUserId]?.name || userMap[r.referrerUserId]?.email || ''
        return (
          r.referredName.toLowerCase().includes(term) ||
          r.referredEmail.toLowerCase().includes(term) ||
          referrerName.toLowerCase().includes(term)
        )
      })
    }
    return result
  }, [referrals, statusFilter, search, userMap])

  const totalReferrals = referrals.length
  const signedUp = referrals.filter((r) => r.status === 'signed_up').length
  const applied = referrals.filter((r) => r.status === 'applied').length
  const paid = referrals.filter((r) => r.status === 'paid').length
  const conversionRate = totalReferrals > 0 ? Math.round((paid / totalReferrals) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">All Referrals</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of the member referral program.</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalReferrals}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-400">Signed Up</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{signedUp}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400">Applied</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{applied}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">Paid</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{paid}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-purple-400">Conversion</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">{conversionRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(['all', 'signed_up', 'applied', 'paid'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border hover:bg-slate-50'
                }`}
              >
                {s === 'all' ? 'All' : s === 'signed_up' ? 'Signed Up' : s === 'applied' ? 'Applied' : 'Paid'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:w-72"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-r-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                {referrals.length === 0 ? 'No referrals yet.' : 'No referrals match your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">Referrer</th>
                    <th className="px-6 py-3">Referred User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r) => {
                    const referrer = userMap[r.referrerUserId]
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {referrer?.name || referrer?.email || r.referrerUserId.slice(0, 8) + '…'}
                        </td>
                        <td className="px-6 py-3 text-slate-700">{r.referredName}</td>
                        <td className="px-6 py-3 text-slate-500">{r.referredEmail}</td>
                        <td className="px-6 py-3"><ReferralStatusBadge status={r.status} /></td>
                        <td className="px-6 py-3 text-slate-500">
                          {r.createdAt instanceof Date ? r.createdAt.toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400">{filtered.length} of {referrals.length} referral{referrals.length !== 1 ? 's' : ''} shown</p>
      </div>
    </div>
  )
}

export default function AdminReferralsPage() {
  return (
    <AdminRoute>
      <AdminReferralsContent />
    </AdminRoute>
  )
}
