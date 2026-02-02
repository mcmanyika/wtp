'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import DashboardNav from '@/app/components/DashboardNav'
import { useAuth } from '@/contexts/AuthContext'
import { getVolunteerApplicationByUser } from '@/lib/firebase/firestore'
import type { VolunteerApplication } from '@/types'
import Link from 'next/link'

function toDate(date: Date | any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as any).toDate()
  }
  return new Date(date as string | number)
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function VolunteerDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Volunteer Application</h1>
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
          <VolunteerApplicationStatus />
        </div>
      </div>
    </ProtectedRoute>
  )
}

function VolunteerApplicationStatus() {
  const { user } = useAuth()
  const [application, setApplication] = useState<VolunteerApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      
      try {
        const data = await getVolunteerApplicationByUser(user.uid)
        setApplication(data)
      } catch (err: any) {
        console.error('Error fetching volunteer application:', err)
        setError(err.message || 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading application...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600 mb-4">Error loading application: {error}</p>
        <Link
          href="/volunteer"
          className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Apply Now
        </Link>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">No Application Found</h2>
        <p className="mb-6 text-slate-600">
          You haven't submitted a volunteer application yet. Start your application to join our volunteer team.
        </p>
        <Link
          href="/volunteer"
          className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Apply Now
        </Link>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    approved: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    withdrawn: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  const createdAt = toDate(application.createdAt)
  const reviewedAt = application.reviewedAt ? toDate(application.reviewedAt) : null

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Application Status</h2>
          <div
            className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${
              statusColors[application.status]
            }`}
          >
            {application.status}
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold">Submitted:</span> {formatDate(createdAt)}
          </p>
          {reviewedAt && (
            <p>
              <span className="font-semibold">Reviewed:</span> {formatDate(reviewedAt)}
            </p>
          )}
        </div>

        {application.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900 mb-1">Notes:</p>
            <p className="text-sm text-slate-600">{application.notes}</p>
          </div>
        )}
      </div>

      {/* Application Details */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Application Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Personal Information</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Name:</span> {application.name}</p>
              <p><span className="font-medium">Email:</span> {application.email}</p>
              {application.phone && (
                <p><span className="font-medium">Phone:</span> {application.phone}</p>
              )}
              {application.address && (
                <p>
                  <span className="font-medium">Address:</span> {application.address}
                  {application.city && `, ${application.city}`}
                  {application.state && `, ${application.state}`}
                  {application.zipCode && ` ${application.zipCode}`}
                </p>
              )}
              {application.dateOfBirth && (
                <p><span className="font-medium">Date of Birth:</span> {application.dateOfBirth}</p>
              )}
              {application.gender && (
                <p><span className="font-medium">Gender:</span> {application.gender}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Availability</h3>
            <p className="text-sm text-slate-600">{application.availability}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Experience</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{application.experience}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Motivation</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{application.motivation}</p>
          </div>

          {application.references && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">References</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{application.references}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

