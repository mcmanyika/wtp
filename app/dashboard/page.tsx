'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import DashboardNav from '@/app/components/DashboardNav'
import MembershipCard from '@/app/components/MembershipCard'
import { useAuth } from '@/contexts/AuthContext'
import { getPurchasesByUser, getProductById } from '@/lib/firebase/firestore'
import type { Purchase, Product } from '@/types'
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

type SortOption = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc' | 'name-asc' | 'name-desc'
type StatusFilter = 'all' | 'succeeded' | 'pending' | 'failed' | 'canceled'

function DashboardContent() {
  const { user, userProfile } = useAuth()
  const [membershipTier, setMembershipTier] = useState<string>('free')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchasesLoading, setPurchasesLoading] = useState(true)
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([])
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const purchasesPerPage = 5

  useEffect(() => {
    // Fetch membership to get the actual tier
    const fetchMembership = async () => {
      if (!user) return
      
      try {
        const { getMembershipByUser } = await import('@/lib/firebase/firestore')
        const membership = await getMembershipByUser(user.uid)
        if (membership && membership.status === 'succeeded') {
          setMembershipTier(membership.tier)
        } else {
          // Fall back to userProfile if no active membership
          setMembershipTier(userProfile?.membershipTier || 'free')
        }
      } catch (err) {
        console.error('Error fetching membership:', err)
        setMembershipTier(userProfile?.membershipTier || 'free')
      }
    }

    fetchMembership()
  }, [user, userProfile?.membershipTier])

  useEffect(() => {
    // Fetch purchases and product images
    const fetchPurchases = async () => {
      if (!user) {
        setPurchasesLoading(false)
        return
      }

      setPurchasesLoading(true)
      try {
        const data = await getPurchasesByUser(user.uid)
        setPurchases(data)

        // Fetch product images for all purchases
        const imageMap: Record<string, string> = {}
        for (const purchase of data) {
          if (purchase.productId && !imageMap[purchase.productId]) {
            try {
              const product = await getProductById(purchase.productId)
              if (product?.image) {
                imageMap[purchase.productId] = product.image
              }
            } catch (err) {
              console.error(`Error fetching product ${purchase.productId}:`, err)
            }
          }
        }
        setProductImages(imageMap)
      } catch (err: any) {
        console.error('Error fetching purchases:', err)
        setPurchases([])
      } finally {
        setPurchasesLoading(false)
      }
    }

    fetchPurchases()
  }, [user])

  // Filter and sort purchases
  useEffect(() => {
    let filtered = [...purchases]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const aTime = toDate(a.createdAt)?.getTime() || 0
          const bTime = toDate(b.createdAt)?.getTime() || 0
          return bTime - aTime
        case 'oldest':
          const aTimeOld = toDate(a.createdAt)?.getTime() || 0
          const bTimeOld = toDate(b.createdAt)?.getTime() || 0
          return aTimeOld - bTimeOld
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'name-asc':
          return a.productName.localeCompare(b.productName)
        case 'name-desc':
          return b.productName.localeCompare(a.productName)
        default:
          return 0
      }
    })

    setFilteredPurchases(filtered)
    // Reset to page 1 when filters change
    setCurrentPage(1)
  }, [purchases, sortBy, statusFilter, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage)
  const startIndex = (currentPage - 1) * purchasesPerPage
  const endIndex = startIndex + purchasesPerPage
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Single Row Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
        {/* Welcome Back Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col h-full">
          <h2 className="mb-4 text-xl font-bold">Welcome Back</h2>
          <div className="space-y-2 flex-1">
            <p className="text-slate-600">
              <span className="font-semibold">Name:</span> {userProfile?.name || 'Not set'}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold">Email:</span> {user?.email}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold">Membership:</span>{' '}
              <span className="capitalize">{membershipTier === 'free' ? 'Free' : membershipTier}</span>
            </p>
          </div>
        </div>

        {/* Membership Card */}
        <div className="flex flex-col h-full">
          <MembershipCard />
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col h-full">
          <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
          <div className="space-y-3 flex-1">
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
              href="/volunteer"
              className="block rounded-lg border-2 border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Become a Volunteer
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

      {/* Recent Orders Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          {purchases.length > 0 && (
            <Link
              href="/dashboard/orders"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {purchasesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
              <p className="text-slate-600">Loading orders...</p>
            </div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-600 mb-4">No orders yet</p>
            <Link
              href="/shop"
              className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Visit Shop
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Sorting */}
            <div className="mb-4 space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="all">All Status</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-desc">Amount: High to Low</option>
                  <option value="amount-asc">Amount: Low to High</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            {filteredPurchases.length > 0 && (
              <p className="mb-4 text-sm text-slate-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPurchases.length)} of {filteredPurchases.length} order{filteredPurchases.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Orders List */}
            {filteredPurchases.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-600">No orders match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setSortBy('newest')
                  }}
                  className="mt-4 text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentPurchases.map((purchase) => {
                    const purchaseDate = toDate(purchase.createdAt)
                    const productImage = productImages[purchase.productId] || '/images/placeholder.png'
                    return (
                      <div
                        key={purchase.id}
                        className="grid grid-cols-4 gap-4 items-center rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden">
                          <img
                            src={productImage}
                            alt={purchase.productName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/placeholder.png'
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{purchase.productName}</h3>
                          {purchase.description && (
                            <p className="text-xs text-slate-500 mt-1 truncate">{purchase.description}</p>
                          )}
                        </div>

                        {/* Purchase Date */}
                        <div className="text-sm text-slate-600">
                          <p className="font-medium text-slate-500 text-xs mb-1">Purchase Date</p>
                          <p>{formatDate(purchaseDate)}</p>
                        </div>

                        {/* Price and Status */}
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 mb-1">
                            ${purchase.amount.toFixed(2)}
                          </p>
                          <div
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                              purchase.status === 'succeeded'
                                ? 'bg-green-100 text-green-700'
                                : purchase.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {purchase.status}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-slate-900 text-white'
                                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-1 text-sm text-slate-400">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

