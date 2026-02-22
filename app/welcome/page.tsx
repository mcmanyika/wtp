'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import DonationModal from '@/app/components/DonationModal'

function WelcomeContent() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next')
  const [donationModalOpen, setDonationModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Auto-show donation modal on first visit
  useEffect(() => {
    if (!loading && user) {
      const hasSeenDonateModal = sessionStorage.getItem('welcome_donate_shown')
      if (!hasSeenDonateModal) {
        const timer = setTimeout(() => {
          setDonationModalOpen(true)
          sessionStorage.setItem('welcome_donate_shown', '1')
        }, 1500) // slight delay so user reads the welcome message first
        return () => clearTimeout(timer)
      }
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const displayName = userProfile?.name || user?.displayName || 'Member'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Full-width Header */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-center">
          <Link href="/">
            <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-extrabold text-white hover:opacity-80 transition-opacity cursor-pointer">WTP</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome to We The People
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Zimbabwe&rsquo;s Diaspora Intelligence Platform
          </p>
        </div>
      </div>

      {/* Message Body */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
            Dear <strong className="text-slate-900">{displayName}</strong>,
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            Thank you for joining <strong>We The People (WTP)</strong>.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            By becoming part of this platform, you have joined a growing community of diaspora Zimbabweans
            committed to a shared vision:{' '}
            <strong className="text-slate-900">investing safely, accessing trusted services, and participating meaningfully in Zimbabwe&apos;s development.</strong>
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            WTP is a centralized, trusted digital platform connecting Zimbabwe and its global diaspora through
            verified knowledge, expert insights, and structured economic and civic participation. Our content is
            powered by structured podcast interviews with bankers, lawyers, policymakers, investors, and industry
            leaders &mdash; transforming expert knowledge into actionable guides, directories, and services.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-4">
            As a member, you can:
          </p>

          <ul className="mb-6 space-y-3">
            {[
              'Access expert-verified guides on investment, banking, and property',
              'Connect with trusted, vetted service providers',
              'Navigate legal, citizenship, and pension matters with confidence',
              'Participate in civic engagement and national development from abroad',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-base text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            We encourage you to explore the platform, stay engaged with our expert content, and share
            WTP with fellow Zimbabweans abroad. Together, we can transform diaspora contribution from
            informal and fragmented support into structured, scalable national development.
          </p>

          {/* Highlight Quote */}
          <div className="mb-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 py-4 px-5">
            <p className="text-base sm:text-lg font-semibold italic text-slate-900">
              Connecting Zimbabwe and its global citizens for a stronger future.
            </p>
          </div>

          <p className="text-base text-slate-700 leading-relaxed mb-8">
            Your support helps us continue building this critical infrastructure. Consider a contribution of{' '}
            <strong className="text-slate-900">USD5 per month</strong> or{' '}
            <strong className="text-slate-900">USD60 per annum</strong> to help us grow the platform and
            reach more of our compatriots worldwide.
          </p>

          {/* Signature */}
          <div className="mb-8 border-t border-slate-100 pt-6">
            <p className="text-base text-slate-700 mb-1">Warm regards,</p>
            <p className="text-base font-bold text-slate-900">The WTP Team</p>
            <p className="text-sm text-slate-500">We The People (WTP)</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={nextUrl || '/membership-application'}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              {nextUrl ? 'Continue →' : 'Apply for Membership →'}
            </Link>
            <button
              onClick={() => setDonationModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Donate
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />

      {/* Footer */}
      <div className="border-t bg-slate-100 py-6 text-center">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} We The People. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  )
}
