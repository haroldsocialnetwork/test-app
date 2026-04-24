import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ApplicantPage from './pages/ApplicantPage';
import HrPage from './pages/HrPage';
import HrDashboardPage from './pages/HrDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applicant" replace />} />
        <Route path="/applicant" element={<ApplicantPage />} />
        <Route path="/hr" element={<HrDashboardPage />} />
        <Route path="/hr/analyze" element={<HrPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: number
  text: string
  author: string
  createdAt: string
}

// ── API helper ────────────────────────────────────────────────────────────────

const API_BASE = '/api/hello'

async function fetchMessages(): Promise<Message[]> {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error('Failed to fetch messages')
  const data = await res.json()
  return data.messages
}

async function postMessage(text: string, author: string): Promise<Message> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, author }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  const data = await res.json()
  return data.message
}

// ── Stack Badge ───────────────────────────────────────────────────────────────

const STACK = [
  { label: 'React', color: '#61dafb', icon: '⚛️' },
  { label: 'NestJS', color: '#e0234e', icon: '🐱' },
  { label: 'Prisma', color: '#2d3748', icon: '◈' },
  { label: 'SQLite', color: '#003b57', icon: '🗄️' },
]

function StackBadge({ label, color, icon }: { label: string; color: string; icon: string }) {
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        letterSpacing: '0.03em',
      }}
    >
      <span>{icon}</span>
      {label}
    </span>
  )
}

// ── Message Card ──────────────────────────────────────────────────────────────

function MessageCard({ message }: { message: Message }) {
  const isServer = message.author === 'Server'
  return (
    <div
      style={{
        background: isServer
          ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.15))'
          : 'rgba(255,255,255,0.07)',
        border: isServer
          ? '1px solid rgba(124,58,237,0.4)'
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.85rem',
            color: isServer ? '#a78bfa' : '#60a5fa',
          }}
        >
          {isServer ? '🐱 ' : '👤 '}
          {message.author}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#888' }}>
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>
      <p style={{ fontSize: '0.97rem', lineHeight: 1.5, color: '#e2e2e2' }}>{message.text}</p>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [inputAuthor, setInputAuthor] = useState('Guest')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const loadMessages = useCallback(async () => {
    try {
      setError(null)
      const msgs = await fetchMessages()
      setMessages(msgs)
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    setSending(true)
    try {
      const newMsg = await postMessage(inputText.trim(), inputAuthor.trim() || 'Guest')
      setMessages(prev => [newMsg, ...prev])
      setInputText('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      {/* ── Hero ── */}
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: '4rem', marginBottom: 12 }}>👋</div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 10,
          }}
        >
          Hello, World!
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1.05rem', marginBottom: 20 }}>
          A full-stack app powered by
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {STACK.map(s => (
            <StackBadge key={s.label} {...s} />
          ))}
        </div>
      </header>

      {/* ── Architecture Card ── */}
      <section
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14, color: '#c4b5fd' }}>
          🏗️ Architecture
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {[
            { title: 'Frontend', desc: 'React 18 + TypeScript + Vite', icon: '⚛️' },
            { title: 'Backend', desc: 'NestJS REST API on port 3001', icon: '🐱' },
            { title: 'ORM', desc: 'Prisma with type-safe queries', icon: '◈' },
            { title: 'Database', desc: 'SQLite (dev.db)', icon: '🗄️' },
          ].map(card => (
            <div
              key={card.title}
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10,
                padding: '12px 14px',
                borderLeft: '3px solid #7c3aed',
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e2e2' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Send a Message ── */}
      <section
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#c4b5fd' }}>
          ✉️ Send a Message
        </h2>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            value={inputAuthor}
            onChange={e => setInputAuthor(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            style={inputStyle}
          />
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type a hello world message…"
            rows={3}
            maxLength={300}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: sending
                ? '#4b5563'
                : 'linear-gradient(90deg, #7c3aed, #6366f1)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: sending ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              opacity: sending || !inputText.trim() ? 0.6 : 1,
            }}
          >
            {sending ? '⏳ Sending…' : success ? '✅ Sent!' : '🚀 Send via NestJS API'}
          </button>
        </form>
        {error && (
          <p style={{ marginTop: 10, color: '#f87171', fontSize: '0.85rem' }}>
            ⚠️ {error}{' '}
            <button
              onClick={() => { setError(null); loadMessages() }}
              style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              retry
            </button>
          </p>
        )}
      </section>

      {/* ── Message Feed ── */}
      <section
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 40,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c4b5fd' }}>
            💬 Messages from Prisma DB
          </h2>
          <button
            onClick={loadMessages}
            style={{
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: '#a78bfa',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
            Loading messages from database…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
            No messages yet. Be the first to say hello! 👆
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(msg => (
              <MessageCard key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', paddingBottom: 20 }}>
        Built with ❤️ using React · NestJS · Prisma · SQLite
      </footer>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  padding: '12px 14px',
  color: '#e2e2e2',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
}
