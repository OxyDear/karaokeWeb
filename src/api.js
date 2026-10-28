import axios from 'axios'

// ---------------------------------------------------------------------------
// Сервис API: единая точка общения с Express-сервером (ЛР №1–3).
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'karaoke:token'
const USER_KEY = 'karaoke:user'
// Искусственная задержка (мс) для проверки состояний загрузки — см. .env
const DELAY = Number(import.meta.env.VITE_API_DELAY) || 0

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000, // если сервер завис — запрос завершится ошибкой, а не будет висеть вечно
})

// --- Хранение сессии (JWT + данные пользователя) в localStorage -------------
export const getToken = () => localStorage.getItem(TOKEN_KEY)

export function loadSession() {
  try {
    const token = getToken()
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    return token && user ? { token, user } : null
  } catch {
    return null
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// --- Перехватчики -------------------------------------------------------------
// Запрос: имитация задержки + подстановка заголовка Authorization: Bearer <token>
api.interceptors.request.use(async (config) => {
  if (DELAY) await new Promise((resolve) => setTimeout(resolve, DELAY))

  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Ответ: если сервер отклонил токен (истёк/недействителен) — сбрасываем сессию
// и сообщаем приложению. Ошибку 401 при самом входе (нет токена) не трогаем.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearSession()
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  },
)

// --- Человекочитаемое сообщение об ошибке ----------------------------------------
export const isCanceled = (error) => axios.isCancel(error)

export function getErrorMessage(error) {
  if (error.response) {
    const { status, data } = error.response
    // Наш сервер всегда отвечает { error: '...' } — показываем его текст
    if (status >= 500) return `Ошибка сервера (${status}). Попробуйте позже.`
    return data?.error || `Запрос отклонён (${status})`
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'Сервер не ответил вовремя. Попробуйте ещё раз.'
  }
  // Ответа нет вообще: сервер выключен, нет сети, заблокирован CORS
  return 'Сервер недоступен. Проверьте, что он запущен и есть соединение.'
}

// --- Аутентификация ---------------------------------------------------------------
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const register = (email, password) =>
  api.post('/auth/register', { email, password }).then((r) => r.data)

// --- Песни (GET / POST / PUT / DELETE) --------------------------------------------
// signal — AbortSignal: позволяет отменить запрос (при размонтировании или новом поиске)
export const fetchSongs = (params, signal) =>
  api.get('/songs', { params, signal }).then((r) => r.data)

export const fetchGenres = (signal) =>
  api.get('/songs/genres', { signal }).then((r) => r.data)

export const addSong = (song) => api.post('/songs', song).then((r) => r.data)

export const updateSong = (id, song) => api.put(`/songs/${id}`, song).then((r) => r.data)

export const deleteSong = (id) => api.delete(`/songs/${id}`)

export const playSong = (id) => api.post(`/songs/${id}/play`).then((r) => r.data)
