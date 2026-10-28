import { useState } from 'react'
import { getErrorMessage, login, register, saveSession } from '../api'

// Вход / регистрация. После успешного входа JWT сохраняется в localStorage,
// а axios-перехватчик сам подставляет его во все запросы.
export default function AuthPanel({ session, onLogin, onLogout }) {
  const [mode, setMode] = useState('login') // login | register
  const [fields, setFields] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (session) {
    return (
      <div className="auth-bar">
        <span>
          {session.user.email} <span className="tag">{session.user.role}</span>
        </span>
        <button type="button" className="btn-ghost" onClick={onLogout}>Выйти</button>
      </div>
    )
  }

  const handleChange = (e) => setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'register') await register(fields.email, fields.password)
      const data = await login(fields.email, fields.password)
      saveSession(data.token, data.user)
      onLogin({ token: data.token, user: data.user })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" value={fields.email} onChange={handleChange} required />
      <input
        name="password"
        type="password"
        placeholder="Пароль (от 8 символов)"
        value={fields.password}
        onChange={handleChange}
        required
      />
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
      </button>
      <button
        type="button"
        className="btn-ghost"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError('')
        }}
      >
        {mode === 'login' ? 'Регистрация' : 'У меня есть аккаунт'}
      </button>
      {error && <div className="error-box auth-error">{error}</div>}
    </form>
  )
}
