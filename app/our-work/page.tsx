'use client'

import Header from '../components/Header';
import Footer from '@/app/components/Footer'
import CTASection from '@/app/components/CTASection'

export default function OurWorkPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 pt-24 pb-8 text-white sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Our Work</p>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">What We Do</h1>
            <p className="mx-auto max-w-3xl text-sm text-slate-300 sm:text-base">
              Through expert knowledge, verified services, and structured participation, we connect Zimbabwe&apos;s diaspora to trusted information and opportunities.
            </p>
          </div>
        </div>
      </section>


      {/* Additional Content Section */}
      <section className="bg-slate-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl md:text-4xl">Our Approach</h2>
            <div className="space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                We The People (WTP) gathers expert knowledge through structured podcast interviews with bankers, lawyers, policymakers, investors, and industry leaders. This knowledge is transformed into structured guides, directories, dashboards, and services accessible through our platform.
              </p>
              <p>
                We focus on key areas of concern to the diaspora — investment, property ownership, banking, remittances, pensions, legal and citizenship matters, business opportunities, return planning, and voting and civic participation. Our goal is to increase transparency, reduce fraud, and enable informed decision-making for Zimbabweans abroad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
