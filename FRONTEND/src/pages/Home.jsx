import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  LuTrendingUp, LuTrendingDown,
  LuArrowRight, LuBrain, LuTarget,
  LuUsers, LuShoppingBag, LuWallet,
  LuChevronRight, LuZap, LuLightbulb,
} from 'react-icons/lu'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

// ── Icon map untuk KPI ──────────────────────────────────────────
const KPI_CONFIG = [
  { label: 'Pendapatan',  key: 'pendapatan',  icon: LuWallet,      color: '#22C55E', fmt: true },
  { label: 'Pengeluaran', key: 'pengeluaran', icon: LuShoppingBag, color: '#F59E0B', fmt: true },
  { label: 'Laba Bersih', key: 'laba',        icon: LuTrendingUp,  color: '#3B82F6', fmt: true },
  { label: 'Pelanggan',   key: 'pelanggan',   icon: LuUsers,       color: '#A855F7', fmt: false },
]

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(v)

function DeltaBadge({ delta }) {
  if (delta === 0) return <span style={{ color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 500 }}>—</span>
  const up = delta > 0
  const Icon = up ? LuTrendingUp : LuTrendingDown
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 600,
      color: up ? 'var(--color-success)' : 'var(--color-danger)',
    }}>
      <Icon size={12} />
      {up ? '+' : ''}{delta}%
    </span>
  )
}

// ── Greeting ────────────────────────────────────────────────────
function Greeting({ userName, nama }) {
  const hour = new Date().getHours()
  const salam = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'
  const tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>{tanggal}</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 2 }}>
        {salam}, {userName}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{nama}</p>
    </div>
  )
}

// ── Quick Action ─────────────────────────────────────────────────
function QuickAction({ inputHariIni }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/analisis')}
      style={{
        background: 'var(--color-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(34,197,94,0.2)',
        transition: 'transform 300ms ease-in-out, box-shadow 300ms ease-in-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LuZap size={18} color="white" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Input Hari Ini</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{inputHariIni ? 'Data hari ini sudah diisi' : 'Belum ada data untuk hari ini'}</p>
        </div>
      </div>
      <LuArrowRight size={18} color="rgba(255,255,255,0.85)" />
    </div>
  )
}

// ── AI Insight Card ──────────────────────────────────────────────
function AIInsightCard({ aiInsight }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      boxShadow: 'var(--shadow-card)',
      transition: 'box-shadow 300ms ease-in-out, border-color 300ms ease-in-out',
      height: '100%',
      boxSizing: 'border-box',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = 'var(--color-primary-soft)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32,
          background: 'var(--color-primary-muted)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LuBrain size={16} style={{ color: 'var(--color-primary-dark)' }} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Business Insight</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Kepercayaan {aiInsight?.confidence ? aiInsight.confidence + '%' : '—'}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: 'var(--color-primary-muted)',
            color: 'var(--color-primary-dark)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-primary-soft)',
          }}>
            Sehat ↑
          </span>
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
        {aiInsight?.kondisi ?? ''}
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
        {aiInsight?.insight ?? 'Belum ada analisis AI. Generate analisis dari halaman Analisis.'}
      </p>
      <div style={{
        background: 'var(--color-primary-muted)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        borderLeft: '3px solid var(--color-primary)',
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <LuLightbulb size={12} /> Rekomendasi
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>{aiInsight?.rekomendasi ?? 'Lengkapi data harian untuk mendapatkan rekomendasi.'}</p>
      </div>
    </div>
  )
}

