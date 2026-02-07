'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { href: '/dashboard/donations', label: 'Donations', icon: '💰' },
  { href: '/dashboard/membership', label: 'Membership', icon: '🏅' },
  { href: '/dashboard/volunteer', label: 'Volunteer', icon: '🤝' },
  { href: '/dashboard/resources', label: 'Resources', icon: '📚' },
]

const adminNavItems = [
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/products', label: 'Products', icon: '🛍️' },
  { href: '/dashboard/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/dashboard/admin/news', label: 'Articles', icon: '📰' },
  { href: '/dashboard/admin/petitions', label: 'Petitions', icon: '✍️' },
  { href: '/dashboard/admin/volunteers', label: 'Volunteers', icon: '🙋' },
  { href: '/dashboard/admin/banners', label: 'Banners', icon: '🖼️' },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  const allItems = isAdmin ? [...navItems, ...adminNavItems] : navItems
  const activeLabel = allItems.find(item => item.href === pathname)?.label || 'Dashboard'

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Desktop: scrollable horizontal nav */}
        <div className="hidden md:block overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-max">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors lg:px-4 lg:text-sm ${
                  pathname === item.href
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="mx-2 h-5 border-l border-slate-300"></div>
                <span className="whitespace-nowrap px-2 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">
                  Admin
                </span>
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors lg:px-4 lg:text-sm ${
                      pathname === item.href
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Mobile: dropdown nav */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex w-full items-center justify-between py-3"
          >
            <span className="text-sm font-semibold text-slate-900">{activeLabel}</span>
            <svg
              className={`h-4 w-4 text-slate-500 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileOpen && (
            <div className="border-t border-slate-100 pb-3">
              <div className="grid grid-cols-3 gap-1 py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-center transition-colors ${
                      pathname === item.href
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                  </Link>
                ))}
              </div>
              {isAdmin && (
                <>
                  <div className="my-2 border-t border-slate-200 pt-2">
                    <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Admin
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-center transition-colors ${
                          pathname === item.href
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

