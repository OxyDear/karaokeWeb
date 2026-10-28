import { useEffect, useState } from 'react'
import { clearSession, loadSession } from './api'
import AuthPanel from './components/AuthPanel'
import SongList from './components/SongList'

export default function App() {
  // Сессия (JWT + пользователь) восстанавливается из localStorage
  const [session, setSession] = useState(loadSession)

  // Сервер ответил 401 (токен истёк) — перехватчик в api.js уже очистил localStorage
  useEffect(() => {
    const handleExpired = () => setSession(null)
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const handleLogout = () => {
    clearSession()
    setSession(null)
  }

  return (
    <div className="container">
      <header className="hero">
        <h1>🎤 Онлайн-караоке</h1>
        <AuthPanel session={session} onLogin={setSession} onLogout={handleLogout} />
      </header>
      <SongList user={session?.user ?? null} />
    </div>
  )
}