// ── KPI Card (single) ────────────────────────────────────────────
function KPICard({ k }) {
  const Icon = k.icon
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--color-border)',
      padding: '16px',
      boxShadow: 'var(--shadow-card)',
      transition: 'box-shadow 300ms ease-in-out, transform 300ms ease-in-out, border-color 300ms ease-in-out',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 6px 20px ${k.color}20`
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = k.color + '40'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{k.label}</p>
        <div style={{
          width: 28, height: 28,
          borderRadius: 'var(--radius-sm)',
          background: k.color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} style={{ color: k.color }} />
        </div>
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, lineHeight: 1.2 }}>
        {k.value}
      </p>
      <DeltaBadge delta={k.delta} />
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 4 }}>vs minggu lalu</span>
    </div>
  )
}

// ── Revenue Chart ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 12px',
      boxShadow: 'var(--shadow-md)',
      fontSize: 12,
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name === 'rev' ? 'Pendapatan' : 'Pengeluaran'}: Rp {p.value.toLocaleString('id-ID')}
        </p>
      ))}
    </div>
  )
}

function RevenueChart({ revenueTrend }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      boxShadow: 'var(--shadow-card)',
      height: '100%',
      boxSizing: 'border-box',
      transition: 'box-shadow 300ms ease-in-out, border-color 300ms ease-in-out',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = 'var(--color-primary-soft)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Tren Pendapatan</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>7 hari terakhir</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            Pendapatan
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            Pengeluaran
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={revenueTrend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gexp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="rev" stroke="#22C55E" strokeWidth={2} fill="url(#grev)" dot={false} activeDot={{ r: 4, fill: '#22C55E' }} />
          <Area type="monotone" dataKey="exp" stroke="#F59E0B" strokeWidth={2} fill="url(#gexp)" dot={false} activeDot={{ r: 4, fill: '#F59E0B' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Top Produk ───────────────────────────────────────────────────
function TopProduk({ topProduk }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      boxShadow: 'var(--shadow-card)',
      height: '100%',
      boxSizing: 'border-box',
      transition: 'box-shadow 300ms ease-in-out, border-color 300ms ease-in-out',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = 'var(--color-primary-soft)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Produk Terlaris</p>
      {topProduk.length === 0 && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>Belum ada data produk</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topProduk.map((p, i) => (
          <div key={p.nama}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 20, height: 20,
                  background: i === 0 ? 'var(--color-primary)' : 'var(--color-border-light)',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: i === 0 ? 'white' : 'var(--color-text-muted)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: i === 0 ? 600 : 400 }}>{p.nama}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{p.qty} porsi</span>
            </div>
            <div style={{ height: 4, background: 'var(--color-border-light)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${p.pct}%`,
                background: i === 0 ? 'var(--color-primary)' : '#E5E7EB',
                borderRadius: 4,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Roadmap Progress ─────────────────────────────────────────────
