'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { getNews } from '@/lib/firebase/firestore'
import type { News } from '@/types'

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        const allNews = await getNews(true) // published only
        setNews(allNews)
      } catch (err) {
        console.error('Error loading news:', err)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  const formatDate = (date: any) => {
    if (!date) return ''
    const d = date instanceof Date ? date : date?.toDate?.() || new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(news.map(n => n.category).filter(Boolean)))]

  // Filter news
  const filteredNews = news.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-slate-900 text-white pt-24 pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Latest Articles</p>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Updates & Announcements</h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto sm:text-base">
            Stay informed about the latest developments, events, and announcements from the Defend the Constitution Platform.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as string)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : (cat as string).charAt(0).toUpperCase() + (cat as string).slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="bg-slate-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
                <p className="text-slate-500">Loading articles...</p>
              </div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4 text-6xl">📰</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No Articles Found</h2>
              <p className="text-sm text-slate-500">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No articles at the moment. Check back later!'}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                  className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'} found
                  {totalPages > 1 && (
                    <span className="ml-1">· Page {currentPage} of {totalPages}</span>
                  )}
                </p>
              </div>
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {paginatedNews.map((newsItem) => (
                  <Link
                    key={newsItem.id}
                    href={`/news/${newsItem.id}`}
                    className="group block rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-slate-900 hover:shadow-md sm:p-5"
                  >
                    {/* Image */}
                    {newsItem.image && (
                      <div className="mb-3 overflow-hidden rounded-md">
                        <img
                          src={newsItem.image}
                          alt={newsItem.title}
                          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Category & Date */}
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      {newsItem.category && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 rounded-full">
                          {newsItem.category}
                        </span>
                      )}
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                        {formatDate(newsItem.publishedAt || newsItem.createdAt)}
                      </p>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-sm font-bold transition-colors duration-300 group-hover:text-slate-900 sm:text-base">
                      {newsItem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700 line-clamp-3">
                      {newsItem.description}
                    </p>

                    {/* Author */}
                    {newsItem.author && (
                      <p className="mt-3 text-[10px] text-slate-400">
                        By {newsItem.author}
                      </p>
                    )}

                    {/* Read More */}
                    <div className="mt-3 flex items-center text-xs font-semibold text-slate-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Read more
                      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current, and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      }
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-1 text-slate-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <img
                  src="/images/logo.png"
                  alt="DCP Logo"
                  className="h-10 w-10 rounded-md object-contain"
                />
                <div>
                  <p className="text-xs font-bold">Defend the Constitution</p>
                  <p className="text-[10px] text-slate-400">Platform</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                A citizen-led movement opposing the 2030 agenda, promoting lawful governance, public accountability, and peaceful civic participation.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold">Quick Links</h3>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/our-work" className="hover:text-white transition-colors">Our Work</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">Articles</Link></li>
              </ul>
            </div>

            <div>
              <div className="mb-3 h-4"></div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link href="/#contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold">Follow Us</h3>
              <p className="mb-3 text-xs text-slate-400">
                Connect with us on social media.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <a href="https://x.com/DCPlatform25" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="X (Twitter)">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/share/1C4G3L4eka/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://youtube.com/@defendtheconstitutionplatform" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors" aria-label="YouTube">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@defend.the.consti" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="TikTok">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/dcplaform25" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E4405F] transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://whatsapp.com/channel/0029VbCeX3FATRSwXmceVg3z" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors" aria-label="WhatsApp Channel">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center text-[10px] text-slate-400 sm:text-xs">
            <p>© 2026 Defend the Constitution Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

