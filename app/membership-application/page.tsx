'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getMembershipApplicationByUser } from '@/lib/firebase/firestore'
import MembershipApplicationForm from '@/app/components/MembershipApplicationForm'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

function MembershipApplicationContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkExistingApplication() {
      if (!user) return
      try {
        const existing = await getMembershipApplicationByUser(user.uid)
        if (existing) {
          router.replace('/dashboard')
          return
        }
      } catch (err) {
        console.error('Error checking existing application:', err)
      }
      setChecking(false)
    }
    checkExistingApplication()
  }, [user, router])

  if (checking) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <Header />
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 pt-24 pb-8 sm:pb-12">
          <div className="pointer-events-none absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 -bottom-40 h-[400px] w-[400px] rounded-full bg-emerald-100/30 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Join Diaspora Connect</p>
              <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">Membership Application</h1>
            </div>
          </div>
        </section>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
            <p className="text-slate-600">Checking application status...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 pt-24 pb-8 sm:pb-12">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 -bottom-40 h-[400px] w-[400px] rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Join Diaspora Connect</p>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">Membership Application</h1>
            <p className="text-sm text-slate-500 sm:text-base">Zimbabwe&apos;s Diaspora Intelligence Platform</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Form Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <MembershipApplicationForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function MembershipApplicationPage() {
  return (
    <ProtectedRoute>
      <MembershipApplicationContent />
    </ProtectedRoute>
  )
}
