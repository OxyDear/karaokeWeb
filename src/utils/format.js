// Секунды -> "м:сс"
export function formatDuration(totalSeconds) {
  const s = Number(totalSeconds) || 0
  const minutes = Math.floor(s / 60)
  const seconds = s % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Общая длительность -> "1 ч 05 мин" / "12 мин"
export function formatTotal(totalSeconds) {
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h} ч ${String(m).padStart(2, '0')} мин`
}
