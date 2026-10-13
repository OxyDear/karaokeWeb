import { memo } from 'react'
import { formatDuration } from '../utils/format'

// React.memo: строка перерисовывается только если изменились её props.
function SongItem({ song, index, onToggle, onEdit, onDelete }) {
  return (
    <li className={`song-row ${song.sung ? 'is-sung' : ''}`}>
      <input
        type="checkbox"
        checked={song.sung}
        onChange={() => onToggle(song.id)}
        title="Отметить как спетую"
        aria-label={`Спето: ${song.title}`}
      />
      <span className="song-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="song-main">
        <span className="song-title">{song.title}</span>
        <span className="song-artist">{song.artist}</span>
        {song.lyrics && <span className="song-lyrics">{song.lyrics}</span>}
      </span>
      <span className="tag">{song.genre}</span>
      <span className="duration">{formatDuration(song.duration)}</span>
      <span className="row-actions">
        <button type="button" className="btn-ghost" onClick={() => onEdit(song.id)}>Изменить</button>
        <button type="button" className="btn-danger" onClick={() => onDelete(song.id)}>Удалить</button>
      </span>
    </li>
  )
}

export default memo(SongItem)
