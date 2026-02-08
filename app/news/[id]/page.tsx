'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { getNewsById } from '@/lib/firebase/firestore'
import type { News } from '@/types'
import Link from 'next/link'

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const newsItem = await getNewsById(id)
        
        if (!newsItem) {
          setError('Article not found')
          return
        }
        
        // Only show published articles to public
        if (!newsItem.isPublished) {
          setError('This article is not available')
          return
        }
        
        setNews(newsItem)
      } catch (err: any) {
        console.error('Error loading news:', err)
        setError(err.message || 'Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadNews()
    }
  }, [params.id])

  const formatDate = (date: any) => {
    if (!date) return ''
    const d = date instanceof Date ? date : date?.toDate?.() || new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Back Link */}
      <div className="bg-slate-50 border-b pt-20">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link
            href="/news"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
              <p className="text-slate-500">Loading article...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="mb-4 text-6xl">📰</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Article Not Found</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/news"
              className="inline-flex items-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              View All Articles
            </Link>
          </div>
        ) : news ? (
          <article>
            {/* Category Badge */}
            {news.category && (
              <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 rounded-full">
                {news.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4 sm:text-4xl md:text-5xl">
              {news.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b">
              <span>{formatDate(news.publishedAt || news.createdAt)}</span>
              {news.author && (
                <>
                  <span>•</span>
                  <span>By {news.author}</span>
                </>
              )}
            </div>

            {/* Featured Image */}
            {news.image && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <p className="text-lg text-slate-700 leading-relaxed font-medium">
                {news.description}
              </p>
            </div>

            {/* Full Content */}
            {news.content && (
              <div 
                className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-700 prose-a:text-slate-900 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            )}

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Share this article</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const url = window.location.href
                    const text = `${news.title} - ${url}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href
                    const text = `${news.title}`
                    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link copied to clipboard!')
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </article>
        ) : null}
      </div>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Defend the Constitution Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

