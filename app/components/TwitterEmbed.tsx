'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { getActiveTwitterEmbed } from '@/lib/firebase/firestore'

interface TwitterEmbedProps {
  hideAtSelectors?: string[]
}

export default function TwitterEmbed({ hideAtSelectors }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [tweetUrl, setTweetUrl] = useState<string | null>(null)
  const [loadingEmbed, setLoadingEmbed] = useState(true)
  const intersectionMap = useRef<Map<Element, boolean>>(new Map())

  // Stabilise the selectors so we don't re-create the observer on every render
  const selectorKey = useMemo(() => hideAtSelectors?.join(',') ?? '', [hideAtSelectors])

  // Fetch active embed from Firestore
  useEffect(() => {
    let cancelled = false
    async function fetchEmbed() {
      try {
        const embed = await getActiveTwitterEmbed()
        if (!cancelled) {
          setTweetUrl(embed?.tweetUrl ?? null)
        }
      } catch (err) {
        console.error('Error fetching active twitter embed:', err)
      } finally {
        if (!cancelled) setLoadingEmbed(false)
      }
    }
    fetchEmbed()
    return () => { cancelled = true }
  }, [])

  // Load Twitter widget script when panel opens
  useEffect(() => {
    if (!isOpen || !tweetUrl) return

    const scriptId = 'twitter-widgets-js'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
      script.onload = () => {
        if ((window as any).twttr?.widgets) {
          (window as any).twttr.widgets.load(containerRef.current)
        }
      }
    } else {
      setTimeout(() => {
        if ((window as any).twttr?.widgets) {
          (window as any).twttr.widgets.load(containerRef.current)
        }
      }, 100)
    }
  }, [isOpen, tweetUrl])

  // Hide when any of the target sections scroll into view
  useEffect(() => {
    if (!selectorKey) return

    const selectors = selectorKey.split(',')

    // The gallery section is conditionally rendered, so retry until all elements exist
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let observer: IntersectionObserver | null = null

    const setup = () => {
      const targets = selectors
        .map(sel => document.querySelector(sel))
        .filter(Boolean) as Element[]

      // If not all selectors found, retry in 500ms (e.g. gallery still loading)
      if (targets.length < selectors.length) {
        retryTimer = setTimeout(setup, 500)
        if (targets.length === 0) return
      }

      // Clean up previous observer if retrying
      if (observer) observer.disconnect()
      intersectionMap.current.clear()

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            intersectionMap.current.set(entry.target, entry.isIntersecting)
          })
          let anyVisible = false
          intersectionMap.current.forEach(val => {
            if (val) anyVisible = true
          })
          setVisible(!anyVisible)
        },
        { threshold: 0.05 }
      )

      targets.forEach(target => observer!.observe(target))
    }

    setup()

    return () => {
      if (retryTimer) clearTimeout(retryTimer)
      if (observer) observer.disconnect()
      intersectionMap.current.clear()
    }
  }, [selectorKey])

  // Don't render if no active embed or still loading
  if (loadingEmbed || !tweetUrl) return null
  if (!visible) return null

  return (
    <>
      {/* Floating X button — fixed top-right */}
      <div className="fixed right-6 top-24 z-40 flex flex-col items-center gap-2 transition-opacity duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isOpen
              ? 'bg-slate-900 text-white focus:ring-slate-900'
              : 'bg-white text-slate-900 border border-slate-200 focus:ring-slate-400'
          }`}
          aria-label="Toggle live X feed"
          title="Live on X"
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {/* Pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
            </>
          )}
        </button>
        {!isOpen && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 shadow-sm border border-slate-100">
            Live
          </span>
        )}
      </div>

      {/* Expanded tweet panel */}
      {isOpen && (
        <div className="fixed right-6 top-40 z-40 w-[340px] max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-[fadeInScale_0.2s_ease-out]">
          {/* Panel header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-bold text-slate-900">Live on X</span>
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tweet embed */}
          <div ref={containerRef} className="px-2 pb-3">
            <blockquote className="twitter-tweet" data-media-max-width="560">
              <a href={tweetUrl}></a>
            </blockquote>
          </div>
        </div>
      )}
    </>
  )
}
