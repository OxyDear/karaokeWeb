import { memo } from 'react'
import { formatDuration } from '../utils/format'

// React.memo: строка перерисовывается только если изменились её props.
// song.pending === true — запрос по этой песне ещё выполняется (оптимистичное состояние).
function SongItem({ song, index, canPlay, isAdmin, onPlay, onEdit, onDelete }) {
  return (
    <li className={`song-row ${song.pending ? 'is-pending' : ''}`}>
      <span className="song-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="song-main">
        <span className="song-title">
          {song.title}
          {song.pending && <span className="spinner spinner-sm" aria-label="Сохранение…" />}
        </span>
        <span className="song-artist">{song.artist}</span>
        {song.lyrics && <span className="song-lyrics">{song.lyrics}</span>}
      </span>
      <span className="tag">{song.genre || 'Без жанра'}</span>
      <span className="duration">{formatDuration(song.duration)}</span>
      <span className="plays" title="Сколько раз спели">▶ {song.playsCount ?? 0}</span>
      <span className="row-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={!canPlay || song.pending}
          title={canPlay ? 'Спеть' : 'Войдите, чтобы петь'}
          onClick={() => onPlay(song.id)}
        >
          🎤 Спеть
        </button>
        {isAdmin && (
          <>
            <button type="button" className="btn-ghost" disabled={song.pending} onClick={() => onEdit(song.id)}>
              Изменить
            </button>
            <button type="button" className="btn-danger" disabled={song.pending} onClick={() => onDelete(song.id)}>
              Удалить
            </button>
          </>
        )}
      </span>
    </li>
  )
}

export default memo(SongItem)
