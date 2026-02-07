'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/donations', label: 'Donations' },
  { href: '/dashboard/membership', label: 'Membership' },
  { href: '/dashboard/volunteer', label: 'Volunteer' },
  { href: '/dashboard/resources', label: 'Resources' },
]

const adminNavItems = [
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/products', label: 'Products' },
  { href: '/dashboard/admin/orders', label: 'Orders' },
  { href: '/dashboard/admin/news', label: 'Articles' },
  { href: '/dashboard/admin/petitions', label: 'Petitions' },
  { href: '/dashboard/admin/volunteers', label: 'Volunteers' },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
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
                <div className="border-l border-slate-300 h-6 mx-2"></div>
                <span className="px-1 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Admin
                </span>
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
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
      </div>
    </nav>
  )
}

