'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import {
  getLeaders,
  createLeader,
  updateLeader,
  deleteLeader,
} from '@/lib/firebase/firestore'
import { uploadFile } from '@/lib/firebase/storage'
import type { Leader } from '@/types'

export default function AdminLeadershipPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Leadership Management</h1>
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
            <LeadershipManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function LeadershipManagement() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    xHandle: '',
    isActive: true,
    order: 0,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {
    try {
      setLoading(true)
      const allLeaders = await getLeaders(false)
      setLeaders(allLeaders)
      setError('')
    } catch (err: any) {
      console.error('Error loading leaders:', err)
      setError('Failed to load leaders')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', title: '', bio: '', xHandle: '', isActive: true, order: leaders.length })
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    setEditingLeader(null)
  }

  const openCreateModal = () => {
    resetForm()
    setFormData(prev => ({ ...prev, order: leaders.length }))
    setShowModal(true)
  }

  const openEditModal = (leader: Leader) => {
    setEditingLeader(leader)
    setFormData({
      name: leader.name,
      title: leader.title,
      bio: leader.bio,
      xHandle: leader.xHandle || '',
      isActive: leader.isActive,
      order: leader.order,
    })
    setImageUrl(leader.imageUrl || '')
    setImagePreview(leader.imageUrl || null)
    setShowModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    if (!formData.name.trim() || !formData.title.trim()) {
      setError('Name and title are required')
      setUploading(false)
      return
    }

    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        const timestamp = Date.now()
        const path = `leaders/${timestamp}-${imageFile.name}`
        finalImageUrl = await uploadFile(imageFile, path)
      }

      const xHandleValue = formData.xHandle.trim() || ''

      if (editingLeader) {
        await updateLeader(editingLeader.id, {
          name: formData.name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          xHandle: xHandleValue,
          imageUrl: finalImageUrl || undefined,
          isActive: formData.isActive,
          order: formData.order,
        })
      } else {
        await createLeader({
          name: formData.name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          xHandle: xHandleValue,
          imageUrl: finalImageUrl || undefined,
          isActive: formData.isActive,
          order: formData.order,
        })
      }

      await loadLeaders()
      setShowModal(false)
      resetForm()
    } catch (err: any) {
      console.error('Error saving leader:', err)
      setError(err.message || 'Failed to save leader')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleActive = async (leader: Leader) => {
    try {
      await updateLeader(leader.id, { isActive: !leader.isActive })
      await loadLeaders()
    } catch (err: any) {
      console.error('Error toggling leader:', err)
      setError('Failed to update leader')
    }
  }

  const handleDeleteClick = (leader: Leader) => {
    setLeaderToDelete(leader)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!leaderToDelete) return
    setDeleting(true)
    try {
      await deleteLeader(leaderToDelete.id)
      await loadLeaders()
      setDeleteModalOpen(false)
      setLeaderToDelete(null)
    } catch (err: any) {
      console.error('Error deleting leader:', err)
      setError('Failed to delete leader')
    } finally {
      setDeleting(false)
    }
  }

  const handleMoveUp = async (leader: Leader) => {
    const idx = leaders.findIndex(l => l.id === leader.id)
    if (idx <= 0) return
    try {
      const prevLeader = leaders[idx - 1]
      await updateLeader(leader.id, { order: prevLeader.order })
      await updateLeader(prevLeader.id, { order: leader.order })
      await loadLeaders()
    } catch (err: any) {
      console.error('Error reordering:', err)
    }
  }

  const handleMoveDown = async (leader: Leader) => {
    const idx = leaders.findIndex(l => l.id === leader.id)
    if (idx >= leaders.length - 1) return
    try {
      const nextLeader = leaders[idx + 1]
      await updateLeader(leader.id, { order: nextLeader.order })
      await updateLeader(nextLeader.id, { order: leader.order })
      await loadLeaders()
    } catch (err: any) {
      console.error('Error reordering:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading leaders...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            {leaders.length} leader{leaders.length !== 1 ? 's' : ''} • {leaders.filter(l => l.isActive).length} active
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          + Add Leader
        </button>
      </div>

      {/* Leaders List */}
      {leaders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600 mb-4">No leaders yet. Add your first leadership team member.</p>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            + Add Leader
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <div
              key={leader.id}
              className={`rounded-lg border bg-white overflow-hidden transition-all ${
                leader.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Order & Reorder */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(leader)}
                    disabled={index === 0}
                    className="rounded p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                  <button
                    onClick={() => handleMoveDown(leader)}
                    disabled={index === leaders.length - 1}
                    className="rounded p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Photo */}
                <div className="h-20 w-20 flex-shrink-0 rounded-full bg-slate-100 overflow-hidden">
                  {leader.imageUrl ? (
                    <img
                      src={leader.imageUrl}
                      alt={leader.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                      {leader.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{leader.name}</h3>
                  <p className="text-sm text-slate-600 truncate">{leader.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{leader.bio}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        leader.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {leader.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(leader)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      leader.isActive
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {leader.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(leader)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(leader)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 animate-[slide-in-right-backdrop_0.3s_ease-out]"
            onClick={() => { setShowModal(false); resetForm() }}
          />
          {/* Slide-in panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[50%] bg-white shadow-2xl overflow-y-auto animate-[slide-in-right_0.3s_ease-out]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingLeader ? 'Edit Leader' : 'Add Leader'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Title / Position */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Title / Position *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Chairperson, Secretary General"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief biography or description..."
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </div>

                {/* X Handle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    X (Twitter) Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
                    <input
                      type="text"
                      value={formData.xHandle}
                      onChange={(e) => setFormData({ ...formData, xHandle: e.target.value.replace(/^@/, '') })}
                      placeholder="username"
                      className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Optional. Enter without the @ symbol.
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Recommended: Square photo (400×400). Supports JPG, PNG, WebP.
                  </p>
                </div>

                {/* Or URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      if (e.target.value) setImagePreview(e.target.value)
                    }}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Preview</label>
                    <div className="h-32 w-32 rounded-full overflow-hidden border border-slate-200 bg-slate-100 mx-auto">
                      <img
                        src={imagePreview}
                        alt="Leader preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder.png'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Lower numbers display first on the public leadership page.
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-700">
                    {formData.isActive ? 'Active (visible on public page)' : 'Inactive (hidden)'}
                  </span>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                        {editingLeader ? 'Updating...' : 'Saving...'}
                      </span>
                    ) : (
                      editingLeader ? 'Update Leader' : 'Add Leader'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && leaderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Leader</h3>
            <p className="text-sm text-slate-600 mb-1">
              Are you sure you want to remove this leader?
            </p>
            <p className="text-sm font-semibold text-slate-900 mb-4">
              {leaderToDelete.name} — {leaderToDelete.title}
            </p>
            {leaderToDelete.imageUrl && (
              <div className="mb-4 flex justify-center">
                <div className="h-20 w-20 rounded-full overflow-hidden border border-slate-200">
                  <img
                    src={leaderToDelete.imageUrl}
                    alt={leaderToDelete.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-red-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => { setDeleteModalOpen(false); setLeaderToDelete(null) }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
