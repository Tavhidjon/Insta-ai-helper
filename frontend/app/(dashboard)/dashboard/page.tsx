'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  conversations: number
  bookings:      number
  cars:          number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats]     = useState<Stats>({ conversations: 0, bookings: 0, cars: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }

    const headers = { Authorization: 'Bearer ' + token }

    Promise.all([
      fetch('http://localhost:8000/api/conversations/', { headers }).then(r => r.json()),
      fetch('http://localhost:8000/api/bookings/',      { headers }).then(r => r.json()),
      fetch('http://localhost:8000/api/cars/',          { headers }).then(r => r.json()),
    ]).then(([conv, book, cars]) => {
      setStats({
        conversations: conv.count || 0,
        bookings:      book.count || 0,
        cars:          cars.count || 0,
      })
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Conversations', value: stats.conversations, color: '#2563eb' },
    { label: 'Total Bookings',      value: stats.bookings,      color: '#16a34a' },
    { label: 'Cars in Fleet',       value: stats.cars,          color: '#9333ea' },
    { label: 'AI Response Rate',    value: '94%',               color: '#ea580c' },
  ]

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>
          Overview
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Welcome back. Here is what is happening today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>{card.label}</p>
            <p style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {loading ? '...' : card.value}
            </p>
            <div style={{
              marginTop: '12px',
              height: '3px',
              backgroundColor: card.color,
              borderRadius: '2px',
              width: '40px',
            }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'AI Assistant',      status: 'Active and running', color: '#22c55e' },
          { label: 'Instagram Webhook', status: 'Connected',          color: '#22c55e' },
          { label: 'Database',          status: 'Healthy',            color: '#22c55e' },
        ].map((item) => (
          <div key={item.label} style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: item.color,
              borderRadius: '50%',
              marginBottom: '10px',
            }} />
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>
              {item.label}
            </p>
            <p style={{ color: item.color, fontSize: '12px', margin: 0 }}>
              {item.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}