function RoadmapProgress({ roadmap }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/roadmap')}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 20,
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box',
        transition: 'box-shadow 300ms ease-in-out, transform 300ms ease-in-out, border-color 300ms ease-in-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--color-primary-soft)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LuTarget size={16} style={{ color: 'var(--color-primary-dark)' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Roadmap Aktif</p>
        </div>
        <LuChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{roadmap?.judul ?? 'Belum ada roadmap aktif'}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Deadline: {roadmap?.deadline ?? '—'}</p>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{roadmap?.milestone ?? '—'}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>{roadmap?.progress ?? 0}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${roadmap?.progress ?? 0}%`,
            background: 'var(--color-primary)',
            borderRadius: 'var(--radius-pill)',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────
function buildKPI(dashboard, member) {
  const pend = dashboard?.datasets?.find(d => d.key === 'pendapatan')?.data ?? []
  const peng = dashboard?.datasets?.find(d => d.key === 'pengeluaran')?.data ?? []
  const totalPend = pend.reduce((s, v) => s + v, 0)
  const totalPeng = peng.reduce((s, v) => s + v, 0)
  return {
    pendapatan: totalPend,
    pengeluaran: totalPeng,
    laba: totalPend - totalPeng,
    pelanggan: member?.total ?? 0,
  }
}

// ── Main ─────────────────────────────────────────────────────────
export default function Home() {
  const { user, bisnis } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [topProduk, setTopProduk] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [aiInsight, setAiInsight]   = useState(null)
  const [roadmap, setRoadmap]       = useState(null)
  const [memberTotal, setMemberTotal] = useState(0)
  const [inputHariIni, setInputHariIni] = useState(false)
  const [loadingDash, setLoadingDash] = useState(true)

  useEffect(() => {
    const today = new Date()
    const sampai = today.toISOString().slice(0, 10)
    const dari = new Date(new Date().setDate(today.getDate() - 6)).toISOString().slice(0, 10)

    Promise.all([
      api.get(`/chart/revenue?dari=${dari}&sampai=${sampai}`).catch(() => null),
      api.get(`/chart/top-product?dari=${dari}&sampai=${sampai}`).catch(() => null),
      api.get('/member?per_page=1').catch(() => null),
      api.get('/analisa/latest').catch(() => null),
      api.get('/roadmap?per_page=1').catch(() => null),
      api.get(`/data-harian?per_page=1`).catch(() => null),
    ]).then(([rev, topP, cust, analisa, road, harian]) => {
      if (rev?.data?.data) {
        const d = rev.data.data
        setDashboard(d)
        const trend = (d.labels ?? []).map((label, i) => ({
          day: label,
          rev: d.datasets?.find(ds => ds.key === 'pendapatan')?.data?.[i] ?? 0,
          exp: d.datasets?.find(ds => ds.key === 'pengeluaran')?.data?.[i] ?? 0,
        }))
        setRevenueTrend(trend)
      }
      if (topP?.data?.data?.datasets?.[0]?.data) {
        const labels = topP.data.data.labels ?? []
        const vals   = topP.data.data.datasets[0].data ?? []
        const max    = Math.max(...vals, 1)
        setTopProduk(labels.map((nama, i) => ({ nama, qty: vals[i], pct: Math.round((vals[i] / max) * 100) })))
      }
      setMemberTotal(cust?.data?.total ?? 0)
      if (analisa?.data?.data) {
        const { eval: ev, plan } = analisa.data.data
        if (ev || plan) setAiInsight({ kondisi: '', insight: ev?.pesan ?? '', rekomendasi: plan?.pesan ?? '', confidence: null })
      }
      if (road?.data?.data?.length > 0) {
        const r = road.data.data[0]
        setRoadmap({
          judul: r.judul,
          progress: r.target_nilai ? Math.round(((r.progress ?? 0) / r.target_nilai) * 100) : 0,
          deadline: r.target_tanggal,
          milestone: r.target_metrik ?? '',
        })
      }
      const today_ymd = new Date().toISOString().slice(0, 10)
      const dataHarianList = harian?.data?.data ?? []
      setInputHariIni(dataHarianList.some(d => d.tanggal === today_ymd))
      setLoadingDash(false)
    })
  }, [])

  const kpiValues = buildKPI(dashboard, { total: memberTotal })
  const nama = bisnis?.bisnis_nama ?? 'Bisnis Kamu'
  const userName = user?.name ?? user?.full_name ?? 'Kamu'

  if (loadingDash) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg className="spin" width={32} height={32} viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
          <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Memuat dashboard…</p>
      </div>
      <style>{'.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )

  return (
    <>
      {/* ── Bento layout styles (desktop only) ── */}
      <style>{`
        .home-wrapper {
          padding: 20px 16px 0;
        }
        .home-bento {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bento-kpi {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .bento-bottom {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .home-wrapper {
            padding: 28px 32px 0;
          }
          .home-bento {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
            gap: 16px;
          }
          .bento-top-row {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 340px;
            align-items: center;
            gap: 16px;
          }
          .bento-ai {
            grid-column: 1 / 2;
            grid-row: 2 / 4;
          }
          .bento-kpi-wrap {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
          }
          .bento-kpi {
            grid-template-columns: repeat(2, 1fr);
          }
          .bento-roadmap {
            grid-column: 2 / 3;
            grid-row: 3 / 4;
          }
          .bento-chart {
            grid-column: 1 / -1;
            grid-row: 4 / 5;
          }
          .bento-produk {
            grid-column: 1 / -1;
            grid-row: 5 / 6;
          }
        }
      `}</style>

      <div className="home-wrapper">
        <div className="home-bento">

          {/* ── Top row: Greeting + QuickAction ── */}
          <div className="bento-top-row" style={{ gridColumn: '1 / -1' }}>
            <Greeting userName={userName} nama={nama} />
            <QuickAction inputHariIni={inputHariIni} />
          </div>

          {/* ── AI Insight ── */}
          <div className="bento-ai">
            <AIInsightCard aiInsight={aiInsight} />
          </div>

          {/* ── KPI 2x2 ── */}
          <div className="bento-kpi-wrap">
            <div className="bento-kpi">
              {KPI_CONFIG.map((cfg) => {
                const raw = kpiValues[cfg.key] ?? 0
                const k = {
                  ...cfg,
                  value: cfg.fmt ? 'Rp ' + new Intl.NumberFormat('id-ID').format(raw) : String(raw),
                  raw,
                  delta: 0,
                }
                return <KPICard key={k.label} k={k} />
              })}
            </div>
          </div>

          {/* ── Roadmap ── */}
          <div className="bento-roadmap">
            <RoadmapProgress roadmap={roadmap} />
          </div>

          {/* ── Chart (full width) ── */}
          <div className="bento-chart">
            <RevenueChart revenueTrend={revenueTrend} />
          </div>

          {/* ── Top Produk (full width) ── */}
          <div className="bento-produk" style={{ paddingBottom: 20 }}>
            <TopProduk topProduk={topProduk} />
          </div>

        </div>
      </div>
    </>
  )
}
