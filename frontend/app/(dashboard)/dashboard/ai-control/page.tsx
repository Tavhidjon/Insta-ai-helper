'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AIControlPage() {
  const router = useRouter()
  const [aiEnabled,   setAiEnabled]   = useState(true)
  const [model,       setModel]       = useState('gpt-4o')
  const [maxTokens,   setMaxTokens]   = useState(500)
  const [threshold,   setThreshold]   = useState(0.7)
  const [replyDelay,  setReplyDelay]  = useState(2)
  const [tone,        setTone]        = useState('professional')
  const [prompt,      setPrompt]      = useState('')
  const [testInput,   setTestInput]   = useState('')
  const [testOutput,  setTestOutput]  = useState('')
  const [testing,     setTesting]     = useState(false)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    setPrompt(`You are an AI sales assistant for a premium car rental company on Instagram.

YOUR GOALS:
1. Answer customer questions about car rentals
2. Recommend the best car based on customer needs
3. Collect booking information
4. Convert leads into bookings

REPLY RULES:
- Keep responses under 150 words
- Use emojis sparingly (1-2 max)
- Always end with a question or call to action
- Detect and reply in the customer language (EN/RU/TJ)
- Never make up prices or availability`)
  }, [])

  const handleTest = async () => {
    if (!testInput.trim()) return
    setTesting(true)
    setTestOutput('')
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch('http://localhost:8000/api/ai/test/', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  'Bearer ' + token,
        },
        body: JSON.stringify({ message: testInput, prompt }),
      })
      if (res.ok) {
        const data = await res.json()
        setTestOutput(data.response || 'No response')
      } else {
        setTestOutput('API endpoint not ready yet — add /api/ai/test/ endpoint')
      }
    } catch {
      setTestOutput('Connection error — make sure backend is running')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    backgroundColor: '#0a0f1e', border: '1px solid #1e293b',
    borderRadius: '8px', color: '#fff', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: '32px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px' }}>AI Control Center</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Configure and test your Instagram AI assistant</p>
        </div>
        <button onClick={handleSave} style={{
          padding: '9px 20px',
          backgroundColor: saved ? '#16a34a' : '#2563eb',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          transition: 'background 0.2s',
        }}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* AI Toggle */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>AI Assistant</h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                  {aiEnabled ? 'AI is actively replying to Instagram DMs' : 'AI is paused — all messages need manual replies'}
                </p>
              </div>
              <div
                onClick={() => setAiEnabled(!aiEnabled)}
                style={{
                  width: '48px', height: '26px',
                  backgroundColor: aiEnabled ? '#2563eb' : '#1e293b',
                  borderRadius: '13px', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: aiEnabled ? '25px' : '3px',
                  width: '20px', height: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
            <div style={{
              marginTop: '12px', padding: '10px 14px',
              backgroundColor: aiEnabled ? '#14532d20' : '#1e293b',
              borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: aiEnabled ? '#22c55e' : '#6b7280',
              }} />
              <span style={{ color: aiEnabled ? '#22c55e' : '#6b7280', fontSize: '13px' }}>
                {aiEnabled ? 'Active — responding to messages' : 'Inactive — paused'}
              </span>
            </div>
          </div>

          {/* Model Settings */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 16px' }}>Model Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>AI Model</label>
                <select style={inputStyle} value={model} onChange={e => setModel(e.target.value)}>
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Max Tokens: {maxTokens}
                </label>
                <input type="range" min="100" max="2000" step="100"
                  value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Confidence Threshold: {threshold}
                </label>
                <input type="range" min="0.1" max="1.0" step="0.05"
                  value={threshold} onChange={e => setThreshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
                <p style={{ color: '#475569', fontSize: '11px', margin: '4px 0 0' }}>
                  Below this score the AI escalates to a human agent
                </p>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Reply Delay: {replyDelay}s
                </label>
                <input type="range" min="0" max="10" step="1"
                  value={replyDelay} onChange={e => setReplyDelay(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Tone</label>
                <select style={inputStyle} value={tone} onChange={e => setTone(e.target.value)}>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Prompt Editor */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 12px' }}>System Prompt</h3>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{
                ...inputStyle,
                height: '220px',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.6',
              }}
            />
            <p style={{ color: '#475569', fontSize: '11px', margin: '6px 0 0' }}>
              {prompt.length} characters · Changes take effect on next message
            </p>
          </div>

          {/* Prompt Playground */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 12px' }}>Prompt Playground</h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px' }}>
              Test how the AI responds to a customer message
            </p>
            <textarea
              placeholder="Type a test customer message... e.g. 'Hi, I need to rent a car for 3 days'"
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              style={{ ...inputStyle, height: '80px', resize: 'none', marginBottom: '10px' }}
            />
            <button onClick={handleTest} disabled={testing || !testInput.trim()} style={{
              width: '100%', padding: '9px',
              backgroundColor: testing ? '#1e293b' : '#2563eb',
              color: testing ? '#64748b' : '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500',
              cursor: testing ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
            }}>
              {testing ? 'Testing...' : 'Test AI Response'}
            </button>
            {testOutput && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: '#0a0f1e',
                border: '1px solid #1e293b',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 6px' }}>AI Response:</p>
                <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                  {testOutput}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}