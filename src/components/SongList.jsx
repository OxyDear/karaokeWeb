import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addSong as apiAddSong,
  deleteSong as apiDeleteSong,
  fetchGenres,
  fetchSongs,
  getErrorMessage,
  isCanceled,
  playSong as apiPlaySong,
  updateSong as apiUpdateSong,
} from '../api'
import { useDebounce } from '../hooks/useDebounce'
import Filters from './Filters'
import SongForm from './SongForm'
import SongItem from './SongItem'
import Stats from './Stats'
import Toast from './Toast'

// Сортировка выполняется на клиенте над загруженным списком.
// У оптимистично добавленных песен id вида "tmp-..." — они всегда сверху.
const idOf = (s) => (typeof s.id === 'number' ? s.id : Number.MAX_SAFE_INTEGER)
const SORTERS = {
  added: (a, b) => idOf(b) - idOf(a),
  plays: (a, b) => (b.playsCount ?? 0) - (a.playsCount ?? 0),
  title: (a, b) => a.title.localeCompare(b.title, 'ru'),
  artist: (a, b) => a.artist.localeCompare(b.artist, 'ru'),
  duration: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
}

export default function SongList({ user }) {
  // Данные и состояния асинхронной загрузки
  const [songs, setSongs] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(false) // фоновая загрузка (поиск/повтор)
  const [genres, setGenres] = useState([])
  const [reloadKey, setReloadKey] = useState(0) // меняем, чтобы повторить GET
  const [notice, setNotice] = useState(null)

  const [filters, setFilters] = useState({ query: '', genre: '', sort: 'added' })
  const [editingId, setEditingId] = useState(null)

  const isAdmin = user?.role === 'admin'

  // Актуальный список для откатов в async-обработчиках (в замыкании он мог устареть)
  const songsRef = useRef(songs)
  useEffect(() => {
    songsRef.current = songs
  }, [songs])

  const notify = useCallback((type, text) => setNotice({ type, text }), [])
  const closeNotice = useCallback(() => setNotice(null), [])

  // --- Дополнительное улучшение: серверный поиск + debounce + отмена запроса ---
  // Пока пользователь печатает, запрос не уходит; через 400 мс после последнего
  // символа отправляется GET /songs?search=...
  const debouncedQuery = useDebounce(filters.query, 400)
  const searching = fetching || filters.query !== debouncedQuery

  // --- GET: загрузка списка (при монтировании, смене поиска/жанра, по кнопке «Повторить») ---
  useEffect(() => {
    // AbortController: при размонтировании или новом поиске предыдущий запрос
    // отменяется, и «устаревший» ответ не затрёт свежие данные (гонка запросов).
    const controller = new AbortController()
    const params = {}
    if (debouncedQuery.trim()) params.search = debouncedQuery.trim()
    if (filters.genre) params.genre = filters.genre

    setFetching(true)
    setError('')

    fetchSongs(params, controller.signal)
      .then((data) => {
        setSongs(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (isCanceled(err)) return // отмена — не ошибка
        setError(getErrorMessage(err))
        setStatus('error')
      })
      .finally(() => {
        if (!controller.signal.aborted) setFetching(false)
      })

    return () => controller.abort()
  }, [debouncedQuery, filters.genre, reloadKey])

  // Список жанров для фильтра: при монтировании и после изменений каталога
  const loadGenres = useCallback((signal) => {
    fetchGenres(signal)
      .then(setGenres)
      .catch(() => {}) // не критично: фильтр просто останется со старым списком
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadGenres(controller.signal)
    return () => controller.abort()
  }, [loadGenres])

  // Заголовок вкладки
  useEffect(() => {
    document.title = status === 'ready' ? `Караоке — песен: ${songs.length}` : 'Караоке'
    return () => {
      document.title = 'Онлайн-караоке'
    }
  }, [songs.length, status])

  // --- POST: оптимистичное добавление ---
  const addSong = useCallback(
    async (data) => {
      const tempId = `tmp-${Date.now()}` // временный ID, пока сервер не выдал настоящий
      setSongs((prev) => [{ id: tempId, ...data, playsCount: 0, pending: true }, ...prev]) // 1. сразу показываем
      try {
        const created = await apiAddSong(data) // 2. отправляем на сервер
        setSongs((prev) => prev.map((s) => (s.id === tempId ? created : s))) // 3. временный id -> настоящий
        loadGenres()
        notify('success', `«${created.title}» добавлена`)
      } catch (err) {
        setSongs((prev) => prev.filter((s) => s.id !== tempId)) // 4. ошибка — откат
        notify('error', `Не удалось добавить песню: ${getErrorMessage(err)}`)
      }
    },
    [loadGenres, notify],
  )

  // --- PUT: оптимистичное редактирование ---
  const updateSong = useCallback(
    async (id, data) => {
      const previous = songsRef.current.find((s) => s.id === id)
      if (!previous) return
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...data, pending: true } : s)))
      try {
        const saved = await apiUpdateSong(id, data)
        setSongs((prev) => prev.map((s) => (s.id === id ? saved : s)))
        loadGenres()
        notify('success', `«${saved.title}» сохранена`)
      } catch (err) {
        setSongs((prev) => prev.map((s) => (s.id === id ? previous : s))) // откат к прежней версии
        notify('error', `Не удалось сохранить изменения: ${getErrorMessage(err)}`)
      }
    },
    [loadGenres, notify],
  )

  // --- DELETE: оптимистичное удаление ---
  const deleteSong = useCallback(
    async (id) => {
      const index = songsRef.current.findIndex((s) => s.id === id)
      const removed = songsRef.current[index]
      if (!removed || !window.confirm(`Удалить «${removed.title}»?`)) return

      setSongs((prev) => prev.filter((s) => s.id !== id))
      setEditingId((cur) => (cur === id ? null : cur))
      try {
        await apiDeleteSong(id)
        loadGenres()
        notify('success', `«${removed.title}» удалена`)
      } catch (err) {
        // откат: возвращаем песню на прежнее место
        setSongs((prev) => {
          const next = [...prev]
          next.splice(Math.min(index, next.length), 0, removed)
          return next
        })
        notify('error', `Не удалось удалить песню: ${getErrorMessage(err)}`)
      }
    },
    [loadGenres, notify],
  )

  // --- POST /songs/:id/play: «Спеть» — оптимистично +1 к счётчику ---
  const playSong = useCallback(
    async (id) => {
      const bump = (delta) => (prev) =>
        prev.map((s) => (s.id === id ? { ...s, playsCount: (s.playsCount ?? 0) + delta } : s))
      setSongs(bump(1))
      try {
        await apiPlaySong(id)
      } catch (err) {
        setSongs(bump(-1)) // откат именно +1 (безопасно при нескольких быстрых кликах)
        notify('error', `Не удалось засчитать исполнение: ${getErrorMessage(err)}`)
      }
    },
    [notify],
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

  // --- Производные данные ---
  const visibleSongs = useMemo(() => [...songs].sort(SORTERS[filters.sort]), [songs, filters.sort])

  const stats = useMemo(
    () => ({
      total: songs.length,
      plays: songs.reduce((sum, s) => sum + (s.playsCount || 0), 0),
      artists: new Set(songs.map((s) => s.artist)).size,
      duration: songs.reduce((sum, s) => sum + (s.duration || 0), 0),
    }),
    [songs],
  )

  const hasFilters = filters.query.trim() !== '' || filters.genre !== ''

  // Содержимое списка зависит от состояния загрузки
  let listContent
  if (status === 'loading') {
    listContent = (
      <div className="loading">
        <span className="spinner" aria-hidden="true" />
        <div>Загрузка каталога…</div>
      </div>
    )
  } else if (status === 'error') {
    listContent = (
      <div className="error-state">
        <div>⚠️ {error}</div>
        <button type="button" className="btn-primary" disabled={fetching} onClick={() => setReloadKey((k) => k + 1)}>
          {fetching ? 'Повторяем…' : 'Повторить'}
        </button>
      </div>
    )
  } else if (visibleSongs.length === 0) {
    listContent = (
      <div className="empty-state">
        {hasFilters ? 'По заданным условиям ничего не найдено.' : 'Каталог пуст. Добавьте первую песню.'}
      </div>
    )
  } else {
    listContent = (
      <ul className="song-list">
        {visibleSongs.map((song, i) => (
          <SongItem
            key={song.id}
            song={song}
            index={i}
            canPlay={Boolean(user)}
            isAdmin={isAdmin}
            onPlay={playSong}
            onEdit={setEditingId}
            onDelete={deleteSong}
          />
        ))}
      </ul>
    )
  }

  return (
    <>
      <Stats stats={stats} />

      {user ? (
        // Добавлять песни может любой вошедший, редактировать — только admin (проверяет и сервер)
        <SongForm
          key={editingId ?? 'new'}
          editingSong={editingSong}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <div className="empty-state">Войдите, чтобы добавлять песни и петь. Каталог доступен для просмотра всем.</div>
      )}

      <div className="list-head">
        <h2>Каталог песен</h2>
        {fetching && status === 'ready' && <span className="save-status">Обновление…</span>}
      </div>

      <Filters filters={filters} genres={genres} searching={searching && status === 'ready'} onChange={setFilters} />

      {listContent}

      <Toast notice={notice} onClose={closeNotice} />
    </>
  )
}
