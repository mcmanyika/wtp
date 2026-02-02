'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContactForm from './components/ContactForm';
import DonationModal from './components/DonationModal';
import Chatbot from './components/Chatbot';
import { getNews, createNewsletterSubscription } from '@/lib/firebase/firestore';
import type { News } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth()
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [news, setNews] = useState<News[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')

  useEffect(() => {
    // Handle hash navigation to open modal
    const handleHashChange = () => {
      if (window.location.hash === '#donate') {
        setDonationModalOpen(true)
        // Remove hash from URL without scrolling
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    // Check on mount
    if (window.location.hash === '#donate') {
      setDonationModalOpen(true)
      window.history.replaceState(null, '', window.location.pathname)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true)
        const publishedNews = await getNews(true) // Get only published news
        // Limit to 3 most recent
        setNews(publishedNews.slice(0, 3))
      } catch (error) {
        console.error('Error loading news:', error)
      } finally {
        setNewsLoading(false)
      }
    }
    loadNews()
  }, [])

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header onDonateClick={() => setDonationModalOpen(true)} />

      <HeroSection onSupportClick={() => setDonationModalOpen(true)} />

      {/* Stats Section - Hidden for now */}
      {/* <section className="border-y bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            <StatCard value="40+" label="Communities Reached" />
            <StatCard value="120+" label="Civic Sessions" />
            <StatCard value="300+" label="Volunteers" />
          </div>
        </div>
      </section> */}

      {/* Updates Section */}
      <section id="updates" className="bg-slate-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 text-center sm:mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Latest News</p>
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Updates & Announcements</h2>
          </div>

          {newsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-slate-900 border-r-transparent"></div>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No news updates at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {news.map((newsItem) => (
                <UpdateCard
                  key={newsItem.id}
                  title={newsItem.title}
                  description={newsItem.description}
                  date={
                    newsItem.publishedAt
                      ? new Date(
                          newsItem.publishedAt instanceof Date
                            ? newsItem.publishedAt.getTime()
                            : (newsItem.publishedAt as any)?.toMillis?.() || 0
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : new Date(
                          newsItem.createdAt instanceof Date
                            ? newsItem.createdAt.getTime()
                            : (newsItem.createdAt as any)?.toMillis?.() || 0
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 text-white sm:py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl">Ready to Make a Difference?</h2>
          <p className="mb-6 text-sm text-slate-300 sm:text-base">
            Join thousands of citizens working together to oppose the ED 2030 agenda, defend the Constitution, and protect our democratic values.
          </p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
            >
              Join the Platform
            </Link>
            <button
              onClick={() => setDonationModalOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-5 py-2.5 text-xs font-semibold hover:bg-white/10 transition-colors sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
            >
              Support Our Work
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 text-center sm:mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Get in Touch</p>
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Contact Us</h2>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border bg-slate-50 p-4 sm:p-6">
              <p className="mb-4 text-center text-sm text-slate-600">
                Have questions or want to get involved? Reach out to us through your local chapter or use the contact form below.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-bold text-black">
                  DCP
                </div>
                <div>
                  <p className="text-xs font-bold">Defend the Constitution</p>
                  <p className="text-[10px] text-slate-400">Platform</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                A citizen-led movement opposing the ED 2030 agenda, promoting lawful governance, public accountability, and peaceful civic participation.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold">Quick Links</h3>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><Link href="/our-work" className="hover:text-white transition-colors">Our Work</Link></li>
              </ul>
            </div>

            <div>
              <div className="mb-3 h-4"></div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold">Newsletter</h3>
              <p className="mb-3 text-xs text-slate-400">
                Stay updated with our latest news.
              </p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault()
                  setNewsletterLoading(true)
                  setNewsletterError('')
                  setNewsletterSuccess(false)

                  // Validation
                  if (!newsletterEmail.trim()) {
                    setNewsletterError('Please enter your email address')
                    setNewsletterLoading(false)
                    return
                  }
                  if (!newsletterEmail.includes('@')) {
                    setNewsletterError('Please enter a valid email address')
                    setNewsletterLoading(false)
                    return
                  }

                  try {
                    await createNewsletterSubscription({
                      email: newsletterEmail.trim(),
                      userId: user?.uid,
                    })
                    setNewsletterSuccess(true)
                    setNewsletterEmail('')
                    setTimeout(() => setNewsletterSuccess(false), 5000)
                  } catch (err: any) {
                    console.error('Error subscribing to newsletter:', err)
                    setNewsletterError(err.message || 'Failed to subscribe. Please try again.')
                  } finally {
                    setNewsletterLoading(false)
                  }
                }}
                className="space-y-2"
              >
                {newsletterError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-[10px] text-red-800">
                    {newsletterError}
                  </div>
                )}
                {newsletterSuccess && (
                  <div className="rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-[10px] text-green-800">
                    Thank you! You have been subscribed.
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterLoading}
                    className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="rounded-md bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {newsletterLoading ? '...' : 'Subscribe'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center text-[10px] text-slate-400 sm:text-xs">
            <p>© 2026 Defend the Constitution Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />

      {/* Chatbot */}
      <Chatbot />
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="animate-fade-in-scale text-center transition-all duration-300 hover:scale-105">
      <p className="mb-2 text-3xl font-bold text-slate-900 transition-colors duration-300 hover:text-slate-700 sm:text-4xl">{value}</p>
      <p className="text-xs text-slate-600 transition-colors duration-300 hover:text-slate-800 sm:text-sm">{label}</p>
    </div>
  );
}

function FocusCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group animate-fade-in-scale rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:scale-105 hover:border-slate-900 hover:shadow-lg sm:p-6">
      <h3 className="mb-2 text-base font-bold transition-colors duration-300 group-hover:text-slate-900 sm:text-lg">{title}</h3>
      <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700 sm:text-sm">{description}</p>
    </div>
  );
}

function UpdateCard({ title, description, date }: { title: string; description: string; date: string }) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-slate-900 hover:shadow-md sm:p-5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition-colors duration-300 group-hover:text-slate-600">{date}</p>
      <h3 className="mb-2 text-sm font-bold transition-colors duration-300 group-hover:text-slate-900 sm:text-base">{title}</h3>
      <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700 line-clamp-3">{description}</p>
    </div>
  );
}
