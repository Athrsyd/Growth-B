import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LuTrendingUp, LuTrendingDown, LuMinus,
  LuArrowRight, LuBrain, LuTarget,
  LuUsers, LuShoppingBag, LuWallet, LuActivity,
  LuChevronRight, LuZap, LuLightbulb,
} from 'react-icons/lu'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

// ── Dummy data ──────────────────────────────────────────────────
const BISNIS = { nama: 'Warung Makan Bu Sari', user: 'Bu Sari' }

const KPI = [
  { label: 'Pendapatan',  value: 'Rp 4.250.000', raw: 4250000, delta: 12.4,  icon: LuWallet,       color: '#22C55E' },
  { label: 'Pengeluaran', value: 'Rp 1.820.000', raw: 1820000, delta: -3.1,  icon: LuShoppingBag,  color: '#F59E0B' },
  { label: 'Laba Bersih', value: 'Rp 2.430.000', raw: 2430000, delta: 18.7,  icon: LuTrendingUp,   color: '#3B82F6' },
  { label: 'Pelanggan',   value: '142',           raw: 142,    delta: 7.2,   icon: LuUsers,         color: '#3B82F6' },
]

const REVENUE_TREND = [
  { day: '9 Jul',  rev: 580000,  exp: 240000 },
  { day: '10 Jul', rev: 620000,  exp: 260000 },
  { day: '11 Jul', rev: 490000,  exp: 210000 },
  { day: '12 Jul', rev: 710000,  exp: 290000 },
  { day: '13 Jul', rev: 650000,  exp: 270000 },
  { day: '14 Jul', rev: 780000,  exp: 310000 },
  { day: '15 Jul', rev: 420000,  exp: 240000 },
]

const TOP_PRODUK = [
  { nama: 'Nasi Ayam Goreng', qty: 48, pct: 100 },
  { nama: 'Es Teh Manis',     qty: 39, pct: 81  },
  { nama: 'Nasi Capcay',      qty: 27, pct: 56  },
  { nama: 'Jus Alpukat',      qty: 18, pct: 38  },
]

const AI_INSIGHT = {
  kondisi: 'Bisnis kamu sedang tumbuh dengan baik.',
  insight: 'Pendapatan naik 12.4% dibanding pekan lalu. Nasi Ayam Goreng tetap menjadi produk andalan dengan 48 porsi terjual.',
  rekomendasi: 'Pertimbangkan bundling Nasi Ayam + Es Teh untuk meningkatkan average order value.',
  confidence: 87,
}

const HEALTH_SCORE = 74

const ROADMAP = {
  judul: 'Capai Omset Rp 50 Juta',
  progress: 68,
  deadline: '30 Sep 2024',
  milestone: 'Konsistensi harian ≥ Rp 1,5 juta',
}

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
function Greeting() {
  const hour = new Date().getHours()
  const salam = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'
  const tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>{tanggal}</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 2 }}>
        {salam}, {BISNIS.user}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{BISNIS.nama}</p>
    </div>
  )
}

// ── AI Insight Card ──────────────────────────────────────────────
function AIInsightCard() {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      marginBottom: 16,
      boxShadow: 'var(--shadow-card)',
    }}>
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
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Kepercayaan {AI_INSIGHT.confidence}%</p>
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
        {AI_INSIGHT.kondisi}
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
        {AI_INSIGHT.insight}
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
        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>{AI_INSIGHT.rekomendasi}</p>
      </div>
    </div>
  )
}

// ── Health Score ────────────────────────────────────────────────
function HealthScore({ score }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444'
  const label = score >= 70 ? 'Sehat' : score >= 40 ? 'Perlu Perhatian' : 'Kritis'
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      marginBottom: 16,
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
    }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={36} cy={36} r={28} fill="none" stroke="var(--color-border-light)" strokeWidth={6} />
          <circle
            cx={36} cy={36} r={28} fill="none"
            stroke={color} strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{score}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Business Health Score</p>
        <p style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Bisnis kamu berada pada kondisi yang baik. Terus konsisten dengan input harian.
        </p>
      </div>
    </div>
  )
}

// ── KPI Grid ─────────────────────────────────────────────────────
function KPIGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      marginBottom: 16,
    }}>
      {KPI.map((k) => {
        const Icon = k.icon
        return (
          <div key={k.label} style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            padding: '16px',
            boxShadow: 'var(--shadow-card)',
          }}>
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
      })}
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

function RevenueChart() {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      marginBottom: 16,
      boxShadow: 'var(--shadow-card)',
    }}>
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
        <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
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
function TopProduk() {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      marginBottom: 16,
      boxShadow: 'var(--shadow-card)',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Produk Terlaris</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TOP_PRODUK.map((p, i) => (
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
function RoadmapProgress() {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/roadmap')}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 20,
        marginBottom: 16,
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LuTarget size={16} style={{ color: 'var(--color-primary-dark)' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Roadmap Aktif</p>
        </div>
        <LuChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{ROADMAP.judul}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Deadline: {ROADMAP.deadline}</p>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{ROADMAP.milestone}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>{ROADMAP.progress}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${ROADMAP.progress}%`,
            background: 'var(--color-primary)',
            borderRadius: 'var(--radius-pill)',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Quick Action ─────────────────────────────────────────────────
function QuickAction() {
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
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Belum ada data untuk hari ini</p>
        </div>
      </div>
      <LuArrowRight size={18} color="rgba(255,255,255,0.85)" />
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ padding: '20px 16px 0' }}>
      <Greeting />
      <QuickAction />
      <AIInsightCard />
      <HealthScore score={HEALTH_SCORE} />
      <KPIGrid />
      <RevenueChart />
      <TopProduk />
      <RoadmapProgress />
    </div>
  )
}