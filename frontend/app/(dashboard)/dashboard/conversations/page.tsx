'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Conversation {
  id:              string
  status:          string
  unread_count:    number
  last_message_at: string
  ai_enabled:      boolean
  contact: {
    username:  string
    full_name: string
    language:  string
  }
  last_message: {
    content:   string
    direction: string
  } | null
}

const statusColor: Record<string, string> = {
  ai_active:       '#22c55e',
  human_required:  '#ef4444',
  assigned:        '#3b82f6',
  closed:          '#6b7280',
}

export default function ConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch('http://localhost:8000/api/conversations/', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setConversations(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? conversations
    : conversations.filter(c => c.status === filter)

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>
          Conversations
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          All Instagram DM conversations
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'ai_active', 'human_required', 'assigned', 'closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: filter === f ? '#2563eb' : '#1e293b',
            color: filter === f ? '#fff' : '#94a3b8',
          }}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No conversations yet. Connect your Instagram to start receiving messages.
          </div>
        ) : (
          filtered.map((conv, i) => (
            <div key={conv.id} style={{
              padding: '16px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #1e293b' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
            }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontWeight: 'bold', fontSize: '16px',
                flexShrink: 0,
              }}>
                {(conv.contact.username || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>
                    @{conv.contact.username || 'Unknown'}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    backgroundColor: (statusColor[conv.status] || '#6b7280') + '20',
                    color: statusColor[conv.status] || '#6b7280',
                  }}>
                    {conv.status.replace('_', ' ')}
                  </span>
                  {conv.ai_enabled && (
                    <span style={{ fontSize: '11px', color: '#22c55e' }}>AI</span>
                  )}
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.last_message?.content || 'No messages yet'}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <div style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 'bold', flexShrink: 0,
                }}>
                  {conv.unread_count}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}