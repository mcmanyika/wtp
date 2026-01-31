'use client'

import ProtectedRoute from '@/app/components/ProtectedRoute'
import DashboardNav from '@/app/components/DashboardNav'
import MembershipCard from '@/app/components/MembershipCard'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard</h1>
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

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <DashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, userProfile } = useAuth()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Welcome Back</h2>
          <div className="space-y-2">
            <p className="text-slate-600">
              <span className="font-semibold">Name:</span> {userProfile?.name || 'Not set'}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold">Email:</span> {user?.email}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold">Membership:</span>{' '}
              <span className="capitalize">{userProfile?.membershipTier || 'Free'}</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/#donate"
              className="block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Make a Donation
            </Link>
            <Link
              href="/dashboard/membership"
              className="block rounded-lg border-2 border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Manage Membership
            </Link>
            <Link
              href="/shop"
              className="block rounded-lg border-2 border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Visit Shop
            </Link>
          </div>
        </div>
      </div>

      <div>
        <MembershipCard />
      </div>
    </div>
  )
}

