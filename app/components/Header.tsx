'use client';

import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-black backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-black sm:h-10 sm:w-10 sm:text-sm">
            DCP
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-white sm:text-sm">Defend the Constitution</p>
            <p className="text-[10px] text-slate-400 sm:text-xs">Platform</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          <a href="#intro" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
          <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
          <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">What We Do</a>
          <a href="#focus" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Focus Areas</a>
          <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#join"
            className="hidden rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors sm:px-4 sm:py-2 sm:text-sm md:inline-flex"
          >
            Join
          </a>
          <a
            href="#donate"
            className="inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-slate-100 transition-colors sm:px-4 sm:py-2 sm:text-sm"
          >
            Donate
          </a>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-2 inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-slate-800 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-black md:hidden">
          <nav className="flex flex-col space-y-1 px-4 py-4">
            <a
              href="#intro"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              What We Do
            </a>
            <a
              href="#focus"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Focus Areas
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Contact
            </a>
            <a
              href="#join"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Join
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

