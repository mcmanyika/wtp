'use client'

import ProtectedRoute from '@/app/components/ProtectedRoute'
import VolunteerApplicationForm from '@/app/components/VolunteerApplicationForm'
import Link from 'next/link'

export default function VolunteerPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Become a Volunteer</h1>
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-8">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold">Join Our Volunteer Team</h2>
              <p className="text-slate-600">
                We're looking for passionate individuals who want to make a difference. 
                Fill out the form below to apply to become a volunteer with the Defend the Constitution Platform.
              </p>
            </div>

            <VolunteerApplicationForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

