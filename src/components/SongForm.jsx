import { useState } from 'react'

const EMPTY = { title: '', artist: '', genre: '', duration: '', lyrics: '' }

// Контролируемая форма: значения полей хранятся в useState.
// editingSong != null — режим редактирования, иначе — добавления.
export default function SongForm({ editingSong, onSubmit, onCancel }) {
  // Начальные значения берём из редактируемой песни. При смене песни
  // родитель меняет key формы, и состояние инициализируется заново.
  const [fields, setFields] = useState(() =>
    editingSong
      ? {
          title: editingSong.title,
          artist: editingSong.artist,
          genre: editingSong.genre,
          duration: String(editingSong.duration || ''),
          lyrics: editingSong.lyrics,
        }
      : EMPTY,
  )
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  // Enter внутри <input> вызывает submit формы — это и есть «горячая клавиша»
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!fields.title.trim() || !fields.artist.trim()) {
      setError('Поля «Название» и «Исполнитель» обязательны')
      return
    }
    const duration = fields.duration === '' ? 0 : Number(fields.duration)
    if (!Number.isFinite(duration) || duration < 0) {
      setError('Длительность должна быть неотрицательным числом (в секундах)')
      return
    }

    onSubmit({
      title: fields.title.trim(),
      artist: fields.artist.trim(),
      genre: fields.genre.trim() || 'Без жанра',
      duration: Math.round(duration),
      lyrics: fields.lyrics.trim(),
    })
    setFields(EMPTY)
    setError('')
  }

  // Escape — отмена редактирования
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && editingSong) onCancel()
  }

  return (
    <form className="song-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <h2>{editingSong ? 'Редактировать песню' : 'Добавить песню'}</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="field-row">
        <label>
          Название
          <input name="title" value={fields.title} onChange={handleChange} placeholder="Например, «Летний дождь»" />
        </label>
        <label>
          Исполнитель
          <input name="artist" value={fields.artist} onChange={handleChange} placeholder="Группа или артист" />
        </label>
      </div>

      <div className="field-row">
        <label>
          Жанр
          <input name="genre" value={fields.genre} onChange={handleChange} placeholder="Поп, рок, баллада…" />
        </label>
        <label>
          Длительность (сек)
          <input name="duration" type="number" min="0" value={fields.duration} onChange={handleChange} placeholder="210" />
        </label>
      </div>

      <label>
        Текст песни
        <textarea name="lyrics" rows="3" value={fields.lyrics} onChange={handleChange} placeholder="Куплет 1: …" />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingSong ? 'Сохранить' : 'Добавить в каталог'}
        </button>
        {editingSong && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Отмена (Esc)
          </button>
        )}
      </div>
    </form>
  )
}
