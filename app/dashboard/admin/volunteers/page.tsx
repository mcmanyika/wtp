'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import { getAllVolunteerApplications, updateVolunteerApplicationStatus } from '@/lib/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { VolunteerApplication, VolunteerApplicationStatus } from '@/types'
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
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminVolunteersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Volunteer Applications</h1>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <VolunteerApplicationsManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function VolunteerApplicationsManagement() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<VolunteerApplicationStatus | 'all'>('all')
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewStatus, setReviewStatus] = useState<VolunteerApplicationStatus>('approved')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllVolunteerApplications()
      setApplications(data)
    } catch (err: any) {
      console.error('Error loading volunteer applications:', err)
      const errorMessage = err.message || 'Failed to load applications'
      if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        setError('Permission denied. Please ensure your user account has admin role set in Firestore.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (application: VolunteerApplication) => {
    setSelectedApplication(application)
    setReviewNotes(application.notes || '')
    setReviewStatus(application.status === 'pending' ? 'approved' : application.status)
    setShowModal(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedApplication || !user) return

    setProcessing(true)
    try {
      await updateVolunteerApplicationStatus(
        selectedApplication.id,
        reviewStatus,
        user.uid,
        reviewNotes.trim() || undefined
      )
      await loadApplications()
      setShowModal(false)
      setSelectedApplication(null)
      setReviewNotes('')
    } catch (err: any) {
      console.error('Error updating application status:', err)
      alert(err.message || 'Failed to update application status')
    } finally {
      setProcessing(false)
    }
  }

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter)

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === 'pending').length,
    approved: applications.filter((app) => app.status === 'approved').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
    withdrawn: applications.filter((app) => app.status === 'withdrawn').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VolunteerApplicationStatus | 'all')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="approved">Approved ({statusCounts.approved})</option>
              <option value="rejected">Rejected ({statusCounts.rejected})</option>
              <option value="withdrawn">Withdrawn ({statusCounts.withdrawn})</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Applications List */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Skills
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-600">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => {
                  const createdAt = toDate(application.createdAt)
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-700',
                    approved: 'bg-green-100 text-green-700',
                    rejected: 'bg-red-100 text-red-700',
                    withdrawn: 'bg-slate-100 text-slate-700',
                  }

                  return (
                    <tr key={application.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {application.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {application.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {application.skills.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {application.skills.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{application.skills.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                            statusColors[application.status]
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleReview(application)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Review Application</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedApplication(null)
                  setReviewNotes('')
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Application Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-slate-900">Personal Information</h3>
                  <div className="mt-1 space-y-1 text-slate-600">
                    <p><span className="font-medium">Name:</span> {selectedApplication.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                    {selectedApplication.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                    )}
                    {selectedApplication.address && (
                      <p>
                        <span className="font-medium">Address:</span> {selectedApplication.address}
                        {selectedApplication.city && `, ${selectedApplication.city}`}
                        {selectedApplication.state && `, ${selectedApplication.state}`}
                        {selectedApplication.zipCode && ` ${selectedApplication.zipCode}`}
                      </p>
                    )}
                    {selectedApplication.dateOfBirth && (
                      <p><span className="font-medium">Date of Birth:</span> {selectedApplication.dateOfBirth}</p>
                    )}
                    {selectedApplication.gender && (
                      <p><span className="font-medium">Gender:</span> {selectedApplication.gender}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Availability</h3>
                  <p className="mt-1 text-slate-600">{selectedApplication.availability}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Skills</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedApplication.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Experience</h3>
                  <p className="mt-1 whitespace-pre-wrap text-slate-600">{selectedApplication.experience}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Motivation</h3>
                  <p className="mt-1 whitespace-pre-wrap text-slate-600">{selectedApplication.motivation}</p>
                </div>

                {selectedApplication.references && (
                  <div>
                    <h3 className="font-semibold text-slate-900">References</h3>
                    <p className="mt-1 whitespace-pre-wrap text-slate-600">{selectedApplication.references}</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="border-t border-slate-200 pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Status
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as VolunteerApplicationStatus)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="Add any notes or comments about this application..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={processing}
                      className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Updating...' : 'Update Status'}
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false)
                        setSelectedApplication(null)
                        setReviewNotes('')
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

