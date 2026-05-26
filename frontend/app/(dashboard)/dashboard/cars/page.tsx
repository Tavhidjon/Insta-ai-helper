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

interface Brand    { id: string; name: string }
interface Category { id: string; name: string }

const statusColor: Record<string, string> = {
  available:   '#22c55e',
  rented:      '#f59e0b',
  maintenance: '#ef4444',
  inactive:    '#6b7280',
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  color: '#94a3b8',
  fontSize: '12px',
  marginBottom: '6px',
  display: 'block' as const,
}

export default function CarsPage() {
  const router = useRouter()
  const [cars,       setCars]       = useState<Car[]>([])
  const [brands,     setBrands]     = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [showModal,  setShowModal]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const [form, setForm] = useState({
    name: '', model: '', year: '2024', brand: '',
    category: '', transmission: 'automatic', fuel_type: 'petrol',
    seats: '5', daily_price: '', weekly_price: '', deposit: '0',
    status: 'available', description: '', plate_number: '',
  })

  const getToken = () => localStorage.getItem('access_token') || ''

  const fetchData = () => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const h = { Authorization: 'Bearer ' + token }
    Promise.all([
      fetch('http://localhost:8000/api/cars/',            { headers: h }).then(r => r.json()),
      fetch('http://localhost:8000/api/cars/brands/',     { headers: h }).then(r => r.json()),
      fetch('http://localhost:8000/api/cars/categories/', { headers: h }).then(r => r.json()),
    ]).then(([carsData, brandsData, catsData]) => {
      setCars(carsData.results || [])
      setBrands(brandsData.results || brandsData || [])
      setCategories(catsData.results || catsData || [])
    }).catch(console.error)
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.name || !form.daily_price || !form.brand || !form.category) {
      setError('Please fill in Name, Brand, Category, and Daily Price.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/cars/', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   'Bearer ' + getToken(),
        },
        body: JSON.stringify({
          name:         form.name,
          model:        form.model,
          year:         parseInt(form.year),
          brand:        form.brand,
          category:     form.category,
          transmission: form.transmission,
          fuel_type:    form.fuel_type,
          seats:        parseInt(form.seats),
          daily_price:  parseFloat(form.daily_price),
          weekly_price: form.weekly_price ? parseFloat(form.weekly_price) : null,
          deposit:      parseFloat(form.deposit),
          status:       form.status,
          description:  form.description,
          plate_number: form.plate_number,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err))
      }
      setShowModal(false)
      setForm({ name:'',model:'',year:'2024',brand:'',category:'',transmission:'automatic',fuel_type:'petrol',seats:'5',daily_price:'',weekly_price:'',deposit:'0',status:'available',description:'',plate_number:'' })
      fetchData()
    } catch (e: any) {
      setError(e.message || 'Failed to save car')
    } finally {
      setSaving(false)
    }
  }

  const filtered = filter === 'all' ? cars : cars.filter(c => c.status === filter)
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#fff', fontSize:'24px', fontWeight:'bold', margin:'0 0 6px' }}>Cars</h1>
          <p style={{ color:'#64748b', fontSize:'14px', margin:0 }}>Manage your fleet</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding:'9px 18px', backgroundColor:'#2563eb', color:'#fff',
          border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor:'pointer',
        }}>
          + Add Car
        </button>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {['all','available','rented','maintenance','inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer',
            fontSize:'12px', fontWeight:'500',
            backgroundColor: filter===f ? '#2563eb' : '#1e293b',
            color: filter===f ? '#fff' : '#94a3b8',
          }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'#64748b', padding:'40px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', color:'#64748b', padding:'60px', backgroundColor:'#0f172a', borderRadius:'12px', border:'1px solid #1e293b' }}>
          <p style={{ margin:0 }}>No cars yet. Click Add Car to get started.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
          {filtered.map(car => (
            <div key={car.id} style={{ backgroundColor:'#0f172a', border:'1px solid #1e293b', borderRadius:'12px', padding:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <div>
                  <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:'600', margin:'0 0 4px' }}>
                    {car.brand_name} {car.name}
                  </h3>
                  <p style={{ color:'#64748b', fontSize:'12px', margin:0 }}>{car.year} · {car.category_name}</p>
                </div>
                <span style={{
                  padding:'3px 10px', borderRadius:'10px', fontSize:'11px',
                  backgroundColor:(statusColor[car.status]||'#6b7280')+'20',
                  color:statusColor[car.status]||'#6b7280',
                }}>
                  {car.status}
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                {[['Transmission',car.transmission],['Fuel',car.fuel_type],['Seats',car.seats+' seats']].map(([k,v])=>(
                  <div key={k as string}>
                    <p style={{ color:'#64748b', fontSize:'11px', margin:'0 0 2px' }}>{k}</p>
                    <p style={{ color:'#cbd5e1', fontSize:'13px', margin:0, textTransform:'capitalize' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:'1px solid #1e293b', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#fff', fontSize:'18px', fontWeight:'bold' }}>
                  ${car.daily_price}<span style={{ color:'#64748b', fontSize:'12px', fontWeight:'normal' }}>/day</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD CAR MODAL */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
        }}>
          <div style={{
            backgroundColor:'#0f172a', border:'1px solid #1e293b',
            borderRadius:'16px', padding:'32px', width:'560px', maxHeight:'90vh',
            overflowY:'auto',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <h2 style={{ color:'#fff', fontSize:'18px', fontWeight:'bold', margin:0 }}>Add New Car</h2>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#64748b', fontSize:'20px', cursor:'pointer' }}>x</button>
            </div>

            {error && <p style={{ color:'#f87171', fontSize:'13px', marginBottom:'16px', padding:'10px', backgroundColor:'#1e293b', borderRadius:'8px' }}>{error}</p>}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div>
                <label style={labelStyle}>Car Name *</label>
                <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Camry" />
              </div>
              <div>
                <label style={labelStyle}>Model</label>
                <input style={inputStyle} value={form.model} onChange={set('model')} placeholder="e.g. 3.5L V6" />
              </div>
              <div>
                <label style={labelStyle}>Brand *</label>
                <select style={inputStyle} value={form.brand} onChange={set('brand')}>
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select style={inputStyle} value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input style={inputStyle} type="number" value={form.year} onChange={set('year')} />
              </div>
              <div>
                <label style={labelStyle}>Seats</label>
                <input style={inputStyle} type="number" value={form.seats} onChange={set('seats')} />
              </div>
              <div>
                <label style={labelStyle}>Transmission</label>
                <select style={inputStyle} value={form.transmission} onChange={set('transmission')}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fuel Type</label>
                <select style={inputStyle} value={form.fuel_type} onChange={set('fuel_type')}>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Daily Price ($) *</label>
                <input style={inputStyle} type="number" value={form.daily_price} onChange={set('daily_price')} placeholder="50" />
              </div>
              <div>
                <label style={labelStyle}>Weekly Price ($)</label>
                <input style={inputStyle} type="number" value={form.weekly_price} onChange={set('weekly_price')} placeholder="300" />
              </div>
              <div>
                <label style={labelStyle}>Deposit ($)</label>
                <input style={inputStyle} type="number" value={form.deposit} onChange={set('deposit')} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Plate Number</label>
                <input style={inputStyle} value={form.plate_number} onChange={set('plate_number')} placeholder="ABC-1234" />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={set('status')}>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop:'16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, height:'80px', resize:'vertical' }}
                value={form.description}
                onChange={set('description')}
                placeholder="Optional car description"
              />
            </div>

            <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex:1, padding:'10px', backgroundColor:'#1e293b', color:'#94a3b8',
                border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                flex:2, padding:'10px', backgroundColor:'#2563eb', color:'#fff',
                border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving...' : 'Save Car'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}