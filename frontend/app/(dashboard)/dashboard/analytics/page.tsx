'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const weekData = [
  { day: 'Mon', messages: 24, leads: 4, bookings: 1 },
  { day: 'Tue', messages: 38, leads: 7, bookings: 2 },
  { day: 'Wed', messages: 29, leads: 5, bookings: 1 },
  { day: 'Thu', messages: 45, leads: 9, bookings: 3 },
  { day: 'Fri', messages: 52, leads: 11, bookings: 4 },
  { day: 'Sat', messages: 61, leads: 14, bookings: 5 },
  { day: 'Sun', messages: 33, leads: 6,  bookings: 2 },
]

const monthData = [
  { month: 'Jan', revenue: 1200, bookings: 8  },
  { month: 'Feb', revenue: 1900, bookings: 13 },
  { month: 'Mar', revenue: 1500, bookings: 10 },
  { month: 'Apr', revenue: 2800, bookings: 19 },
  { month: 'May', revenue: 3200, bookings: 22 },
]

const intentData = [
  { name: 'Price inquiry',    value: 35 },
  { name: 'Booking intent',   value: 28 },
  { name: 'Availability',     value: 20 },
  { name: 'General inquiry',  value: 12 },
  { name: 'Complaint',        value: 5  },
]

const hourData = Array.from({ length: 24 }, (_, i) => ({
  hour: i + ':00',
  messages: Math.floor(Math.random() * 20) + (i >= 9 && i <= 21 ? 15 : 2),
}))

interface KPI {
  label:    string
  value:    string | number
  sub:      string
  color:    string
  trend:    string
  trendUp:  boolean
}

export default function AnalyticsPage() {
  const router  = useRouter()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [kpis,   setKpis]   = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    const h = { Authorization: 'Bearer ' + token }

    Promise.all([
      fetch('http://localhost:8000/api/conversations/', { headers: h }).then(r => r.json()),
      fetch('http://localhost:8000/api/bookings/',      { headers: h }).then(r => r.json()),
      fetch('http://localhost:8000/api/cars/',          { headers: h }).then(r => r.json()),
    ]).then(([conv, book, cars]) => {
      setKpis([
        {
          label:   'Total Conversations',
          value:   conv.count || 0,
          sub:     'All time',
          color:   '#3b82f6',
          trend:   '+12%',
          trendUp: true,
        },
        {
          label:   'Total Leads',
          value:   book.count || 0,
          sub:     'Booking requests',
          color:   '#22c55e',
          trend:   '+8%',
          trendUp: true,
        },
        {
          label:   'AI Response Rate',
          value:   '94%',
          sub:     'Handled by AI',
          color:   '#8b5cf6',
          trend:   '+2%',
          trendUp: true,
        },
        {
          label:   'Human Takeover',
          value:   '6%',
          sub:     'Escalated to agent',
          color:   '#f59e0b',
          trend:   '-1%',
          trendUp: false,
        },
        {
          label:   'Fleet Size',
          value:   cars.count || 0,
          sub:     'Total cars',
          color:   '#06b6d4',
          trend:   '0%',
          trendUp: true,
        },
        {
          label:   'Conversion Rate',
          value:   book.count && conv.count ? Math.round((book.count/conv.count)*100)+'%' : '0%',
          sub:     'Lead to booking',
          color:   '#ef4444',
          trend:   '+3%',
          trendUp: true,
        },
      ])
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const chartData = period === 'week' ? weekData : monthData
  const xKey      = period === 'week' ? 'day' : 'month'

  const tooltipStyle = {
    contentStyle: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '13px',
    }
  }

  return (
    <div style={{ padding: '32px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>Analytics</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Track your AI assistant performance and business metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              backgroundColor: period === p ? '#2563eb' : '#1e293b',
              color: period === p ? '#fff' : '#94a3b8',
            }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{
            backgroundColor: '#0f172a', border: '1px solid #1e293b',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 8px' }}>{kpi.label}</p>
              <span style={{
                fontSize: '11px', fontWeight: '600',
                color: kpi.trendUp ? '#22c55e' : '#ef4444',
                backgroundColor: (kpi.trendUp ? '#22c55e' : '#ef4444') + '15',
                padding: '2px 8px', borderRadius: '10px',
              }}>
                {kpi.trend}
              </span>
            </div>
            <p style={{ color: kpi.color, fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
              {loading ? '...' : kpi.value}
            </p>
            <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Messages chart */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 20px' }}>
            Messages & Leads
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: '12px' }} />
              <Bar dataKey="messages" fill="#3b82f6" radius={[4,4,0,0]} name="Messages" />
              <Bar dataKey="leads"    fill="#22c55e" radius={[4,4,0,0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Intent distribution */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 20px' }}>
            Message Intent Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={intentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {intentData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => v + '%'} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Revenue trend */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 20px' }}>
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} formatter={(v) => '$' + v} />
              <Line
                type="monotone" dataKey="revenue" stroke="#22c55e"
                strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="Revenue ($)"
              />
              <Line
                type="monotone" dataKey="bookings" stroke="#3b82f6"
                strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI performance */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
            AI Performance
          </h3>
          {[
            { label: 'Response Rate',    value: 94, color: '#22c55e' },
            { label: 'Avg Confidence',   value: 78, color: '#3b82f6' },
            { label: 'Human Escalation', value: 6,  color: '#f59e0b' },
            { label: 'Error Rate',       value: 2,  color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: '12px', fontWeight: '600' }}>{item.value}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: item.value + '%',
                  backgroundColor: item.color, borderRadius: '3px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak hours */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 20px' }}>
          Peak Hours (Messages by Hour)
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={hourData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="hour"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 10 }}
              interval={2}
            />
            <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="messages" fill="#8b5cf6" radius={[3,3,0,0]} name="Messages" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}