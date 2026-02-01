'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContactForm from './components/ContactForm';
import DonationModal from './components/DonationModal';

export default function Home() {
  const [donationModalOpen, setDonationModalOpen] = useState(false)

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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header onDonateClick={() => setDonationModalOpen(true)} />

      <HeroSection onSupportClick={() => setDonationModalOpen(true)} />

      {/* Stats Section */}
      <section className="border-y bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            <StatCard value="40+" label="Communities Reached" />
            <StatCard value="120+" label="Civic Sessions" />
            <StatCard value="300+" label="Volunteers" />
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section id="updates" className="bg-slate-50 py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:mb-3 sm:text-sm">Latest News</p>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">Updates & Announcements</h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <UpdateCard
              title="New Chapter Launch"
              description="We're excited to announce the opening of three new local chapters this month, expanding our reach to more communities."
              date="January 15, 2024"
            />
            <UpdateCard
              title="Civic Education Series"
              description="Join us for our upcoming series of workshops on constitutional rights and responsibilities, starting next week."
              date="January 10, 2024"
            />
            <UpdateCard
              title="Community Forum Success"
              description="Our recent community forum brought together over 200 citizens to discuss local governance and accountability measures."
              date="January 5, 2024"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-12 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Ready to Make a Difference?</h2>
          <p className="mb-8 text-lg text-slate-300 sm:text-xl">
            Join thousands of citizens working together to oppose the ED 2030 agenda, defend the Constitution, and protect our democratic values.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              Join the Platform
            </Link>
            <button
              onClick={() => setDonationModalOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              Support Our Work
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:mb-3 sm:text-sm">Get in Touch</p>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">Contact Us</h2>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border bg-slate-50 p-6 sm:p-8">
              <p className="mb-4 text-center text-base text-slate-600 sm:text-lg">
                Have questions or want to get involved? Reach out to us through your local chapter or use the contact form below.
              </p>
              <ContactForm />
            </div>
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
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><Link href="/our-work" className="hover:text-white transition-colors">Our Work</Link></li>
              </ul>
            </div>

            <div>
              <div className="mb-4 h-6"></div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Subscribe to Newsletter</h3>
              <p className="mb-4 text-sm text-slate-400">
                Stay updated with our latest news and announcements.
              </p>
              <form className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white px-6 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-400 sm:mt-12 sm:pt-8 sm:text-sm">
            <p>© 2024 Defend the Constitution Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />
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
    <div className="group animate-fade-in-scale rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:scale-105 hover:border-slate-900 hover:shadow-lg sm:p-6">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition-colors duration-300 group-hover:text-slate-600 sm:text-xs">{date}</p>
      <h3 className="mb-3 text-base font-bold transition-colors duration-300 group-hover:text-slate-900 sm:text-lg">{title}</h3>
      <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700 sm:text-sm">{description}</p>
    </div>
  );
}
