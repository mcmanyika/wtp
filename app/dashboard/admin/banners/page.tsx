'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '@/lib/firebase/firestore'
import { uploadFile } from '@/lib/firebase/storage'
import type { Banner } from '@/types'

export default function AdminBannersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Banner Management</h1>
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
            <BannerManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    isActive: true,
    order: 0,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const allBanners = await getBanners(false) // all banners
      setBanners(allBanners)
      setError('')
    } catch (err: any) {
      console.error('Error loading banners:', err)
      setError('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', isActive: true, order: banners.length })
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    setEditingBanner(null)
  }

  const openCreateModal = () => {
    resetForm()
    setFormData(prev => ({ ...prev, order: banners.length }))
    setShowModal(true)
  }

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      isActive: banner.isActive,
      order: banner.order,
    })
    setImageUrl(banner.imageUrl)
    setImagePreview(banner.imageUrl)
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

    try {
      let finalImageUrl = imageUrl

      // Upload image if a new file was selected
      if (imageFile) {
        const timestamp = Date.now()
        const path = `banners/${timestamp}-${imageFile.name}`
        finalImageUrl = await uploadFile(imageFile, path)
      }

      if (!finalImageUrl) {
        setError('Please upload an image or provide an image URL')
        setUploading(false)
        return
      }

      if (editingBanner) {
        await updateBanner(editingBanner.id, {
          imageUrl: finalImageUrl,
          title: formData.title,
          isActive: formData.isActive,
          order: formData.order,
        })
      } else {
        await createBanner({
          imageUrl: finalImageUrl,
          title: formData.title,
          isActive: formData.isActive,
          order: formData.order,
        })
      }

      await loadBanners()
      setShowModal(false)
      resetForm()
    } catch (err: any) {
      console.error('Error saving banner:', err)
      setError(err.message || 'Failed to save banner')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { isActive: !banner.isActive })
      await loadBanners()
    } catch (err: any) {
      console.error('Error toggling banner:', err)
      setError('Failed to update banner')
    }
  }

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return
    setDeleting(true)
    try {
      await deleteBanner(bannerToDelete.id)
      await loadBanners()
      setDeleteModalOpen(false)
      setBannerToDelete(null)
    } catch (err: any) {
      console.error('Error deleting banner:', err)
      setError('Failed to delete banner')
    } finally {
      setDeleting(false)
    }
  }

  const handleMoveUp = async (banner: Banner) => {
    const idx = banners.findIndex(b => b.id === banner.id)
    if (idx <= 0) return
    try {
      const prevBanner = banners[idx - 1]
      await updateBanner(banner.id, { order: prevBanner.order })
      await updateBanner(prevBanner.id, { order: banner.order })
      await loadBanners()
    } catch (err: any) {
      console.error('Error reordering:', err)
    }
  }

  const handleMoveDown = async (banner: Banner) => {
    const idx = banners.findIndex(b => b.id === banner.id)
    if (idx >= banners.length - 1) return
    try {
      const nextBanner = banners[idx + 1]
      await updateBanner(banner.id, { order: nextBanner.order })
      await updateBanner(nextBanner.id, { order: banner.order })
      await loadBanners()
    } catch (err: any) {
      console.error('Error reordering:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading banners...</p>
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
            {banners.length} banner{banners.length !== 1 ? 's' : ''} • {banners.filter(b => b.isActive).length} active
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          + Add Banner
        </button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600 mb-4">No banners yet. Add your first hero section banner.</p>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            + Add Banner
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`rounded-lg border bg-white overflow-hidden transition-all ${
                banner.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Order & Reorder */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(banner)}
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
                    onClick={() => handleMoveDown(banner)}
                    disabled={index === banners.length - 1}
                    className="rounded p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Image Preview */}
                <div className="h-24 w-44 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/placeholder.png'
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {banner.title || `Banner ${index + 1}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">{banner.imageUrl}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        banner.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-slate-400">Order: {banner.order}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      banner.isActive
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(banner)}
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
                  {editingBanner ? 'Edit Banner' : 'Add Banner'}
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Main Banner, Event Banner"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Banner Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Recommended: 1920×1080 or wider. Supports JPG, PNG, WebP.
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
                    placeholder="https://... or /images/banner.png"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Preview</label>
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover"
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
                    Lower numbers display first. Banners rotate in this order.
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
                    {formData.isActive ? 'Active' : 'Inactive'}
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
                        {editingBanner ? 'Updating...' : 'Uploading...'}
                      </span>
                    ) : (
                      editingBanner ? 'Update Banner' : 'Add Banner'
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
      {deleteModalOpen && bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Banner</h3>
            <p className="text-sm text-slate-600 mb-1">
              Are you sure you want to delete this banner?
            </p>
            <p className="text-sm font-semibold text-slate-900 mb-4">
              {bannerToDelete.title || `Banner (Order: ${bannerToDelete.order})`}
            </p>
            {bannerToDelete.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={bannerToDelete.imageUrl}
                  alt="Banner to delete"
                  className="w-full h-32 object-cover"
                />
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
                onClick={() => { setDeleteModalOpen(false); setBannerToDelete(null) }}
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

