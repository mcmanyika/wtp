'use client'

import ProtectedRoute from '@/app/components/ProtectedRoute'
import VolunteerApplicationForm from '@/app/components/VolunteerApplicationForm'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CTASection from '@/app/components/CTASection'

export default function VolunteerPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white text-slate-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 pt-24 pb-8 text-white sm:pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Make a Difference</p>
              <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">Become a Volunteer</h1>
              <p className="text-sm text-slate-300 sm:text-base">
                We&apos;re looking for passionate individuals who want to make a difference.
                Fill out the form below to apply to become a volunteer with Diaspora Connect.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <VolunteerApplicationForm />
            </div>
          </div>
        </section>

        <CTASection />
        <Footer />
      </main>
    </ProtectedRoute>
  )
}

