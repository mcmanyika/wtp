'use client'

import Header from '../components/Header';
import { EducationIcon, AdvocacyIcon, CommunityIcon } from '../components/Icons';
import type { ReactNode } from 'react';
import Link from 'next/link';

export default function OurWorkPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:mb-3 sm:text-sm">Our Work</p>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl">What We Do</h1>
            <p className="mx-auto max-w-3xl text-lg text-slate-300 sm:text-xl">
              Through education, advocacy, and community engagement, we work to defend constitutional supremacy and promote democratic governance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<EducationIcon />}
              title="Education"
              description="Conducting civic education sessions, workshops, and community forums to inform citizens about the ED 2030 agenda, constitutional rights, and responsibilities."
            />
            <FeatureCard
              icon={<AdvocacyIcon />}
              title="Advocacy"
              description="Advocating against the ED 2030 agenda while promoting transparent governance, accountability, and adherence to constitutional principles at all levels of government."
            />
            <FeatureCard
              icon={<CommunityIcon />}
              title="Community Engagement"
              description="Building local chapters and networks to facilitate grassroots participation and collective action against the ED 2030 agenda and for constitutional governance."
            />
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="bg-slate-50 py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl md:text-5xl">Our Approach</h2>
            <div className="space-y-6 text-lg leading-relaxed text-slate-700 sm:text-xl">
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
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-12 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Get Involved</h2>
          <p className="mb-8 text-lg text-slate-300 sm:text-xl">
            Join us in defending the Constitution and promoting democratic governance in Zimbabwe.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              Join the Platform
            </Link>
            <Link
              href="/#contact"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
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
            <p>© 2026 Defend the Constitution Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="group animate-fade-in-scale rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg sm:p-8">
      <div className="mb-4 text-slate-900 transition-transform duration-300 group-hover:scale-110 group-hover:text-slate-700">
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-bold transition-colors duration-300 group-hover:text-slate-900 sm:text-xl">{title}</h3>
      <p className="text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-700 sm:text-base">{description}</p>
    </div>
  );
}

