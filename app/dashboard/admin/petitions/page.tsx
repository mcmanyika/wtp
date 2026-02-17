'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import {
  getPetitions,
  getPetitionById,
  createPetition,
  updatePetition,
  deletePetition,
  createNotification,
} from '@/lib/firebase/firestore'
import { uploadFile } from '@/lib/firebase/storage'
import { useAuth } from '@/contexts/AuthContext'
import type { Petition } from '@/types'
import RichTextEditor from '@/app/components/RichTextEditor'

export default function AdminPetitionsPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Petition Management</h1>
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
            <PetitionManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function PetitionManagement() {
  const { user } = useAuth()
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPetition, setEditingPetition] = useState<Petition | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    goal: 100,
    isActive: true,
    isPublished: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    loadPetitions()
  }, [])

  const loadPetitions = async () => {
    try {
      setLoading(true)
      const allPetitions = await getPetitions(false, false) // Get all petitions
      setPetitions(allPetitions)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load petitions')
      console.error('Error loading petitions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (petition?: Petition) => {
    if (petition) {
      setEditingPetition(petition)
      setFormData({
        title: petition.title,
        description: petition.description,
        content: petition.content || '',
        goal: petition.goal,
        isActive: petition.isActive,
        isPublished: petition.isPublished,
      })
      setImagePreview(petition.image || null)
      setImageFile(null)
      setExpiresAt(petition.expiresAt ? new Date(petition.expiresAt instanceof Date ? petition.expiresAt : (petition.expiresAt as any)?.toDate?.() || new Date()).toISOString().split('T')[0] : '')
    } else {
      setEditingPetition(null)
      setFormData({
        title: '',
        description: '',
        content: '',
        goal: 100,
        isActive: true,
        isPublished: false,
      })
      setImagePreview(null)
      setImageFile(null)
      setExpiresAt('')
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPetition(null)
    setFormData({
      title: '',
      description: '',
      content: '',
      goal: 100,
      isActive: true,
      isPublished: false,
    })
    setImageFile(null)
    setImagePreview(null)
    setExpiresAt('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      setError('')
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    try {
      let imageUrl = editingPetition?.image

      if (imageFile) {
        const timestamp = Date.now()
        const fileName = `${timestamp}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const storagePath = `petitions/${fileName}`
        imageUrl = await uploadFile(imageFile, storagePath)
      }

      const petitionData = {
        title: formData.title,
        description: formData.description,
        content: formData.content || undefined,
        image: imageUrl || undefined,
        goal: formData.goal,
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        createdBy: user?.uid || '',
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      }

      if (editingPetition) {
        await updatePetition(editingPetition.id, petitionData)
        // Notify users if petition was just published
        if (!editingPetition.isPublished && petitionData.isPublished) {
          await createNotification({
            type: 'new_petition',
            title: 'New Petition Published',
            message: petitionData.title,
            link: '/petitions',
            audience: 'all',
          })
        }
      } else {
        await createPetition(petitionData)
        // Notify users if new petition is published immediately
        if (petitionData.isPublished) {
          await createNotification({
            type: 'new_petition',
            title: 'New Petition Published',
            message: petitionData.title,
            link: '/petitions',
            audience: 'all',
          })
        }
      }

      handleCloseModal()
      await loadPetitions()
    } catch (err: any) {
      setError(err.message || 'Failed to save petition')
      console.error('Error saving petition:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (petitionId: string) => {
    if (!confirm('Are you sure you want to delete this petition?')) {
      return
    }

    try {
      await deletePetition(petitionId)
      await loadPetitions()
    } catch (err: any) {
      setError(err.message || 'Failed to delete petition')
      console.error('Error deleting petition:', err)
    }
  }

  const handleTogglePublish = async (petition: Petition) => {
    try {
      const newPublished = !petition.isPublished
      await updatePetition(petition.id, { isPublished: newPublished })
      // Notify users when petition is published
      if (newPublished) {
        await createNotification({
          type: 'new_petition',
          title: 'New Petition Published',
          message: petition.title,
          link: '/petitions',
          audience: 'all',
        })
      }
      await loadPetitions()
    } catch (err: any) {
      setError(err.message || 'Failed to update petition status')
      console.error('Error updating petition:', err)
    }
  }

  const handleToggleActive = async (petition: Petition) => {
    try {
      await updatePetition(petition.id, { isActive: !petition.isActive })
      await loadPetitions()
    } catch (err: any) {
      setError(err.message || 'Failed to update petition status')
      console.error('Error updating petition:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading petitions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Petitions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create and manage petitions for your community
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          + Create Petition
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Signatures
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Goal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {petitions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  No petitions found. Create your first petition to get started.
                </td>
              </tr>
            ) : (
              petitions.map((petition) => (
                <tr key={petition.id} className={!petition.isPublished || !petition.isActive ? 'opacity-50' : ''}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{petition.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">
                      {petition.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {petition.currentSignatures}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {petition.goal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {petition.isPublished ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800">
                          Draft
                        </span>
                      )}
                      {petition.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {petition.publishedAt
                      ? new Date(petition.publishedAt instanceof Date ? petition.publishedAt.getTime() : (petition.publishedAt as any)?.toMillis?.() || 0).toLocaleDateString()
                      : new Date(petition.createdAt instanceof Date ? petition.createdAt.getTime() : (petition.createdAt as any)?.toMillis?.() || 0).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(petition)}
                        className={`text-xs px-2 py-1 rounded ${
                          petition.isPublished
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        } transition-colors`}
                      >
                        {petition.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(petition)}
                        className={`text-xs px-2 py-1 rounded ${
                          petition.isActive
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        } transition-colors`}
                      >
                        {petition.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleOpenModal(petition)}
                        className="text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(petition.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {editingPetition ? 'Edit Petition' : 'Create Petition'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                    placeholder="Petition description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Content
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    placeholder="Full petition content..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">
                      Goal (Signatures) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) || 100 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">
                      Expires At (Optional)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Image
                  </label>
                  {imagePreview && (
                    <div className="mb-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="ml-2 text-sm text-slate-700">Published</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="ml-2 text-sm text-slate-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Saving...' : editingPetition ? 'Update Petition' : 'Create Petition'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

