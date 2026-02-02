'use client'

import ProtectedRoute from '@/app/components/ProtectedRoute'
import DashboardNav from '@/app/components/DashboardNav'
import MembershipCheckout from '@/app/components/MembershipCheckout'
import MembershipCard from '@/app/components/MembershipCard'
import Link from 'next/link'

export default function MembershipPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Membership</h1>
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        <DashboardNav />

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <MembershipCard />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Upgrade Your Membership</h2>
              <p className="mt-1 text-slate-600">
                Choose a membership tier that fits your commitment level
              </p>
            </div>
            <MembershipCheckout />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

