'use client'

import Link from 'next/link'
import Header from '../components/Header'
import Footer from '@/app/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-emerald-100/25 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 sm:text-sm">
            About Us
          </p>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Why Diaspora Connect
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Zimbabwe&rsquo;s diaspora contributes billions annually through remittances, investment, and business. Diaspora Connect is the trusted digital infrastructure that turns that contribution into structured national development.
          </p>
        </div>
      </section>

      {/* ── The Challenge ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">The Challenge</p>
              <h2 className="mb-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                A diaspora disconnected from opportunity
              </h2>
              <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
                Despite their critical economic role, Zimbabweans abroad face significant challenges — unreliable information, unverified service providers, risky investment channels, and unclear guidance on legal, financial, and civic matters.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { label: 'Fragmented information', desc: 'No single trusted source for diaspora-relevant knowledge.' },
                { label: 'Fraud & risk', desc: 'Unverified providers and opaque investment opportunities.' },
                { label: 'Civic disconnect', desc: 'Limited pathways for voting, policy input, and national participation.' },
                { label: 'No digital home', desc: 'No centralized platform purpose-built for diaspora needs.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">{item.label}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{item.desc}</p>
                  </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Solution ── */}
      <section className="bg-emerald-50/50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">The Solution</p>
            <h2 className="mb-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Diaspora Connect addresses this gap
            </h2>
            <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
              A centralized, trusted digital platform connecting Zimbabwe&rsquo;s global diaspora to verified knowledge, services, and opportunities.
              </p>
            </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
                title: 'Expert-Verified Knowledge',
                desc: 'Built from structured interviews with bankers, lawyers, investors, and policymakers.',
              },
              {
                icon: <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
                title: 'Trusted Directories',
                desc: 'Vetted professionals from property agents to legal advisors you can trust.',
              },
              {
                icon: <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
                title: 'Investment Guides',
                desc: 'Safe, verified opportunities for property, business, and financial growth.',
              },
              {
                icon: <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>,
                title: 'Legal & Citizenship',
                desc: 'Rights, pathways, pension entitlements, and verified legal professionals.',
              },
              {
                icon: <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 0-.668-.668 1.667 1.667 0 0 0-1.667 1.667v-.417a1.575 1.575 0 1 0-3.15 0" /></svg>,
                title: 'Civic Participation',
                desc: 'Voting, policy changes, and meaningful engagement from anywhere.',
              },
              {
                icon: <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>,
                title: 'Banking & Remittances',
                desc: 'Secure channels and expert guidance on moving money affordably.',
              },
            ].map((item) => (
              <div key={item.title} className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="mb-1.5 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission */}
            <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-extrabold text-slate-900 sm:text-2xl">Our Mission</h3>
              <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                To transform diaspora contribution from informal and fragmented support into structured, trusted, and scalable national development. By increasing transparency, reducing fraud, improving access to services, and enabling informed decision-making, Diaspora Connect strengthens the connection between Zimbabwe and its global citizens.
              </p>
            </div>

            {/* Vision */}
            <div className="relative rounded-2xl bg-slate-900 p-8 text-white shadow-sm sm:p-10">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-extrabold sm:text-2xl">Our Vision</h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                Diaspora Connect represents a critical digital infrastructure layer that enables diaspora Zimbabweans to invest safely, access services confidently, and participate fully in shaping Zimbabwe&rsquo;s economic and civic future.
              </p>
              <p className="text-sm font-semibold leading-relaxed text-emerald-400 sm:text-base">
                Diaspora Connect is not just a platform — it&rsquo;s the diaspora&rsquo;s digital home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Powered by Expertise ── */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">Powered by Expertise</p>
            <h2 className="mb-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Knowledge from industry leaders
            </h2>
            <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
              Our platform is built on expert insights gathered through structured podcast interviews with Zimbabwe&rsquo;s top professionals.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>, label: 'Bankers', desc: 'Banking & finance experts' },
              { icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>, label: 'Lawyers', desc: 'Legal & citizenship specialists' },
              { icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>, label: 'Investors', desc: 'Investment & property advisors' },
              { icon: <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>, label: 'Policymakers', desc: 'Government & policy leaders' },
            ].map((expert) => (
              <div key={expert.label} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
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

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white py-20 sm:py-28">
        <div className="pointer-events-none absolute -left-60 top-0 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-60 bottom-0 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">Get Involved</p>
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
            Join the Platform
          </h2>
          <p className="mb-10 text-base text-slate-500 sm:text-lg">
            Connect with trusted information, verified services, and structured participation opportunities for Zimbabwe&rsquo;s global diaspora.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl sm:text-base"
            >
              Join the Platform
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/membership-application"
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-600 hover:text-emerald-700 sm:text-base"
            >
              Become a Member
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
