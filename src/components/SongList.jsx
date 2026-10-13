import { useCallback, useEffect, useMemo, useState } from 'react'
import { INITIAL_SONGS } from '../data/initialSongs'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { makeId } from '../utils/format'
import Filters from './Filters'
import SongForm from './SongForm'
import SongItem from './SongItem'
import Stats from './Stats'

const STORAGE_KEY = 'karaoke:songs'

const SORTERS = {
  added: null, // порядок массива, новые — в начале (см. addSong)
  title: (a, b) => a.title.localeCompare(b.title, 'ru'),
  artist: (a, b) => a.artist.localeCompare(b.artist, 'ru'),
  duration: (a, b) => a.duration - b.duration,
}

export default function SongList() {
  // Массив песен + загрузка (с имитацией задержки сервера) и автосохранение
  const { value: songs, setValue: setSongs, loaded, saveStatus } = useLocalStorage(
    STORAGE_KEY,
    INITIAL_SONGS,
    { loadDelay: 1000, debounce: 500 },
  )

  // useState: состояние фильтра/сортировки и id редактируемой песни
  const [filters, setFilters] = useState({ query: '', genre: '', status: 'all', sort: 'added' })
  const [editingId, setEditingId] = useState(null)

  // Побочный эффект: заголовок вкладки зависит от количества песен
  useEffect(() => {
    document.title = loaded ? `Караоке — песен: ${songs.length}` : 'Караоке — загрузка…'
    return () => {
      document.title = 'Онлайн-караоке'
    }
  }, [songs.length, loaded])

  // --- CRUD. Везде используем обновление на основе предыдущего значения ---
  const addSong = useCallback(
    (data) => setSongs((prev) => [{ id: makeId(), sung: false, ...data }, ...prev]),
    [setSongs],
  )

  const updateSong = useCallback(
    (id, data) => setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s))),
    [setSongs],
  )

  const deleteSong = useCallback(
    (id) => {
      setSongs((prev) => prev.filter((s) => s.id !== id))
      setEditingId((cur) => (cur === id ? null : cur))
    },
    [setSongs],
  )

  const toggleSung = useCallback(
    (id) => setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, sung: !s.sung } : s))),
    [setSongs],
  )

  const editingSong = useMemo(() => songs.find((s) => s.id === editingId) ?? null, [songs, editingId])

  const handleFormSubmit = (data) => {
    if (editingSong) {
      updateSong(editingSong.id, data)
      setEditingId(null)
    } else {
      addSong(data)
    }
  }

  // --- Производные данные (useMemo — пересчёт только при изменении зависимостей) ---
  const genres = useMemo(() => [...new Set(songs.map((s) => s.genre))].sort((a, b) => a.localeCompare(b, 'ru')), [songs])

  const visibleSongs = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    let result = songs.filter((s) => {
      if (q && !s.title.toLowerCase().includes(q) && !s.artist.toLowerCase().includes(q)) return false
      if (filters.genre && s.genre !== filters.genre) return false
      if (filters.status === 'sung' && !s.sung) return false
      if (filters.status === 'todo' && s.sung) return false
      return true
    })
    const sorter = SORTERS[filters.sort]
    if (sorter) result = [...result].sort(sorter) // копия, чтобы не мутировать состояние
    return result
  }, [songs, filters])

  const stats = useMemo(() => {
    const sung = songs.filter((s) => s.sung).length
    return {
      total: songs.length,
      sung,
      todo: songs.length - sung,
      duration: songs.reduce((sum, s) => sum + (s.duration || 0), 0),
    }
  }, [songs])

  const saveLabel = { idle: '', saving: 'Сохранение…', saved: 'Сохранено ✓' }[saveStatus]

  if (!loaded) {
    return <div className="loading">Загрузка каталога…</div>
  }

  return (
    <>
      <Stats stats={stats} />

      <SongForm key={editingId ?? 'new'} editingSong={editingSong} onSubmit={handleFormSubmit} onCancel={() => setEditingId(null)} />

      <div className="list-head">
        <h2>Каталог песен</h2>
        <span className={`save-status ${saveStatus}`}>{saveLabel}</span>
      </div>

      <Filters filters={filters} genres={genres} onChange={setFilters} />

      {visibleSongs.length === 0 ? (
        <div className="empty-state">
          {songs.length === 0 ? 'Каталог пуст. Добавьте первую песню.' : 'По заданным условиям ничего не найдено.'}
        </div>
      ) : (
        <ul className="song-list">
          {visibleSongs.map((song, i) => (
            <SongItem
              key={song.id}
              song={song}
              index={i}
              onToggle={toggleSung}
              onEdit={setEditingId}
              onDelete={deleteSong}
            />
          ))}
        </ul>
      )}
    </>
  )
}
