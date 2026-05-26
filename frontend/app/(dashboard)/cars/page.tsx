'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Car {
  id:            string
  name:          string
  model:         string
  year:          number
  brand_name:    string
  category_name: string
  transmission:  string
  fuel_type:     string
  seats:         number
  daily_price:   number
  status:        string
}

const statusColor: Record<string, string> = {
  available:   '#22c55e',
  rented:      '#f59e0b',
  maintenance: '#ef4444',
  inactive:    '#6b7280',
}

export default function CarsPage() {
  const router = useRouter()
  const [cars, setCars]       = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch('http://localhost:8000/api/cars/', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setCars(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? cars : cars.filter(c => c.status === filter)

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>Cars</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Manage your fleet</p>
        </div>
        <button style={{
          padding: '9px 18px', backgroundColor: '#2563eb', color: '#fff',
          border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
        }}>
          + Add Car
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'available', 'rented', 'maintenance', 'inactive'].map(f => (
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

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>Car</div>
          <p style={{ margin: 0 }}>No cars yet. Add your first car to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filtered.map(car => (
            <div key={car.id} style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>
                    {car.brand_name} {car.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{car.year} · {car.category_name}</p>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: '10px', fontSize: '11px',
                  backgroundColor: (statusColor[car.status] || '#6b7280') + '20',
                  color: statusColor[car.status] || '#6b7280',
                }}>
                  {car.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  ['Transmission', car.transmission],
                  ['Fuel',         car.fuel_type],
                  ['Seats',        car.seats + ' seats'],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 2px' }}>{k}</p>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, textTransform: 'capitalize' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                  ${car.daily_price}<span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'normal' }}>/day</span>
                </span>
                <button style={{
                  padding: '6px 14px', backgroundColor: '#1e293b', color: '#94a3b8',
                  border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}