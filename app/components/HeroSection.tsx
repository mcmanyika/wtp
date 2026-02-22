'use client';

import Link from 'next/link';

interface HeroSectionProps {
  onDonateClick?: () => void;
}

export default function HeroSection({ onDonateClick }: HeroSectionProps) {
  return (
    <section
      id="intro"
      className="relative flex h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/40"
    >
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-emerald-100/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-emerald-50/50 blur-3xl" />

      {/* Centered Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 animate-hero-reveal text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 sm:text-sm" style={{ animationDelay: '0.2s', opacity: 0 }}>
          Zimbabwe&rsquo;s Diaspora Intelligence Platform
        </p>
        <h1 className="mb-6 animate-hero-reveal text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: '0.4s', opacity: 0 }}>
          We The People
        </h1>
        <p className="mx-auto mb-10 max-w-2xl animate-hero-reveal text-base leading-relaxed text-slate-500 sm:text-lg md:text-xl" style={{ animationDelay: '0.6s', opacity: 0 }}>
          Trusted information, verified services, and structured participation — connecting Zimbabwe&rsquo;s global diaspora to invest safely, access services confidently, and shape our nation&rsquo;s future.
        </p>
        <div className="flex animate-hero-reveal flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '0.8s', opacity: 0 }}>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 sm:px-10 sm:py-4 sm:text-base"
          >
            Get Started
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-600 hover:text-emerald-700 sm:px-10 sm:py-4 sm:text-base"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Learn More
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-hero-reveal" style={{ animationDelay: '1.2s', opacity: 0 }}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-300">Scroll</span>
          <div className="h-10 w-6 rounded-full border-2 border-slate-200 p-1">
            <div className="h-2 w-full animate-bounce rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
