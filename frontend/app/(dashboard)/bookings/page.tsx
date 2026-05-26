'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Booking {
  id:              string
  customer_name:   string
  customer_phone:  string
  car_name:        string | null
  status:          string
  pickup_date:     string | null
  return_date:     string | null
  total_price:     number | null
  created_at:      string
}

const statusColor: Record<string, string> = {
  lead:      '#3b82f6',
  pending:   '#f59e0b',
  confirmed: '#22c55e',
  active:    '#8b5cf6',
  completed: '#06b6d4',
  cancelled: '#ef4444',
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch('http://localhost:8000/api/bookings/', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setBookings(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>Bookings</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Manage all rental bookings and leads</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'lead', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: '500',
            backgroundColor: filter === f ? '#2563eb' : '#1e293b',
            color: filter === f ? '#fff' : '#94a3b8',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              {['Customer', 'Phone', 'Car', 'Pickup Date', 'Status', 'Price'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No bookings found</td></tr>
            ) : filtered.map((b, i) => (
              <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e293b' : 'none' }}>
                <td style={{ padding: '14px 16px', color: '#fff', fontSize: '14px' }}>
                  {b.customer_name || 'Unknown'}
                </td>
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>
                  {b.customer_phone || '-'}
                </td>
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>
                  {b.car_name || 'Not assigned'}
                </td>
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>
                  {b.pickup_date ? new Date(b.pickup_date).toLocaleDateString() : '-'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '10px', fontSize: '11px',
                    backgroundColor: (statusColor[b.status] || '#6b7280') + '20',
                    color: statusColor[b.status] || '#6b7280',
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>
                  {b.total_price ? '$' + b.total_price : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}