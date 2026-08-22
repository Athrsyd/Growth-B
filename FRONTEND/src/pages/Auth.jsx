import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuEye, LuEyeOff, LuArrowRight, LuUser, LuMail, LuLock } from 'react-icons/lu'
import logo from '../assets/GrowthB_logo.svg'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function InputField({ label, id, type = 'text', placeholder, value, onChange, icon: Icon, rightEl, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
          style={{
            width: '100%', paddingLeft: Icon ? 38 : 14, paddingRight: rightEl ? 42 : 14,
            paddingTop: 11, paddingBottom: 11, fontSize: 14, color: 'var(--color-text)',
            background: error ? '#FEF2F2' : 'var(--color-bg)',
            border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'; e.target.style.background = 'white' }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; e.target.style.background = error ? '#FEF2F2' : 'var(--color-bg)' }}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('submit-btn')?.click()}
        />
        {rightEl && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{rightEl}</span>}
      </div>
      {error && <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(
    { full_name: '', email: '', password: '' }
  )
  const [errors, setErrors] = useState({})
  const [globalErr, setGlobalErr] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!isLogin && !form.full_name.trim()) e.full_name = 'Nama wajib diisi'
    if (!form.email.includes('@')) e.email = 'Email tidak valid'
    if (form.password.length < 6) e.password = 'Minimal 6 karakter'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({}); 
    setGlobalErr(''); 
    setLoading(true)

    try {
      const endpoint = isLogin ? '/login' : '/register'
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { full_name: form.full_name, email: form.email, password: form.password }

      const { data } = await api.post(endpoint, payload)
      const { token, ...userData } = data.data

      login(userData, token)

      // Setelah login/register: cek apakah bisnis sudah ada
      try {
        const me = await api.get('/me')
        if (me.data.data.bisnis) {
          navigate('/')
        } else {
          navigate('/bisnis-form')
        }
      } catch {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Terjadi kesalahan, coba lagi.'
      setGlobalErr(msg)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (login) => { setIsLogin(login); setErrors({}); setGlobalErr(''); setForm({ full_name: '', email: '', password: '' }) }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'var(--color-primary-soft)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(34,197,94,0.25)', padding: 8 }}>
            <img src={logo} alt="GrowthB Logo" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>GrowthB</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Grow Smarter, Build Better</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--color-surface)', borderRadius: 20, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          {/* Tab */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', padding: 4, gap: 4 }}>
            {[{ label: 'Masuk', value: true }, { label: 'Daftar', value: false }].map((t) => (
              <button key={t.label} onClick={() => switchMode(t.value)} style={{ padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s', background: isLogin === t.value ? 'var(--color-surface)' : 'transparent', color: isLogin === t.value ? 'var(--color-text)' : 'var(--color-text-muted)', boxShadow: isLogin === t.value ? 'var(--shadow-sm)' : 'none' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ padding: '24px 24px 20px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              {isLogin ? 'Selamat datang kembali' : 'Buat akun baru'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              {isLogin ? 'Masuk untuk melihat insight bisnis kamu.' : 'Mulai perjalanan bisnis kamu bersama GrowthB.'}
            </p>

            {globalErr && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--color-danger)' }}>
                {globalErr}
              </div>
            )}

            {!isLogin && (
              <InputField label="Nama Lengkap" id="full_name" placeholder="cth: Bu Sari" value={form.full_name} onChange={set('full_name')} icon={LuUser} error={errors.full_name} />
            )}
            <InputField label="Email" id="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={set('email')} icon={LuMail} error={errors.email} />
            <InputField
              label="Password" id="password" type={showPass ? 'text' : 'password'}
              placeholder="Minimal 6 karakter" value={form.password} onChange={set('password')} icon={LuLock} error={errors.password}
              rightEl={
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 2 }}>
                  {showPass ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              }
            />

            <button
              id="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: loading ? 'var(--color-border)' : 'var(--color-primary)', color: loading ? 'var(--color-text-muted)' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', boxShadow: loading ? 'none' : '0 2px 8px rgba(34,197,94,0.2)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary-dark)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary)' }}
            >
              {loading ? (
                <><svg className="spin" width={16} height={16} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>Memproses…</>
              ) : (
                <>{isLogin ? 'Masuk' : 'Buat Akun'}<LuArrowRight size={16} /></>
              )}
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border-light)', padding: '14px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button onClick={() => switchMode(!isLogin)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-primary-dark)', fontFamily: 'inherit' }}>
                {isLogin ? 'Daftar sekarang' : 'Masuk'}
              </button>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  )
}