'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Customer {
  id:             string
  lead_score:     number
  segment:        string
  total_rentals:  number
  total_spent:    number
  tags:           string[]
  follow_up_date: string | null
  last_contact_at: string | null
  contact: {
    username:    string
    full_name:   string
    phone:       string
    language:    string
    instagram_id: string
  }
}

const segmentColor: Record<string, string> = {
  cold: '#6b7280',
  warm: '#f59e0b',
  hot:  '#ef4444',
  vip:  '#8b5cf6',
  lost: '#374151',
}

const scoreColor = (score: number) => {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  if (score >= 20) return '#3b82f6'
  return '#6b7280'
}

export default function CRMPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [segment,   setSegment]   = useState('all')
  const [selected,  setSelected]  = useState<Customer | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch('http://localhost:8000/api/crm/', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setCustomers(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const matchSearch = search === '' ||
      c.contact.username.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.phone.includes(search)
    const matchSegment = segment === 'all' || c.segment === segment
    return matchSearch && matchSegment
  })

  return (
    <div style={{ padding: '32px', display: 'flex', gap: '24px', height: 'calc(100vh - 0px)', boxSizing: 'border-box' }}>

      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>CRM</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Customer profiles are created automatically when someone messages you on Instagram.
          </p>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            placeholder="Search by name, username, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '9px 14px',
              backgroundColor: '#0f172a', border: '1px solid #1e293b',
              borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none',
            }}
          />
          <select
            value={segment}
            onChange={e => setSegment(e.target.value)}
            style={{
              padding: '9px 14px',
              backgroundColor: '#0f172a', border: '1px solid #1e293b',
              borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none',
            }}
          >
            {['all','cold','warm','hot','vip','lost'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Total',    value: customers.length,                              color: '#3b82f6' },
            { label: 'Hot',      value: customers.filter(c=>c.segment==='hot').length, color: '#ef4444' },
            { label: 'VIP',      value: customers.filter(c=>c.segment==='vip').length, color: '#8b5cf6' },
            { label: 'Rentals',  value: customers.reduce((a,c)=>a+c.total_rentals,0),  color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{
              backgroundColor: '#0f172a', border: '1px solid #1e293b',
              borderRadius: '10px', padding: '12px 16px',
            }}>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Customer list */}
        <div style={{
          flex: 1, overflowY: 'auto',
          backgroundColor: '#0f172a', border: '1px solid #1e293b',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No customers yet</p>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Customers appear here automatically once someone messages you on Instagram and the AI processes their conversation.
              </p>
            </div>
          ) : filtered.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                padding: '14px 18px',
                borderBottom: i < filtered.length-1 ? '1px solid #1e293b' : 'none',
                display: 'flex', alignItems: 'center', gap: '14px',
                cursor: 'pointer',
                backgroundColor: selected?.id === c.id ? '#1e293b' : 'transparent',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#1e293b', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontWeight: 'bold', flexShrink: 0,
                border: '2px solid ' + (segmentColor[c.segment] || '#6b7280'),
              }}>
                {(c.contact.username||'?')[0].toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                    {c.contact.full_name || '@'+c.contact.username}
                  </span>
                  <span style={{
                    padding: '1px 8px', borderRadius: '10px', fontSize: '10px',
                    backgroundColor: (segmentColor[c.segment]||'#6b7280')+'25',
                    color: segmentColor[c.segment]||'#6b7280',
                    textTransform: 'uppercase', fontWeight: '600',
                  }}>
                    {c.segment}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>@{c.contact.username}</span>
                  {c.contact.phone && <span style={{ color: '#64748b', fontSize: '12px' }}>{c.contact.phone}</span>}
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{c.total_rentals} rentals</span>
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '2px solid ' + scoreColor(c.lead_score),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: scoreColor(c.lead_score), fontSize: '11px', fontWeight: 'bold' }}>
                    {c.lead_score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — customer detail */}
      {selected && (
        <div style={{
          width: '300px', flexShrink: 0,
          backgroundColor: '#0f172a', border: '1px solid #1e293b',
          borderRadius: '12px', padding: '20px', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: 0 }}>Customer Profile</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>x</button>
          </div>

          {/* Avatar big */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: '#1e293b', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', fontWeight: 'bold', fontSize: '24px',
              margin: '0 auto 10px',
              border: '3px solid ' + (segmentColor[selected.segment]||'#6b7280'),
            }}>
              {(selected.contact.username||'?')[0].toUpperCase()}
            </div>
            <p style={{ color: '#fff', fontWeight: '600', margin: '0 0 4px' }}>
              {selected.contact.full_name || '@'+selected.contact.username}
            </p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>@{selected.contact.username}</p>
          </div>

          {/* Details */}
          {[
            { label: 'Phone',        value: selected.contact.phone    || 'Not provided' },
            { label: 'Language',     value: selected.contact.language || 'Unknown'      },
            { label: 'Segment',      value: selected.segment                             },
            { label: 'Lead Score',   value: selected.lead_score + '/100'                },
            { label: 'Total Rentals',value: selected.total_rentals                       },
            { label: 'Total Spent',  value: '$' + selected.total_spent                  },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #1e293b',
            }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{item.label}</span>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{item.value}</span>
            </div>
          ))}

          {/* Tags */}
          {selected.tags?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Tags</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selected.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '3px 10px', borderRadius: '10px', fontSize: '11px',
                    backgroundColor: '#1e293b', color: '#94a3b8',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{
              padding: '9px', backgroundColor: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer', width: '100%',
            }}>
              View Conversations
            </button>
            <button style={{
              padding: '9px', backgroundColor: '#1e293b', color: '#94a3b8',
              border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', width: '100%',
            }}>
              View Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}