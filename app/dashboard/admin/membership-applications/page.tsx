'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import { getMembershipApplications, updateMembershipApplication, deleteMembershipApplication } from '@/lib/firebase/firestore'
import type { MembershipApplication, MembershipApplicationStatus } from '@/types'

const statusColors: Record<MembershipApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-100 text-slate-600',
}

const participationLabels: Record<string, string> = {
  civic_education: 'Civic education',
  legal_constitutional: 'Legal & constitutional advocacy',
  parliamentary: 'Parliamentary engagement',
  community_mobilisation: 'Community mobilisation',
  research_policy: 'Research & policy',
  communications_media: 'Communications & media',
  other: 'Other',
}

const orgTypeLabels: Record<string, string> = {
  civic: 'Civic organisation',
  labour: 'Labour / Trade Union',
  faith: 'Faith-based institution',
  student_youth: 'Student / Youth organisation',
  professional: 'Professional association',
  community_residents: 'Community / Residents\' association',
  liberation_veterans: 'Liberation War Veterans\' Association',
  other: 'Other',
}

export default function AdminMembershipApplicationsPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<MembershipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<MembershipApplicationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Section E fields
  const [membershipNumber, setMembershipNumber] = useState('')
  const [provinceAllocated, setProvinceAllocated] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const apps = await getMembershipApplications()
      setApplications(apps)
    } catch (error) {
      console.error('Error loading membership applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appId: string, status: MembershipApplicationStatus) => {
    setActionLoading(true)
    try {
      const updateData: any = {
        status,
        approvedBy: userProfile?.name || 'Admin',
        dateReceived: new Date().toISOString().split('T')[0],
      }
      if (membershipNumber.trim()) updateData.membershipNumber = membershipNumber.trim()
      if (provinceAllocated.trim()) updateData.provinceAllocated = provinceAllocated.trim()
      if (reviewNotes.trim()) updateData.reviewNotes = reviewNotes.trim()

      await updateMembershipApplication(appId, updateData)
      await loadApplications()
      setSelectedApp(null)
      setMembershipNumber('')
      setProvinceAllocated('')
      setReviewNotes('')
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Failed to update application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      await deleteMembershipApplication(appId)
      await loadApplications()
      if (selectedApp?.id === appId) setSelectedApp(null)
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Failed to delete application')
    }
  }

  const generateMembershipNumber = (app: MembershipApplication): string => {
    // If already has a membership number, keep it
    if (app.membershipNumber) return app.membershipNumber

    const year = new Date().getFullYear()
    // Count all applications that already have a membership number
    const existingNumbers = applications
      .filter(a => a.membershipNumber)
      .map(a => {
        const match = a.membershipNumber!.match(/DCP-\d{4}-(\d+)/)
        return match ? parseInt(match[1], 10) : 0
      })
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    return `DCP-${year}-${String(nextNumber).padStart(3, '0')}`
  }

  const openDetail = (app: MembershipApplication) => {
    setSelectedApp(app)
    setMembershipNumber(generateMembershipNumber(app))
    setProvinceAllocated(app.provinceAllocated || '')
    setReviewNotes(app.reviewNotes || '')
  }

  const filtered = applications.filter((app) => {
    if (filter !== 'all' && app.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      const name = (app.type === 'individual' ? app.fullName : app.organisationName) || ''
      const email = app.emailAddress || app.representativeEmail || ''
      if (!name.toLowerCase().includes(s) && !email.toLowerCase().includes(s) && !app.id.toLowerCase().includes(s)) return false
    }
    return true
  })

  const formatDate = (date: any): string => {
    if (!date) return '—'
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('en-ZW', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  // Auth guard
  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [userProfile, router])

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Membership Applications</h1>
                <p className="mt-1 text-sm text-slate-500">Review and manage DCP membership applications</p>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>

        <DashboardNav />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total', count: counts.all, color: 'bg-slate-900' },
              { label: 'Pending', count: counts.pending, color: 'bg-amber-500' },
              { label: 'Approved', count: counts.approved, color: 'bg-green-600' },
              { label: 'Rejected', count: counts.rejected, color: 'bg-red-500' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                  <span className="text-xs text-slate-500">{stat.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stat.count}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected', 'withdrawn'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:w-64"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-500">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Applicant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Province</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((app) => {
                    const name = app.type === 'individual' ? app.fullName : app.organisationName
                    const email = app.emailAddress || app.representativeEmail
                    const province = app.type === 'individual' ? app.province : app.provincesOfOperation
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openDetail(app)}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{name || '—'}</p>
                          <p className="text-xs text-slate-500">{email || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
                            {app.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{province || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(app.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-slate-900 px-6 py-4 rounded-t-xl">
                <div>
                  <h2 className="text-lg font-bold text-white">Application Details</h2>
                  <p className="text-xs text-slate-300">ID: {selectedApp.id}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Type & Status */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 capitalize">
                    {selectedApp.type} Membership
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColors[selectedApp.status]}`}>
                    {selectedApp.status}
                  </span>
                </div>

                {/* Details */}
                {selectedApp.type === 'individual' ? (
                  <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Individual Details</h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div><span className="text-slate-500">Full Name:</span> <span className="font-medium">{selectedApp.fullName}</span></div>
                      {selectedApp.nationalIdPassport && <div><span className="text-slate-500">ID/Passport:</span> <span className="font-medium">{selectedApp.nationalIdPassport}</span></div>}
                      {selectedApp.gender && <div><span className="text-slate-500">Gender:</span> <span className="font-medium">{selectedApp.gender}</span></div>}
                      {selectedApp.dateOfBirth && <div><span className="text-slate-500">Date of Birth:</span> <span className="font-medium">{selectedApp.dateOfBirth}</span></div>}
                      {selectedApp.province && <div><span className="text-slate-500">Province:</span> <span className="font-medium">{selectedApp.province}</span></div>}
                      {selectedApp.district && <div><span className="text-slate-500">District/Ward:</span> <span className="font-medium">{selectedApp.district}</span></div>}
                      {selectedApp.occupation && <div><span className="text-slate-500">Occupation:</span> <span className="font-medium">{selectedApp.occupation}</span></div>}
                      <div><span className="text-slate-500">Mobile:</span> <span className="font-medium">{selectedApp.mobileNumber}</span></div>
                      <div><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedApp.emailAddress}</span></div>
                    </div>
                    {selectedApp.participationAreas && selectedApp.participationAreas.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500">Participation Areas: </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedApp.participationAreas.map((a) => (
                            <span key={a} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {participationLabels[a] || a}
                            </span>
                          ))}
                        </div>
                        {selectedApp.participationOther && (
                          <p className="mt-1 text-xs text-slate-600">Other: {selectedApp.participationOther}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Organisation Details</h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="sm:col-span-2"><span className="text-slate-500">Organisation:</span> <span className="font-medium">{selectedApp.organisationName}</span></div>
                      <div><span className="text-slate-500">Type:</span> <span className="font-medium">{orgTypeLabels[selectedApp.organisationType || ''] || selectedApp.organisationType}</span></div>
                      {selectedApp.organisationTypeOther && <div><span className="text-slate-500">Type (Other):</span> <span className="font-medium">{selectedApp.organisationTypeOther}</span></div>}
                      {selectedApp.registrationStatus && <div><span className="text-slate-500">Registration:</span> <span className="font-medium">{selectedApp.registrationStatus}</span></div>}
                      {selectedApp.physicalAddress && <div className="sm:col-span-2"><span className="text-slate-500">Address:</span> <span className="font-medium">{selectedApp.physicalAddress}</span></div>}
                      {selectedApp.provincesOfOperation && <div><span className="text-slate-500">Provinces:</span> <span className="font-medium">{selectedApp.provincesOfOperation}</span></div>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <h5 className="text-xs font-semibold text-slate-500 mb-2">Designated Representative</h5>
                      <div className="grid gap-2 sm:grid-cols-2 text-sm">
                        <div><span className="text-slate-500">Name:</span> <span className="font-medium">{selectedApp.representativeName}</span></div>
                        {selectedApp.representativePosition && <div><span className="text-slate-500">Position:</span> <span className="font-medium">{selectedApp.representativePosition}</span></div>}
                        <div><span className="text-slate-500">Mobile:</span> <span className="font-medium">{selectedApp.representativeMobile}</span></div>
                        <div><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedApp.representativeEmail}</span></div>
                      </div>
                      {selectedApp.alternateRepresentative && (
                        <p className="mt-2 text-sm"><span className="text-slate-500">Alternate:</span> <span className="font-medium">{selectedApp.alternateRepresentative}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Declaration */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Declaration</h4>
                  <div className="flex items-center gap-2 text-sm">
                    {selectedApp.declarationAccepted ? (
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                    <span className="font-medium">{selectedApp.declarationAccepted ? 'Accepted' : 'Not accepted'}</span>
                  </div>
                  {selectedApp.signatureName && (
                    <p className="mt-1 text-sm text-slate-600">
                      Signed by: <span className="italic font-medium">{selectedApp.signatureName}</span>
                      {selectedApp.signatureDate && ` on ${selectedApp.signatureDate}`}
                    </p>
                  )}
                </div>

                {/* Section E: Official Use */}
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Section E: For Official Use Only</h4>
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Membership Number</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={membershipNumber}
                            onChange={(e) => setMembershipNumber(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() => setMembershipNumber(generateMembershipNumber({ ...selectedApp!, membershipNumber: undefined } as MembershipApplication))}
                            className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Regenerate membership number"
                          >
                            ↻
                          </button>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">Auto-generated. Click ↻ to regenerate.</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Province / Desk Allocated</label>
                        <input
                          type="text"
                          value={provinceAllocated}
                          onChange={(e) => setProvinceAllocated(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Review Notes</label>
                      <textarea
                        rows={2}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Add notes about this application..."
                      />
                    </div>
                    {selectedApp.approvedBy && (
                      <p className="text-xs text-slate-500">
                        Processed by: {selectedApp.approvedBy} {selectedApp.dateReceived && `on ${selectedApp.dateReceived}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {selectedApp.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                        disabled={actionLoading}
                        className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                        disabled={actionLoading}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id, selectedApp.status)}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
