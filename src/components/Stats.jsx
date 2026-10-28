import { formatTotal } from '../utils/format'

// Статистика по загруженному списку
export default function Stats({ stats }) {
  return (
    <div className="stats">
      <div><b>{stats.total}</b><span>песен</span></div>
      <div><b>{stats.plays}</b><span>исполнений</span></div>
      <div><b>{stats.artists}</b><span>исполнителей</span></div>
      <div><b>{formatTotal(stats.duration)}</b><span>общая длительность</span></div>
    </div>
  )
}
