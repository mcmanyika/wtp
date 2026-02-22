'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContactForm from './components/ContactForm';
import DonationModal from './components/DonationModal';
import Chatbot from './components/Chatbot';
import TwitterEmbed from './components/TwitterEmbed';
import { createNewsletterSubscription, getGalleryImages } from '@/lib/firebase/firestore';
import type { GalleryImage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

/* ─────────────────────────────────────────────
   Scroll-reveal hook — triggers animation when
   an element enters the viewport
   ───────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ═══════════════════════════════════════════════
   MAIN HOME PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuth()
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [galleryLightbox, setGalleryLightbox] = useState<number | null>(null)
  const [contactOpen, setContactOpen] = useState(false)

  /* ── hash navigation for #donate ── */
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#donate') {
        setDonationModalOpen(true)
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
    if (window.location.hash === '#donate') {
      setDonationModalOpen(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  /* ── data loading ── */
  useEffect(() => {
    const loadGallery = async () => {
      try { setGalleryLoading(true); const images = await getGalleryImages(true); setGalleryImages(images.slice(0, 10)); }
      catch (error) { console.error('Error loading gallery:', error); }
      finally { setGalleryLoading(false); }
    }
    loadGallery()
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterLoading(true); setNewsletterError(''); setNewsletterSuccess(false)
    try {
      await createNewsletterSubscription({ email: newsletterEmail, userId: user?.uid })
      setNewsletterSuccess(true); setNewsletterEmail('')
    } catch (err: any) { setNewsletterError(err.message || 'Failed to subscribe') }
    finally { setNewsletterLoading(false) }
  }

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header onContactClick={() => setContactOpen(true)} />

      <HeroSection onDonateClick={() => setDonationModalOpen(true)} />

      {/* All content below hero */}
      <div className="relative z-10">

        {/* ━━━━ 1 · WELCOME / FEATURES (Atomlab-style icon boxes) ━━━━ */}
        <WelcomeFeatures />

        {/* ━━━━ 2 · POWERED BY EXPERTISE ━━━━ */}
        <PodcastSpotlight />

        {/* ━━━━ 3 · STATS COUNTERS ━━━━ */}
        <StatsCounters />

        {/* ━━━━ 4 · WHAT MAKES DC DIFFERENT (split section) ━━━━ */}
        <WhatMakesDifferent onDonateClick={() => setDonationModalOpen(true)} />

        {/* ━━━━ 5 · GALLERY ━━━━ */}
        <GallerySection images={galleryImages} loading={galleryLoading} lightboxIdx={galleryLightbox} setLightboxIdx={setGalleryLightbox} />

        {/* ━━━━ 10 · NEWSLETTER + CTA ━━━━ */}
        <ReadyToStart
          newsletterEmail={newsletterEmail}
          setNewsletterEmail={setNewsletterEmail}
          newsletterLoading={newsletterLoading}
          newsletterSuccess={newsletterSuccess}
          newsletterError={newsletterError}
          onSubmit={handleNewsletter}
        />

        {/* ━━━━ CONTACT MODAL ━━━━ */}
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}

        {/* ━━━━ 11 · FOOTER ━━━━ */}
        <SiteFooter onContactClick={() => setContactOpen(true)} />

      </div>

      {/* Modals & Overlays */}
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
      <Chatbot hideWhatsApp />
      <TwitterEmbed hideAtSelectors={['#gallery-section', '#donate-section', '#cta-section']} />
    </main>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS — following Atomlab Startup 03 patterns
   ═══════════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────
   1 · WELCOME FEATURES
   ────────────────────────────────── */
function WelcomeFeatures() {
  const r = useReveal();
  const features = [
    {
      icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>,
      title: 'Investment & Property',
      desc: 'Access verified investment opportunities, property guides, and trusted professionals to grow your wealth safely in Zimbabwe.',
    },
    {
      icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>,
      title: 'Banking & Remittances',
      desc: 'Navigate banking options, compare remittance channels, and access expert guidance on moving money securely and affordably.',
    },
    {
      icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>,
      title: 'Legal & Citizenship',
      desc: 'Understand your legal rights, citizenship pathways, pension entitlements, and access verified legal professionals.',
    },
    {
      icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 0-.668-.668 1.667 1.667 0 0 0-1.667 1.667v-.417a1.575 1.575 0 1 0-3.15 0" /></svg>,
      title: 'Civic Participation',
      desc: 'Stay informed on voting, policy changes, and civic matters. Participate meaningfully in shaping Zimbabwe\u2019s future from anywhere.',
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 lg:py-32">
      <div ref={r.ref} className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${r.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Section heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">What We Offer</p>
          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Everything Zimbabwe&rsquo;s<br />Diaspora Needs
          </h2>
          <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
            A centralized, trusted digital platform connecting you to verified knowledge, services, and opportunities for informed decision-making.
          </p>
        </div>

        {/* Feature boxes — 2×2 grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card-hover group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors sm:text-xl">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 sm:text-base">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────
   2 · POWERED BY EXPERTISE (replaces Countdown)
   ────────────────────────────────── */
function PodcastSpotlight() {
  return (
    <section className="relative overflow-hidden bg-emerald-50/60 py-16 sm:py-24">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="text-center mb-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">
            Powered by Expertise
          </p>
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
            Knowledge from Industry Leaders
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-500 sm:text-lg">
            Our platform is built on expert insights gathered through structured podcast interviews with Zimbabwe&rsquo;s top professionals.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>, label: 'Bankers', desc: 'Banking & finance experts' },
            { icon: <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>, label: 'Lawyers', desc: 'Legal & citizenship specialists' },
            { icon: <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>, label: 'Investors', desc: 'Investment & property advisors' },
            { icon: <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>, label: 'Policymakers', desc: 'Government & policy leaders' },
          ].map((expert) => (
            <div key={expert.label} className="flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                {expert.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{expert.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{expert.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────
   3 · STATS COUNTERS
   ────────────────────────────────── */
function StatsCounters() {
  const r = useReveal();
  const stats = [
    { value: '$1B+', label: 'Annual Diaspora Remittances' },
    { value: '3M+', label: 'Zimbabweans Abroad' },
    { value: '50+', label: 'Expert Interviews' },
    { value: '24/7', label: 'Platform Access' },
  ];

  return (
    <section className="border-y border-slate-100 bg-slate-50/60 py-16 sm:py-20">
      <div ref={r.ref} className={`mx-auto grid max-w-5xl grid-cols-2 gap-10 px-6 sm:grid-cols-4 transition-all duration-700 ${r.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {stats.map((s, i) => (
          <div key={s.label} className="text-center" style={{ transitionDelay: `${i * 120}ms` }}>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">{s.value}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────
   4 · WHAT MAKES DC DIFFERENT
   ────────────────────────────────── */
function WhatMakesDifferent({ onDonateClick }: { onDonateClick: () => void }) {
  const r = useReveal();
  return (
    <section className="bg-white py-20 sm:py-28">
      <div ref={r.ref} className={`mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-center transition-all duration-700 ${r.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Left — visual / illustration */}
        <div className="relative flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 shadow-lg">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-5xl font-extrabold text-slate-900">100%</p>
              <p className="mt-2 text-sm font-medium text-slate-500">Verified &amp; Trusted</p>
              <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-700">Transparent</p>
                  <p>Expert-verified</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-700">Secure</p>
                  <p>Data protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — text + features */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">Why Choose Diaspora Connect</p>
          <h2 className="mb-6 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            What makes We The<br />People different?
          </h2>

          <div className="mb-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Expert-Verified Knowledge</h3>
                <p className="mt-1 text-sm text-slate-500">Every guide, directory, and resource is built from structured interviews with bankers, lawyers, investors, and policymakers.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Trusted Service Providers</h3>
                <p className="mt-1 text-sm text-slate-500">Connect with vetted professionals — from property agents to legal advisors — reducing fraud and increasing confidence.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Built for the Diaspora</h3>
                <p className="mt-1 text-sm text-slate-500">Designed specifically for Zimbabweans abroad — accessible from anywhere, anytime, on any device.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 sm:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────
   5 · GALLERY
   ────────────────────────────────── */
function GallerySection({ images, loading, lightboxIdx, setLightboxIdx }: { images: GalleryImage[]; loading: boolean; lightboxIdx: number | null; setLightboxIdx: (i: number | null) => void }) {
  if (loading || images.length === 0) return null;

  return (
    <section id="gallery-section" className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">Gallery</p>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Our Journey in Pictures</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
              onClick={() => setLightboxIdx(index)}
            >
              <img src={image.imageUrl} alt={image.title || 'Gallery image'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex flex-col justify-between p-3 rounded-xl">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent((image.title || 'Gallery image') + ' – Diaspora Connect')}&url=${encodeURIComponent('https://dcpzim.com/gallery')}`, '_blank') }} className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors" title="Share on X">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dcpzim.com/gallery')}`, '_blank') }} className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors" title="Share on Facebook">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent((image.title || 'Gallery image') + ' – Diaspora Connect')}%20${encodeURIComponent('https://dcpzim.com/gallery')}`, '_blank') }} className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors" title="Share on WhatsApp">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.45 0-9.91 4.46-9.91 9.91 0 1.75.46 3.45 1.35 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.45 0 9.91-4.46 9.91-9.91S17.49 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.01 4.54-3.68 8.23-8.22 8.23z" /></svg>
                  </button>
                </div>
                {image.title && (
                  <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">{image.title}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/gallery" className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900">
            View Full Gallery
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setLightboxIdx(null)}>
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {lightboxIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {lightboxIdx < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <div className="relative max-w-4xl w-full max-h-[85vh] animate-[fadeInScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightboxIdx].imageUrl} alt={images[lightboxIdx].title || 'Gallery image'} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
            {images[lightboxIdx].title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg px-4 py-3">
                <p className="text-white text-sm font-medium">{images[lightboxIdx].title}</p>
                {images[lightboxIdx].categoryName && (<p className="text-white/60 text-xs">{images[lightboxIdx].categoryName}</p>)}
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">{lightboxIdx + 1} / {images.length}</div>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────
   7 · READY TO START (newsletter CTA)
   ────────────────────────────────── */
function ReadyToStart({ newsletterEmail, setNewsletterEmail, newsletterLoading, newsletterSuccess, newsletterError, onSubmit }: {
  newsletterEmail: string; setNewsletterEmail: (s: string) => void;
  newsletterLoading: boolean; newsletterSuccess: boolean; newsletterError: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <section id="cta-section" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-60 top-0 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-60 bottom-0 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">Stay Connected</p>
        <h2 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">Ready to Get Started?</h2>
        <p className="mb-10 text-base text-slate-500 sm:text-lg">
          Join thousands of Zimbabweans abroad who are investing safely, accessing trusted services, and participating in national development.
        </p>

        {/* Newsletter subscribe */}
        <form onSubmit={onSubmit} className="mx-auto mb-6 flex max-w-lg flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
            className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          />
          <button
            type="submit"
            disabled={newsletterLoading}
            className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl disabled:opacity-50"
          >
            {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {newsletterSuccess && <p className="text-sm text-emerald-600">Thank you for subscribing!</p>}
        {newsletterError && <p className="text-sm text-red-500">{newsletterError}</p>}

      </div>
    </section>
  );
}

/* ──────────────────────────────────
   CONTACT MODAL
   ────────────────────────────────── */
function ContactModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-[fadeInScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors">
          <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Contact Us</h2>
          <p className="text-sm text-slate-500 mt-1">We&apos;d love to hear from you</p>
        </div>
        <div className="p-6">
          <p className="mb-5 text-sm text-slate-600">Have questions or want to get involved? Reach out through the form below.</p>
          <ContactForm />
        </div>
        <div className="border-t bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="mailto:contact@wtp.com" className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              contact@wtp.com
            </a>
            <div className="flex items-center gap-3">
              <span className="text-slate-400" aria-label="X (Twitter)">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </span>
              <span className="text-slate-400" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   11 · FOOTER (Atomlab-style multi-column)
   ────────────────────────────────── */
function SiteFooter({ onContactClick }: { onContactClick: () => void }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-lg font-extrabold text-white">DC</span>
              <span className="text-lg font-bold text-slate-900">Diaspora Connect</span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Zimbabwe&apos;s diaspora intelligence platform — trusted information, verified services, and structured participation for our global community.
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.523 2.237a.625.625 0 0 0-.853.221l-1.09 1.837A7.628 7.628 0 0 0 12 3.5a7.628 7.628 0 0 0-3.58.795L7.33 2.458a.625.625 0 0 0-1.074.632l1.046 1.764A7.953 7.953 0 0 0 4 11h16a7.953 7.953 0 0 0-3.302-6.146l1.046-1.764a.625.625 0 0 0-.221-.853zM9 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM4 12v7a2 2 0 0 0 2 2h1v3a1.5 1.5 0 0 0 3 0v-3h4v3a1.5 1.5 0 0 0 3 0v-3h1a2 2 0 0 0 2-2v-7H4zm-2.5 0A1.5 1.5 0 0 0 0 13.5v5A1.5 1.5 0 0 0 3 18.5v-5A1.5 1.5 0 0 0 1.5 12zm21 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5a1.5 1.5 0 0 0-1.5-1.5z" />
              </svg>
              Download for Android
            </span>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Explore</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-slate-900 transition-colors">About Us</Link></li>
              <li><Link href="/our-work" className="hover:text-slate-900 transition-colors">Our Work</Link></li>
              <li><Link href="/surveys" className="hover:text-slate-900 transition-colors">Surveys</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Engage</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/news" className="hover:text-slate-900 transition-colors">Articles</Link></li>
              <li><button onClick={onContactClick} className="hover:text-slate-900 transition-colors">Contact</button></li>
              <li><Link href="/membership-application" className="hover:text-slate-900 transition-colors">Join DC</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Follow Us</h3>
            <p className="mb-4 text-sm text-slate-500">Connect with us on social media.</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-label="X (Twitter)">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-label="YouTube">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-label="TikTok">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          <p>&copy; 2026 Diaspora Connect. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <span className="mx-2">&middot;</span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
