import { formatTotal } from '../utils/format'

// Статистика по списку (дополнительный эффект: подсчёт)
export default function Stats({ stats }) {
  return (
    <div className="stats">
      <div><b>{stats.total}</b><span>всего</span></div>
      <div><b>{stats.sung}</b><span>спето</span></div>
      <div><b>{stats.todo}</b><span>не спето</span></div>
      <div><b>{formatTotal(stats.duration)}</b><span>общая длительность</span></div>
    </div>
  )
}
