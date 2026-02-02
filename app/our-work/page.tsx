'use client'

import { useState } from 'react'
import Header from '../components/Header';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'
import { createNewsletterSubscription } from '@/lib/firebase/firestore'

export default function OurWorkPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 text-white sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Our Work</p>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">What We Do</h1>
            <p className="mx-auto max-w-3xl text-sm text-slate-300 sm:text-base">
              Through education, advocacy, and community engagement, we work to defend constitutional supremacy and promote democratic governance.
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
                The Defend the Constitution Platform (DCP) employs a multi-faceted approach to protect and promote constitutional governance in Zimbabwe. Our work is grounded in the belief that an informed and engaged citizenry is essential for democratic accountability.
              </p>
              <p>
                Through our comprehensive programs, we aim to empower citizens with knowledge, provide platforms for collective action, and advocate for policies that uphold the principles enshrined in our Constitution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 text-white sm:py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl">Get Involved</h2>
          <p className="mb-6 text-sm text-slate-300 sm:text-base">
            Join us in defending the Constitution and promoting democratic governance in Zimbabwe.
          </p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
            >
              Join the Platform
            </Link>
            <Link
              href="/#contact"
              className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-5 py-2.5 text-xs font-semibold hover:bg-white/10 transition-colors sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
                  DCP
                </div>
                <div>
                  <p className="font-bold">Defend the Constitution</p>
                  <p className="text-xs text-slate-400">Platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                A citizen-led movement opposing the ED 2030 agenda, promoting lawful governance, public accountability, and peaceful civic participation.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/our-work" className="hover:text-white transition-colors">Our Work</Link></li>
              </ul>
            </div>

            <div>
              <div className="mb-4 h-6"></div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link href="/#contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Subscribe to Newsletter</h3>
              <p className="mb-4 text-sm text-slate-400">
                Stay updated with our latest news and announcements.
              </p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault()
                  setLoading(true)
                  setError('')
                  setSuccess(false)

                  // Validation
                  if (!email.trim()) {
                    setError('Please enter your email address')
                    setLoading(false)
                    return
                  }
                  if (!email.includes('@')) {
                    setError('Please enter a valid email address')
                    setLoading(false)
                    return
                  }

                  try {
                    await createNewsletterSubscription({
                      email: email.trim(),
                      userId: user?.uid,
                    })
                    setSuccess(true)
                    setEmail('')
                    setTimeout(() => setSuccess(false), 5000)
                  } catch (err: any) {
                    console.error('Error subscribing to newsletter:', err)
                    setError(err.message || 'Failed to subscribe. Please try again.')
                  } finally {
                    setLoading(false)
                  }
                }}
                className="space-y-2"
              >
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-800">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-xs text-green-800">
                    Thank you! You have been subscribed to our newsletter.
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-white px-6 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-400 sm:mt-12 sm:pt-8 sm:text-sm">
            <p>© 2026 Defend the Constitution Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}


