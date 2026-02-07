'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { UserProfile, Purchase, News, Petition, VolunteerApplication } from '@/types'

interface AdminChartsProps {
  users: UserProfile[]
  articles: News[]
  petitions: Petition[]
  purchases: Purchase[]
  volunteers: VolunteerApplication[]
}

function toDateSafe(date: any): Date {
  if (date instanceof Date) return date
  if (date && typeof date === 'object' && 'toDate' in date) return date.toDate()
  return new Date(date as string | number)
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Colors
const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0']
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899']
const STATUS_COLORS: Record<string, string> = {
  succeeded: '#10b981',
  pending: '#f59e0b',
  failed: '#ef4444',
  canceled: '#94a3b8',
}
const VOLUNTEER_STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#94a3b8',
}

export default function AdminCharts({ users, articles, petitions, purchases, volunteers }: AdminChartsProps) {
  // 1. User Growth Over Time (last 6 months)
  const userGrowthData = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: getMonthKey(d), label: getMonthLabel(d) })
    }

    const countsByMonth: Record<string, number> = {}
    months.forEach(m => { countsByMonth[m.key] = 0 })

    users.forEach(u => {
      const date = toDateSafe(u.createdAt)
      const key = getMonthKey(date)
      if (countsByMonth[key] !== undefined) {
        countsByMonth[key]++
      }
    })

    let cumulative = users.filter(u => {
      const d = toDateSafe(u.createdAt)
      return d < new Date(parseInt(months[0].key.split('-')[0]), parseInt(months[0].key.split('-')[1]) - 1, 1)
    }).length

    return months.map(m => {
      cumulative += countsByMonth[m.key]
      return {
        month: m.label,
        newUsers: countsByMonth[m.key],
        totalUsers: cumulative,
      }
    })
  }, [users])

  // 2. Revenue Over Time (last 6 months)
  const revenueData = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: getMonthKey(d), label: getMonthLabel(d) })
    }

    const revenueByMonth: Record<string, number> = {}
    const ordersByMonth: Record<string, number> = {}
    months.forEach(m => {
      revenueByMonth[m.key] = 0
      ordersByMonth[m.key] = 0
    })

    purchases.forEach(p => {
      if (p.status !== 'succeeded') return
      const date = toDateSafe(p.createdAt)
      const key = getMonthKey(date)
      if (revenueByMonth[key] !== undefined) {
        revenueByMonth[key] += p.amount
        ordersByMonth[key]++
      }
    })

    return months.map(m => ({
      month: m.label,
      revenue: Math.round(revenueByMonth[m.key] * 100) / 100,
      orders: ordersByMonth[m.key],
    }))
  }, [purchases])

  // 3. Order Status Distribution
  const orderStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    purchases.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name] || '#94a3b8',
    }))
  }, [purchases])

  // 4. Volunteer Status Distribution
  const volunteerStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    volunteers.forEach(v => {
      statusCounts[v.status] = (statusCounts[v.status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: VOLUNTEER_STATUS_COLORS[name] || '#94a3b8',
    }))
  }, [volunteers])

  // 5. Content Overview (articles by category)
  const contentCategoryData = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    articles.forEach(a => {
      const cat = a.category || 'general'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    return Object.entries(categoryCounts).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))
  }, [articles])

  // 6. Petition Progress (top petitions by signatures vs goal)
  const petitionProgressData = useMemo(() => {
    return petitions
      .filter(p => p.isPublished)
      .sort((a, b) => b.currentSignatures - a.currentSignatures)
      .slice(0, 5)
      .map(p => ({
        name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
        signatures: p.currentSignatures,
        goal: p.goal,
        progress: Math.round((p.currentSignatures / p.goal) * 100),
      }))
  }, [petitions])

  // Custom tooltip for currency
  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'revenue' ? `$${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const DefaultTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900">{payload[0].name}</p>
          <p className="text-sm text-slate-600">{payload[0].value} ({((payload[0].value / payload[0].payload.total) * 100).toFixed(0)}%)</p>
        </div>
      )
    }
    return null
  }

  // Add totals to pie data for percentage calculation
  const orderStatusTotal = orderStatusData.reduce((sum, d) => sum + d.value, 0)
  const orderStatusWithTotal = orderStatusData.map(d => ({ ...d, total: orderStatusTotal }))
  const volunteerStatusTotal = volunteerStatusData.reduce((sum, d) => sum + d.value, 0)
  const volunteerStatusWithTotal = volunteerStatusData.map(d => ({ ...d, total: volunteerStatusTotal }))
  const contentCategoryTotal = contentCategoryData.reduce((sum, d) => sum + d.value, 0)
  const contentCategoryWithTotal = contentCategoryData.map(d => ({ ...d, total: contentCategoryTotal }))

  return (
    <div className="space-y-6">
      {/* Row 1: User Growth + Revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<DefaultTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalUsers"
                  name="Total Users"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fill="url(#userGradient)"
                />
                <Bar dataKey="newUsers" name="New Users" fill="#64748b" radius={[2, 2, 0, 0]} barSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Over Time */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Order Status + Volunteer Status + Content Categories */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Order Status */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Order Status</h3>
          <div className="h-52">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusWithTotal}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusWithTotal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No orders yet</div>
            )}
          </div>
          {orderStatusData.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {orderStatusData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Volunteer Status */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Volunteer Status</h3>
          <div className="h-52">
            {volunteerStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={volunteerStatusWithTotal}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {volunteerStatusWithTotal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No volunteers yet</div>
            )}
          </div>
          {volunteerStatusData.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {volunteerStatusData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Categories */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Article Categories</h3>
          <div className="h-52">
            {contentCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentCategoryWithTotal}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {contentCategoryWithTotal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No articles yet</div>
            )}
          </div>
          {contentCategoryData.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {contentCategoryData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Petition Progress */}
      {petitionProgressData.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Top Petitions Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={petitionProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<DefaultTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="signatures" name="Signatures" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="goal" name="Goal" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

