import { useEffect } from 'react'

// Всплывающее уведомление (успех/ошибка), само скрывается через 4 с.
export default function Toast({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return
    const timerId = setTimeout(onClose, 4000)
    return () => clearTimeout(timerId)
  }, [notice, onClose])

  if (!notice) return null

  return (
    <div className={`toast toast-${notice.type}`} role="status" onClick={onClose}>
      {notice.text}
    </div>
  )
}
