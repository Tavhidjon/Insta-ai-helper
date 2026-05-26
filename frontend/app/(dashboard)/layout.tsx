'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const navItems = [
  { href: '/dashboard',                          label: 'Overview'       },
  { href: '/dashboard/conversations',            label: 'Conversations'  },
  { href: '/dashboard/bookings',                 label: 'Bookings'       },
  { href: '/dashboard/crm',                      label: 'CRM'            },
  { href: '/dashboard/cars',                     label: 'Cars'           },
  { href: '/dashboard/analytics',                label: 'Analytics'      },
  { href: '/dashboard/ai-control',               label: 'AI Control'     },
  { href: '/dashboard/knowledge-base',           label: 'Knowledge Base' },
  { href: '/dashboard/notifications',            label: 'Notifications'  },
  { href: '/dashboard/settings',                 label: 'Settings'       },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) router.push('/login')
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#020817' }}>
      <aside style={{
        width: '220px',
        backgroundColor: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>CarRent AI</div>
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Dashboard</div>
        </div>

        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? '600' : '400',
                backgroundColor: active ? '#1d4ed8' : 'transparent',
                color: active ? '#fff' : '#94a3b8',
              }}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid #1e293b' }}>
          <button onClick={handleLogout} style={{
            color: '#94a3b8', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '13px', padding: '8px 12px',
            borderRadius: '8px', width: '100%', textAlign: 'left',
          }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}